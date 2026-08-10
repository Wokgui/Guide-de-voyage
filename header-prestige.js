(function(){
  "use strict";

  const STYLE_ID="cph-prestige-header-style";
  const FLAG_ROW_CLASS="cph-prestige-flags";
  const SETTINGS_TILE_ID="cphPrestigeSettingsTile";

  function addStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement("style");
    style.id=STYLE_ID;
    style.textContent=`
      .cph-prestige-title-row{
        display:grid!important;
        grid-template-columns:40px minmax(0,1fr) 40px!important;
        align-items:center!important;
        width:100%!important;
        gap:4px!important;
        margin:0 0 8px!important;
      }
      .cph-prestige-title-row::before,
      .cph-prestige-title-row::after{
        content:"";
      }
      .cph-prestige-title-row::before{grid-column:1;}
      .cph-prestige-title-row::after{grid-column:3;}
      .cph-prestige-title{
        grid-column:2!important;
        margin:0!important;
        padding:0!important;
        min-width:0!important;
        white-space:nowrap!important;
        text-align:center!important;
        font-family:Georgia,"Times New Roman",serif!important;
        font-size:clamp(20px,5.8vw,30px)!important;
        line-height:1.08!important;
        font-weight:400!important;
        letter-spacing:.035em!important;
        color:#fff!important;
        text-shadow:0 1px 1px rgba(0,0,0,.14)!important;
      }
      .cph-prestige-flags{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:9px!important;
        width:min(78%,360px)!important;
        margin:0 auto 8px!important;
        color:#fff!important;
        line-height:1!important;
      }
      .cph-prestige-flags::before,
      .cph-prestige-flags::after{
        content:"";
        display:block;
        height:1px;
        flex:1 1 auto;
        max-width:120px;
        background:linear-gradient(90deg,transparent,#ddb36a);
        opacity:.95;
      }
      .cph-prestige-flags::after{
        background:linear-gradient(90deg,#ddb36a,transparent);
      }
      .cph-prestige-flags span{
        font-size:26px!important;
        line-height:1!important;
        filter:saturate(.95);
      }
      .cph-prestige-guide{
        color:#fff!important;
        border:1.5px solid #ddb36a!important;
        background:linear-gradient(135deg,#17657a,#0d536b)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
        font-weight:800!important;
        letter-spacing:.16em!important;
      }
      .cph-prestige-hide-save,
      .cph-prestige-hide-original-settings{
        display:none!important;
      }
      .cph-prestige-settings-tile{
        width:100%!important;
        margin:12px 0 0!important;
        padding:14px 16px!important;
        border:1px solid #d9e4df!important;
        border-radius:14px!important;
        background:#fffdf8!important;
        color:#31534a!important;
        box-shadow:0 3px 12px rgba(53,88,75,.08)!important;
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
        cursor:pointer!important;
        font:inherit!important;
        text-align:left!important;
      }
      .cph-prestige-settings-tile-main{
        display:flex!important;
        align-items:center!important;
        gap:11px!important;
        min-width:0!important;
      }
      .cph-prestige-settings-tile-icon{
        width:36px!important;
        height:36px!important;
        min-width:36px!important;
        border-radius:10px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        background:#e8f0ec!important;
        color:#31534a!important;
        font-size:21px!important;
      }
      .cph-prestige-settings-tile-title{
        display:block!important;
        font-weight:800!important;
        line-height:1.15!important;
      }
      .cph-prestige-settings-tile-subtitle{
        display:block!important;
        margin-top:3px!important;
        color:#71877f!important;
        font-size:12px!important;
        line-height:1.2!important;
      }
      .cph-prestige-settings-tile-arrow{
        color:#7d918a!important;
        font-size:21px!important;
        line-height:1!important;
      }
      @media (max-width:390px){
        .cph-prestige-title-row{
          grid-template-columns:34px minmax(0,1fr) 34px!important;
          gap:3px!important;
        }
        .cph-prestige-title{
          font-size:clamp(19px,5.45vw,23px)!important;
          letter-spacing:.018em!important;
        }
        .cph-prestige-flags span{font-size:24px!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function normalizedText(element){
    return (element&&element.textContent||"").replace(/\s+/g," ").trim();
  }

  function findGuideLabel(){
    return Array.from(document.querySelectorAll("header *")).find(element=>{
      if(element.children.length>3)return false;
      return normalizedText(element)==="GUIDE PERSONNALISÉ";
    })||null;
  }

  function hideExistingFlags(header,title,guide){
    Array.from(header.querySelectorAll("*"))
      .filter(element=>element!==title&&element!==guide)
      .forEach(element=>{
        const text=normalizedText(element);
        if((text==="🇩🇰 🇸🇪"||text==="🇩🇰🇸🇪")&&element.children.length<=2){
          element.style.display="none";
          element.dataset.prestigeHiddenFlags="1";
        }
      });
  }

  function findResetAnchor(){
    const candidates=Array.from(document.querySelectorAll("button,a,[role='button'],.button,.btn"));
    const reset=candidates.find(element=>{
      const text=normalizedText(element).toLowerCase();
      return text.includes("réinitial") || text.includes("reinitial");
    });
    if(!reset)return null;
    return reset.closest(".card,.panel,.section,.settings-section,.toolbar")||reset.parentElement||reset;
  }

  function createSettingsTile(settings){
    if(document.getElementById(SETTINGS_TILE_ID))return true;
    const anchor=findResetAnchor();
    if(!anchor||!anchor.parentNode)return false;

    const tile=document.createElement("button");
    tile.type="button";
    tile.id=SETTINGS_TILE_ID;
    tile.className="cph-prestige-settings-tile";
    tile.setAttribute("aria-label","Ouvrir les réglages et sauvegardes");
    tile.innerHTML=`
      <span class="cph-prestige-settings-tile-main">
        <span class="cph-prestige-settings-tile-icon" aria-hidden="true">⚙</span>
        <span>
          <span class="cph-prestige-settings-tile-title">Réglages et sauvegardes</span>
          <span class="cph-prestige-settings-tile-subtitle">Sauvegardes, restauration et options</span>
        </span>
      </span>
      <span class="cph-prestige-settings-tile-arrow" aria-hidden="true">›</span>`;
    tile.addEventListener("click",()=>settings.click());
    anchor.parentNode.insertBefore(tile,anchor.nextSibling);
    return true;
  }

  function apply(){
    const header=document.querySelector("header");
    const settings=document.getElementById("backupSettingsButton");
    if(!header||!settings)return false;

    addStyles();

    if(header.dataset.prestigeHeaderApplied!=="1"){
      const title=Array.from(header.querySelectorAll("h1,h2,[role='heading']"))
        .find(element=>/COPENHAGUE/i.test(normalizedText(element))&&/MALM[ÖO]/i.test(normalizedText(element)));
      const guide=findGuideLabel();
      if(!title||!guide)return false;

      header.dataset.prestigeHeaderApplied="1";
      title.textContent="COPENHAGUE & MALMÖ";
      title.classList.add("cph-prestige-title");

      const row=document.createElement("div");
      row.className="cph-prestige-title-row";
      title.parentNode.insertBefore(row,title);
      row.appendChild(title);

      const saveIndicator=document.getElementById("saveIndicator");
      if(saveIndicator)saveIndicator.classList.add("cph-prestige-hide-save");
      settings.classList.add("cph-prestige-hide-original-settings");

      hideExistingFlags(header,title,guide);
      const flags=document.createElement("div");
      flags.className=FLAG_ROW_CLASS;
      flags.setAttribute("aria-label","Danemark et Suède");
      flags.innerHTML="<span aria-hidden='true'>🇩🇰</span><span aria-hidden='true'>🇸🇪</span>";
      guide.parentNode.insertBefore(flags,guide);
      guide.classList.add("cph-prestige-guide");
    }

    settings.classList.add("cph-prestige-hide-original-settings");
    createSettingsTile(settings);
    return true;
  }

  function start(){
    apply();
    const observer=new MutationObserver(()=>apply());
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
