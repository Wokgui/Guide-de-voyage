import fs from 'node:fs';

function read(path){return fs.readFileSync(path,'utf8');}
function write(path,content){fs.writeFileSync(path,content);}
function replaceOnce(source,before,after,label){
  const index=source.indexOf(before);
  if(index<0)throw new Error(`Bloc introuvable: ${label}`);
  if(source.indexOf(before,index+before.length)>=0)throw new Error(`Bloc non unique: ${label}`);
  return source.slice(0,index)+after+source.slice(index+before.length);
}

let html=read('index.html');
const headEnd=html.indexOf('</head>');
if(headEnd<0)throw new Error('Balise </head> introuvable');

// Les nombreuses corrections CSS historiques situées dans <body> arrivent trop tard
// lors d'un vrai rechargement. On les consolide sans changer leur ordre de cascade.
const body=html.slice(headEnd+'</head>'.length);
const bodyWithoutScripts=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const bodyStyles=[];
for(const match of bodyWithoutScripts.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi))bodyStyles.push(match[1]);
if(bodyStyles.length<5)throw new Error(`Nombre de styles de body anormal: ${bodyStyles.length}`);

const day=read('day-style-v1.js');
const dayMatch=day.match(/s\.textContent=`([\s\S]*?)`;\s*document\.head\.appendChild\(s\);/);
if(!dayMatch)throw new Error('CSS day-style introuvable');

const critical=`/* v355 — CSS de premier affichage.\n   Copie anticipée des styles statiques tardifs + style final des journées.\n   Les règles originales restent en place : cette feuille ne change pas l'état final,\n   elle évite seulement l'état intermédiaire non stylé pendant le parsing/rechargement. */\n\n${bodyStyles.map((css,index)=>`/* body-style-${index+1} */\n${css.trim()}`).join('\n\n')}\n\n/* day-style-v7 anticipé */\n${dayMatch[1].trim()}\n`;
write('first-paint-v355.css',critical);

const stabilityLink='<link href="/ux-stability-v1.css?v=1" rel="stylesheet"/>';
const firstPaintLink='<link href="/first-paint-v355.css?v=355" rel="stylesheet"/>';
if(!html.includes(firstPaintLink)){
  html=replaceOnce(html,stabilityLink,`${stabilityLink}\n${firstPaintLink}`,'lien CSS de stabilité');
}

// Même sans CSS, l'icône calendrier ne doit jamais redevenir un SVG 300x150 noir.
const rawCalendar='<span class="day-calendar-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg></span>';
const safeCalendar='<span class="day-calendar-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg></span>';
if(html.includes(rawCalendar))html=replaceOnce(html,rawCalendar,safeCalendar,'SVG calendrier de journée');
else if(!html.includes(safeCalendar))throw new Error('SVG calendrier attendu introuvable');
write('index.html',html);

let sw=read('sw.js');
sw=sw.replace('const STATIC_CACHE="copenhague-v351-static-v48";','const STATIC_CACHE="copenhague-v355-static-v49";');
sw=sw.replace('const RUNTIME_CACHE="copenhague-v351-runtime-v48";','const RUNTIME_CACHE="copenhague-v355-runtime-v49";');
if(!sw.includes('"/first-paint-v355.css?v=355"')){
  sw=replaceOnce(sw,'  "/ux-stability-v1.css?v=1",','  "/ux-stability-v1.css?v=1",\n  "/first-paint-v355.css?v=355",','cache du CSS v355');
}
write('sw.js',sw);

console.log(JSON.stringify({bodyStyleBlocks:bodyStyles.length,criticalBytes:Buffer.byteLength(critical),linkBeforeBody:html.indexOf(firstPaintLink)<html.indexOf('</head>')},null,2));
