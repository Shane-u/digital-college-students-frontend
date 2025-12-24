
export type ModelMode = 'fast' | 'thinking' | 'pro';

export interface WorkflowNode {
  id: string;
  type: string;
  data: {
    config: {
      title: string;
      icon: string;
      desc: string;
    };
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface Reference {
  id: string;
  title: string;
  url?: string;
  snippet?: string;
}

export interface KnowledgeParagraph {
  dataset_id: string;
  paragraph_id: string;
  dataset_name: string;
  document_name: string;
  document_id: string;
  content: string;
  similarity: number;
  problem_title?: string;
  product?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  thought?: string;
  references?: Reference[];
  knowledgeBase?: string;
  knowledgeParagraphs?: KnowledgeParagraph[];
  timestamp: Date;
  isStreaming?: boolean;
  currentNodeId?: string;
  workflow?: WorkflowData;
}

export interface ChatSession {
  id: string;
  chat_id?: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  isPinned?: boolean;
}

export interface Suggestion {
  icon: string;
  label: string;
  prompt: string;
}
