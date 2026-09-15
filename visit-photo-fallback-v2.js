(function(){
"use strict";
if(window.__cphVisitPhotoFallbackV2)return;
window.__cphVisitPhotoFallbackV2=true;

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

function cleanText(node){
  return (node?.textContent||"").replace(/\s+/g," ").trim();
}

function categoryFor(scope){
  const text=cleanText(scope).toLowerCase();
  if(/croisi|canal|bateau|boat|ferry|port|harbour|havn/.test(text))return "cruise";
  if(/hôtel|hotel|hébergement|hebergement|auberge/.test(text))return "hotel";
  if(/gare|station|train|rail|métro|metro/.test(text))return "station";
  if(/château|chateau|castle|palais|palace|forteresse/.test(text))return "castle";
  if(/musée|musee|museum|galerie|gallery|exposition|biblioth|library/.test(text))return "museum";
  if(/safari|zoo|animal|faune|wildlife/.test(text))return "safari";
  if(/parc|park|jardin|garden|botanique|nature/.test(text))return "park";
  if(/restaurant|café|cafe|bar|bistro|pâtisserie|patisserie|boulangerie|food/.test(text))return "dining";
  if(/place|square|plaza|marché|marche|market|stortorget|lilla torg/.test(text))return "square";
  return "generic";
}

function fallbackFor(scope){
  return FALLBACKS[categoryFor(scope)]||FALLBACKS.generic;
}

function lastResortDataUrl(){
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0f5f55"/><stop offset=".48" stop-color="#77b8ad"/><stop offset="1" stop-color="#f2d6a0"/></linearGradient><radialGradient id="b" cx=".72" cy=".25" r=".5"><stop stop-color="#fff6cf" stop-opacity=".95"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="800" fill="url(#a)"/><rect width="1200" height="800" fill="url(#b)"/><path d="M0 610c170-100 330-90 470-10 150 85 300 50 430-40 110-76 200-65 300-15v255H0z" fill="#164a45" opacity=".42"/><path d="M0 665c190-55 350-35 520 25s365 60 680-15v125H0z" fill="#d8f1ec" opacity=".55"/></svg>';
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function isOldGenerated(img){
  const src=String(img.getAttribute("src")||"");
  return img.classList.contains("cph-generated-place-photo")||
    img.classList.contains("cph-generated-place-hero")||
    /^data:image\/svg\+xml/i.test(src);
}

function hasRealBackground(node){
  if(!node||node.tagName==="IMG")return false;
  let value=String(node.style?.backgroundImage||"");
  try{
    if((!value||value==="none")&&window.getComputedStyle)value=String(getComputedStyle(node).backgroundImage||"");
  }catch(_){ }
  return value!=="none"&&/url\(/i.test(value)&&!/data:image\/svg\+xml/i.test(value);
}

function installFallbackOnImage(img,scope,kind){
  if(!img)return;
  const useFallback=()=>{
    if(img.dataset.cphCategoryFallbackApplied==="1")return;
    img.dataset.cphCategoryFallbackApplied="1";
    img.dataset.cphFallbackCategory=categoryFor(scope);
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.src=fallbackFor(scope);
    img.classList.add("cph-category-photo-fallback",kind==="hero"?"cph-category-fallback-hero":"cph-category-fallback-thumb");
    img.addEventListener("error",()=>{
      if(img.dataset.cphLastResort==="1")return;
      img.dataset.cphLastResort="1";
      img.src=lastResortDataUrl();
    },{once:true});
  };

  const raw=String(img.getAttribute("src")||"").trim();
  if(!raw||isOldGenerated(img)||(img.complete&&img.naturalWidth===0))useFallback();
  else if(img.dataset.cphCategoryFallbackErrorBound!=="1"){
    img.dataset.cphCategoryFallbackErrorBound="1";
    img.addEventListener("error",useFallback,{once:true});
  }
}

function removeUnavailablePhotoBlocks(scope){
  if(!scope)return;
  const markers=Array.from(scope.querySelectorAll("button,div,p,span,strong"))
    .filter(node=>{
      const text=cleanText(node);
      return text==="Réessayer"||text.includes("Photo momentanément indisponible")||text.includes("Photo indisponible");
    });

  markers.forEach(marker=>{
    let candidate=marker;
    while(candidate.parentElement&&candidate.parentElement!==scope){
      const parent=candidate.parentElement;
      const text=cleanText(parent);
      const hasRetry=/Réessayer/.test(text);
      const hasUnavailable=/Photo (momentanément )?indisponible/.test(text);
      if(hasRetry&&hasUnavailable){
        candidate=parent;
        break;
      }
      candidate=parent;
    }
    if(candidate&&candidate!==scope&&!candidate.closest(".visit-summary"))candidate.remove();
  });
}

function ensureSummaryPhoto(summary){
  if(!summary)return;
  const scope=summary;
  let thumb=summary.querySelector(".visit-summary-thumb");
  if(!thumb)thumb=summary.querySelector("img");

  if(thumb&&thumb.tagName!=="IMG"){
    // Une miniature existante avec une vraie image de fond appartient au rendu d'origine : ne jamais l'écraser.
    if(hasRealBackground(thumb)&&!thumb.classList.contains("cph-category-photo-fallback"))return;
    thumb.classList.add("cph-category-fallback-thumb","cph-category-photo-fallback");
    thumb.dataset.cphFallbackCategory=categoryFor(scope);
    thumb.style.backgroundImage=`url("${fallbackFor(scope)}")`;
    thumb.style.backgroundSize="cover";
    thumb.style.backgroundPosition="center";
    return;
  }

  if(!thumb){
    thumb=document.createElement("img");
    thumb.className="visit-summary-thumb cph-category-photo-fallback cph-category-fallback-thumb";
    thumb.alt="Photo d’illustration";
    thumb.dataset.cphCategoryFallbackApplied="1";
    thumb.dataset.cphFallbackCategory=categoryFor(scope);
    thumb.src=fallbackFor(scope);
    const main=summary.querySelector(".summary-main");
    summary.insertBefore(thumb,main||summary.firstChild);
    thumb.addEventListener("error",()=>{thumb.src=lastResortDataUrl();},{once:true});
    return;
  }

  installFallbackOnImage(thumb,scope,"thumb");
}

function ensureHeroPhoto(details){
  if(!details)return;
  const summary=details.querySelector(":scope > .visit-summary")||details.querySelector(".visit-summary");
  if(!summary)return;

  removeUnavailablePhotoBlocks(details);

  const outsideImages=Array.from(details.querySelectorAll("img")).filter(img=>!summary.contains(img));
  let hero=outsideImages.find(img=>img.classList.contains("cph-category-fallback-hero")||img.classList.contains("cph-generated-place-hero"))||outsideImages[0]||null;

  if(hero){
    installFallbackOnImage(hero,summary,"hero");
  }else{
    hero=document.createElement("img");
    hero.className="cph-category-photo-fallback cph-category-fallback-hero";
    hero.alt="Photo d’illustration";
    hero.dataset.cphCategoryFallbackApplied="1";
    hero.dataset.cphFallbackCategory=categoryFor(summary);
    hero.src=fallbackFor(summary);
    summary.insertAdjacentElement("afterend",hero);
    hero.addEventListener("error",()=>{hero.src=lastResortDataUrl();},{once:true});
  }

  const generated=Array.from(details.querySelectorAll(".cph-category-fallback-hero,.cph-generated-place-hero"));
  let kept=false;
  generated.forEach(node=>{
    if(node===hero&&!kept){kept=true;return;}
    if(node!==hero)node.remove();
  });
}

function refreshDetails(details){
  const summary=details.querySelector(":scope > .visit-summary")||details.querySelector(".visit-summary");
  if(summary)ensureSummaryPhoto(summary);
  if(details.open)ensureHeroPhoto(details);
  else removeUnavailablePhotoBlocks(details);
}

function bindDetails(details){
  if(details.dataset.cphPhotoFallbackBound==="1")return;
  details.dataset.cphPhotoFallbackBound="1";
  details.addEventListener("toggle",()=>refreshDetails(details));
}

function refresh(){
  document.querySelectorAll("#programme .visit-summary").forEach(ensureSummaryPhoto);
  document.querySelectorAll("#programme details.visit-details,#programme .visit-details").forEach(details=>{
    bindDetails(details);
    refreshDetails(details);
  });
}

document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
else refresh();
})();
