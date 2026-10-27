import React from 'react';

export function SpookyDecorations() {
  return (
    <>
      {/* Fondo oscuro con animaciones abstractas blureadas */}
      <div className="spooky-bg-canvas" aria-hidden="true">
        <div className="blur-orb orb-orange" />
        <div className="blur-orb orb-purple" />
        <div className="blur-orb orb-crimson" />
        <div className="blur-orb orb-spectral" />
        <div className="blur-orb orb-center-fog" />
        <div className="vignette-overlay" />
      </div>

      {/* Figuras alusivas a Halloween en los costados */}
      <div className="spooky-side-figures" aria-hidden="true">
        {/* Telaraña superior izquierda */}
        <svg className="cobweb cobweb-left" viewBox="0 0 200 200" fill="none">
          <path
            d="M0 0 L200 0 M0 0 L185 75 M0 0 L140 140 M0 0 L75 185 M0 0 L0 200"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M40 0 Q38 18 35 15 Q30 30 28 28 Q18 36 15 35 Q8 39 0 40"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M85 0 Q80 35 78 32 Q65 62 60 60 Q36 78 32 78 Q16 82 0 85"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M135 0 Q125 55 124 52 Q100 100 95 95 Q58 122 52 124 Q25 130 0 135"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M185 0 Q172 72 170 70 Q135 135 130 130 Q80 165 70 170 Q35 178 0 185"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>

        {/* Telaraña superior derecha */}
        <svg className="cobweb cobweb-right" viewBox="0 0 200 200" fill="none">
          <path
            d="M0 0 L200 0 M0 0 L185 75 M0 0 L140 140 M0 0 L75 185 M0 0 L0 200"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M40 0 Q38 18 35 15 Q30 30 28 28 Q18 36 15 35 Q8 39 0 40"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M85 0 Q80 35 78 32 Q65 62 60 60 Q36 78 32 78 Q16 82 0 85"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M135 0 Q125 55 124 52 Q100 100 95 95 Q58 122 52 124 Q25 130 0 135"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M185 0 Q172 72 170 70 Q135 135 130 130 Q80 165 70 170 Q35 178 0 185"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>

        {/* Araña colgante izquierda */}
        <div className="hanging-spider spider-left">
          <div className="spider-thread" />
          <svg className="spider-svg" viewBox="0 0 64 64" fill="currentColor">
            <circle cx="32" cy="34" r="10" />
            <circle cx="32" cy="21" r="6" />
            <circle cx="29.5" cy="19" r="1.5" fill="#ff3b30" />
            <circle cx="34.5" cy="19" r="1.5" fill="#ff3b30" />
            <path
              d="M24 28 Q10 18 6 26 M22 33 Q8 28 4 38 M23 38 Q10 38 8 48 M25 42 Q14 46 14 56"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M40 28 Q54 18 58 26 M42 33 Q56 28 60 38 M41 38 Q54 38 56 48 M39 42 Q50 46 50 56"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Araña colgante derecha */}
        <div className="hanging-spider spider-right">
          <div className="spider-thread" />
          <svg className="spider-svg" viewBox="0 0 64 64" fill="currentColor">
            <circle cx="32" cy="34" r="10" />
            <circle cx="32" cy="21" r="6" />
            <circle cx="29.5" cy="19" r="1.5" fill="#ff9500" />
            <circle cx="34.5" cy="19" r="1.5" fill="#ff9500" />
            <path
              d="M24 28 Q10 18 6 26 M22 33 Q8 28 4 38 M23 38 Q10 38 8 48 M25 42 Q14 46 14 56"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M40 28 Q54 18 58 26 M42 33 Q56 28 60 38 M41 38 Q54 38 56 48 M39 42 Q50 46 50 56"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Columna izquierda de figuras tenebrosas */}
        <div className="side-column side-left">
          {/* Murciélago flotante */}
          <svg className="side-figure bat-figure bat-1" viewBox="0 0 120 60" fill="currentColor">
            <path d="M60 22 C55 12, 48 16, 48 22 C32 6, 12 10, 2 28 C16 26, 24 34, 28 42 C38 34, 46 38, 52 46 L60 52 L68 46 C74 38, 82 34, 92 42 C96 34, 104 26, 118 28 C108 10, 88 6, 72 22 C72 16, 65 12, 60 22 Z" />
            <circle cx="56" cy="24" r="1.8" fill="#ff6b00" />
            <circle cx="64" cy="24" r="1.8" fill="#ff6b00" />
          </svg>

          {/* Fantasma espectral izquierdo */}
          <svg className="side-figure ghost-figure" viewBox="0 0 100 130" fill="none">
            <path
              d="M50 10 C25 10, 15 32, 15 58 L15 112 C22 104, 29 116, 36 110 C43 104, 48 118, 55 110 C62 102, 69 116, 76 108 C81 104, 85 114, 85 108 L85 58 C85 32, 75 10, 50 10 Z"
              fill="url(#ghostGradLeft)"
              stroke="rgba(196, 181, 253, 0.35)"
              strokeWidth="1.5"
            />
            <ellipse cx="38" cy="46" rx="5" ry="7" fill="#090514" />
            <ellipse cx="62" cy="46" rx="5" ry="7" fill="#090514" />
            <ellipse cx="50" cy="64" rx="6" ry="9" fill="#090514" />
            <defs>
              <linearGradient id="ghostGradLeft" x1="50" y1="10" x2="50" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(216, 180, 254, 0.28)" />
                <stop offset="100%" stopColor="rgba(109, 40, 217, 0.03)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Árbol embrujado y calabaza izquierda */}
          <svg className="side-figure pumpkin-figure" viewBox="0 0 120 120" fill="none">
            <path
              d="M56 26 C56 14, 65 8, 70 12 C66 18, 64 22, 65 26 Z"
              fill="#4d7c0f"
            />
            <ellipse cx="38" cy="68" rx="24" ry="34" fill="#c2410c" />
            <ellipse cx="82" cy="68" rx="24" ry="34" fill="#c2410c" />
            <ellipse cx="48" cy="68" rx="24" ry="37" fill="#ea580c" />
            <ellipse cx="72" cy="68" rx="24" ry="37" fill="#ea580c" />
            <ellipse cx="60" cy="68" rx="22" ry="39" fill="#f97316" />
            {/* Ojos y boca iluminados */}
            <polygon points="44,48 34,62 52,62" fill="#fef08a" />
            <polygon points="76,48 68,62 86,62" fill="#fef08a" />
            <polygon points="60,58 55,67 65,67" fill="#fef08a" />
            <path
              d="M34 76 L44 84 L50 77 L60 86 L70 77 L76 84 L86 76 L78 92 L66 86 L60 93 L54 86 L42 92 Z"
              fill="#fef08a"
            />
          </svg>
        </div>

        {/* Columna derecha de figuras tenebrosas */}
        <div className="side-column side-right">
          {/* Bruja / Sombrero embrujado y murciélago */}
          <svg className="side-figure bat-figure bat-2" viewBox="0 0 120 60" fill="currentColor">
            <path d="M60 22 C55 12, 48 16, 48 22 C32 6, 12 10, 2 28 C16 26, 24 34, 28 42 C38 34, 46 38, 52 46 L60 52 L68 46 C74 38, 82 34, 92 42 C96 34, 104 26, 118 28 C108 10, 88 6, 72 22 C72 16, 65 12, 60 22 Z" />
            <circle cx="56" cy="24" r="1.8" fill="#ef4444" />
            <circle cx="64" cy="24" r="1.8" fill="#ef4444" />
          </svg>

          {/* Calavera tenebrosa derecha */}
          <svg className="side-figure skull-figure" viewBox="0 0 100 120" fill="none">
            <path
              d="M50 12 C24 12, 14 32, 14 54 C14 70, 22 80, 32 86 L32 102 C32 106, 36 108, 40 108 L60 108 C64 108, 68 106, 68 102 L68 86 C78 80, 86 70, 86 54 C86 32, 76 12, 50 12 Z"
              fill="rgba(226, 232, 240, 0.16)"
              stroke="rgba(249, 115, 22, 0.35)"
              strokeWidth="1.5"
            />
            <circle cx="36" cy="54" r="10" fill="#090514" />
            <circle cx="64" cy="54" r="10" fill="#090514" />
            <circle cx="36" cy="54" r="3" fill="#ef4444" />
            <circle cx="64" cy="54" r="3" fill="#ef4444" />
            <polygon points="50,64 45,76 55,76" fill="#090514" />
            <line x1="40" y1="92" x2="40" y2="106" stroke="#090514" strokeWidth="3" />
            <line x1="50" y1="92" x2="50" y2="106" stroke="#090514" strokeWidth="3" />
            <line x1="60" y1="92" x2="60" y2="106" stroke="#090514" strokeWidth="3" />
          </svg>

          {/* Lápida y calabaza derecha */}
          <svg className="side-figure tombstone-figure" viewBox="0 0 110 130" fill="none">
            <path
              d="M20 120 L20 52 C20 24, 36 12, 55 12 C74 12, 90 24, 90 52 L90 120 Z"
              fill="rgba(51, 65, 85, 0.45)"
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="2"
            />
            <path d="M55 26 L55 52 M43 36 L67 36" stroke="rgba(249, 115, 22, 0.5)" strokeWidth="3" strokeLinecap="round" />
            <text x="55" y="76" textAnchor="middle" fill="rgba(226,232,240,0.45)" fontSize="16" fontFamily="serif" fontWeight="bold">
              R.I.P
            </text>
            <path d="M10 120 L100 120" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </>
  );
}
