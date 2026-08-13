(function(){
"use strict";
const STYLE_ID="cph-day-style-v3";
const PALETTE={
 lundi:{bg:"#f8e9df",border:"#d7aa8d",ink:"#6d4937"},
 mardi:{bg:"#f7e8d8",border:"#d6a677",ink:"#6f4a2c"},
 mercredi:{bg:"#e7f0df",border:"#a9c392",ink:"#3f6240"},
 jeudi:{bg:"#e4eef7",border:"#9dbbd2",ink:"#355d78"},
 vendredi:{bg:"#eee5f5",border:"#bba5d2",ink:"#634a7c"},
 samedi:{bg:"#f7ead9",border:"#d8b27c",ink:"#75532f"},
 dimanche:{bg:"#f3e5e8",border:"#d4a8b0",ink:"#744e57"}
};
const norm=e=>(e&&e.textContent||"").replace(/\s+/g," ").trim();
const dayRx=/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
function addStyle(){
 ["cph-day-style-v1","cph-day-style-v2"].forEach(id=>document.getElementById(id)?.remove());
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement("style");
 s.id=STYLE_ID;
 s.textContent=`
#programme .cph-day-card-v3{
 box-sizing:border-box!important;
 border:1.5px solid var(--cph-day-border)!important;
 border-radius:18px!important;
 overflow:hidden!important;
 background:rgba(255,255,255,.58)!important;
}
#programme .cph-day-header-v3{
 box-sizing:border-box!important;
 background:var(--cph-day-bg)!important;
 color:var(--cph-day-ink)!important;
 border:0!important;
 border-bottom:1px solid color-mix(in srgb,var(--cph-day-border) 58%,transparent)!important;
 border-radius:17px 17px 0 0!important;
 box-shadow:none!important;
 position:relative!important;
 z-index:2!important;
}
#programme .cph-day-header-v3 .cph-day-title-v3{color:var(--cph-day-ink)!important}
#programme .cph-day-header-v3 .cph-day-departure-v3{background:rgba(255,255,255,.78)!important;color:var(--cph-day-ink)!important}
`;
 document.head.appendChild(s);
}
function leafDays(root){
 return Array.from(root.querySelectorAll("span,div,strong,b,h2,h3,h4"))
  .filter(el=>dayRx.test(norm(el))&&norm(el).length<70)
  .filter(el=>!Array.from(el.children).some(c=>dayRx.test(norm(c))&&norm(c).length<70));
}
function visits(el){return Math.max(el?.querySelectorAll?.(".visit-details").length||0,el?.querySelectorAll?.(".visit-summary").length||0)}
function containsOtherDay(el,current,days){return days.some(d=>d!==current&&el.contains(d))}
function findOuterDayCard(dayEl,days,root){
 let n=dayEl,best=null;
 while(n&&n!==root&&n!==document.body){
  if(visits(n)>0&&!containsOtherDay(n,dayEl,days))best=n;
  const p=n.parentElement;
  if(!p||p===root||containsOtherDay(p,dayEl,days))break;
  n=p;
 }
 return best;
}
function departureLeaf(card){
 return Array.from(card.querySelectorAll("span,div,p,strong,b,small,button,label"))
  .filter(el=>/départ\s+prévu/i.test(norm(el))&&norm(el).length<110)
  .sort((a,b)=>a.children.length-b.children.length||norm(a).length-norm(b).length)[0]||null;
}
function lca(a,b,limit){
 const set=new Set();let n=a;
 while(n){set.add(n);if(n===limit)break;n=n.parentElement}
 n=b;while(n){if(set.has(n))return n;if(n===limit)break;n=n.parentElement}
 return null;
}
function findHeader(card,dayEl,dep){
 let h=lca(dayEl,dep,card);
 if(!h||h===card)return null;
 while(h.parentElement&&h.parentElement!==card&&visits(h.parentElement)===0)h=h.parentElement;
 return h;
}
function clearLegacy(){
 document.querySelectorAll("#programme .cph-day-card-v1,#programme .cph-day-card-v2").forEach(e=>e.classList.remove("cph-day-card-v1","cph-day-card-v2"));
 document.querySelectorAll("#programme .cph-day-header-v1,#programme .cph-day-header-v2").forEach(e=>e.classList.remove("cph-day-header-v1","cph-day-header-v2"));
 document.querySelectorAll("#programme .cph-day-title-v3,#programme .cph-day-departure-v3").forEach(e=>e.classList.remove("cph-day-title-v3","cph-day-departure-v3"));
}
function flush(card,header){
 ["margin-left","margin-right","margin-top","width","max-width"].forEach(p=>header.style.removeProperty(p));
 const cr=card.getBoundingClientRect(),hr=header.getBoundingClientRect();
 if(!cr.width||!hr.width)return;
 const left=Math.max(0,hr.left-cr.left);
 const right=Math.max(0,cr.right-hr.right);
 const top=Math.max(0,hr.top-cr.top);
 header.style.setProperty("margin-left",`${-left}px`,"important");
 header.style.setProperty("margin-right",`${-right}px`,"important");
 header.style.setProperty("margin-top",`${-top}px`,"important");
 header.style.setProperty("width",`calc(100% + ${left+right}px)`,"important");
 header.style.setProperty("max-width","none","important");
}
function apply(){
 const root=document.getElementById("programme");if(!root)return;
 addStyle();clearLegacy();
 const days=leafDays(root),seen=new Set();
 days.forEach(dayEl=>{
  const card=findOuterDayCard(dayEl,days,root);if(!card||seen.has(card))return;
  const dep=departureLeaf(card);if(!dep)return;
  const header=findHeader(card,dayEl,dep);if(!header||visits(header)>0)return;
  const key=(norm(dayEl).toLowerCase().match(dayRx)||[])[1];
  const p=PALETTE[key]||PALETTE.mardi;
  card.classList.add("cph-day-card-v3");header.classList.add("cph-day-header-v3");
  dayEl.classList.add("cph-day-title-v3");dep.classList.add("cph-day-departure-v3");
  card.style.setProperty("--cph-day-bg",p.bg);card.style.setProperty("--cph-day-border",p.border);card.style.setProperty("--cph-day-ink",p.ink);
  flush(card,header);seen.add(card);
 });
 document.documentElement.dataset.cphDayStyle=`v3-${seen.size}`;
}
let timer=0;const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(apply),45)};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
[120,300,700,1400,2600,4200].forEach(ms=>setTimeout(schedule,ms));
window.addEventListener("resize",schedule,{passive:true});
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
