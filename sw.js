const STATIC_CACHE="copenhague-v330-static-v1";
const RUNTIME_CACHE="copenhague-v330-runtime-v1";
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
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>![STATIC_CACHE,RUNTIME_CACHE].includes(key)).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
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
    const patch='\n;(function(){const s=document.createElement("style");s.textContent="html body.suivi-active header .stats .stat.stat-progress{display:none!important}";document.head.appendChild(s);})();\n';
    return new Response(source+patch,{status:200,statusText:"OK",headers:{"Content-Type":"application/javascript; charset=utf-8","Cache-Control":"no-store"}});
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
    event.respondWith(cacheFirst(request));
    return;
  }

  if(["image","script","style","font"].includes(request.destination)){
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});
