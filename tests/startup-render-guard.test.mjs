import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../section-history-v1.js',import.meta.url),'utf8');
new vm.Script(source,{filename:'section-history-v1.js'});

const marker='/* v353 — rendu idempotent';
const start=source.indexOf(marker);
assert.ok(start>=0,'la déduplication de rendu v353 doit être présente');
const guardSource=source.slice(start);
assert.doesNotMatch(guardSource,/remainingDuplicateSkips/,'la correction ne doit plus dépendre d’un nombre arbitraire de rerendus');
assert.doesNotMatch(guardSource,/setTimeout\s*\(/,'la correction ne doit pas masquer le problème avec un délai');

let heavyRenders=0;
let activePanel='programme';
const sandbox={
 console,
 state:{items:{a:{status:'todo'}},stayInfo:{}},
 selectedDay:'Mardi',
 reopenOrderDay:null,
 document:{querySelector(selector){return selector==='.panel.active'?{id:activePanel}:null;}},
 JSON,Object,Array,String,Number,Boolean,RegExp,Math,Date
};
sandbox.window=sandbox;
sandbox.globalThis=sandbox;
sandbox.renderAll=()=>{heavyRenders++;return heavyRenders;};
vm.createContext(sandbox);
vm.runInContext(guardSource,sandbox,{filename:'render-dedupe-v353.js'});

for(let i=0;i<20;i++)sandbox.renderAll();
assert.equal(heavyRenders,0,'même vingt émissions identiques ne doivent pas reconstruire la page');
assert.equal(sandbox.__cphRenderDedupeV2.stats.skipped,20);

sandbox.state.items.a.status='visited';
sandbox.renderAll();
assert.equal(heavyRenders,1,'une vraie modification de données doit toujours provoquer le rendu');

sandbox.selectedDay='Mercredi';
sandbox.renderAll();
assert.equal(heavyRenders,2,'un changement de jour visible doit provoquer le rendu même si les données sont identiques');

activePanel='suivi';
sandbox.renderAll();
assert.equal(heavyRenders,3,'un changement d’onglet visible doit provoquer le rendu');

sandbox.__cphRenderDedupeV2.force();
assert.equal(heavyRenders,4,'le rendu forcé doit rester disponible');

console.log(JSON.stringify({ok:true,heavyRenders,stats:sandbox.__cphRenderDedupeV2.stats},null,2));
