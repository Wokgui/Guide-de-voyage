import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const polish=fs.readFileSync(new URL('../visit-polish-v366.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

new vm.Script(polish,{filename:'visit-polish-v366.js'});

assert.match(polish,/Horaire, durée et organisation/,'le panneau horaire doit être ciblé');
assert.match(polish,/spec\.key==="notes"/,'le panneau Notes doit être ciblé');
assert.match(polish,/cph-section-arrow/,'les panneaux doivent utiliser une flèche dédiée à droite');
assert.match(polish,/text-align:justify!important/,'le contenu des notes doit être justifié');
assert.match(polish,/querySelectorAll\("#programme \.day-departure"\).*?remove/s,'les tuiles Départ prévu/réel doivent être supprimées');
assert.match(polish,/className="cph-day-toggle"/,'chaque journée doit recevoir une flèche de dépliage/repliage');
assert.match(polish,/cph-day-body-collapsed/,'la flèche doit réellement masquer ou réafficher le contenu de la journée');
assert.match(sw,/copenhague-v358-static-v53/,'le cache doit être renouvelé');
assert.match(sw,/visit-polish-v366\.js\?v=366/,'le nouveau correctif doit être précaché');
assert.match(sw,/enhancedHeader\(request\)/,'le correctif doit être concaténé au script principal');

console.log(JSON.stringify({ok:true,sections:'centered-with-right-arrow',notes:'justified',departure:'removed',days:'toggle-v366'},null,2));
