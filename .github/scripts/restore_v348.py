import json
import re
from pathlib import Path

# header-prestige.js
p = Path("header-prestige.js")
js = p.read_text(encoding="utf-8")
js, n = re.subn(
    r"function ensureFlags\(\)\{.*?\}\nfunction ensureSettingsTile",
    "function ensureFlags(){}\nfunction ensureSettingsTile",
    js,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit("ensureFlags introuvable")
old = "function polish(){filters();mapRows();polishCards();reserved();programMeta();programMapButtons();ensureSettingsTile();ensureTrackingShortcuts()}function start(){addStyles();applyHeader();polish();new MutationObserver(()=>{clearTimeout(window.__cphP);window.__cphP=setTimeout(polish,110)}).observe(document.body,{childList:true,subtree:true})}"
new = """function polish(){filters();mapRows();polishCards();reserved();programMeta();programMapButtons();ensureSettingsTile();ensureTrackingShortcuts()}
function schedulePolish(){
  if(window.__cphP)return;
  const run=()=>{window.__cphP=0;polish()};
  if(\"requestIdleCallback\" in window)window.__cphP=requestIdleCallback(run,{timeout:360});
  else window.__cphP=setTimeout(run,120);
}
function start(){addStyles();applyHeader();polish();const observer=new MutationObserver(mutations=>{if(mutations.some(m=>m.addedNodes&&m.addedNodes.length))schedulePolish()});observer.observe(document.body,{childList:true,subtree:true});window.addEventListener(\"resize\",schedulePolish,{passive:true})}"""
if old not in js:
    raise SystemExit("fin de start v347 introuvable")
js = js.replace(old, new, 1)
p.write_text(js, encoding="utf-8")

# startup CSS: no overlay, static flags, fast taps.
p = Path("startup-stable-v345.css")
css = p.read_text(encoding="utf-8")
marker = "/* v347 : pas d'overlay ni de masquage du BODY. */\nhtml,body{background:#f3ede1!important}"
if marker not in css:
    raise SystemExit("marqueur CSS v347 introuvable")
stable = """/* v348 : affichage immédiat, sans overlay, avec géométrie du header déjà finale. */
html,body{background:#f3ede1!important}
header h1 .title-main::after{
  content:\"🇩🇰   🇸🇪\";
  box-sizing:border-box;
  display:flex;
  align-items:center;
  justify-content:center;
  width:min(76%,350px);
  height:24px;
  margin:8px auto 9px;
  color:transparent;
  text-shadow:0 0 0 #fff;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
  font-size:24px;
  line-height:24px;
  letter-spacing:0;
  background:linear-gradient(#d9ae62,#d9ae62) left center/34% 1px no-repeat,linear-gradient(#d9ae62,#d9ae62) right center/34% 1px no-repeat;
}
.cph-balanced-flags{display:none!important}
button,a,summary,label,.tab,[role=\"button\"]{touch-action:manipulation}
@media(max-width:390px){header h1 .title-main::after{font-size:22px;height:22px;line-height:22px}}
"""
css = css.replace(marker, stable, 1)
p.write_text(css, encoding="utf-8")

# ui-fixes: same visual rules, fewer recalculations; fixed summary meta size.
p = Path("ui-fixes-v7.js")
ui = p.read_text(encoding="utf-8")
ui = ui.replace('"__cphUiFixesStableV30"].forEach', '"__cphUiFixesStableV30","__cphUiFixesStableV31"].forEach', 1)
ui = ui.replace('const GLOBAL_KEY="__cphUiFixesStableV30";', 'const GLOBAL_KEY="__cphUiFixesStableV31";', 1)
ui = ui.replace('const STYLE_ID="cph-ui-fixes-v30";', 'const STYLE_ID="cph-ui-fixes-v31";', 1)
ui = ui.replace('"cph-ui-fixes-v29",STYLE_ID]', '"cph-ui-fixes-v29","cph-ui-fixes-v30",STYLE_ID]', 1)
ui = ui.replace(
    'const ref=scope.querySelector(".mini-badge.nature .cph-nature-label");\n if(ref)scope.style.setProperty("--cph-summary-meta-text-size",getComputedStyle(ref).fontSize);',
    'scope.style.setProperty("--cph-summary-meta-text-size","12px","important");',
    1,
)
old_schedule = 'function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>setTimeout(polish,30));}\nfunction start(){observer=new MutationObserver(schedule);polish();[150,500,1200].forEach(ms=>setTimeout(schedule,ms));window.addEventListener("resize",schedule,{passive:true});}'
new_schedule = """function schedule(){
 if(scheduled)return;
 scheduled=true;
 const run=()=>{scheduled=false;polish()};
 if(\"requestIdleCallback\" in window)requestIdleCallback(run,{timeout:320});
 else setTimeout(run,100);
}
function start(){observer=new MutationObserver(mutations=>{if(mutations.some(m=>m.addedNodes&&m.addedNodes.length))schedule()});polish();window.addEventListener(\"resize\",schedule,{passive:true});}"""
if old_schedule not in ui:
    raise SystemExit("scheduler ui-fixes v30 introuvable")
ui = ui.replace(old_schedule, new_schedule, 1)
p.write_text(ui, encoding="utf-8")

# manifest v348, keeping v347 splash assets.
p = Path("manifest.webmanifest")
manifest = json.loads(p.read_text(encoding="utf-8"))
manifest["start_url"] = "/?v=20260816-348"
p.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Service worker v348.
p = Path("sw.js")
sw = p.read_text(encoding="utf-8")
sw = sw.replace("copenhague-v347-static-v47", "copenhague-v348-static-v48")
sw = sw.replace("copenhague-v347-runtime-v47", "copenhague-v348-runtime-v48")
sw = sw.replace("/startup-stable-v345.css?v=347", "/startup-stable-v345.css?v=348")
sw = sw.replace("/header-prestige.js?v=347", "/header-prestige.js?v=348")
sw = sw.replace("/ui-fixes-v7.js?v=30", "/ui-fixes-v7.js?v=31")
old_polish = """    polishAll();
    const observer=new MutationObserver(()=>{clearTimeout(window.__cphPair336Timer);window.__cphPair336Timer=setTimeout(polishAll,110)});
    observer.observe(document.body,{childList:true,subtree:true});"""
new_polish = """    polishAll();
    let pending=false;
    const schedulePolish=()=>{
      if(pending)return;
      pending=true;
      const run=()=>{pending=false;polishAll()};
      if(\"requestIdleCallback\" in window)requestIdleCallback(run,{timeout:360});
      else setTimeout(run,120);
    };
    const observer=new MutationObserver(mutations=>{
      if(mutations.some(m=>m.addedNodes&&m.addedNodes.length))schedulePolish();
    });
    observer.observe(document.body,{childList:true,subtree:true});"""
if old_polish not in sw:
    raise SystemExit("scheduler du patch SW introuvable")
sw = sw.replace(old_polish, new_polish, 1)
p.write_text(sw, encoding="utf-8")
