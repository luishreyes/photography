import { useI18n } from '../context/i18n';
import LogoMark from './LogoMark';
import { EMAIL, SOCIAL } from './SocialLinks';
import { Reveal } from './Reveal';

// Bloque de contacto en tinta: es el único tramo oscuro del sitio y cierra
// todas las páginas. El enlace grande se vuelve itálico y toma el acento.
export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer id="contacto" className="bg-ink text-white section-pad">
      <Reveal><p className="eyebrow !text-white/50 mb-[30px]">{t('nav.contact')}</p></Reveal>
      <Reveal delay={1}>
        <h2 className="display text-[clamp(40px,9vw,150px)]">
          {t('contact.kicker')}<br />
          <a href={`mailto:${EMAIL}`} className="transition-all duration-[400ms] ease-out hover:text-accent hover:italic">
            {t('contact.cta')} →
          </a>
        </h2>
      </Reveal>
      <Reveal delay={2} className="flex flex-wrap justify-between gap-6 mt-[clamp(50px,9vh,120px)] pt-[26px] border-t border-white/15">
        <div>
          <div className="eyebrow !text-white/45 !tracking-[0.2em] mb-2.5">{t('contact.email')}</div>
          <a href={`mailto:${EMAIL}`} className="block text-[15px] leading-[1.9] hover:text-accent transition-colors">{EMAIL}</a>
        </div>
        <div>
          <div className="eyebrow !text-white/45 !tracking-[0.2em] mb-2.5">{t('contact.social')}</div>
          {SOCIAL.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="block text-[15px] leading-[1.9] hover:text-accent transition-colors">{s.label}</a>
          ))}
        </div>
        <div>
          <div className="eyebrow !text-white/45 !tracking-[0.2em] mb-2.5">{t('contact.studio')}</div>
          <span className="block text-[15px] leading-[1.9]">Bogotá, Colombia</span>
        </div>
        <div className="hidden lg:block self-end">
          <LogoMark className="w-14 h-auto opacity-90" />
        </div>
      </Reveal>
      <div className="flex flex-wrap justify-between gap-4 mt-[60px] font-mono text-[11px] tracking-[0.06em] text-white/40">
        <span>© {year} Luis H. Reyes · {t('footer.line')}</span>
        <span>{t('footer.rights')}</span>
      </div>
    </footer>
  );
}
