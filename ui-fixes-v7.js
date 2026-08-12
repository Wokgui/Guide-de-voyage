(function(){
"use strict";
const STYLE_ID="cph-ui-fixes-v7";
function addStyles(){
 if(document.getElementById(STYLE_ID))return;
 const s=document.createElement("style");
 s.id=STYLE_ID;
 s.textContent=`
/* Programme : l'icône de nature est centrée optiquement sur son libellé. */
#programme .mini-badge.nature.cph-nature-autoalign{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;line-height:1!important;vertical-align:middle!important}
#programme .mini-badge.nature.cph-nature-autoalign>.cph-nature-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;flex:0 0 auto!important;margin:0!important;padding:0!important;position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;line-height:1!important;vertical-align:middle!important;transform:translateY(var(--cph-nature-shift,0px))!important}
#programme .mini-badge.nature.cph-nature-autoalign>.cph-nature-label{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:0!important;line-height:1!important;vertical-align:middle!important}
/* Réservations : un seul calendrier simple, sans tuile ni mot Réservé. */
#programme .mini-badge.booking.reserved.cph-reserved-duplicate{display:none!important}
#programme .mini-badge.booking.reserved.cph-reserved-simple{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:18px!important;min-width:18px!important;max-width:18px!important;height:22px!important;min-height:22px!important;max-height:22px!important;margin:0 0 0 3px!important;padding:0!important;border:0!important;outline:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;filter:none!important;font-size:0!important;line-height:1!important;overflow:visible!important}
#programme .mini-badge.booking.reserved.cph-reserved-simple::before{content:"📅"!important;display:block!important;font-size:15px!important;line-height:1!important;margin:0!important;padding:0!important}
#programme .mini-badge.booking.reserved.cph-reserved-simple>*{display:none!important}
/* Ligne Programme : deux tuiles extrêmes strictement identiques, texte plus lisible. */
#programme .history-actions{grid-template-columns:minmax(0,1fr) 48px 48px minmax(0,1fr)!important;gap:5px!important;align-items:center!important}
#programme .history-actions>#dayButtons,#programme .history-actions>.compact-hide-done{box-sizing:border-box!important;width:100%!important;height:42px!important;min-height:42px!important;max-height:42px!important;margin:0!important}
#programme .history-actions .day-select,#programme .history-actions .day-select-label,#programme .history-actions>.compact-hide-done{box-sizing:border-box!important;height:42px!important;min-height:42px!important;max-height:42px!important;font-size:13px!important;font-weight:850!important;line-height:1.05!important}
#programme .history-actions .day-select-label,#programme .history-actions>.compact-hide-done{display:flex!important;align-items:center!important;justify-content:center!important;padding:0 5px!important;text-align:center!important}
#programme .history-actions>#undoActionBtn,#programme .history-actions>#redoActionBtn{box-sizing:border-box!important;width:48px!important;min-width:48px!important;max-width:48px!important;height:42px!important;min-height:42px!important;max-height:42px!important;margin:0!important;padding:0!important;border-radius:10px!important;font-size:23px!important;line-height:1!important;touch-action:manipulation!important}
/* Carte : même action J’y vais que Programme, en format compact. */
#carte .map-list-item .map-walk-icon.cph-map-go-now{position:absolute!important;right:7px!important;bottom:7px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;width:62px!important;min-width:62px!important;max-width:62px!important;height:30px!important;min-height:30px!important;max-height:30px!important;margin:0!important;padding:0 6px!important;border:0!important;outline:0!important;border-radius:9px!important;background:linear-gradient(180deg,#199d7c,#08785f)!important;box-shadow:none!important;color:#fff!important;font-size:10px!important;font-weight:900!important;line-height:1!important;text-decoration:none!important;transform:none!important;z-index:3!important;touch-action:manipulation!important}
`;
 document.head.appendChild(s);
}
function alignNatureBadges(){
 document.querySelectorAll("#programme .mini-badge.nature").forEach(badge=>{
  badge.classList.add("cph-nature-autoalign");
  const icon=badge.querySelector(":scope > .nature-emoji, :scope > svg, :scope > img, :scope > i, :scope > [aria-hidden='true']");
  if(!icon)return;
  icon.classList.add("cph-nature-icon");
  let label=badge.querySelector(":scope > .cph-nature-label");
  if(!label){
   const textNodes=Array.from(badge.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE&&(n.textContent||"").trim());
   const labelText=textNodes.map(n=>(n.textContent||"").trim()).filter(Boolean).join(" ");
   textNodes.forEach(n=>n.remove());
   if(labelText){label=document.createElement("span");label.className="cph-nature-label";label.textContent=labelText;badge.appendChild(label)}
  }
  if(!label)return;
  requestAnimationFrame(()=>{
   const ir=icon.getBoundingClientRect(),lr=label.getBoundingClientRect();
   if(!ir.height||!lr.height)return;
   const centerDelta=(lr.top+lr.height/2)-(ir.top+ir.height/2);
   const shift=Math.max(-3,Math.min(3,centerDelta));
   badge.style.setProperty("--cph-nature-shift",shift.toFixed(2)+"px");
  });
 });
}
function normalizeReservations(){
 document.querySelectorAll("#programme .visit-summary").forEach(summary=>{
  const badges=Array.from(summary.querySelectorAll(".mini-badge.booking.reserved"));
  if(!badges.length)return;
  const keep=badges.find(b=>b.closest(".summary-title-tools"))||badges[0];
  badges.forEach(b=>{
   if(b===keep){b.classList.add("cph-reserved-simple");b.classList.remove("cph-reserved-duplicate");b.setAttribute("aria-label","Réservé");b.setAttribute("title","Réservé");b.removeAttribute("aria-hidden")}
   else{b.classList.add("cph-reserved-duplicate");b.classList.remove("cph-reserved-simple");b.setAttribute("aria-hidden","true")}
  });
 });
}
function mapGoButtons(){
 document.querySelectorAll("#carte .map-walk-icon").forEach(a=>{
  a.classList.add("cph-map-go-now");
  a.textContent="J’y vais";
  a.setAttribute("aria-label","J’y vais");
  a.setAttribute("title","J’y vais");
 });
}
function polish(){addStyles();alignNatureBadges();normalizeReservations();mapGoButtons();document.documentElement.dataset.cphUiFixes="v7"}
function start(){
 polish();[120,400,1000,1800].forEach(ms=>setTimeout(polish,ms));
 const observer=new MutationObserver(()=>{clearTimeout(window.__cphUiFixV7Timer);window.__cphUiFixV7Timer=setTimeout(polish,30)});
 observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener("resize",()=>{clearTimeout(window.__cphUiFixV7Resize);window.__cphUiFixV7Resize=setTimeout(alignNatureBadges,70)},{passive:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
