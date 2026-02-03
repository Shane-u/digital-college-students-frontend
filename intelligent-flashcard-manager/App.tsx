
import React, { useState } from 'react';
import { ChevronLeft, Mic, Search, Filter, Plus, BookOpen, Clock } from 'lucide-react';
import FlashcardItem from './components/FlashcardItem';
import { Flashcard } from './types';

const MOCK_CARDS: Flashcard[] = [
  {
    id: '1',
    title: 'HTTP 与 HTTPS 差异与必要性',
    content: '### HTTP 与 HTTPS 核心差异\n1. 明文传输 vs 加密传输\n2. 安全机制：HTTPS 引入了 SSL/TLS 握手过程\n3. 身份验证：合法 SSL 证书验证防止中间人攻击',
    expiryDays: 7,
    tags: ['Network', 'Security']
  },
  {
    id: '2',
    title: 'HTTP 与 HTTPS 区别',
    content: '1. 安全性：HTTP 为明文，HTTPS 加密传输。\n2. 证书机制：HTTPS 有证书验证身份，HTTP 无。\n3. 端口：HTTP 为 80，HTTPS 为 443。',
    expiryDays: 7,
    tags: ['Basic']
  },
  {
    id: '3',
    title: 'React Hooks 原理简述',
    content: 'Hooks 是 React 16.8 引入的特性。它允许在不编写 class 的情况下使用 state 和其他 React 特性。底层通过 Fiber 节点的 memoizedState 链表来实现状态持久化。',
    expiryDays: 6,
    tags: ['React', 'Web']
  }
];

const App: React.FC = () => {
  const [cards] = useState<Flashcard[]>(MOCK_CARDS);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Navigation Bar - Simplified */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => alert('Returning to Knowledge Graph...')}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-slate-600 hover:text-[#5b52f9] hover:bg-indigo-50 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-bold tracking-wide">返回图谱页面</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-[#5b52f9] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 bg-[#5b52f9] text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-[#4a42d9] shadow-lg shadow-indigo-100 transition-all">
              <Plus className="w-4 h-4" />
              <span>新建闪卡</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">待确认的闪卡</h1>
              <span className="px-3 py-1 bg-indigo-50 text-[#5b52f9] rounded-lg text-xs font-bold uppercase tracking-widest">
                Pending
              </span>
            </div>
            <p className="text-slate-400 flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-[#5b52f9]" />
              <span>系统将在 7 天后自动清理未保存的卡片，请及时确认。</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:shadow-md transition-all">
              <Filter className="w-4 h-4 text-slate-300" />
              筛选分类
            </button>
          </div>
        </div>

        {/* Card Grid - Removed Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map(card => (
            <FlashcardItem key={card.id} card={card} />
          ))}
        </div>
      </main>

      {/* Floating Voice Button */}
      <div className="fixed bottom-10 left-10 group">
        <div className="absolute inset-0 bg-[#5b52f9] rounded-full animate-ping opacity-10 group-hover:opacity-30 transition-opacity"></div>
        <button 
          className="relative flex items-center gap-3 px-7 py-4 bg-[#5b52f9] text-white rounded-full shadow-2xl shadow-indigo-200 hover:bg-[#4a42d9] hover:scale-105 active:scale-95 transition-all duration-300 group"
          onClick={() => alert('Voice mode activated...')}
        >
          <Mic className="w-5 h-5" />
          <span className="font-bold text-sm tracking-widest uppercase">语音助手</span>
          <div className="flex items-center gap-1 ml-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-0.5 h-3 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-10 right-10 sm:hidden">
        <button className="p-5 bg-white shadow-2xl border border-slate-50 rounded-[24px] text-[#5b52f9]">
          <BookOpen className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default App;
