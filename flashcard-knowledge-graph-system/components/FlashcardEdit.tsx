
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardEditProps {
  card: Flashcard;
  onSave: (card: Flashcard) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const FlashcardEdit: React.FC<FlashcardEditProps> = ({ card, onSave, onDelete, onBack }) => {
  const [title, setTitle] = useState(card.title);
  const [content, setContent] = useState(card.content);
  const [answer, setAnswer] = useState(card.answer);
  const [category, setCategory] = useState(card.category);
  const [tags, setTags] = useState(card.tags);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border">
        <div className="p-8 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">编辑闪卡</h2>
          <div className="flex space-x-3">
             <button onClick={() => onDelete(card.id)} className="px-6 py-2 text-red-600 border border-red-200 rounded-full hover:bg-red-50 transition">删除</button>
             <button onClick={onBack} className="px-6 py-2 text-gray-500 border rounded-full hover:bg-gray-50 transition">取消</button>
             <button onClick={() => onSave({ ...card, title, content, answer, category, tags })} className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition shadow-lg">保存修改</button>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">标题</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-purple-400 focus:outline-none" />
              
              <label className="block text-sm font-medium text-gray-700">卡面内容</label>
              <textarea rows={4} value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-purple-400 focus:outline-none" />
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">详细答案/解析</label>
              <textarea rows={7} value={answer} onChange={e => setAnswer(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-purple-400 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t pt-8">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
               <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-purple-400 focus:outline-none">
                 <option>技术知识</option>
                 <option>生活常识</option>
                 <option>面试准备</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">管理标签</label>
               <div className="flex flex-wrap gap-2 mb-3">
                 {tags.map(t => (
                   <span key={t} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center">
                     {t} <i onClick={() => setTags(tags.filter(tg => tg !== t))} className="fas fa-times ml-2 cursor-pointer"></i>
                   </span>
                 ))}
               </div>
               <div className="flex space-x-2">
                 <input value={tagInput} onChange={e => setTagInput(e.target.value)} className="flex-1 px-4 py-2 border rounded-xl text-sm" placeholder="新标签" />
                 <button onClick={handleAddTag} className="px-4 py-2 bg-gray-100 rounded-xl">添加</button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardEdit;
