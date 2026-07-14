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
  coverPhoto?: string;
  photos: StudyPhoto[];
}

const BASE = '/photography/studies';

// Villeta — orden curatorial intencional (de lo vivo a la muerte). Se usa como
// secuencia para ordenar las fotos reales de la carpeta; los títulos que ya no
// estén en la carpeta se omiten y los nuevos se anexan al final.
const VILLETA_ORDER = [
  'Abundance', 'Dendrite', 'Cascade', 'Colonnade', 'Vertebrae',
  'Canopy', 'Constellation', 'Meridian', 'Tightrope', 'Vessel',
  'The Bloom', 'Aria', 'Tendril', 'Hung', 'Lantern',
  'Pendant', 'Dispersal', 'Cursive', 'Rainfall', 'Consumed',
  'Contorsion', 'Stranded', 'Emergence', 'Husk',
];

// Metadata hand-authored; photo lists come from the archive via mergePhotos.
const rawStudies: Study[] = [
  {
    slug: 'villeta', title: 'Villeta', year: 2026, status: 'finished',
    description: {
      en: "A country house in the warm lands near Bogotá, and a camera that refused to look at the garden as a garden. These are photographs about tropical vegetation as pure form: the leaf, the vine, the seed, the way light moves through something alive. Not landscape. Structure.",
      es: "Una casa de campo en las tierras cálidas cerca de Bogotá, y una cámara que se negó a mirar el jardín como jardín. Estas son fotografías sobre la vegetación tropical como forma pura: la hoja, la enredadera, la semilla, la manera en que la luz atraviesa algo vivo. No es paisaje. Es estructura.",
    },
    coverPhoto: `${BASE}/villeta/cover.webp`, photos: [],
  },
  {
    slug: 'dosel', title: 'Dosel', status: 'ongoing',
    description: {
      en: "Look up. Always up. Through leaves, branches, canopy. The sky broken into fragments by whatever grows between you and it. This study is about the ceiling that trees make, the light they filter, and the feeling of standing beneath something alive and enormous. No horizons here. Just the weight of green above.",
      es: "Mira hacia arriba. Siempre hacia arriba. A través de hojas, ramas, dosel. El cielo roto en fragmentos por todo lo que crece entre tú y él. Este estudio trata del techo que hacen los árboles, la luz que filtran, y la sensación de estar parado bajo algo vivo y enorme. Aquí no hay horizontes. Solo el peso del verde por encima.",
    },
    coverPhoto: `${BASE}/dosel/cover.webp`, photos: [],
  },
  {
    slug: 'containment', title: 'Containment', status: 'ongoing',
    description: {
      en: "People held by spaces. A woman behind bars in a colonial window. Miners swallowed by a tunnel. A couple framed inside a crumbling pavilion. The architecture does the holding, and the question is always the same: is the space protecting them, or trapping them? I keep finding this ambiguity everywhere, and I haven't decided which answer I prefer.",
      es: "Personas contenidas por el espacio. Una mujer tras las rejas de una ventana colonial. Mineros tragados por un túnel. Una pareja enmarcada dentro de un pabellón en ruinas. La arquitectura es la que contiene, y la pregunta es siempre la misma: ¿el espacio los protege o los atrapa? Sigo encontrando esta ambigüedad en todas partes, y no he decidido qué respuesta prefiero.",
    },
    coverPhoto: `${BASE}/containment/cover.webp`, photos: [],
  },
  {
    slug: 'between', title: 'Between', status: 'ongoing',
    description: {
      en: "Thresholds. The edge between inside and outside, between light and dark, between one state and the next. A man standing in a doorway. A bust glimpsed between the heads of museum visitors. A classroom where the window is the only exit. These photographs live in the moment just before crossing.",
      es: "Umbrales. El borde entre dentro y fuera, entre luz y sombra, entre un estado y el siguiente. Un hombre parado en una puerta. Un busto entrevisto entre las cabezas de los visitantes de un museo. Un salón de clases donde la ventana es la única salida. Estas fotografías viven en el instante justo antes de cruzar.",
    },
    coverPhoto: `${BASE}/between/cover.webp`, photos: [],
  },
  {
    slug: 'passenger', title: 'Passenger', status: 'ongoing',
    description: {
      en: "Photographs made from the back seat, in motion. The window is a frame that never holds still: a city sliding past, reflections on the glass, strangers caught for the length of a red light. Being carried somewhere, and photographing whatever the ride hands you.",
      es: "Fotografías hechas desde el asiento de atrás, en movimiento. La ventana es un marco que nunca se queda quieto: una ciudad que se desliza, reflejos en el vidrio, desconocidos atrapados lo que dura un semáforo. Dejarse llevar y fotografiar lo que el trayecto va entregando.",
    },
    coverPhoto: `${BASE}/passenger/cover.webp`, photos: [],
  },
  {
    slug: 'remnant', title: 'Remnant', status: 'ongoing',
    description: {
      en: "What stays after something leaves. Peeling walls, worn sandals on old wood, a mummy's binding unraveling across millennia, a gargoyle watching a city that has changed beyond recognition. This is about the quiet erosion of the everyday, the texture that time leaves on things when no one is paying attention.",
      es: "Lo que queda después de que algo se va. Paredes descascaradas, sandalias gastadas sobre madera vieja, el vendaje de una momia deshilachándose a través de los milenios, una gárgola observando una ciudad que ha cambiado más allá de todo reconocimiento. Esto trata de la erosión silenciosa de lo cotidiano, la textura que el tiempo deja en las cosas cuando nadie está prestando atención.",
    },
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

// Photos from the archive (data/generated.ts). Villeta keeps its curatorial
// sequence; the other open studies order newest→oldest by capture date.
export const studies: Study[] = rawStudies.map(s => ({
  ...s,
  photos: (
    s.slug === 'villeta'
      ? mergePhotos('villeta', VILLETA_ORDER.map((t): MPhoto => ({ id: '', title: t, src: '' })), 'curated')
      : mergePhotos(s.slug, s.photos, 'date-desc')
  ) as StudyPhoto[],
}));
