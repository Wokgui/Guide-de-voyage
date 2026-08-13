(function(){
"use strict";
if(document.querySelector('script[data-cph-ui-fixes-v9="1"]'))return;
const s=document.createElement("script");
s.src="/ui-fixes-v7.js?v=9";
s.async=false;
s.dataset.cphUiFixesV9="1";
document.head.appendChild(s);
})();
