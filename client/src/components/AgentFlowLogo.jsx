const AgentFlowLogo = ({ size = 28, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        {/* Right Facet: Pure Brilliant White to Platinum Silver */}
        <linearGradient
          id="af-facet-light"
          x1="16.6"
          y1="4"
          x2="27"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#F1F5F9" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Left Facet: Polished Titanium Slate / Graphite */}
        <linearGradient
          id="af-facet-dark"
          x1="15.4"
          y1="4"
          x2="5"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#94A3B8" />
          <stop offset="0.5" stopColor="#64748B" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>

        {/* Subtle ambient Cherry Red & Dark drop shadow */}
        <filter
          id="af-sharp-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="2.5"
            floodColor="#C8102E"
            floodOpacity="0.35"
          />
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="4"
            floodColor="#000000"
            floodOpacity="0.7"
          />
        </filter>
      </defs>

      <g filter="url(#af-sharp-shadow)">
        {/* Left Titanium Facet */}
        <path d="M15.4 4.5L5 27L15.4 20.2V4.5Z" fill="url(#af-facet-dark)" />

        {/* Right Brilliant White Facet */}
        <path d="M16.6 4.5V20.2L27 27L16.6 4.5Z" fill="url(#af-facet-light)" />
      </g>
    </svg>
  );
};

export default AgentFlowLogo;
