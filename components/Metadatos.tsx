import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../context/i18n';
import { canonica, paginaDe, tituloDe } from '../paginas';

/**
 * Título de la pestaña y dirección canónica de la página en pantalla. El HTML
 * de cada página ya los trae (scripts/prerender.mjs); esto los mantiene al
 * navegar dentro de la app y al cambiar de idioma. La descripción y las
 * etiquetas Open Graph se quedan como las sirvió el HTML: solo las leen los
 * buscadores y las vistas previas de enlaces, que no navegan.
 */
export default function Metadatos() {
  const { pathname } = useLocation();
  const { lang } = useI18n();

  useEffect(() => {
    const pagina = paginaDe(pathname);
    document.title = tituloDe(pagina, lang);

    // Safari comparte la dirección canónica: tiene que ser la de la página en pantalla.
    let enlace = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!pagina) {
      enlace?.remove();
      return;
    }
    if (!enlace) {
      enlace = document.createElement('link');
      enlace.rel = 'canonical';
      document.head.appendChild(enlace);
    }
    enlace.href = canonica(pagina.ruta);
  }, [pathname, lang]);

  return null;
}
