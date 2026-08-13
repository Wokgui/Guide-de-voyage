(function(){
"use strict";
const STYLE_ID="cph-day-style-v1";
const PALETTE={
 lundi:{bg:"#f8e9df",border:"#d7aa8d",ink:"#6d4937"},
 mardi:{bg:"#f7e8d8",border:"#d6a677",ink:"#6f4a2c"},
 mercredi:{bg:"#e7f0df",border:"#a9c392",ink:"#3f6240"},
 jeudi:{bg:"#e4eef7",border:"#9dbbd2",ink:"#355d78"},
 vendredi:{bg:"#eee5f5",border:"#bba5d2",ink:"#634a7c"},
 samedi:{bg:"#f7ead9",border:"#d8b27c",ink:"#75532f"},
 dimanche:{bg:"#f3e5e8",border:"#d4a8b0",ink:"#744e57"}
};
const FALLBACK=[
 {bg:"#f7e8d8",border:"#d6a677",ink:"#6f4a2c"},
 {bg:"#e7f0df",border:"#a9c392",ink:"#3f6240"},
 {bg:"#e4eef7",border:"#9dbbd2",ink:"#355d78"},
 {bg:"#eee5f5",border:"#bba5d2",ink:"#634a7c"},
 {bg:"#f7ead9",border:"#d8b27c",ink:"#75532f"},
 {bg:"#f3e5e8",border:"#d4a8b0",ink:"#744e57"}
];
const norm=s=>(s||"").replace(/\s+/g," ").trim();
function addStyle(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement("style");
 s.id=STYLE_ID;
 s.textContent=`
#programme .cph-day-card-v1{
 border:1.5px solid var(--cph-day-border)!important;
 border-radius:18px!important;
 overflow:hidden!important;
 background:rgba(255,255,255,.58)!important;
 box-sizing:border-box!important;
}
#programme .cph-day-header-v1{
 box-sizing:border-box!important;
 background:var(--cph-day-bg)!important;
 color:var(--cph-day-ink)!important;
 border:0!important;
 border-bottom:1px solid color-mix(in srgb,var(--cph-day-border) 58%, transparent)!important;
 border-radius:16px 16px 0 0!important;
 box-shadow:none!important;
}
#programme .cph-day-header-v1 *{color:inherit}
#programme .cph-day-header-v1 .cph-day-keep-white{background:rgba(255,255,255,.76)!important}
`;
 document.head.appendChild(s);
}
function dayKey(text){
 const t=norm(text).toLowerCase();
 return Object.keys(PALETTE).find(k=>t.startsWith(k))||null;
}
function hasDeparture(el){return /départ\s+prévu/i.test(norm(el?.textContent));}
function visitCount(el){return el?.querySelectorAll?.(".visit-details,.visit-summary")?.length||0;}
function findHeader(dayEl){
 let n=dayEl;
 for(let i=0;i<5&&n;i++,n=n.parentElement){
  if(hasDeparture(n)&&visitCount(n)===0)return n;
 }
 return dayEl.parentElement;
}
function findCard(header){
 let n=header?.parentElement;
 for(let i=0;i<7&&n;i++,n=n.parentElement){
  if(visitCount(n)>=1&&hasDeparture(n))return n;
 }
 return null;
}
function flushHeader(card,header){
 if(!card||!header)return;
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
function mark(){
 addStyle();
 const roots=Array.from(document.querySelectorAll("#programme *")).filter(el=>{
  if(el.children.length>4)return false;
  const t=norm(el.textContent);
  return /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i.test(t)&&t.length<80;
 });
 const seen=new Set();
 let index=0;
 roots.forEach(dayEl=>{
  const header=findHeader(dayEl);
  const card=findCard(header);
  if(!header||!card||seen.has(card))return;
  seen.add(card);
  const key=dayKey(dayEl.textContent);
  const p=key?PALETTE[key]:FALLBACK[index%FALLBACK.length];
  index++;
  card.classList.add("cph-day-card-v1");
  header.classList.add("cph-day-header-v1");
  card.style.setProperty("--cph-day-bg",p.bg);
  card.style.setProperty("--cph-day-border",p.border);
  card.style.setProperty("--cph-day-ink",p.ink);
  Array.from(header.querySelectorAll("span,div,button")).forEach(el=>{
   if(/départ\s+prévu/i.test(norm(el.textContent))&&el.children.length<4)el.classList.add("cph-day-keep-white");
  });
  flushHeader(card,header);
 });
 document.documentElement.dataset.cphDayStyle="v1";
}
let timer=0;
const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>requestAnimationFrame(mark),45)};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});else schedule();
[180,550,1200].forEach(ms=>setTimeout(schedule,ms));
window.addEventListener("resize",schedule,{passive:true});
const obs=new MutationObserver(schedule);
if(document.body)obs.observe(document.body,{childList:true,subtree:true});
})();
