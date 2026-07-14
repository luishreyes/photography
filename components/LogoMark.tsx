// Símbolo de marca: la H de Humberto dentro del visor (4 esquinas).
// Amarillo citrón + blanco hueso, fondo transparente. Ver Manual de identidad §02–03.
export default function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g fill="none" stroke="#E8E6E1" strokeWidth="3" strokeLinecap="square">
        <path d="M22 35 V22 H35" />
        <path d="M65 22 H78 V35" />
        <path d="M78 65 V78 H65" />
        <path d="M35 78 H22 V65" />
      </g>
      <g stroke="#C9C41C" strokeWidth="4.5" strokeLinecap="butt">
        <line x1="42" y1="30" x2="42" y2="70" />
        <line x1="58" y1="30" x2="58" y2="70" />
        <line x1="42" y1="48" x2="58" y2="48" />
      </g>
    </svg>
  );
}
