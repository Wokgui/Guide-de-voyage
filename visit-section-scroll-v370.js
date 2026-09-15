(function(){
"use strict";
if(window.__cphVisitSectionScrollV370)return;
window.__cphVisitSectionScrollV370=true;

const LEGACY_ICONS={
 schedule:"⚙️",
 notes:"📝"
};

function restoreLegacySectionIcons(){
 Object.entries(LEGACY_ICONS).forEach(([key,icon])=>{
  document.querySelectorAll(`#programme .cph-section-title-${key}>span:first-child`).forEach(slot=>{
   if(slot.textContent===icon&&slot.dataset.cphLegacyIcon==="1")return;
   slot.dataset.cphLegacyIcon="1";
   slot.textContent=icon;
  });
 });
}

function stickyHeaderOffset(){
 const header=document.querySelector("body>header");
 if(!header)return 0;
 const position=getComputedStyle(header).position;
 if(position!=="fixed"&&position!=="sticky")return 0;
 const rect=header.getBoundingClientRect();
 return Math.max(0,Math.round(rect.bottom));
}

function firstOpenedContent(details,summary){
 if(!details.open)return summary;
 return Array.from(details.children).find(child=>child!==summary&&!child.hidden)||summary;
}

function scrollSectionToStart(details){
 const summary=details.querySelector(":scope > summary.cph-section-summary")||details.querySelector("summary.cph-section-summary");
 if(!summary)return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const target=firstOpenedContent(details,summary);
  const offset=stickyHeaderOffset();
  const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-offset-8);
  window.scrollTo({top,behavior:"smooth"});
 }));
}

function bindSectionAutoScroll(){
 document.querySelectorAll("#programme details").forEach(details=>{
  const summary=details.querySelector(":scope > summary.cph-section-summary");
  if(!summary||details.dataset.cphSectionScrollBound==="1")return;
  details.dataset.cphSectionScrollBound="1";
  details.addEventListener("toggle",()=>scrollSectionToStart(details));
 });
}

function refresh(){
 restoreLegacySectionIcons();
 bindSectionAutoScroll();
}

document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
else refresh();
})();
