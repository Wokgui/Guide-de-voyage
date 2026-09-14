import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../visual-stability-v357.css',import.meta.url),'utf8');
const ui=fs.readFileSync(new URL('../ui-fixes-v7.js',import.meta.url),'utf8');
const header=fs.readFileSync(new URL('../header-prestige.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../cloud-backup-loader.js',import.meta.url),'utf8');

new vm.Script(ui,{filename:'ui-fixes-v7.js'});
new vm.Script(header,{filename:'header-prestige.js'});
new vm.Script(loader,{filename:'cloud-backup-loader.js'});

assert.doesNotMatch(ui,/document\.createElement\("style"\)/,'aucun style ne doit être injecté après le premier rendu');
assert.match(html,/<title>Copenhague &amp; Malmö — v358<\/title>/,'le document doit annoncer la version corrigée');
assert.doesNotMatch(ui,/getBoundingClientRect\(\)\.height/,'la barre Programme ne doit plus être mesurée au chargement');
assert.match(ui,/cphStaticUiStyles="v357"/,'polish doit reconnaître les styles statiques v357');
assert.match(css,/#programme \.history-actions[\s\S]*?height:30px!important/,'la barre Programme doit avoir sa hauteur finale dès le CSS initial');
assert.match(css,/input\[type="checkbox"\][\s\S]*?width:16px!important/,'la case doit avoir sa dimension finale dès le CSS initial');
assert.match(css,/\.cph-summary-meta-icon[\s\S]*?width:17px!important/,'les icônes doivent avoir leur dimension finale dès le CSS initial');

const renderStart=html.indexOf('function renderProgramme(');
const renderEnd=html.indexOf('\nfunction trackingChronologicalSort',renderStart);
const renderSource=html.slice(renderStart,renderEnd);
assert.ok(renderStart>=0&&renderEnd>renderStart,'renderProgramme introuvable');
assert.doesNotMatch(renderSource,/list\.innerHTML\s*=/,'le Programme ne doit plus être vidé avant sa reconstruction');
assert.match(renderSource,/previousCards=new Map/,'les cartes existantes doivent être indexées par leur identifiant');
assert.match(renderSource,/previousCard\.__cphProgrammeRenderSignature===renderSignature/,'une carte inchangée doit être réutilisée');
assert.match(renderSource,/document\.createDocumentFragment\(\)/,'le prochain Programme doit être construit hors écran');
assert.match(renderSource,/list\.replaceChildren\(nextProgramme\)/,'le nouveau Programme doit être publié atomiquement');
assert.match(html,/PROGRAMME_THUMBNAIL_NODE_CACHE=new Map\(\)/,'les images décodées doivent être conservées par identifiant');
assert.match(html,/!cached\.img\.complete\|\|!cached\.img\.naturalWidth/,'seule une image entièrement décodée peut être réutilisée');
assert.match(html,/mountReadyThumbnail\(wrap,p,src,cached\.img,\{reused:true\}\)/,'le même nœud image doit être remonté sans réaffecter src');
assert.match(html,/window\.__cphVisualStabilityV357=PROGRAMME_VISUAL_STABILITY_STATS/,'les compteurs de vérification doivent être exposés');
assert.doesNotMatch(header,/dom-stability-v356|loadDomStabilityV356/,'l’ancien correctif post-rendu ne doit plus être chargé');
assert.match(loader,/ui-fixes-v7\.js\?v=357/,'le script idempotent doit être servi sous une URL versionnée');

console.log(JSON.stringify({
 ok:true,
 initialCss:true,
 keyedCards:true,
 decodedThumbnailReuse:true,
 postRenderReconciler:false
},null,2));
