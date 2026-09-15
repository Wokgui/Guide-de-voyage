import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const polish=fs.readFileSync(new URL('../visit-polish-v366.js',import.meta.url),'utf8');
const sectionScroll=fs.readFileSync(new URL('../visit-section-scroll-v370.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../interaction-layout-v358.css',import.meta.url),'utf8');
const refinement=fs.readFileSync(new URL('../visit-refinement-v369.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

new vm.Script(polish,{filename:'visit-polish-v366.js'});
new vm.Script(sectionScroll,{filename:'visit-section-scroll-v370.js'});

assert.match(polish,/Horaire, durée et organisation/,'le panneau horaire doit être ciblé');
assert.match(polish,/spec\.key==="notes"/,'le panneau Notes doit être ciblé');
assert.match(polish,/cph-section-title-\$\{spec\.key\}/,'chaque type de titre doit être identifiable');
assert.match(polish,/cph-section-arrow/,'les panneaux doivent utiliser une flèche dédiée à droite');
assert.match(polish,/summary\.cph-section-summary::marker[\s\S]*?content:""!important/,'le marqueur natif de summary doit être supprimé');
assert.match(polish,/summary\.cph-section-summary::-webkit-details-marker[\s\S]*?display:none!important/,'le marqueur WebKit de summary doit être supprimé');
assert.match(polish,/querySelectorAll\("#programme \.day-departure"\).*?remove/s,'les tuiles Départ prévu/réel doivent être supprimées');
assert.match(polish,/className="cph-day-toggle"/,'chaque journée doit recevoir une zone cliquable de dépliage/repliage');
assert.match(polish,/cph-day-body-collapsed/,'la commande de journée doit réellement masquer ou réafficher son contenu');

assert.match(css,/\.time-editor input\.point-time,[\s\S]*?-webkit-appearance:none!important;[\s\S]*?appearance:none!important/,'Heure souhaitée doit neutraliser la deuxième flèche native');
assert.match(css,/\.day-editor>\.apply-day\{[\s\S]*?width:min\(210px,68%\)!important/,'Changer de jour doit rester compact');
assert.match(css,/#programme#programme \.visit-now-actions>\.button \.cph-now-icon,[\s\S]*?display:none!important/,'les icônes des actions temporelles doivent rester forcées invisibles');

assert.match(sectionScroll,/LEGACY_ICONS=\{[\s\S]*?schedule:"⚙️"[\s\S]*?notes:"📝"/,'les anciennes icônes Horaire et Notes doivent être restaurées');
assert.match(sectionScroll,/labelSlot\.innerHTML="Horaire, durée et<br>organisation"/,'le titre Horaire doit avoir un découpage stable sur deux lignes');
assert.match(refinement,/\.cph-section-title>span:first-child\{[\s\S]*?right:calc\(100% \+ 8px\)!important/,'les deux anciennes icônes doivent garder exactement le même écart de 8 px avec leur titre');
assert.match(refinement,/font-family:"Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif!important/,'les anciennes icônes doivent conserver un rendu emoji natif');
assert.match(refinement,/\.cph-section-title>span:first-child svg\{[\s\S]*?display:none!important/,'les icônes vectorielles intermédiaires ne doivent plus être visibles');

assert.match(sectionScroll,/function directSummary\(details\)[\s\S]*?child\.tagName==="SUMMARY"/,'chaque onglet details doit être piloté par son summary direct');
assert.match(sectionScroll,/document\.querySelectorAll\("#programme details"\)/,'le recalage doit s’appliquer à tous les onglets details du programme');
assert.match(sectionScroll,/document\.querySelectorAll\("#programme \.day-banner"\)/,'le recalage doit aussi s’appliquer aux onglets de journées');
assert.match(sectionScroll,/button\.addEventListener\("click",\(\)=>\{[\s\S]*?scrollTargetBelowHeader\(banner,banner\)/,'ouvrir ou replier une journée doit recaler son bandeau sous le header');
assert.match(sectionScroll,/function desiredTargetTop\(\)[\s\S]*?stickyHeaderOffset\(\)\+12/,'le titre ciblé doit rester sous le bandeau supérieur avec une marge de sécurité');
assert.match(sectionScroll,/window\.scrollTo\(\{top,behavior:"smooth"\}\)/,'le recalage doit être fluide');
assert.match(sectionScroll,/window\.setTimeout\(\(\)=>settleTarget\(target,owner,token\),420\)/,'une correction finale doit compenser le mouvement du bandeau sticky pendant le scroll');

assert.match(refinement,/\.visit-details\[open\] \.visit-summary \.summary-title\{[\s\S]*?grid-column:2!important/,'le nom d’un événement ouvert doit suivre la colonne de la durée de visite');
assert.match(refinement,/\.visit-details\[open\] \.visit-summary \.title-stars\{[\s\S]*?position:absolute!important/,'les étoiles ne doivent plus déplacer le centre du nom');
assert.match(refinement,/\.day-banner::after\{[\s\S]*?content:"⌄"!important/,'la flèche de journée doit être visible dès le premier rendu du bandeau');
assert.match(refinement,/\.day-banner>\.cph-day-toggle svg\{[\s\S]*?opacity:0!important/,'la flèche DOM tardive ne doit pas créer une seconde apparition visuelle');
assert.match(refinement,/\.day-banner:has\(>\.cph-day-toggle\[aria-expanded="false"\]\)::after/,'la flèche immédiate doit refléter l’état replié');

assert.match(sw,/copenhague-v358-static-v60/,'le cache doit être renouvelé');
assert.match(sw,/visit-refinement-v369\.css\?v=372/,'le raffinement visuel doit être précaché dans sa nouvelle version');
assert.match(sw,/visit-section-scroll-v370\.js\?v=371/,'le correctif de recalage doit être précaché dans sa nouvelle version');
assert.match(sw,/const sectionScrollRequest=new Request/,'le correctif de recalage doit être concaténé au script principal');
assert.match(sw,/enhancedInteractionStyle\(request\)/,'le raffinement visuel doit être concaténé à la feuille chargée dans head');
assert.match(sw,/url\.pathname==="\/interaction-layout-v358\.css"/,'l’interception CSS doit viser la feuille réellement chargée');

console.log(JSON.stringify({ok:true,sections:'classic-icons-equal-8px-stable-wrap',sectionScroll:'all-details-and-days-visible-below-sticky-header',openTitle:'duration-axis-independent-stars',days:'first-paint-chevron',cache:'v60'},null,2));
