(()=>{
  const STORAGE_KEY='guide_packing_list_v1';
  const DEFAULT_ITEMS=[
    'Guide de ce qu’on visite et feuilles à imprimer',
    'Preuve de vol',
    'PASSEPORT et carte d’identité',
    'Adaptateur secteur autre pays',
    'Portefeuille',
    'Masques et gel',
    'Adaptateur pour tel écouter musique dans voiture',
    '2 chargeurs rapides téléphone',
    'Batterie externe téléphone',
    'Appli de transport des pays visités',
    'QR code certificat de vaccination',
    'Téléphone',
    'Écouteurs sans fil',
    'Écouteurs avec fil pour audio guide et adaptateur ou pas pour raccorder au tel',
    'Tablette avec son chargeur',
    'Montre connectée et son chargeur',
    'Coque smartphone avec corde',
    'Masque et boules quies en cire',
    'Masque anti-ronflement',
    'Vérifier que smart tags dans chacune des valises',
    'Trousse de toilettes ET CHARGEURS avec brosse à dents avec chargeur dentifrice peigne spray coiffant ou gel déodorant fil dentaire rasoir électrique avec chargeur mousse à raser rasoir jetable baume après rasage lotion lavage visage ciseaux gel cheveux hair 30 anti boutons produit anti ampoules pansements anti ampoules brosse à dents pour nettoyer rasoir crème anti sécheresse front',
    'Shampoing anti-pellicules',
    'Petite lessive',
    'Médicaments : PAS OUBLIER GABA Sertraline, Pantoprazole 3x, Magnésium, Finastéride, PAS OUBLIER GABA',
    'Labello',
    'Pommade anti assèchement nez',
    'Crème solaire',
    'Rouleau anti ampoules',
    'Tube à orteils dans trousse de toilette',
    'Boite de pansements avec ciseaux',
    'Lunettes de soleil',
    'Casquette',
    'Ceinture',
    'Si période chaude prendre housse de couette',
    'Polochon',
    'Drap sup polochon si place',
    'Sachet linge sale',
    'Au moins 2 pantalons',
    'Chaussettes de marche et normales',
    'Caleçons',
    'Haut normal pour resto',
    'Chemises',
    'T shirts noirs',
    'T shirts de sport',
    'Bermudas (genou)',
    'Veste et pantalon Décathlon chaud',
    'Veste et pantalon Décathlon froid',
    'Bonnet et gants',
    'Chaussettes anti ampoules',
    'Pyjama',
    'Maillot de bain',
    'Chaussures normales et de marche',
    'Produits entretien chaussures si nécessaire',
    'K way',
    'Veste légère et plus chaude',
    'Coussin anti-H',
    'Bâtons de marche',
    'Embouts des bâtons',
    'Cuit-oeufs',
    'Sèche linge de voyage',
    'Temps suffisant pour aller à aéroport',
    'Taille max des bagages et où mets liquides',
    'Couper chauffage',
    'Sortir poubelles',
    'Sac à dos',
    'Gilet dans voiture',
    'Parapluie dans voiture',
    'Télécharger films ou épisodes podcasts pour écouter dans l’avion',
    'Prendre portefeuille dehors pour l’avion',
    'Si prend un véhicule de location : prendre le support de smartphone, le câble pour le son, l’adaptateur allume cigare et son câble',
    'Si prend un vehicule de location : demander où peut nettoyer le véhicule et s’il y a une navette pour l’aéroport'
  ];
  const CATEGORIES=[
    {id:'organisation',label:'Organisation',icon:'🗂️'},
    {id:'vetements',label:'Vêtements',icon:'👕'},
    {id:'informatique',label:'Informatique',icon:'📱'},
    {id:'salle-de-bains',label:'Salle de bains',icon:'🧴'},
    {id:'autres',label:'Autres',icon:'🎒'}
  ];
  const CATEGORY_IDS=new Set(CATEGORIES.map(category=>category.id));

  let items=load();
  let editingId=null;
  let suppressClickUntil=0;
  let persistedSnapshot=JSON.stringify(items);

  function makeId(){
    return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  }

  function normalized(value){
    return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  }

  function inferCategory(text){
    const value=normalized(text);
    if(/masques et gel|masque et boules|masque anti|trousse de toilette|shampoing|lessive|medicament|labello|pommade|creme solaire|anti ampoule|orteils|pansement/.test(value))return 'salle-de-bains';
    if(/adaptateur secteur|adaptateur pour tel|chargeur|batterie externe|appli de transport|telephone|ecouteur|tablette|montre connectee|coque smartphone|smart tags|telecharger films|support de smartphone|cable pour le son|allume cigare/.test(value))return 'informatique';
    if(/lunettes de soleil|casquette|ceinture|pantalon|chaussette|calecon|haut normal|chemise|t shirts|bermuda|veste|bonnet|gants|pyjama|maillot de bain|chaussure|k way/.test(value))return 'vetements';
    if(/guide de ce qu|preuve de vol|passeport|portefeuille|qr code|temps suffisant|taille max|couper chauffage|sortir poubelles|prendre portefeuille dehors|demander ou peut nettoyer/.test(value))return 'organisation';
    return 'autres';
  }

  function load(){
    try{
      const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(Array.isArray(stored))return stored.filter(item=>item&&typeof item.text==='string').map(item=>({...item,category:CATEGORY_IDS.has(item.category)?item.category:inferCategory(item.text)}));
    }catch{}
    return DEFAULT_ITEMS.map((text,index)=>({id:'default-'+index,text,checked:true,category:inferCategory(text)}));
  }

  function save(){
    const nextSnapshot=JSON.stringify(items);
    if(nextSnapshot!==persistedSnapshot){
      window.dispatchEvent(new CustomEvent('guide-packing-change',{detail:{before:JSON.parse(persistedSnapshot),after:JSON.parse(nextSnapshot)}}));
    }
    localStorage.setItem(STORAGE_KEY,nextSnapshot);
    persistedSnapshot=nextSnapshot;
    window.dispatchEvent(new Event('guide-backup-change'));
  }

  function installLongPressReorder(row,list){
    let timer=null;
    let pointerId=null;
    let startY=0;
    let dragging=false;

    const stopTimer=()=>{if(timer){clearTimeout(timer);timer=null}};
    const finish=event=>{
      stopTimer();
      if(!dragging)return;
      event?.preventDefault();
      dragging=false;
      suppressClickUntil=Date.now()+450;
      row.classList.remove('is-dragging');
      list.classList.remove('is-reordering');
      const byId=new Map(items.map(item=>[item.id,item]));
      items=[...list.querySelectorAll('.packing-item')].map(element=>{
        const item=byId.get(element.dataset.id);
        if(item)item.category=element.closest('.packing-category')?.dataset.category||item.category||'autres';
        return item;
      }).filter(Boolean);
      save();
      render();
    };

    row.addEventListener('pointerdown',event=>{
      if((event.pointerType==='mouse'&&event.button!==0)||event.target.closest('input,.packing-remove'))return;
      pointerId=event.pointerId;
      startY=event.clientY;
      timer=setTimeout(()=>{
        timer=null;
        dragging=true;
        editingId=null;
        suppressClickUntil=Date.now()+700;
        list.classList.add('is-reordering');
        row.classList.add('is-dragging');
        try{row.setPointerCapture(pointerId)}catch{}
        try{navigator.vibrate?.(25)}catch{}
      },420);
    });
    row.addEventListener('pointermove',event=>{
      if(timer&&Math.abs(event.clientY-startY)>8)stopTimer();
      if(!dragging)return;
      event.preventDefault();
      if(event.clientY<125)window.scrollBy(0,-18);
      else if(event.clientY>window.innerHeight-85)window.scrollBy(0,18);
      const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.packing-item');
      if(!target||target===row||!list.contains(target))return;
      const bounds=target.getBoundingClientRect();
      const targetContainer=target.parentElement;
      targetContainer.insertBefore(row,event.clientY<bounds.top+bounds.height/2?target:target.nextSibling);
    });
    row.addEventListener('pointerup',finish);
    row.addEventListener('pointercancel',finish);
    row.addEventListener('contextmenu',event=>event.preventDefault());
  }

  function render(){
    const list=document.getElementById('packingList');
    const progress=document.getElementById('packingProgress');
    if(!list||!progress)return;
    list.replaceChildren();
    CATEGORIES.forEach(category=>{
      const section=document.createElement('section');
      section.className='packing-category';
      section.dataset.category=category.id;
      const heading=document.createElement('h3');
      const categoryItems=items.filter(item=>(item.category||inferCategory(item.text))===category.id);
      heading.innerHTML='<span aria-hidden="true">'+category.icon+'</span><span>'+category.label+'</span><small>'+categoryItems.length+'</small>';
      const categoryList=document.createElement('div');
      categoryList.className='packing-category-items';
      section.append(heading,categoryList);
      list.appendChild(section);
      categoryItems.forEach(item=>{
      const row=document.createElement('div');
      row.className='packing-item'+(editingId===item.id?' is-editing':'');
      row.dataset.id=item.id;
      row.title='Appui long pour déplacer. Appui sur le texte pour modifier.';
      const checkbox=document.createElement('input');
      checkbox.type='checkbox';
      checkbox.checked=!!item.checked;
      checkbox.setAttribute('aria-label',item.text);
      checkbox.addEventListener('change',()=>{
        item.checked=checkbox.checked;
        save();
        render();
      });
      let editor;
      if(editingId===item.id){
        editor=document.createElement('input');
        editor.type='text';
        editor.className='packing-edit-input';
        editor.value=item.text;
        editor.setAttribute('aria-label','Modifier : '+item.text);
        const finishEdit=()=>{
          if(editingId!==item.id)return;
          const value=editor.value.trim();
          if(value)item.text=value;
          editingId=null;
          save();
          render();
        };
        editor.addEventListener('blur',finishEdit);
        editor.addEventListener('keydown',event=>{
          if(event.key==='Enter'){event.preventDefault();finishEdit()}
          if(event.key==='Escape'){event.preventDefault();editingId=null;render()}
        });
        requestAnimationFrame(()=>{editor.focus();editor.select()});
      }else{
        editor=document.createElement('button');
        editor.type='button';
        editor.className='packing-label-button';
        editor.textContent=item.text;
        editor.setAttribute('aria-label','Modifier : '+item.text);
        editor.addEventListener('click',()=>{
          if(Date.now()<suppressClickUntil)return;
          editingId=item.id;
          render();
        });
      }
      const remove=document.createElement('button');
      remove.type='button';
      remove.className='packing-remove';
      remove.textContent='×';
      remove.title='Enlever de la liste';
      remove.setAttribute('aria-label','Enlever : '+item.text);
      remove.addEventListener('pointerdown',event=>event.preventDefault());
      remove.addEventListener('click',event=>{
        event.preventDefault();
        editingId=null;
        items=items.filter(entry=>entry.id!==item.id);
        save();
        render();
      });
      row.append(checkbox,editor,remove);
      categoryList.appendChild(row);
      installLongPressReorder(row,list);
      });
    });
    const checked=items.filter(item=>item.checked).length;
    progress.textContent=checked+' sur '+items.length+' cochés';
  }

  function install(){
    const form=document.getElementById('packingAddForm');
    const input=document.getElementById('packingAddInput');
    const category=document.getElementById('packingAddCategory');
    if(!form||!input||!category)return;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const text=input.value.trim();
      if(!text)return;
      items.push({id:makeId(),text,checked:false,category:CATEGORY_IDS.has(category.value)?category.value:'autres'});
      input.value='';
      save();
      render();
    });
    window.addEventListener('guide-packing-restore',event=>{
      if(!Array.isArray(event.detail?.items))return;
      items=event.detail.items.map(item=>({...item,category:CATEGORY_IDS.has(item.category)?item.category:inferCategory(item.text)}));
      persistedSnapshot=JSON.stringify(items);
      editingId=null;
      render();
    });
    render();
  }

  install();
})();
