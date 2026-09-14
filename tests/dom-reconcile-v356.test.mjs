import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../dom-stability-v356.js',import.meta.url),'utf8');
const loader=fs.readFileSync(new URL('../header-prestige.js',import.meta.url),'utf8');
new vm.Script(source,{filename:'dom-stability-v356.js'});
new vm.Script(loader,{filename:'header-prestige.js'});

assert.match(loader,/DOMContentLoaded",loadDomStabilityV356/,'le stabilisateur doit être chargé après les wrappers de rendu existants');
assert.match(loader,/\/dom-stability-v356\.js\?v=356/,'le module v356 doit être chargé avec une URL versionnée');
assert.match(source,/snapshotProgrammeDom/);
assert.match(source,/reconcileProgrammeDom/);
assert.match(source,/\.day-section/);
assert.match(source,/\.visit-details/);
assert.match(source,/querySelectorAll\("img"\)/);
assert.match(source,/newNode\.replaceWith\(oldNode\)/,'les nœuds inchangés doivent garder leur identité DOM');
assert.match(source,/newImage\.replaceWith\(oldImage\)/,'une image déjà chargée ne doit pas être recréée');
assert.doesNotMatch(source,/setTimeout|setInterval|requestAnimationFrame/,'v356 ne doit pas masquer le flash avec une temporisation');

class FakeNode{
  constructor(kind,html,src=''){
    this.kind=kind;
    this.outerHTML=html;
    this.attrs=new Map();
    if(src)this.attrs.set('src',src);
  }
  get attributes(){return Array.from(this.attrs,([name,value])=>({name,value}));}
  getAttribute(name){return this.attrs.get(name)||null;}
  hasAttribute(name){return this.attrs.has(name);}
  setAttribute(name,value){this.attrs.set(name,String(value));}
  removeAttribute(name){this.attrs.delete(name);}
  replaceWith(oldNode){root.replace(this,oldNode);}
}

const makeSet=()=>({
  sections:[new FakeNode('section','<section>A</section>'),new FakeNode('section','<section>B</section>')],
  cards:[new FakeNode('card','<details>A</details>'),new FakeNode('card','<details>B</details>'),new FakeNode('card','<details>C</details>')],
  images:[new FakeNode('img','<img src="a.jpg">','a.jpg'),new FakeNode('img','<img src="b.jpg">','b.jpg'),new FakeNode('img','<img src="c.jpg">','c.jpg')]
});

let current=makeSet();
const root={
  querySelectorAll(selector){
    if(selector==='.day-section')return current.sections;
    if(selector==='.visit-details')return current.cards;
    if(selector==='img')return current.images;
    return [];
  },
  contains(node){return current.sections.includes(node)||current.cards.includes(node)||current.images.includes(node);},
  replace(from,to){
    for(const key of ['sections','cards','images']){
      const index=current[key].indexOf(from);
      if(index>=0){current[key][index]=to;return;}
    }
  }
};

const initial=current;
let rawRenderCount=0;
const listeners=new Map();
const document={
  readyState:'complete',
  documentElement:{contains:node=>node===root},
  getElementById:id=>id==='programme'?root:null,
  addEventListener(type,handler){listeners.set(type,handler);}
};
const window={
  renderAll(){rawRenderCount++;current=makeSet();}
};
const sandbox={window,document,Map,Set,Array,Object,String,Number,Boolean,RegExp,Math,Date,JSON,console};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox);

const stableSections=[...initial.sections];
const stableCards=[...initial.cards];
const stableImages=[...initial.images];
for(let i=0;i<300;i++)window.renderAll();
assert.equal(rawRenderCount,300,'le rendu fonctionnel doit toujours recevoir les 300 mises à jour');
assert.deepEqual(current.sections,stableSections,'les sections identiques doivent garder leur identité sur 300 cycles');
assert.deepEqual(current.cards,stableCards,'les cartes identiques doivent garder leur identité sur 300 cycles');
assert.deepEqual(current.images,stableImages,'les images identiques doivent garder leur identité sur 300 cycles');
assert.equal(window.__cphDomStabilityV356.stats.renders,300);
assert.equal(window.__cphDomStabilityV356.stats.sectionsReused,600);
assert.equal(window.__cphDomStabilityV356.stats.cardsReused,900);
assert.equal(window.__cphDomStabilityV356.stats.imagesReused,900);

const wrapped=window.renderAll;
listeners.get('guide:rendered')?.();
assert.equal(window.renderAll,wrapped,'guide:rendered ne doit pas empiler un nouveau wrapper/listener');

console.log(JSON.stringify({ok:true,cycles:300,rawRenderCount,stats:window.__cphDomStabilityV356.stats},null,2));
