import { mergePhotos } from './merge';

export interface Photo {
  id: string;
  title: string;
  src: string;       // local /photography/... path
  width?: number;    // original px width (optional; unused by the flat viewer)
  height?: number;   // original px height
  year?: number;
}

export interface Series {
  slug: string;
  title: string;
  year: number;
  description: { en: string; es: string };
  quote?: { text: string; author: string }; // queda en inglés (original)
  coverPhoto: string;
  photos: Photo[];
}

const BASE_LOCAL = '/photography';

const rawSeries: Series[] = [
  {
    slug: 'geometries',
    title: 'Geometries',
    year: 2026,
    description: {
      en: "I keep finding myself looking at buildings the way other people look at faces. Lines, curves, repetition. There's something in the way a structure holds space that feels almost alive. These photographs are about that feeling: the moment when architecture stops being a backdrop and starts being the subject.",
      es: "Me descubro mirando los edificios como otros miran los rostros. Líneas, curvas, repetición. Hay algo en la forma en que una estructura sostiene el espacio que se siente casi vivo. Estas fotografías tratan de esa sensación: el momento en que la arquitectura deja de ser un telón de fondo y empieza a ser el tema.",
    },
    quote: { text: "A good photograph is knowing where to stand.", author: "Ansel Adams" },
    coverPhoto: `${BASE_LOCAL}/geometries/cover.webp`,
    photos: [
      { id: 'geometries-01', title: 'Atrium Vortex',   src: `${BASE_LOCAL}/geometries/01-atrium-vortex.webp`,   width: 3962,  height: 5943 },
      { id: 'geometries-02', title: 'Repetition',       src: `${BASE_LOCAL}/geometries/02-repetition.webp`,       width: 4251,  height: 6393 },
      { id: 'geometries-03', title: 'Rosace',           src: `${BASE_LOCAL}/geometries/03-rosace.webp`,           width: 5026,  height: 7539 },
      { id: 'geometries-04', title: 'The Spiral',       src: `${BASE_LOCAL}/geometries/04-the-spiral.webp`,       width: 7897,  height: 5265 },
      { id: 'geometries-05', title: 'Divide',           src: `${BASE_LOCAL}/geometries/05-divide.webp`,           width: 4096,  height: 4096 },
      { id: 'geometries-06', title: 'Suspension',       src: `${BASE_LOCAL}/geometries/06-suspension.webp`,       width: 10875, height: 7231 },
      { id: 'geometries-07', title: 'Science Faculty',  src: `${BASE_LOCAL}/geometries/07-science-faculty.webp`,  width: 10465, height: 6977 },
      { id: 'geometries-08', title: 'Lattice',          src: `${BASE_LOCAL}/geometries/08-lattice.webp`,          width: 3993,  height: 5989 },
      { id: 'geometries-09', title: 'Facet',            src: `${BASE_LOCAL}/geometries/09-facet.webp`,            width: 3890,  height: 3890 },
      { id: 'geometries-10', title: 'Urban Grid',       src: `${BASE_LOCAL}/geometries/10-urban-grid.webp`,       width: 3981,  height: 5308 },
      { id: 'geometries-11', title: 'The Crossing',     src: `${BASE_LOCAL}/geometries/11-the-crossing.webp`,     width: 5456,  height: 8184 },
      { id: 'geometries-12', title: 'Ascent',           src: `${BASE_LOCAL}/geometries/12-ascent.webp`,           width: 5333,  height: 8000 },
    ],
  },
  {
    slug: 'abstractions',
    title: 'Abstractions',
    year: 2026,
    description: {
      en: "Everything here started as something recognizable. But movement, blur, or light got in the way, and the original thing dissolved into something else. That's not an accident I chose to keep: it's the point. I'm less interested in what you see and more interested in what you feel before you figure out what you're looking at.",
      es: "Todo aquí empezó siendo algo reconocible. Pero el movimiento, el desenfoque o la luz se interpusieron, y lo original se disolvió en otra cosa. No es un accidente que decidí conservar: es el punto. Me interesa menos lo que ves y más lo que sientes antes de descifrar qué estás mirando.",
    },
    quote: { text: "The camera sees more than the eye, so why not make use of it?", author: "Edward Weston" },
    coverPhoto: `${BASE_LOCAL}/abstractions/cover.webp`,
    photos: [
      { id: 'abstractions-01', title: 'Energy',           src: `${BASE_LOCAL}/abstractions/01-energy.webp`,           width: 2000, height: 1330 },
      { id: 'abstractions-02', title: 'The Vortex',       src: `${BASE_LOCAL}/abstractions/02-the-vortex.webp`,       width: 2000, height: 1740 },
      { id: 'abstractions-03', title: 'The Rush',         src: `${BASE_LOCAL}/abstractions/03-the-rush.webp`,         width: 2000, height: 1330 },
      { id: 'abstractions-04', title: 'Unfold',           src: `${BASE_LOCAL}/abstractions/04-unfold.webp`,           width: 1333, height: 2000 },
      { id: 'abstractions-05', title: 'Vapor',            src: `${BASE_LOCAL}/abstractions/05-vapor.webp`,            width: 2000, height: 1334 },
      { id: 'abstractions-06', title: 'Faultline',        src: `${BASE_LOCAL}/abstractions/06-faultline.webp`,        width: 2000, height: 1333 },
      { id: 'abstractions-07', title: 'Focus',            src: `${BASE_LOCAL}/abstractions/07-focus.webp`,            width: 2000, height: 1429 },
      { id: 'abstractions-08', title: 'Urban Distortion', src: `${BASE_LOCAL}/abstractions/08-urban-distortion.webp`, width: 2000, height: 2000 },
      { id: 'abstractions-09', title: 'Intervals',        src: `${BASE_LOCAL}/abstractions/09-intervals.webp`,        width: 1330, height: 2000 },
      { id: 'abstractions-10', title: 'Descent',          src: `${BASE_LOCAL}/abstractions/10-descent.webp`,          width: 2000, height: 2000 },
      { id: 'abstractions-11', title: 'Immersion',        src: `${BASE_LOCAL}/abstractions/11-immersion.webp`,        width: 2000, height: 1330 },
      { id: 'abstractions-12', title: 'Undertow',         src: `${BASE_LOCAL}/abstractions/12-undertow.webp`,         width: 2000, height: 2000 },
    ],
  },
  {
    slug: 'in-passing',
    title: 'In Passing',
    year: 2026,
    description: {
      en: "Street life moves fast and most of it disappears. Every now and then something shows up for barely a second, and if the camera is ready, it stays. These are the ones I managed to catch. Some are funny, some are heavy, and a few are both at the same time.",
      es: "La vida en la calle va rápido y casi todo desaparece. De vez en cuando algo se asoma apenas un segundo, y si la cámara está lista, se queda. Estas son las que alcancé a atrapar. Algunas son graciosas, otras pesan, y unas pocas son ambas cosas a la vez.",
    },
    quote: { text: "The eye should learn to listen before it looks.", author: "Robert Frank" },
    coverPhoto: `${BASE_LOCAL}/in-passing/cover.webp`,
    photos: [
      { id: 'in-passing-01', title: 'City Canyon',  src: `${BASE_LOCAL}/in-passing/01-city-canyon.webp`,  width: 1330, height: 2000 },
      { id: 'in-passing-02', title: 'Rhythm',        src: `${BASE_LOCAL}/in-passing/02-rhythm.webp`,        width: 2000, height: 1330 },
      { id: 'in-passing-03', title: 'Cadence',       src: `${BASE_LOCAL}/in-passing/10-cadence.webp`,       width: 1600, height: 1066 },
      { id: 'in-passing-04', title: 'Companions',    src: `${BASE_LOCAL}/in-passing/04-companions.webp`,    width: 2000, height: 1333 },
      { id: 'in-passing-05', title: 'Compartments',  src: `${BASE_LOCAL}/in-passing/05-compartments.webp`,  width: 2000, height: 1500 },
      { id: 'in-passing-06', title: 'Gentle Giant',  src: `${BASE_LOCAL}/in-passing/06-gentle-giant.webp`,  width: 2000, height: 1445 },
      { id: 'in-passing-07', title: 'Downpour',      src: `${BASE_LOCAL}/in-passing/07-downpour.webp`,      width: 1333, height: 2000 },
      { id: 'in-passing-08', title: 'Salutation',    src: `${BASE_LOCAL}/in-passing/08-salutation.webp`,    width: 2000, height: 1333 },
      { id: 'in-passing-09', title: 'Refuge',        src: `${BASE_LOCAL}/in-passing/09-refuge.webp`,        width: 1500, height: 2000 },
      { id: 'in-passing-10', title: 'Confinement',   src: `${BASE_LOCAL}/in-passing/10-confinement.webp`,   width: 2000, height: 1333 },
      { id: 'in-passing-11', title: 'Bearing',       src: `${BASE_LOCAL}/in-passing/11-bearing.webp`,       width: 1333, height: 2000 },
      { id: 'in-passing-12', title: 'Parqueadero',   src: `${BASE_LOCAL}/in-passing/12-parqueadero.webp`,   width: 2000, height: 1333 },
    ],
  },
  {
    slug: 'elsewhere',
    title: 'Elsewhere',
    year: 2026,
    description: {
      en: "These aren't travel photos. They were taken in other places, yes, but that's not the point. The point is that some places stick with you long after you leave, and not always the ones you'd expect. This is my collection of places I couldn't shake off.",
      es: "Estas no son fotos de viaje. Fueron tomadas en otros lugares, sí, pero ese no es el punto. El punto es que algunos lugares se quedan contigo mucho después de irte, y no siempre los que uno esperaría. Esta es mi colección de lugares que no pude quitarme de encima.",
    },
    quote: { text: "Landscape pictures can offer us, I think, three verities: geography, autobiography, and metaphor.", author: "Robert Adams" },
    coverPhoto: `${BASE_LOCAL}/elsewhere/cover.webp`,
    photos: [
      { id: 'elsewhere-01', title: 'Span',        src: `${BASE_LOCAL}/elsewhere/01-span.webp`,        width: 1334, height: 2000 },
      { id: 'elsewhere-02', title: 'Endurance',   src: `${BASE_LOCAL}/elsewhere/02-endurance.webp`,   width: 1333, height: 2000 },
      { id: 'elsewhere-03', title: 'Echoes',      src: `${BASE_LOCAL}/elsewhere/03-echoes.webp`,      width: 1333, height: 2000 },
      { id: 'elsewhere-04', title: 'The Myth',    src: `${BASE_LOCAL}/elsewhere/04-the-myth.webp`,    width: 2000, height: 1333 },
      { id: 'elsewhere-05', title: 'Encircled',   src: `${BASE_LOCAL}/elsewhere/05-encircled.webp`,   width: 1333, height: 2000 },
      { id: 'elsewhere-06', title: 'Capirote',    src: `${BASE_LOCAL}/elsewhere/06-capirote.webp`,    width: 2000, height: 1333 },
      { id: 'elsewhere-07', title: 'Warp',        src: `${BASE_LOCAL}/elsewhere/07-warp.webp`,        width: 2000, height: 1330 },
      { id: 'elsewhere-08', title: 'Weight',      src: `${BASE_LOCAL}/elsewhere/08-weight.webp`,      width: 1333, height: 2000 },
      { id: 'elsewhere-09', title: 'Petition',    src: `${BASE_LOCAL}/elsewhere/09-petition.webp`,    width: 1333, height: 2000 },
      { id: 'elsewhere-10', title: 'Veil',        src: `${BASE_LOCAL}/elsewhere/10-veil.webp`,        width: 1333, height: 2000 },
      { id: 'elsewhere-11', title: 'The Watcher', src: `${BASE_LOCAL}/elsewhere/11-the-watcher.webp`, width: 1330, height: 2000 },
      { id: 'elsewhere-12', title: 'Vigil',       src: `${BASE_LOCAL}/elsewhere/12-vigil.webp`,       width: 1330, height: 2000 },
    ],
  },
  {
    slug: 'organic',
    title: 'Organic',
    year: 2026,
    description: {
      en: "Animals, plants, insects, feathers. Living things have this way of being incredibly delicate and ridiculously strong at the same time. Up close, each one reveals an architecture of its own, an intelligence that doesn't need to explain itself. This section is about looking long enough to see it.",
      es: "Animales, plantas, insectos, plumas. Los seres vivos tienen esa manera de ser increíblemente delicados y ridículamente fuertes al mismo tiempo. De cerca, cada uno revela una arquitectura propia, una inteligencia que no necesita explicarse. Esta sección trata de quedarse mirando el tiempo suficiente para verla.",
    },
    quote: { text: "The mystery isn't in the technique, it's in each of us.", author: "Harry Callahan" },
    coverPhoto: `${BASE_LOCAL}/organic/cover.webp`,
    photos: [
      { id: 'organic-01', title: 'Threshold',      src: `${BASE_LOCAL}/organic/01-threshold.webp`,      width: 2000, height: 2000 },
      { id: 'organic-02', title: 'Ancient Eyes',   src: `${BASE_LOCAL}/organic/02-ancient-eyes.webp`,   width: 2000, height: 1330 },
      { id: 'organic-03', title: 'Armature',       src: `${BASE_LOCAL}/organic/03-armature.webp`,       width: 1334, height: 2000 },
      { id: 'organic-04', title: 'The Map',        src: `${BASE_LOCAL}/organic/04-the-map.webp`,        width: 2000, height: 1333 },
      { id: 'organic-05', title: 'Burden',         src: `${BASE_LOCAL}/organic/05-burden.webp`,         width: 1333, height: 2000 },
      { id: 'organic-06', title: 'The Mantle',     src: `${BASE_LOCAL}/organic/06-the-mantle.webp`,     width: 2000, height: 1330 },
      { id: 'organic-07', title: 'Devotion',       src: `${BASE_LOCAL}/organic/07-devotion.webp`,       width: 1330, height: 2000 },
      { id: 'organic-08', title: 'Cruciform',      src: `${BASE_LOCAL}/organic/08-cruciform.webp`,      width: 2000, height: 2000 },
      { id: 'organic-09', title: 'Armor',          src: `${BASE_LOCAL}/organic/09-armor.webp`,          width: 2000, height: 1330 },
      { id: 'organic-10', title: 'Sentinel',       src: `${BASE_LOCAL}/organic/10-sentinel.webp`,       width: 1333, height: 2000 },
      { id: 'organic-11', title: 'Voluta',         src: `${BASE_LOCAL}/organic/12-voluta.webp`,         width: 1333, height: 2000 },
      { id: 'organic-12', title: 'The Transition', src: `${BASE_LOCAL}/organic/12-the-transition.webp`, width: 2000, height: 1330 },
    ],
  },
  {
    slug: 'close',
    title: 'Close',
    year: 2026,
    description: {
      en: "This is the personal stuff. The camera gets quieter here, closer. These are the people I love, photographed the way I see them: in ordinary light, doing ordinary things, being everything.",
      es: "Esto es lo personal. Aquí la cámara se hace más callada, más cercana. Estas son las personas que amo, fotografiadas como las veo: en luz ordinaria, haciendo cosas ordinarias, siéndolo todo.",
    },
    quote: { text: "A portrait is not made in the camera but on either side of it.", author: "Edward Steichen" },
    coverPhoto: `${BASE_LOCAL}/close/cover.webp`,
    photos: [
      { id: 'close-01', title: 'Curiosity',       src: `${BASE_LOCAL}/close/01-curiosity.webp`,       width: 2000, height: 1333 },
      { id: 'close-02', title: 'Together',         src: `${BASE_LOCAL}/close/02-together.webp`,         width: 1333, height: 2000 },
      { id: 'close-03', title: 'Radiance',         src: `${BASE_LOCAL}/close/03-radiance.webp`,         width: 1333, height: 2000 },
      { id: 'close-04', title: 'Second Face',      src: `${BASE_LOCAL}/close/04-second-face.webp`,      width: 2000, height: 1333 },
      { id: 'close-05', title: 'Shelter',          src: `${BASE_LOCAL}/close/05-shelter.webp`,          width: 2000, height: 1333 },
      { id: 'close-06', title: 'The Spotlight',    src: `${BASE_LOCAL}/close/06-the-spotlight.webp`,    width: 2000, height: 1353 },
      { id: 'close-07', title: 'At the Oven',      src: `${BASE_LOCAL}/close/07-at-the-oven.webp`,      width: 1330, height: 2000 },
      { id: 'close-08', title: 'Double Presence',  src: `${BASE_LOCAL}/close/08-double-presence.webp`,  width: 2000, height: 1333 },
      { id: 'close-09', title: 'Inheritance',      src: `${BASE_LOCAL}/close/09-inheritance.webp`,      width: 1334, height: 2000 },
      { id: 'close-10', title: 'Wonder',           src: `${BASE_LOCAL}/close/10-wonder.webp`,           width: 1333, height: 2000 },
      { id: 'close-11', title: 'Cradle',           src: `${BASE_LOCAL}/close/11-cradle.webp`,           width: 2000, height: 1333 },
      { id: 'close-12', title: 'Witness',          src: `${BASE_LOCAL}/close/12-witness.webp`,          width: 1333, height: 2000 },
    ],
  },
];

// Photos come from the archive (data/generated.ts); metadata + curated order
// stay above. Repo-only photos (not yet in the folders) are preserved.
export const series: Series[] = rawSeries.map(s => ({
  ...s,
  photos: mergePhotos(s.slug, s.photos, 'keep') as Photo[],
}));
