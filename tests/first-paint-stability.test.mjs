import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../first-paint-v355.css',import.meta.url),'utf8');
const stableCss=fs.readFileSync(new URL('../visual-stability-v357.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

const link='<link href="/first-paint-v355.css?v=355" rel="stylesheet"/>';
assert.ok(html.includes(link),'la feuille critique doit être référencée');
assert.ok(html.indexOf(link)<html.indexOf('</head>'),'la feuille critique doit bloquer le premier rendu avant <body>');
const stableLink='<link href="/visual-stability-v357.css?v=357" rel="stylesheet"/>';
assert.ok(html.includes(stableLink),'la feuille de stabilité finale doit être référencée');
assert.ok(html.indexOf(stableLink)<html.indexOf('</head>'),'les dimensions finales doivent être connues avant <body>');
assert.ok(html.indexOf(stableLink)>html.indexOf(link),'la feuille v357 doit remplacer les anciennes valeurs critiques');
assert.ok(css.length>20000,'la feuille critique doit réellement consolider les styles tardifs');
assert.match(css,/#programme \.visit-summary/,'mise en page des tuiles absente du CSS critique');
assert.match(css,/#programme \.quickbar/,'raccourcis Programme absents du CSS critique');
assert.match(css,/\.day-calendar-icon/,'icône calendrier absente du CSS critique');
assert.match(css,/#programme \.day-section\.day-section/,'style final de journée absent du CSS critique');
assert.doesNotMatch(css,/<script\b/i,'du JavaScript a été capturé par erreur dans la feuille CSS');
assert.match(html,/class="day-calendar-icon"[^>]*><svg[^>]*width="18"[^>]*height="18"[^>]*fill="none"[^>]*stroke="currentColor"/,'le calendrier doit rester dimensionné même avant CSS');
assert.match(stableCss,/font-size:11px!important/,'taille finale des filtres absente du CSS initial');
assert.match(stableCss,/font-size:var\(--cph-summary-meta-text-size,12px\)!important/,'taille finale des durées absente du CSS initial');
assert.match(stableCss,/contain:layout paint!important/,'surface photo non réservée');
assert.match(sw,/copenhague-v357-static-v50/,'cache statique non versionné pour v357');
assert.match(sw,/copenhague-v357-runtime-v50/,'cache runtime non versionné pour v357');
assert.match(sw,/\/first-paint-v355\.css\?v=355/,'le service worker doit précacher la feuille critique');
assert.match(sw,/\/visual-stability-v357\.css\?v=357/,'le service worker doit précacher la feuille finale');

console.log(JSON.stringify({ok:true,criticalBytes:Buffer.byteLength(css)},null,2));
