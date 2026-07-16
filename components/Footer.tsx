import { useI18n } from '../context/i18n';
import LogoMark from './LogoMark';
import SocialLinks from './SocialLinks';

export default function Footer() {
  const { lang } = useI18n();
  return (
    <footer className="border-t border-white/15 px-6 md:px-16 pt-[clamp(60px,9vh,120px)]">
      <div className="max-w-7xl mx-auto">
        {/* Logo lockup — símbolo visor-H + nombre + etiqueta (Manual §02) */}
        <div className="mb-[clamp(32px,6vh,64px)]">
          <LogoMark className="w-[clamp(56px,7vw,84px)] h-auto mb-5" />
          <div className="font-disp font-light uppercase tracking-[0.02em] leading-[0.86] text-brand-yellow text-[clamp(2.6rem,9vw,6rem)]">
            Luis H. Reyes
          </div>
          <div className="u-label text-brand-cream/85 text-[11px] md:text-[13px] mt-2.5">
            {lang === 'es' ? 'Fotografía' : 'Photography'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:items-end">
          <p className="font-medium text-brand-cream text-[clamp(1.2rem,2.6vw,1.9rem)] leading-[1.28] max-w-[22ch]">
            {lang === 'es'
              ? 'Ver con mi propio ojo un mundo que ya tiene demasiados ojos encima.'
              : 'Seeing with my own eye a world that already has too many eyes on it.'}
          </p>
          <SocialLinks size={24} className="md:justify-end" />
        </div>
        <div className="u-label text-white/25 text-[10px] text-center mt-[clamp(40px,7vh,90px)] py-10 border-t border-white/5">
          {lang === 'es'
            ? 'Luis H. Reyes · Fotografía en blanco y negro · Bogotá'
            : 'Luis H. Reyes · Black & white photography · Bogotá'}
        </div>
      </div>
    </footer>
  );
}
