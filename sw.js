const STATIC_CACHE="copenhague-v334-static-v1";
const RUNTIME_CACHE="copenhague-v334-runtime-v1";
const STATIC_FILES=[
  "/",
  "/index.html",
  "/shared-sync.js",
  "/cloud-backup.js?v=3",
  "/header-prestige.js",
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
    const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    await Promise.all(clients.map(client=>client.navigate(client.url).catch(()=>null)));
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
  style.textContent="html body.suivi-active header .stats .stat.stat-progress{display:none!important}.cph-titlepair-v334{display:flex!important;width:max-content!important;max-width:100%!important;align-items:flex-start!important;justify-content:flex-start!important;gap:6px!important;margin-left:auto!important;margin-right:auto!important;text-align:left!important}.cph-titlepair-v334>.cph-titleicon-v334{display:inline-flex!important;flex:0 0 1.3em!important;width:1.3em!important;min-width:1.3em!important;height:1.2em!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;line-height:1!important;position:static!important;transform:translateY(-.01em)!important;text-align:center!important}.cph-titlepair-v334>.cph-titlename-v334{display:block!important;flex:0 1 auto!important;width:auto!important;min-width:0!important;max-width:calc(100% - 1.7em)!important;margin:0!important;padding:0!important;line-height:1.16!important;text-align:left!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;word-break:normal!important}";
  document.head.appendChild(style);
  const norm=e=>(e&&e.textContent||"").replace(/\\s+/g," ").trim();
  const isIcon=s=>!!s&&s.length<=8&&!/[A-Za-zÀ-ÿ0-9]/.test(s);
  const scope=()=>document.querySelector("#mapPanel,#panel-map,[data-panel='map'],#mapList,.map-list,[id*='map'][class*='panel'],[class*='map'][class*='panel']")||document.body;
  function pair(holder,icon,nameEl){
    if(!holder||!icon||!nameEl||holder.dataset.cphPair334)return;
    holder.classList.remove("cph-map-title-row","cph-poi-title-fixed");
    holder.classList.add("cph-titlepair-v334");
    icon.classList.remove("cph-map-icon","cph-poi-icon","cph-borsen-icon-fixed");
    nameEl.classList.remove("cph-map-name","cph-poi-name");
    icon.classList.add("cph-titleicon-v334");
    nameEl.classList.add("cph-titlename-v334");
    holder.dataset.cphPair334="1";
  }
  function fix(){
    const root=scope();
    const names=(window.DATA||[]).map(x=>x&&x.name).filter(Boolean).sort((a,b)=>b.length-a.length);
    if(!names.length)return;
    const all=Array.from(root.querySelectorAll("div,span,p,strong,b,h2,h3,h4"));
    names.forEach(name=>{
      all.forEach(nameEl=>{
        if(norm(nameEl)!==name)return;
        if(Array.from(nameEl.children).some(c=>c.tagName!=="BR"))return;
        const cs=getComputedStyle(nameEl);
        if(parseInt(cs.fontWeight||"400",10)<600&&!/^(STRONG|B|H2|H3|H4)$/.test(nameEl.tagName))return;
        let holder=nameEl.parentElement;
        if(!holder)return;
        let kids=Array.from(holder.children),idx=kids.indexOf(nameEl),icon=idx>0?kids[idx-1]:null;
        if(icon&&isIcon(norm(icon))&&kids.length<=4){pair(holder,icon,nameEl);return;}
        const parent2=holder.parentElement;
        if(!parent2)return;
        kids=Array.from(parent2.children);idx=kids.indexOf(holder);icon=idx>0?kids[idx-1]:null;
        if(icon&&isIcon(norm(icon))&&kids.length<=4&&norm(holder)===name){pair(parent2,icon,holder);}
      });
      all.forEach(el=>{
        const raw=norm(el);if(!raw||raw===name||!raw.endsWith(name)||raw.length>name.length+8)return;
        const prefix=raw.slice(0,raw.length-name.length).trim();if(!isIcon(prefix))return;
        const cs=getComputedStyle(el);if(parseInt(cs.fontWeight||"400",10)<600)return;
        el.textContent="";
        const icon=document.createElement("span");icon.textContent=prefix;icon.setAttribute("aria-hidden","true");
        const label=document.createElement("span");label.textContent=name;
        el.append(icon,label);pair(el,icon,label);
      });
    });
  }
  fix();setTimeout(fix,250);setTimeout(fix,800);setTimeout(fix,1600);
  const observer=new MutationObserver(()=>{clearTimeout(window.__cphPair334Timer);window.__cphPair334Timer=setTimeout(fix,40)});
  observer.observe(document.body,{childList:true,subtree:true});
})();
`;
    return new Response(source+patch,{status:200,statusText:"OK",headers:{"Content-Type":"application/javascript; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate"}});
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
