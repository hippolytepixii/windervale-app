const fs = require('fs');

// 1. Update tailwind.config.js
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wv: {
          black: '#0a090b',
          ink: '#000000',
          charcoal: '#18161b',
          surface: '#242129',
          ivory: '#fbf6f0',
          warmwhite: '#faf7f2',
          paper: '#fbf6f0',
          dirtywhite: '#ebe3d5',
          dust: '#948e8c',
          dustyrose: '#dfa5a2',
          dustypink: '#dfa5a2',
          oldpink: '#dfa5a2',
          pink: '#dfa5a2',
          // Purged all red/wine - remapped safely to stark black and dusty pink
          oxblood: '#000000',
          wine: '#000000',
          burgundy: '#18161b',
          blood: '#000000',
          red: '#000000',
          cobalt: '#1b3bb6',
          royal: '#10257e',
          orange: '#cf552a',
          terracotta: '#bf502b',
          mustard: '#cfa030',
          plum: '#18161b',
          purple: '#000000',
          border: '#000000',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Newsreader', 'serif'],
        fun: ['Fraunces', 'serif'],
        arthouse: ['Syne', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'editorial': '4px 4px 0px 0px #000000',
        'editorial-bold': '5px 5px 0px 0px #000000',
        'editorial-rose': '4px 4px 0px 0px #dfa5a2',
        'editorial-wine': '4px 4px 0px 0px #000000',
        'editorial-cobalt': '4px 4px 0px 0px #000000',
        'editorial-mustard': '4px 4px 0px 0px #000000',
        'editorial-ivory': '4px 4px 0px 0px #fbf6f0',
      },
    },
  },
  plugins: [],
};
`;
fs.writeFileSync('tailwind.config.js', tailwindConfig);
console.log('Updated tailwind.config.js');

// 2. Update src/index.css
const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: 'Fraunces', 'Newsreader', serif;
  --font-fun: 'Fraunces', serif;
  --font-arthouse: 'Syne', sans-serif;
  --font-serif: 'Newsreader', Georgia, serif;
  --font-mono: 'Space Mono', monospace;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
}

/* Custom Print Scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: #0a090b;
}
::-webkit-scrollbar-thumb {
  background: #252229;
  border-radius: 0px;
}
::-webkit-scrollbar-thumb:hover {
  background: #dfa5a2;
}

/* Subtle Film Grain Texture Overlay */
.film-grain {
  position: relative;
}
.film-grain::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  z-index: 999;
}

/* Hard Edged Editorial Buttons - Arthouse 90s */
.btn-editorial {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-arthouse);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.65rem 1.25rem;
  border: 2px solid #000000;
  background-color: #000000;
  color: #dfa5a2;
  box-shadow: 3px 3px 0px 0px #000000;
  transition: all 0.15s ease-in-out;
  border-radius: 0px;
}
.btn-editorial:hover {
  background-color: #dfa5a2;
  color: #000000;
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px 0px #000000;
}
.btn-editorial:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px 0px #000000;
}

/* Replaced btn-editorial-wine with Arthouse Stark Black & Dusty Pink */
.btn-editorial-wine {
  border: 2.5px solid #000000;
  background-color: #000000;
  color: #dfa5a2;
  box-shadow: 4px 4px 0px 0px #000000;
  font-weight: 800;
  font-family: var(--font-arthouse);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  transition: all 0.15s ease-in-out;
}
.btn-editorial-wine:hover {
  background-color: #dfa5a2;
  color: #000000;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px #000000;
}
.btn-editorial-wine:active {
  transform: translate(0px, 0px);
  box-shadow: 2px 2px 0px 0px #000000;
}

.btn-editorial-cobalt {
  border: 2.5px solid #000000;
  background-color: #1a3db8;
  color: #ffffff;
  box-shadow: 4px 4px 0px 0px #000000;
}
.btn-editorial-cobalt:hover {
  background-color: #0e2675;
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0px 0px #000000;
}

.btn-editorial-mustard {
  border: 2.5px solid #000000;
  background-color: #d69e2e;
  color: #000000;
  font-weight: 800;
  box-shadow: 4px 4px 0px 0px #000000;
}
.btn-editorial-mustard:hover {
  background-color: #e5b045;
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0px 0px #000000;
}

.btn-editorial-terracotta {
  border: 2.5px solid #000000;
  background-color: #c6532b;
  color: #ffffff;
  box-shadow: 4px 4px 0px 0px #000000;
}
.btn-editorial-terracotta:hover {
  background-color: #d95b30;
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0px 0px #000000;
}

.btn-editorial-rose {
  border: 2.5px solid #000000;
  background-color: #dfa5a2;
  color: #000000;
  font-weight: 800;
  box-shadow: 4px 4px 0px 0px #000000;
}
.btn-editorial-rose:hover {
  background-color: #eed0ce;
  color: #000000;
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0px 0px #000000;
}

.btn-editorial-ivory {
  border: 2.5px solid #000000;
  background-color: #fbf6f0;
  color: #000000;
  font-weight: 800;
  box-shadow: 4px 4px 0px 0px #000000;
}
.btn-editorial-ivory:hover {
  background-color: #ffffff;
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0px 0px #000000;
}

/* Tactile Editorial Poster Button */
.btn-editorial-poster {
  font-family: var(--font-fun);
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  background-color: #000000;
  color: #dfa5a2;
  border: 2.5px solid #000000;
  padding: 1rem 1.75rem;
  box-shadow: 4px 4px 0px 0px #000000;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.btn-editorial-poster:hover {
  background-color: #dfa5a2;
  color: #000000;
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px 0px #000000;
}
.btn-editorial-poster:active {
  transform: translate(0px, 0px);
  box-shadow: 2px 2px 0px 0px #000000;
}

/* Designed Editorial Block Object */
.editorial-block {
  border-radius: 0px;
  position: relative;
  transition: all 0.2s ease;
}

/* Paper Surface Panel */
.panel-paper {
  background-color: #fbf6f0;
  color: #000000;
  border: 2.5px solid #000000;
  box-shadow: 4px 4px 0px 0px #000000;
}

/* Deep Ink Panel */
.panel-ink {
  background-color: #000000;
  color: #fbf6f0;
  border: 2.5px solid #000000;
  box-shadow: 4px 4px 0px 0px #000000;
}

/* Animations */
@keyframes editorialFade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-editorial-fade {
  animation: editorialFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Typesetting and Page Transitions */
@keyframes typesetLetter {
  0% {
    opacity: 0;
    transform: translateY(4px);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0px);
  }
}

@keyframes paperSlideIn {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pageTurn {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.96) translateY(-12px);
  }
}

.animate-typeset-letter {
  animation: typesetLetter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-paper-slide {
  animation: paperSlideIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-page-turn {
  animation: pageTurn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Focus Mode Fullscreen Transition */
.focus-mode-container {
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: #0a090b;
  overflow-y: auto;
  animation: focusEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes focusEnter {
  from {
    opacity: 0;
    transform: scale(0.985);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Stage 1 Logo Ink Soak Keyframes */
@keyframes inkAppearance {
  0% {
    opacity: 0;
    transform: scale(0.95);
    filter: blur(5px) contrast(140%);
  }
  50% {
    opacity: 0.85;
    filter: blur(1.5px) contrast(110%);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0px) contrast(100%);
  }
}

.animate-ink-appearance {
  animation: inkAppearance 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;
fs.writeFileSync('src/index.css', indexCss);
console.log('Updated src/index.css');
