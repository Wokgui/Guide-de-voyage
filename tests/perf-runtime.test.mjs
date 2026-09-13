import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../day-style-v1.js',import.meta.url),'utf8');
new vm.Script(source,{filename:'day-style-v1.js'});

assert.equal(source.includes('new MutationObserver'),false,'day-style-v1.js ne doit plus surveiller le DOM en continu');
assert.equal(source.includes('[150,500,1200,2500]'),false,'les rappels différés historiques ne doivent pas revenir');
assert.match(source,/function selectiveRenderAll\(\)/,'le rendu sélectif doit être installé');
assert.match(source,/async stress\(cycles=300\)/,'le stress test 300 cycles doit rester disponible');

let active='programme';
const calls={programme:0,reservations:0,tracking:0,map:0,stats:0,restore:0,switchTab:0,legacyRenderAll:0};
const panels=new Map();
const makePanel=id=>({id,querySelectorAll(){return[];}});
for(const id of ['programme','carte','suivi','sejour'])panels.set(id,makePanel(id));

const document={
 readyState:'complete',
 documentElement:{dataset:{}},
 head:{appendChild(node){node.parentNode=this;return node;}},
 getElementById(id){return panels.get(id)||null;},
 createElement(tag){return {tagName:String(tag).toUpperCase(),id:'',textContent:'',parentNode:null,remove(){},querySelectorAll(){return[];}};},
 querySelector(selector){
  if(selector==='.panel.active')return panels.get(active);
  if(selector==='.tab.active')return {dataset:{tab:active}};
  return null;
 },
 querySelectorAll(){return[];},
 addEventListener(){}
};

const localStorage={getItem(){return null;},setItem(){}};
const sandbox={
 console,
 document,
 localStorage,
 location:{search:''},
 URLSearchParams,
 performance:{now:()=>Number(process.hrtime.bigint())/1e6},
 setTimeout,
 clearTimeout,
 requestAnimationFrame(cb){cb(0);return 1;},
 cancelAnimationFrame(){},
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
sandbox.window.switchTab=name=>{calls.switchTab++;active=name;};
sandbox.window.renderProgramme=()=>{calls.programme++;};
sandbox.window.renderReservations=()=>{calls.reservations++;};
sandbox.window.renderTrackingLists=()=>{calls.tracking++;};
sandbox.window.renderMap=()=>{calls.map++;};
sandbox.window.adaptiveAll=()=>({});
sandbox.window.updateStats=()=>{calls.stats++;};
sandbox.window.restoreRememberedDetails=()=>{calls.restore++;};

vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'day-style-v1.js'});

assert.equal(typeof sandbox.__guidePerf,'object','API de mesure absente');
assert.equal(typeof sandbox.renderAll,'function');
assert.equal(typeof sandbox.switchTab,'function');

sandbox.renderAll();
assert.equal(calls.programme,1,'Programme doit être le seul panneau lourd rendu quand il est actif');
assert.equal(calls.reservations,0);
assert.equal(calls.tracking,0);
assert.equal(calls.map,0);
assert.equal(sandbox.__guidePerf.dirty.suivi,true);
assert.equal(sandbox.__guidePerf.dirty.carte,true);

sandbox.switchTab('suivi');
assert.equal(active,'suivi');
assert.equal(calls.reservations,1,'Suivi doit se rafraîchir à sa première ouverture après invalidation');
assert.equal(calls.tracking,1);
assert.equal(calls.programme,1);
assert.equal(calls.map,0);
assert.equal(sandbox.__guidePerf.dirty.suivi,false);

sandbox.switchTab('sejour');
assert.equal(active,'sejour');
assert.equal(calls.programme,1,'Un onglet statique ne doit pas reconstruire Programme');
assert.equal(calls.reservations,1,'Un onglet statique ne doit pas reconstruire Suivi');
assert.equal(calls.map,0,'Un onglet statique ne doit pas reconstruire Carte');

sandbox.__guidePerf.markDirty();
sandbox.switchTab('carte');
assert.equal(calls.map,1,'Carte doit se rafraîchir uniquement lorsqu’elle devient active et sale');
assert.equal(sandbox.__guidePerf.dirty.carte,false);

// Le stress part de Programme pour ne jamais ouvrir la carte et donc ne jamais déclencher
// de géolocalisation dans un vrai navigateur pendant ce test automatique.
sandbox.switchTab('programme');
sandbox.__guidePerf.reset();
const stress=await sandbox.__guidePerf.stress(300);
assert.equal(stress.cycles,300);
assert.equal(stress.switchTab.count,301,'300 cycles + retour à l’onglet initial attendus');
assert.equal(stress.longTasks,0,'le harnais Node ne doit générer aucun long task');
assert.ok(stress.programme.count>=99&&stress.programme.count<=101,'Programme doit être rendu environ un cycle sur trois');
assert.ok(stress.suivi.count>=99&&stress.suivi.count<=101,'Suivi doit être rendu environ un cycle sur trois');
assert.equal(stress.carte.count,0,'Le stress automatique ne doit pas ouvrir la carte/géolocalisation');
assert.equal(calls.legacyRenderAll,0,'Le rendu global historique ne doit plus être utilisé par le runtime sélectif');

console.log(JSON.stringify({ok:true,stress,finalCalls:calls},null,2));
