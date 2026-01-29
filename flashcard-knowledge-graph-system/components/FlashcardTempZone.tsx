
import React from 'react';
import { Flashcard } from '../types';

interface FlashcardTempZoneProps {
  flashcards: Flashcard[];
  onConfirmSave: (card: Flashcard) => void;
  onPreview: (card: Flashcard) => void;
  onDelete: (id: string) => void;
}

const FlashcardTempZone: React.FC<FlashcardTempZoneProps> = ({ flashcards, onConfirmSave, onPreview, onDelete }) => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-8">
      <div className="mb-10 flex items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800">待确认的闪卡</h2>
        <span className="text-sm text-slate-400 font-bold">(7天后自动删除)</span>
      </div>

      {flashcards.length === 0 ? (
        <div className="h-64 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300">
          <i className="fas fa-inbox text-5xl mb-4"></i>
          <p className="font-bold">暂存区暂无内容</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {flashcards.map(card => (
            <div 
              key={card.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[220px] overflow-hidden"
            >
              {/* 卡片主体 */}
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-lg font-black ${card.isGenerating ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {card.title}
                  </h3>
                  {!card.isGenerating && (
                    <span className="text-[10px] font-black text-slate-300 uppercase">7天后过期</span>
                  )}
                </div>

                {card.isGenerating ? (
                  <div className="space-y-6 mt-8">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-300" 
                        style={{ width: `${card.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="text-xs font-medium">指定闪卡ID的进度不存在或已过期</span>
                      <span className="text-xs font-black">{card.progress || 0}%</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                      {card.content}
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onConfirmSave(card)}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700 transition"
                      >
                        确认保存
                      </button>
                      <button 
                        onClick={() => onPreview(card)}
                        className="px-4 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-100 transition border border-slate-100"
                      >
                        预览
                      </button>
                      <button 
                        onClick={() => onDelete(card.id)}
                        className="px-4 py-2 bg-white text-slate-400 text-xs font-bold rounded-lg hover:text-red-500 hover:bg-red-50 transition border border-slate-100"
                      >
                        删除
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardTempZone;
