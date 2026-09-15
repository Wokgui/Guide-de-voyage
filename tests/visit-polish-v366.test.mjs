import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const polish=fs.readFileSync(new URL('../visit-polish-v366.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../interaction-layout-v358.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

new vm.Script(polish,{filename:'visit-polish-v366.js'});

assert.match(polish,/Horaire, durée et organisation/,'le panneau horaire doit être ciblé');
assert.match(polish,/spec\.key==="notes"/,'le panneau Notes doit être ciblé');
assert.match(polish,/cph-section-arrow/,'les panneaux doivent utiliser une flèche dédiée à droite');
assert.match(polish,/summary\.cph-section-summary::marker[\s\S]*?content:""!important/,'le marqueur natif de summary doit être supprimé');
assert.match(polish,/summary\.cph-section-summary::-webkit-details-marker[\s\S]*?display:none!important/,'le marqueur WebKit de summary doit être supprimé');
assert.match(polish,/summary\.cph-section-summary::before,[\s\S]*?summary\.cph-section-summary::after[\s\S]*?display:none!important/,'les anciennes flèches pseudo-éléments doivent être supprimées');
assert.match(polish,/\.cph-section-title\{[\s\S]*?left:50%!important;[\s\S]*?transform:translate\(-50%,-50%\)!important/,'titre et icône doivent garder une base centrée indépendamment de la flèche');
assert.match(css,/html body #programme \.cph-section-title>span:first-child\{[\s\S]*?right:calc\(100% \+ 7px\)!important/,'l’icône doit être accolée à gauche sans décaler le texte');
assert.match(css,/html body #programme \.cph-section-title>span:last-child\{[\s\S]*?text-align:center!important/,'le texte Horaire/Notes doit être centré sur l’axe de la tuile');
assert.match(polish,/duration-editor\.cph-duration-editor::before[\s\S]*?content:"Durée prévue"[\s\S]*?grid-column:1\/-1!important/,'Durée prévue doit être centrée sur toute la tuile');
assert.match(polish,/cph-duration-field[\s\S]*?grid-row:2!important;[\s\S]*?font-size:0!important/,'l’ancien libellé de durée ne doit pas rester décalé dans la première colonne');
assert.match(polish,/text-align:justify!important/,'le contenu des notes doit être justifié');
assert.match(polish,/querySelectorAll\("#programme \.day-departure"\).*?remove/s,'les tuiles Départ prévu/réel doivent être supprimées');
assert.match(css,/html body #programme \.day-departure,[\s\S]*?display:none!important/,'les tuiles de départ doivent être cachées avant le premier rendu JS');
assert.doesNotMatch(css,/day-departure\.cph-departure-visible\{\s*display:flex!important/,'aucune classe ne doit pouvoir réafficher une tuile de départ');
assert.match(polish,/className="cph-day-toggle"/,'chaque journée doit recevoir une flèche de dépliage/repliage');
assert.match(polish,/cph-day-body-collapsed/,'la flèche doit réellement masquer ou réafficher le contenu de la journée');
assert.match(sw,/copenhague-v358-static-v55/,'le cache doit être renouvelé');
assert.match(sw,/visit-polish-v366\.js\?v=366/,'le correctif doit être précaché');
assert.match(sw,/enhancedHeader\(request\)/,'le correctif doit être concaténé au script principal');

console.log(JSON.stringify({ok:true,sections:'single-right-arrow-true-centered',notes:'centered-and-justified',duration:'full-tile-centered',departure:'hidden-before-paint',days:'toggle-v366',cache:'v55'},null,2));
