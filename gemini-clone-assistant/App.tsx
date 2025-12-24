
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { ChatSession, ModelMode, Message, WorkflowData, Reference, KnowledgeParagraph } from './types';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [modelMode, setModelMode] = useState<ModelMode>('fast');

  useEffect(() => {
    setSessions([]);
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  const selectSession = useCallback((id: string) => {
    setCurrentSessionId(id);
  }, []);

  const sendMessage = async (content: string) => {
    let activeSessionId = currentSessionId;
    
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content,
      timestamp: new Date()
    };

    if (!activeSessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [userMessage],
        updatedAt: new Date()
      };
      setSessions(prev => [newSession, ...prev]);
      activeSessionId = newId;
      setCurrentSessionId(newId);
    } else {
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { ...s, messages: [...s.messages, userMessage], updatedAt: new Date() } 
          : s
      ));
    }

    let targetSession = sessions.find(s => s.id === activeSessionId) || { id: activeSessionId, messages: [userMessage] };
    let chatId = (targetSession as ChatSession).chat_id;

    if (!chatId) {
      try {
        chatId = await apiService.getChatId();
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId ? { ...s, chat_id: chatId } : s
        ));
      } catch (err: any) {
        console.error("Failed to initialize chat session", err);
        const errorMsg: Message = {
          id: Date.now().toString() + '-error',
          role: 'model',
          content: `Failed to initialize session: ${err.message}.`,
          timestamp: new Date()
        };
        setSessions(prev => prev.map(s => 
          s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
        ));
        return;
      }
    }

    const modelMessage: Message = {
      id: Date.now().toString() + '-model',
      role: 'model',
      content: '',
      thought: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, modelMessage], updatedAt: new Date() } 
        : s
    ));

    try {
      let rawText = '';
      let currentWorkflow: WorkflowData | undefined = undefined;
      let lastNodeId = '';
      let references: Reference[] = [];
      let knowledgeParagraphs: KnowledgeParagraph[] = [];

      const stream = apiService.streamChat(chatId!, content);

      for await (const chunk of stream) {
        if (chunk.node_id) lastNodeId = chunk.node_id;

        if (chunk.node_dict && chunk.node_dict.nodes) {
          currentWorkflow = {
            nodes: chunk.node_dict.nodes,
            edges: chunk.node_dict.edges || []
          };
        }

        if (chunk.references) references = chunk.references;
        if (chunk.paragraph_list) knowledgeParagraphs = chunk.paragraph_list;

        if (chunk.content && typeof chunk.content === 'string') {
          rawText += chunk.content;
        }

        let displayContent = rawText;
        let thoughtContent = '';
        
        const thinkMatch = rawText.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
        if (thinkMatch) {
          thoughtContent = thinkMatch[1];
          displayContent = rawText.replace(/<think>[\s\S]*?(?:<\/think>|$)/, '').trim();
        }

        setSessions(prev => prev.map(s => 
          s.id === activeSessionId 
            ? { 
                ...s, 
                messages: s.messages.map(m => 
                  m.id === modelMessage.id ? { 
                    ...m, 
                    content: displayContent,
                    thought: thoughtContent,
                    workflow: currentWorkflow || m.workflow,
                    currentNodeId: lastNodeId,
                    references: references.length > 0 ? references : m.references,
                    knowledgeParagraphs: knowledgeParagraphs.length > 0 ? knowledgeParagraphs : m.knowledgeParagraphs
                  } : m
                ) 
              } 
            : s
        ));
      }

      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { 
              ...s, 
              messages: s.messages.map(m => 
                m.id === modelMessage.id ? { ...m, isStreaming: false } : m
              ) 
            } 
          : s
      ));
    } catch (error: any) {
      console.error("Streaming error:", error);
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
          ? { 
              ...s, 
              messages: s.messages.map(m => 
                m.id === modelMessage.id ? { ...m, content: m.content + `\n\n[Error: ${error.message}]`, isStreaming: false } : m
              ) 
            } 
          : s
      ));
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-[#1f1f1f]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleOpen={() => setSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={startNewChat}
        onSelectSession={selectSession}
      />
      <MainContent 
        currentSession={currentSession}
        modelMode={modelMode}
        setModelMode={setModelMode}
        onSendMessage={sendMessage}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
};

export default App;
