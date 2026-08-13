(function(){
"use strict";
if(window.__cphDayStyleV4)return;
window.__cphDayStyleV4=true;
["cph-day-style-v1","cph-day-style-v2","cph-day-style-v3","cph-day-style-v4"].forEach(id=>document.getElementById(id)?.remove());
const s=document.createElement("style");
s.id="cph-day-style-v4";
s.textContent=`
/* Style validé : grand cadre coloré + en-tête teinté collé aux 3 bords. */
#programme .day-section{
 --cph-day-bg:#f7e8d8;
 --cph-day-border:#d6a677;
 --cph-day-ink:#6f4a2c;
 box-sizing:border-box!important;
 position:relative!important;
 overflow:hidden!important;
 padding:0!important;
 border:1.5px solid var(--cph-day-border)!important;
 border-left:1.5px solid var(--cph-day-border)!important;
 border-radius:18px!important;
 background:#fff!important;
 box-shadow:0 6px 18px color-mix(in srgb,var(--cph-day-border) 13%,transparent)!important;
}
#programme .day-section::before{content:none!important;display:none!important}
#programme .day-section:has(.day-Lundi){--cph-day-bg:#f8e9df;--cph-day-border:#d7aa8d;--cph-day-ink:#6d4937}
#programme .day-section:has(.day-Mardi){--cph-day-bg:#f7e8d8;--cph-day-border:#d6a677;--cph-day-ink:#6f4a2c}
#programme .day-section:has(.day-Mercredi){--cph-day-bg:#e7f0df;--cph-day-border:#a9c392;--cph-day-ink:#3f6240}
#programme .day-section:has(.day-Jeudi){--cph-day-bg:#e4eef7;--cph-day-border:#9dbbd2;--cph-day-ink:#355d78}
#programme .day-section:has(.day-Vendredi){--cph-day-bg:#eee5f5;--cph-day-border:#bba5d2;--cph-day-ink:#634a7c}
#programme .day-section:has(.day-Samedi){--cph-day-bg:#f7ead9;--cph-day-border:#d8b27c;--cph-day-ink:#75532f}
#programme .day-section:has(.day-Dimanche){--cph-day-bg:#f3e5e8;--cph-day-border:#d4a8b0;--cph-day-ink:#744e57}
#programme .day-section>.day-banner,
#programme .day-section .day-banner{
 box-sizing:border-box!important;
 width:100%!important;
 max-width:none!important;
 margin:0!important;
 margin-top:0!important;
 margin-left:0!important;
 margin-right:0!important;
 border:0!important;
 border-bottom:1px solid color-mix(in srgb,var(--cph-day-border) 58%,transparent)!important;
 border-radius:17px 17px 0 0!important;
 background:var(--cph-day-bg)!important;
 color:var(--cph-day-ink)!important;
 box-shadow:none!important;
}
#programme .day-section .day-banner *{color:inherit}
#programme .day-section .day-body{
 box-sizing:border-box!important;
 margin:0!important;
 padding:7px!important;
 background:#fff!important;
}
`;
document.head.appendChild(s);
/* Nettoie les marges inline laissées par les essais précédents. */
function clean(){
 document.querySelectorAll("#programme .day-banner").forEach(h=>{
  ["margin-left","margin-right","margin-top","width","max-width"].forEach(p=>h.style.removeProperty(p));
 });
 document.documentElement.dataset.cphDayStyle="v4-direct";
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",clean,{once:true});else clean();
[150,500,1200,2500].forEach(ms=>setTimeout(clean,ms));
})();
