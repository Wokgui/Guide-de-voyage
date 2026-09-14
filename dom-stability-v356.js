(function(){
  "use strict";

  const VERSION="356";
  const SOURCE_ATTRS=new Set(["src","srcset","sizes","data-src","data-srcset"]);
  const stats={renders:0,sectionsReused:0,cardsReused:0,imagesReused:0,last:null};
  let wrappedFunction=null;

  function list(root,selector){
    if(!root||typeof root.querySelectorAll!=="function")return [];
    return Array.from(root.querySelectorAll(selector));
  }

  function signature(node){
    return node&&typeof node.outerHTML==="string"?node.outerHTML:"";
  }

  function queueBy(items,keyFor){
    const map=new Map();
    items.forEach(node=>{
      const key=keyFor(node);
      if(!key)return;
      const queue=map.get(key)||[];
      queue.push(node);
      map.set(key,queue);
    });
    return map;
  }

  function takeDetached(map,key,root){
    const queue=map.get(key);
    if(!queue)return null;
    while(queue.length){
      const node=queue.shift();
      if(!root||typeof root.contains!=="function"||!root.contains(node))return node;
    }
    return null;
  }

  function imageSourceKey(image){
    if(!image||typeof image.getAttribute!=="function")return "";
    const values=["src","srcset","sizes","data-src","data-srcset"].map(name=>image.getAttribute(name)||"");
    return values.some(Boolean)?values.join("\u001f"):"";
  }

  function syncImagePresentation(oldImage,newImage){
    if(!oldImage||!newImage||!oldImage.attributes||!newImage.attributes)return;
    Array.from(oldImage.attributes).forEach(attribute=>{
      if(SOURCE_ATTRS.has(attribute.name))return;
      if(typeof newImage.hasAttribute==="function"&&!newImage.hasAttribute(attribute.name))oldImage.removeAttribute(attribute.name);
    });
    Array.from(newImage.attributes).forEach(attribute=>{
      if(SOURCE_ATTRS.has(attribute.name))return;
      if(oldImage.getAttribute(attribute.name)!==attribute.value)oldImage.setAttribute(attribute.name,attribute.value);
    });
  }

  function snapshotProgrammeDom(){
    const root=document.getElementById("programme");
    if(!root)return null;
    return {
      root,
      sections:list(root,".day-section"),
      cards:list(root,".visit-details"),
      images:list(root,"img")
    };
  }

  function reuseExactNodes(root,oldNodes,selector){
    const oldBySignature=queueBy(oldNodes,signature);
    let reused=0;
    list(root,selector).forEach(newNode=>{
      const oldNode=takeDetached(oldBySignature,signature(newNode),root);
      if(!oldNode||oldNode===newNode||typeof newNode.replaceWith!=="function")return;
      newNode.replaceWith(oldNode);
      reused++;
    });
    return reused;
  }

  function reuseImages(root,oldImages){
    const oldBySource=queueBy(oldImages,imageSourceKey);
    let reused=0;
    list(root,"img").forEach(newImage=>{
      const key=imageSourceKey(newImage);
      if(!key)return;
      const oldImage=takeDetached(oldBySource,key,root);
      if(!oldImage||oldImage===newImage||typeof newImage.replaceWith!=="function")return;
      syncImagePresentation(oldImage,newImage);
      newImage.replaceWith(oldImage);
      reused++;
    });
    return reused;
  }

  function reconcileProgrammeDom(snapshot){
    if(!snapshot||!snapshot.root||!document.documentElement||!document.documentElement.contains(snapshot.root))return null;
    const root=snapshot.root;
    const sections=reuseExactNodes(root,snapshot.sections,".day-section");
    const cards=reuseExactNodes(root,snapshot.cards,".visit-details");
    const images=reuseImages(root,snapshot.images);
    stats.sectionsReused+=sections;
    stats.cardsReused+=cards;
    stats.imagesReused+=images;
    stats.last={sections,cards,images};
    return stats.last;
  }

  function install(){
    const current=window.renderAll;
    if(typeof current!=="function")return false;
    if(current.__cphDomStabilityV356){wrappedFunction=current;return true;}
    const original=current;
    function stableRenderAll(){
      const snapshot=snapshotProgrammeDom();
      stats.renders++;
      const result=original.apply(this,arguments);
      reconcileProgrammeDom(snapshot);
      return result;
    }
    Object.defineProperty(stableRenderAll,"__cphDomStabilityV356",{value:true});
    Object.defineProperty(stableRenderAll,"__cphOriginalRenderAll",{value:original});
    window.renderAll=stableRenderAll;
    wrappedFunction=stableRenderAll;
    return true;
  }

  function ensureInstalled(){
    if(window.renderAll!==wrappedFunction)install();
  }

  window.__cphDomStabilityV356={
    version:VERSION,
    stats,
    install:ensureInstalled,
    snapshotProgrammeDom,
    reconcileProgrammeDom
  };

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureInstalled,{once:true});
  else ensureInstalled();
  document.addEventListener("guide:rendered",ensureInstalled);
})();
