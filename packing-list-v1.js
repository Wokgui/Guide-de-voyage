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

  let items=load();

  function makeId(){
    return Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  }

  function load(){
    try{
      const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(Array.isArray(stored))return stored.filter(item=>item&&typeof item.text==='string');
    }catch{}
    return DEFAULT_ITEMS.map((text,index)=>({id:'default-'+index,text,checked:true}));
  }

  function save(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(items));
    window.dispatchEvent(new Event('guide-backup-change'));
  }

  function render(){
    const list=document.getElementById('packingList');
    const progress=document.getElementById('packingProgress');
    if(!list||!progress)return;
    list.replaceChildren();
    items.forEach(item=>{
      const row=document.createElement('label');
      row.className='packing-item';
      const checkbox=document.createElement('input');
      checkbox.type='checkbox';
      checkbox.checked=!!item.checked;
      checkbox.setAttribute('aria-label',item.text);
      checkbox.addEventListener('change',()=>{
        item.checked=checkbox.checked;
        save();
        render();
      });
      const text=document.createElement('span');
      text.className='packing-label';
      text.textContent=item.text;
      const remove=document.createElement('button');
      remove.type='button';
      remove.className='packing-remove';
      remove.textContent='×';
      remove.title='Enlever de la liste';
      remove.setAttribute('aria-label','Enlever : '+item.text);
      remove.addEventListener('click',event=>{
        event.preventDefault();
        items=items.filter(entry=>entry.id!==item.id);
        save();
        render();
      });
      row.append(checkbox,text,remove);
      list.appendChild(row);
    });
    const checked=items.filter(item=>item.checked).length;
    progress.textContent=checked+' sur '+items.length+' cochés';
  }

  function install(){
    const form=document.getElementById('packingAddForm');
    const input=document.getElementById('packingAddInput');
    if(!form||!input)return;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const text=input.value.trim();
      if(!text)return;
      items.push({id:makeId(),text,checked:false});
      input.value='';
      save();
      render();
    });
    render();
  }

  install();
})();
