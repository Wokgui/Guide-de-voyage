(function(){
"use strict";
if(window.__cphDayStyleV7)return;
window.__cphDayStyleV7=true;
["cph-day-style-v1","cph-day-style-v2","cph-day-style-v3","cph-day-style-v4","cph-day-style-v5","cph-day-style-v6","cph-day-style-v7"].forEach(id=>document.getElementById(id)?.remove());
const s=document.createElement("style");
s.id="cph-day-style-v7";
s.textContent=`
/* Style 2 valide : cadre colore uniforme et en-tete teinte colle aux trois bords. */
html body #programme .day-section.day-section{
 --cph-day-bg:#f7e8d8;
 --cph-day-border:#d6a677;
 --cph-day-ink:#6f4a2c;
 box-sizing:border-box!important;
 position:relative!important;
 overflow:hidden!important;
 padding:0!important;
 border-width:1.5px!important;
 border-style:solid!important;
 border-color:var(--cph-day-border)!important;
 border-radius:18px!important;
 background:#fff!important;
 box-shadow:0 6px 18px color-mix(in srgb,var(--cph-day-border) 13%,transparent)!important;
}
html body #programme .day-section.day-section::before{content:none!important;display:none!important}
html body #programme .day-section.day-section:has(.day-Lundi){--cph-day-bg:#f8e9df;--cph-day-border:#d7aa8d;--cph-day-ink:#6d4937}
html body #programme .day-section.day-section:has(.day-Mardi){--cph-day-bg:#f7e8d8;--cph-day-border:#d6a677;--cph-day-ink:#6f4a2c}
html body #programme .day-section.day-section:has(.day-Mercredi){--cph-day-bg:#e7f0df;--cph-day-border:#a9c392;--cph-day-ink:#3f6240}
html body #programme .day-section.day-section:has(.day-Jeudi){--cph-day-bg:#e4eef7;--cph-day-border:#9dbbd2;--cph-day-ink:#355d78}
html body #programme .day-section.day-section:has(.day-Vendredi){--cph-day-bg:#eee5f5;--cph-day-border:#bba5d2;--cph-day-ink:#634a7c}
html body #programme .day-section.day-section:has(.day-Samedi){--cph-day-bg:#f7ead9;--cph-day-border:#d8b27c;--cph-day-ink:#75532f}
html body #programme .day-section.day-section:has(.day-Dimanche){--cph-day-bg:#f3e5e8;--cph-day-border:#d4a8b0;--cph-day-ink:#744e57}
html body #programme .day-section.day-section>.day-banner.day-banner,
html body #programme .day-section.day-section .day-banner.day-banner{
 box-sizing:border-box!important;
 align-self:stretch!important;
 width:100%!important;
 max-width:none!important;
 margin:0!important;
 border:0!important;
 border-bottom:1px solid color-mix(in srgb,var(--cph-day-border) 58%,transparent)!important;
 border-radius:16.5px 16.5px 0 0!important;
 background:var(--cph-day-bg)!important;
 color:var(--cph-day-ink)!important;
 box-shadow:none!important;
}
html body #programme .day-section.day-section .day-banner.day-banner *{color:inherit}

/* Événement réservé ouvert : conserver uniquement le calendrier créé pour l'état replié. */
html body #programme .visit-details[open] .visit-summary .mini-badge.booking.reserved,
html body #programme .visit-details[open] .visit-summary .cph-reserved-original-hidden{
 display:none!important;
 visibility:hidden!important;
 width:0!important;min-width:0!important;max-width:0!important;
 height:0!important;min-height:0!important;max-height:0!important;
 margin:0!important;padding:0!important;overflow:hidden!important;
}
html body #programme .visit-details[open] .visit-summary .cph-reserved-one{
 display:inline-flex!important;
 align-items:center!important;
 justify-content:center!important;
}

/* « À commander » : l'étoile et le libellé forment un bloc centré dans toutes les vues. */
html body .recommend-box>b,
html body .reservation-order>b{
 display:flex!important;
 width:100%!important;
 align-items:center!important;
 justify-content:center!important;
 gap:4px!important;
 text-align:center!important;
}

/* v351 — la zone à droite de la photo comprend désormais aussi l'espace de la
   flèche. Les trois métadonnées et « J’y vais » ont chacun leur rangée et le
   même centre horizontal, sans positionnement relatif ni translation. */
html body #programme .visit-details:not([open]) .visit-summary{
 grid-template-columns:118px minmax(0,1fr)!important;
}
html body #programme .visit-details:not([open]) .visit-summary .summary-main{
 grid-column:2!important;
 grid-template-areas:
  "title time"
  "tools tools"
  "action action"
  "meta meta"!important;
 grid-template-rows:auto 1fr auto auto!important;
 gap:4px 7px!important;
 position:relative!important;
}
html body #programme .visit-details:not([open]) .visit-summary .summary-title-tools{
 position:static!important;
 width:100%!important;
 max-width:none!important;
 margin:0!important;
}
html body #programme .visit-details:not([open]) .visit-summary .summary-title-tools .summary-line:nth-child(2){
 box-sizing:border-box!important;
 display:grid!important;
 grid-template-columns:max-content 17px max-content!important;
 position:static!important;
 width:100%!important;
 max-width:none!important;
 margin:0!important;
 padding:0!important;
 justify-content:center!important;
 justify-items:center!important;
 column-gap:16px!important;
 transform:none!important;
}
html body #programme .visit-details:not([open]) .visit-summary .go-now-summary{
 grid-area:action!important;
 position:static!important;
 left:auto!important;
 right:auto!important;
 top:auto!important;
 bottom:auto!important;
 width:110px!important;
 min-width:110px!important;
 max-width:110px!important;
 margin:0 auto!important;
 justify-self:center!important;
 align-self:end!important;
 text-align:center!important;
 transform:none!important;
}
html body #programme .visit-details:not([open]) .visit-summary .go-now-summary::after{
 position:static!important;
 inset:auto!important;
 width:100%!important;
 text-align:center!important;
 transform:none!important;
}
html body #programme .visit-details:not([open]) .visit-summary .chevron{
 position:absolute!important;
 right:8px!important;
 bottom:8px!important;
 margin:0!important;
 transform:none!important;
}
html body #programme .visit-details:not([open]) .walk-shoe-svg{
 display:block!important;
 width:17px!important;
 height:17px!important;
 overflow:visible!important;
 fill:none!important;
 stroke:currentColor!important;
 stroke-width:1.75!important;
 stroke-linecap:round!important;
 stroke-linejoin:round!important;
}
@media(max-width:390px){
 html body #programme .visit-details:not([open]) .visit-summary{
  grid-template-columns:116px minmax(0,1fr)!important;
 }
 html body #programme .visit-details:not([open]) .visit-summary .summary-title-tools .summary-line:nth-child(2){
  column-gap:12px!important;
 }
}
`;
document.head.appendChild(s);
function normalizeOrderHeadings(root=document){
 root.querySelectorAll?.(".recommend-box>b,.reservation-order>b").forEach(b=>{
  const text=(b.textContent||"").replace(/^⭐\s*/,"").trim();
  if(/^À commander$/i.test(text))b.textContent="⭐ À commander";
 });
}
function pin(root=document){
 if(s.parentNode!==document.head)document.head.appendChild(s);
 normalizeOrderHeadings(root);
 document.documentElement.dataset.cphDayStyle="v6-demand";
}
window.__cphDayStyleRefresh=pin;
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>pin(),{once:true});else pin();
})();

(function(){
"use strict";
if(window.__cphGuidePerfRuntimeV1)return;

const originals={
 renderAll:typeof window.renderAll==="function"?window.renderAll:null,
 switchTab:typeof window.switchTab==="function"?window.switchTab:null,
 renderProgramme:typeof window.renderProgramme==="function"?window.renderProgramme:null,
 renderReservations:typeof window.renderReservations==="function"?window.renderReservations:null,
 renderTrackingLists:typeof window.renderTrackingLists==="function"?window.renderTrackingLists:null,
 renderMap:typeof window.renderMap==="function"?window.renderMap:null,
 adaptiveAll:typeof window.adaptiveAll==="function"?window.adaptiveAll:null,
 updateStats:typeof window.updateStats==="function"?window.updateStats:null,
 scheduleGuideRenderedNotice:typeof window.scheduleGuideRenderedNotice==="function"?window.scheduleGuideRenderedNotice:null
};
if(!originals.renderAll||!originals.switchTab||!originals.renderProgramme)return;

const dirty={programme:false,carte:false,suivi:false,sejour:false};
const samples={renderAll:[],programme:[],carte:[],suivi:[],sejour:[],switchTab:[],polish:[]};
const counters={renderAll:0,programme:0,carte:0,suivi:0,sejour:0,switchTab:0,polish:0,longTasks:0};
const MAX_SAMPLES=600;
const POLISH_PANELS=new Set(["programme","suivi"]);
let renderDepth=0;
let polishQueued=false;
let polishTarget=null;

function now(){return typeof performance!=="undefined"&&typeof performance.now==="function"?performance.now():Date.now();}
function activeTab(){return document.querySelector(".panel.active")?.id||document.querySelector(".tab.active")?.dataset?.tab||"programme";}
function remember(name,ms){
 counters[name]=(counters[name]||0)+1;
 const list=samples[name]||(samples[name]=[]);
 list.push(Math.round(ms*100)/100);
 if(list.length>MAX_SAMPLES)list.splice(0,list.length-MAX_SAMPLES);
}
function percentile(values,p){
 if(!values.length)return 0;
 const sorted=[...values].sort((a,b)=>a-b);
 return sorted[Math.min(sorted.length-1,Math.max(0,Math.ceil((p/100)*sorted.length)-1))];
}
function stat(name){
 const list=samples[name]||[];
 const sum=list.reduce((a,b)=>a+b,0);
 return {count:counters[name]||0,last:list.at(-1)||0,avg:list.length?Math.round((sum/list.length)*100)/100:0,p50:percentile(list,50),p95:percentile(list,95),max:list.length?Math.max(...list):0};
}
function markDataPanelsDirty(except){["programme","carte","suivi"].forEach(name=>{dirty[name]=name!==except});}
function panelRoot(name){return document.getElementById(name)||document;}

const perfApi={
 version:"1.3.0",
 logging:new URLSearchParams(location.search).has("perf")||localStorage.getItem("cphGuidePerfLogs")==="1",
 dirty,counters,samples,
 report(){return {version:this.version,active:activeTab(),dirty:{...dirty},longTasks:counters.longTasks,renderAll:stat("renderAll"),programme:stat("programme"),carte:stat("carte"),suivi:stat("suivi"),sejour:stat("sejour"),switchTab:stat("switchTab"),polish:stat("polish")};},
 reset(){Object.keys(samples).forEach(k=>samples[k].length=0);Object.keys(counters).forEach(k=>counters[k]=0);},
 markDirty(){["programme","carte","suivi"].forEach(k=>dirty[k]=true);},
 refresh(){this.markDirty();return renderPanel(activeTab(),"manual");},
 async stress(cycles=300){
  const count=Math.max(1,Math.min(1000,Number(cycles)||300));
  const original=activeTab();
  const sequence=["programme","suivi","sejour"];
  const t0=now();
  for(let i=0;i<count;i++){
   const target=sequence[i%sequence.length];
   this.markDirty();
   window.switchTab(target);
   if((i+1)%25===0)await new Promise(requestAnimationFrame);
  }
  window.switchTab(original);
  return {cycles:count,totalMs:Math.round((now()-t0)*100)/100,...this.report()};
 }
};

function runPolishers(name){
 if(!POLISH_PANELS.has(name))return;
 polishTarget=name;
 if(polishQueued)return;
 polishQueued=true;
 requestAnimationFrame(()=>{
  polishQueued=false;
  const target=polishTarget;
  polishTarget=null;
  if(!target)return;
  const t0=now();
  try{
   const root=panelRoot(target);
   if(typeof window.__cphDayStyleRefresh==="function")window.__cphDayStyleRefresh(root);
  }catch(err){console.warn("[guide-perf] polish",err);}
  remember("polish",now()-t0);
 });
}

function withAdaptiveSnapshot(callback){
 if(!originals.adaptiveAll)return callback(null);
 const current=window.adaptiveAll;
 const adapt=originals.adaptiveAll();
 window.adaptiveAll=()=>adapt;
 try{return callback(adapt);}finally{window.adaptiveAll=current;}
}

function renderPanel(name,reason){
 const t0=now();
 renderDepth++;
 try{
  if(name==="programme"){
   withAdaptiveSnapshot(adapt=>{
    originals.renderProgramme(adapt||undefined);
    if(adapt&&originals.updateStats)originals.updateStats(adapt);
   });
  }else if(name==="suivi"){
   withAdaptiveSnapshot(adapt=>{
    if(originals.renderReservations)originals.renderReservations(adapt||undefined);
    if(originals.renderTrackingLists)originals.renderTrackingLists(adapt||undefined);
    if(adapt&&originals.updateStats)originals.updateStats(adapt);
   });
  }else if(name==="carte"){
   withAdaptiveSnapshot(adapt=>{
    if(originals.renderMap)originals.renderMap();
    if(adapt&&originals.updateStats)originals.updateStats(adapt);
   });
  }else if(name==="sejour"){
   withAdaptiveSnapshot(adapt=>{if(adapt&&originals.updateStats)originals.updateStats(adapt);});
  }
  dirty[name]=false;
 }finally{renderDepth--;}
 const elapsed=now()-t0;
 remember(name,elapsed);
 runPolishers(name);
 if(perfApi.logging&&elapsed>24)console.info(`[guide-perf] ${reason||"render"} ${name}: ${elapsed.toFixed(1)} ms`);
 return elapsed;
}

function selectiveRenderAll(){
 if(renderDepth)return originals.renderAll();
 const t0=now();
 const name=activeTab();
 markDataPanelsDirty(name);
 renderPanel(name,"renderAll");
 remember("renderAll",now()-t0);
}

function applyTabState(name){
 document.querySelectorAll(".panel").forEach(x=>x.classList.toggle("active",x.id===name));
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));
 if(document.body?.classList){
  document.body.classList.toggle("suivi-active",name==="suivi");
  document.body.classList.toggle("sejour-active",name==="sejour");
 }
}

function selectiveSwitchTab(name){
 const t0=now();
 const before=activeTab();
 if(name==="carte"){
  originals.switchTab(name);
  dirty.carte=false;
 }else{
  applyTabState(name);
  if(dirty[name])renderPanel(name,"open");else runPolishers(name);
  if(originals.scheduleGuideRenderedNotice)originals.scheduleGuideRenderedNotice();
 }
 remember("switchTab",now()-t0);
 const elapsed=samples.switchTab.at(-1)||0;
 if(perfApi.logging&&before!==name&&elapsed>24)console.info(`[guide-perf] tab ${before} → ${name}: ${elapsed.toFixed(1)} ms`);
}

window.renderAll=selectiveRenderAll;
window.switchTab=selectiveSwitchTab;
try{
 if("PerformanceObserver" in window){
  const longTaskObserver=new PerformanceObserver(list=>{counters.longTasks+=list.getEntries().length;});
  longTaskObserver.observe({type:"longtask",buffered:true});
 }
}catch(_){}
window.__cphGuidePerfRuntimeV1=perfApi;
window.__guidePerf=perfApi;
document.documentElement.dataset.guidePerfRuntime="v1";
if(perfApi.logging)console.info("[guide-perf] runtime v1 actif",perfApi.report());
})();
