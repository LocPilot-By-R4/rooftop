import { Viewer } from '@photo-sphere-viewer/core';

const scenes = [
  {id:'sejour-cuisine-ouverte', title:'Séjour et cuisine ouverte',group:'living',area:'PIÈCES DE VIE',desc:'Ouverture projetée de la cuisine sur l’espace de réception',yaw:-30, before:'salon-salle-a-manger'},
  {id:'salon-montagne',title:'Salon côté montagnes',group:'living',area:'PIÈCES DE VIE',desc:'Mobilier chalet contemporain et fenêtres panoramiques',yaw:-100,before:'salon-panoramique'},
  {id:'chambre-double',title:'Chambre double',group:'sleeping',area:'CHAMBRES',desc:'Suite chaleureuse avec lit double et rangements',yaw:0,before:'chambre-double'},
  {id:'chambre-familiale',title:'Chambre familiale',group:'sleeping',area:'CHAMBRES',desc:'Un lit double et un lit simple, sans lits superposés',yaw:-10,before:'chambre-familiale'},
  {id:'salle-de-bains-douche',title:'Salle de bains · Douche',group:'bathroom',area:'SALLE DE BAINS',desc:'Variante avec douche à l’italienne, sous réserve de faisabilité',yaw:110,before:'salle-de-bains'},
  {id:'salle-de-bains-balneo',title:'Salle de bains · Balnéo',group:'bathroom',area:'SALLE DE BAINS',desc:'Variante avec baignoire balnéo et écran de douche',yaw:108,before:'salle-de-bains'},
  {id:'salle-de-bains-spa',title:'Salle de bains · Alternative',group:'bathroom',area:'SALLE DE BAINS',desc:'Autre piste d’aménagement de l’espace bains',yaw:105,before:'salle-de-bains'},
  {id:'terrasse-parasol',title:'Terrasse · Salon et parasol',group:'terrace',area:'EXTÉRIEUR',desc:'Salon extérieur et parasol déporté (projet)',yaw:35,before:'terrasse-coursive'},
  {id:'terrasse-pergola',title:'Terrasse · Pergola',group:'terrace',area:'EXTÉRIEUR',desc:'Pergola modulable et brise-vues (projet soumis à autorisation)',yaw:35,before:'terrasse-coursive'},
];
const byId=(id)=>document.getElementById(id);
const fromHash=()=>{const id=decodeURIComponent(location.hash.replace(/^#/,'')).trim();return scenes.some(s=>s.id===id)?id:null;};
let activeId=fromHash()||scenes[0].id;
let filter='all';
let viewer=null;
let loading=false;
let ready=false;
let toastTimer=0;
const sceneById=(id)=>scenes.find(s=>s.id===id);
const panorama=(s)=>`../assets/apres-renovation/panoramas/${s.id}.webp`;
const preview=(s)=>`../assets/apres-renovation/previews/${s.id}.webp`;
function notify(message){const e=byId('reno-toast');e.textContent=message;e.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('is-visible'),2900);}
function renderList(){
  byId('reno-scenes').innerHTML=scenes.filter(s=>filter==='all'||s.group===filter).map((s)=>`<button type="button" class="reno-scene-button ${activeId===s.id?'is-current':''}" data-scene="${s.id}" aria-current="${activeId===s.id?'true':'false'}"><img src="${preview(s)}" alt="" loading="lazy" width="84" height="61"><span class="reno-scene-label"><small>${s.area}</small><strong>${s.title}</strong></span></button>`).join('');
  byId('reno-scenes').querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>selectScene(b.dataset.scene)));
}
function updateUi(){
  const scene=sceneById(activeId); if(!scene)return;
  byId('reno-current-title').textContent=scene.title;
  byId('reno-current-desc').textContent=scene.desc;
  byId('reno-category').textContent=scene.area;
  byId('reno-viewer').parentElement.style.backgroundImage=`url('${preview(scene)}')`;
  renderList();
}
async function selectScene(id,updateHash=true){
 const s=sceneById(id);if(!s)return;
 if(loading)return;
 if(s.id===activeId&&ready)return;
 activeId=id;
 updateUi();
 if(updateHash)history.replaceState(null,'','#'+id);
 if(!ready||!viewer)return;
 loading=true;
 try { await viewer.setPanorama(panorama(s),{position:{yaw:`${s.yaw}deg`,pitch:'0deg'},transition:{effect:'fade',speed:650,rotation:false}});}
 catch(err){console.error('Changement de panorama',err);byId('reno-status').textContent='Cette scène n’a pas pu être chargée. Vérifiez la connexion et les fichiers.';byId('reno-loading').classList.remove('is-hidden');}
 finally{loading=false;}
}
function step(n){const i=scenes.findIndex(s=>s.id===activeId);selectScene(scenes[(i+n+scenes.length)%scenes.length].id);}
async function share(){const url=new URL('#'+activeId,location.href).href;if(navigator.share){try{await navigator.share({title:'Rooftop La Mongie — après rénovation',url});return;}catch(e){if(e.name==='AbortError')return;}}try{await navigator.clipboard.writeText(url);notify('Lien de cette perspective copié');}catch(e){notify('Copiez l’adresse de votre navigateur');}}
byId('reno-prev').addEventListener('click',()=>step(-1));
byId('reno-next').addEventListener('click',()=>step(1));
byId('reno-fullscreen').addEventListener('click',()=>ready?viewer.toggleFullscreen():notify('Chargement de la visite en cours'));
byId('reno-share').addEventListener('click',share);
byId('reno-scenes').addEventListener('keydown',(e)=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
 filter=btn.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(b=>{const on=b===btn;b.classList.toggle('is-selected',on);b.setAttribute('aria-pressed',String(on));});renderList();
}));
window.addEventListener('hashchange',()=>{const id=fromHash();if(id&&id!==activeId)selectScene(id,false);});
updateUi();
try {
 const init=sceneById(activeId);
 viewer=new Viewer({
   container:byId('reno-viewer'),panorama:panorama(init),
   defaultYaw:`${init.yaw}deg`,defaultPitch:'0deg',defaultZoomLvl:31,
   minFov:35,maxFov:95,mousewheelCtrlKey:true,touchmoveTwoFingers:false,
   navbar:['zoom','move','fullscreen'],loadingTxt:'Chargement de la projection 360°…',
   lang:{zoom:'Zoom',zoomOut:'Dézoomer',zoomIn:'Zoomer',moveUp:'Monter',moveDown:'Descendre',moveLeft:'Gauche',moveRight:'Droite',fullscreen:'Plein écran',loading:'Chargement…',loadError:'Impossible de charger cette perspective',webglError:'WebGL est nécessaire pour la visite 360°',twoFingers:'Utilisez deux doigts',ctrlZoom:'Maintenez Ctrl pour zoomer'},
 });
 viewer.addEventListener('ready',()=>{ready=true;byId('reno-loading').classList.add('is-hidden');},{once:true});
 setTimeout(()=>{if(!ready){byId('reno-status').textContent='Le lecteur nécessite une connexion pour charger Photo Sphere Viewer. Les aperçus restent accessibles.';}},13000);
} catch(err){console.error('Initialisation lecteur',err);byId('reno-status').textContent='Le lecteur 360° n’a pas pu démarrer. Les images du projet restent accessibles dans les vignettes.';}
