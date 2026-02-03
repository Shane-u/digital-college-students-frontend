
import React from 'react';
import { Flashcard } from '../types';
import ActionButton from './ActionButton';
import { Check, Eye, Edit3, Trash2, Clock } from 'lucide-react';

interface FlashcardItemProps {
  card: Flashcard;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ card }) => {
  return (
    <div className="group relative bg-white border border-slate-100 rounded-[32px] p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
      {/* Expiry Badge */}
      <div className="absolute top-6 right-8 flex items-center gap-1.5 text-xs font-medium text-slate-300">
        <Clock className="w-3.5 h-3.5" />
        <span>{card.expiryDays}天后过期</span>
      </div>

      {/* Card Header */}
      <div className="mb-6 pr-16">
        <h3 className="text-xl font-bold text-slate-800 line-clamp-1 leading-tight mb-3">
          {card.title}
        </h3>
        <div className="h-1.5 w-10 bg-[#5b52f9] rounded-full"></div>
      </div>

      {/* Card Content Preview */}
      <div className="mb-8 min-h-[120px]">
        <div className="text-slate-500 text-[15px] leading-relaxed line-clamp-4 font-normal">
          {card.content.split('\n').map((line, idx) => (
            <p key={idx} className="mb-1">{line}</p>
          ))}
        </div>
      </div>

      {/* Action Buttons Container - Single Row Flex */}
      <div className="flex items-center gap-2 pt-6 border-t border-slate-50 overflow-x-auto no-scrollbar">
        <div className="flex-1 min-w-max">
          <ActionButton 
            label="确认保存" 
            variant="primary" 
            icon={<Check size={18} />} 
            onClick={() => alert('Saved!')} 
          />
        </div>
        <ActionButton 
          label="预览" 
          icon={<Eye size={18} />} 
          onClick={() => alert('Previewing...')} 
        />
        <ActionButton 
          label="编辑" 
          icon={<Edit3 size={18} />} 
          onClick={() => alert('Editing...')} 
        />
        <ActionButton 
          label="删除" 
          variant="danger"
          icon={<Trash2 size={18} />} 
          onClick={() => alert('Deleted!')} 
        />
      </div>
    </div>
  );
};

export default FlashcardItem;
