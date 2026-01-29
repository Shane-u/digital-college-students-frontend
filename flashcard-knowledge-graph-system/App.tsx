
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import FlashcardPreview from './components/FlashcardPreview';
import FlashcardGraph from './components/FlashcardGraph';
import FlashcardReview from './components/FlashcardReview';
import FlashcardEdit from './components/FlashcardEdit';
import FlashcardTempZone from './components/FlashcardTempZone';
import CompareView from './components/CompareView';
import { Flashcard, ViewState } from './types';

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: '1',
    title: 'React useState vs useEffect',
    content: 'React的useState和useEffect有什么区别和使用场景？',
    answer: 'useState用于状态管理，useEffect用于副作用处理如API调用或订阅。',
    tags: ['React'],
    category: '根 / Web课程 / 前端开发 / React',
    createdAt: '2023-11-20T10:00:00Z',
    isSaved: true
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [flashcards, setFlashcards] = useState<Flashcard[]>(INITIAL_FLASHCARDS);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [hasNewGenerated, setHasNewGenerated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const genIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (genIntervalRef.current) clearInterval(genIntervalRef.current); };
  }, []);

  const startGeneration = () => {
    if (isGenerating) return;
    
    const newId = Date.now().toString();
    const placeholderCard: Flashcard = {
      id: newId,
      title: '闪卡生成中...',
      content: '',
      answer: '',
      tags: [],
      category: '待分类',
      createdAt: new Date().toISOString(),
      isSaved: false,
      isGenerating: true,
      progress: 0
    };

    setFlashcards(prev => [placeholderCard, ...prev]);
    setIsGenerating(true);
    setGlobalProgress(0);
    setHasNewGenerated(true);
    setShowToast(false);

    if (genIntervalRef.current) clearInterval(genIntervalRef.current);
    
    genIntervalRef.current = window.setInterval(() => {
      setGlobalProgress(prev => {
        const next = prev + 5;
        
        // 更新特定卡片的进度
        setFlashcards(cards => cards.map(c => 
          c.id === newId ? { ...c, progress: next } : c
        ));

        if (next >= 100) {
          if (genIntervalRef.current) clearInterval(genIntervalRef.current);
          setIsGenerating(false);
          setShowToast(true);
          
          // 填充真实数据
          setFlashcards(cards => cards.map(c => 
            c.id === newId ? {
              ...c,
              isGenerating: false,
              title: '深入理解浏览器渲染原理',
              content: '从输入 URL 到页面显示，中间经历了哪些关键渲染步骤？于前端开发而言，这是必须掌握的基础知识。',
              answer: '1. 解析HTML生成DOM树 2. 解析CSS生成CSSOM树 3. 合并生成Render树 4. 布局(Layout) 5. 绘制(Painting) 6. 复合(Composite)。'
            } : c
          ));
          return 100;
        }
        return next;
      });
    }, 150);
  };

  const handleFlashcardButtonClick = () => {
    // 逻辑：如果正在生成，或者有新生成的卡片且是第一次点击
    if (isGenerating || hasNewGenerated) {
      setHasNewGenerated(false); // 标记已读
      setView('TEMP_ZONE');
    } else {
      setView('GRAPH');
    }
  };

  const saveToLibrary = (card: Flashcard, category: string) => {
    setFlashcards(prev => prev.map(c => 
      c.id === card.id ? { ...c, isSaved: true, category } : c
    ));
    setView('GRAPH');
  };

  return (
    <Layout 
      view={view} setView={setView} 
      onFlashcardClick={handleFlashcardButtonClick}
      isGenerating={isGenerating} progress={globalProgress}
      onStartGen={startGeneration}
    >
      {view === 'HOME' && (
        <div className="flex flex-col items-center justify-center h-full space-y-12">
          <h2 className="text-5xl font-black text-slate-900">李李伴学智识系统</h2>
          <button onClick={startGeneration} className="px-12 py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-black transition-all">
             一键智能生成闪卡
          </button>
        </div>
      )}

      {view === 'TEMP_ZONE' && (
        <FlashcardTempZone 
          flashcards={flashcards.filter(f => !f.isSaved)} 
          onConfirmSave={(c) => { setCurrentFlashcard(c); setView('ARCHIVE_SELECT'); }}
          onDelete={(id) => setFlashcards(prev => prev.filter(f => f.id !== id))}
          onPreview={(c) => { setCurrentFlashcard(c); setView('FLASHCARD_PREVIEW'); }}
        />
      )}

      {view === 'ARCHIVE_SELECT' && currentFlashcard && (
        <FlashcardPreview 
          card={currentFlashcard} 
          onSave={saveToLibrary} 
          onBack={() => setView('TEMP_ZONE')} 
        />
      )}

      {view === 'GRAPH' && (
        <FlashcardGraph 
          flashcards={flashcards.filter(f => f.isSaved)} 
          onNodeClick={(c) => { setCurrentFlashcard(c); setView('REVIEW'); }}
          onGoToTemp={() => setView('TEMP_ZONE')}
          onCompare={() => setView('COMPARE')}
        />
      )}

      {view === 'FLASHCARD_PREVIEW' && currentFlashcard && (
        <div className="p-12 max-w-2xl mx-auto">
           <button onClick={() => setView('TEMP_ZONE')} className="mb-6 text-slate-400 font-bold">返回暂存区</button>
           <div className="bg-white p-12 rounded-[40px] shadow-xl border">
              <h1 className="text-3xl font-black mb-6">{currentFlashcard.title}</h1>
              <p className="text-slate-600 leading-relaxed text-lg">{currentFlashcard.content}</p>
           </div>
        </div>
      )}

      {view === 'REVIEW' && currentFlashcard && <FlashcardReview card={currentFlashcard} onBack={() => setView('GRAPH')} />}
      {view === 'COMPARE' && <CompareView flashcards={flashcards.filter(f => f.isSaved)} onBack={() => setView('GRAPH')} />}

      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10">
          <div className="bg-white border shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-4">
            <i className="fas fa-check-circle text-green-500"></i>
            <span className="text-sm font-bold">闪卡生成完成</span>
            <button onClick={() => { setShowToast(false); setView('TEMP_ZONE'); }} className="text-indigo-600 text-xs font-black">点击查看</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
