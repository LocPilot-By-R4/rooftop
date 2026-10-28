import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const APP=window.ROOFTOP_APP;
const SCENES=window.ROOFTOP_SCENES;
const initial=APP.getScene(APP.getCurrent()) || SCENES[0];
const panoramaPath=(scene)=>`assets/panoramas/${scene.id}.webp`;
const markersFor=(scene)=>scene.links.map(([target,x,y])=>{
  const dest=APP.getScene(target);
  return {
    id:`go-${target}`,position:{textureX:x,textureY:y},
    size:{width:165,height:42},anchor:'center center',
    className:'hotspot-pin',
    html:`<div class="hotspot-bubble"><span>↗</span>${dest.title.replaceAll(' · ',' / ')}</div>`,
    tooltip:`Voir : ${dest.title}`,
    data:{target},hideList:true,
  };
});

try {
  const viewer = new Viewer({
    container:document.getElementById('viewer'),
    panorama:panoramaPath(initial),
    defaultYaw:`${initial.yaw}deg`,
    defaultPitch:'0deg',
    defaultZoomLvl:31,
    minFov:35,maxFov:95,
    mousewheelCtrlKey:true,
    touchmoveTwoFingers:false,
    navbar:['zoom','move','fullscreen'],
    loadingTxt:'Chargement de la visite 360°…',
    lang:{zoom:'Zoom',zoomOut:'Dézoomer',zoomIn:'Zoomer',moveUp:'Monter',moveDown:'Descendre',moveLeft:'Gauche',moveRight:'Droite',fullscreen:'Plein écran',loading:'Chargement…',loadError:'Impossible de charger ce panorama',webglError:'WebGL est nécessaire pour la visite 360°',twoFingers:'Utilisez deux doigts pour déplacer la vue',ctrlZoom:'Maintenez Ctrl pour zoomer'},
    plugins:[MarkersPlugin.withConfig({markers:markersFor(initial)})],
  });
  const markers=viewer.getPlugin(MarkersPlugin);
  markers.addEventListener('select-marker',({marker})=>{if(marker.data?.target)goTo(marker.data.target);});
  let ready=false;
  let currentId=initial.id;
  let changing=false;
  async function goTo(id) {
    if(!ready || changing || currentId===id) return;
    const scene=APP.getScene(id); if(!scene) return;
    changing=true;
    try {
      await viewer.setPanorama(panoramaPath(scene),{
        position:{yaw:`${scene.yaw}deg`,pitch:'0deg'},
        transition:{effect:'fade',speed:700,rotation:false},
      });
      currentId=id;
      markers.setMarkers(markersFor(scene));
      APP.setSceneFromViewer(id);
    } catch(e) {
      APP.showError('Impossible d’ouvrir ce panorama. Vérifiez les fichiers et votre connexion.');
      throw e;
    } finally {changing=false;}
  }
  viewer.addEventListener('ready',()=>{
    ready=true;
    APP.registerTour({isReady:()=>ready,goTo,fullscreen:()=>viewer.toggleFullscreen()});
    if(APP.getCurrent()!==currentId) goTo(APP.getCurrent());
  },{once:true});
} catch(err) {
  console.error('Initialisation Photo Sphere Viewer:',err);
  APP.showError('Le lecteur 360° n’a pas pu démarrer sur ce navigateur.');
}
