/* 15 panoramas fournis, classés par parcours de visite. Les liens ne simulent pas un plan métrique. */
window.ROOFTOP_SCENES = [
  {id:'terrasse-panorama',title:'Terrasse · Panorama',group:'outside',area:'EXTÉRIEUR',desc:'Vue ouverte sur les montagnes et les balustrades du rooftop',yaw:-35,links:[['terrasse-coursive',1420,570],['salon-panoramique',1820,525]]},
  {id:'terrasse-coursive',title:'Terrasse · Coursive',group:'outside',area:'EXTÉRIEUR',desc:'Parcours extérieur et perspective sur les sommets',yaw:35,links:[['terrasse-seconde-vue',1250,570],['terrasse-panorama',220,570]]},
  {id:'terrasse-seconde-vue',title:'Terrasse · Autre perspective',group:'outside',area:'EXTÉRIEUR',desc:'Vue depuis la longueur de la terrasse',yaw:110,links:[['terrasse-coursive',1720,560],['terrasse-panorama',1200,570]]},
  {id:'salon-panoramique',title:'Salon · Côté panorama',group:'living',area:'PIÈCES DE VIE',desc:'Coin salon, fauteuils et grandes ouvertures sur le massif',yaw:-130,links:[['salon-salle-a-manger',1110,530],['terrasse-panorama',420,530]]},
  {id:'salon-salle-a-manger',title:'Salon · Salle à manger',group:'living',area:'PIÈCES DE VIE',desc:'Espace de réception, coin repas et ouvertures sur les montagnes',yaw:85,links:[['salon-panoramique',1500,555],['piece-de-vie-transition',340,565]]},
  {id:'piece-de-vie-transition',title:'Espace de vie · Accès cuisine',group:'living',area:'PIÈCES DE VIE',desc:'Vue entre les pièces de vie et la cuisine séparée',yaw:-55,links:[['cuisine',345,520],['salon-salle-a-manger',745,520]]},
  {id:'cuisine',title:'Cuisine',group:'utility',area:'CUISINE',desc:'Cuisine séparée avec plaques, évier et équipements visibles',yaw:-90,links:[['piece-de-vie-transition',1930,520],['entree',1710,520]]},
  {id:'entree',title:'Entrée et sanitaires',group:'utility',area:'CIRCULATION',desc:'Entrée du logement et accès aux sanitaires',yaw:15,links:[['degagement-placards',970,535],['piece-de-vie-transition',80,530]]},
  {id:'degagement-placards',title:'Dégagement et rangements',group:'utility',area:'CIRCULATION',desc:'Couloir, rangements intégrés et portes de distribution',yaw:40,links:[['couloir-chambres',1450,555],['entree',130,555]]},
  {id:'couloir-chambres',title:'Couloir des chambres',group:'utility',area:'CIRCULATION',desc:'Distribution des chambres depuis le couloir',yaw:5,links:[['chambre-familiale',790,560],['degagement-placards',1680,540]]},
  {id:'chambre-familiale',title:'Chambre avec couchages multiples',group:'sleeping',area:'ESPACE NUIT',desc:'Lit double et lits superposés, avec ouverture sur l’extérieur',yaw:-25,links:[['couloir-chambres',390,555],['chambre-double',1400,550]]},
  {id:'couloir-salle-de-bains',title:'Accès chambres & salle de bains',group:'utility',area:'CIRCULATION',desc:'Dégagement vers les espaces nuit et la salle de bains',yaw:120,links:[['salle-de-bains',1350,535],['chambre-double',1930,535]]},
  {id:'salle-de-bains',title:'Salle de bains',group:'utility',area:'SALLE DE BAINS',desc:'Baignoire, vasque et lave-linge visibles',yaw:95,links:[['couloir-salle-de-bains',1020,520],['entree',1640,520]]},
  {id:'chambre-double',title:'Chambre double',group:'sleeping',area:'ESPACE NUIT',desc:'Lit double, mobilier en bois et ouverture sur l’extérieur',yaw:25,links:[['couloir-salle-de-bains',1280,545],['chambre-double-autre-vue',690,545]]},
  {id:'chambre-double-autre-vue',title:'Chambre double · Autre vue',group:'sleeping',area:'ESPACE NUIT',desc:'Second panorama de la chambre et de ses rangements',yaw:-28,links:[['chambre-double',1450,535],['couloir-salle-de-bains',1100,540]]},
];
