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
      header #saveIndicator,header #backupSettingsButton{display:none!important;}
      header h1{margin:0 0 10px!important;padding:0!important;text-align:center!important;}
      header h1 .title-main{display:block!important;margin:0!important;padding:0!important;color:#fff!important;font-family:Georgia,"Times New Roman",serif!important;font-size:clamp(21px,6vw,31px)!important;line-height:1.08!important;font-weight:400!important;letter-spacing:.025em!important;text-transform:uppercase!important;white-space:nowrap!important;text-shadow:0 1px 1px rgba(0,0,0,.14)!important;}
      header h1 .title-main .title-flags{display:none!important;}
      .cph-balanced-flags{display:flex!important;align-items:center!important;justify-content:center!important;gap:12px!important;width:min(76%,350px)!important;margin:8px auto 9px!important;line-height:1!important;}
      .cph-balanced-flags::before,.cph-balanced-flags::after{content:"";display:block;flex:1 1 auto;height:1px;max-width:120px;background:#d9ae62!important;opacity:1!important;}
      .cph-balanced-flags span{font-size:24px!important;line-height:1!important;}
      header h1 .title-sub{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:56.5%!important;min-width:220px!important;max-width:405px!important;height:29px!important;margin:0 auto!important;padding:0 13px!important;border:1.15px solid #d9ae62!important;border-radius:999px!important;background:linear-gradient(180deg,#176c7c 0%,#10596b 100%)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif!important;font-size:clamp(10px,2.65vw,12.5px)!important;line-height:1!important;font-weight:700!important;letter-spacing:.19em!important;text-transform:uppercase!important;white-space:nowrap!important;}
      .footer-actions{display:none!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;width:min(calc(100% - 32px),360px)!important;margin:20px auto 38px!important;gap:10px!important;}
      body.suivi-active .footer-actions{display:grid!important;}
      .footer-actions>button,.footer-actions>label{box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:76px!important;margin:0!important;padding:10px 8px!important;border:1px solid #c9d9d2!important;border-radius:17px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:6px!important;font-size:12px!important;font-weight:850!important;line-height:1.15!important;text-align:center!important;box-shadow:0 6px 17px rgba(30,76,65,.08)!important;}
      .footer-actions svg{width:24px!important;height:24px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;}
      #exportBtn{background:#eef7f4!important;color:#245e50!important}.footer-actions label:has(#importFile){background:#f2f5fb!important;color:#365778!important}#resetBtn{background:#fff3f1!important;color:#9a433b!important;border-color:#ebcbc6!important}#${SETTINGS_TILE_ID}{background:#f8f2e7!important;color:#75592b!important;border-color:#e5d4b4!important}
      html body.suivi-active header .stats .stat.stat-done span>i,
      html body.suivi-active header .stats .stat.stat-todo span>i,
      html body.suivi-active header .stats .stat.stat-aside span>i,
      html body header .stats .stat.stat-done span>i,
      html body header .stats .stat.stat-todo span>i,
      html body header .stats .stat.stat-aside span>i{display:none!important;width:0!important;height:0!important;margin:0!important;padding:0!important;}
      .cph-counter-icon-hidden{display:none!important;}
      .cph-symmetric-controls{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto minmax(0,1fr)!important;align-items:center!important;gap:8px!important;width:100%!important;}
      .cph-symmetric-controls>.cph-side-control{width:100%!important;min-width:0!important;box-sizing:border-box!important;}
      .cph-borsen-icon-fixed{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:1.35em!important;min-width:1.35em!important;height:1.35em!important;line-height:1!important;vertical-align:middle!important;margin:0 .28em 0 0!important;transform:none!important;}
      @media(max-width:390px){header h1 .title-main{font-size:clamp(19px,5.55vw,23px)!important;letter-spacing:.012em!important}.cph-balanced-flags{width:min(82%,320px)!important;margin-top:7px!important}.cph-balanced-flags span{font-size:22px!important}header h1 .title-sub{width:58%!important;min-width:205px!important;height:28px!important;font-size:10.2px!important;padding:0 10px!important;letter-spacing:.18em!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureFlags(title){if(title.querySelector("."+FLAG_ROW_CLASS))return;const flags=document.createElement("span");flags.className=FLAG_ROW_CLASS;flags.setAttribute("aria-label","Danemark et Suède");flags.innerHTML="<span aria-hidden='true'>🇩🇰</span><span aria-hidden='true'>🇸🇪</span>";const sub=title.querySelector(".title-sub");if(sub)title.insertBefore(flags,sub);else title.appendChild(flags);}
  function ensureSettingsTile(){if(document.getElementById(SETTINGS_TILE_ID))return true;const original=document.getElementById("backupSettingsButton"),footer=document.querySelector(".footer-actions");if(!original||!footer)return false;const tile=document.createElement("button");tile.id=SETTINGS_TILE_ID;tile.type="button";tile.setAttribute("aria-label","Ouvrir les sauvegardes");tile.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 19h12a4 4 0 0 0 .6-7.95A6.5 6.5 0 0 0 6.2 9.2 4.9 4.9 0 0 0 6 19z"/><path d="M12 11v6m0 0-2.5-2.5M12 17l2.5-2.5"/></svg><span>Sauvegarde</span>`;tile.addEventListener("click",()=>original.click());footer.appendChild(tile);return true;}
  function decorateFooterActions(){const exportButton=document.getElementById("exportBtn"),importInput=document.getElementById("importFile"),importLabel=importInput&&importInput.closest("label"),resetButton=document.getElementById("resetBtn");const decorate=(element,icon,label)=>{if(!element||element.dataset.cphDecorated)return;Array.from(element.childNodes).forEach(node=>{if(node.nodeType===Node.TEXT_NODE)node.remove()});const visual=document.createElement("span");visual.innerHTML=icon;const text=document.createElement("span");text.textContent=label;element.insertBefore(visual,element.firstChild);element.insertBefore(text,importInput&&element===importLabel?importInput:null);element.dataset.cphDecorated="true"};decorate(exportButton,'<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0-4 4m4-4 4 4M5 14v5h14v-5"/></svg>',"Exporter le suivi");decorate(importLabel,'<svg viewBox="0 0 24 24"><path d="M12 4v12m0 0-4-4m4 4 4-4M5 19h14"/></svg>',"Importer un suivi");decorate(resetButton,'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg>',"Tout réinitialiser");}
  const txt=e=>(e.textContent||"").replace(/\s+/g," ").trim();

  function cleanSuiviCounters(){
    const labels=["Visités","À faire","De côté"];
    document.querySelectorAll("*").forEach(labelEl=>{
      if(labelEl.children.length!==0||!labels.includes(txt(labelEl)))return;
      let card=labelEl.parentElement;
      for(let i=0;i<6&&card;i++,card=card.parentElement){
        const cardText=txt(card);
        if(!/\d/.test(cardText)||cardText.length>45)continue;
        if(!labels.some(label=>cardText.includes(label)))continue;
        const descendants=Array.from(card.querySelectorAll("*"));
        descendants.forEach(el=>{
          if(el===labelEl||el.contains(labelEl))return;
          const et=txt(el);
          if(!et||et.length>4||/\d/.test(et)||/[A-Za-zÀ-ÿ]/.test(et))return;
          let hide=el;
          while(hide.parentElement&&hide.parentElement!==card){
            const pt=txt(hide.parentElement);
            if(pt!==et||hide.parentElement.contains(labelEl))break;
            hide=hide.parentElement;
          }
          hide.classList.add("cph-counter-icon-hidden");
        });
        card.classList.add("cph-counter-cleaned");
        break;
      }
    });
  }

  function fixBorsen(){document.querySelectorAll("*").forEach(el=>{if(el.children.length===0&&/Børsen/.test(txt(el))){const p=el.parentElement;if(!p)return;const candidates=Array.from(p.children);const icon=candidates.find(x=>x!==el&&txt(x).length<=3);if(icon)icon.classList.add("cph-borsen-icon-fixed")}});}
  function symmetricControls(){const all=Array.from(document.querySelectorAll("button,[role='button'],label"));const undo=all.find(e=>/^Annuler$/i.test(txt(e))),redo=all.find(e=>/^Rétablir$/i.test(txt(e)));if(!undo||!redo||undo.parentElement!==redo.parentElement)return;const row=undo.parentElement;const kids=Array.from(row.children);const every=kids.find(e=>/Tous les jours/i.test(txt(e))),hide=kids.find(e=>/Masquer.*termin/i.test(txt(e)));if(every&&hide){row.classList.add("cph-symmetric-controls");every.classList.add("cph-side-control");hide.classList.add("cph-side-control")}}
  function applyHeader(){const header=document.querySelector("header"),title=header&&header.querySelector("h1");if(!header||!title)return;addStyles();const main=title.querySelector(".title-main"),sub=title.querySelector(".title-sub");if(main){const oldFlags=main.querySelector(".title-flags");if(oldFlags)oldFlags.style.display="none";Array.from(main.childNodes).forEach(node=>{if(node.nodeType===Node.TEXT_NODE&&/Copenhague/i.test(node.textContent||""))node.textContent="COPENHAGUE & MALMÖ "})}if(sub)sub.textContent="GUIDE PERSONNALISÉ";ensureFlags(title);}
  function installGoogleMapsHandoff(){if(window.__cphGoogleMapsOpenPatched)return;window.__cphGoogleMapsOpenPatched=true;const nativeOpen=window.open.bind(window);window.open=function(url,target,features){const href=typeof url==="string"?url:String(url||"");if(/^https:\/\/(?:www\.)?google\.[^/]+\/maps\//i.test(href)||/^https:\/\/maps\.google\./i.test(href)){window.location.assign(href);return null}return nativeOpen(url,target,features)}}
  function polish(){cleanSuiviCounters();fixBorsen();symmetricControls();}
  function start(){
    applyHeader();installGoogleMapsHandoff();ensureSettingsTile();decorateFooterActions();polish();
    [300,900,1800].forEach(ms=>setTimeout(()=>{ensureSettingsTile();decorateFooterActions();polish()},ms));
    const observer=new MutationObserver(()=>{window.clearTimeout(window.__cphPolishTimer);window.__cphPolishTimer=window.setTimeout(polish,30);});
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
