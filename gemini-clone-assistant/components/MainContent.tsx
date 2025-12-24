
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Mic, Plus, Settings2, Keyboard } from 'lucide-react';
import { ChatSession, ModelMode, Suggestion } from '../types';
import ModelSelector from './ModelSelector';
import MessageList from './MessageList';

interface MainContentProps {
  currentSession: ChatSession | undefined;
  modelMode: ModelMode;
  setModelMode: (mode: ModelMode) => void;
  onSendMessage: (content: string) => void;
  isSidebarOpen: boolean;
}

const SUGGESTIONS: Suggestion[] = [
  { icon: '🍌', label: 'Create image', prompt: 'Create a beautiful image of a futuristic city with flying cars' },
  { icon: '🎬', label: 'Create video', prompt: 'Write a script for a short video about the future of AI' },
  { icon: '✍️', label: 'Write anything', prompt: 'Write a poem about the beauty of mathematics' },
  { icon: '🎓', label: 'Help me learn', prompt: 'Explain quantum entanglement like I am five' },
];

const MainContent: React.FC<MainContentProps> = ({ 
  currentSession, 
  modelMode, 
  setModelMode, 
  onSendMessage,
  isSidebarOpen 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      // Reset height
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Change to Ctrl + Enter as requested
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="text-xl font-medium tracking-tight text-[#444746]">Gemini</div>
        <div className="flex items-center gap-3">
          <div className="px-2 py-0.5 rounded border border-[#e3e3e3] text-[10px] font-bold text-[#444746]">PRO</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
            Z
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="w-full max-w-4xl px-4 pt-16 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4 text-2xl md:text-4xl font-medium">
              <Sparkles className="text-blue-500" size={32} fill="currentColor" />
              <span>Hi Zhao</span>
            </div>
            
            <div className="flex items-center gap-3 mb-12 text-2xl md:text-5xl font-medium text-center">
              <span className="text-[#1f1f1f]">Fast is now powered by 3 Flash. Try it</span>
              <button className="w-10 h-10 bg-[#d3e3fd] text-blue-600 rounded-full flex items-center justify-center hover:bg-[#c2d7fb] transition-colors">
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : (
          <MessageList messages={currentSession.messages} />
        )}
      </div>

      <div className="w-full px-4 pb-4 md:pb-8 flex flex-col items-center bg-gradient-to-t from-white via-white/90 to-transparent">
        <div className="w-full max-w-4xl">
          
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {SUGGESTIONS.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInputValue(s.prompt)}
                  className="px-4 py-3 bg-white border border-[#e3e3e3] hover:bg-[#f8f9fa] rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="relative bg-[#f0f4f9] rounded-[28px] shadow-sm border border-transparent focus-within:border-[#e3e3e3] focus-within:bg-white transition-all">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Gemini ${modelMode === 'pro' ? 'Pro' : '3'}`}
              rows={1}
              className="w-full bg-transparent border-none focus:ring-0 px-6 py-5 text-[17px] outline-none resize-none overflow-hidden min-h-[64px]"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-1">
                <button className="p-3 text-[#444746] hover:bg-black/5 rounded-full transition-colors relative group">
                  <Plus size={20} />
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#444746] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">Add files</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 rounded-full text-[11px] text-[#444746] font-medium border border-black/5">
                   <Keyboard size={12} />
                   <span>Ctrl + Enter to send</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ModelSelector mode={modelMode} setMode={setModelMode} />
                <button className="p-3 text-[#444746] hover:bg-black/5 rounded-full transition-colors">
                  <Mic size={20} />
                </button>
                {inputValue.trim() && (
                   <button 
                    onClick={handleSend}
                    className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-all scale-110 ml-1"
                   >
                     <ArrowRight size={20} strokeWidth={2.5} />
                   </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-[11px] text-[#5e5e5e] text-center px-4">
            Gemini can make mistakes, so double-check it. <a href="#" className="underline">Your privacy & Gemini Apps</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
