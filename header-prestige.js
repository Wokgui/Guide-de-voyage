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

function loadDomStabilityV356(){
 if(document.querySelector('script[data-cph-dom-stability="356"]'))return;
 const script=document.createElement("script");
 script.src="/dom-stability-v356.js?v=356";
 script.async=false;
 script.dataset.cphDomStability="356";
 document.head.appendChild(script);
}

function refresh(){
 bindSettings();
 bindTrackingShortcuts();
 keepTrackingClosedOnEntry();
}

document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading"){
 document.addEventListener("DOMContentLoaded",refresh,{once:true});
 document.addEventListener("DOMContentLoaded",loadDomStabilityV356,{once:true});
}else{
 refresh();
 loadDomStabilityV356();
}
})();
