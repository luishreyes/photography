import { useI18n } from '../context/i18n';
import Footer from '../components/Footer';
import SocialLinks from '../components/SocialLinks';
import { Reveal } from '../components/Reveal';

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-paper flex flex-col">
      <div className="pad-x pt-[16vh] pb-[clamp(60px,9vh,120px)] flex-1">
        <Reveal>
          <p className="eyebrow mb-5">{t('contact.kicker')}</p>
          <h1 className="display text-[clamp(54px,9vw,150px)]">{t('contact.title')}</h1>
        </Reveal>
        <Reveal delay={2} className="mt-8 max-w-[54ch]">
          <p className="text-ink-soft text-[clamp(15px,1.15vw,18px)] leading-[1.7]">{t('contact.intro')}</p>
          <p className="eyebrow mt-8">{t('contact.based')}</p>
          <SocialLinks size={22} className="mt-6 text-ink" />
        </Reveal>
      </div>
      <Footer />
    </main>
  );
}
