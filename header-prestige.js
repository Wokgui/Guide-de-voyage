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
      /* Prestige header: title area only. No dimensions outside this block are changed. */
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
      .cph-prestige-settings{
        grid-column:3!important;
        justify-self:end!important;
        align-self:center!important;
        width:34px!important;
        height:34px!important;
        min-width:34px!important;
        min-height:34px!important;
        margin:0!important;
        padding:0!important;
        border:1.5px solid #ddb36a!important;
        border-radius:999px!important;
        background:rgba(0,0,0,.06)!important;
        color:#fff!important;
        box-shadow:none!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
      }
      .cph-prestige-settings svg,
      .cph-prestige-settings img{
        width:20px!important;
        height:20px!important;
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
        display:block!important;
        width:max-content!important;
        max-width:min(72%,520px)!important;
        margin:0 auto 10px!important;
        padding:6px 18px!important;
        border-radius:999px!important;
        text-align:center!important;
        font-size:clamp(12px,3.3vw,18px)!important;
        line-height:1.15!important;
        color:#fff!important;
        border:1.5px solid #ddb36a!important;
        background:linear-gradient(135deg,#17657a,#0d536b)!important;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
        font-weight:800!important;
        letter-spacing:.16em!important;
      }
      .cph-prestige-hide-save{
        display:none!important;
      }
      .cph-prestige-settings-tile{
        width:100%!important;
        margin:0 0 40px!important;
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
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        border-radius:10px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        background:#e8f0ec!important;
        color:#31534a!important;
        font-size:22px!important;
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
        font-size:22px!important;
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
        .cph-prestige-settings{
          width:32px!important;
          height:32px!important;
          min-width:32px!important;
          min-height:32px!important;
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
      return normalizedText(element).toLocaleUpperCase("fr")==="GUIDE PERSONNALISÉ";
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

  function createSettingsTile(settings){
    if(document.getElementById(SETTINGS_TILE_ID))return;
    const actions=document.querySelector("main > .footer-actions")||document.querySelector(".footer-actions");
    if(!actions||!actions.parentNode)return;

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
    actions.parentNode.insertBefore(tile,actions.nextSibling);
  }

  function apply(){
    const header=document.querySelector("header");
    if(!header||header.dataset.prestigeHeaderApplied==="1")return;

    const title=Array.from(header.querySelectorAll("h1,h2,[role='heading']"))
      .find(element=>/COPENHAGUE/i.test(normalizedText(element))&&/MALM[ÖO]/i.test(normalizedText(element)));
    const guide=findGuideLabel();
    const settings=document.getElementById("backupSettingsButton");
    if(!title||!guide||!settings)return;

    addStyles();
    header.dataset.prestigeHeaderApplied="1";

    const guideWasInsideTitle=title.contains(guide);
    if(guideWasInsideTitle)guide.remove();
    title.textContent="COPENHAGUE & MALMÖ";
    title.classList.add("cph-prestige-title");

    const oldSettingsParent=settings.parentElement;
    const row=document.createElement("div");
    row.className="cph-prestige-title-row";
    title.parentNode.insertBefore(row,title);
    row.appendChild(title);

    const saveIndicator=document.getElementById("saveIndicator");
    if(saveIndicator&&saveIndicator!==settings&&saveIndicator!==row){
      saveIndicator.classList.add("cph-prestige-hide-save");
    }
    if(oldSettingsParent&&oldSettingsParent!==row&&oldSettingsParent.children.length===0){
      oldSettingsParent.style.display="none";
    }

    hideExistingFlags(header,title,guide);
    const flags=document.createElement("div");
    flags.className=FLAG_ROW_CLASS;
    flags.setAttribute("aria-label","Danemark et Suède");
    flags.innerHTML="<span aria-hidden='true'>🇩🇰</span><span aria-hidden='true'>🇸🇪</span>";
    guide.classList.add("cph-prestige-guide");
    row.parentNode.insertBefore(flags,row.nextSibling);
    flags.parentNode.insertBefore(guide,flags.nextSibling);
    createSettingsTile(settings);
  }

  function start(){
    apply();
    if(!document.querySelector("header")||!document.getElementById("backupSettingsButton")){
      const observer=new MutationObserver(()=>{
        apply();
        if(document.querySelector("header[data-prestige-header-applied='1']"))observer.disconnect();
      });
      observer.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(()=>observer.disconnect(),10000);
    }
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();
