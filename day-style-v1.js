(function(){
"use strict";
if(window.__cphDayStyleV5)return;
window.__cphDayStyleV5=true;
["cph-day-style-v1","cph-day-style-v2","cph-day-style-v3","cph-day-style-v4","cph-day-style-v5"].forEach(id=>document.getElementById(id)?.remove());
const s=document.createElement("style");
s.id="cph-day-style-v5";
s.textContent=`
/* Style 2 valide : cadre colore uniforme et en-tete teinte colle aux trois bords. */
html body #programme .day-section.day-section{
 --cph-day-bg:#f7e8d8;
 --cph-day-border:#d6a677;
 --cph-day-ink:#6f4a2c;
 box-sizing:border-box!important;
 position:relative!important;
 overflow:hidden!important;
 padding:0!important;
 border-width:1.5px!important;
 border-style:solid!important;
 border-color:var(--cph-day-border)!important;
 border-radius:18px!important;
 background:#fff!important;
 box-shadow:0 6px 18px color-mix(in srgb,var(--cph-day-border) 13%,transparent)!important;
}
html body #programme .day-section.day-section::before{content:none!important;display:none!important}
html body #programme .day-section.day-section:has(.day-Lundi){--cph-day-bg:#f8e9df;--cph-day-border:#d7aa8d;--cph-day-ink:#6d4937}
html body #programme .day-section.day-section:has(.day-Mardi){--cph-day-bg:#f7e8d8;--cph-day-border:#d6a677;--cph-day-ink:#6f4a2c}
html body #programme .day-section.day-section:has(.day-Mercredi){--cph-day-bg:#e7f0df;--cph-day-border:#a9c392;--cph-day-ink:#3f6240}
html body #programme .day-section.day-section:has(.day-Jeudi){--cph-day-bg:#e4eef7;--cph-day-border:#9dbbd2;--cph-day-ink:#355d78}
html body #programme .day-section.day-section:has(.day-Vendredi){--cph-day-bg:#eee5f5;--cph-day-border:#bba5d2;--cph-day-ink:#634a7c}
html body #programme .day-section.day-section:has(.day-Samedi){--cph-day-bg:#f7ead9;--cph-day-border:#d8b27c;--cph-day-ink:#75532f}
html body #programme .day-section.day-section:has(.day-Dimanche){--cph-day-bg:#f3e5e8;--cph-day-border:#d4a8b0;--cph-day-ink:#744e57}
html body #programme .day-section.day-section>.day-banner.day-banner,
html body #programme .day-section.day-section .day-banner.day-banner{
 box-sizing:border-box!important;
 align-self:stretch!important;
 width:100%!important;
 max-width:none!important;
 margin:0!important;
 border:0!important;
 border-bottom:1px solid color-mix(in srgb,var(--cph-day-border) 58%,transparent)!important;
 border-radius:16.5px 16.5px 0 0!important;
 background:var(--cph-day-bg)!important;
 color:var(--cph-day-ink)!important;
 box-shadow:none!important;
}
html body #programme .day-section.day-section .day-banner.day-banner *{color:inherit}

/* Événement réservé ouvert : conserver uniquement le calendrier créé pour l'état replié. */
html body #programme .visit-details[open] .visit-summary .mini-badge.booking.reserved,
html body #programme .visit-details[open] .visit-summary .cph-reserved-original-hidden{
 display:none!important;
 visibility:hidden!important;
 width:0!important;min-width:0!important;max-width:0!important;
 height:0!important;min-height:0!important;max-height:0!important;
 margin:0!important;padding:0!important;overflow:hidden!important;
}
html body #programme .visit-details[open] .visit-summary .cph-reserved-one{
 display:inline-flex!important;
 align-items:center!important;
 justify-content:center!important;
}

/* « À commander » : l'étoile et le libellé forment un bloc centré dans toutes les vues. */
html body .recommend-box>b,
html body .reservation-order>b{
 display:flex!important;
 width:100%!important;
 align-items:center!important;
 justify-content:center!important;
 gap:4px!important;
 text-align:center!important;
}
`;
document.head.appendChild(s);
function normalizeOrderHeadings(){
 document.querySelectorAll(".recommend-box>b,.reservation-order>b").forEach(b=>{
  const text=(b.textContent||"").replace(/^⭐\s*/,"").trim();
  if(/^À commander$/i.test(text))b.textContent="⭐ À commander";
 });
}
function pin(){
 if(s.parentNode!==document.head||s!==document.head.lastElementChild)document.head.appendChild(s);
 normalizeOrderHeadings();
 document.documentElement.dataset.cphDayStyle="v5-direct";
}
const headObserver=new MutationObserver(pin);
headObserver.observe(document.head,{childList:true});
const bodyObserver=new MutationObserver(()=>requestAnimationFrame(normalizeOrderHeadings));
if(document.body)bodyObserver.observe(document.body,{childList:true,subtree:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{pin();if(document.body)bodyObserver.observe(document.body,{childList:true,subtree:true})},{once:true});else pin();
[150,500,1200,2500].forEach(ms=>setTimeout(pin,ms));
})();
