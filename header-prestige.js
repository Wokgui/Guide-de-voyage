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
  if((label?.textContent||"").trim()==="Départ réel")tile.remove();
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

function findExactText(root,text){
 const candidates=Array.from(root.querySelectorAll("label,legend,strong,b,span,p,div,h3,h4,h5"))
  .filter(element=>normalizedText(element)===text);
 return candidates.sort((a,b)=>a.children.length-b.children.length)[0]||null;
}

function centerScheduleEditorFields(){
 const root=document.querySelector("#programme");
 if(!root)return;
 ["Heure souhaitée","Durée prévue","Jour de visite"].forEach(text=>{
  const title=findExactText(root,text);
  if(!title)return;
  title.classList.add("cph-editor-title-centered");
  const label=title.closest("label")||(title.matches("label")?title:null);
  if(label)label.classList.add("cph-editor-field-centered");
  if(text==="Heure souhaitée"){
   const scope=label||title.parentElement;
   const control=scope?.querySelector('input[type="time"],input,select');
   if(control)control.classList.add("cph-time-control-centered");
  }
 });
}

function syncDurationApplyHeight(){
 const root=document.querySelector("#programme");
 if(!root)return;
 const title=findExactText(root,"Durée prévue");
 if(!title)return;
 let scope=title.parentElement;
 let apply=null;
 for(let depth=0;scope&&scope!==root&&depth<6;depth++,scope=scope.parentElement){
  apply=Array.from(scope.querySelectorAll("button,.button")).find(button=>normalizedText(button)==="Appliquer")||null;
  if(apply)break;
 }
 if(!apply)return;
 const label=title.closest("label");
 const control=(label&&label.querySelector("input,select"))||scope?.querySelector("input,select");
 if(!control)return;
 apply.classList.add("cph-duration-apply");
 control.classList.add("cph-duration-control");
 const matchHeight=()=>{
  const height=Math.round(control.getBoundingClientRect().height);
  if(height>0)apply.style.setProperty("--cph-duration-control-height",`${height}px`);
 };
 matchHeight();
 requestAnimationFrame(matchHeight);
}

function normalizeAsideButton(){
 document.querySelectorAll("#programme .action-grid.status.actions button").forEach(button=>{
  if(button.dataset.cphAsideAligned==="1")return;
  const text=normalizedText(button).replace(/^📌\s*/,"");
  if(text!=="Mettre de côté")return;
  button.dataset.cphAsideAligned="1";
  button.classList.add("cph-aside-button");
  button.innerHTML='<span class="cph-aside-icon" aria-hidden="true">📌</span><span class="cph-aside-label"><span>Mettre de</span><span>côté</span></span>';
 });
}

function refresh(){
 bindSettings();
 bindTrackingShortcuts();
 keepTrackingClosedOnEntry();
 removeActualDepartureTile();
 normalizeNowActionButtons();
 centerScheduleEditorFields();
 syncDurationApplyHeight();
 normalizeAsideButton();
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
 // Une action directe modifie toujours l'événement pressé, même s'il est réservé.
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

  // Les réservations suivantes restent des ancres fixes, puis le recalcul continue après elles.
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
