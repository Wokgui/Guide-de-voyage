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

function refresh(){
 bindSettings();
 bindTrackingShortcuts();
 keepTrackingClosedOnEntry();
 removeActualDepartureTile();
 normalizeNowActionButtons();
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
