import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../section-history-v1.js',import.meta.url),'utf8');
new vm.Script(source,{filename:'section-history-v1.js'});

const marker='/* v352 — garde d’hydratation';
const start=source.indexOf(marker);
assert.ok(start>=0,'la garde de rendu v352 doit être présente');
const guardSource=source.slice(start);
assert.match(guardSource,/remainingDuplicateSkips:4/,'quatre rerendus identiques de démarrage doivent pouvoir être absorbés');
assert.doesNotMatch(guardSource,/setTimeout\s*\(/,'la correction ne doit pas masquer le problème avec un délai');

let heavyRenders=0;
const sandbox={
 console,
 state:{items:{a:{status:'todo'}},stayInfo:{}},
 JSON,Object,Array,String,Number,Boolean,RegExp,Math,Date
};
sandbox.window=sandbox;
sandbox.renderAll=()=>{heavyRenders++;return heavyRenders;};
vm.createContext(sandbox);
vm.runInContext(guardSource,sandbox,{filename:'startup-render-guard.js'});

for(let i=0;i<4;i++)sandbox.renderAll();
assert.equal(heavyRenders,0,'les quatre émissions identiques de synchronisation ne doivent pas reconstruire la page');
assert.equal(sandbox.__cphStartupRenderGuardV1.stats.skipped,4);

sandbox.state.items.a.status='visited';
sandbox.renderAll();
assert.equal(heavyRenders,1,'une vraie modification de données doit toujours provoquer le rendu');
assert.equal(sandbox.__cphStartupRenderGuardV1.stats.rendered,1);

sandbox.state.items.a.status='missed';
sandbox.__cphStartupRenderGuardV1.force();
assert.equal(heavyRenders,2,'le rendu forcé doit rester disponible');

console.log(JSON.stringify({ok:true,heavyRenders,stats:sandbox.__cphStartupRenderGuardV1.stats},null,2));
