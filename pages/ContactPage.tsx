import { Link } from 'react-router-dom';
import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import SocialLinks from '../components/SocialLinks';

const EMAIL = 'lh.reyes@uniandes.edu.co';

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-brand-dark pt-28 pb-16 px-6 md:px-16 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1">
        <Link to="/" className="u-label text-white/40 hover:text-brand-yellow transition-colors text-[11px]">
          {t('contact.back')}
        </Link>

        <div className="border-t border-white/15 pt-4 mt-6">
          <p className="u-label text-white/40 text-[11px] mb-3">{t('contact.kicker')}</p>
          <h1 className="font-disp font-light uppercase tracking-[0.01em] text-brand-yellow leading-[0.86] text-[clamp(3rem,11vw,8rem)]">
            {t('contact.title')}
          </h1>
          <p className="mt-6 text-brand-cream/70 max-w-xl text-lg leading-relaxed">{t('contact.intro')}</p>
        </div>

        {/* Correo — botón mailto (abre el cliente del visitante, sin servicio) */}
        <div className="mt-12 md:mt-16">
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-baseline gap-4 font-disp font-light uppercase tracking-[0.01em] text-white hover:text-brand-yellow transition-colors duration-300 leading-[0.9] text-[clamp(1.8rem,6vw,4rem)]"
          >
            {t('contact.cta')}
            <span aria-hidden className="text-brand-yellow text-2xl md:text-4xl transition-transform duration-300 group-hover:translate-x-2">→</span>
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="block mt-4 u-label text-white/45 hover:text-brand-yellow transition-colors text-[12px] tracking-[0.18em] break-all"
          >
            {EMAIL}
          </a>
        </div>

        <div className="mt-14 md:mt-20 flex flex-col gap-6">
          <SocialLinks size={26} />
          <p className="u-label text-white/30 text-[11px]">{t('contact.based')}</p>
        </div>
      </div>
      <div className="mt-24"><Footer /></div>
    </main>
  );
}
