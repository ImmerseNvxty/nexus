'use client'
// src/components/island/IslandSVG.tsx
interface IslandSVGProps {
  level?: number
  width?: number
}

export function IslandSVG({ level = 1, width = 600 }: IslandSVGProps) {
  // Unlock features by level
  const hasLighthouse  = level >= 3
  const hasCafe        = level >= 5
  const hasObservatory = level >= 8
  const hasLibrary     = level >= 10
  const hasGarden      = level >= 6
  const extraTrees     = Math.min(Math.floor(level / 2), 6)

  return (
    <svg viewBox="0 0 600 230" width={width} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="rgba(91,196,245,0.18)"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <radialGradient id="gg" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#2d6a4f"/>
          <stop offset="100%" stopColor="#1b4332"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Glow beneath */}
      <ellipse cx="300" cy="205" rx="230" ry="28" fill="url(#ig)"/>

      {/* Island rock base */}
      <ellipse cx="300" cy="195" rx="205" ry="36" fill="#141e14"/>
      <ellipse cx="300" cy="185" rx="196" ry="30" fill="#0f180f"/>

      {/* Island grass top */}
      <ellipse cx="300" cy="163" rx="190" ry="48" fill="url(#gg)"/>
      <ellipse cx="300" cy="156" rx="180" ry="38" fill="#2d6a4f"/>
      <ellipse cx="300" cy="150" rx="165" ry="30" fill="#3d8c62" opacity="0.55"/>

      {/* ── Main study tower ── */}
      <rect x="258" y="92" width="84" height="68" rx="4" fill="#1a3a5c"/>
      <rect x="254" y="86" width="92" height="12" rx="3" fill="#2a5a8c"/>
      <rect x="250" y="81" width="100" height="8" rx="3" fill="#3a7abf"/>
      {/* Windows */}
      <rect x="268" y="102" width="15" height="18" rx="2" fill="#f5c842" opacity="0.92" filter="url(#glow)"/>
      <rect x="317" y="102" width="15" height="18" rx="2" fill="#f5c842" opacity="0.65"/>
      <rect x="268" y="128" width="15" height="15" rx="2" fill="#5bc4f5" opacity="0.75"/>
      <rect x="317" y="128" width="15" height="15" rx="2" fill="#5bc4f5" opacity="0.5"/>
      {/* Door */}
      <rect x="288" y="133" width="24" height="27" rx="3" fill="#071828"/>
      {/* Roof */}
      <polygon points="250,81 350,81 300,52" fill="#4a8cbf"/>
      <polygon points="250,81 300,52 300,81" fill="#3a7abf"/>
      {/* Roof glow */}
      <circle cx="300" cy="50" r="4" fill="#f5c842" opacity="0.8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>

      {/* ── Lighthouse (level 3+) ── */}
      {hasLighthouse && (
        <>
          <rect x="158" y="130" width="14" height="40" rx="2" fill="#2a4a6a"/>
          <rect x="155" y="125" width="20" height="10" rx="2" fill="#3a6a9a"/>
          <circle cx="165" cy="122" r="7" fill="#f5c842" opacity="0.9" filter="url(#glow)">
            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <ellipse cx="165" cy="126" rx="12" ry="4" fill="rgba(245,200,66,0.18)"/>
        </>
      )}

      {/* ── Café (level 5+) ── */}
      {hasCafe && (
        <>
          <rect x="400" y="140" width="46" height="32" rx="3" fill="#2d1a0a"/>
          <rect x="397" y="135" width="52" height="8" rx="2" fill="#6b3a1a"/>
          <rect x="408" y="148" width="10" height="12" rx="1" fill="#f5c842" opacity="0.7"/>
          <rect x="427" y="148" width="10" height="12" rx="1" fill="#f5c842" opacity="0.5"/>
          <text x="423" y="133" fontSize="8" fill="#f5c842" opacity="0.8" textAnchor="middle" fontFamily="sans-serif">☕</text>
        </>
      )}

      {/* ── Observatory (level 8+) ── */}
      {hasObservatory && (
        <>
          <rect x="192" y="145" width="36" height="24" rx="2" fill="#1a2a4a"/>
          <ellipse cx="210" cy="145" rx="18" ry="10" fill="#2a3a6a"/>
          <rect x="207" y="128" width="6" height="18" rx="1" fill="#3a5a8a" transform="rotate(-30 210 145)"/>
          <circle cx="210" cy="142" r="4" fill="#5bc4f5" opacity="0.6">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite"/>
          </circle>
        </>
      )}

      {/* ── Library (level 10+) ── */}
      {hasLibrary && (
        <>
          <rect x="375" y="133" width="20" height="35" rx="2" fill="#2a1a3a"/>
          <rect x="373" y="128" width="24" height="8" rx="2" fill="#3a2a5a"/>
          <rect x="378" y="140" width="6" height="8" rx="1" fill="#c084fc" opacity="0.7"/>
          <rect x="386" y="140" width="6" height="8" rx="1" fill="#c084fc" opacity="0.5"/>
        </>
      )}

      {/* ── Trees (scales with level) ── */}
      {/* Base trees always present */}
      <rect x="118" y="148" width="6" height="22" rx="2" fill="#5c3317"/>
      <circle cx="121" cy="138" r="19" fill="#2a7a48"/>
      <circle cx="121" cy="133" r="14" fill="#3aaa60"/>

      <rect x="453" y="148" width="6" height="20" rx="2" fill="#5c3317"/>
      <circle cx="456" cy="140" r="17" fill="#2a7a48"/>
      <circle cx="456" cy="135" r="12" fill="#3aaa60"/>

      {/* Extra trees by level */}
      {extraTrees >= 1 && <>
        <rect x="142" y="152" width="5" height="16" rx="2" fill="#5c3317"/>
        <circle cx="144" cy="145" r="13" fill="#2d8a50"/>
        <circle cx="144" cy="141" r="9" fill="#3aaa60"/>
      </>}
      {extraTrees >= 2 && <>
        <rect x="430" y="152" width="5" height="16" rx="2" fill="#5c3317"/>
        <circle cx="432" cy="145" r="13" fill="#2d8a50"/>
      </>}
      {extraTrees >= 3 && <>
        <circle cx="238" cy="157" r="9" fill="#2d6a4f"/>
        <circle cx="234" cy="154" r="7" fill="#3d8c62"/>
      </>}
      {extraTrees >= 4 && <>
        <circle cx="362" cy="157" r="9" fill="#2d6a4f"/>
        <circle cx="366" cy="154" r="7" fill="#3d8c62"/>
      </>}

      {/* ── Lamp posts ── */}
      <rect x="221" y="132" width="3" height="30" fill="#4a6a8a"/>
      <circle cx="222" cy="130" r="5" fill="#f5e642" opacity="0.9" filter="url(#glow)"/>
      <ellipse cx="222" cy="132" rx="8" ry="3" fill="rgba(245,230,66,0.15)"/>

      <rect x="374" y="134" width="3" height="28" fill="#4a6a8a"/>
      <circle cx="375" cy="132" r="5" fill="#f5e642" opacity="0.9" filter="url(#glow)"/>
      <ellipse cx="375" cy="134" rx="8" ry="3" fill="rgba(245,230,66,0.15)"/>

      {/* ── Flowers ── */}
      <circle cx="248" cy="157" r="3" fill="#f5a0c0"/>
      <circle cx="256" cy="160" r="2.5" fill="#c084fc"/>
      <circle cx="243" cy="162" r="2" fill="#f5c842"/>
      <circle cx="345" cy="160" r="3" fill="#f5a0c0"/>
      <circle cx="353" cy="157" r="2.5" fill="#5bc4f5"/>
      <circle cx="358" cy="162" r="2" fill="#f5c842"/>

      {/* ── Dock ── */}
      <rect x="270" y="183" width="60" height="6" rx="2" fill="#3a2a18"/>
      <rect x="280" y="183" width="4" height="16" rx="1" fill="#4a3a28"/>
      <rect x="316" y="183" width="4" height="16" rx="1" fill="#4a3a28"/>

      {/* ── Garden (level 6+) ── */}
      {hasGarden && (
        <g>
          <rect x="330" y="155" width="28" height="16" rx="3" fill="#1a3a1a" opacity="0.8"/>
          <circle cx="336" cy="155" r="4" fill="#e83a6f" opacity="0.9"/>
          <circle cx="344" cy="153" r="4" fill="#f5c842" opacity="0.9"/>
          <circle cx="352" cy="155" r="4" fill="#c084fc" opacity="0.9"/>
        </g>
      )}

      {/* ── Floating XP orbs (always) ── */}
      <circle cx="312" cy="68" r="5" fill="#5bc4f5" opacity="0.75">
        <animate attributeName="cy" values="68;62;68" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.75;1;0.75" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="292" cy="73" r="3" fill="#c084fc" opacity="0.55">
        <animate attributeName="cy" values="73;67;73" dur="3.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="330" cy="70" r="3" fill="#f5c842" opacity="0.55">
        <animate attributeName="cy" values="70;64;70" dur="2.8s" repeatCount="indefinite"/>
      </circle>
    </svg>
  )
}
