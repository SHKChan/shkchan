# 🎮 PLAYER CARD: SHK CHAN 🎮

<div align="center">

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 480" width="100%" style="background:#0d1117; border-radius:12px; font-family:'Courier New', monospace; box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
  <defs>
    <linearGradient id="hpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff4757"/>
      <stop offset="100%" stop-color="#ff6b81"/>
    </linearGradient>
    <linearGradient id="mpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e90ff"/>
      <stop offset="100%" stop-color="#70a1ff"/>
    </linearGradient>
    <linearGradient id="expGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#eccc68"/>
      <stop offset="100%" stop-color="#ffa502"/>
    </linearGradient>

    <style>
      .retro-title { font-size: 14px; fill: #f7d51d; font-weight: bold; letter-spacing: 1px; }
      .label-text { font-size: 13px; fill: #f7d51d; font-weight: bold; }
      .value-text { font-size: 13px; fill: #ffffff; font-weight: bold; }
      .stat-name { font-size: 13px; fill: #70a1ff; font-weight: bold; }
      .stat-val { font-size: 14px; fill: #2ed573; font-weight: bold; }
      .bar-label { font-size: 11px; fill: #ffffff; font-weight: bold; }
      
      @keyframes floatArcher {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
        100% { transform: translateY(0px); }
      }
      @keyframes bowPulse {
        0% { transform: rotate(0deg); }
        50% { transform: rotate(-3deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes arrowGlow {
        0% { opacity: 0.4; }
        50% { opacity: 1; }
        100% { opacity: 0.4; }
      }
      .archer-group { animation: floatArcher 2.5s ease-in-out infinite; }
      .bow-group { animation: bowPulse 2.5s ease-in-out infinite; transform-origin: 195px 150px; }
      .arrow-tip { animation: arrowGlow 1.2s ease-in-out infinite; }
    </style>
  </defs>

  <!-- Outer Card Frame -->
  <rect x="15" y="15" width="820" height="450" rx="10" fill="#161b22" stroke="#f7d51d" stroke-width="3"/>
  
  <!-- Header Banner -->
  <rect x="15" y="15" width="820" height="36" rx="10" fill="#f7d51d"/>
  <rect x="15" y="41" width="820" height="10" fill="#f7d51d"/>
  <text x="35" y="38" font-size="15" fill="#0d1117" font-weight="bold">★ CHARACTER INFO - ARCHER / MASTER RANGER</text>
  <text x="805" y="38" font-size="15" fill="#0d1117" font-weight="bold">✕</text>

  <!-- Left Pixel Character Stage -->
  <rect x="35" y="70" width="280" height="340" rx="6" fill="#0d1117" stroke="#30363d" stroke-width="2"/>
  <path d="M 35 340 L 315 340 L 315 410 L 35 410 Z" fill="#2ed573" opacity="0.15"/>
  <line x1="35" y1="340" x2="315" y2="340" stroke="#2ed573" stroke-width="2"/>

  <!-- Clouds Background -->
  <path d="M 60 110 Q 75 95 90 110 Q 105 110 110 120 L 50 120 Z" fill="#ffffff" opacity="0.15"/>
  <path d="M 220 130 Q 235 115 250 130 Q 265 130 270 140 L 210 140 Z" fill="#ffffff" opacity="0.12"/>

  <!-- Pixel Archer Sprite (Animated SVG) -->
  <g class="archer-group">
    <!-- Shadow -->
    <ellipse cx="175" cy="342" rx="45" ry="8" fill="#000000" opacity="0.5"/>

    <!-- Green Feather Cap -->
    <rect x="145" y="125" width="60" height="15" fill="#2ed573"/>
    <rect x="150" y="115" width="50" height="10" fill="#26af5f"/>
    <rect x="140" y="135" width="75" height="8" fill="#1e824c"/>
    <!-- Red Feather -->
    <path d="M 195 105 L 205 125 L 195 125 Z" fill="#ff4757"/>

    <!-- Face & Hair -->
    <rect x="155" y="143" width="40" height="30" fill="#ffdd99"/>
    <!-- Hair -->
    <rect x="150" y="140" width="50" height="8" fill="#5c3d11"/>
    <rect x="150" y="143" width="8" height="18" fill="#5c3d11"/>
    <rect x="192" y="143" width="8" height="18" fill="#5c3d11"/>
    <!-- Pixel Eyes -->
    <rect x="163" y="153" width="6" height="8" fill="#0d1117"/>
    <rect x="181" y="153" width="6" height="8" fill="#0d1117"/>
    <!-- Scarf / Cloak Collar -->
    <rect x="148" y="170" width="54" height="12" fill="#2ed573"/>

    <!-- Body & Tunic -->
    <rect x="153" y="182" width="44" height="45" fill="#2ed573"/>
    <!-- Belt & Buckle -->
    <rect x="153" y="210" width="44" height="8" fill="#5c3d11"/>
    <rect x="170" y="209" width="10" height="10" fill="#f7d51d"/>
    <!-- Quiver Straps -->
    <line x1="155" y1="182" x2="190" y2="210" stroke="#5c3d11" stroke-width="3"/>

    <!-- Quiver & Arrows on Back -->
    <rect x="142" y="170" width="10" height="35" fill="#5c3d11"/>
    <polygon points="144,160 147,170 141,170" fill="#eccc68"/>
    <polygon points="149,158 152,168 146,168" fill="#eccc68"/>

    <!-- Legs & Boots -->
    <rect x="160" y="227" width="12" height="25" fill="#26af5f"/>
    <rect x="178" y="227" width="12" height="25" fill="#26af5f"/>
    <rect x="157" y="247" width="15" height="10" fill="#5c3d11"/>
    <rect x="178" y="247" width="15" height="10" fill="#5c3d11"/>

    <!-- Arms & Longbow Group -->
    <g class="bow-group">
      <!-- Left Arm Holding Bow -->
      <rect x="190" y="185" width="22" height="10" fill="#2ed573"/>
      <!-- Longbow Curve -->
      <path d="M 215 130 Q 240 190 215 250" stroke="#8b4513" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M 215 130 Q 240 190 215 250" stroke="#cd853f" stroke-width="2" fill="none"/>
      <!-- Bow String -->
      <line x1="215" y1="130" x2="215" y2="250" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/>

      <!-- Nocked Arrow -->
      <line x1="175" y1="190" x2="230" y2="190" stroke="#f7d51d" stroke-width="2.5"/>
      <polygon points="230,190 223,186 223,194" fill="#ff4757"/>
      <!-- Glowing Arrow Tip Sparkle -->
      <circle cx="230" cy="190" r="4" fill="#54a0ff" class="arrow-tip"/>
    </g>
  </g>

  <!-- Character Name Badge -->
  <rect x="100" y="375" width="150" height="26" rx="4" fill="#2ed573"/>
  <text x="175" y="392" font-size="13" fill="#0d1117" font-weight="bold" text-anchor="middle">SHK CHAN</text>

  <!-- Center Attributes Box -->
  <g transform="translate(340, 75)">
    <!-- Basic Info -->
    <text x="0" y="20" class="label-text">NAME</text>
    <text x="80" y="20" class="value-text">SHK Chan</text>

    <text x="0" y="50" class="label-text">CLASS</text>
    <text x="80" y="50" class="value-text" fill="#2ed573">Full-Stack & GUI Ranger</text>

    <text x="0" y="80" class="label-text">LEVEL</text>
    <text x="80" y="80" class="value-text">5+ <tspan fill="#888" font-size="11">(Years of Exp)</tspan></text>

    <text x="0" y="110" class="label-text">REALM</text>
    <text x="80" y="110" class="value-text">Australia 🇦🇺</text>

    <text x="0" y="140" class="label-text">STATUS</text>
    <text x="80" y="140" class="value-text" fill="#2ed573">Sharing Tech Notes</text>

    <!-- HP / MP / EXP Bars -->
    <!-- HP -->
    <text x="0" y="182" font-size="12" fill="#ff4757" font-weight="bold">HP</text>
    <rect x="35" y="170" width="190" height="16" rx="4" fill="#222"/>
    <rect x="37" y="172" width="186" height="12" rx="3" fill="url(#hpGrad)"/>
    <text x="130" y="182" class="bar-label" text-anchor="middle">Production-Grade Stack</text>

    <!-- MP -->
    <text x="0" y="212" font-size="12" fill="#1e90ff" font-weight="bold">MP</text>
    <rect x="35" y="200" width="190" height="16" rx="4" fill="#222"/>
    <rect x="37" y="202" width="175" height="12" rx="3" fill="url(#mpGrad)"/>
    <text x="130" y="212" class="bar-label" text-anchor="middle">Coffee & OpenCV Engine</text>

    <!-- EXP -->
    <text x="0" y="242" font-size="12" fill="#ffa502" font-weight="bold">EXP</text>
    <rect x="35" y="230" width="190" height="16" rx="4" fill="#222"/>
    <rect x="37" y="232" width="165" height="12" rx="3" fill="url(#expGrad)"/>
    <text x="130" y="242" class="bar-label" text-anchor="middle">88.50% to Next Lvl</text>
  </g>

  <!-- Right Ability Points Box (JRPG Stats) -->
  <g transform="translate(600, 75)">
    <text x="0" y="20" class="retro-title">ABILITY STATS</text>

    <!-- DEX: Full-Stack -->
    <rect x="0" y="35" width="205" height="34" rx="4" fill="#21262d" stroke="#30363d"/>
    <text x="12" y="57" class="stat-name">DEX</text>
    <text x="50" y="57" font-size="11" fill="#aaa">Full-Stack Web</text>
    <text x="180" y="57" class="stat-val">99</text>

    <!-- STR: GUI & C++ -->
    <rect x="0" y="78" width="205" height="34" rx="4" fill="#21262d" stroke="#30363d"/>
    <text x="12" y="100" class="stat-name">STR</text>
    <text x="50" y="100" font-size="11" fill="#aaa">GUI & C++ App</text>
    <text x="180" y="100" class="stat-val">95</text>

    <!-- INT: Computer Vision -->
    <rect x="0" y="121" width="205" height="34" rx="4" fill="#21262d" stroke="#30363d"/>
    <text x="12" y="143" class="stat-name">INT</text>
    <text x="50" y="143" font-size="11" fill="#aaa">OpenCV Vision</text>
    <text x="180" y="143" class="stat-val">93</text>

    <!-- LUK: Architecture -->
    <rect x="0" y="164" width="205" height="34" rx="4" fill="#21262d" stroke="#30363d"/>
    <text x="12" y="186" class="stat-name">LUK</text>
    <text x="50" y="186" font-size="11" fill="#aaa">Clean Design</text>
    <text x="180" y="186" class="stat-val">90</text>

    <!-- WIS: Problem Solving -->
    <rect x="0" y="207" width="205" height="34" rx="4" fill="#21262d" stroke="#30363d"/>
    <text x="12" y="229" class="stat-name">WIS</text>
    <text x="50" y="229" font-size="11" fill="#aaa">Bug Hunting</text>
    <text x="180" y="229" class="stat-val">98</text>
  </g>

  <!-- Bottom Core Equipment / Tech Stack Badges -->
  <g transform="translate(35, 425)">
    <text x="0" y="22" font-size="12" fill="#f7d51d" font-weight="bold">EQUIPPED SKILLS:</text>
    <text x="140" y="22" font-size="12" fill="#ffffff">Node.js • Java (Spring Boot) • Angular • C++ (Qt/MFC) • OpenCV • Docker</text>
  </g>
</svg>
```

</div>

---

### 🕹️ VIBE GAMING & BLOG PORTAL
> 🌐 **Personal Website & Gaming Blog**: [https://shkchan.pages.dev](https://shkchan.pages.dev) *(Hosted on Cloudflare Pages)*

---

### 🏹 DEV ATTRIBUTES & CORE QUESTS

| Attribute | Level / Mastery | Focus Area & Technical Loadout |
| :--- | :--- | :--- |
| **DEX (Full-Stack Web)** | `██████████` 99 | **Node.js, Java (Spring Boot), Angular, TypeScript, RESTful APIs, Docker** |
| **STR (GUI & C++ App)** | `█████████░` 95 | **C++ (Qt Framework, Legacy MFC Refactoring), Multi-threading, Hardware Driver Integration** |
| **INT (Computer Vision)** | `█████████░` 93 | **OpenCV, Real-Time Industrial Inspection, Image Processing, Object Detection** |
| **WIS (Architecture)** | `██████████` 98 | **Clean Architecture, Deterministic Automated Workflows, CI/CD Pipelines** |

---

### 📊 GITHUB QUEST STATS

<div align="center">

![shkchan's GitHub stats](https://github-readme-stats.vercel.app/api?username=shkchan&show_icons=true&theme=synthwave)
![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?username=shkchan&layout=compact&theme=synthwave)

</div>
