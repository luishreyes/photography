// Después de `vite build` (npm run build lo corre solo): escribe un HTML por página para que cada
// dirección responda 200 con su título, su descripción, sus etiquetas Open Graph y su contenido sin
// ejecutar JavaScript. Sin esto, GitHub Pages respondía 404 a todo menos la portada (la app entraba
// por 404.html) y los buscadores no indexaban nada más. Es el mismo script del portafolio académico
// (luishreyes.github.io), adaptado.
//
//   - Las páginas, sus títulos y sus descripciones salen de paginas.ts (y este, del catálogo).
//   - Abre cada página en Chromium sobre dist/ y guarda lo que ve un visitante nuevo. Ese HTML va
//     escondido en #root (index.html) y React lo reemplaza al arrancar.
//   - Escribe sitemap.xml, robots.txt y una página que redirige por cada dirección de REDIRECCIONES
//     (las /study/... viejas de Instagram).
//   - 404.html queda para las direcciones que no existen.
//
// Si no encuentra Chromium, escribe las páginas con sus metadatos pero sin el contenido, y avisa.
// Busca, en orden: CHROME_PATH, los navegadores de Playwright y Google Chrome instalado.
//
//   node scripts/prerender.mjs
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as servidorVite } from 'vite';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RAIZ, 'dist');
const EN_ACTIONS = !!process.env.GITHUB_ACTIONS;
const avisos = [];
const avisar = (msg) => {
  avisos.push(msg);
  console.warn(`${EN_ACTIONS ? '::warning title=prerender::' : '  aviso: '}${msg}`);
};

// ── Las páginas (paginas.ts, compilado por Vite) ─────────────────────────────
const vite = await servidorVite({
  root: RAIZ,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, entries: [] },
});
let m;
try {
  m = await vite.ssrLoadModule('/paginas.ts');
} finally {
  await vite.close();
}
const paginas = m.paginas();

const cname = readFileSync(path.join(RAIZ, 'public', 'CNAME'), 'utf8').trim();
if (m.SITIO !== `https://${cname}`) avisar(`SITIO en paginas.ts (${m.SITIO}) no coincide con public/CNAME (${cname}).`);

// Cada ruta de App.tsx (menos el comodín) tiene que tener al menos una página o una redirección.
const patron = (r) => new RegExp(`^${r.replace(/:[^/]+/g, '[^/]+')}$`);
const rutasApp = [...readFileSync(path.join(RAIZ, 'App.tsx'), 'utf8').matchAll(/<Route path="([^"*]+)"/g)].map((r) => r[1]);
for (const ruta of rutasApp) {
  const cubierta = [...paginas.map((p) => p.ruta), ...m.REDIRECCIONES.map((r) => r.desde)].some((d) => patron(ruta).test(d));
  if (!cubierta) avisar(`La ruta ${ruta} de App.tsx no tiene página en paginas.ts.`);
}

// ── Servidor de dist/: archivos tal cual y, para lo demás, el index.html original ──
const plantilla = readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (plantilla.includes('og:site_name')) {
  throw new Error('dist/ ya pasó por el prerender: corra npm run build, que arma dist/ de nuevo y lo llama.');
}
if (!plantilla.includes('<div id="root"></div>') || !/<meta name="description"[^>]*>/.test(plantilla) || !/<title>[\s\S]*?<\/title>/.test(plantilla) || !/<html lang="[^"]*">/.test(plantilla)) {
  throw new Error('dist/index.html no tiene la forma que espera el prerender (<html lang>, <title>, <meta name="description">, <div id="root"></div>).');
}
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};
const servidor = createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const archivo = path.join(DIST, ruta);
  if (archivo.startsWith(DIST + path.sep) && existsSync(archivo) && statSync(archivo).isFile()) {
    res.writeHead(200, { 'content-type': TIPOS[path.extname(archivo).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(archivo));
    return;
  }
  res.writeHead(200, { 'content-type': TIPOS['.html'] });
  res.end(plantilla);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${servidor.address().port}`;

// ── Chromium ─────────────────────────────────────────────────────────────────
async function abrirNavegador() {
  let chromium;
  try {
    ({ chromium } = await import('playwright-core'));
  } catch {
    avisar('No está playwright-core (npm install).');
    return null;
  }
  const intentos = [
    ...(process.env.CHROME_PATH ? [{ executablePath: process.env.CHROME_PATH }] : []),
    {},
    { channel: 'chrome' },
  ];
  const fallas = [];
  for (const opciones of intentos) {
    try {
      return await chromium.launch(opciones);
    } catch (e) {
      fallas.push(String(e.message).split('\n')[0]);
    }
  }
  avisar(`No encontré Chromium; las páginas salen sin contenido (${fallas.join(' | ')}).`);
  return null;
}

/** Abre la página como un visitante nuevo, en inglés, y devuelve el contenido de #root ya armado. */
async function capturar(contexto, ruta) {
  const pestana = await contexto.newPage();
  const errores = [];
  pestana.on('pageerror', (e) => errores.push(e.message));
  try {
    await pestana.goto(base + ruta, { waitUntil: 'networkidle', timeout: 45_000 });
    await pestana.waitForFunction(() => (document.getElementById('root')?.children.length ?? 0) > 0, null, { timeout: 15_000 });
    // Recorre la página para que aparezca lo que entra al hacer scroll (whileInView).
    await pestana.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await pestana.waitForTimeout(900);
    return await pestana.evaluate(() => {
      const raiz = document.getElementById('root').cloneNode(true);
      raiz.querySelectorAll('script').forEach((e) => e.remove());
      // Escondido, no descarga nada: lo que se ve lo pide React al arrancar.
      raiz.querySelectorAll('img, iframe').forEach((e) => e.setAttribute('loading', 'lazy'));
      raiz.querySelectorAll('video, audio').forEach((e) => { e.removeAttribute('autoplay'); e.setAttribute('preload', 'none'); });
      // Sin JavaScript, nada se queda transparente esperando su animación.
      raiz.querySelectorAll('[style]').forEach((e) => { if (e.style.opacity === '0') e.style.removeProperty('opacity'); });
      const h1 = raiz.querySelector('h1')?.textContent?.trim() ?? '';
      return { html: raiz.innerHTML, h1, ruta: location.pathname };
    }).then((r) => ({ ...r, errores }));
  } finally {
    await pestana.close();
  }
}

const capturas = new Map();
const navegador = await abrirNavegador();
if (navegador) {
  const contexto = await navegador.newContext({ locale: 'en-US', reducedMotion: 'reduce', viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  // Solo dist/: nada de afuera.
  await contexto.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const cola = paginas.map((p) => p.ruta);
  const trabajador = async () => {
    for (let ruta = cola.shift(); ruta; ruta = cola.shift()) {
      try {
        const c = await capturar(contexto, ruta);
        if (c.ruta !== ruta) avisar(`${ruta} terminó en ${c.ruta}.`);
        if (c.errores.length) avisar(`${ruta}: ${c.errores[0]}`);
        if (!c.h1) avisar(`${ruta} no tiene <h1>.`);
        if (/Page not found|That (collection|study|volume) is not here/.test(c.html)) avisar(`${ruta} muestra «no encontrado».`);
        capturas.set(ruta, c);
      } catch (e) {
        avisar(`${ruta}: ${String(e.message).split('\n')[0]}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, trabajador));
  await navegador.close();
}
servidor.close();

// ── Los HTML ─────────────────────────────────────────────────────────────────
const escapar = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Corta en una frase completa antes de `max` caracteres; si no hay, en una palabra. */
function recortar(texto, max = 300) {
  const t = texto.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const punto = corte.lastIndexOf('. ');
  return punto > max / 3 ? corte.slice(0, punto + 1) : `${corte.slice(0, corte.lastIndexOf(' '))}…`;
}

// El HTML va en inglés, el idioma por defecto del sitio; quien tiene el navegador en español lo
// ve en español en cuanto arranca React.
function documento(p, captura) {
  const lang = 'en';
  const titulo = m.tituloDe(p, lang);
  const descripcion = recortar(p.descripcion[lang]);
  const url = m.canonica(p.ruta);
  const imagen = m.SITIO + p.imagen;
  const cabeza = [
    `<title>${escapar(titulo)}</title>`,
    `<meta name="description" content="${escapar(descripcion)}" />`,
    `<link rel="canonical" href="${escapar(url)}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Luis H. Reyes · Photography" />',
    '<meta property="og:locale" content="en_US" />',
    `<meta property="og:title" content="${escapar(titulo)}" />`,
    `<meta property="og:description" content="${escapar(descripcion)}" />`,
    `<meta property="og:url" content="${escapar(url)}" />`,
    `<meta property="og:image" content="${escapar(imagen)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ].join('\n    ');
  const cuerpo = captura ? `<div data-previo>${captura.html}</div>` : '';
  // Funciones de reemplazo: el contenido puede traer «$&» o «$1» y no son patrones.
  return plantilla
    .replace(/<html lang="[^"]*">/, () => `<html lang="${lang}">`)
    .replace(/\s*<meta name="description"[^>]*>/, '')
    .replace(/<title>[\s\S]*?<\/title>/, () => cabeza)
    .replace('<div id="root"></div>', () => `<div id="root">${cuerpo}</div>`);
}

function redireccion({ desde, hacia }) {
  const destino = escapar(hacia);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapar(m.tituloDe(m.paginaDe(hacia), 'en'))}</title>
    <link rel="canonical" href="${escapar(m.SITIO + hacia)}" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${destino}" />
    <script>location.replace(${JSON.stringify(hacia)} + location.search + location.hash);</script>
  </head>
  <body><a href="${destino}">${escapar(m.SITIO + hacia)}</a></body>
</html>
`;
}

// Lo que ya está en dist/ salió de public/: no se pisa.
const escritos = new Set();
function escribir(relativo, contenido, desde) {
  const archivo = path.join(DIST, relativo);
  if (relativo !== 'index.html' && existsSync(archivo) && !escritos.has(archivo)) {
    avisar(`${desde}: ya existe dist/${relativo} (viene de public/); no lo reemplacé.`);
    return;
  }
  mkdirSync(path.dirname(archivo), { recursive: true });
  writeFileSync(archivo, contenido);
  escritos.add(archivo);
}

const destinos = (ruta) => (ruta === '/' ? ['index.html'] : [`${ruta.slice(1)}.html`, ...(m.tieneHijas(ruta) ? [`${ruta.slice(1)}/index.html`] : [])]);

for (const p of paginas) {
  const html = documento(p, capturas.get(p.ruta));
  for (const d of destinos(p.ruta)) escribir(d, html, p.ruta);
}
for (const r of m.REDIRECCIONES) for (const d of destinos(r.desde)) escribir(d, redireccion(r), r.desde);

// Una página sin hijas cuyo nombre coincide con una carpeta de public/: también responde con barra final.
for (const p of paginas) {
  if (p.ruta === '/' || m.tieneHijas(p.ruta)) continue;
  const carpeta = path.join(DIST, p.ruta.slice(1));
  if (existsSync(carpeta) && statSync(carpeta).isDirectory()) {
    escribir(`${p.ruta.slice(1)}/index.html`, documento(p, capturas.get(p.ruta)), p.ruta);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map((p) => `  <url><loc>${escapar(m.canonica(p.ruta))}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);
writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${m.SITIO}/sitemap.xml\n`);

console.log(
  `prerender: ${paginas.length} páginas (${capturas.size} con contenido, todas en el sitemap), ` +
    `${m.REDIRECCIONES.length} redirecciones, ${avisos.length} avisos.`,
);
