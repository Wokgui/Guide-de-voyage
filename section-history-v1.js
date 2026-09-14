(()=>{
  const clone=value=>JSON.parse(JSON.stringify(value));
  const PACKING_KEY='guide_packing_list_v1';
  const stayHistory={undo:[],redo:[],focusSnapshot:null,recorded:false,restoring:false,max:40};
  const notesHistory={undo:[],redo:[],focusSnapshot:null,recorded:false,restoring:false,max:40};

  function push(stack,value,max){
    const serialized=JSON.stringify(value);
    if(JSON.stringify(stack[stack.length-1])===serialized)return;
    stack.push(clone(value));
    if(stack.length>max)stack.shift();
  }

  function updateButtons(){
    const pairs=[
      ['stayUndoBtn',stayHistory.undo.length],['stayRedoBtn',stayHistory.redo.length],
      ['notesUndoBtn',notesHistory.undo.length],['notesRedoBtn',notesHistory.redo.length]
    ];
    pairs.forEach(([id,count])=>{const button=document.getElementById(id);if(button)button.disabled=!count});
  }

  function currentStaySnapshot(){
    const stayInfo={};
    STAY_FIELDS.forEach(id=>{const field=document.getElementById(id);if(field)stayInfo[id]=field.value});
    let packing=null;
    try{packing=JSON.parse(localStorage.getItem(PACKING_KEY)||'null')}catch{}
    return {stayInfo,packing};
  }

  function syncStayFields(){
    STAY_FIELDS.forEach(id=>{
      const field=document.getElementById(id);
      if(field)field.value=Object.prototype.hasOwnProperty.call(state.stayInfo||{},id)?state.stayInfo[id]:'';
    });
    applyStayInfoToGuide();
    updateStayAddressActions();
    renderAll();
  }

  function restoreStay(snapshot,destination){
    stayHistory.restoring=true;
    push(destination,currentStaySnapshot(),stayHistory.max);
    const structured=snapshot&&snapshot.stayInfo?clone(snapshot):{stayInfo:clone(snapshot||{}),packing:null};
    state.stayInfo=structured.stayInfo;
    if(Array.isArray(structured.packing)){
      localStorage.setItem(PACKING_KEY,JSON.stringify(structured.packing));
      window.dispatchEvent(new CustomEvent('guide-packing-restore',{detail:{items:structured.packing}}));
    }
    saveState();
    syncStayFields();
    stayHistory.restoring=false;
    updateButtons();
  }

  function restoreNotes(value,destination){
    notesHistory.restoring=true;
    push(destination,state.globalNotes||'',notesHistory.max);
    state.globalNotes=String(value||'');
    const field=document.getElementById('globalNotes');
    if(field)field.value=state.globalNotes;
    saveState();
    notesHistory.restoring=false;
    updateButtons();
  }

  function installStay(){
    STAY_FIELDS.forEach(id=>{
      const field=document.getElementById(id);
      if(!field)return;
      field.addEventListener('focus',()=>{
        stayHistory.focusSnapshot=currentStaySnapshot();
        stayHistory.recorded=false;
      });
      field.addEventListener('input',()=>{
        if(stayHistory.restoring||stayHistory.recorded||!stayHistory.focusSnapshot)return;
        push(stayHistory.undo,stayHistory.focusSnapshot,stayHistory.max);
        stayHistory.redo.length=0;
        stayHistory.recorded=true;
        updateButtons();
      });
      field.addEventListener('blur',()=>{stayHistory.focusSnapshot=null;stayHistory.recorded=false});
    });
    document.getElementById('stayUndoBtn')?.addEventListener('click',()=>{
      if(stayHistory.undo.length)restoreStay(stayHistory.undo.pop(),stayHistory.redo);
    });
    document.getElementById('stayRedoBtn')?.addEventListener('click',()=>{
      if(stayHistory.redo.length)restoreStay(stayHistory.redo.pop(),stayHistory.undo);
    });
  }

  window.addEventListener('guide-packing-change',event=>{
    if(stayHistory.restoring)return;
    const snapshot=currentStaySnapshot();
    if(Array.isArray(event.detail?.before))snapshot.packing=clone(event.detail.before);
    push(stayHistory.undo,snapshot,stayHistory.max);
    stayHistory.redo.length=0;
    updateButtons();
  });

  function installNotes(){
    const field=document.getElementById('globalNotes');
    if(!field)return;
    field.addEventListener('focus',()=>{
      notesHistory.focusSnapshot=state.globalNotes||'';
      notesHistory.recorded=false;
    });
    field.addEventListener('input',()=>{
      if(notesHistory.restoring||notesHistory.recorded||notesHistory.focusSnapshot===null)return;
      push(notesHistory.undo,notesHistory.focusSnapshot,notesHistory.max);
      notesHistory.redo.length=0;
      notesHistory.recorded=true;
      updateButtons();
    });
    field.addEventListener('blur',()=>{notesHistory.focusSnapshot=null;notesHistory.recorded=false});
    document.getElementById('notesUndoBtn')?.addEventListener('click',()=>{
      if(notesHistory.undo.length)restoreNotes(notesHistory.undo.pop(),notesHistory.redo);
    });
    document.getElementById('notesRedoBtn')?.addEventListener('click',()=>{
      if(notesHistory.redo.length)restoreNotes(notesHistory.redo.pop(),notesHistory.undo);
    });
  }

  installStay();
  installNotes();
  updateButtons();
})();

/* v353 — rendu idempotent : un appel avec exactement les mêmes données et le
   même contexte visuel ne doit jamais reconstruire le Programme ni relancer
   les images. Une vraie modification d'état, de jour ou d'onglet rend aussitôt. */
(()=>{
  if(window.__cphRenderDedupeV2||typeof window.renderAll!=='function')return;
  const originalRenderAll=window.renderAll;
  const stats={skipped:0,rendered:0};
  const stable=value=>{
    if(value===null||typeof value!=='object')return JSON.stringify(value);
    if(Array.isArray(value))return `[${value.map(stable).join(',')}]`;
    return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  };
  const readGlobal=name=>{
    try{return typeof globalThis[name]==='undefined'?null:globalThis[name]}catch{return null}
  };
  const fingerprint=()=>{
    try{
      const panel=document.querySelector?.('.panel.active')?.id||null;
      return stable({
        state:typeof state==='undefined'?null:state,
        selectedDay:readGlobal('selectedDay'),
        reopenOrderDay:readGlobal('reopenOrderDay'),
        panel
      });
    }catch{return null}
  };
  let lastFingerprint=fingerprint();
  window.renderAll=function(){
    const current=fingerprint();
    if(current!==null&&current===lastFingerprint){
      stats.skipped++;
      return 0;
    }
    const result=originalRenderAll.apply(this,arguments);
    lastFingerprint=fingerprint();
    stats.rendered++;
    return result;
  };
  window.__cphRenderDedupeV2={
    stats,
    force(){lastFingerprint=null;return window.renderAll();},
    fingerprint
  };
})();
