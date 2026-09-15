(function(){
"use strict";
if(window.__cphVisitPolishV366)return;
window.__cphVisitPolishV366=true;

const style=document.createElement("style");
style.id="cphVisitPolishV366Style";
style.textContent=`
#programme .day-departure{display:none!important}

/* Un seul indicateur d'ouverture : la grande flèche placée à droite. */
#programme summary.cph-section-summary::marker{content:""!important;font-size:0!important}
#programme summary.cph-section-summary::-webkit-details-marker{display:none!important}
#programme summary.cph-section-summary::before,
#programme summary.cph-section-summary::after{content:none!important;display:none!important}
#programme .cph-section-summary{
 position:relative!important;
 display:block!important;
 width:100%!important;
 box-sizing:border-box!important;
 min-height:64px!important;
 padding-left:48px!important;
 padding-right:48px!important;
 text-align:center!important;
 list-style:none!important;
}
#programme .cph-section-title{
 position:absolute!important;
 left:50%!important;
 top:50%!important;
 transform:translate(-50%,-50%)!important;
 display:inline-flex!important;
 align-items:center!important;
 justify-content:center!important;
 gap:7px!important;
 width:max-content!important;
 max-width:calc(100% - 108px)!important;
 margin:0!important;
 text-align:center!important;
}
#programme .cph-section-title>span:first-child{
 display:inline-flex!important;
 align-items:center!important;
 justify-content:center!important;
 flex:0 0 auto!important;
 line-height:1!important;
}
#programme .cph-section-title>span:last-child{
 display:block!important;
 min-width:0!important;
 text-align:center!important;
 line-height:1.15!important;
}
#programme .cph-section-arrow{
 position:absolute!important;
 right:14px!important;
 top:50%!important;
 display:flex!important;
 align-items:center!important;
 justify-content:center!important;
 width:30px!important;
 height:30px!important;
 margin:0!important;
 transform:translateY(-50%) rotate(0deg)!important;
 transform-origin:center!important;
 transition:transform .18s ease!important;
 font-size:22px!important;
 font-weight:900!important;
 line-height:1!important;
}
#programme details[open]>.cph-section-summary .cph-section-arrow{
 transform:translateY(-50%) rotate(180deg)!important
}

/* Durée : le titre occupe toute la largeur de la grande tuile, comme Heure souhaitée. */
#programme .duration-editor.cph-duration-editor{
 grid-template-rows:auto auto!important;
 row-gap:6px!important;
}
#programme .duration-editor.cph-duration-editor::before{
 content:"Durée prévue";
 grid-column:1/-1!important;
 grid-row:1!important;
 display:block!important;
 width:100%!important;
 margin:0!important;
 text-align:center!important;
 font-size:14px!important;
 font-weight:800!important;
 line-height:1.2!important;
}
#programme .duration-editor.cph-duration-editor>.cph-duration-field{
 grid-row:2!important;
 font-size:0!important;
 line-height:0!important;
}
#programme .duration-editor.cph-duration-editor .cph-duration-title:not(.cph-duration-field){
 display:none!important;
}
#programme .duration-editor.cph-duration-editor .cph-duration-control{
 font-size:16px!important;
 line-height:normal!important;
}
#programme .duration-editor.cph-duration-editor>.cph-duration-unit,
#programme .duration-editor.cph-duration-editor>.cph-duration-apply{
 grid-row:2!important;
}

#programme .cph-note-editor{
 text-align:justify!important;
 text-justify:inter-word!important;
 line-height:1.45!important;
}
#programme .cph-day-toggle{
 display:flex!important;
 align-items:center!important;
 justify-content:center!important;
 flex:0 0 34px!important;
 width:34px!important;
 height:34px!important;
 min-width:34px!important;
 margin-left:auto!important;
 padding:0!important;
 border:0!important;
 background:transparent!important;
 color:inherit!important;
 box-shadow:none!important;
 cursor:pointer!important;
}
#programme .cph-day-toggle svg{
 display:block!important;
 width:20px!important;
 height:20px!important;
 fill:none!important;
 stroke:currentColor!important;
 stroke-width:2.2!important;
 stroke-linecap:round!important;
 stroke-linejoin:round!important;
 transition:transform .18s ease!important;
}
#programme .cph-day-toggle[aria-expanded="false"] svg{transform:rotate(-90deg)!important}
#programme .day-body.cph-day-body-collapsed{display:none!important}
`;
document.head.appendChild(style);

const norm=element=>(element?.textContent||"").replace(/\s+/g," ").trim();

function sectionSpec(summary){
 const text=norm(summary);
 if(/Horaire, durée et organisation/i.test(text))return {key:"schedule",icon:"⚙️",label:"Horaire, durée et organisation"};
 if(/(^|\s)Notes?(\s|$)/i.test(text))return {key:"notes",icon:"📝",label:"Notes"};
 return null;
}

function polishSectionSummaries(){
 document.querySelectorAll("#programme summary").forEach(summary=>{
  const spec=sectionSpec(summary);
  if(!spec)return;
  if(summary.dataset.cphSectionPolished!==spec.key){
   summary.dataset.cphSectionPolished=spec.key;
   summary.classList.add("cph-section-summary");
   summary.replaceChildren();
   const title=document.createElement("span");
   title.className="cph-section-title";
   title.innerHTML=`<span aria-hidden="true">${spec.icon}</span><span>${spec.label}</span>`;
   const arrow=document.createElement("span");
   arrow.className="cph-section-arrow";
   arrow.setAttribute("aria-hidden","true");
   arrow.textContent="⌄";
   summary.append(title,arrow);
  }
  if(spec.key==="notes"){
   const details=summary.closest("details");
   details?.querySelectorAll("textarea,[contenteditable='true']").forEach(editor=>editor.classList.add("cph-note-editor"));
  }
 });
}

function findDayBody(banner){
 let sibling=banner.nextElementSibling;
 if(sibling?.classList?.contains("day-body"))return sibling;
 let parent=banner.parentElement;
 const root=document.getElementById("programme");
 for(let depth=0;parent&&parent!==root&&depth<5;depth++,parent=parent.parentElement){
  const direct=Array.from(parent.children||[]).find(child=>child.classList?.contains("day-body"));
  if(direct)return direct;
  const nested=parent.querySelector?.(".day-body");
  if(nested&&!banner.contains(nested))return nested;
 }
 return null;
}

function installDayToggles(){
 document.querySelectorAll("#programme .day-banner").forEach(banner=>{
  banner.querySelectorAll(".day-departure").forEach(tile=>tile.remove());
  const body=findDayBody(banner);
  if(!body)return;
  let button=banner.querySelector(":scope > .cph-day-toggle");
  if(!button){
   button=document.createElement("button");
   button.type="button";
   button.className="cph-day-toggle";
   button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
   banner.appendChild(button);
  }
  const expanded=!body.classList.contains("cph-day-body-collapsed");
  button.setAttribute("aria-expanded",expanded?"true":"false");
  button.setAttribute("aria-label",expanded?"Replier la journée":"Déplier la journée");
  if(button.dataset.cphDayToggleBound==="1")return;
  button.dataset.cphDayToggleBound="1";
  button.addEventListener("click",event=>{
   event.preventDefault();
   event.stopPropagation();
   const collapsed=body.classList.toggle("cph-day-body-collapsed");
   button.setAttribute("aria-expanded",collapsed?"false":"true");
   button.setAttribute("aria-label",collapsed?"Déplier la journée":"Replier la journée");
  });
 });
}

function removeDepartureTilesEverywhere(){
 document.querySelectorAll("#programme .day-departure").forEach(tile=>tile.remove());
}

function refresh(){
 removeDepartureTilesEverywhere();
 polishSectionSummaries();
 installDayToggles();
}

document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
else refresh();
})();
