(() => {
  'use strict';
  const SCENES = window.ROOFTOP_SCENES || [];
  const CONFIG = window.ROOFTOP_CONFIG || {};
  const byId = (id) => document.getElementById(id);
  const qs = (s, scope=document) => scope.querySelector(s);
  let current = SCENES[0]?.id;
  let activeFilter = 'all';
  let tourBridge = null;
  let warningShown = false;
  const sceneById = (id) => SCENES.find((s) => s.id === id);

  function toast(message) {
    const el = byId('toast');
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => el.classList.remove('visible'), 3000);
  }

  const pathnameWithoutScene = () => location.pathname + location.search;
  const sceneUrl = (id) => location.origin + pathnameWithoutScene() + '#visite/' + id;
  function currentSceneFromHash() {
    const match = /^#visite\/([a-z0-9-]+)$/.exec(location.hash);
    return match && sceneById(match[1]) ? match[1] : null;
  }
  if(currentSceneFromHash()) current = currentSceneFromHash();

  function sceneHTML(scene, i) {
    return `<button class="scene-row" type="button" data-scene="${scene.id}" aria-label="Voir ${scene.title}"><img loading="lazy" alt="" src="assets/previews/${scene.id}.webp" width="85" height="58"><span class="scene-row-body"><span class="scene-row-index">${String(i+1).padStart(2,'0')} / ${String(SCENES.length).padStart(2,'0')}</span><span class="scene-row-title">${scene.title}</span><span class="scene-row-detail">${scene.area}</span></span></button>`;
  }
  function renderList() {
    const shown = SCENES.filter((s)=>activeFilter==='all'||s.group===activeFilter);
    byId('scene-list').innerHTML = shown.map(s => sceneHTML(s, SCENES.indexOf(s))).join('');
    byId('scene-list').querySelectorAll('[data-scene]').forEach(btn => btn.addEventListener('click',()=>selectScene(btn.dataset.scene)));
    updateCurrentUI();
  }
  function updateCurrentUI() {
    const scene=sceneById(current); if(!scene)return;
    byId('scene-title').textContent=scene.title;
    byId('scene-category').textContent=scene.area;
    byId('scene-subtitle').textContent=scene.desc;
    byId('scene-counter').textContent=`${String(SCENES.indexOf(scene)+1).padStart(2,'0')} / ${SCENES.length}`;
    qs('.tour-stage').style.backgroundImage = `url('assets/previews/${scene.id}.webp')`;
    byId('viewer-fallback').style.backgroundImage=`linear-gradient(0deg, #03101981, #04131c44), url('assets/previews/${scene.id}.webp')`;
    document.querySelectorAll('[data-scene]').forEach(btn=>{
      const active=btn.dataset.scene===current;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-current',active ? 'true':'false');
      if(active) btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});
    });
  }
  async function selectScene(id,{fromPopstate=false}={}) {
    if (!sceneById(id)) return;
    if (current===id && tourBridge?.isReady()) return;
    current=id;
    updateCurrentUI();
    if(!fromPopstate) history.replaceState(null,'',pathnameWithoutScene()+'#visite/'+id);
    if(tourBridge?.isReady()) {
      try { await tourBridge.goTo(id); }
      catch(err) { console.error('Panorama:',err); showError('Cette vue ne peut pas être affichée. Choisissez un autre panorama.'); }
    }
  }
  function nextScene(step) {
    const i=SCENES.findIndex(s=>s.id===current);
    selectScene(SCENES[(i+step+SCENES.length)%SCENES.length].id);
  }
  function showError(msg) {
    warningShown=true;
    byId('viewer-message').textContent=msg;
    byId('viewer-fallback').classList.remove('hidden');
    byId('viewer-fallback').classList.add('error');
  }
  async function share(url) {
    if(navigator.share) {
      try { await navigator.share({ title:'Rooftop à La Mongie · Visite 360°', url }); return; }
      catch(e) { if(e.name==='AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); toast('Lien copié · vous pouvez le partager'); }
    catch(e) {
      const field=document.createElement('textarea');field.value=url;field.style.position='fixed';field.style.top='-1000px';document.body.appendChild(field);field.select();
      const ok=document.execCommand('copy');field.remove();toast(ok?'Lien copié':'Copiez le lien dans la barre d’adresse');
    }
  }
  function setContact() {
    const el=byId('contact-dynamic'); const items=[];
    if(CONFIG.contactName) {
      const name=document.createElement('span');name.className='contact-note';name.textContent=`Interlocuteur : ${CONFIG.contactName}`;el.appendChild(name);
    }
    if(CONFIG.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.contactEmail)) {
      const a=document.createElement('a');a.href='mailto:'+encodeURIComponent(CONFIG.contactEmail)+'?subject='+encodeURIComponent('Rooftop La Mongie — demande de renseignements');a.className='contact-link';a.textContent='✉  Écrire pour en savoir plus ↗';el.appendChild(a);
    }
    if(CONFIG.contactPhone && /^[+0-9 .()\-]{6,25}$/.test(CONFIG.contactPhone)) {
      const a=document.createElement('a');a.href='tel:'+CONFIG.contactPhone.replace(/[^+0-9]/g,'');a.className='contact-link';a.textContent='☎  '+CONFIG.contactPhone;el.appendChild(a);
    }
  }
  function initNav() {
    const btn=byId('mobile-menu'); const nav=byId('main-nav');
    btn.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu');});
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');btn.setAttribute('aria-expanded','false');}));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'){nav.classList.remove('open');btn.setAttribute('aria-expanded','false');} });
  }
  function bindEvents() {
    byId('scene-prev').addEventListener('click',()=>nextScene(-1));
    byId('scene-next').addEventListener('click',()=>nextScene(1));
    byId('viewer-fullscreen').addEventListener('click',()=>{
      if(tourBridge?.isReady()) tourBridge.fullscreen(); else toast('La visite 360° doit être chargée pour le plein écran.');
    });
    byId('share-scene').addEventListener('click',()=>share(sceneUrl(current)));
    byId('share-site').addEventListener('click',()=>share(location.origin+pathnameWithoutScene()));
    document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
      activeFilter=btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(x=>{const selected=x===btn;x.classList.toggle('active',selected);x.setAttribute('aria-pressed',String(selected));});
      renderList();
    }));
    document.querySelectorAll('[data-open-scene]').forEach(el=>el.addEventListener('click',()=>{
      selectScene(el.dataset.openScene);
      setTimeout(()=>byId('visite').scrollIntoView({behavior:'smooth'}),60);
    }));
    window.addEventListener('hashchange',()=>{const dest=currentSceneFromHash();if(dest)selectScene(dest,{fromPopstate:true});});
    document.addEventListener('keydown',e=>{
      if(e.target.closest('input,textarea,button,a')) return;
      const visible=byId('tour-shell').getBoundingClientRect();
      if(visible.bottom<0||visible.top>window.innerHeight) return;
      if(e.key==='ArrowLeft'){e.preventDefault();nextScene(-1);}
      if(e.key==='ArrowRight'){e.preventDefault();nextScene(1);}
    });
  }
  // Interface visible même si les bibliothèques 360 distantes ne peuvent pas être chargées.
  window.ROOFTOP_APP={
    getCurrent:()=>current,
    getScene:sceneById,
    getAll:()=>SCENES,
    registerTour(bridge) {
      tourBridge=bridge;
      byId('viewer-fallback').classList.add('hidden');
      byId('viewer-fallback').classList.remove('error');
      warningShown=false;
    },
    setSceneFromViewer(id) {current=id;updateCurrentUI();history.replaceState(null,'',pathnameWithoutScene()+'#visite/'+id);},
    showError,
    toast,
  };
  initNav();setContact();renderList();bindEvents();
  if(currentSceneFromHash()) window.addEventListener('load',()=>setTimeout(()=>byId('visite').scrollIntoView({behavior:'smooth'}),160),{once:true});
  setTimeout(()=>{
    if(!tourBridge?.isReady()&&!warningShown) showError('La visite 360° nécessite une connexion Internet. Les aperçus restent consultables.');
  },15000);
})();
