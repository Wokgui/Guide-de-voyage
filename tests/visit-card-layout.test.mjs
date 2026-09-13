import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const dayStyle=fs.readFileSync(new URL('../day-style-v1.js',import.meta.url),'utf8');
const uiFixes=fs.readFileSync(new URL('../ui-fixes-v7.js',import.meta.url),'utf8');

new vm.Script(dayStyle,{filename:'day-style-v1.js'});
new vm.Script(uiFixes,{filename:'ui-fixes-v7.js'});

assert.match(dayStyle,/v351 — la zone à droite de la photo/);
assert.match(dayStyle,/grid-template-columns:118px minmax\(0,1fr\)!important/,'la zone droite doit aller jusqu’au bord de la tuile');
assert.match(dayStyle,/"tools tools"\s+"action action"/,'les métadonnées et le bouton doivent occuper deux rangées distinctes');
assert.match(dayStyle,/\.go-now-summary\{[\s\S]*?position:static!important;[\s\S]*?transform:none!important;/,'J’y vais ne doit plus être déplacé au-dessus de sa rangée');
assert.match(dayStyle,/\.chevron\{[\s\S]*?position:absolute!important;/,'la flèche ne doit pas réduire la zone de centrage');

for(const className of ['summary-visit-duration summary-meta-item cph-summary-meta','summary-point-map summary-meta-item cph-summary-meta','summary-walk-duration summary-meta-item cph-summary-meta']){
 assert.ok(index.includes(className),`classe finale absente du rendu initial: ${className}`);
}
assert.match(index,/class="walk-shoe-svg"/,'la durée de marche doit utiliser la nouvelle icône chaussure');
assert.doesNotMatch(index,/class="summary-walk-duration summary-meta-item"[^\n]*<circle cx="13" cy="4\.5"/,'l’ancien bonhomme ne doit plus être rendu');
assert.match(index,/class="cph-reserved-one"/,'la réservation finale doit être rendue sans remplacement différé');

assert.match(uiFixes,/function schedule\(\)\{if\(scheduled\)return;scheduled=true;queueMicrotask\(polish\);\}/,'les reconstructions doivent être finalisées avant la prochaine peinture');
assert.doesNotMatch(uiFixes,/requestAnimationFrame\(\(\)=>setTimeout\(polish,30\)\)/,'aucun état intermédiaire de 30 ms ne doit rester visible');
assert.doesNotMatch(uiFixes,/\[150,500,1200\]/,'les repolissages retardés ne doivent plus déplacer l’interface après affichage');

console.log(JSON.stringify({ok:true,layout:'right-zone-two-rows',walkIcon:'shoe',polish:'microtask'},null,2));
