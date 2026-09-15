(function(){
"use strict";
if(window.__cphVisitSectionScrollV373)return;
window.__cphVisitSectionScrollV373=true;

const LEGACY_ICONS={
 schedule:"⚙️",
 notes:"📝"
};

function restoreLegacySectionIcons(){
 Object.entries(LEGACY_ICONS).forEach(([key,icon])=>{
  document.querySelectorAll(`#programme .cph-section-title-${key}`).forEach(title=>{
   const iconSlot=title.querySelector(":scope > span:first-child");
   const labelSlot=title.querySelector(":scope > span:last-child");
   if(iconSlot){
    iconSlot.dataset.cphLegacyIcon="1";
    iconSlot.textContent=icon;
   }
   if(key==="schedule"&&labelSlot){
    labelSlot.innerHTML="Horaire, durée et<br>organisation";
   }
  });
 });
}

function directSummary(details){
 return Array.from(details.children||[]).find(child=>child.tagName==="SUMMARY")||null;
}

function stickyHeaderOffset(){
 const header=document.querySelector("body>header");
 if(!header)return 0;
 const rect=header.getBoundingClientRect();
 const style=getComputedStyle(header);
 const followsViewport=style.position==="fixed"||style.position==="sticky"||rect.top<=1;
 if(!followsViewport)return 0;
 return Math.max(0,Math.round(rect.bottom));
}

function desiredTargetTop(){
 return stickyHeaderOffset()+12;
}

function settleTarget(target,owner,token){
 if(owner.dataset.cphScrollToken!==token||!target.isConnected)return;
 const delta=Math.round(target.getBoundingClientRect().top-desiredTargetTop());
 if(Math.abs(delta)>2)window.scrollBy({top:delta,behavior:"auto"});
}

function scrollTargetBelowHeader(target,owner){
 if(!target||!owner)return;
 const token=String((Number(owner.dataset.cphScrollToken)||0)+1);
 owner.dataset.cphScrollToken=token;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(owner.dataset.cphScrollToken!==token||!target.isConnected)return;
  const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-desiredTargetTop());
  window.scrollTo({top,behavior:"smooth"});
  window.setTimeout(()=>settleTarget(target,owner,token),420);
 }));
}

function bindSectionAutoScroll(){
 document.querySelectorAll("#programme details").forEach(details=>{
  const summary=directSummary(details);
  if(!summary||details.dataset.cphSectionScrollBound==="1")return;
  details.dataset.cphSectionScrollBound="1";
  details.addEventListener("toggle",()=>scrollTargetBelowHeader(summary,details));
 });
}

function bindDayAutoScroll(){
 document.querySelectorAll("#programme .day-banner").forEach(banner=>{
  const button=banner.querySelector(":scope > .cph-day-toggle");
  if(!button||button.dataset.cphDayScrollBound==="1")return;
  button.dataset.cphDayScrollBound="1";
  button.addEventListener("click",()=>{
   window.setTimeout(()=>scrollTargetBelowHeader(banner,banner),0);
  });
 });
}

function normalizedText(element){
 return (element?.textContent||"").replace(/\s+/g," ").trim();
}

function escapeXml(value){
 return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[char]));
}

function visitName(details){
 const summary=directSummary(details);
 const title=summary?.querySelector(".summary-title-name,.visit-title,.place-title,h2,h3,h4,strong");
 return (normalizedText(title)||"Lieu à visiter").slice(0,56);
}

function genericHeroDataUrl(name){
 const safe=escapeXml(name);
 const lower=String(name).toLowerCase();
 const safari=/safari|zoo|animal|faune|wildlife|savane|savannah/.test(lower);
 const scene=safari
  ? `<g><circle cx="925" cy="150" r="72" fill="#ffd98a" opacity=".95"/><path d="M0 460C180 420 320 455 500 430s330-8 700 18v227H0Z" fill="#c89959"/><path d="M840 385c35-90 90-105 142-28-42-4-74 9-104 36 38-6 79 7 102 34-58-11-101-2-137 25-12-27-13-49-3-67Z" fill="#405f56"/><rect x="885" y="386" width="15" height="105" rx="6" fill="#405f56"/><g transform="translate(470 440)" fill="#334e4a"><ellipse cx="0" cy="20" rx="88" ry="48"/><circle cx="86" cy="5" r="33"/><rect x="-52" y="44" width="20" height="82" rx="8"/><rect x="20" y="44" width="20" height="82" rx="8"/><path d="M112 8c28 18 28 58 8 84" fill="none" stroke="#334e4a" stroke-width="18" stroke-linecap="round"/><path d="M-83 14c-30-15-41-3-47 14" fill="none" stroke="#334e4a" stroke-width="10" stroke-linecap="round"/></g></g>`
  : `<g><circle cx="955" cy="130" r="64" fill="#fff0b8" opacity=".92"/><path d="M0 430 150 352l95 58 155-120 120 101 130-170 142 148 120-91 145 115 113-64 100 76v270H0Z" fill="#6f8d87" opacity=".28"/><path d="M0 478h1200v197H0Z" fill="#75adbd"/><path d="M0 505c165-34 275 28 418 3s250-16 362 7 260 16 420-10" fill="none" stroke="#dff4f4" stroke-width="9" opacity=".72"/><g fill="#385d64"><rect x="150" y="347" width="96" height="132" rx="3"/><rect x="263" y="314" width="116" height="165" rx="3"/><rect x="398" y="358" width="98" height="121" rx="3"/><path d="M321 314v-80l17-40 17 40v80Z"/></g></g>`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="Illustration de ${safe}"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9ddf2"/><stop offset="1" stop-color="#f6dfbd"/></linearGradient></defs><rect width="1200" height="675" fill="url(#sky)"/>${scene}<rect x="70" y="70" width="1060" height="92" rx="28" fill="#173846" opacity=".8"/><text x="600" y="129" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="40" font-weight="700" fill="white">${safe}</text></svg>`;
 return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function useGenericImage(img,name){
 if(img.dataset.cphHeroFallbackApplied==="1")return;
 img.dataset.cphHeroFallbackApplied="1";
 img.removeAttribute("srcset");
 img.removeAttribute("sizes");
 img.src=genericHeroDataUrl(name);
 img.classList.add("cph-generic-visit-image");
}

function ensureVisitHeroImages(){
 document.querySelectorAll("#programme details.visit-details").forEach(details=>{
  const summary=directSummary(details);
  if(!summary)return;
  const name=visitName(details);
  const images=Array.from(details.querySelectorAll("img")).filter(img=>!summary.contains(img)&&!img.closest(".cph-generated-hero"));

  images.forEach(img=>{
   if(img.dataset.cphHeroFallbackBound!=="1"){
    img.dataset.cphHeroFallbackBound="1";
    img.addEventListener("error",()=>useGenericImage(img,name),{once:true});
   }
   const hasDeferredSource=!!(img.dataset.src||img.getAttribute("data-src")||img.getAttribute("data-lazy-src"));
   if((!img.getAttribute("src")&&!hasDeferredSource)||(img.complete&&img.naturalWidth===0&&!hasDeferredSource)){
    useGenericImage(img,name);
   }
  });

  if(images.length||details.querySelector(":scope > .cph-generated-hero"))return;

  const hero=document.createElement("div");
  hero.className="cph-generated-hero";
  const img=document.createElement("img");
  img.className="cph-generic-visit-image";
  img.alt=`Illustration de ${name}`;
  img.src=genericHeroDataUrl(name);
  hero.appendChild(img);
  summary.insertAdjacentElement("afterend",hero);
 });
}

function refresh(){
 restoreLegacySectionIcons();
 bindSectionAutoScroll();
 bindDayAutoScroll();
 ensureVisitHeroImages();
}

document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
else refresh();
})();
