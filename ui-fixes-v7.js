(function(){
"use strict";
const STYLE_ID="cph-ui-fixes-v8";
function addStyles(){
 const old=document.getElementById("cph-ui-fixes-v7");
 if(old)old.remove();
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement("style");
 s.id=STYLE_ID;
 s.textContent=`
/* Programme : alignement stable, sans recalcul ni oscillation verticale. */
#programme .mini-badge.nature.cph-nature-autoalign{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;line-height:1!important;vertical-align:middle!important}
#programme .mini-badge.nature.cph-nature-autoalign>.cph-nature-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;margin:0!important;padding:0!important;position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;line-height:1!important;vertical-align:middle!important;transform:none!important;will-change:auto!important}
#programme .mini-badge.nature.cph-nature-autoalign>.cph-nature-label{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;line-height:1!important;vertical-align:middle!important}
/* Réservations : exactement un calendrier simple, sans seconde icône ni texte Réservé. */
#programme .cph-reserved-duplicate{display:none!important}
#programme .mini-badge.booking.reserved.cph-reserved-simple{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:18px!important;min-width:18px!important;max-width:18px!important;height:22px!important;min-height:22px!important;max-height:22px!important;margin:0 0 0 3px!important;padding:0!important;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;filter:none!important;font-size:0!important;line-height:1!important;overflow:visible!important;vertical-align:middle!important}
#programme .mini-badge.booking.reserved.cph-reserved-simple>*{display:none!important}
#programme .mini-badge.booking.reserved.cph-reserved-simple::before{content:"📅"!important;display:block!important;font-size:15px!important;line-height:1!important;margin:0!important;padding:0!important}
#programme .mini-badge.booking.reserved.cph-reserved-simple::after{content:none!important;display:none!important}
/* Ligne Programme : réglages déjà validés. */
#programme .history-actions{grid-template-columns:minmax(0,1fr) 48px 48px minmax(0,1fr)!important;gap:5px!important;align-items:center!important}
#programme .history-actions>#dayButtons,#programme .history-actions>.compact-hide-done{box-sizing:border-box!important;width:100%!important;height:42px!important;min-height:42px!important;max-height:42px!important;margin:0!important}
#programme .history-actions .day-select,#programme .history-actions .day-select-label,#programme .history-actions>.compact-hide-done{box-sizing:border-box!important;height:42px!important;min-height:42px!important;max-height:42px!important;font-size:13px!important;font-weight:850!important;line-height:1.05!important}
#programme .history-actions .day-select-label,#programme .history-actions>.compact-hide-done{display:flex!important;align-items:center!important;justify-content:center!important;padding:0 5px!important;text-align:center!important}
#programme .history-actions>#undoActionBtn,#programme .history-actions>#redoActionBtn{box-sizing:border-box!important;width:48px!important;min-width:48px!important;max-width:48px!important;height:42px!important;min-height:42px!important;max-height:42px!important;margin:0!important;padding:0!important;border-radius:10px!important;font-size:23px!important;line-height:1!important;touch-action:manipulation!important}
/* Carte : réglage déjà validé. */
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
function markDuplicate(el){
 if(!el||el.classList.contains("cph-reserved-simple"))return;
 el.classList.add("cph-reserved-duplicate");
 el.setAttribute("aria-hidden","true");
}
function looksLikeCalendarOnly(el){
 if(!el)return false;
 const txt=(el.textContent||"").replace(/\s+/g,"").trim();
 const cls=String(el.className||"");
 const aria=`${el.getAttribute("aria-label")||""} ${el.getAttribute("title")||""}`;
 return /^[📅🗓️🗓]$/.test(txt)||/reserv|booking/i.test(`${cls} ${aria}`);
}
function normalizeReservations(){
 document.querySelectorAll("#programme .visit-summary").forEach(summary=>{
  const badges=Array.from(summary.querySelectorAll(".mini-badge.booking.reserved"));
  const keep=badges.find(b=>b.closest(".summary-title-tools"))||badges[0]||null;
  if(keep){
   keep.classList.add("cph-reserved-simple");
   keep.classList.remove("cph-reserved-duplicate");
   if(keep.getAttribute("aria-label")!=="Réservé")keep.setAttribute("aria-label","Réservé");
   if(keep.getAttribute("title")!=="Réservé")keep.setAttribute("title","Réservé");
   keep.removeAttribute("aria-hidden");
   badges.forEach(b=>{if(b!==keep)markDuplicate(b)});
  }
  const scope=keep?.closest(".summary-title-tools")||summary;
  Array.from(scope.querySelectorAll("*")).forEach(el=>{
   if(el===keep||(keep&&(el.contains(keep)||keep.contains(el))))return;
   const raw=(el.textContent||"").replace(/\s+/g," ").trim();
   const withoutCalendar=raw.replace(/[📅🗓️🗓]/g,"").replace(/\s+/g," ").trim();
   if(/^réservé$/i.test(withoutCalendar)||/^reserve$/i.test(withoutCalendar)){
    const prev=el.previousElementSibling;
    const next=el.nextElementSibling;
    markDuplicate(el);
    if(looksLikeCalendarOnly(prev))markDuplicate(prev);
    if(looksLikeCalendarOnly(next))markDuplicate(next);
   }
  });
 });
}
function mapGoButtons(){
 document.querySelectorAll("#carte .map-walk-icon").forEach(a=>{
  if(!a.classList.contains("cph-map-go-now"))a.classList.add("cph-map-go-now");
  if((a.textContent||"").trim()!=="J’y vais")a.textContent="J’y vais";
  if(a.getAttribute("aria-label")!=="J’y vais")a.setAttribute("aria-label","J’y vais");
  if(a.getAttribute("title")!=="J’y vais")a.setAttribute("title","J’y vais");
 });
}
let observer=null;
let scheduled=false;
function polish(){
 scheduled=false;
 if(observer)observer.disconnect();
 try{
  addStyles();
  prepareNatureBadges();
  normalizeReservations();
  mapGoButtons();
  document.documentElement.dataset.cphUiFixes="v8";
 }finally{
  if(observer&&document.body)observer.observe(document.body,{childList:true,subtree:true});
 }
}
function schedule(){
 if(scheduled)return;
 scheduled=true;
 requestAnimationFrame(()=>setTimeout(polish,30));
}
function start(){
 observer=new MutationObserver(schedule);
 polish();
 [150,500,1200].forEach(ms=>setTimeout(schedule,ms));
 window.addEventListener("resize",schedule,{passive:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
