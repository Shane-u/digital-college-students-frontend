
import React from 'react';
import { CardData } from '../types';
import { Clothespin } from '../constants';

interface CardProps {
  data: CardData;
}

const Card: React.FC<CardProps> = ({ data }) => {
  return (
    <div 
      className="relative flex flex-col items-center transition-all duration-1000 ease-in-out"
      style={{
        transform: `rotate(${data.rotation}deg)`,
        // Margin adjusted so the 'pinch' of the clothespin aligns with the SVG twine path
        marginTop: '-12px' 
      }}
    >
      <Clothespin />
      
      {/* The Paper Card */}
      <div 
        className="shadow-xl ring-1 ring-black/5 p-4 flex flex-col noise-overlay relative overflow-hidden"
        style={{
          width: `${data.width}px`,
          height: `${data.height}px`,
          backgroundColor: data.color,
          // Rough deckled edge look
          borderRadius: '2px 3px 2px 4px',
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 98%, 97% 100%, 3% 99%, 0% 100%)',
          marginTop: '16px' // Push paper down so pin top is visible
        }}
      >
        {/* Subtle horizontal lines for ruled paper effect if long strip */}
        {data.height > 250 && (
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 24px' }}>
          </div>
        )}

        {/* The Text Content */}
        <div 
          className="flex-1 overflow-hidden text-gray-800/80 leading-relaxed select-none"
          style={{ 
            fontFamily: data.fontFamily,
            fontSize: data.width < 150 ? '0.95rem' : '1.1rem'
          }}
        >
          {data.content.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
        </div>

        {/* Vintage stamps/marks */}
        <div className="mt-auto pt-2 border-t border-black/5 flex justify-between items-center">
          <span className="text-[10px] opacity-30 font-mono">№ {data.id.toUpperCase()}</span>
          <div className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center opacity-20 rotate-12">
            <span className="text-[8px]">OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
