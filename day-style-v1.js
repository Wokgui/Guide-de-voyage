(function(){
"use strict";
const STYLE_ID="cph-day-style-v2";
["cph-day-style-v1",STYLE_ID].forEach(id=>document.getElementById(id)?.remove());
const PALETTE={
 lundi:{bg:"#f8e9df",border:"#d7aa8d",ink:"#6d4937"},
 mardi:{bg:"#f7e8d8",border:"#d6a677",ink:"#6f4a2c"},
 mercredi:{bg:"#e7f0df",border:"#a9c392",ink:"#3f6240"},
 jeudi:{bg:"#e4eef7",border:"#9dbbd2",ink:"#355d78"},
 vendredi:{bg:"#eee5f5",border:"#bba5d2",ink:"#634a7c"},
 samedi:{bg:"#f7ead9",border:"#d8b27c",ink:"#75532f"},
 dimanche:{bg:"#f3e5e8",border:"#d4a8b0",ink:"#744e57"}
};
const FALLBACK=Object.values(PALETTE);
const norm=s=>(s||"").replace(/\s+/g," ").trim();
const dayRx=/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const isDayText=el=>dayRx.test(norm(el?.textContent))&&norm(el?.textContent).length<70;
const isDepartureText=el=>/départ\s+prévu/i.test(norm(el?.textContent))&&norm(el?.textContent).length<100;
function addStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement("style");
 s.id=STYLE_ID;
 s.textContent=`
#programme .cph-day-card-v2{
 border:1.5px solid var(--cph-day-border)!important;
 border-radius:18px!important;
 overflow:hidden!important;
 background:rgba(255,255,255,.58)!important;
 box-sizing:border-box!important;
}
#programme .cph-day-header-v2{
 box-sizing:border-box!important;
 background:var(--cph-day-bg)!important;
 color:var(--cph-day-ink)!important;
 border:0!important;
 border-bottom:1px solid color-mix(in srgb,var(--cph-day-border) 58%, transparent)!important;
 border-radius:16px 16px 0 0!important;
 box-shadow:none!important;
 position:relative!important;
 z-index:1!important;
}
#programme .cph-day-header-v2 .cph-day-text-v2{color:var(--cph-day-ink)!important}
#programme .cph-day-header-v2 .cph-day-departure-v2{background:rgba(255,255,255,.76)!important;color:var(--cph-day-ink)!important}
`;
 document.head.appendChild(s);
}
function dayKey(text){
 const m=norm(text).toLowerCase().match(dayRx);
 return m?m[1]:null;
}
function visitScore(el){
 if(!el?.querySelectorAll)return 0;
 const details=el.querySelectorAll(".visit-details").length;
 const summaries=el.querySelectorAll(".visit-summary").length;
 return Math.max(details,summaries);
}
function findCard(dayEl){
 let n=dayEl;
 let fallback=null;
 for(let i=0;i<12&&n&&n!==document.body;i++,n=n.parentElement){
  const score=visitScore(n);
  if(score>=1){
   if(!fallback)fallback=n;
   if(score>=2||n.querySelector(":scope > .visit-details, :scope > .visit-summary"))return n;
  }
 }
 return fallback;
}
function departureLeaf(card){
 const els=Array.from(card.querySelectorAll("span,div,p,strong,b,small,button,label"))
   .filter(isDepartureText)
   .sort((a,b)=>a.children.length-b.children.length || norm(a.textContent).length-norm(b.textContent).length);
 return els[0]||null;
}
function lowestCommonAncestor(a,b,limit){
 if(!a||!b)return null;
 const ancestors=new Set();
 let n=a;
 while(n&&n!==limit.parentElement){ancestors.add(n);if(n===limit)break;n=n.parentElement;}
 n=b;
 while(n&&n!==limit.parentElement){if(ancestors.has(n))return n;if(n===limit)break;n=n.parentElement;}
 return null;
}
function findHeader(card,dayEl){
 const dep=departureLeaf(card);
 if(!dep)return null;
 let lca=lowestCommonAncestor(dayEl,dep,card);
 if(!lca||lca===card)return null;
 while(lca.parentElement&&lca.parentElement!==card&&visitScore(lca.parentElement)===0){
  const p=lca.parentElement;
  if(!isDepartureText(p)&&!isDayText(p)&&p.children.length>6)break;
  lca=p;
 }
 return {header:lca,departure:dep};
}
function flushHeader(card,header){
 if(!card||!header)return;
 header.style.removeProperty("margin-left");
 header.style.removeProperty("margin-right");
 header.style.removeProperty("margin-top");
 header.style.removeProperty("width");
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
function clearOld(){
 document.querySelectorAll("#programme .cph-day-card-v1").forEach(e=>e.classList.remove("cph-day-card-v1"));
 document.querySelectorAll("#programme .cph-day-header-v1").forEach(e=>e.classList.remove("cph-day-header-v1"));
}
function mark(){
 addStyle();clearOld();
 const dayEls=Array.from(document.querySelectorAll("#programme span,#programme div,#programme strong,#programme b,#programme h2,#programme h3,#programme h4"))
  .filter(el=>isDayText(el)&&Array.from(el.children).every(c=>!isDayText(c)));
 const seen=new Set();
 let index=0;
 dayEls.forEach(dayEl=>{
  const card=findCard(dayEl);
  if(!card||seen.has(card))return;
  const found=findHeader(card,dayEl);
  if(!found)return;
  const {header,departure}=found;
  if(header===card||visitScore(header)>0)return;
  seen.add(card);
  const key=dayKey(dayEl.textContent);
  const p=(key&&PALETTE[key])||FALLBACK[index%FALLBACK.length];
  index++;
  card.classList.add("cph-day-card-v2");
  header.classList.add("cph-day-header-v2");
  dayEl.classList.add("cph-day-text-v2");
  departure.classList.add("cph-day-departure-v2");
  card.style.setProperty("--cph-day-bg",p.bg);
  card.style.setProperty("--cph-day-border",p.border);
  card.style.setProperty("--cph-day-ink",p.ink);
  flushHeader(card,header);
 });
 document.documentElement.dataset.cphDayStyle=`v2-${seen.size}`;
}
let timer=0;
const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(mark),55)};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
[180,550,1200,2200].forEach(ms=>setTimeout(schedule,ms));
window.addEventListener("resize",schedule,{passive:true});
const obs=new MutationObserver(schedule);
if(document.body)obs.observe(document.body,{childList:true,subtree:true});
})();