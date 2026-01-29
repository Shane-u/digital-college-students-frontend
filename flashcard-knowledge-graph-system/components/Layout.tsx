
import React, { useState } from 'react';
import ProgressCircle from './ProgressCircle';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  view: ViewState;
  setView: (v: ViewState) => void;
  onFlashcardClick: () => void;
  isGenerating: boolean;
  progress: number;
  onStartGen: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  view, 
  setView, 
  onFlashcardClick,
  isGenerating,
  progress,
  onStartGen
}) => {
  const [isGraphMenuOpen, setIsGraphMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-50">
        <div className="flex items-center space-x-3">
          <img src="https://picsum.photos/seed/butterfly/40/40" className="w-8 h-8 rounded-full" alt="logo" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Cyber Ego</span>
        </div>

        <nav className="flex space-x-8 items-center h-full">
          <button onClick={() => setView('HOME')} className={`h-full border-b-2 transition-colors ${view === 'HOME' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-purple-600'}`}>首页</button>
          <button className="text-gray-600 hover:text-purple-600">竞赛活动</button>
          <button className="text-gray-600 hover:text-purple-600">职业发展</button>
          
          <div className="relative h-full flex items-center">
            <button 
              onMouseEnter={() => setIsGraphMenuOpen(true)}
              onClick={() => setIsGraphMenuOpen(!isGraphMenuOpen)}
              className={`h-full flex items-center border-b-2 transition-colors ${view === 'GRAPH' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-purple-600'}`}
            >
              图谱 <i className="fas fa-chevron-down ml-2 text-xs"></i>
            </button>
            {isGraphMenuOpen && (
              <div 
                onMouseLeave={() => setIsGraphMenuOpen(false)}
                className="absolute top-full left-0 w-40 bg-white shadow-lg border rounded-b-lg overflow-hidden py-1"
              >
                <button className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700">技能图谱</button>
                <button onClick={() => { setView('GRAPH'); setIsGraphMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700">闪卡图谱</button>
              </div>
            )}
          </div>

          <button onClick={() => setView('HOME')} className="text-gray-600 hover:text-purple-600">李李伴学</button>
          <button className="text-gray-600 hover:text-purple-600">成长轨迹</button>
        </nav>

        <div className="flex items-center space-x-6">
          <ProgressCircle 
            isGenerating={isGenerating} 
            progress={progress} 
            onClick={onFlashcardClick}
          />
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden cursor-pointer border border-purple-200">
             <img src="https://picsum.photos/seed/user/32/32" alt="avatar" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#fafafa]">
        {children}
      </main>

      {/* Sidebar for navigation if needed, though most is top-nav based on requirements */}
    </div>
  );
};

export default Layout;
