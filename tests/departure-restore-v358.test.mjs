import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../interaction-layout-v358.css',import.meta.url),'utf8');
const header=fs.readFileSync(new URL('../header-prestige.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

new vm.Script(header,{filename:'header-prestige.js'});

const link='<link href="/interaction-layout-v358.css?v=358" rel="stylesheet"/>';
assert.ok(html.includes(link),'la mise en page v358 doit être chargée');
assert.ok(html.indexOf(link)<html.indexOf('</head>'),'la mise en page des boutons doit être connue avant <body>');
assert.match(html,/const effectiveDeparture=state\.starts\?\.\[day\]\|\|DAY_CONFIG\[day\]\.departure/,'le bandeau doit utiliser le départ effectif');
assert.match(html,/const departureLabel=state\.starts\?\.\[day\]\?"Départ réel":"Départ prévu"/,'le libellé doit refléter la présence d’un départ réel');
assert.doesNotMatch(html,/day-departure-label">Départ prévu<\/span><strong>\$\{DAY_CONFIG\[day\]\.departure\}/,'l’ancien bandeau figé ne doit plus être rendu');
assert.match(html,/class="time-editor-actions">[\s\S]*?class="button secondary apply-time"[\s\S]*?class="button secondary reset-time"/,'Rétablir doit suivre Appliquer dans un même groupe');
assert.match(html,/class="button secondary reset-time" type="button" \$\{state\.timeOverrides\[p\.id\]\?"":"disabled"\}>Rétablir/,'Rétablir doit rester visible et être désactivé sans modification');
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/,'les deux boutons d’édition doivent rester côte à côte');
assert.match(css,/@media\(max-width:420px\)[\s\S]*?\.time-editor-actions[\s\S]*?width:100%!important/,'le groupe d’édition doit occuper toute la largeur sur mobile');

assert.match(css,/#programme \.action-grid\.status\.actions,[\s\S]*?#programme \.visit-now-actions\{[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/,'les deux rangées d’actions doivent utiliser trois colonnes identiques');
assert.match(css,/#programme \.action-grid\.status\.actions>button,[\s\S]*?#programme \.visit-now-actions>\.button\{[\s\S]*?height:66px!important;[\s\S]*?min-height:66px!important/,'les six tuiles principales doivent mesurer 66 px de haut');
assert.match(header,/function hideActualDepartureTile\(\)[\s\S]*?===\"Départ réel\"/,'seule la tuile Départ réel doit être masquée');

const cascadeStart=header.indexOf('function cascadeFromClickedPoint');
const cascadeEnd=header.indexOf('function currentMinute',cascadeStart);
assert.ok(cascadeStart>=0&&cascadeEnd>cascadeStart,'le recalcul v359 doit exister');
const cascade=header.slice(cascadeStart,cascadeEnd);
assert.match(cascade,/const ordered=dayItems\(day\)\.slice\(\)/,'l’ordre affiché doit être capturé avant le recalcul');
assert.match(cascade,/state\.timeOverrides\[id\]=minToHm\(target\)/,'le premier événement doit recevoir directement la nouvelle heure');
assert.doesNotMatch(cascade,/reorderDayChronologically/,'aucun réordonnancement ne doit changer la cible avant la propagation');
assert.match(header,/window\.setPointHereNow=function\(id\)[\s\S]*?cascadeFromClickedPoint\(id,currentMinute\(\)\)/,'J’y suis maintenant doit utiliser le recalcul v359');
assert.match(header,/window\.goToPointNow=function\(id\)[\s\S]*?cascadeFromClickedPoint\(id,currentMinute\(\)\)/,'J’y vais maintenant doit utiliser le recalcul v359');
assert.match(header,/window\.restorePointOriginalTime=function\(id\)[\s\S]*?cascadeFromClickedPoint\(id,hmToMin\(original\)\)/,'Rétablir l’heure d’origine doit recalculer les événements suivants');

assert.match(sw,/copenhague-v358-static-v51/,'le cache statique doit rester cohérent');
assert.match(sw,/\/interaction-layout-v358\.css\?v=358/,'la feuille v358 doit être précachée');

console.log(JSON.stringify({ok:true,departure:'actual-hidden-only',actions:'three-columns-66px',cascade:'clicked-point-first'},null,2));
