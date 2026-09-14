import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const shared=fs.readFileSync(new URL('../shared-sync.js',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../ui-fixes-v7.js',import.meta.url),'utf8');
const day=fs.readFileSync(new URL('../day-style-v1.js',import.meta.url),'utf8');

new vm.Script(shared,{filename:'shared-sync.js'});
new vm.Script(ui,{filename:'ui-fixes-v7.js'});
new vm.Script(day,{filename:'day-style-v1.js'});

assert.match(shared,/FORM_ONLY_REMOTE_KEYS=new Set\(\["globalNotes","stayInfo"\]\)/,'notes et séjour ne doivent pas reconstruire le Programme');
assert.match(shared,/function currentAtPath\(path\)/,'la synchronisation doit comparer la valeur existante avant mutation');
assert.match(shared,/if\(changed\)\{\s*if\(row\.is_deleted\)deleteAtPath/s,'une ligne identique ne doit pas muter l’état');
assert.match(shared,/if\(needsDataRender\)\{\s*if\(typeof renderDayButtons/s,'un changement formulaire seul ne doit pas appeler renderAll');

const comparableStart=shared.indexOf('const comparable=value=>');
const comparableEnd=shared.indexOf('const timestampValue=',comparableStart);
const blockStart=shared.indexOf('function pathSegments(path)');
const blockEnd=shared.indexOf('function reconcileCustomPoints()',blockStart);
assert.ok(comparableStart>=0&&comparableEnd>comparableStart&&blockStart>=0&&blockEnd>blockStart);
const comparableSource=shared.slice(comparableStart,comparableEnd);
const remoteSource=shared.slice(blockStart,blockEnd);

let persistCount=0;
const sandbox={
  state:{items:{a:{status:'todo',meta:{a:1,b:2}}},globalNotes:'',stayInfo:{}},
  SHARED_KEYS:['items','globalNotes','stayInfo'],
  FORBIDDEN_SEGMENTS:new Set(['__proto__','prototype','constructor']),
  decodeSegment:value=>String(value).replace(/~1/g,'/').replace(/~0/g,'~'),
  isPlainObject:value=>value!==null&&typeof value==='object'&&!Array.isArray(value),
  clone:value=>value===undefined?undefined:JSON.parse(JSON.stringify(value)),
  defaultForKey:key=>key==='globalNotes'?'':{},
  queue:{},pathClock:{},
  TRIP_ID:'trip',deviceId:'device-local',
  timestampValue:value=>{const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:0;},
  normalizedTimestamp:value=>{const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?new Date(parsed).toISOString():'';},
  persistClock(){persistCount++;},
  JSON,Object,Array,String,Number,Boolean,RegExp,Math,Date,Set
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(`${comparableSource}\n${remoteSource}\nglobalThis.__applyRemoteRow=applyRemoteRow;`,sandbox);

const t1='2026-09-14T07:00:00.000Z';
const identical={trip_id:'trip',path:'/items/a',value:{meta:{b:2,a:1},status:'todo'},device_id:'remote',client_updated_at:t1};
assert.equal(sandbox.__applyRemoteRow(identical,true),false,'même valeur, même avec ordre de clés différent : aucun rerendu');
assert.equal(sandbox.state.items.a.status,'todo');
assert.equal(sandbox.pathClock['/items/a'],t1,'l’horloge distante doit avancer même sans mutation visuelle');
assert.ok(persistCount>=1);

const t2='2026-09-14T07:01:00.000Z';
const changed={trip_id:'trip',path:'/items/a/status',value:'visited',device_id:'remote',client_updated_at:t2};
assert.equal(sandbox.__applyRemoteRow(changed,true),true,'une vraie modification doit être appliquée');
assert.equal(sandbox.state.items.a.status,'visited');

const missingDelete={trip_id:'trip',path:'/items/missing/status',is_deleted:true,device_id:'remote',client_updated_at:'2026-09-14T07:02:00.000Z'};
assert.equal(sandbox.__applyRemoteRow(missingDelete,true),false,'supprimer un chemin absent ne doit pas déclencher de rendu');
const defaultDelete={trip_id:'trip',path:'/globalNotes',is_deleted:true,device_id:'remote',client_updated_at:'2026-09-14T07:03:00.000Z'};
assert.equal(sandbox.__applyRemoteRow(defaultDelete,true),false,'supprimer une valeur déjà à sa valeur par défaut ne doit pas déclencher de rendu');

assert.match(ui,/window\[GLOBAL_KEY\]=\{\s*polish,\s*schedule,/s,'le post-traitement UI doit être exposé pour un appel synchrone');
const renderPos=day.indexOf('originals.renderProgramme(adapt||undefined);');
const finalizePos=day.indexOf('finalizeProgrammeDom();',renderPos);
const statsPos=day.indexOf('if(adapt&&originals.updateStats)',renderPos);
assert.ok(renderPos>=0&&finalizePos>renderPos&&statsPos>finalizePos,'le DOM final doit être appliqué immédiatement après renderProgramme');
const finalizerStart=day.indexOf('function finalizeProgrammeDom()');
const finalizerEnd=day.indexOf('function renderPanel',finalizerStart);
assert.doesNotMatch(day.slice(finalizerStart,finalizerEnd),/setTimeout|requestAnimationFrame/,'la finalisation synchrone ne doit pas attendre une frame');

console.log(JSON.stringify({ok:true,persistCount,status:sandbox.state.items.a.status},null,2));
