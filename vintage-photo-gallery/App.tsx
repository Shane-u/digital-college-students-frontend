
import React, { useState, useEffect, useCallback } from 'react';
import { CardData } from './types';
import Card from './components/Card';
import { TwineString, VINTAGE_COLORS, FONTS } from './constants';

const TEXT_SNIPPETS = [
  "时间在这张纸条上\n轻轻地打了个结\n仿佛昨天的风\n还没吹散。",
  "A letter to the sea:\n\nThank you for the waves\nand the salt on my skin.",
  "在这座城市的角落\n我发现了一束\n被遗忘的阳光。",
  "Somewhere between\nthe pages of an old book,\nI found your name.",
  "Coffee rings\nand half-written poems.\nTuesday morning.",
  "草在结它的种子\n风在摇它的叶子\n我们站着，不说话\n就十分美好。",
  "The light at five PM\nis different in October.\nIt smells of woodsmoke.",
  "生活不只是\n眼前的苟且\n还有诗和远方的田野。",
  "Silence is a\ndifferent kind of\nconversation.",
  "我想和你虚度时光\n比如低头看鱼\n比如把茶喝到无味。",
];

const generateBatch = (): CardData[] => {
  // Fixed to exactly 5 cards as requested (at most 5)
  const count = 5;
  return Array.from({ length: count }).map((_, i) => {
    const isLong = Math.random() > 0.5;
    const width = isLong ? 130 + Math.random() * 20 : 180 + Math.random() * 40;
    const height = isLong ? 260 + Math.random() * 80 : 160 + Math.random() * 50;
    
    const rotation = (Math.random() - 0.5) * 8; 
    const id = Math.random().toString(36).substring(7);
    
    return {
      id,
      content: TEXT_SNIPPETS[Math.floor(Math.random() * TEXT_SNIPPETS.length)],
      rotation,
      width,
      height,
      color: VINTAGE_COLORS[Math.floor(Math.random() * VINTAGE_COLORS.length)],
      fontFamily: FONTS[Math.floor(Math.random() * FONTS.length)]
    };
  });
};

const App: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshBatch = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCards(generateBatch());
      setIsRefreshing(false);
    }, 600);
  }, []);

  useEffect(() => {
    setCards(generateBatch());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-12 relative overflow-hidden bg-[#fcfaf5]">
      {/* Subtle Background Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-black"></div>
      </div>

      <header className="mb-24 text-center z-10 pt-10">
        <h1 
          className="text-5xl md:text-6xl text-gray-800 opacity-40 font-light"
          style={{ fontFamily: '"Zeyada", cursive' }}
        >
          Fragile Threads
        </h1>
        <div className="h-px w-24 bg-gray-300 mx-auto mt-4 opacity-50"></div>
      </header>

      {/* Hanging Clothesline Container */}
      <div className="relative w-full overflow-x-auto overflow-y-hidden pb-20 no-scrollbar">
        {/* Container min-width set to 1000px to match SVG viewBox width for alignment */}
        <div className="relative min-w-[1000px] mx-auto px-10 flex justify-center items-start min-h-[550px]">
          <TwineString />
          
          <div className={`flex flex-nowrap gap-12 md:gap-16 transition-all duration-700 pt-10 ${isRefreshing ? 'opacity-0 -translate-y-6 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
            {cards.map((card, idx) => {
              // Sagging Logic: The SVG twine sags about 40px in the middle.
              // We map card indices to vertical offsets to follow that curve.
              const mid = (cards.length - 1) / 2;
              const distFromMid = Math.abs(idx - mid);
              // Sag intensity matches the SVG path's quadratic curve (Q 250 65, 500 60...)
              const sagOffset = (mid * mid - distFromMid * distFromMid) * 10;
              
              return (
                <div key={card.id} style={{ transform: `translateY(${sagOffset}px)` }} className="z-10">
                   <Card data={card} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Change Batch Button */}
      <footer className="mt-12 z-20 flex flex-col items-center">
        <button
          onClick={refreshBatch}
          disabled={isRefreshing}
          className="group relative px-12 py-4 bg-[#E2DDD4] text-[#8B6A47] rounded-none border border-[#D4C3A1] shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          style={{ clipPath: 'polygon(1% 0%, 99% 0%, 100% 100%, 0% 100%)' }}
        >
          <span className="flex items-center gap-3 font-medium tracking-[0.2em] text-xs uppercase">
            <svg 
              className={`w-4 h-4 transition-transform duration-1000 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            换一批卡片
          </span>
        </button>
        
        <p className="mt-8 text-gray-400 text-[9px] tracking-[0.3em] uppercase font-mono opacity-60">
          Collected Fragments • Series IV
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default App;
