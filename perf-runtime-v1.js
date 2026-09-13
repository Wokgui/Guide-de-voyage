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
 restoreRememberedDetails:typeof window.restoreRememberedDetails==="function"?window.restoreRememberedDetails:null
};

if(!originals.renderAll||!originals.switchTab||!originals.renderProgramme){return;}

const dirty={programme:false,carte:false,suivi:false,sejour:false};
const samples={renderAll:[],programme:[],carte:[],suivi:[],sejour:[],switchTab:[],polish:[]};
const counters={renderAll:0,programme:0,carte:0,suivi:0,sejour:0,switchTab:0,polish:0,longTasks:0};
const MAX_SAMPLES=600;
let renderDepth=0;
let polishQueued=false;
let lastActive=activeTab();

function now(){return performance&&typeof performance.now==="function"?performance.now():Date.now();}
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
function markDataPanelsDirty(except){
 ["programme","carte","suivi"].forEach(name=>{dirty[name]=name!==except});
}
function panelRoot(name){return document.getElementById(name)||document;}

function runPolishers(name){
 if(polishQueued)return;
 polishQueued=true;
 requestAnimationFrame(()=>{
  polishQueued=false;
  const t0=now();
  try{
   if(typeof window.__cphHeaderPolish==="function")window.__cphHeaderPolish(name);
   if((name==="programme"||name==="carte")&&typeof window.__cphPatchPolish==="function")window.__cphPatchPolish(name);
   const ui=window.__cphUiFixesStableV30;
   if(ui&&typeof ui.refresh==="function")ui.refresh(name);
  }catch(err){console.warn("[guide-perf] polish",err);}
  remember("polish",now()-t0);
 });
}

function renderPanel(name,reason){
 const t0=now();
 renderDepth++;
 try{
  if(name==="programme"){
   originals.renderProgramme();
  }else if(name==="suivi"){
   if(originals.renderReservations)originals.renderReservations();
   if(originals.renderTrackingLists)originals.renderTrackingLists();
   if(originals.adaptiveAll&&originals.updateStats)originals.updateStats(originals.adaptiveAll());
  }else if(name==="carte"){
   if(originals.renderMap)originals.renderMap();
   if(originals.adaptiveAll&&originals.updateStats)originals.updateStats(originals.adaptiveAll());
  }else if(originals.adaptiveAll&&originals.updateStats){
   originals.updateStats(originals.adaptiveAll());
  }
  if(originals.restoreRememberedDetails){
   const root=panelRoot(name);
   if(root&&root!==document)originals.restoreRememberedDetails(root);
  }
  dirty[name]=false;
 }finally{
  renderDepth--;
 }
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

function selectiveSwitchTab(name){
 const t0=now();
 const before=activeTab();
 originals.switchTab(name);
 lastActive=name;
 if(dirty[name])renderPanel(name,"open");
 else runPolishers(name);
 remember("switchTab",now()-t0);
 if(perfApi.logging&&before!==name&&samples.switchTab.at(-1)>24)console.info(`[guide-perf] tab ${before} → ${name}: ${samples.switchTab.at(-1).toFixed(1)} ms`);
}

window.renderAll=selectiveRenderAll;
window.switchTab=selectiveSwitchTab;

try{
 if("PerformanceObserver" in window){
  const longTaskObserver=new PerformanceObserver(list=>{counters.longTasks+=list.getEntries().length;});
  longTaskObserver.observe({type:"longtask",buffered:true});
 }
}catch(_){}

const perfApi={
 version:"1.0.0",
 logging:new URLSearchParams(location.search).has("perf")||localStorage.getItem("cphGuidePerfLogs")==="1",
 dirty,
 counters,
 samples,
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

window.__cphGuidePerfRuntimeV1=perfApi;
window.__guidePerf=perfApi;
document.documentElement.dataset.guidePerfRuntime="v1";
if(perfApi.logging)console.info("[guide-perf] runtime v1 actif",perfApi.report());
})();
