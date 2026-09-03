export function GlassDefs() {
  return (
    <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
      <filter id="glass-refract" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves="2" seed="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
