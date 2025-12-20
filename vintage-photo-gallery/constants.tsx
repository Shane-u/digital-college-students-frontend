
import React from 'react';

export const VINTAGE_COLORS = [
  '#E2D1C3', // Muted beige
  '#D4E2D5', // Faded sage
  '#E2D4D4', // Dusty rose
  '#D4DCE2', // Faded denim
  '#E2DDD4', // Pale ochre
  '#D9D4E2', // Muted lavender
];

export const FONTS = [
  '"Gochi Hand", cursive',
  '"Zeyada", cursive',
  '"Special Elite", serif'
];

/**
 * A messy, multi-threaded twine string using SVG paths.
 * Simulates several thin hemp fibers wrapped and tangled together with a natural sag.
 */
export const TwineString: React.FC = () => (
  <svg 
    className="absolute top-0 left-0 w-full h-[100px] z-0 pointer-events-none overflow-visible" 
    viewBox="0 0 1000 100" 
    preserveAspectRatio="none"
  >
    <defs>
      <filter id="fuzz">
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
      </filter>
    </defs>
    
    <g filter="url(#fuzz)" opacity="0.6">
      {/* Main thicker core fiber */}
      <path 
        d="M-10 20 Q 250 65, 500 60 T 1010 30" 
        fill="none" 
        stroke="#8B6A47" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      
      {/* Secondary weaving fiber 1 */}
      <path 
        d="M-10 22 Q 300 55, 550 65 T 1010 25" 
        fill="none" 
        stroke="#A68966" 
        strokeWidth="0.8" 
        strokeDasharray="150 2"
      />
      
      {/* Secondary weaving fiber 2 - more chaotic */}
      <path 
        d="M-10 18 Q 200 70, 480 58 T 1010 35" 
        fill="none" 
        stroke="#C5A376" 
        strokeWidth="0.5"
      />
      
      {/* Loose stray fibers (tiny bits sticking out) */}
      <path d="M 120 45 L 125 38" stroke="#8B6A47" strokeWidth="0.5" opacity="0.4" />
      <path d="M 450 62 L 455 70" stroke="#8B6A47" strokeWidth="0.5" opacity="0.4" />
      <path d="M 780 40 L 775 48" stroke="#8B6A47" strokeWidth="0.5" opacity="0.4" />
      
      {/* Additional fine thread for "messiness" */}
      <path 
        d="M-10 25 Q 400 75, 520 62 T 1010 28" 
        fill="none" 
        stroke="#D2B48C" 
        strokeWidth="0.4" 
        opacity="0.8"
      />
    </g>
  </svg>
);

export const Clothespin: React.FC = () => (
  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[10px] h-[32px] bg-[#C5A376] shadow-md rounded-sm z-30 border-l border-white/20 flex flex-col items-center justify-between py-1">
    <div className="w-full h-[1px] bg-black/10"></div>
    {/* The metal spring ring */}
    <div className="w-[12px] h-[4px] border border-gray-500/50 rounded-full"></div>
    <div className="w-full h-[1px] bg-black/10"></div>
    {/* Wood grain overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent pointer-events-none"></div>
  </div>
);
