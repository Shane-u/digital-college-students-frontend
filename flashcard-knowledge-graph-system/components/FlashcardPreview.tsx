
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface HierarchyNode {
  id: string;
  name: string;
  children?: HierarchyNode[];
}

const INITIAL_HIERARCHY: HierarchyNode[] = [
  {
    id: 'course-web',
    name: 'Web课程',
    children: [
      {
        id: 'fe',
        name: '前端开发',
        children: [
          { id: 'html', name: 'HTML/CSS' },
          { id: 'js', name: 'JavaScript' },
          { id: 'react', name: 'React' },
        ]
      }
    ]
  },
  {
    id: 'course-cs',
    name: '计算机基础',
    children: [
      { id: 'ds', name: '数据结构' }
    ]
  }
];

interface FlashcardPreviewProps {
  card: Flashcard;
  onSave: (card: Flashcard, category: string) => void;
  onBack: () => void;
}

const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({ card, onSave, onBack }) => {
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>(INITIAL_HIERARCHY);
  const [selectedL2, setSelectedL2] = useState<HierarchyNode | null>(null);
  const [selectedL3, setSelectedL3] = useState<HierarchyNode | null>(null);
  const [selectedL4, setSelectedL4] = useState<HierarchyNode | null>(null);
  
  const [newLabelName, setNewLabelName] = useState('');
  const [addingLevel, setAddingLevel] = useState<'L3' | 'L4' | null>(null);

  const handleAddNewLabel = () => {
    if (!newLabelName.trim()) return;
    const newNode = { id: `custom-${Date.now()}`, name: newLabelName.trim(), children: [] };
    
    if (addingLevel === 'L3' && selectedL2) {
      setHierarchy(prev => prev.map(c => c.id === selectedL2.id ? { ...c, children: [...(c.children || []), newNode] } : c));
      setSelectedL3(newNode);
    } else if (addingLevel === 'L4' && selectedL3 && selectedL2) {
      setHierarchy(prev => prev.map(course => course.id === selectedL2.id ? {
        ...course, children: (course.children || []).map(main => main.id === selectedL3.id ? { ...main, children: [...(main.children || []), newNode] } : main)
      } : course));
      setSelectedL4(newNode);
    }
    setNewLabelName(''); setAddingLevel(null);
  };

  const getPathString = () => {
    const parts = ['根'];
    if (selectedL2) parts.push(selectedL2.name);
    if (selectedL3) parts.push(selectedL3.name);
    if (selectedL4) parts.push(selectedL4.name);
    return parts.join(' / ');
  };

  return (
    <div className="min-h-full bg-white flex flex-col p-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12 border-b pb-8">
        <div>
          <button onClick={onBack} className="text-slate-400 font-black text-xs mb-2 flex items-center gap-2">
            <i className="fas fa-arrow-left"></i> 取消并返回暂存区
          </button>
          <h2 className="text-3xl font-black text-slate-900">选择归档层级</h2>
        </div>
        <button 
          disabled={!selectedL3}
          onClick={() => onSave(card, getPathString())}
          className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition disabled:opacity-20 shadow-xl shadow-indigo-100"
        >
          完成并入库
        </button>
      </div>

      <div className="space-y-12 flex-1">
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">所属课程</h3>
          <div className="grid grid-cols-4 gap-4">
            {hierarchy.map(course => (
              <button key={course.id} onClick={() => { setSelectedL2(course); setSelectedL3(null); setSelectedL4(null); }}
                className={`p-6 rounded-2xl border-2 transition ${selectedL2?.id === course.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-50 bg-slate-50'}`}>
                <span className="font-black text-slate-700">{course.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className={`space-y-4 transition ${!selectedL2 ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">选择大类</h3>
          <div className="flex flex-wrap gap-3">
            {(selectedL2?.children || []).map(main => (
              <button key={main.id} onClick={() => { setSelectedL3(main); setSelectedL4(null); }}
                className={`px-6 py-3 rounded-xl font-black text-sm border-2 transition ${selectedL3?.id === main.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>
                {main.name}
              </button>
            ))}
            <button onClick={() => setAddingLevel('L3')} className="px-6 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 font-black text-sm">
              + 增加分类
            </button>
          </div>
        </section>
      </div>

      <div className="mt-20 p-8 bg-slate-900 rounded-3xl flex justify-between items-center text-white">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-2">当前归档路径</span>
          <div className="text-xl font-black">{getPathString()}</div>
        </div>
      </div>

      {addingLevel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-white p-10 rounded-3xl max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-6">新增自定义分类</h3>
            <input autoFocus value={newLabelName} onChange={e => setNewLabelName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl mb-6 font-bold" placeholder="分类名称" />
            <div className="flex gap-4">
              <button onClick={() => setAddingLevel(null)} className="flex-1 py-3 text-slate-400 font-bold">取消</button>
              <button onClick={handleAddNewLabel} className="flex-1 py-3 bg-slate-900 text-white font-black rounded-xl">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardPreview;
