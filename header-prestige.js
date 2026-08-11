(function(){
  "use strict";

  const STYLE_ID="cph-balanced-header-style";
  const FLAG_ROW_CLASS="cph-balanced-flags";
  const SETTINGS_TILE_ID="cphBottomSettingsTile";

  function addStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      header #saveIndicator,
      header #backupSettingsButton{display:none!important;}
      header h1{margin:0 0 10px!important;padding:0!important;text-align:center!important;}
      header h1 .title-main{display:block!important;margin:0!important;padding:0!important;color:#fff!important;font-family:Georgia,"Times New Roman",serif!important;font-size:clamp(21px,6vw,31px)!important;line-height:1.08!important;font-weight:400!important;letter-spacing:.025em!important;text-transform:uppercase!important;white-space:nowrap!important;text-shadow:0 1px 1px rgba(0,0,0,.14)!important;}
      header h1 .title-main .title-flags{display:none!important;}
      .cph-balanced-flags{display:flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;width:min(76%,350px)!important;margin:8px auto 8px!important;line-height:1!important;}
      .cph-balanced-flags::before,.cph-balanced-flags::after{content:"";display:block;flex:1 1 auto;height:1px;max-width:120px;background:#ddb36a;opacity:.95;}
      .cph-balanced-flags span{font-size:24px!important;line-height:1!important;}

      /* Badge conforme au visuel de référence : capsule étroite, basse, transparente et contour doré fin. */
      header h1 .title-sub{
        box-sizing:border-box!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:56.5%!important;
        min-width:0!important;
        max-width:405px!important;
        height:28px!important;
        margin:1px auto 0!important;
        padding:0 10px!important;
        border:1px solid #ddb36a!important;
        border-radius:999px!important;
        background:transparent!important;
        color:#fff!important;
        box-shadow:none!important;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif!important;
        font-size:clamp(10px,2.65vw,12.5px)!important;
        line-height:1!important;
        font-weight:750!important;
        letter-spacing:.22em!important;
        text-transform:uppercase!important;
        white-space:nowrap!important;
      }
      #${SETTINGS_TILE_ID}{min-height:52px!important;padding:9px 16px!important;border:1px solid #c9d9d2!important;border-radius:13px!important;background:#e7f0ed!important;color:#315f51!important;font-weight:850!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;}
      #${SETTINGS_TILE_ID} svg{width:22px!important;height:22px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;}
      @media(max-width:390px){
        header h1 .title-main{font-size:clamp(19px,5.55vw,23px)!important;letter-spacing:.012em!important;}
        .cph-balanced-flags{width:min(82%,320px)!important;margin-top:7px!important;}
        .cph-balanced-flags span{font-size:22px!important;}
        header h1 .title-sub{width:56.5%!important;min-width:0!important;height:27px!important;font-size:10.5px!important;padding:0 8px!important;letter-spacing:.20em!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureFlags(title){
    if(title.querySelector("."+FLAG_ROW_CLASS))return;
    const flags=document.createElement("span");
    flags.className=FLAG_ROW_CLASS;
    flags.setAttribute("aria-label","Danemark et Suède");
    flags.innerHTML="<span aria-hidden='true'>🇩🇰</span><span aria-hidden='true'>🇸🇪</span>";
    const sub=title.querySelector(".title-sub");
    if(sub)title.insertBefore(flags,sub); else title.appendChild(flags);
  }

  function ensureSettingsTile(){
    if(document.getElementById(SETTINGS_TILE_ID))return true;
    const original=document.getElementById("backupSettingsButton");
    const footer=document.querySelector(".footer-actions");
    if(!original||!footer)return false;
    const tile=document.createElement("button");
    tile.id=SETTINGS_TILE_ID; tile.type="button";
    tile.setAttribute("aria-label","Ouvrir les réglages et les sauvegardes");
    tile.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20.3h-3v-.09a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.55-1.03H5.3v-3h.15A1.7 1.7 0 0 0 7 9.94a1.7 1.7 0 0 0-.34-1.88L6.6 8l2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.69 4.7v-.09h3v.09a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.78 8l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1.03h.09v3h-.09A1.7 1.7 0 0 0 19.4 15z"/></svg><span>Réglages</span>`;
    tile.addEventListener("click",function(){ original.click(); });
    footer.appendChild(tile); return true;
  }

  function applyHeader(){
    const header=document.querySelector("header"); const title=header&&header.querySelector("h1");
    if(!header||!title)return; addStyles();
    const main=title.querySelector(".title-main"); const sub=title.querySelector(".title-sub");
    if(main){const oldFlags=main.querySelector(".title-flags");if(oldFlags)oldFlags.style.display="none";Array.from(main.childNodes).forEach(function(node){if(node.nodeType===Node.TEXT_NODE&&/Copenhague/i.test(node.textContent||""))node.textContent="COPENHAGUE & MALMÖ ";});}
    if(sub)sub.textContent="GUIDE PERSONNALISÉ"; ensureFlags(title);
  }

  function start(){applyHeader();ensureSettingsTile();setTimeout(ensureSettingsTile,400);setTimeout(ensureSettingsTile,1200);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true}); else start();
})();
