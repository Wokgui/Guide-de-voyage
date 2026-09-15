import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const header=fs.readFileSync(new URL('../header-prestige.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const collapsed=fs.readFileSync(new URL('../visit-photo-collapsed-v3.js',import.meta.url),'utf8');
const expanded=fs.readFileSync(new URL('../visit-photo-fallback-v2.js',import.meta.url),'utf8');
const fallbackCss=fs.readFileSync(new URL('../visit-photo-fallback-v2.css',import.meta.url),'utf8');

assert.match(html,/"Conditori La Glace":"https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\/Conditori%20La%20Glace\.jpg\?width=1280"/,'La Glace doit utiliser une photo Commons exacte');
assert.match(html,/"Inderhavnsbroen":\["en","Inderhavnsbroen"\]/,'Inderhavnsbroen doit viser la vraie page');
assert.match(html,/"Dronning Louises Bro":\["en","Dronning_Louises_Bro"\]/,'Dronning Louises Bro doit viser la vraie page');
assert.doesNotMatch(html,/Inner_Harbour_Bridge|Queen_Louise's_Bridge|Conditori_La_Glace/,'les anciens titres 404 ne doivent plus rester');

const fallbackMatch=html.match(/const PHOTO_FALLBACKS_BY_ID=(\{[\s\S]*?\});\s*function specialLargePhotoData/);
assert.ok(fallbackMatch,'la table des secours dédiés doit exister');
const fallbacks=Function(`"use strict";return (${fallbackMatch[1]})`)();
const expected={
 'p03-d-p':'/assets/place-fallbacks/dop.webp',
 'p11-restaurant-pal-gade':'/assets/place-fallbacks/restaurant-palaegade.webp',
 'p33-restaurant-kronborg':'/assets/place-fallbacks/restaurant-kronborg.webp',
 'p51-hallernes-sm-rrebr-d':'/assets/place-fallbacks/hallernes-smorrebrod.webp',
 'custom-1785177723866-xtyhp':'/assets/place-fallbacks/safari.webp',
 'custom-1785179305752-lv4j4':'/assets/place-fallbacks/the-pescatarian.webp'
};
assert.deepEqual(fallbacks,expected,'seuls les six lieux réellement non couverts doivent avoir un secours IA');

for(const path of Object.values(expected)){
 const file=new URL(`..${path}`,import.meta.url);
 const bytes=fs.readFileSync(file);
 assert.ok(bytes.length>50000,`${path} doit contenir une vraie image optimisée`);
 assert.equal(bytes.subarray(0,4).toString('ascii'),'RIFF',`${path} doit être un WebP valide`);
 assert.equal(bytes.subarray(8,12).toString('ascii'),'WEBP',`${path} doit être un WebP valide`);
 assert.match(sw,new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),
  `${path} doit être disponible hors ligne`);
}

assert.doesNotMatch(html,/generator=search|gsrsearch|pages\.find\(item=>item\.thumbnail/,'aucune première réponse approximative ne doit choisir une photo');
assert.match(html,/credit==="Wikipédia \/ Wikimedia Commons"[\s\S]*?delete PHOTO_PERSISTED_CACHE\[id\]/,'les anciennes réponses approximatives doivent être purgées sans effacer les photos exactes');

const resolver=html.slice(html.indexOf('async function resolveExternalPhotoSrc'),html.indexOf('async function getExternalPhotoSrc'));
assert.ok(resolver.indexOf('const page=PHOTO_PAGES[p.name]')<resolver.indexOf('const fallback=PHOTO_FALLBACKS_BY_ID[p.id]'),'une vraie page exacte doit rester prioritaire sur un secours');
const known=html.slice(html.indexOf('function knownPhotoSource'),html.indexOf('function preparePhotoSurface'));
assert.ok(known.indexOf('PHOTO_DIRECT[p.name]')<known.indexOf('PHOTO_FALLBACKS_BY_ID[p.id]'),'une photo directe doit rester prioritaire');

const refresh=header.slice(header.indexOf('function refresh()'),header.indexOf('document.addEventListener("guide:rendered"'));
assert.doesNotMatch(refresh,/installPlaceImageFallbacks/,'le rendu ne doit plus installer de remplacements après coup');
for(const source of [collapsed,expanded,fallbackCss]){
 assert.doesNotMatch(source,/images\.unsplash\.com|setTimeout|\.src\s*=|MutationObserver|cph-category-photo-fallback/,'les fichiers de transition doivent rester inertes');
}
assert.match(sw,/copenhague-v358-static-v67/,'le cache doit invalider les anciens injecteurs');
assert.doesNotMatch(sw,/visit-photo-fallback-v2\.js|visit-photo-collapsed-v3\.js|visit-photo-fallback-v2\.css/,'le service worker ne doit plus charger les injecteurs génériques');

console.log(JSON.stringify({ok:true,exactSourcesPreserved:true,dedicatedFallbacks:Object.keys(expected).length,cache:'v67'},null,2));
