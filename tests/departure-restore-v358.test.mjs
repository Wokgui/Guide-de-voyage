import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../interaction-layout-v358.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');

const link='<link href="/interaction-layout-v358.css?v=358" rel="stylesheet"/>';
assert.ok(html.includes(link),'la mise en page v358 doit être chargée');
assert.ok(html.indexOf(link)<html.indexOf('</head>'),'la mise en page des boutons doit être connue avant <body>');
assert.match(html,/const effectiveDeparture=state\.starts\?\.\[day\]\|\|DAY_CONFIG\[day\]\.departure/,'le bandeau doit utiliser le départ effectif');
assert.match(html,/const departureLabel=state\.starts\?\.\[day\]\?"Départ réel":"Départ prévu"/,'le libellé doit refléter la présence d’un départ réel');
assert.doesNotMatch(html,/day-departure-label">Départ prévu<\/span><strong>\$\{DAY_CONFIG\[day\]\.departure\}/,'l’ancien bandeau figé ne doit plus être rendu');
assert.match(html,/class="time-editor-actions">[\s\S]*?class="button secondary apply-time"[\s\S]*?class="button secondary reset-time"/,'Rétablir doit suivre Appliquer dans un même groupe');
assert.match(html,/class="button secondary reset-time" type="button" \$\{state\.timeOverrides\[p\.id\]\?"":"disabled"\}>Rétablir/,'Rétablir doit rester visible et être désactivé sans modification');
assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/,'les deux boutons doivent rester côte à côte');
assert.match(css,/@media\(max-width:420px\)[\s\S]*?\.time-editor-actions[\s\S]*?width:100%!important/,'le groupe doit occuper toute la largeur sur mobile');
assert.match(sw,/copenhague-v358-static-v51/,'le cache statique doit être renouvelé');
assert.match(sw,/\/interaction-layout-v358\.css\?v=358/,'la feuille v358 doit être précachée');

console.log(JSON.stringify({ok:true,departure:'effective',actions:'apply-and-reset-side-by-side'},null,2));
