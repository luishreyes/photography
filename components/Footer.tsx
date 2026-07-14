import { useI18n } from '../context/i18n';

export default function Footer() {
  const { lang } = useI18n();
  return (
    <footer className="border-t border-white/15 px-6 md:px-16 pt-[clamp(60px,9vh,120px)]">
      <div className="max-w-7xl mx-auto">
        <div className="font-disp font-light uppercase tracking-[0.01em] leading-[0.8] text-brand-yellow text-[clamp(3.4rem,16vw,12rem)] mb-[clamp(28px,5vh,56px)]">
          Luis H. Reyes
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:items-end">
          <p className="font-medium text-brand-cream text-[clamp(1.2rem,2.6vw,1.9rem)] leading-[1.28] max-w-[22ch]">
            {lang === 'es'
              ? 'Ver con mi propio ojo un mundo que ya tiene demasiados ojos encima.'
              : 'Seeing with my own eye a world that already has too many eyes on it.'}
          </p>
          <div className="u-label text-white/45 text-[11px] leading-[2.3] md:text-right">
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="block hover:text-brand-yellow transition-colors">Instagram</a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="block hover:text-brand-yellow transition-colors">LinkedIn</a>
            <a href="mailto:lh.reyes@uniandes.edu.co" className="block hover:text-brand-yellow transition-colors">Email</a>
          </div>
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
