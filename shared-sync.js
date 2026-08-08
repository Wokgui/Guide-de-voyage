(function(){
  "use strict";

  const SUPABASE_URL="https://oxdrhwveuctrorrkuurw.supabase.co";
  const SUPABASE_KEY="sb_publishable_o75FsFwywIFQOCyMYNYD8A_k034qpQv";
  const TABLE="copenhagen_shared_state";
  const SNAPSHOT_TABLE="copenhagen_shared_snapshots";
  const TRIP_ID="e110549f-c366-4116-ba14-aedbfbb1946c";
  const DEVICE_KEY="cph-shared-device-v1";
  const QUEUE_KEY="cph-shared-queue-v1";
  const CLOCK_KEY="cph-shared-clock-v1";
  const CLOCK_SEQUENCE_KEY="cph-shared-clock-sequence-v1";
  const LAST_CLOUD_SAVE_KEY="cph-shared-last-cloud-save-v1";
  const SHARED_KEYS=[
    "items","starts","forced","reservations","manualAside","departures",
    "timeOverrides","durationOverrides","openingOverrides","order",
    "customOrderDays","dayOverrides","customPoints","deletedIds",
    "globalNotes","stayInfo"
  ];
  const OBJECT_KEYS=new Set([
    "items","starts","forced","reservations","manualAside","departures",
    "timeOverrides","durationOverrides","openingOverrides","order",
    "customOrderDays","dayOverrides","stayInfo"
  ]);
  const ARRAY_KEYS=new Set(["customPoints","deletedIds"]);
  const FORBIDDEN_SEGMENTS=new Set(["__proto__","prototype","constructor"]);

  const statusBox=document.getElementById("sharedSyncStatus");
  const statusText=document.getElementById("sharedSyncStatusText");
  const saveIndicator=document.getElementById("saveIndicator");
  const saveIndicatorLabel=document.getElementById("saveIndicatorLabel");
  const saveIndicatorTime=document.getElementById("saveIndicatorTime");
  const backupSettingsButton=document.getElementById("backupSettingsButton");
  const backupSettings=document.getElementById("backupSettings");
  const backupSettingsClose=document.getElementById("backupSettingsClose");
  const backupNowButton=document.getElementById("backupNowButton");
  const backupSettingsMessage=document.getElementById("backupSettingsMessage");
  const backupSnapshotsList=document.getElementById("backupSnapshotsList");
  const backupRestoreForm=document.getElementById("backupRestoreForm");
  const backupRestoreText=document.getElementById("backupRestoreText");
  const backupAdminCode=document.getElementById("backupAdminCode");
  const backupRestoreCancel=document.getElementById("backupRestoreCancel");
  const backupRestoreConfirm=document.getElementById("backupRestoreConfirm");
  const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const isPlainObject=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
  const encodeSegment=value=>String(value).replace(/~/g,"~0").replace(/\//g,"~1");
  const decodeSegment=value=>String(value).replace(/~1/g,"/").replace(/~0/g,"~");
  const comparable=value=>JSON.stringify(value);
  const timestampValue=value=>{
    const parsed=Date.parse(String(value||""));
    return Number.isFinite(parsed)?parsed:0;
  };
  const normalizedTimestamp=value=>{
    const parsed=timestampValue(value);
    return parsed?new Date(parsed).toISOString():"";
  };

  function setStatus(kind,message){
    if(!statusBox||!statusText)return;
    statusBox.className=`shared-sync-status is-${kind}`;
    statusText.textContent=message;
  }

  function localTimeLabel(value){
    const date=value instanceof Date?value:new Date(value||Date.now());
    if(!Number.isFinite(date.getTime()))return "—";
    return `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
  }

  function setTopSaveStatus(kind,value){
    if(!saveIndicator||!saveIndicatorLabel||!saveIndicatorTime)return;
    saveIndicator.classList.remove("is-saving","is-saved","is-offline","is-error");
    saveIndicator.classList.add(`is-${kind}`);
    if(kind==="saving"){
      saveIndicatorLabel.textContent="Enregistrement…";
      saveIndicatorTime.textContent="en cours";
    }else if(kind==="offline"){
      saveIndicatorLabel.textContent="Hors ligne";
      saveIndicatorTime.textContent="en attente";
    }else if(kind==="error"){
      saveIndicatorLabel.textContent="Non sauvegardé";
      saveIndicatorTime.textContent="nouvel essai";
    }else{
      saveIndicatorLabel.textContent="Sauvegardé";
      saveIndicatorTime.textContent=localTimeLabel(value);
    }
  }

  function safeJson(storageKey,fallback){
    try{
      const value=JSON.parse(localStorage.getItem(storageKey)||"");
      return value&&typeof value==="object"?value:fallback;
    }catch(_){
      return fallback;
    }
  }

  function createDeviceId(){
    let value=localStorage.getItem(DEVICE_KEY)||"";
    if(!/^[0-9a-f-]{36}$/i.test(value)){
      if(window.crypto&&typeof window.crypto.randomUUID==="function")value=window.crypto.randomUUID();
      else value=`00000000-0000-4000-8000-${String(Date.now()).padStart(12,"0").slice(-12)}`;
      localStorage.setItem(DEVICE_KEY,value);
    }
    return value;
  }

  const deviceId=createDeviceId();
  let queue=safeJson(QUEUE_KEY,{});
  let pathClock=safeJson(CLOCK_KEY,{});
  let lastClientMs=Math.max(Number(localStorage.getItem(CLOCK_SEQUENCE_KEY))||0,0);
  let applyingRemote=false;
  let flushInFlight=false;
  let flushTimer=null;
  let retryTimer=null;
  let retryDelay=2500;
  let renderTimer=null;
  let pollInFlight=false;
  let channel=null;
  let realtimeReady=false;
  let remoteInitialized=false;
  let initializationRetryTimer=null;
  let realtimeRefreshTimer=null;
  let lastCloudSavedAt=localStorage.getItem(LAST_CLOUD_SAVE_KEY)||"";
  let snapshotTimer=null;
  let snapshotInFlight=false;
  let snapshotList=[];
  let pendingRestoreSnapshot=null;

  if(lastCloudSavedAt)setTopSaveStatus("saved",lastCloudSavedAt);

  function markCloudSaved(value){
    const normalized=normalizedTimestamp(value)||new Date().toISOString();
    lastCloudSavedAt=normalized;
    localStorage.setItem(LAST_CLOUD_SAVE_KEY,normalized);
    setTopSaveStatus("saved",normalized);
  }

  function latestUpdatedAt(rows){
    return (Array.isArray(rows)?rows:[]).reduce((latest,row)=>{
      const value=normalizedTimestamp(row&&row.updated_at);
      return timestampValue(value)>timestampValue(latest)?value:latest;
    },"");
  }

  function nextTimestamp(){
    lastClientMs=Math.max(Date.now(),lastClientMs+1);
    localStorage.setItem(CLOCK_SEQUENCE_KEY,String(lastClientMs));
    return new Date(lastClientMs).toISOString();
  }

  function defaultForKey(key){
    if(ARRAY_KEYS.has(key))return [];
    if(key==="globalNotes")return "";
    return {};
  }

  function normalizeSharedState(){
    SHARED_KEYS.forEach(key=>{
      if(OBJECT_KEYS.has(key)&&!isPlainObject(state[key]))state[key]={};
      else if(ARRAY_KEYS.has(key)&&!Array.isArray(state[key]))state[key]=[];
      else if(key==="globalNotes"&&typeof state[key]!=="string")state[key]="";
    });
  }

  function sharedProjection(source){
    const result={};
    SHARED_KEYS.forEach(key=>{
      const value=source&&Object.prototype.hasOwnProperty.call(source,key)
        ?source[key]
        :defaultForKey(key);
      result[key]=clone(value);
    });
    return result;
  }

  function flatten(value,path="",output={}){
    if(isPlainObject(value)&&Object.keys(value).length){
      Object.keys(value).sort().forEach(key=>{
        flatten(value[key],`${path}/${encodeSegment(key)}`,output);
      });
    }else{
      output[path||"/"]=clone(value);
    }
    return output;
  }

  function diffShared(previous,next){
    const before=flatten(previous);
    const after=flatten(next);
    const paths=new Set([...Object.keys(before),...Object.keys(after)]);
    const changes=[];
    paths.forEach(path=>{
      const had=Object.prototype.hasOwnProperty.call(before,path);
      const has=Object.prototype.hasOwnProperty.call(after,path);
      if(had===has&&comparable(before[path])===comparable(after[path]))return;
      changes.push({path,value:has?after[path]:null,is_deleted:!has});
    });
    return changes;
  }

  function persistQueue(){
    localStorage.setItem(QUEUE_KEY,JSON.stringify(queue));
  }

  function persistClock(){
    localStorage.setItem(CLOCK_KEY,JSON.stringify(pathClock));
  }

  function makeRow(change,timestamp){
    return {
      trip_id:TRIP_ID,
      path:change.path,
      value:change.is_deleted?null:clone(change.value),
      is_deleted:!!change.is_deleted,
      device_id:deviceId,
      client_updated_at:timestamp
    };
  }

  function enqueueChanges(changes){
    if(!changes.length)return;
    const timestamp=nextTimestamp();
    changes.forEach(change=>{
      const row=makeRow(change,timestamp);
      queue[row.path]=row;
      pathClock[row.path]=timestamp;
    });
    persistQueue();
    persistClock();
    scheduleFlush(450);
  }

  function enqueueSnapshot(snapshot){
    const timestamp=nextTimestamp();
    const flat=flatten(snapshot);
    Object.entries(flat).forEach(([path,value])=>{
      const row=makeRow({path,value,is_deleted:false},timestamp);
      queue[path]=row;
      pathClock[path]=timestamp;
    });
    persistQueue();
    persistClock();
  }

  let lastObserved=sharedProjection(state);
  const originalSaveState=saveState;
  saveState=function(){
    const result=originalSaveState.apply(this,arguments);
    if(!applyingRemote){
      normalizeSharedState();
      const next=sharedProjection(state);
      const changes=diffShared(lastObserved,next);
      enqueueChanges(changes);
      if(changes.length)setTopSaveStatus(navigator.onLine?"saving":"offline");
      lastObserved=next;
    }
    return result;
  };

  function pathSegments(path){
    if(typeof path!=="string"||path==="/"||path[0]!=="/")return null;
    const segments=path.slice(1).split("/").map(decodeSegment);
    if(!segments.length||!SHARED_KEYS.includes(segments[0]))return null;
    if(segments.some(segment=>FORBIDDEN_SEGMENTS.has(segment)))return null;
    return segments;
  }

  function setAtPath(path,value){
    const segments=pathSegments(path);
    if(!segments)return false;
    if(segments.length===1){
      state[segments[0]]=clone(value);
      return true;
    }
    let target=state;
    for(let index=0;index<segments.length-1;index++){
      const segment=segments[index];
      if(!isPlainObject(target[segment]))target[segment]={};
      target=target[segment];
    }
    target[segments[segments.length-1]]=clone(value);
    return true;
  }

  function deleteAtPath(path){
    const segments=pathSegments(path);
    if(!segments)return false;
    if(segments.length===1){
      state[segments[0]]=defaultForKey(segments[0]);
      return true;
    }
    let target=state;
    for(let index=0;index<segments.length-1;index++){
      target=target&&target[segments[index]];
      if(!isPlainObject(target))return false;
    }
    delete target[segments[segments.length-1]];
    return true;
  }

  function applyRemoteRow(row,force=false){
    if(!row||row.trip_id!==TRIP_ID||typeof row.path!=="string")return false;
    const incoming=String(row.client_updated_at||row.updated_at||"");
    const pending=queue[row.path];
    if(pending&&timestampValue(pending.client_updated_at)>timestampValue(incoming))return false;
    const known=String(pathClock[row.path]||"");
    if(!force&&known&&timestampValue(known)>timestampValue(incoming))return false;
    if(!force&&row.device_id===deviceId)return false;
    const changed=row.is_deleted?deleteAtPath(row.path):setAtPath(row.path,row.value);
    if(changed&&incoming){
      const normalizedIncoming=normalizedTimestamp(incoming);
      pathClock[row.path]=force
        ?normalizedIncoming
        :(timestampValue(incoming)>timestampValue(known)?normalizedIncoming:known);
      persistClock();
    }
    return changed;
  }

  function reconcileCustomPoints(){
    if(!Array.isArray(state.customPoints))state.customPoints=[];
    const wanted=new Map(state.customPoints.filter(point=>point&&point.id).map(point=>[point.id,point]));
    for(let index=DATA.length-1;index>=0;index--){
      const point=DATA[index];
      if(point&&point.custom&&!wanted.has(point.id))DATA.splice(index,1);
    }
    wanted.forEach((point,id)=>{
      const existing=DATA.find(candidate=>candidate.id===id);
      if(existing)Object.assign(existing,clone(point));
      else DATA.push(clone(point));
    });
  }

  function refreshFormValues(){
    if(globalNotes&&document.activeElement!==globalNotes)globalNotes.value=state.globalNotes||"";
    if(typeof STAY_FIELDS!=="undefined"){
      STAY_FIELDS.forEach(id=>{
        const element=document.getElementById(id);
        if(!element||document.activeElement===element)return;
        if(Object.prototype.hasOwnProperty.call(state.stayInfo||{},id))element.value=state.stayInfo[id];
      });
    }
    if(typeof applyStayInfoToGuide==="function")applyStayInfoToGuide();
    if(typeof updateStayAddressActions==="function")updateStayAddressActions();
  }

  function renderRemoteChanges(){
    clearTimeout(renderTimer);
    renderTimer=setTimeout(()=>{
      applyingRemote=true;
      try{
        normalizeSharedState();
        reconcileCustomPoints();
        localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
        lastObserved=sharedProjection(state);
        refreshFormValues();
        if(typeof actionHistory!=="undefined"){
          actionHistory.undo.length=0;
          actionHistory.redo.length=0;
          if(typeof updateHistoryButtons==="function")updateHistoryButtons();
        }
        if(typeof renderDayButtons==="function")renderDayButtons();
        if(typeof renderAll==="function")renderAll();
      }finally{
        applyingRemote=false;
      }
    },60);
  }

  if(!window.supabase||typeof window.supabase.createClient!=="function"){
    setStatus("error","Synchronisation indisponible");
    return;
  }

  const sharedClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
    realtime:{params:{eventsPerSecond:10}}
  });
  const backupsAvailable=typeof sharedClient.rpc==="function";

  function setBackupMessage(message,kind=""){
    if(!backupSettingsMessage)return;
    backupSettingsMessage.className=`backup-message${kind?` is-${kind}`:""}`;
    backupSettingsMessage.textContent=message||"";
  }

  function backupDateLabel(value){
    const date=new Date(value);
    if(!Number.isFinite(date.getTime()))return "Date inconnue";
    try{
      return new Intl.DateTimeFormat("fr-FR",{
        weekday:"short",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"
      }).format(date).replace(",", " —");
    }catch(_){
      return date.toLocaleString("fr-FR");
    }
  }

  function backupReasonLabel(snapshot){
    if(snapshot&&snapshot.label)return snapshot.label;
    const labels={
      auto:"Sauvegarde automatique",
      manual:"Sauvegarde manuelle",
      initial:"État initial v309",
      pre_restore:"État avant restauration"
    };
    return labels[snapshot&&snapshot.reason]||"Sauvegarde";
  }

  function closeRestoreConfirmation(){
    pendingRestoreSnapshot=null;
    if(backupRestoreForm)backupRestoreForm.hidden=true;
    if(backupAdminCode)backupAdminCode.value="";
  }

  function openRestoreConfirmation(snapshot){
    pendingRestoreSnapshot=snapshot;
    if(backupRestoreText){
      backupRestoreText.textContent=`Restaurer la sauvegarde du ${backupDateLabel(snapshot.created_at)} ? L’état actuel sera d’abord sauvegardé automatiquement.`;
    }
    if(backupRestoreForm)backupRestoreForm.hidden=false;
    if(backupAdminCode){
      backupAdminCode.value="";
      setTimeout(()=>backupAdminCode.focus(),0);
    }
  }

  function snapshotStateFromEntries(entries){
    const restored={};
    (Array.isArray(entries)?entries:[])
      .filter(entry=>entry&&typeof entry.path==="string"&&!entry.is_deleted)
      .sort((left,right)=>left.path.split("/").length-right.path.split("/").length||left.path.localeCompare(right.path))
      .forEach(entry=>{
        const segments=pathSegments(entry.path);
        if(!segments)return;
        let target=restored;
        for(let index=0;index<segments.length-1;index++){
          const segment=segments[index];
          if(!isPlainObject(target[segment]))target[segment]={};
          target=target[segment];
        }
        target[segments[segments.length-1]]=clone(entry.value);
      });
    SHARED_KEYS.forEach(key=>{
      if(!Object.prototype.hasOwnProperty.call(restored,key))restored[key]=defaultForKey(key);
    });
    return restored;
  }

  async function downloadSnapshot(snapshot){
    if(!snapshot||!navigator.onLine){
      setBackupMessage("Le téléchargement nécessite une connexion Internet.","error");
      return;
    }
    setBackupMessage("Préparation du fichier…");
    try{
      const {data,error}=await sharedClient
        .from(SNAPSHOT_TABLE)
        .select("id,created_at,reason,label,entries")
        .eq("trip_id",TRIP_ID)
        .eq("id",snapshot.id)
        .single();
      if(error)throw error;
      const restoredState=snapshotStateFromEntries(data&&data.entries);
      const payload={
        exportedAt:new Date().toISOString(),
        snapshotId:data.id,
        snapshotCreatedAt:data.created_at,
        state:restoredState
      };
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
      const anchor=document.createElement("a");
      const stamp=new Date(data.created_at).toISOString().replace(/[:]/g,"-").replace(/\.\d{3}Z$/,"Z");
      anchor.href=URL.createObjectURL(blob);
      anchor.download=`sauvegarde-copenhague-${stamp}.json`;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
      setBackupMessage("Sauvegarde téléchargée.","success");
    }catch(error){
      console.warn("Téléchargement de sauvegarde impossible",error&&error.message?error.message:error);
      setBackupMessage("Impossible de télécharger cette sauvegarde.","error");
    }
  }

  function renderSnapshotList(){
    if(!backupSnapshotsList)return;
    backupSnapshotsList.replaceChildren();
    if(!snapshotList.length){
      const empty=document.createElement("div");
      empty.className="backup-empty";
      empty.textContent="Aucune sauvegarde disponible.";
      backupSnapshotsList.appendChild(empty);
      return;
    }
    const fragment=document.createDocumentFragment();
    snapshotList.forEach((snapshot,index)=>{
      const entry=document.createElement("article");
      entry.className="backup-entry";
      const copy=document.createElement("div");
      const title=document.createElement("div");
      title.className="backup-entry-title";
      title.textContent=`${index===0?"Dernière — ":""}${backupDateLabel(snapshot.created_at)}`;
      const meta=document.createElement("div");
      meta.className="backup-entry-meta";
      meta.textContent=`${backupReasonLabel(snapshot)} · ${Number(snapshot.entry_count)||0} éléments`;
      copy.append(title,meta);

      const actions=document.createElement("div");
      actions.className="backup-entry-actions";
      const download=document.createElement("button");
      download.type="button";
      download.className="secondary";
      download.textContent="Télécharger";
      download.addEventListener("click",()=>void downloadSnapshot(snapshot));
      const restore=document.createElement("button");
      restore.type="button";
      restore.className="danger";
      restore.textContent="Restaurer";
      restore.addEventListener("click",()=>openRestoreConfirmation(snapshot));
      actions.append(download,restore);
      entry.append(copy,actions);
      fragment.appendChild(entry);
    });
    backupSnapshotsList.appendChild(fragment);
  }

  async function loadSnapshots(){
    if(!backupsAvailable){
      setBackupMessage("Les sauvegardes sont momentanément indisponibles.","error");
      return [];
    }
    if(!navigator.onLine){
      setBackupMessage("Hors ligne : la liste ne peut pas être actualisée.","error");
      return snapshotList;
    }
    if(backupSnapshotsList&&!snapshotList.length){
      backupSnapshotsList.innerHTML='<div class="backup-empty">Chargement des sauvegardes…</div>';
    }
    try{
      const {data,error}=await sharedClient
        .from(SNAPSHOT_TABLE)
        .select("id,created_at,created_by,reason,label,state_hash,entry_count")
        .eq("trip_id",TRIP_ID)
        .order("created_at",{ascending:false})
        .limit(10);
      if(error)throw error;
      snapshotList=Array.isArray(data)?data:[];
      renderSnapshotList();
      setBackupMessage(snapshotList.length?`${snapshotList.length} sauvegarde${snapshotList.length>1?"s":""} disponible${snapshotList.length>1?"s":""}.`:"Aucune sauvegarde disponible.");
      return snapshotList;
    }catch(error){
      console.warn("Liste des sauvegardes indisponible",error&&error.message?error.message:error);
      setBackupMessage("Impossible de charger les sauvegardes.","error");
      return snapshotList;
    }
  }

  function openBackupSettings(){
    if(!backupSettings)return;
    backupSettings.hidden=false;
    document.body.classList.add("backup-settings-open");
    closeRestoreConfirmation();
    setBackupMessage("Chargement…");
    void loadSnapshots();
    setTimeout(()=>backupSettingsClose&&backupSettingsClose.focus(),0);
  }

  function closeBackupSettings(){
    if(!backupSettings)return;
    backupSettings.hidden=true;
    document.body.classList.remove("backup-settings-open");
    closeRestoreConfirmation();
    if(backupSettingsButton)backupSettingsButton.focus();
  }

  function normalizeRpcResult(value){
    if(value&&typeof value==="object")return value;
    if(typeof value==="string"){
      try{return JSON.parse(value);}catch(_){return null;}
    }
    return null;
  }

  async function waitUntilFlushed(timeout=12000){
    const started=Date.now();
    while(queueSize()||flushInFlight){
      if(!navigator.onLine)return false;
      if(!flushInFlight)await flushQueue();
      if(!queueSize()&&!flushInFlight)return true;
      if(Date.now()-started>timeout)return false;
      await new Promise(resolve=>setTimeout(resolve,120));
    }
    return true;
  }

  async function createSnapshot(reason="auto",label=null){
    if(!backupsAvailable||snapshotInFlight||!navigator.onLine)return null;
    snapshotInFlight=true;
    try{
      const {data,error}=await sharedClient.rpc("copenhagen_create_snapshot",{
        p_trip_id:TRIP_ID,
        p_device_id:deviceId,
        p_reason:reason,
        p_label:label
      });
      if(error)throw error;
      const result=normalizeRpcResult(data);
      if(!result||result.ok!==true)throw new Error(result&&result.error?result.error:"snapshot_failed");
      if(result.throttled)scheduleAutomaticSnapshot(16000);
      if(backupSettings&&!backupSettings.hidden)await loadSnapshots();
      return result;
    }finally{
      snapshotInFlight=false;
    }
  }

  function scheduleAutomaticSnapshot(delay=5000){
    if(!backupsAvailable)return;
    clearTimeout(snapshotTimer);
    snapshotTimer=setTimeout(()=>{
      if(navigator.onLine&&!queueSize()&&!flushInFlight){
        void createSnapshot("auto").catch(error=>{
          console.warn("Sauvegarde automatique différée",error&&error.message?error.message:error);
        });
      }
    },delay);
  }

  function restoreErrorMessage(code){
    if(code==="invalid")return "Code administrateur incorrect.";
    if(code==="locked")return "Trop de tentatives : restauration verrouillée pendant 10 minutes.";
    if(code==="unavailable")return "Le code administrateur n’est pas configuré.";
    if(code==="snapshot_not_found")return "Cette sauvegarde n’existe plus.";
    if(code==="invalid_snapshot")return "Cette sauvegarde est invalide.";
    return "La restauration n’a pas abouti.";
  }

  async function restoreSnapshot(snapshot,adminCode){
    if(!backupsAvailable||!navigator.onLine)throw new Error("offline");
    const flushed=await waitUntilFlushed();
    if(!flushed)throw new Error("pending_changes");
    const {data,error}=await sharedClient.rpc("copenhagen_restore_snapshot",{
      p_trip_id:TRIP_ID,
      p_snapshot_id:snapshot.id,
      p_admin_code:adminCode,
      p_device_id:deviceId
    });
    if(error)throw error;
    const result=normalizeRpcResult(data);
    if(!result||result.ok!==true){
      const failure=new Error(result&&result.error?result.error:"restore_failed");
      failure.restoreCode=result&&result.error;
      throw failure;
    }
    const rows=await fetchRemote(true);
    applyRemoteRows(rows,true);
    markCloudSaved(result.restored_at||latestUpdatedAt(rows));
    await loadSnapshots();
    return result;
  }

  if(backupSettingsButton)backupSettingsButton.addEventListener("click",openBackupSettings);
  if(backupSettingsClose)backupSettingsClose.addEventListener("click",closeBackupSettings);
  if(backupSettings)backupSettings.addEventListener("click",event=>{
    if(event.target===backupSettings)closeBackupSettings();
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&backupSettings&&!backupSettings.hidden)closeBackupSettings();
  });
  if(backupRestoreCancel)backupRestoreCancel.addEventListener("click",closeRestoreConfirmation);
  if(backupNowButton)backupNowButton.addEventListener("click",async()=>{
    backupNowButton.disabled=true;
    setBackupMessage("Sauvegarde en cours…");
    try{
      if(!navigator.onLine)throw new Error("offline");
      const flushed=await waitUntilFlushed();
      if(!flushed)throw new Error("pending_changes");
      const result=await createSnapshot("manual","Sauvegarde manuelle");
      if(!result)throw new Error("snapshot_failed");
      setBackupMessage(result.created?"Nouvelle sauvegarde créée.":"L’état était déjà sauvegardé.","success");
    }catch(error){
      console.warn("Sauvegarde manuelle impossible",error&&error.message?error.message:error);
      setBackupMessage(error&&error.message==="offline"?"Hors ligne : sauvegarde impossible.":"Impossible de créer la sauvegarde.","error");
    }finally{
      backupNowButton.disabled=false;
    }
  });
  if(backupRestoreForm)backupRestoreForm.addEventListener("submit",async event=>{
    event.preventDefault();
    if(!pendingRestoreSnapshot||!backupAdminCode)return;
    const code=backupAdminCode.value.trim().toUpperCase();
    if(code.length<8){
      setBackupMessage("Saisissez le code administrateur complet.","error");
      backupAdminCode.focus();
      return;
    }
    if(backupRestoreConfirm)backupRestoreConfirm.disabled=true;
    if(backupRestoreCancel)backupRestoreCancel.disabled=true;
    setBackupMessage("Restauration et sauvegarde de sécurité en cours…");
    try{
      await restoreSnapshot(pendingRestoreSnapshot,code);
      closeRestoreConfirmation();
      setBackupMessage("Sauvegarde restaurée sur les deux téléphones.","success");
    }catch(error){
      console.warn("Restauration impossible",error&&error.message?error.message:error);
      const codeValue=error&&error.restoreCode?error.restoreCode:error&&error.message;
      setBackupMessage(codeValue==="offline"?"Hors ligne : restauration impossible.":restoreErrorMessage(codeValue),"error");
      if(backupAdminCode){backupAdminCode.select();backupAdminCode.focus();}
    }finally{
      if(backupRestoreConfirm)backupRestoreConfirm.disabled=false;
      if(backupRestoreCancel)backupRestoreCancel.disabled=false;
    }
  });

  function queueSize(){
    return Object.keys(queue).length;
  }

  function updateReadyStatus(){
    if(queueSize()){
      setStatus(navigator.onLine?"sending":"offline",navigator.onLine
        ?"Synchronisation en cours…"
        :"Hors ligne — changements en attente");
      setTopSaveStatus(navigator.onLine?"saving":"offline");
    }else if(navigator.onLine){
      setStatus("active",realtimeReady?"Synchronisation partagée active":"Synchronisation automatique active");
      if(lastCloudSavedAt)setTopSaveStatus("saved",lastCloudSavedAt);
    }else{
      setStatus("offline","Hors ligne — synchronisation en pause");
      setTopSaveStatus("offline");
    }
  }

  function scheduleFlush(delay=700){
    clearTimeout(flushTimer);
    flushTimer=setTimeout(()=>void flushQueue(),delay);
    updateReadyStatus();
  }

  function scheduleRetry(){
    clearTimeout(retryTimer);
    retryTimer=setTimeout(()=>void flushQueue(),retryDelay);
    retryDelay=Math.min(retryDelay*2,30000);
  }

  async function flushQueue(){
    if(flushInFlight||!queueSize()){
      updateReadyStatus();
      return;
    }
    if(!navigator.onLine){
      updateReadyStatus();
      return;
    }
    flushInFlight=true;
    setStatus("sending","Synchronisation en cours…");
    setTopSaveStatus("saving");
    const rows=Object.values(queue).slice(0,200);
    try{
      const {data,error}=await sharedClient
        .from(TABLE)
        .upsert(rows,{onConflict:"trip_id,path"})
        .select("trip_id,path,value,is_deleted,device_id,client_updated_at,updated_at");
      if(error)throw error;
      rows.forEach(row=>{
        if(queue[row.path]&&timestampValue(queue[row.path].client_updated_at)===timestampValue(row.client_updated_at))delete queue[row.path];
      });
      persistQueue();
      if(Array.isArray(data)){
        let changed=false;
        data.forEach(row=>{if(row.device_id!==deviceId&&applyRemoteRow(row,true))changed=true;});
        if(changed)renderRemoteChanges();
      }
      markCloudSaved(latestUpdatedAt(data));
      retryDelay=2500;
      if(queueSize())scheduleFlush(60);
      else{
        updateReadyStatus();
        scheduleAutomaticSnapshot();
      }
    }catch(error){
      console.warn("Synchronisation différée",error&&error.message?error.message:error);
      setStatus("error","Connexion interrompue — nouvelle tentative automatique");
      setTopSaveStatus(navigator.onLine?"error":"offline");
      scheduleRetry();
    }finally{
      flushInFlight=false;
    }
  }

  async function fetchRemote(force=true){
    if(pollInFlight||!navigator.onLine)return [];
    pollInFlight=true;
    try{
      const {data,error}=await sharedClient
        .from(TABLE)
        .select("trip_id,path,value,is_deleted,device_id,client_updated_at,updated_at")
        .eq("trip_id",TRIP_ID)
        .order("path",{ascending:true});
      if(error)throw error;
      return Array.isArray(data)?data:[];
    }finally{
      pollInFlight=false;
    }
  }

  function applyRemoteRows(rows,force=true){
    let changed=false;
    rows
      .slice()
      .sort((left,right)=>left.path.split("/").length-right.path.split("/").length||left.path.localeCompare(right.path))
      .forEach(row=>{if(applyRemoteRow(row,force))changed=true;});
    if(changed)renderRemoteChanges();
    return changed;
  }

  function scheduleRealtimeRefresh(){
    clearTimeout(realtimeRefreshTimer);
    realtimeRefreshTimer=setTimeout(()=>void pollRemote(),120);
  }

  function subscribeRealtime(){
    return new Promise(resolve=>{
      let settled=false;
      const finish=()=>{if(!settled){settled=true;resolve();}};
      if(channel)void sharedClient.removeChannel(channel);
      channel=sharedClient
        .channel(`copenhagen-trip-${TRIP_ID}`)
        .on("postgres_changes",{
          event:"*",
          schema:"public",
          table:TABLE,
          filter:`trip_id=eq.${TRIP_ID}`
        },payload=>{
          const row=payload&&payload.new;
          if(row&&row.device_id!==deviceId)scheduleRealtimeRefresh();
          updateReadyStatus();
        })
        .subscribe(status=>{
          if(status==="SUBSCRIBED"){
            realtimeReady=true;
            updateReadyStatus();
            finish();
          }else if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"){
            realtimeReady=false;
            updateReadyStatus();
            finish();
          }else if(status==="CLOSED"){
            realtimeReady=false;
            updateReadyStatus();
          }
        });
      setTimeout(finish,4500);
    });
  }

  async function pollRemote(){
    if(!navigator.onLine)return;
    if(pollInFlight){
      scheduleRealtimeRefresh();
      return;
    }
    try{
      const rows=await fetchRemote(false);
      if(rows.length){
        remoteInitialized=true;
        applyRemoteRows(rows,false);
        if(!queueSize())markCloudSaved(latestUpdatedAt(rows));
      }else if(!remoteInitialized){
        remoteInitialized=true;
        enqueueSnapshot(sharedProjection(state));
        await flushQueue();
      }
      updateReadyStatus();
    }catch(error){
      console.warn("Actualisation partagée différée",error&&error.message?error.message:error);
    }
  }

  async function initialize(){
    setStatus("connecting","Connexion de la synchronisation…");
    try{
      await subscribeRealtime();
      const rows=await fetchRemote(true);
      if(rows.length){
        remoteInitialized=true;
        applyRemoteRows(rows,true);
        if(!queueSize())markCloudSaved(latestUpdatedAt(rows));
      }else{
        remoteInitialized=true;
        enqueueSnapshot(sharedProjection(state));
      }
      await flushQueue();
      updateReadyStatus();
    }catch(error){
      console.warn("Initialisation de la synchronisation différée",error&&error.message?error.message:error);
      setStatus("error","Connexion interrompue — nouvelle tentative automatique");
      setTopSaveStatus(navigator.onLine?"error":"offline");
      clearTimeout(initializationRetryTimer);
      initializationRetryTimer=setTimeout(()=>void initialize(),Math.min(retryDelay,30000));
      retryDelay=Math.min(retryDelay*2,30000);
    }
  }

  window.addEventListener("online",()=>{
    updateReadyStatus();
    void flushQueue();
    void pollRemote();
  });
  window.addEventListener("offline",updateReadyStatus);
  document.addEventListener("visibilitychange",()=>{
    if(document.visibilityState==="visible"){
      void flushQueue();
      void pollRemote();
    }
  });
  setInterval(()=>void pollRemote(),20000);

  window.copenhagenSharedSync={
    flush:flushQueue,
    refresh:pollRemote,
    pending:queueSize,
    deviceId,
    tripId:TRIP_ID,
    client:sharedClient,
    backups:{
      list:loadSnapshots,
      create:createSnapshot,
      restore:restoreSnapshot,
      open:openBackupSettings
    }
  };

  void initialize();
})();
