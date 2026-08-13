const STATIC_CACHE="copenhague-v343-static-v15";
const RUNTIME_CACHE="copenhague-v343-runtime-v15";
const STATIC_FILES=[
  "/",
  "/index.html",
  "/shared-sync.js",
  "/cloud-backup.js?v=3",
  "/header-prestige.js?v=343",
  "/ui-fixes-v7.js?v=17",
  "/day-style-v1.js?v=5",
  "/manifest.webmanifest",
  "/icons/app-icon.svg",
  "/icons/app-icon-192.png",
  "/icons/app-icon-512.png",
  "/vendor/leaflet/leaflet.css",
  "/vendor/leaflet/leaflet.js",
  "/vendor/supabase/supabase.js",
  "/vendor/leaflet/images/layers.png",
  "/vendor/leaflet/images/layers-2x.png",
  "/vendor/leaflet/images/marker-icon.png",
  "/vendor/leaflet/images/marker-icon-2x.png",
  "/vendor/leaflet/images/marker-shadow.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(STATIC_FILES)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>![STATIC_CACHE,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

async function remember(request,response){
  if(!response||(!response.ok&&response.type!=="opaque"))return response;
  const cache=await caches.open(RUNTIME_CACHE);
  await cache.put(request,response.clone());
  return response;
}

async function networkFirst(request,fallback){
  try{
    return await remember(request,await fetch(request,{cache:"no-store"}));
  }catch(_){
    return (await caches.match(request))||(fallback?await caches.match(fallback):undefined)||Response.error();
  }
}

async function patchedHeader(request){
  try{
    const response=await fetch(request,{cache:"no-store"});
    if(!response.ok)return response;
    const source=await response.text();
    const patch=`
;(function(){
  const style=document.createElement("style");
  style.textContent="html body.suivi-active header .stats .stat.stat-progress{display:none!important}.cph-map-title-row,.cph-poi-title-fixed,.cph-titlepair-v334,.cph-titlepair-v335{display:flex!important;width:max-content!important;max-width:100%!important;align-items:flex-start!important;justify-content:flex-start!important;gap:6px!important;margin-left:auto!important;margin-right:auto!important;text-align:left!important}.cph-map-title-row>.cph-map-icon,.cph-poi-title-fixed>.cph-poi-icon,.cph-titlepair-v334>.cph-titleicon-v334,.cph-titlepair-v335>.cph-titleicon-v335,.cph-borsen-icon-fixed{display:inline-flex!important;flex:0 0 1.28em!important;width:1.28em!important;min-width:1.28em!important;height:1.16em!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;line-height:1!important;position:static!important;transform:translateY(.02em)!important;text-align:center!important;vertical-align:top!important}.cph-map-title-row>.cph-map-name,.cph-poi-title-fixed>.cph-poi-name,.cph-titlepair-v334>.cph-titlename-v334,.cph-titlepair-v335>.cph-titlename-v335{display:block!important;flex:0 1 auto!important;width:auto!important;min-width:0!important;max-width:calc(100% - 1.65em)!important;margin:0!important;padding:0!important;line-height:1.16!important;text-align:left!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;word-break:normal!important}.cph-reserved-icon-only{min-width:0!important;width:auto!important;padding-left:8px!important;padding-right:8px!important;gap:0!important}.cph-reserved-icon-only .cph-reserved-label-hidden{display:none!important}html body #programme .visit-details:not([open]) .visit-summary .summary-title-tools .summary-line:nth-child(2)>.summary-point-map{border:0!important;outline:0!important;box-shadow:none!important;-webkit-appearance:none!important;appearance:none!important;filter:none!important;width:17px!important;min-width:17px!important;max-width:17px!important;height:17px!important;min-height:17px!important;max-height:17px!important;padding:0!important}html body #programme .visit-details:not([open]) .visit-summary .summary-point-map:focus,html body #programme .visit-details:not([open]) .visit-summary .summary-point-map:focus-visible{outline:0!important;box-shadow:none!important}html body #programme .visit-details:not([open]) .visit-summary .summary-point-map::after{content:none!important;display:none!important}html body #programme .visit-details:not([open]) .visit-summary .mini-badge.nature{border:0!important;outline:0!important;box-shadow:none!important;filter:none!important}html body #programme .visit-details:not([open]) .summary-title-tools .summary-line:nth-child(2){display:grid!important;grid-template-columns:max-content 17px max-content!important;justify-content:center!important;justify-items:center!important;align-items:center!important;column-gap:16px!important;row-gap:0!important;width:100%!important;margin-left:auto!important;margin-right:auto!important}html body.suivi-active .footer-actions>button,html body.suivi-active .footer-actions>label{height:68.4px!important;min-height:68.4px!important;padding:7px 8px!important;gap:5px!important;font-size:13px!important;line-height:1.1!important}html body.suivi-active .footer-actions>button span,html body.suivi-active .footer-actions>label span{font-size:13px!important;line-height:1.1!important}";
  document.head.appendChild(style);
  const norm=e=>(e&&e.textContent||"").replace(/\\s+/g," ").trim();
  const isIcon=s=>!!s&&s.length<=8&&!/[A-Za-zÀ-ÿ0-9]/.test(s);
  const scope=()=>document.querySelector("#mapPanel,#panel-map,[data-panel='map'],#mapList,.map-list,[id*='map'][class*='panel'],[class*='map'][class*='panel']")||document.body;
  function pair(holder,icon,nameEl){
    if(!holder||!icon||!nameEl)return;
    holder.classList.remove("cph-map-title-row","cph-poi-title-fixed","cph-titlepair-v334");
    holder.classList.add("cph-titlepair-v335");
    icon.classList.remove("cph-map-icon","cph-poi-icon","cph-borsen-icon-fixed","cph-titleicon-v334");
    nameEl.classList.remove("cph-map-name","cph-poi-name","cph-titlename-v334");
    icon.classList.add("cph-titleicon-v335");
    nameEl.classList.add("cph-titlename-v335");
    holder.dataset.cphPair335="1";
  }
  function fix(){
    const root=scope();
    const dataNames=(window.DATA||[]).map(x=>x&&x.name).filter(Boolean);
    const extraNames=["Børsen – centre de reconstruction","Det Kongelige Bibliotek – Black Diamond","Face à l’hôtel","Face à l'hotel","Hôtel","Hotel"];
    const names=[...new Set([...dataNames,...extraNames])].sort((a,b)=>b.length-a.length);
    const all=Array.from(root.querySelectorAll("div,span,p,strong,b,h2,h3,h4"));
    names.forEach(name=>{
      all.forEach(nameEl=>{
        if(norm(nameEl)!==name)return;
        if(Array.from(nameEl.children).some(c=>c.tagName!=="BR"))return;
        let holder=nameEl.parentElement;if(!holder)return;
        let kids=Array.from(holder.children),idx=kids.indexOf(nameEl),icon=idx>0?kids[idx-1]:null;
        if(icon&&isIcon(norm(icon))){pair(holder,icon,nameEl);return;}
        const parent2=holder.parentElement;if(!parent2)return;
        kids=Array.from(parent2.children);idx=kids.indexOf(holder);icon=idx>0?kids[idx-1]:null;
        if(icon&&isIcon(norm(icon))&&norm(holder)===name){pair(parent2,icon,holder);}
      });
      all.forEach(el=>{
        const raw=norm(el);if(!raw||raw===name||!raw.endsWith(name)||raw.length>name.length+8)return;
        const prefix=raw.slice(0,raw.length-name.length).trim();if(!isIcon(prefix))return;
        el.textContent="";
        const icon=document.createElement("span");icon.textContent=prefix;icon.setAttribute("aria-hidden","true");
        const label=document.createElement("span");label.textContent=name;
        el.append(icon,label);pair(el,icon,label);
      });
    });
  }
  function reservedIconOnly(){
    const program=document.querySelector("#programPanel,#panel-program,[data-panel='program'],#programmePanel,#panel-programme,[data-panel='programme'],.programme-panel,.program-panel")||document.body;
    Array.from(program.querySelectorAll("*")).forEach(label=>{
      if(label.dataset.cphReservedDone)return;
      if(norm(label)!=="Réservé"&&norm(label)!=="Reserve")return;
      let badge=label;
      for(let i=0;i<4&&badge;i++,badge=badge.parentElement){
        if(badge===program)break;
        const children=Array.from(badge.children);
        const hasVisual=children.some(c=>c!==label&&(c.matches("svg,img,i,[aria-hidden='true'],.icon,[class*='icon']")||isIcon(norm(c))))||badge.querySelector("svg,img,i,[aria-hidden='true'],.icon,[class*='icon']");
        if(!hasVisual)continue;
        Array.from(badge.childNodes).forEach(n=>{if(n.nodeType===Node.TEXT_NODE&&/^(Réservé|Reserve)$/i.test((n.textContent||"").trim()))n.textContent="";});
        Array.from(badge.querySelectorAll("span,strong,b,small,em")).forEach(t=>{if(/^(Réservé|Reserve)$/i.test(norm(t))&&!t.querySelector("svg,img,i,[aria-hidden='true'],.icon,[class*='icon']"))t.classList.add("cph-reserved-label-hidden");});
        if(/^(Réservé|Reserve)$/i.test(norm(label)))label.classList.add("cph-reserved-label-hidden");
        badge.classList.add("cph-reserved-icon-only");
        label.dataset.cphReservedDone="1";
        break;
      }
    });
  }
  function orderProgrammeMap(){
    document.querySelectorAll("#programme .summary-title-tools .summary-line").forEach(line=>{
      const map=line.querySelector(":scope > .summary-point-map");
      const visit=line.querySelector(":scope > .summary-visit-duration");
      const walk=line.querySelector(":scope > .summary-walk-duration");
      if(map&&visit&&walk&&map.previousElementSibling!==visit)line.insertBefore(map,walk);
    });
  }
  function polishAll(){fix();reservedIconOnly();orderProgrammeMap();}
  polishAll();setTimeout(polishAll,200);setTimeout(polishAll,700);setTimeout(polishAll,1500);
  const observer=new MutationObserver(()=>{clearTimeout(window.__cphPair336Timer);window.__cphPair336Timer=setTimeout(polishAll,35)});
  observer.observe(document.body,{childList:true,subtree:true});
})();
`;
    const extras=`\n;(function(){const s=document.createElement("script");s.src="/ui-fixes-v7.js?v=17";s.async=false;document.head.appendChild(s)})();\n`;
    return new Response(source+patch+extras,{status:200,statusText:"OK",headers:{"Content-Type":"application/javascript; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate"}});
  }catch(_){
    return (await caches.match(request))||Response.error();
  }
}

async function cacheFirst(request){
  const cached=await caches.match(request);
  if(cached)return cached;
  try{return await remember(request,await fetch(request));}
  catch(_){return Response.error();}
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);

  if(request.mode==="navigate"){
    event.waitUntil(self.registration.update().catch(()=>null));
    event.respondWith(networkFirst(request,"/index.html"));
    return;
  }

  if(url.hostname.endsWith(".supabase.co")){
    event.respondWith(fetch(request));
    return;
  }

  if(url.origin===self.location.origin && url.pathname==="/header-prestige.js"){
    event.respondWith(patchedHeader(request));
    return;
  }

  if(url.origin===self.location.origin){
    event.respondWith(networkFirst(request));
    return;
  }

  if(["image","script","style","font"].includes(request.destination)){
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});