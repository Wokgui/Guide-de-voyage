import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../interaction-layout-v358.css',import.meta.url),'utf8');
const refinement=fs.readFileSync(new URL('../visit-refinement-v369.css',import.meta.url),'utf8');
const sectionScroll=fs.readFileSync(new URL('../visit-section-scroll-v370.js',import.meta.url),'utf8');
const header=fs.readFileSync(new URL('../header-prestige.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

new vm.Script(header,{filename:'header-prestige.js'});
new vm.Script(sectionScroll,{filename:'visit-section-scroll-v370.js'});

const link='<link href="/interaction-layout-v358.css?v=358" rel="stylesheet"/>';
assert.ok(html.includes(link),'la mise en page v358 doit être chargée');
assert.ok(html.indexOf(link)<html.indexOf('</head>'),'la mise en page des boutons doit être connue avant <body>');
assert.match(html,/const effectiveDeparture=state\.starts\?\.\[day\]\|\|DAY_CONFIG\[day\]\.departure/,'le bandeau doit utiliser le départ effectif');
assert.match(html,/const departureLabel=state\.starts\?\.\[day\]\?"Départ réel":"Départ prévu"/,'le libellé doit refléter la présence d’un départ réel');
assert.doesNotMatch(html,/day-departure-label">Départ prévu<\/span><strong>\$\{DAY_CONFIG\[day\]\.departure\}/,'l’ancien bandeau figé ne doit plus être rendu');

assert.match(css,/v367 — premier rendu stable et commandes simplifiées/,'la couche de stabilité v367 doit exister');
assert.match(css,/v368 — suppression des derniers écarts de premier affichage/,'la couche corrective v368 doit exister');
assert.match(css,/html body #programme \.action-grid\.status\.actions,[\s\S]*?grid-auto-rows:56px!important/,'les deux rangées d’actions doivent avoir leur hauteur finale avant le JS');
assert.match(css,/\.here-now::after\{content:"J’y suis\\A maintenant"\}/,'J’y suis maintenant doit être rendu sans icône');
assert.match(css,/\.restore-original-time::after\{content:"Rétablir l’heure\\A d’origine"\}/,'Rétablir l’heure d’origine doit être rendu sans icône');
assert.match(css,/\.go-now::after\{content:"J’y vais\\A maintenant"\}/,'J’y vais maintenant doit être rendu sans icône');
assert.match(css,/#programme#programme \.visit-now-actions>\.button \.cph-now-icon,[\s\S]*?display:none!important/,'les anciennes icônes temporelles doivent rester supprimées');

assert.match(css,/html body #programme \.day-departure,[\s\S]*?\.day-departure\.cph-departure-visible\{[\s\S]*?display:none!important/,'aucune tuile Départ prévu/réel ne doit être peinte');
assert.match(header,/function removeActualDepartureTile\(\)[\s\S]*?Départ réel[\s\S]*?tile\.remove\(\)/,'Départ réel doit aussi être supprimé du DOM');

assert.match(css,/html body #programme \.time-editor input\.point-time,[\s\S]*?-webkit-appearance:none!important;[\s\S]*?appearance:none!important/,'Heure souhaitée doit neutraliser la seconde flèche native');
assert.match(css,/\.day-editor>\.apply-day\{[\s\S]*?width:min\(210px,68%\)!important/,'Changer de jour doit rester plus étroit et centré');

assert.match(refinement,/\.cph-section-title>span:first-child\{[\s\S]*?right:calc\(100% \+ 5px\)!important/,'Horaire et Notes doivent conserver exactement le même écart icône-titre');
assert.match(refinement,/font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif!important/,'Horaire et Notes doivent reprendre les icônes emoji classiques');
assert.match(refinement,/\.cph-section-title>span:first-child svg\{[\s\S]*?display:none!important/,'les icônes vectorielles intermédiaires doivent rester invisibles');
assert.match(refinement,/\.visit-details\[open\] \.visit-summary \.summary-title\{[\s\S]*?grid-column:2!important/,'le nom doit être sur l’axe de la durée de visite');
assert.match(refinement,/\.title-stars\{[\s\S]*?position:absolute!important/,'les étoiles ne doivent pas modifier cet axe');
assert.match(refinement,/\.day-banner::after\{[\s\S]*?content:"⌄"!important/,'la flèche de journée doit être visible dès le rendu du bandeau');
assert.match(refinement,/\.day-banner>\.cph-day-toggle svg\{[\s\S]*?visibility:hidden!important/,'la flèche ajoutée par JS ne doit pas produire une apparition tardive');

assert.match(sectionScroll,/document\.querySelectorAll\("#programme details"\)/,'le recalage doit concerner tous les onglets du programme');
assert.match(sectionScroll,/desiredSummaryTop\(\)[\s\S]*?stickyHeaderOffset\(\)\+12/,'le titre doit rester visible sous le bandeau sticky');
assert.match(sectionScroll,/details\.addEventListener\("toggle",\(\)=>scrollSectionHeader\(details\)\)/,'chaque ouverture ou fermeture doit recaler son titre');

assert.match(header,/function ensureMissingPlacePhotos\(\)[\s\S]*?#programme \.visit-summary[\s\S]*?visit-summary-thumb cph-place-photo-fallback cph-generated-place-photo/,'une visite sans photo doit recevoir une miniature de remplacement');
assert.match(header,/function installPlaceImageFallbacks\(\)[\s\S]*?ensureMissingPlacePhotos\(\)/,'les photos absentes et cassées doivent être traitées ensemble');

const cascadeStart=header.indexOf('function cascadeFromClickedPoint');
const cascadeEnd=header.indexOf('function currentMinute',cascadeStart);
assert.ok(cascadeStart>=0&&cascadeEnd>cascadeStart,'le recalcul v359 doit exister');
const cascade=header.slice(cascadeStart,cascadeEnd);
assert.match(cascade,/const ordered=dayItems\(day\)\.slice\(\)/,'l’ordre affiché doit être capturé avant le recalcul');
assert.match(cascade,/state\.timeOverrides\[id\]=minToHm\(target\)/,'le premier événement doit recevoir directement la nouvelle heure');
assert.doesNotMatch(cascade,/reorderDayChronologically/,'aucun réordonnancement ne doit changer la cible avant la propagation');

assert.match(sw,/copenhague-v358-static-v59/,'le cache statique doit être renouvelé pour la correction de scroll');
assert.match(sw,/visit-refinement-v369\.css\?v=369/,'la feuille de raffinement doit être précachée');
assert.match(sw,/visit-section-scroll-v370\.js\?v=370/,'le script de restauration des icônes et de recalage doit être précaché');
assert.match(sw,/enhancedInteractionStyle\(request\)/,'la feuille de raffinement doit être servie avec interaction-layout dès le head');

console.log(JSON.stringify({ok:true,departure:'never-painted',actions:'iconless',sections:'classic-icons-equal-5px',sectionScroll:'all-details-title-visible',openTitle:'duration-axis',dayBanner:'first-paint-arrow',cache:'v59'},null,2));
