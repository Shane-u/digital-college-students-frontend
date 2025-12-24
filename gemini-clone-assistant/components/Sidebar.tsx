
import React from 'react';
import { 
  Menu, 
  Plus, 
  Search, 
  MessageSquare, 
  History, 
  Gem, 
  Pin, 
  Settings, 
  HelpCircle,
  MoreVertical
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleOpen: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleOpen, 
  sessions, 
  currentSessionId,
  onNewChat,
  onSelectSession
}) => {
  return (
    <div className={`flex flex-col h-full bg-[#f0f4f9] transition-all duration-300 ${isOpen ? 'w-[280px]' : 'w-[68px]'}`}>
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={toggleOpen}
          className="p-2 hover:bg-[#e1e5ea] rounded-full transition-colors"
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
        {isOpen && (
          <button className="p-2 hover:bg-[#e1e5ea] rounded-full transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="px-3 mb-4 mt-2">
        <button 
          onClick={onNewChat}
          className={`flex items-center gap-3 bg-[#dde3ea] hover:bg-[#d3d9e0] transition-colors rounded-full ${isOpen ? 'px-4 py-3 w-full' : 'w-10 h-10 justify-center ml-0.5'}`}
        >
          <Plus size={20} strokeWidth={2} />
          {isOpen && <span className="text-sm font-medium">New chat</span>}
        </button>
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-6">
          <div>
            <div className="flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-[#e1e5ea] rounded-lg cursor-pointer">
              <span>My Stuff</span>
              <span className="text-xs opacity-60">›</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-[#e1e5ea] rounded-lg cursor-pointer mb-1">
              <span>Gems</span>
              <span className="text-xs opacity-60">›</span>
            </div>
            <div className="px-3 py-2 text-sm flex items-center gap-3 hover:bg-[#e1e5ea] rounded-lg cursor-pointer text-[#444746]">
              <History size={16} />
              <span>Time Planner</span>
            </div>
          </div>

          <div>
            <h3 className="px-3 mb-2 text-sm font-medium text-[#444746]">Chats</h3>
            <div className="space-y-1">
              {sessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                    currentSessionId === session.id ? 'bg-[#d3e3fd]' : 'hover:bg-[#e1e5ea]'
                  }`}
                >
                  <MessageSquare size={16} className="shrink-0" />
                  <span className="truncate flex-1">{session.title}</span>
                  {session.isPinned && <Pin size={14} className="opacity-60" />}
                  {isOpen && (
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded-full">
                      <MoreVertical size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="flex-1 flex flex-col items-center gap-4 py-4">
           <button className="p-2 hover:bg-[#e1e5ea] rounded-full"><Gem size={20}/></button>
           <button className="p-2 hover:bg-[#e1e5ea] rounded-full"><History size={20}/></button>
           <button className="p-2 hover:bg-[#e1e5ea] rounded-full"><Plus size={20}/></button>
        </div>
      )}

      <div className="mt-auto border-t border-[#e1e5ea] p-3 space-y-1">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#e1e5ea] cursor-pointer ${!isOpen && 'justify-center'}`}>
          <Settings size={20} strokeWidth={1.5} />
          {isOpen && <span className="text-sm font-medium">Settings & help</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
