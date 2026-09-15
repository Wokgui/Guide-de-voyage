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

assert.match(css,/v367 — premier rendu stable et commandes simplifiées/,'la couche de stabilité v367 doit exister');
assert.match(css,/v368 — suppression des derniers écarts de premier affichage/,'la couche corrective v368 doit exister');
assert.match(css,/html body #programme \.action-grid\.status\.actions,[\s\S]*?grid-auto-rows:56px!important/,'les deux rangées d’actions doivent avoir leur hauteur finale avant le JS');
assert.match(css,/html body #programme \.action-grid\.status\.actions>button,[\s\S]*?height:56px!important;[\s\S]*?max-height:56px!important/,'les six actions doivent partager un gabarit fixe');
assert.match(css,/\.done\[data-s="visited"\]::after\{content:"Visité"\}/,'Visité doit être rendu sans icône');
assert.match(css,/\.todo\[data-s="todo"\]::after\{content:"À visiter"\}/,'À visiter doit être rendu sans icône');
assert.match(css,/\.aside-point::after\{content:"Mettre de côté"\}/,'Mettre de côté doit être rendu sans icône');
assert.match(css,/\.here-now::after\{content:"J’y suis\\A maintenant"\}/,'J’y suis maintenant doit être rendu sans icône');
assert.match(css,/\.restore-original-time::after\{content:"Rétablir l’heure\\A d’origine"\}/,'Rétablir l’heure d’origine doit être rendu sans icône');
assert.match(css,/\.go-now::after\{content:"J’y vais\\A maintenant"\}/,'J’y vais maintenant doit être rendu sans icône');
assert.match(css,/#programme#programme \.visit-now-actions>\.button \.cph-now-icon,[\s\S]*?display:none!important/,'les anciennes icônes d’action doivent rester supprimées malgré les anciennes règles important');

assert.match(css,/html body #programme \.day-departure,[\s\S]*?\.day-departure\.cph-departure-visible\{[\s\S]*?display:none!important/,'aucune tuile Départ prévu/réel ne doit être peinte');
assert.match(header,/function removeActualDepartureTile\(\)[\s\S]*?Départ réel[\s\S]*?tile\.remove\(\)/,'Départ réel doit aussi être supprimé du DOM');
assert.match(header,/function normalizeNowActionButtons\(\)[\s\S]*?\.here-now[\s\S]*?\.restore-original-time[\s\S]*?\.go-now/,'les trois actions temporelles restent fonctionnellement normalisées ensemble');

assert.match(header,/const VISIT_HELPER_PREFIXES=\[[\s\S]*?Le point est inséré chronologiquement[\s\S]*?Le reste de la journée est recalculé[\s\S]*?Durée en minutes/,'les trois sous-textes demandés doivent être identifiés');
assert.match(header,/function removeVisitHelperTexts\(\)[\s\S]*?isVisitHelperText\(text\)\)element\.remove\(\)/,'les sous-textes doivent être retirés de toutes les visites rendues');
assert.match(header,/function refresh\(\)[\s\S]*?removeVisitHelperTexts\(\)/,'le nettoyage des sous-textes doit être rejoué après chaque rendu');

assert.match(header,/function scheduleFieldElements\(root,text\)[\s\S]*?root\.querySelectorAll\("label"\)[\s\S]*?startsWith\(`\$\{text\} `\)/,'les labels contenant leur contrôle doivent être reconnus, y compris sur les nouveaux événements');
assert.match(header,/function centerScheduleEditorFields\(\)[\s\S]*?\["Heure souhaitée","Durée prévue","Jour de visite"\][\s\S]*?scheduleFieldElements\(root,text\)\.forEach/,'les trois titres de toutes les visites doivent être traités');
assert.match(css,/\.cph-editor-title-centered\{[\s\S]*?text-align:center!important/,'les titres de l’éditeur doivent être centrés');
assert.match(css,/\.visit-details label:has\(select\)\{[\s\S]*?text-align:center!important/,'Jour de visite doit être centré même avant le passage du JavaScript');
assert.match(css,/html body #programme \.day-editor select,[\s\S]*?appearance:none!important[\s\S]*?text-align-last:center!important/,'Jour de visite doit ignorer optiquement la flèche native');
assert.match(css,/html body #programme \.time-editor input\.point-time,[\s\S]*?-webkit-appearance:none!important;[\s\S]*?appearance:none!important/,'Heure souhaitée doit neutraliser la seconde flèche native');
assert.match(css,/html body #programme \.time-editor input\.point-time,[\s\S]*?padding-left:34px!important;[\s\S]*?padding-right:34px!important;[\s\S]*?text-align:center!important/,'Heure souhaitée doit avoir des marges symétriques autour de sa valeur');
assert.match(css,/input\[type="time"\]::-webkit-calendar-picker-indicator\{[\s\S]*?position:absolute!important;[\s\S]*?opacity:0!important/,'l’indicateur de l’heure doit rester cliquable sans décaler la valeur');
assert.match(css,/\.day-editor>\.apply-day\{[\s\S]*?width:min\(210px,68%\)!important;[\s\S]*?margin-left:auto!important/,'Changer de jour doit être plus étroit et centré');

assert.match(header,/function normalizeDurationEditors\(\)[\s\S]*?scheduleFieldElements\(root,"Durée prévue"\)\.forEach/,'tous les éditeurs de durée doivent être normalisés');
assert.match(header,/title\.classList\.add\("cph-duration-title"\)/,'le titre Durée prévue doit avoir un ciblage dédié');
assert.match(header,/unit\.textContent="minutes"/,'le mot minutes doit être ajouté à droite du champ numérique');
assert.match(header,/editor\.insertBefore\(unit,apply\)/,'minutes doit précéder directement Appliquer dans la rangée de durée');
assert.match(css,/\.duration-editor\.cph-duration-editor\{[\s\S]*?grid-template-columns:88px auto auto!important;[\s\S]*?justify-content:center!important/,'la rangée durée doit être compacte et centrée');
assert.match(css,/\.cph-duration-title\{[\s\S]*?text-align:center!important/,'la mention Durée prévue doit être centrée');
assert.match(css,/\.cph-duration-control\{[\s\S]*?width:88px!important;[\s\S]*?text-align:center!important/,'le champ Durée prévue doit être plus étroit et centré');
assert.match(css,/\.duration-editor\.cph-duration-editor>\.cph-duration-unit\{[\s\S]*?height:var\(--cph-duration-control-height,44px\)!important/,'minutes doit être aligné verticalement sur le champ');
assert.match(css,/\.duration-editor\.cph-duration-editor>\.cph-duration-apply\{[\s\S]*?height:var\(--cph-duration-control-height,44px\)!important/,'Appliquer doit avoir exactement la hauteur du champ Durée prévue');

assert.match(css,/\.visit-expanded \.warning-box\{[\s\S]*?width:fit-content!important;[\s\S]*?margin:8px auto!important;[\s\S]*?text-align:center!important/,'les alertes d’horaires doivent être compactes et centrées');
assert.match(css,/summary\.cph-section-summary\{[\s\S]*?text-align:center!important/,'les en-têtes Horaire et Notes doivent garder un axe central fixe');
assert.match(css,/\.cph-section-title>span:first-child\{[\s\S]*?right:calc\(100% \+ 2px\)!important/,'l’icône des en-têtes doit être rapprochée sans déplacer le texte');
assert.match(css,/\.cph-section-title>span:last-child\{[\s\S]*?text-align:center!important/,'le texte des en-têtes doit être réellement centré');
assert.match(css,/\.visit-details\[open\] \.visit-summary \.summary-title-row\{[\s\S]*?grid-template-columns:24px minmax\(0,1fr\) auto minmax\(0,1fr\)!important/,'le titre d’une carte ouverte doit reprendre la grille des métadonnées');
assert.match(css,/\.visit-details\[open\] \.visit-summary \.summary-title\{[\s\S]*?grid-column:2!important/,'le nom doit être sur le même axe que la durée de visite');
assert.match(css,/#programme#programme \.day-banner\{[\s\S]*?padding-right:58px!important/,'la place de la flèche de journée doit être réservée avant son insertion');
assert.match(css,/#programme#programme \.day-banner>\.cph-day-toggle\{[\s\S]*?position:absolute!important;[\s\S]*?right:12px!important/,'la flèche de journée doit rester hors flux et ne pas redimensionner le bandeau');

assert.match(header,/function ensureMissingPlacePhotos\(\)[\s\S]*?#programme \.visit-summary[\s\S]*?visit-summary-thumb cph-place-photo-fallback cph-generated-place-photo/,'une visite sans aucune photo doit recevoir une miniature de remplacement');
assert.match(header,/function installPlaceImageFallbacks\(\)[\s\S]*?ensureMissingPlacePhotos\(\)[\s\S]*?addEventListener\("error",fallback,\{once:true\}\)/,'les photos absentes et cassées doivent être traitées ensemble');
assert.match(header,/function placeFallbackDataUrl\(name\)[\s\S]*?croisi\|canal\|bateau[\s\S]*?data:image\/svg\+xml/,'le repli doit être local et représenter notamment les visites de canal');
assert.match(header,/placeFallbackDataUrl\(placeNameForImage\(img\)\)/,'le visuel de repli doit reprendre le nom du lieu');
assert.match(header,/function refresh\(\)[\s\S]*?installPlaceImageFallbacks\(\)/,'les replis photo doivent être installés sur chaque nouveau rendu');
assert.match(css,/\.visit-summary-thumb\.cph-generated-place-photo\{[\s\S]*?object-fit:cover!important/,'la miniature générée doit conserver le cadrage des vraies photos');

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

assert.match(sw,/copenhague-v358-static-v56/,'le cache statique doit être renouvelé pour la v368');
assert.match(sw,/\/interaction-layout-v358\.css\?v=358/,'la feuille v358 doit être précachée');

console.log(JSON.stringify({ok:true,departure:'never-painted',actions:'iconless-fixed-first-paint-v368',editor:'single-time-arrow-centered',dayButton:'compact',warnings:'compact-centered',sections:'true-center-tight-icon',openTitle:'visit-duration-axis',dayBanner:'fixed-toggle-slot',photos:'missing-and-broken-local-fallback',cascade:'clicked-point-first',cache:'v56'},null,2));
