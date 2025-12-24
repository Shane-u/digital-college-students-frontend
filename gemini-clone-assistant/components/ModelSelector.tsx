
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, CheckCircle2, Zap, BrainCircuit, Star } from 'lucide-react';
import { ModelMode } from '../types';

interface ModelSelectorProps {
  mode: ModelMode;
  setMode: (mode: ModelMode) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ mode, setMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModeLabel = (m: ModelMode) => {
    switch (m) {
      case 'fast': return 'Fast';
      case 'thinking': return 'Thinking';
      case 'pro': return 'Pro';
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-[#e1e5ea] hover:bg-[#d3d9e0] transition-colors rounded-full text-sm font-medium text-[#444746]"
      >
        <span>{getModeLabel(mode)}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-4 right-0 w-80 bg-[#f0f4f9] rounded-2xl shadow-xl border border-white/40 backdrop-blur-sm z-50 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 space-y-1">
            <div className="px-4 py-3 text-sm font-medium text-[#444746]">Gemini 3</div>
            
            <button 
              onClick={() => { setMode('fast'); setIsOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${mode === 'fast' ? 'bg-[#d3e3fd]' : 'hover:bg-black/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <Zap size={20} fill="currentColor" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">Fast</div>
                  <div className="text-xs text-[#5e5e5e]">Answers quickly</div>
                </div>
              </div>
              {mode === 'fast' && <CheckCircle2 size={18} className="text-blue-600" />}
            </button>

            <button 
              onClick={() => { setMode('thinking'); setIsOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${mode === 'thinking' ? 'bg-[#d3e3fd]' : 'hover:bg-black/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <BrainCircuit size={20} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Thinking</span>
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">New</span>
                  </div>
                  <div className="text-xs text-[#5e5e5e]">Solves complex problems</div>
                </div>
              </div>
              {mode === 'thinking' && <CheckCircle2 size={18} className="text-blue-600" />}
            </button>

            <button 
              onClick={() => { setMode('pro'); setIsOpen(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${mode === 'pro' ? 'bg-[#d3e3fd]' : 'hover:bg-black/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  <Star size={20} fill="currentColor" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">Pro</div>
                  <div className="text-xs text-[#5e5e5e]">Thinks longer for math & code</div>
                </div>
              </div>
              {mode === 'pro' && <CheckCircle2 size={18} className="text-blue-600" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
