import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../day-style-v1.js',import.meta.url),'utf8');
new vm.Script(source,{filename:'day-style-v1.js'});

assert.equal(source.includes('new MutationObserver'),false,'day-style-v1.js ne doit plus surveiller le DOM en continu');
assert.equal(source.includes('[150,500,1200,2500]'),false,'les rappels différés historiques ne doivent pas revenir');
assert.match(source,/function selectiveRenderAll\(\)/,'le rendu sélectif doit être installé');
assert.match(source,/function applyTabState\(name\)/,'les onglets légers doivent être activés sans appeler le switch historique');
assert.match(source,/async stress\(cycles=300\)/,'le stress test 300 cycles doit rester disponible');
assert.match(source,/POLISH_PANELS=new Set\(\["programme","suivi"\]\)/,'le polish doit rester limité aux panneaux utiles');

let active='programme';
const calls={programme:0,reservations:0,tracking:0,map:0,stats:0,adaptive:0,notices:0,switchTab:0,legacyRenderAll:0};
const polishRoots={programme:0,carte:0,suivi:0,sejour:0};
const panels=new Map();
const ids=['programme','carte','suivi','sejour'];
const makePanel=id=>({
 id,
 classList:{toggle(name,on){if(name==='active'&&on)active=id;}},
 querySelectorAll(){polishRoots[id]++;return[];}
});
for(const id of ids)panels.set(id,makePanel(id));
const tabs=ids.map(id=>({dataset:{tab:id},classList:{toggle(){}}}));

const document={
 readyState:'complete',
 documentElement:{dataset:{}},
 body:{classList:{toggle(){}}},
 head:{appendChild(node){node.parentNode=this;return node;}},
 getElementById(id){return panels.get(id)||null;},
 createElement(tag){return {tagName:String(tag).toUpperCase(),id:'',textContent:'',parentNode:null,remove(){},querySelectorAll(){return[];}};},
 querySelector(selector){
  if(selector==='.panel.active')return panels.get(active);
  if(selector==='.tab.active')return tabs.find(x=>x.dataset.tab===active)||null;
  return null;
 },
 querySelectorAll(selector){
  if(selector==='.panel')return [...panels.values()];
  if(selector==='.tab')return tabs;
  return[];
 },
 addEventListener(){}
};

const localStorage={getItem(){return null;},setItem(){}};
let rafId=0;
const rafHandles=new Map();
function requestAnimationFrame(cb){
 const id=++rafId;
 const handle=setImmediate(()=>{rafHandles.delete(id);cb(0);});
 rafHandles.set(id,handle);
 return id;
}
function cancelAnimationFrame(id){
 const handle=rafHandles.get(id);
 if(handle){clearImmediate(handle);rafHandles.delete(id);}
}
const nextFrame=()=>new Promise(resolve=>setImmediate(resolve));

const sandbox={
 console,
 document,
 localStorage,
 location:{search:''},
 URLSearchParams,
 performance:{now:()=>Number(process.hrtime.bigint())/1e6},
 setTimeout,
 clearTimeout,
 requestAnimationFrame,
 cancelAnimationFrame,
 Promise,
 Math,
 Date,
 Array,
 Object,
 String,
 Number,
 Boolean,
 RegExp,
 JSON,
 Set,
 Map
};
sandbox.window=sandbox;
sandbox.window.renderAll=()=>{calls.legacyRenderAll++;};
sandbox.window.switchTab=name=>{
 calls.switchTab++;
 active=name;
 if(name==='carte'){
  sandbox.window.adaptiveAll();
  sandbox.window.updateStats({});
  sandbox.window.renderMap();
 }
};
sandbox.window.renderProgramme=()=>{calls.programme++;};
sandbox.window.renderReservations=()=>{calls.reservations++;};
sandbox.window.renderTrackingLists=()=>{calls.tracking++;};
sandbox.window.renderMap=()=>{calls.map++;};
sandbox.window.adaptiveAll=()=>{calls.adaptive++;return{};};
sandbox.window.updateStats=()=>{calls.stats++;};
sandbox.window.scheduleGuideRenderedNotice=()=>{calls.notices++;};

vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'day-style-v1.js'});

assert.equal(typeof sandbox.__guidePerf,'object','API de mesure absente');
assert.equal(sandbox.__guidePerf.version,'1.3.0');
assert.equal(typeof sandbox.renderAll,'function');
assert.equal(typeof sandbox.switchTab,'function');

sandbox.renderAll();
assert.equal(calls.programme,1,'Programme doit être le seul panneau lourd rendu quand il est actif');
assert.equal(calls.reservations,0);
assert.equal(calls.tracking,0);
assert.equal(calls.map,0);
assert.equal(calls.adaptive,1,'renderAll ne doit calculer le planning adaptatif qu’une fois');
assert.equal(calls.stats,1,'renderAll doit conserver la mise à jour des statistiques');
assert.equal(sandbox.__guidePerf.dirty.suivi,true);
assert.equal(sandbox.__guidePerf.dirty.carte,true);

sandbox.switchTab('suivi');
assert.equal(active,'suivi');
assert.equal(calls.reservations,1,'Suivi doit se rafraîchir à sa première ouverture après invalidation');
assert.equal(calls.tracking,1);
assert.equal(calls.programme,1);
assert.equal(calls.map,0);
assert.equal(calls.adaptive,2,'l’ouverture sale de Suivi ne doit calculer adaptiveAll qu’une fois');
assert.equal(calls.stats,2);
assert.equal(calls.switchTab,0,'Suivi ne doit plus appeler le switchTab historique');
assert.equal(sandbox.__guidePerf.dirty.suivi,false);

const beforeStaticAdaptive=calls.adaptive;
const beforeStaticStats=calls.stats;
sandbox.switchTab('sejour');
assert.equal(active,'sejour');
assert.equal(calls.programme,1,'Un onglet statique ne doit pas reconstruire Programme');
assert.equal(calls.reservations,1,'Un onglet statique ne doit pas reconstruire Suivi');
assert.equal(calls.map,0,'Un onglet statique ne doit pas reconstruire Carte');
assert.equal(calls.adaptive,beforeStaticAdaptive,'Séjour ne doit pas recalculer adaptiveAll lors d’un simple affichage');
assert.equal(calls.stats,beforeStaticStats,'Séjour ne doit pas recalculer les statistiques lors d’un simple affichage');
assert.equal(calls.switchTab,0,'Séjour ne doit plus appeler le switchTab historique');

sandbox.__guidePerf.markDirty();
sandbox.switchTab('carte');
assert.equal(calls.map,1,'Carte doit conserver son chemin historique pour l’initialisation Leaflet');
assert.equal(calls.switchTab,1,'seule Carte doit encore utiliser le switchTab historique');
assert.equal(sandbox.__guidePerf.dirty.carte,false);

await nextFrame();
Object.keys(polishRoots).forEach(k=>polishRoots[k]=0);
sandbox.__guidePerf.reset();
sandbox.switchTab('programme');
sandbox.switchTab('sejour');
sandbox.switchTab('suivi');
await nextFrame();
assert.equal(polishRoots.programme,0,'Programme ne doit pas être poli si Suivi devient la dernière cible utile de la frame');
assert.equal(polishRoots.suivi,1,'Suivi doit recevoir le polish coalescé de la frame');
assert.equal(polishRoots.sejour,0,'Séjour ne nécessite aucun polish DOM');
assert.equal(polishRoots.carte,0,'Carte ne nécessite aucun polish DOM');
assert.equal(sandbox.__guidePerf.report().polish.count,1,'une seule passe de polish est attendue pour la rafale');

sandbox.__guidePerf.reset();
for(let i=0;i<300;i++)sandbox.switchTab('sejour');
await nextFrame();
const staticBurst=sandbox.__guidePerf.report();
assert.equal(staticBurst.switchTab.count,300);
assert.equal(staticBurst.polish.count,0,'un onglet statique ne doit jamais déclencher le polish');

sandbox.__guidePerf.dirty.programme=false;
sandbox.__guidePerf.dirty.suivi=false;
const heavyBefore={programme:calls.programme,reservations:calls.reservations,tracking:calls.tracking,adaptive:calls.adaptive,stats:calls.stats,legacySwitch:calls.switchTab};
sandbox.__guidePerf.reset();
const cleanSequence=['programme','suivi','sejour'];
for(let i=0;i<300;i++)sandbox.switchTab(cleanSequence[i%cleanSequence.length]);
await nextFrame();
const cleanSwitches=sandbox.__guidePerf.report();
assert.equal(cleanSwitches.switchTab.count,300);
assert.equal(cleanSwitches.programme.count,0,'300 changements propres ne doivent pas reconstruire Programme');
assert.equal(cleanSwitches.suivi.count,0,'300 changements propres ne doivent pas reconstruire Suivi');
assert.equal(calls.programme,heavyBefore.programme);
assert.equal(calls.reservations,heavyBefore.reservations);
assert.equal(calls.tracking,heavyBefore.tracking);
assert.equal(calls.adaptive,heavyBefore.adaptive,'300 changements propres ne doivent lancer aucun adaptiveAll');
assert.equal(calls.stats,heavyBefore.stats,'300 changements propres ne doivent recalculer aucune statistique');
assert.equal(calls.switchTab,heavyBefore.legacySwitch,'300 changements Programme/Suivi/Séjour ne doivent pas appeler le switch historique');

sandbox.switchTab('programme');
await nextFrame();
sandbox.__guidePerf.reset();
const stress=await sandbox.__guidePerf.stress(300);
assert.equal(stress.cycles,300);
assert.equal(stress.switchTab.count,301,'300 cycles + retour à l’onglet initial attendus');
assert.equal(stress.longTasks,0,'le harnais Node ne doit générer aucun long task');
assert.ok(stress.programme.count>=99&&stress.programme.count<=101,'Programme doit être rendu environ un cycle sur trois sous invalidation forcée');
assert.ok(stress.suivi.count>=99&&stress.suivi.count<=101,'Suivi doit être rendu environ un cycle sur trois sous invalidation forcée');
assert.equal(stress.carte.count,0,'Le stress automatique ne doit pas ouvrir la carte/géolocalisation');
assert.ok(stress.polish.count<=13,'le polish doit être coalescé à environ une passe par lot de 25 cycles');
assert.equal(calls.legacyRenderAll,0,'Le rendu global historique ne doit plus être utilisé par le runtime sélectif');
assert.equal(calls.switchTab,1,'le switch historique ne doit avoir été utilisé que pour le test Carte');

console.log(JSON.stringify({ok:true,staticBurst,cleanSwitches,stress,polishRoots,finalCalls:calls},null,2));