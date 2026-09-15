const STATIC_CACHE="copenhague-v358-static-v57";
const RUNTIME_CACHE="copenhague-v358-runtime-v57";
const STATIC_FILES=[
  "/",
  "/index.html",
  "/shared-sync.js",
  "/cloud-backup.js?v=3",
  "/header-prestige.js?v=357",
  "/visit-polish-v366.js?v=366",
  "/visit-refinement-v369.css?v=369",
  "/ux-stability-v1.css?v=1",
  "/first-paint-v355.css?v=355",
  "/visual-stability-v357.css?v=357",
  "/interaction-layout-v358.css?v=358",
  "/day-style-v1.js?v=6",
  "/packing-list-v1.css?v=9",
  "/packing-list-v1.js?v=5",
  "/section-history-v1.css?v=1",
  "/section-history-v1.js?v=1",
  "/manifest.webmanifest",
  "/icons/app-icon.svg",
  "/icons/app-icon-192.png?v=2",
  "/icons/app-icon-512.png?v=2",
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

async function cacheFirst(request){
  const cached=await caches.match(request);
  if(cached)return cached;
  try{return await remember(request,await fetch(request));}
  catch(_){return Response.error();}
}

async function enhancedHeader(request){
  try{
    const polishRequest=new Request(new URL("/visit-polish-v366.js?v=366",self.location.origin),{method:"GET"});
    let [headerResponse,polishResponse]=await Promise.all([
      fetch(request,{cache:"no-store"}),
      fetch(polishRequest,{cache:"no-store"})
    ]);
    if(!headerResponse.ok)throw new Error("header fetch failed");
    if(!polishResponse.ok)polishResponse=await caches.match(polishRequest);
    const source=await headerResponse.text();
    const polish=polishResponse?await polishResponse.text():"";
    const response=new Response(`${source}\n${polish}`,{
      status:200,
      statusText:"OK",
      headers:{
        "Content-Type":"application/javascript; charset=utf-8",
        "Cache-Control":"no-store, no-cache, must-revalidate"
      }
    });
    return await remember(request,response);
  }catch(_){
    const runtime=await caches.match(request);
    if(runtime)return runtime;
    const headerRequest=new Request(new URL("/header-prestige.js?v=357",self.location.origin));
    const polishRequest=new Request(new URL("/visit-polish-v366.js?v=366",self.location.origin));
    const [headerResponse,polishResponse]=await Promise.all([caches.match(headerRequest),caches.match(polishRequest)]);
    if(!headerResponse)return Response.error();
    const source=await headerResponse.text();
    const polish=polishResponse?await polishResponse.text():"";
    return new Response(`${source}\n${polish}`,{headers:{"Content-Type":"application/javascript; charset=utf-8","Cache-Control":"no-store"}});
  }
}

async function enhancedInteractionStyle(request){
  try{
    const refinementRequest=new Request(new URL("/visit-refinement-v369.css?v=369",self.location.origin),{method:"GET"});
    let [baseResponse,refinementResponse]=await Promise.all([
      fetch(request,{cache:"no-store"}),
      fetch(refinementRequest,{cache:"no-store"})
    ]);
    if(!baseResponse.ok)throw new Error("interaction style fetch failed");
    if(!refinementResponse.ok)refinementResponse=await caches.match(refinementRequest);
    const base=await baseResponse.text();
    const refinement=refinementResponse?await refinementResponse.text():"";
    const response=new Response(`${base}\n${refinement}`,{
      status:200,
      statusText:"OK",
      headers:{
        "Content-Type":"text/css; charset=utf-8",
        "Cache-Control":"no-store, no-cache, must-revalidate"
      }
    });
    return await remember(request,response);
  }catch(_){
    const runtime=await caches.match(request);
    if(runtime)return runtime;
    const baseRequest=new Request(new URL("/interaction-layout-v358.css?v=358",self.location.origin));
    const refinementRequest=new Request(new URL("/visit-refinement-v369.css?v=369",self.location.origin));
    const [baseResponse,refinementResponse]=await Promise.all([caches.match(baseRequest),caches.match(refinementRequest)]);
    if(!baseResponse)return Response.error();
    const base=await baseResponse.text();
    const refinement=refinementResponse?await refinementResponse.text():"";
    return new Response(`${base}\n${refinement}`,{headers:{"Content-Type":"text/css; charset=utf-8","Cache-Control":"no-store"}});
  }
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

  if(url.origin===self.location.origin&&url.pathname==="/header-prestige.js"){
    event.respondWith(enhancedHeader(request));
    return;
  }

  if(url.origin===self.location.origin&&url.pathname==="/interaction-layout-v358.css"){
    event.respondWith(enhancedInteractionStyle(request));
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
