(function(){
"use strict";
if(window.__cphVisitSectionScrollV374)return;
window.__cphVisitSectionScrollV374=true;

const LEGACY_ICONS={
 schedule:"⚙️",
 notes:"📝"
};

function restoreLegacySectionIcons(){
 Object.entries(LEGACY_ICONS).forEach(([key,icon])=>{
  document.querySelectorAll(`#programme .cph-section-title-${key}`).forEach(title=>{
   const iconSlot=title.querySelector(":scope > span:first-child");
   const labelSlot=title.querySelector(":scope > span:last-child");
   if(iconSlot){
    iconSlot.dataset.cphLegacyIcon="1";
    iconSlot.textContent=icon;
   }
   if(key==="schedule"&&labelSlot){
    labelSlot.innerHTML="Horaire, durée et<br>organisation";
   }
  });
 });
}

function directSummary(details){
 return Array.from(details.children||[]).find(child=>child.tagName==="SUMMARY")||null;
}

function stickyHeaderOffset(){
 const header=document.querySelector("body>header");
 if(!header)return 0;
 const rect=header.getBoundingClientRect();
 const style=getComputedStyle(header);
 const followsViewport=style.position==="fixed"||style.position==="sticky"||rect.top<=1;
 if(!followsViewport)return 0;
 return Math.max(0,Math.round(rect.bottom));
}

function desiredTargetTop(){
 return stickyHeaderOffset()+12;
}

function settleTarget(target,owner,token){
 if(owner.dataset.cphScrollToken!==token||!target.isConnected)return;
 const delta=Math.round(target.getBoundingClientRect().top-desiredTargetTop());
 if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:"auto"});
}

function scrollTargetBelowHeader(target,owner){
 if(!target||!owner)return;
 const token=String((Number(owner.dataset.cphScrollToken)||0)+1);
 owner.dataset.cphScrollToken=token;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(owner.dataset.cphScrollToken!==token||!target.isConnected)return;
  const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-desiredTargetTop());
  window.scrollTo({top,behavior:"smooth"});
  window.setTimeout(()=>settleTarget(target,owner,token),420);
 }));
}

function bindSectionAutoScroll(){
 document.querySelectorAll("#programme details").forEach(details=>{
  const summary=directSummary(details);
  if(!summary||details.dataset.cphSectionScrollBound==="1")return;
  details.dataset.cphSectionScrollBound="1";
  details.addEventListener("toggle",()=>scrollTargetBelowHeader(summary,details));
 });
}

function bindDayAutoScroll(){
 document.querySelectorAll("#programme .day-banner").forEach(banner=>{
  const button=banner.querySelector(":scope > .cph-day-toggle");
  if(!button||button.dataset.cphDayScrollBound==="1")return;
  button.dataset.cphDayScrollBound="1";
  button.addEventListener("click",()=>{
   window.setTimeout(()=>scrollTargetBelowHeader(banner,banner),0);
  });
 });
}

function refresh(){
 restoreLegacySectionIcons();
 bindSectionAutoScroll();
 bindDayAutoScroll();
}

document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
else refresh();
})();
