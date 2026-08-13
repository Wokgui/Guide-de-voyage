(function(){
"use strict";
["__cphUiFixesStableV10","__cphUiFixesStableV11","__cphUiFixesStableV12","__cphUiFixesStableV13"].forEach(k=>{if(window[k]&&typeof window[k].stop==="function")window[k].stop()});
const GLOBAL_KEY="__cphUiFixesStableV13";
const STYLE_ID="cph-ui-fixes-v13";
["cph-ui-fixes-v7","cph-ui-fixes-v8","cph-ui-fixes-v9","cph-ui-fixes-v10","cph-ui-fixes-v11","cph-ui-fixes-v12",STYLE_ID].forEach(id=>document.getElementById(id)?.remove());
let observer=null,scheduled=false;
const norm=e=>(e&&e.textContent||"").replace(/\s+/g," ").trim();
function important(el,name,value){if(el)el.style.setProperty(name,value,"important")}
function addStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement("style");
 s.id=STYLE_ID;
 s.textContent=`
/* Types de lieux : alignement fixe, sans calcul vertical ni oscillation. */
#programme .mini-badge.nature.cph-nature-autoalign{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;line-height:1!important;vertical-align:middle!important}
#programme .mini-badge.nature.cph-nature-autoalign>.cph-nature-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;margin:0!important;padding:0!important;position:static!important;inset:auto!important;line-height:1!important;vertical-align:middle!important;transform:none!important;will-change:auto!important}
#programme .mini-badge.nature.cph-nature-autoalign>.cph-nature-label{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;line-height:1!important;vertical-align:middle!important}
/* Réservations : tout marquage d'origine est caché ; un seul calendrier simple est recréé. */
#programme .visit-summary .cph-reserved-original-hidden,#programme .visit-summary .mini-badge.booking.reserved{display:none!important}
#programme .visit-summary .cph-reserved-one{display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;width:20px!important;min-width:20px!important;max-width:20px!important;height:22px!important;min-height:22px!important;max-height:22px!important;margin:0 0 0 4px!important;padding:0!important;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;filter:none!important;font-size:16px!important;line-height:1!important;vertical-align:middle!important}
/* Barre Programme : boutons centraux réduits, case ancrée et textes latéraux entièrement visibles. */
#programme .history-actions{display:grid!important;grid-template-columns:minmax(0,1fr) 42px 42px minmax(0,1fr)!important;gap:4px!important;align-items:center!important;width:100%!important}
#programme .history-actions>#dayButtons,#programme .history-actions>.compact-hide-done{box-sizing:border-box!important;width:100%!important;min-width:0!important;max-width:none!important;justify-self:stretch!important;overflow:hidden!important}
#programme .history-actions>#dayButtons,#programme .history-actions>.compact-hide-done,#programme .history-actions>#undoActionBtn,#programme .history-actions>#redoActionBtn{box-sizing:border-box!important;margin:0!important;align-self:center!important}
#programme .history-actions .day-select,#programme .history-actions .day-select-label,#programme .history-actions>.compact-hide-done{font-size:12px!important;font-weight:850!important;line-height:1!important}
#programme .history-actions .day-select-label{display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;padding-left:5px!important;padding-right:5px!important;white-space:nowrap!important}
#programme .history-actions>.compact-hide-done{position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;padding-left:25px!important;padding-right:3px!important;white-space:normal!important}
#programme .history-actions>.compact-hide-done input[type="checkbox"]{display:block!important;visibility:visible!important;opacity:1!important;position:absolute!important;left:5px!important;top:50%!important;transform:translateY(-50%)!important;z-index:2!important;width:16px!important;min-width:16px!important;max-width:16px!important;height:16px!important;min-height:16px!important;max-height:16px!important;margin:0!important;padding:0!important;flex:none!important}
#programme .history-actions>.compact-hide-done span{display:block!important;min-width:0!important;max-width:100%!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important;line-height:.95!important;text-align:center!important}
#programme .history-actions>#undoActionBtn,#programme .history-actions>#redoActionBtn{width:42px!important;min-width:42px!important;max-width:42px!important;padding:0!important;border-radius:10px!important;font-size:24px!important;line-height:1!important;touch-action:manipulation!important}
/* Carte : bouton J'y vais déjà validé. */
#carte .map-list-item .map-walk-icon.cph-map-go-now{position:absolute!important;right:7px!important;bottom:7px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;width:62px!important;min-width:62px!important;max-width:62px!important;height:30px!important;min-height:30px!important;max-height:30px!important;margin:0!important;padding:0 6px!important;border:0!important;outline:0!important;border-radius:9px!important;background:linear-gradient(180deg,#199d7c,#08785f)!important;box-shadow:none!important;color:#fff!important;font-size:10px!important;font-weight:900!important;line-height:1!important;text-decoration:none!important;transform:none!important;z-index:3!important;touch-action:manipulation!important}
`;
 document.head.appendChild(s);
}
function prepareNatureBadges(){
 document.querySelectorAll("#programme .mini-badge.nature").forEach(badge=>{
  badge.classList.add("cph-nature-autoalign");
  badge.style.removeProperty("--cph-nature-shift");
  const icon=badge.querySelector(":scope > .nature-emoji, :scope > svg, :scope > img, :scope > i, :scope > [aria-hidden='true']");
  if(!icon)return;
  icon.classList.add("cph-nature-icon");
  if(badge.querySelector(":scope > .cph-nature-label"))return;
  const textNodes=Array.from(badge.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE&&(n.textContent||"").trim());
  const labelText=textNodes.map(n=>(n.textContent||"").trim()).filter(Boolean).join(" ");
  if(!labelText)return;
  textNodes.forEach(n=>n.remove());
  const label=document.createElement("span");
  label.className="cph-nature-label";
  label.textContent=labelText;
  badge.appendChild(label);
 });
}
function iconOnly(el){
 if(!el)return false;
 const t=norm(el).replace(/\s+/g,"");
 if(/^[📅🗓️🗓]$/.test(t))return true;
 if(el.matches?.("svg,img,i,.icon,[class*='icon']"))return true;
 if(el.getAttribute?.("aria-hidden")==="true"&&!/[A-Za-zÀ-ÿ0-9]/.test(t))return true;
 return false;
}
function hideOriginal(el){
 if(!el||el.classList?.contains("cph-reserved-one"))return;
 el.classList?.add("cph-reserved-original-hidden");
 el.setAttribute?.("aria-hidden","true");
}
function normalizeReservations(){
 document.querySelectorAll("#programme .visit-summary").forEach(summary=>{
  const all=Array.from(summary.querySelectorAll("*"));
  let hasReservation=!!summary.querySelector(".mini-badge.booking.reserved");
  all.forEach(el=>{
   if(el.classList.contains("cph-reserved-one"))return;
   const raw=norm(el);
   const noCalendar=raw.replace(/[📅🗓️🗓]/g,"").replace(/\s+/g," ").trim();
   const attrs=`${el.getAttribute("aria-label")||""} ${el.getAttribute("title")||""}`;
   if(/^réservé$/i.test(noCalendar)||/^reserve$/i.test(noCalendar)||/réserv|reserv/i.test(attrs))hasReservation=true;
  });
  if(!hasReservation){summary.querySelectorAll(":scope .cph-reserved-one").forEach(e=>e.remove());return;}
  summary.querySelectorAll(".mini-badge.booking.reserved").forEach(hideOriginal);
  all.forEach(el=>{
   if(el.classList.contains("cph-reserved-one"))return;
   const raw=norm(el);
   const noCalendar=raw.replace(/[📅🗓️🗓]/g,"").replace(/\s+/g," ").trim();
   const attrs=`${el.getAttribute("aria-label")||""} ${el.getAttribute("title")||""}`;
   const exact=/^réservé$/i.test(noCalendar)||/^reserve$/i.test(noCalendar);
   const attrReserved=/réserv|reserv/i.test(attrs);
   if(!exact&&!attrReserved)return;
   const prev=el.previousElementSibling,next=el.nextElementSibling;
   hideOriginal(el);
   if(iconOnly(prev))hideOriginal(prev);
   if(iconOnly(next))hideOriginal(next);
  });
  let one=summary.querySelector(".cph-reserved-one");
  summary.querySelectorAll(".cph-reserved-one").forEach((e,i)=>{if(i>0)e.remove()});
  if(!one){
   one=document.createElement("span");
   one.className="cph-reserved-one";
   one.textContent="📅";
   one.setAttribute("aria-label","Réservé");
   one.setAttribute("title","Réservé");
   const nature=summary.querySelector(".summary-title-tools .summary-line:first-child .mini-badge.nature")||summary.querySelector(".mini-badge.nature");
   const line=nature?.parentElement||summary.querySelector(".summary-title-tools .summary-line:first-child")||summary.querySelector(".summary-title-tools")||summary;
   if(nature&&nature.parentElement===line)nature.insertAdjacentElement("afterend",one);else line.appendChild(one);
  }
 });
}
function measureNativeHeight(row,controls){
 const saved=Number(row.dataset.cphNativeActionHeight||0);
 if(saved>=24&&saved<=60)return saved;
 const values=controls.map(el=>el?.getBoundingClientRect().height||0).filter(v=>v>=24&&v<=60).sort((a,b)=>a-b);
 const h=values.length?values[Math.floor(values.length/2)]:34;
 row.dataset.cphNativeActionHeight=String(h);
 return h;
}
function fixHistoryActions(){
 document.querySelectorAll("#programme .history-actions").forEach(row=>{
  const day=row.querySelector(":scope > #dayButtons")||row.querySelector("#dayButtons");
  const undo=row.querySelector("#undoActionBtn");
  const redo=row.querySelector("#redoActionBtn");
  const hide=row.querySelector(":scope > .compact-hide-done")||row.querySelector(".compact-hide-done");
  if(!day||!undo||!redo||!hide)return;
  const h=measureNativeHeight(row,[undo,redo,hide]);
  important(row,"display","grid");important(row,"grid-template-columns","minmax(0,1fr) 42px 42px minmax(0,1fr)");important(row,"gap","4px");important(row,"align-items","center");
  [day,undo,redo,hide].forEach(el=>{important(el,"box-sizing","border-box");important(el,"height",`${h}px`);important(el,"min-height",`${h}px`);important(el,"max-height",`${h}px`);important(el,"margin","0");important(el,"align-self","center")});
  [day,hide].forEach(el=>{important(el,"width","100%");important(el,"min-width","0");important(el,"max-width","none")});
  const dayControls=Array.from(day.querySelectorAll("button,label,select,.day-select,.day-select-label"));
  dayControls.forEach(el=>{important(el,"box-sizing","border-box");important(el,"height",`${h}px`);important(el,"min-height",`${h}px`);important(el,"max-height",`${h}px`);important(el,"margin","0");important(el,"font-size","12px");important(el,"line-height","1")});
  important(hide,"position","relative");important(hide,"font-size","12px");important(hide,"line-height","1");important(hide,"padding-left","25px");important(hide,"padding-right","3px");important(hide,"white-space","normal");
  const hideText=hide.querySelector("span");if(hideText){important(hideText,"white-space","normal");important(hideText,"line-height",".95");important(hideText,"text-align","center");important(hideText,"overflow","visible")}
  const check=hide.querySelector('input[type="checkbox"]');
  if(check){important(check,"display","block");important(check,"visibility","visible");important(check,"opacity","1");important(check,"position","absolute");important(check,"left","5px");important(check,"top","50%");important(check,"transform","translateY(-50%)");important(check,"z-index","2");important(check,"width","16px");important(check,"min-width","16px");important(check,"max-width","16px");important(check,"height","16px");important(check,"min-height","16px");important(check,"max-height","16px");important(check,"margin","0");important(check,"padding","0");important(check,"flex","none")}
  [undo,redo].forEach(el=>{important(el,"width","42px");important(el,"min-width","42px");important(el,"max-width","42px");important(el,"font-size","24px");important(el,"padding","0");important(el,"line-height","1")});
 });
}
function mapGoButtons(){
 document.querySelectorAll("#carte .map-walk-icon").forEach(a=>{
  a.classList.add("cph-map-go-now");
  if(norm(a)!=="J’y vais")a.textContent="J’y vais";
  a.setAttribute("aria-label","J’y vais");a.setAttribute("title","J’y vais");
 });
}
function polish(){
 scheduled=false;
 if(observer)observer.disconnect();
 try{addStyles();prepareNatureBadges();normalizeReservations();fixHistoryActions();mapGoButtons();document.documentElement.dataset.cphUiFixes="v13";}
 finally{if(observer&&document.body)observer.observe(document.body,{childList:true,subtree:true});}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>setTimeout(polish,30));}
function start(){observer=new MutationObserver(schedule);polish();[150,500,1200].forEach(ms=>setTimeout(schedule,ms));window.addEventListener("resize",schedule,{passive:true});}
window[GLOBAL_KEY]={stop(){observer?.disconnect();observer=null;scheduled=false;}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();