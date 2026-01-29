
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Flashcard } from '../types';

interface CompareViewProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

const CompareView: React.FC<CompareViewProps> = ({ flashcards, onBack }) => {
  const [leftWidth, setLeftWidth] = useState(50); // 左侧面板百分比宽度
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // 限制拖动范围，防止面板过小
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onDrag);
      window.addEventListener('mouseup', stopDragging);
      document.body.style.cursor = 'col-resize';
    } else {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDragging);
      document.body.style.cursor = 'default';
    }
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', stopDragging);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, onDrag, stopDragging]);

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 头部标题栏 */}
      <div className="h-14 border-b px-6 flex items-center justify-between shrink-0 bg-white z-20">
         <div className="flex items-center space-x-2 font-bold text-gray-700">
            <i className="fas fa-columns text-purple-600"></i>
            <span>图谱对比模式</span>
         </div>
         <button onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-2">
            退出对比 <i className="fas fa-times-circle"></i>
         </button>
      </div>

      {/* 主体对比区域 */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* 左侧：技能图谱 */}
        <div 
          className="flex flex-col relative bg-slate-50/50"
          style={{ width: `${leftWidth}%` }}
        >
           <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-indigo-100 shadow-sm text-[10px] font-black text-indigo-600 uppercase tracking-widest">
             技能图谱 (核心路径)
           </div>
           <div className="flex-1 flex items-center justify-center text-slate-300 flex-col space-y-4">
              <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full"></div>
                 <i className="fas fa-project-diagram text-7xl relative"></i>
              </div>
              <p className="text-xs font-bold tracking-widest text-slate-400">技能图谱数据加载中...</p>
           </div>
        </div>
        
        {/* 可拖动分割线 */}
        <div 
          onMouseDown={startDragging}
          className={`w-1.5 h-full cursor-col-resize relative z-30 transition-colors duration-200 ${isDragging ? 'bg-purple-500' : 'bg-slate-100 hover:bg-purple-300'}`}
        >
          {/* 拖动手柄视觉元素 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-12 flex flex-col items-center justify-center gap-1">
             <div className="w-1 h-1 rounded-full bg-slate-300"></div>
             <div className="w-1 h-1 rounded-full bg-slate-300"></div>
             <div className="w-1 h-1 rounded-full bg-slate-300"></div>
          </div>
        </div>

        {/* 右侧：闪卡图谱 */}
        <div 
          className="flex flex-col relative bg-white"
          style={{ width: `${100 - leftWidth}%` }}
        >
           <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-purple-100 shadow-sm text-[10px] font-black text-purple-600 uppercase tracking-widest">
             闪卡图谱 (个人知识库)
           </div>
           <div className="flex-1 flex items-center justify-center text-slate-300 flex-col space-y-4">
              <div className="relative">
                 <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full"></div>
                 <i className="fas fa-clone text-7xl relative"></i>
              </div>
              <p className="text-xs font-bold tracking-widest text-slate-400">闪卡图谱同步预览...</p>
           </div>
        </div>

        {/* 拖动时的全屏遮罩（防止干扰） */}
        {isDragging && <div className="fixed inset-0 z-40 cursor-col-resize"></div>}
      </div>

      {/* 底部状态栏 */}
      <div className="h-10 border-t px-6 flex items-center text-[10px] text-slate-400 bg-white shrink-0 font-medium">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               左右同步滚动已开启
            </span>
            <span className="text-slate-200">|</span>
            <span>拖动中间分割线可调整视角比例</span>
            <span className="text-slate-200">|</span>
            <span>点击技能节点可联想对应的闪卡知识点</span>
         </div>
      </div>
    </div>
  );
};

export default CompareView;
