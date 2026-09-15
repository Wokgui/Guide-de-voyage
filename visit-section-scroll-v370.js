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

function desiredSummaryTop(){
 return stickyHeaderOffset()+12;
}

function settleSummary(summary,details,token){
 if(details.dataset.cphSectionScrollToken!==token||!summary.isConnected)return;
 const delta=Math.round(summary.getBoundingClientRect().top-desiredSummaryTop());
 if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:"auto"});
}

function scrollSectionHeader(details){
 const summary=directSummary(details);
 if(!summary)return;
 const token=String((Number(details.dataset.cphSectionScrollToken)||0)+1);
 details.dataset.cphSectionScrollToken=token;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(details.dataset.cphSectionScrollToken!==token||!summary.isConnected)return;
  const top=Math.max(0,window.scrollY+summary.getBoundingClientRect().top-desiredSummaryTop());
  window.scrollTo({top,behavior:"smooth"});
  window.setTimeout(()=>settleSummary(summary,details,token),420);
 }));
}

function bindSectionAutoScroll(){
 document.querySelectorAll("#programme details").forEach(details=>{
  const summary=directSummary(details);
  if(!summary||details.dataset.cphSectionScrollBound==="1")return;
  details.dataset.cphSectionScrollBound="1";
  details.addEventListener("toggle",()=>scrollSectionHeader(details));
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
