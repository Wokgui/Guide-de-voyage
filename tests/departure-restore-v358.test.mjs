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

assert.match(css,/#programme \.visit-now-actions\{[\s\S]*?grid-auto-rows:66px!important/,'la rangée des actions temporelles doit imposer 66 px');
assert.match(css,/#programme \.visit-now-actions>\.button\{[\s\S]*?height:66px!important;[\s\S]*?max-height:66px!important/,'les trois actions temporelles doivent avoir exactement la même hauteur');
assert.match(css,/#programme \.visit-now-actions>\.button\{[\s\S]*?grid-template-columns:1fr!important;[\s\S]*?grid-template-rows:17px 24px!important/,'les icônes et libellés doivent être empilés verticalement');
assert.match(css,/\.cph-now-icon svg\{[\s\S]*?width:17px!important;[\s\S]*?height:17px!important/,'les trois icônes doivent être compactes et de même taille');
assert.match(css,/\.cph-now-label\{[\s\S]*?font-size:10\.5px!important/,'la taille de police des trois libellés doit être uniforme et compacte');
assert.match(css,/@media\(max-width:380px\)[\s\S]*?\.cph-now-label\{[\s\S]*?font-size:9\.6px!important/,'la police doit encore s’adapter aux petits écrans');
assert.match(css,/\.visit-now-actions>\.restore-original-time\{[\s\S]*?row-gap:6px!important/,'Rétablir doit conserver un espace suffisant sous son icône');

assert.match(css,/#programme \.day-banner \.day-departure\{[\s\S]*?display:none!important/,'les départs doivent être invisibles dès le premier paint');
assert.match(css,/\.day-departure\.cph-departure-visible\{[\s\S]*?display:flex!important/,'seul un départ validé doit être réaffiché');
assert.match(header,/function removeActualDepartureTile\(\)[\s\S]*?Départ réel[\s\S]*?tile\.remove\(\)[\s\S]*?cph-departure-visible/,'Départ réel doit être supprimé avant de révéler les départs prévus');
assert.match(header,/function normalizeNowActionButtons\(\)[\s\S]*?\.here-now[\s\S]*?\.restore-original-time[\s\S]*?\.go-now/,'les trois boutons temporels doivent être normalisés ensemble');
assert.match(header,/cph-now-icon/,'les actions temporelles doivent utiliser une icône structurée');
assert.match(header,/cph-now-label/,'les actions temporelles doivent utiliser un libellé structuré');

assert.match(header,/const VISIT_HELPER_PREFIXES=\[[\s\S]*?Le point est inséré chronologiquement[\s\S]*?Le reste de la journée est recalculé[\s\S]*?Durée en minutes/,'les trois sous-textes demandés doivent être identifiés');
assert.match(header,/function removeVisitHelperTexts\(\)[\s\S]*?isVisitHelperText\(text\)\)element\.remove\(\)/,'les sous-textes doivent être retirés de toutes les visites rendues');
assert.match(header,/function refresh\(\)[\s\S]*?removeVisitHelperTexts\(\)/,'le nettoyage des sous-textes doit être rejoué après chaque rendu');

assert.match(header,/function scheduleFieldElements\(root,text\)[\s\S]*?root\.querySelectorAll\("label"\)[\s\S]*?startsWith\(`\$\{text\} `\)/,'les labels contenant leur contrôle doivent être reconnus, y compris sur les nouveaux événements');
assert.match(header,/function centerScheduleEditorFields\(\)[\s\S]*?\["Heure souhaitée","Durée prévue","Jour de visite"\][\s\S]*?scheduleFieldElements\(root,text\)\.forEach/,'les trois titres de toutes les visites doivent être traités');
assert.match(css,/\.cph-editor-title-centered\{[\s\S]*?text-align:center!important/,'les titres de l’éditeur doivent être centrés');
assert.match(css,/\.visit-details label:has\(select\)\{[\s\S]*?text-align:center!important/,'Jour de visite doit être centré même avant le passage du JavaScript');
assert.match(css,/\.visit-details label:has\(select\) select\{[\s\S]*?width:min\(150px,100%\)!important;[\s\S]*?margin-left:auto!important/,'le sélecteur de jour doit être compact et centré dès le premier rendu');
assert.match(css,/\.duration-editor label:has\(input\[type="number"\]\)[\s\S]*?text-align:center!important/,'Durée prévue doit être centrée dès le premier rendu');
assert.match(css,/\.time-editor \.cph-time-control-centered\{[\s\S]*?width:min\(180px,100%\)!important;[\s\S]*?margin-left:auto!important;[\s\S]*?text-align:center!important/,'le contrôle Heure souhaitée doit être réellement centré horizontalement');
assert.match(header,/text==="Jour de visite"[\s\S]*?cph-day-control-centered/,'le sélecteur Jour de visite doit être marqué sur toutes les visites');
assert.match(css,/\.cph-day-control-centered\{[\s\S]*?width:min\(150px,100%\)!important;[\s\S]*?margin-left:auto!important;[\s\S]*?text-align:center!important/,'le sélecteur Jour de visite doit rester compact et centré après normalisation');

assert.match(header,/function normalizeDurationEditors\(\)[\s\S]*?scheduleFieldElements\(root,"Durée prévue"\)\.forEach/,'tous les éditeurs de durée doivent être normalisés');
assert.match(header,/title\.classList\.add\("cph-duration-title"\)/,'le titre Durée prévue doit avoir un ciblage dédié');
assert.match(header,/unit\.textContent="minutes"/,'le mot minutes doit être ajouté à droite du champ numérique');
assert.match(header,/editor\.insertBefore\(unit,apply\)/,'minutes doit précéder directement Appliquer dans la rangée de durée');
assert.match(css,/\.duration-editor\.cph-duration-editor\{[\s\S]*?grid-template-columns:88px auto auto!important;[\s\S]*?justify-content:center!important/,'la rangée durée doit être compacte et centrée');
assert.match(css,/\.cph-duration-title\{[\s\S]*?text-align:center!important/,'la mention Durée prévue doit être centrée');
assert.match(css,/\.cph-duration-control\{[\s\S]*?width:88px!important;[\s\S]*?text-align:center!important/,'le champ Durée prévue doit être plus étroit et centré');
assert.match(css,/\.duration-editor\.cph-duration-editor>\.cph-duration-unit\{[\s\S]*?height:var\(--cph-duration-control-height,44px\)!important/,'minutes doit être aligné verticalement sur le champ');
assert.match(css,/\.duration-editor\.cph-duration-editor>\.cph-duration-apply\{[\s\S]*?height:var\(--cph-duration-control-height,44px\)!important/,'Appliquer doit avoir exactement la hauteur du champ Durée prévue');

assert.match(header,/const COMPASS_ICON=.*?<circle[\s\S]*?<path/,'À visiter doit utiliser une vraie icône de boussole');
assert.match(header,/function normalizeStatusButtons\(\)[\s\S]*?À visiter[\s\S]*?COMPASS_ICON/,'le bouton À visiter doit recevoir la nouvelle icône');
assert.match(css,/\.cph-status-icon svg\{[\s\S]*?stroke:currentColor!important/,'la boussole doit suivre le style du bouton');
assert.match(header,/function normalizeStatusButtons\(\)[\s\S]*?Mettre de côté[\s\S]*?cph-aside-icon[\s\S]*?cph-aside-label/,'Mettre de côté doit conserver sa structure alignée');
assert.match(css,/\.cph-status-icon,[\s\S]*?\.cph-aside-icon\{[\s\S]*?align-items:center!important;[\s\S]*?justify-content:center!important/,'les icônes de statut doivent rester centrées verticalement');
assert.match(css,/\.cph-status-label,[\s\S]*?\.cph-aside-label\{[\s\S]*?justify-items:center!important/,'les libellés de statut doivent rester centrés');

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

assert.match(sw,/copenhague-v358-static-v51/,'le cache statique doit rester cohérent');
assert.match(sw,/\/interaction-layout-v358\.css\?v=358/,'la feuille v358 doit être précachée');

console.log(JSON.stringify({ok:true,departure:'no-first-paint-actual',actions:'uniform-66px-compact-v361',editor:'first-paint-centered-v365',photos:'missing-and-broken-local-fallback',cascade:'clicked-point-first'},null,2));
