
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, KnowledgeParagraph } from '../types';
import { Sparkles, Copy, ThumbsUp, ThumbsDown, Share, RotateCcw, Loader2, ChevronDown, ChevronUp, BookOpen, Link as LinkIcon, Star, FileText } from 'lucide-react';
import WorkflowSteps from './WorkflowSteps';

interface MessageListProps {
  messages: Message[];
}

const ThinkingBlock: React.FC<{ content: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (!content) return null;

  return (
    <div className="w-full mb-4 border-l-2 border-[#d3e3fd] pl-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-[#444746] text-sm font-medium hover:bg-[#f0f4f9] px-2 py-1 rounded-md transition-colors"
      >
        <span>思考过程</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isExpanded && (
        <div className="mt-2 text-[#5e5e5e] text-[14px] leading-relaxed italic whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
};

const KnowledgeSource: React.FC<{ paragraphs: KnowledgeParagraph[] }> = ({ paragraphs }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!paragraphs || paragraphs.length === 0) return null;

  return (
    <div className="w-full mt-4 bg-[#f8f9fc] border border-[#eef2f8] rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 px-4 hover:bg-[#f1f4f9] transition-colors"
      >
        <div className="flex items-center gap-2 text-[#1a73e8] text-[13px] font-medium">
          <LinkIcon size={14} />
          <span>知识来源 · {paragraphs.length}</span>
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-[#444746]" /> : <ChevronDown size={16} className="text-[#444746]" />}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {paragraphs.map((p, idx) => (
            <div key={idx} className="bg-white border border-[#eef2f8] rounded-lg p-4 relative group">
              <div className="absolute top-0 left-0 bg-[#1a73e8] text-white text-[10px] px-2 py-0.5 rounded-br-lg font-bold">
                TOP {idx + 1}
              </div>
              
              <div className="flex items-start justify-between mb-3 mt-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[13px] mb-1">
                     <span className="text-[#fb8c00] font-bold">召回标题:</span>
                     <span className="text-[#444746] font-medium">{p.problem_title || p.document_name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#fbc02d]">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} className="opacity-20" />
                    <span className="ml-2 text-[12px] text-[#444746] font-medium">{(p.similarity || 0).toFixed(3)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f0f7ff] p-3 rounded-md mb-3 font-mono text-[12px] text-[#2c3e50] overflow-x-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.content}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-between text-[12px] text-[#5e5e5e] border-t border-gray-50 pt-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#1a73e8]" />
                  <span className="text-[#1a73e8] hover:underline cursor-pointer">{p.document_name}</span>
                </div>
                <span>{p.dataset_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full max-w-4xl px-4 py-8 flex flex-col gap-8">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'model' && (
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-1">
              {msg.isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} fill="currentColor" />}
            </div>
          )}

          <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            {msg.role === 'model' && msg.workflow && (
               <WorkflowSteps workflow={msg.workflow} currentNodeId={msg.currentNodeId} />
            )}

            <div 
              className={`px-5 py-3.5 rounded-[24px] text-[16px] leading-relaxed transition-all ${
                msg.role === 'user' 
                  ? 'bg-[#f0f4f9] text-[#1f1f1f]' 
                  : 'text-[#1f1f1f]'
              }`}
            >
              {msg.role === 'model' && msg.thought && (
                <ThinkingBlock content={msg.thought} />
              )}

              {msg.role === 'model' && msg.knowledgeBase && (
                <div className="flex items-center gap-2 text-[13px] text-blue-600 font-medium mb-3 pb-2 border-b border-blue-50">
                  <BookOpen size={14} />
                  <span>已检索知识库: {msg.knowledgeBase}</span>
                </div>
              )}

              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content || (msg.isStreaming && !msg.workflow ? '...' : '')}
                </ReactMarkdown>
              </div>

              {msg.role === 'model' && msg.knowledgeParagraphs && msg.knowledgeParagraphs.length > 0 && (
                <KnowledgeSource paragraphs={msg.knowledgeParagraphs} />
              )}

              {msg.role === 'model' && msg.references && msg.references.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[#edf2f7]">
                  <div className="text-[12px] font-bold text-[#444746] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <LinkIcon size={12} />
                    <span>参考内容</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {msg.references.map((ref, i) => (
                      <a 
                        key={ref.id || i}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-blue-500 hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="opacity-60">[{i+1}]</span> {ref.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {msg.isStreaming && !msg.content && !msg.workflow && !msg.thought && (
                <span className="animate-pulse opacity-50 italic">Generating...</span>
              )}
            </div>

            {msg.role === 'model' && !msg.isStreaming && (
              <div className="flex items-center gap-1 mt-2 -ml-2">
                <button className="p-2 hover:bg-black/5 rounded-full text-[#444746] transition-colors"><ThumbsUp size={16} /></button>
                <button className="p-2 hover:bg-black/5 rounded-full text-[#444746] transition-colors"><ThumbsDown size={16} /></button>
                <button className="p-2 hover:bg-black/5 rounded-full text-[#444746] transition-colors"><Share size={16} /></button>
                <button className="p-2 hover:bg-black/5 rounded-full text-[#444746] transition-colors"><RotateCcw size={16} /></button>
                <button 
                  onClick={() => navigator.clipboard.writeText(msg.content)}
                  className="p-2 hover:bg-black/5 rounded-full text-[#444746] transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}
          </div>

          {msg.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
              Z
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
