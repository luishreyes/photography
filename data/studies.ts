import { mergePhotos, type MPhoto } from './merge';

export interface StudyPhoto {
  id: string;
  title: string;
  src: string;
}

export interface Study {
  slug: string;
  title: string;
  year?: number;
  status: 'finished' | 'ongoing';
  description: { en: string; es: string };
  quote?: { text: string; author: string }; // queda en inglés (original)
  coverPhoto?: string;
  photos: StudyPhoto[];
}

const BASE = '/photography/studies';

// Villeta — orden curatorial intencional (de lo vivo a la muerte). Se usa como
// secuencia para ordenar las fotos reales de la carpeta; los títulos que ya no
// estén en la carpeta se omiten y los nuevos se anexan al final.
const VILLETA_ORDER = [
  'Abundance', 'Dendrite', 'Cascade', 'The Cast', 'Conduit',
  'Colonnade', 'Vertebrae', 'Canopy', 'Constellation', 'Meridian',
  'Tightrope', 'Vessel', 'The Bloom', 'Aria', 'Tendril',
  'Hung', 'Lantern', 'Pendant', 'Dispersal', 'Cursive',
  'Rainfall', 'Consumed', 'Stranded', 'Emergence', 'Husk',
];

// Passenger — orden de Adobe Portfolio (17 fotos). Las que aún no están en la
// carpeta (Noventa, Talisman, Onlookers) se omiten hasta identificarlas.
const PASSENGER_ORDER = [
  'La Consigna', 'Llámenos', 'Reflex', 'De Reojo', 'Comadreja',
  'Santa Bárbara', 'Noventa', 'Carmen', 'Muffled', 'Amulets',
  'El Escudo', 'Talisman', 'Promesa', 'Guadalupe', 'Salvoconducto', 'Onlookers',
  'Idol', 'Through Glass', 'Amparo', 'The Medallion',
];

// Dosel — la mirada que sube: de la espesura cerrada a la copa que se abre,
// luego a la silueta pura contra el cielo, y por fin a la vida y el fruto.
const DOSEL_ORDER = [
  'Breach', 'Oculus', 'Crown', 'Plumage', 'Vigía', 'Fruition',
];

// Containment — despoblación y escalada: de la contención colectiva a la figura
// única aplastada por la arquitectura, y por fin al recinto sin nadie.
const CONTAINMENT_ORDER = [
  'Waiting', 'Still Water', 'Into the Dark', 'Framed', 'Held',
  'Sanctuary', 'The Terrace', 'Sanctum', 'The Pavilion', 'The Landing',
  'Estratos', 'The Pause', 'Orbit', 'Desembocadura', 'Fuelle', 'Enclosure',
];

// Between — el instante justo antes de cruzar, cinco movimientos del umbral
// más físico al más disuelto: puerta, vidrio/reflejo, luz, geometría/cielo, velo.
const BETWEEN_ORDER = [
  'Estancia', 'Interior, Exterior', 'Recess', 'Cargada', 'Salida',
  'Through', 'Through Glass', 'Into the Wall',
  'Screenlight', 'Illumination', 'Bias',
  'Facing', 'Skew', 'Eaves', 'Between Bells',
  'Celosía', 'Between',
];

// Remnant — lo que queda: del resto más hondo y aislado sobre negro (hueso, hoja,
// cuerpo) a la huella humana y la marca inscrita, luego al muro sellado y por fin
// a la escala urbana, la gárgola que vigila la ciudad que se disuelve.
const REMNANT_ORDER = [
  'Remains', 'Filigree', 'The Binding', 'Worn', 'Inscription',
  'Gnomon', 'Sealed', 'Still Buried', 'Overhang',
];

// Metadata hand-authored; photo lists come from the archive via mergePhotos.
const rawStudies: Study[] = [
  {
    slug: 'villeta', title: 'Villeta', year: 2026, status: 'finished',
    description: {
      en: "A country house in the warm lands near Bogotá, and a camera that refused to look at the garden as a garden. These are photographs about tropical vegetation as pure form: the leaf, the vine, the seed, the way light moves through something alive. Not landscape. Structure.",
      es: "Una casa de campo en las tierras cálidas cerca de Bogotá, y una cámara que se negó a mirar el jardín como jardín. Estas son fotografías sobre la vegetación tropical como forma pura: la hoja, la enredadera, la semilla, la manera en que la luz atraviesa algo vivo. No es paisaje. Es estructura.",
    },
    quote: { text: "The plant must be valued as a totally artistic and architectural structure.", author: "Karl Blossfeldt" },
    coverPhoto: `${BASE}/villeta/cover.webp`, photos: [],
  },
  {
    slug: 'dosel', title: 'Dosel', status: 'ongoing',
    description: {
      en: "Look up. Always up. Through leaves, branches, canopy. The sky broken into fragments by whatever grows between you and it. This study is about the ceiling that trees make, the light they filter, and the feeling of standing beneath something alive and enormous. No horizons here. Just the weight of green above.",
      es: "Mira hacia arriba. Siempre hacia arriba. A través de hojas, ramas, dosel. El cielo roto en fragmentos por todo lo que crece entre tú y él. Este estudio trata del techo que hacen los árboles, la luz que filtran, y la sensación de estar parado bajo algo vivo y enorme. Aquí no hay horizontes. Solo el peso del verde por encima.",
    },
    quote: { text: "One should not only photograph things for what they are but for what else they are.", author: "Minor White" },
    coverPhoto: `${BASE}/dosel/cover.webp`, photos: [],
  },
  {
    slug: 'containment', title: 'Containment', status: 'ongoing',
    description: {
      en: "People held by spaces. The architecture does the holding, and the question is always the same: is the space protecting them, or trapping them? I keep finding this ambiguity everywhere, and I haven't decided which answer I prefer.",
      es: "Personas contenidas por el espacio. La arquitectura es la que contiene, y la pregunta es siempre la misma: ¿el espacio protege o atrapa? Sigo encontrando esta ambigüedad en todas partes, y no he decidido qué respuesta prefiero.",
    },
    quote: { text: "A photograph is a secret about a secret. The more it tells you the less you know.", author: "Diane Arbus" },
    coverPhoto: `${BASE}/containment/cover.webp`, photos: [],
  },
  {
    slug: 'between', title: 'Between', status: 'ongoing',
    description: {
      en: "Thresholds. The edge between inside and outside, between light and dark, between one state and the next. Anything can be an edge if you stand on it. These photographs live in the moment just before crossing.",
      es: "Umbrales. El borde entre dentro y fuera, entre luz y sombra, entre un estado y el siguiente. Cualquier cosa puede ser un borde si uno se para en él. Estas fotografías viven en el instante justo antes de cruzar.",
    },
    quote: { text: "I like it when one is not certain what one sees.", author: "Saul Leiter" },
    coverPhoto: `${BASE}/between/cover.webp`, photos: [],
  },
  {
    slug: 'passenger', title: 'Passenger', status: 'ongoing',
    description: {
      en: "Photographs made from the back seat, in motion. The window is a frame that never holds still: a city sliding past, reflections on the glass, strangers caught for the length of a red light. Being carried somewhere, and photographing whatever the ride hands you.",
      es: "Fotografías hechas desde el asiento de atrás, en movimiento. La ventana es un marco que nunca se queda quieto: una ciudad que se desliza, reflejos en el vidrio, desconocidos atrapados lo que dura un semáforo. Dejarse llevar y fotografiar lo que el trayecto va entregando.",
    },
    quote: { text: "For me cities are enormous bodies of people's desires.", author: "Daido Moriyama" },
    coverPhoto: `${BASE}/passenger/cover.webp`, photos: [],
  },
  {
    slug: 'remnant', title: 'Remnant', status: 'ongoing',
    description: {
      en: "What stays after something leaves. The quiet erosion of the everyday, the texture that time leaves on things when no one is paying attention.",
      es: "Lo que queda después de que algo se va. La erosión silenciosa de lo cotidiano, la textura que el tiempo deja en las cosas cuando nadie está prestando atención.",
    },
    quote: { text: "Everything around us, dead or alive, in the eyes of a crazy photographer mysteriously takes on many variations, so that a seemingly dead object comes to life through light or by its surroundings.", author: "Josef Sudek" },
    coverPhoto: `${BASE}/remnant/cover.webp`, photos: [],
  },
  {
    slug: 'ground', title: 'Ground', status: 'ongoing',
    description: {
      en: "The counterpoint to Dosel. Look down. Always down. The textures underfoot, the shadows cast on pavement, the things people step on without seeing. Wet cobblestones, cracked earth, tree roots breaking through concrete. No horizon, ever. Just what's beneath you.",
      es: "El contrapunto de Dosel. Mira hacia abajo. Siempre hacia abajo. Las texturas bajo los pies, las sombras proyectadas sobre el pavimento, lo que la gente pisa sin ver. Adoquines mojados, tierra agrietada, raíces que rompen el concreto. Sin horizonte, nunca. Solo lo que tienes debajo.",
    },
    photos: [],
  },
  {
    slug: 'chicago', title: 'Chicago', status: 'ongoing',
    description: {
      en: "A project in pre-production. Chicago — its architecture, its light, its impossible scale — photographed on an upcoming trip. Nothing here yet: this is the space held open for a body of work that doesn't exist so far.",
      es: "Un proyecto en pre-producción. Chicago —su arquitectura, su luz, su escala imposible— fotografiada en un viaje próximo. Aún no hay nada: este es el lugar reservado para un cuerpo de trabajo que todavía no existe.",
    },
    photos: [],
  },
];

// Photos from the archive (data/generated.ts). Studies with a curatorial
// sequence below follow it (mode 'curated'); any without one order
// newest→oldest by capture date.
const CURATED_ORDERS: Record<string, string[]> = {
  villeta: VILLETA_ORDER,
  passenger: PASSENGER_ORDER,
  dosel: DOSEL_ORDER,
  containment: CONTAINMENT_ORDER,
  between: BETWEEN_ORDER,
  remnant: REMNANT_ORDER,
};

export const studies: Study[] = rawStudies.map(s => {
  const order = CURATED_ORDERS[s.slug];
  return {
    ...s,
    photos: (
      order
        ? mergePhotos(s.slug, order.map((t): MPhoto => ({ id: '', title: t, src: '' })), 'curated')
        : mergePhotos(s.slug, s.photos, 'date-desc')
    ) as StudyPhoto[],
  };
});
