(function(){
"use strict";
if(window.__cphVisitPhotoCollapsedV3)return;
window.__cphVisitPhotoCollapsedV3=true;

const FALLBACKS={
  cruise:"https://images.unsplash.com/photo-1752766402132-fb44fc036a81?auto=format&fit=crop&w=900&q=82",
  hotel:"https://images.unsplash.com/photo-1776876648949-63ccabf63b10?auto=format&fit=crop&w=900&q=82",
  station:"https://images.unsplash.com/photo-1661535093325-94429e630811?auto=format&fit=crop&w=900&q=82",
  castle:"https://images.unsplash.com/photo-1561191729-8f997b749995?auto=format&fit=crop&w=900&q=82",
  museum:"https://images.unsplash.com/photo-1502465396982-37b95ab30fbc?auto=format&fit=crop&w=900&q=82",
  safari:"https://images.unsplash.com/photo-1774281702124-26b2dead9ee0?auto=format&fit=crop&w=900&q=82",
  park:"https://images.unsplash.com/photo-1770823185021-76dfed76e35b?auto=format&fit=crop&w=900&q=82",
  dining:"https://images.unsplash.com/photo-1758426637742-80bd0f983611?auto=format&fit=crop&w=900&q=82",
  square:"https://images.unsplash.com/photo-1777295955917-222080a21b70?auto=format&fit=crop&w=900&q=82",
  generic:"https://images.unsplash.com/photo-1777295955917-222080a21b70?auto=format&fit=crop&w=900&q=82"
};

function text(scope){return (scope?.textContent||"").replace(/\s+/g," ").trim().toLowerCase();}
function category(scope){
 const value=text(scope);
 if(/croisi|canal|bateau|boat|ferry|port|harbour|havn/.test(value))return "cruise";
 if(/hôtel|hotel|hébergement|hebergement|auberge/.test(value))return "hotel";
 if(/gare|station|train|rail|métro|metro/.test(value))return "station";
 if(/château|chateau|castle|palais|palace|forteresse/.test(value))return "castle";
 if(/musée|musee|museum|galerie|gallery|exposition/.test(value))return "museum";
 if(/safari|zoo|animal|faune|wildlife/.test(value))return "safari";
 if(/parc|park|jardin|garden|botanique|nature/.test(value))return "park";
 if(/restaurant|café|cafe|bar|bistro|pâtisserie|patisserie|boulangerie|food/.test(value))return "dining";
 if(/place|square|plaza|marché|marche|market|stortorget|lilla torg/.test(value))return "square";
 return "generic";
}
function fallback(scope){return FALLBACKS[category(scope)]||FALLBACKS.generic;}
function lastResort(){
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#155f57"/><stop offset=".5" stop-color="#79b8aa"/><stop offset="1" stop-color="#ead2a0"/></linearGradient></defs><rect width="900" height="700" fill="url(#g)"/><circle cx="690" cy="170" r="85" fill="#fff1bd" opacity=".85"/><path d="M0 540c180-75 310-50 450 20 150 75 280 55 450-35v175H0z" fill="#1f4f48" opacity=".42"/></svg>';
 return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function forceVisible(img){
 img.classList.add("visit-summary-thumb","cph-category-photo-fallback","cph-category-fallback-thumb","cph-collapsed-photo-v3");
 img.style.setProperty("display","block","important");
 img.style.setProperty("visibility","visible","important");
 img.style.setProperty("opacity","1","important");
 img.style.setProperty("object-fit","cover","important");
 img.style.setProperty("object-position","center","important");
 img.style.setProperty("background","none","important");
}
function applyFallback(img,scope){
 if(!img)return;
 forceVisible(img);
 img.removeAttribute("srcset");
 img.removeAttribute("sizes");
 img.dataset.cphCollapsedFallback="1";
 img.dataset.cphFallbackCategory=category(scope);
 img.src=fallback(scope);
 img.addEventListener("error",()=>{
  if(img.dataset.cphCollapsedLastResort==="1")return;
  img.dataset.cphCollapsedLastResort="1";
  img.src=lastResort();
 },{once:true});
}
function makeImage(scope,oldNode){
 const img=document.createElement("img");
 if(oldNode?.classList)oldNode.classList.forEach(name=>img.classList.add(name));
 img.alt="Photo d’illustration";
 forceVisible(img);
 if(oldNode)oldNode.replaceWith(img);
 applyFallback(img,scope);
 return img;
}
function fixSummary(summary){
 const scope=summary.closest(".visit-details")||summary;
 let thumb=summary.querySelector(":scope > .visit-summary-thumb")||summary.querySelector(".visit-summary-thumb");
 if(thumb&&thumb.tagName!=="IMG"){
  makeImage(scope,thumb);
  return;
 }
 if(!thumb)thumb=summary.querySelector("img");
 if(!thumb){
  const img=makeImage(scope,null);
  const main=summary.querySelector(".summary-main");
  summary.insertBefore(img,main||summary.firstChild);
  return;
 }
 forceVisible(thumb);
 const src=String(thumb.getAttribute("src")||"").trim();
 const obsolete=thumb.classList.contains("cph-generated-place-photo")||/^data:image\/svg\+xml/i.test(src);
 if(!src||obsolete||(thumb.complete&&thumb.naturalWidth===0))applyFallback(thumb,scope);
 else if(thumb.dataset.cphCollapsedErrorBound!=="1"){
  thumb.dataset.cphCollapsedErrorBound="1";
  thumb.addEventListener("error",()=>applyFallback(thumb,scope),{once:true});
 }
}
function refresh(){document.querySelectorAll("#programme .visit-summary").forEach(fixSummary);}
document.addEventListener("guide:rendered",refresh);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});
else refresh();
})();
