
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardReviewProps {
  card: Flashcard;
  onBack: () => void;
}

const FlashcardReview: React.FC<FlashcardReviewProps> = ({ card, onBack }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Simple "挖空" logic: replace key technical words with ____
  const answer = card?.answer || '';
  const processedAnswer = answer.replace(/(React|useState|useEffect|单线程|执行栈|异步|阻塞|状态|副作用)/g, '____');

  const startVoiceRecap = () => {
    setIsRecording(true);
    setTimeout(() => {
        setIsRecording(false);
        alert('语音复盘已录制并同步');
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-gray-500 hover:text-purple-600 transition flex items-center">
            <i className="fas fa-arrow-left mr-2"></i>返回图谱
        </button>
        <span className="text-sm text-gray-400 font-mono">ID: {card.id}</span>
      </div>

      <div className="space-y-8">
        {/* Question Card */}
        <div className="bg-white rounded-3xl p-10 shadow-xl border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-purple-600"></div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{card.title}</h2>
          <p className="text-xl text-gray-600 leading-relaxed italic">"{card.content}"</p>
        </div>

        {/* Answer/Cloze Section */}
        <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-gray-700">挖空复习</h3>
             <button 
               onClick={() => setShowAnswer(!showAnswer)}
               className="text-purple-600 font-medium hover:underline"
             >
               {showAnswer ? '隐藏答案' : '显示完整答案'}
             </button>
           </div>
           
           <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-xl text-gray-800 leading-loose">
                {showAnswer ? answer : processedAnswer}
              </p>
           </div>
        </div>

        {/* Voice Recap Action */}
        <div className="flex flex-col items-center space-y-4">
           <button 
             onClick={startVoiceRecap}
             className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-lg ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
           >
             <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'} text-2xl`}></i>
           </button>
           <p className="text-sm text-gray-500 font-medium">
             {isRecording ? '正在录制复盘语音...' : '点击进行语音复盘'}
           </p>
        </div>
      </div>
    </div>
  );
};

export default FlashcardReview;
