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

const BASE_LOCAL = '/photography/studies';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Build a study's photo list from an ordered title array.
const buildPhotos = (study: string, titles: string[]): StudyPhoto[] =>
  titles.map((title, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {
      id: `${study}-${n}`,
      title,
      src: `${BASE_LOCAL}/${study}/${n}-${slugify(title)}.webp`,
    };
  });

// Villeta — orden intencional: de lo vivo a la muerte.
const VILLETA_TITLES = [
  'Abundance', 'Dendrite', 'Cascade', 'Colonnade', 'Vertebrae',
  'Canopy', 'Constellation', 'Meridian', 'Tightrope', 'Vessel',
  'The Bloom', 'Aria', 'Tendril', 'Hung', 'Lantern',
  'Pendant', 'Dispersal', 'Cursive', 'Rainfall', 'Consumed',
  'Contorsion', 'Stranded', 'Emergence', 'Husk',
];
const DOSEL_TITLES = ['In Rain', 'Branches'];

const villetaPhotos = buildPhotos('villeta', VILLETA_TITLES);
const doselPhotos = buildPhotos('dosel', DOSEL_TITLES);

export const studies: Study[] = [
  {
    slug: 'villeta',
    title: 'Villeta',
    year: 2026,
    status: 'finished',
    description: {
      en: "A country house in the warm lands near Bogotá, and a camera that refused to look at the garden as a garden. These are photographs about tropical vegetation as pure form: the leaf, the vine, the seed, the way light moves through something alive. Not landscape. Structure.",
      es: "Una casa de campo en las tierras cálidas cerca de Bogotá, y una cámara que se negó a mirar el jardín como jardín. Estas son fotografías sobre la vegetación tropical como forma pura: la hoja, la enredadera, la semilla, la manera en que la luz atraviesa algo vivo. No es paisaje. Es estructura.",
    },
    coverPhoto: `${BASE_LOCAL}/villeta/cover.webp`,
    photos: villetaPhotos,
  },
  {
    slug: 'dosel',
    title: 'Dosel',
    status: 'ongoing',
    description: {
      en: "Look up. Always up. Through leaves, branches, canopy. The sky broken into fragments by whatever grows between you and it. This study is about the ceiling that trees make, the light they filter, and the feeling of standing beneath something alive and enormous. No horizons here. Just the weight of green above.",
      es: "Mira hacia arriba. Siempre hacia arriba. A través de hojas, ramas, dosel. El cielo roto en fragmentos por todo lo que crece entre tú y él. Este estudio trata del techo que hacen los árboles, la luz que filtran, y la sensación de estar parado bajo algo vivo y enorme. Aquí no hay horizontes. Solo el peso del verde por encima.",
    },
    coverPhoto: `${BASE_LOCAL}/dosel/cover.webp`,
    photos: doselPhotos,
  },
  {
    slug: 'containment',
    title: 'Containment',
    status: 'ongoing',
    description: {
      en: "People held by spaces. A woman behind bars in a colonial window. Miners swallowed by a tunnel. A couple framed inside a crumbling pavilion. The architecture does the holding, and the question is always the same: is the space protecting them, or trapping them? I keep finding this ambiguity everywhere, and I haven't decided which answer I prefer.",
      es: "Personas contenidas por el espacio. Una mujer tras las rejas de una ventana colonial. Mineros tragados por un túnel. Una pareja enmarcada dentro de un pabellón en ruinas. La arquitectura es la que contiene, y la pregunta es siempre la misma: ¿el espacio los protege o los atrapa? Sigo encontrando esta ambigüedad en todas partes, y no he decidido qué respuesta prefiero.",
    },
    photos: [],
  },
  {
    slug: 'between',
    title: 'Between',
    status: 'ongoing',
    description: {
      en: "Thresholds. The edge between inside and outside, between light and dark, between one state and the next. A man standing in a doorway. A bust glimpsed between the heads of museum visitors. A classroom where the window is the only exit. These photographs live in the moment just before crossing.",
      es: "Umbrales. El borde entre dentro y fuera, entre luz y sombra, entre un estado y el siguiente. Un hombre parado en una puerta. Un busto entrevisto entre las cabezas de los visitantes de un museo. Un salón de clases donde la ventana es la única salida. Estas fotografías viven en el instante justo antes de cruzar.",
    },
    photos: [],
  },
  {
    slug: 'ground',
    title: 'Ground',
    status: 'ongoing',
    description: {
      en: "The counterpoint to Dosel. Look down. Always down. The textures underfoot, the shadows cast on pavement, the things people step on without seeing. Wet cobblestones, cracked earth, tree roots breaking through concrete. No horizon, ever. Just what's beneath you.",
      es: "El contrapunto de Dosel. Mira hacia abajo. Siempre hacia abajo. Las texturas bajo los pies, las sombras proyectadas sobre el pavimento, lo que la gente pisa sin ver. Adoquines mojados, tierra agrietada, raíces que rompen el concreto. Sin horizonte, nunca. Solo lo que tienes debajo.",
    },
    photos: [],
  },
  {
    slug: 'remnant',
    title: 'Remnant',
    status: 'ongoing',
    description: {
      en: "What stays after something leaves. Peeling walls, worn sandals on old wood, a mummy's binding unraveling across millennia, a gargoyle watching a city that has changed beyond recognition. This is about the quiet erosion of the everyday, the texture that time leaves on things when no one is paying attention.",
      es: "Lo que queda después de que algo se va. Paredes descascaradas, sandalias gastadas sobre madera vieja, el vendaje de una momia deshilachándose a través de los milenios, una gárgola observando una ciudad que ha cambiado más allá de todo reconocimiento. Esto trata de la erosión silenciosa de lo cotidiano, la textura que el tiempo deja en las cosas cuando nadie está prestando atención.",
    },
    photos: [],
  },
];
