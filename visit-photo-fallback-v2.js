(function(){
"use strict";
if(window.__cphVisitPhotoFallbackV4)return;
window.__cphVisitPhotoFallbackV4=true;

const FALLBACKS={
  cruise:"https://images.unsplash.com/photo-1752766402132-fb44fc036a81?auto=format&fit=crop&w=1200&q=82",
  hotel:"https://images.unsplash.com/photo-1776876648949-63ccabf63b10?auto=format&fit=crop&w=1200&q=82",
  station:"https://images.unsplash.com/photo-1661535093325-94429e630811?auto=format&fit=crop&w=1200&q=82",
  castle:"https://images.unsplash.com/photo-1561191729-8f997b749995?auto=format&fit=crop&w=1200&q=82",
  museum:"https://images.unsplash.com/photo-1502465396982-37b95ab30fbc?auto=format&fit=crop&w=1200&q=82",
  safari:"https://images.unsplash.com/photo-1774281702124-26b2dead9ee0?auto=format&fit=crop&w=1200&q=82",
  park:"https://images.unsplash.com/photo-1770823185021-76dfed76e35b?auto=format&fit=crop&w=1200&q=82",
  dining:"https://images.unsplash.com/photo-1758426637742-80bd0f983611?auto=format&fit=crop&w=1200&q=82",
  square:"https://images.unsplash.com/photo-1777295955917-222080a21b70?auto=format&fit=crop&w=1200&q=82",
  generic:"https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=82"
};

function cleanText(node){return (node?.textContent||"").replace(/\s+/g," ").trim();}
function categoryFor(scope){
  const text=cleanText(scope).toLowerCase();
  if(/croisi|canal|bateau|boat|ferry|port|harbour|havn/.test(text))return "cruise";
  if(/hôtel|hotel|hébergement|hebergement|auberge/.test(text))return "hotel";
  if(/gare|station|train|rail|métro|metro/.test(text))return "station";
  if(/château|chateau|castle|palais|palace|forteresse|citadelle/.test(text))return "castle";
  if(/musée|musee|museum|galerie|gallery|exposition|biblioth|library/.test(text))return "museum";
  if(/safari|zoo|animal|faune|wildlife/.test(text))return "safari";
  if(/parc|park|jardin|garden|botanique|nature/.test(text))return "park";
  if(/restaurant|café|cafe|bar|bistro|pâtisserie|patisserie|boulangerie|food/.test(text))return "dining";
  if(/place|square|plaza|marché|marche|market|stortorget|lilla torg/.test(text))return "square";
  return "generic";
}
function fallbackFor(scope){return FALLBACKS[categoryFor(scope)]||FALLBACKS.generic;}
function lastResortDataUrl(){
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0f5f55"/><stop offset=".48" stop-color="#77b8ad"/><stop offset="1" stop-color="#f2d6a0"/></linearGradient></defs><rect width="1200" height="800" fill="url(#a)"/></svg>';
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function isGeneratedHero(node){
  return !!node&&(node.classList?.contains("cph-category-fallback-hero")||node.classList?.contains("cph-generated-place-hero"));
}
function realExpandedImages(details,summary){
  return Array.from(details.querySelectorAll("img")).filter(img=>!summary.contains(img)&&!isGeneratedHero(img));
}
function explicitUnavailableBlock(details,summary){
  const nodes=Array.from(details.querySelectorAll("button,div,p,span,strong"));
  const marker=nodes.find(node=>{
    if(summary.contains(node))return false;
    const text=cleanText(node);
    return text==="Réessayer"||/Photo (momentanément )?indisponible/i.test(text);
  });
  if(!marker)return null;
  let candidate=marker;
  while(candidate.parentElement&&candidate.parentElement!==details){
    const parent=candidate.parentElement;
    const text=cleanText(parent);
    if(/Réessayer/.test(text)&&/Photo (momentanément )?indisponible/i.test(text))return parent;
    candidate=parent;
  }
  return marker.closest("div")||marker;
}
function makeHero(details,summary,replaceNode){
  const img=document.createElement("img");
  img.className="cph-category-photo-fallback cph-category-fallback-hero";
  img.alt="Photo d’illustration";
  img.dataset.cphFallbackCategory=categoryFor(summary);
  img.src=fallbackFor(summary);
  img.addEventListener("error",()=>{
    if(img.dataset.cphLastResort==="1")return;
    img.dataset.cphLastResort="1";
    img.src=lastResortDataUrl();
  },{once:true});
  if(replaceNode)replaceNode.replaceWith(img);
  else summary.insertAdjacentElement("afterend",img);
  return img;
}
function cleanupExpanded(details){
  const summary=details.querySelector(":scope > .visit-summary")||details.querySelector(".visit-summary");
  if(!summary)return;
  const generated=Array.from(details.querySelectorAll(".cph-category-fallback-hero,.cph-generated-place-hero"));
  const real=realExpandedImages(details,summary);
  if(real.length){
    generated.forEach(node=>node.remove());
    return;
  }
  if(generated.length>1)generated.slice(1).forEach(node=>node.remove());
}
function ensureExpandedPhoto(details){
  if(!details?.open)return;
  const summary=details.querySelector(":scope > .visit-summary")||details.querySelector(".visit-summary");
  if(!summary)return;

  cleanupExpanded(details);
  if(realExpandedImages(details,summary).length)return;

  let generated=details.querySelector(".cph-category-fallback-hero,.cph-generated-place-hero");
  if(generated)return;

  const unavailable=explicitUnavailableBlock(details,summary);
  if(unavailable){
    makeHero(details,summary,unavailable);
    return;
  }
  // Sans message explicite d'échec, on laisse le rendu natif tranquille pour éviter doubles/triples photos.
}
function refreshDetails(details){
  cleanupExpanded(details);
  if(details.open)ensureExpandedPhoto(details);
}
function bindDetails(details){
  if(details.dataset.cphPhotoFallbackV4Bound==="1")return;
  details.dataset.cphPhotoFallbackV4Bound="1";
  details.addEventListener("toggle",()=>requestAnimationFrame(()=>refreshDetails(details)));
}
function refresh(){
  document.querySelectorAll("#programme details.visit-details,#programme .visit-details").forEach(details=>{
    bindDetails(details);
    refreshDetails(details);
  });
}
document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
else refresh();
})();
