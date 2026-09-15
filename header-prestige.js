(function(){
"use strict";

const TRACKING_TARGETS={
 ".stat-todo":"trackingTodoSection",
 ".stat-done":"trackingVisitedSection",
 ".stat-aside":"trackingAsideSection"
};

function trackingDetails(){
 return document.querySelector("#suivi .tracking-collapsible");
}

function openTrackingSection(id){
 if(typeof window.switchTab==="function")window.switchTab("suivi");
 else document.querySelector('.tab[data-tab="suivi"]')?.click();
 const details=trackingDetails();
 const section=document.getElementById(id);
 if(!details||!section)return;
 details.open=true;
 requestAnimationFrame(()=>{
  const header=document.querySelector("body>header");
  const offset=header?Math.max(0,Math.round(header.getBoundingClientRect().bottom)):0;
  const top=Math.max(0,window.scrollY+section.getBoundingClientRect().top-offset-6);
  window.scrollTo({top,behavior:"smooth"});
 });
}

function bindTrackingShortcuts(){
 Object.entries(TRACKING_TARGETS).forEach(([selector,id])=>{
  const tile=document.querySelector(`header .stats ${selector}`);
  if(!tile||tile.dataset.trackingShortcutBound)return;
  tile.dataset.trackingShortcutBound="1";
  tile.tabIndex=0;
  tile.setAttribute("role","button");
  tile.setAttribute("aria-label",`Afficher ${tile.textContent.replace(/\s+/g," ").trim().toLowerCase()}`);
  const open=()=>openTrackingSection(id);
  tile.addEventListener("click",open);
  tile.addEventListener("keydown",event=>{
   if(event.key!=="Enter"&&event.key!==" ")return;
   event.preventDefault();
   open();
  });
 });
}

function bindSettings(){
 const tile=document.getElementById("cphBottomSettingsTile");
 const original=document.getElementById("backupSettingsButton");
 if(tile&&!tile.dataset.settingsBound){
  tile.dataset.settingsBound="1";
  tile.addEventListener("click",()=>original?.click());
 }
}

function keepTrackingClosedOnEntry(){
 const details=trackingDetails();
 const tab=document.querySelector('.tab[data-tab="suivi"]');
 if(details&&!details.dataset.defaultClosed){
  details.open=false;
  details.dataset.defaultClosed="1";
 }
 if(tab&&!tab.dataset.trackingCloseBound){
  tab.dataset.trackingCloseBound="1";
  tab.addEventListener("click",()=>{
   const current=trackingDetails();
   if(current)current.open=false;
  });
 }
}

function removeActualDepartureTile(){
 document.querySelectorAll("#programme .day-departure").forEach(tile=>{
  const label=tile.querySelector(".day-departure-label");
  if((label?.textContent||"").trim()==="Départ réel"){
   tile.remove();
   return;
  }
  tile.classList.add("cph-departure-visible");
 });
}

const NOW_ACTIONS=[
 [".here-now","J’y suis","maintenant",'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.3 7-12a7 7 0 1 0-14 0c0 6.7 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>'],
 [".restore-original-time","Rétablir l’heure","d’origine",'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7v5h5"/><path d="M5.6 16.4A8 8 0 1 0 6 6.8L4 9"/></svg>'],
 [".go-now","J’y vais","maintenant",'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12"/><path d="m13 7 5 5-5 5"/></svg>']
];

function normalizeNowActionButtons(){
 document.querySelectorAll("#programme .visit-now-actions").forEach(group=>{
  NOW_ACTIONS.forEach(([selector,line1,line2,icon])=>{
   const button=group.querySelector(selector);
   if(!button||button.dataset.cphUniformNowAction==="1")return;
   button.dataset.cphUniformNowAction="1";
   button.innerHTML=`<span class="cph-now-icon">${icon}</span><span class="cph-now-label"><span>${line1}</span><span>${line2}</span></span>`;
  });
 });
}

function normalizedText(element){
 return (element?.textContent||"").replace(/\s+/g," ").trim();
}

function exactTextElements(root,text){
 const matches=Array.from(root.querySelectorAll("label,legend,strong,b,span,p,div,h3,h4,h5"))
  .filter(element=>normalizedText(element)===text);
 return matches.filter(element=>!Array.from(element.children).some(child=>normalizedText(child)===text));
}

function scheduleFieldElements(root,text){
 const exact=exactTextElements(root,text);
 const coveredLabels=new Set(exact.map(element=>element.matches("label")?element:element.closest("label")).filter(Boolean));
 const prefixedLabels=Array.from(root.querySelectorAll("label")).filter(label=>{
  if(coveredLabels.has(label))return false;
  const value=normalizedText(label);
  return value===text||value.startsWith(`${text} `);
 });
 return [...exact,...prefixedLabels];
}

const VISIT_HELPER_PREFIXES=[
 "Le point est inséré chronologiquement",
 "Le reste de la journée est recalculé",
 "Durée en minutes"
];

function isVisitHelperText(text){
 return VISIT_HELPER_PREFIXES.some(prefix=>text.startsWith(prefix));
}

function removeVisitHelperTexts(){
 const root=document.querySelector("#programme");
 if(!root)return;
 const candidates=new Set([
  ...root.querySelectorAll("small,p,.helper,.hint,.muted,.note,[class*='helper'],[class*='hint']"),
  ...Array.from(root.querySelectorAll("span,div")).filter(element=>element.children.length===0)
 ]);
 candidates.forEach(element=>{
  if(element.querySelector?.("input,button,select,textarea,a"))return;
  const text=normalizedText(element);
  if(text.length<=260&&isVisitHelperText(text))element.remove();
 });
}

function centerScheduleEditorFields(){
 const root=document.querySelector("#programme");
 if(!root)return;
 ["Heure souhaitée","Durée prévue","Jour de visite"].forEach(text=>{
  scheduleFieldElements(root,text).forEach(title=>{
   title.classList.add("cph-editor-title-centered");
   const label=title.matches("label")?title:title.closest("label");
   if(label)label.classList.add("cph-editor-field-centered");
   const scope=label||title.parentElement;
   if(text==="Heure souhaitée"){
    const control=scope?.querySelector('input[type="time"],input,select');
    if(control)control.classList.add("cph-time-control-centered");
   }
   if(text==="Jour de visite"){
    const control=scope?.querySelector("select,input");
    if(control)control.classList.add("cph-day-control-centered");
   }
  });
 });
}

function durationEditorForTitle(title,root){
 const direct=title.closest(".duration-editor");
 if(direct)return direct;
 let scope=(title.matches("label")?title:title.closest("label"))?.parentElement||title.parentElement;
 for(let depth=0;scope&&scope!==root&&depth<6;depth++,scope=scope.parentElement){
  const apply=Array.from(scope.querySelectorAll("button,.button")).find(button=>normalizedText(button)==="Appliquer");
  const control=scope.querySelector('input[type="number"],input');
  if(apply&&control)return scope;
 }
 return null;
}

function normalizeDurationEditors(){
 const root=document.querySelector("#programme");
 if(!root)return;
 scheduleFieldElements(root,"Durée prévue").forEach(title=>{
  const editor=durationEditorForTitle(title,root);
  if(!editor)return;
  const label=title.matches("label")?title:title.closest("label");
  const control=(label&&label.querySelector('input[type="number"],input'))||editor.querySelector('input[type="number"],input');
  const apply=Array.from(editor.querySelectorAll("button,.button")).find(button=>normalizedText(button)==="Appliquer")||null;
  if(!control||!apply)return;

  editor.classList.add("cph-duration-editor");
  if(label)label.classList.add("cph-duration-field");
  title.classList.add("cph-duration-title");
  apply.classList.add("cph-duration-apply");
  control.classList.add("cph-duration-control");

  let unit=Array.from(editor.children).find(child=>child.classList?.contains("cph-duration-unit"))||null;
  if(!unit){
   unit=document.createElement("span");
   unit.className="cph-duration-unit";
   unit.textContent="minutes";
   if(apply.parentElement===editor)editor.insertBefore(unit,apply);
   else editor.appendChild(unit);
  }

  const matchHeight=()=>{
   const height=Math.round(control.getBoundingClientRect().height);
   if(height>0)editor.style.setProperty("--cph-duration-control-height",`${height}px`);
  };
  matchHeight();
  requestAnimationFrame(matchHeight);
 });
}

const COMPASS_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3 5.3-2.1Z"/></svg>';

function normalizeStatusButtons(){
 document.querySelectorAll("#programme .action-grid.status.actions button").forEach(button=>{
  const text=normalizedText(button);
  if(/À visiter/i.test(text)&&button.dataset.cphVisitIcon!=="1"){
   button.dataset.cphVisitIcon="1";
   button.classList.add("cph-visit-button");
   button.innerHTML=`<span class="cph-status-icon" aria-hidden="true">${COMPASS_ICON}</span><span class="cph-status-label"><span>À visiter</span></span>`;
   return;
  }
  if(button.dataset.cphAsideAligned==="1")return;
  const asideText=text.replace(/^📌\s*/,"");
  if(asideText!=="Mettre de côté")return;
  button.dataset.cphAsideAligned="1";
  button.classList.add("cph-aside-button");
  button.innerHTML='<span class="cph-aside-icon" aria-hidden="true">📌</span><span class="cph-aside-label"><span>Mettre de</span><span>côté</span></span>';
 });
}

function escapeXml(value){
 return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[char]));
}

function placeNameFromSummary(summary){
 const title=summary?.querySelector(".summary-title-name,.visit-title,.place-title,h2,h3,h4,strong");
 return (normalizedText(title)||"Lieu à visiter").slice(0,52);
}

function placeNameForImage(img){
 const rawAlt=String(img.getAttribute("alt")||"").trim();
 const alt=rawAlt.replace(/^(photo|image|illustration)(\s+de|\s+du|\s+des|\s+d’|\s+d')?\s*/i,"").trim();
 if(alt&&!/^(photo|image|illustration|lieu)$/i.test(alt))return alt.slice(0,52);
 const summary=img.closest(".visit-summary");
 if(summary)return placeNameFromSummary(summary);
 const card=img.closest("article,.place-card,.poi-card,.visit-card,.program-item,.card,[data-place-id]");
 const title=card?.querySelector(".summary-title-name,h2,h3,h4,.title,.place-title,.poi-title,.visit-title,strong");
 const name=normalizedText(title);
 return (name||"Lieu à visiter").slice(0,52);
}

function placeFallbackDataUrl(name){
 const safe=escapeXml(name);
 const lower=String(name).toLowerCase();
 const cruise=/croisi|canal|bateau|boat|harbour|havn|port/.test(lower);
 const motif=cruise
  ? '<g transform="translate(535 392)"><path d="M-190 34h380l-48 82h-284Z" fill="#f7f1df" stroke="#274f59" stroke-width="9"/><rect x="-75" y="-52" width="150" height="88" rx="8" fill="#e9c46a" stroke="#274f59" stroke-width="8"/><path d="M0-52v-72" stroke="#274f59" stroke-width="9"/><path d="M0-120l95 42H0Z" fill="#fff" stroke="#274f59" stroke-width="7"/></g>'
  : '<g fill="#405f67"><rect x="124" y="344" width="90" height="132" rx="3"/><rect x="230" y="316" width="108" height="160" rx="3"/><rect x="354" y="356" width="96" height="120" rx="3"/><path d="M278 316v-74l16-38 16 38v74Z"/><path d="M169 344v-48l12-31 12 31v48Z"/></g>';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="${safe}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9ddf2"/><stop offset="1" stop-color="#f5dfc0"/></linearGradient><linearGradient id="water" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7eb7c9"/><stop offset="1" stop-color="#5f94a9"/></linearGradient></defs><rect width="1200" height="675" fill="url(#sky)"/><circle cx="965" cy="135" r="68" fill="#fff4c7" opacity=".9"/><path d="M0 430 130 350l88 54 150-118 122 106 133-178 137 151 112-90 148 112 110-73 90 85v276H0Z" fill="#708b88" opacity=".22"/><path d="M0 470h1200v205H0Z" fill="url(#water)"/><path d="M0 492c160-34 256 30 393 4s240-15 344 7 270 18 463-8" fill="none" stroke="#d9f1f2" stroke-width="8" opacity=".65"/>${motif}<rect x="72" y="70" width="1056" height="96" rx="26" fill="#173846" opacity=".78"/><text x="600" y="130" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="42" font-weight="700" fill="white">${safe}</text></svg>`;
 return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function ensureMissingPlacePhotos(){
 document.querySelectorAll("#programme .visit-summary").forEach(summary=>{
  if(summary.querySelector(".visit-summary-thumb,img"))return;
  const name=placeNameFromSummary(summary);
  const img=document.createElement("img");
  img.className="visit-summary-thumb cph-place-photo-fallback cph-generated-place-photo";
  img.alt=`Illustration de ${name}`;
  img.src=placeFallbackDataUrl(name);
  const main=summary.querySelector(".summary-main");
  summary.insertBefore(img,main||summary.firstChild);
 });
}

function installPlaceImageFallbacks(){
 ensureMissingPlacePhotos();
 const images=new Set([
  ...document.querySelectorAll("#programme img"),
  ...document.querySelectorAll(".place-card img,.poi-card img,.visit-card img,[data-place-id] img")
 ]);
 images.forEach(img=>{
  if(img.dataset.cphPlaceFallbackBound==="1")return;
  img.dataset.cphPlaceFallbackBound="1";
  const fallback=()=>{
   if(img.dataset.cphPlaceFallbackApplied==="1")return;
   img.dataset.cphPlaceFallbackApplied="1";
   img.removeAttribute("srcset");
   img.removeAttribute("sizes");
   img.src=placeFallbackDataUrl(placeNameForImage(img));
   img.classList.add("cph-place-photo-fallback");
  };
  img.addEventListener("error",fallback,{once:true});
  if(img.complete&&img.naturalWidth===0)fallback();
 });
}

function refresh(){
 bindSettings();
 bindTrackingShortcuts();
 keepTrackingClosedOnEntry();
 removeActualDepartureTile();
 normalizeNowActionButtons();
 removeVisitHelperTexts();
 centerScheduleEditorFields();
 normalizeDurationEditors();
 normalizeStatusButtons();
}

document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading"){
 document.addEventListener("DOMContentLoaded",refresh,{once:true});
}else{
 refresh();
}
})();

/* v359 — recalage temporel depuis la tuile réellement pressée. */
(function(){
"use strict";
if(window.__cphScheduleActionsV359)return;
window.__cphScheduleActionsV359=true;

function normalizeMinute(value){
 const n=Number(value);
 if(!Number.isFinite(n))return null;
 return ((Math.round(n)%1440)+1440)%1440;
}

function pointDuration(point){
 return Math.max(0,Number(state.durationOverrides?.[point.id]||point.durationMins||0));
}

function isInactiveFollowingPoint(point){
 const status=typeof itemState==="function"?itemState(point.id)?.status:null;
 return status==="visited"||status==="missed"||!!state.manualAside?.[point.id]||
  (typeof reservationState==="function"&&reservationState(point.id)==="no");
}

function cascadeFromClickedPoint(id,startMins){
 if(typeof DATA==="undefined"||typeof state==="undefined"||typeof dayItems!=="function"||
    typeof effectiveDay!=="function"||typeof minToHm!=="function")return false;
 const point=DATA.find(x=>x.id===id);
 const target=normalizeMinute(startMins);
 if(!point||target===null)return false;

 const day=effectiveDay(point);
 const ordered=dayItems(day).slice();
 const startIndex=ordered.findIndex(x=>x.id===id);
 if(startIndex<0)return false;

 state.timeOverrides=state.timeOverrides||{};
 state.timeOverrides[id]=minToHm(target);

 let previous=point;
 let cursor=target+pointDuration(point);

 for(let i=startIndex+1;i<ordered.length;i++){
  const next=ordered[i];
  if(!next||isInactiveFollowingPoint(next))continue;

  const route=typeof routeBetween==="function"?routeBetween(previous,next):null;
  const travel=Math.max(0,Number(route?.mins||0));
  const proposed=cursor+travel;
  const protectedTime=typeof protectedReservationTime==="function"?protectedReservationTime(next):null;

  if(protectedTime&&typeof hmToMin==="function"){
   const fixed=hmToMin(protectedTime);
   if(Number.isFinite(fixed)){
    cursor=fixed+pointDuration(next);
    previous=next;
    continue;
   }
  }

  state.timeOverrides[next.id]=minToHm(proposed);
  cursor=proposed+pointDuration(next);
  previous=next;
 }

 if(typeof saveState==="function")saveState();
 if(typeof renderAll==="function")renderAll();
 return true;
}

function currentMinute(){
 const now=new Date();
 return now.getHours()*60+now.getMinutes();
}

window.setPointHereNow=function(id){
 return cascadeFromClickedPoint(id,currentMinute());
};

window.goToPointNow=function(id){
 return cascadeFromClickedPoint(id,currentMinute());
};

window.restorePointOriginalTime=function(id){
 if(typeof DATA==="undefined"||typeof hmToMin!=="function")return false;
 const point=DATA.find(x=>x.id===id);
 if(!point)return false;
 const original=String(point.plannedStart||point.fixedTime||point.time||"").trim().slice(0,5);
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(original))return false;
 return cascadeFromClickedPoint(id,hmToMin(original));
};

window.__cphScheduleActionsV359Api={cascadeFromClickedPoint};
})();
