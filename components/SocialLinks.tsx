// Redes sociales + correo, como iconos monoline (currentColor, sin librería).
// URLs reales de Luis. Reutilizado en Footer y ContactPage.

const IG = 'https://www.instagram.com/luish_photography/';
const LI = 'https://www.linkedin.com/in/luishreyes/';
const MAIL = 'mailto:luishreyesbarrios@gmail.com';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function InstagramIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...S} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...S} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10.5V17" />
      <circle cx="7" cy="6.9" r="0.6" fill="currentColor" stroke="none" />
      <path d="M11 17v-3.4a2.5 2.5 0 0 1 5 0V17" />
      <path d="M11 10.5V17" />
    </svg>
  );
}

function MailIcon({ s }: { s: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" {...S} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

const LINKS = [
  { label: 'Instagram', href: IG, Icon: InstagramIcon },
  { label: 'LinkedIn', href: LI, Icon: LinkedInIcon },
  { label: 'Email', href: MAIL, Icon: MailIcon },
];

export default function SocialLinks({ size = 22, gap = 'gap-6', className = '' }: { size?: number; gap?: string; className?: string }) {
  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {LINKS.map(({ label, href, Icon }) => {
        const external = !href.startsWith('mailto:');
        return (
          <a
            key={label}
            href={href}
            aria-label={label}
            title={label}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-white/50 hover:text-brand-yellow transition-colors duration-300"
          >
            <Icon s={size} />
          </a>
        );
      })}
    </div>
  );
}
