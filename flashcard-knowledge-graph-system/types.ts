
import * as d3 from 'd3';

export interface Flashcard {
  id: string;
  title: string;
  content: string;
  answer: string;
  tags: string[];
  category: string;
  createdAt: string;
  isSaved: boolean;
  isExpanded?: boolean;
  // 新增：用于跟踪生成状态
  isGenerating?: boolean;
  progress?: number;
}

export type ViewState = 'HOME' | 'FLASHCARD_PREVIEW' | 'GRAPH' | 'TEMP_ZONE' | 'REVIEW' | 'EDIT' | 'COMPARE' | 'ARCHIVE_SELECT';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'flashcard' | 'category' | 'time';
  color?: string;
  isExpanded?: boolean;
  data?: Flashcard;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
}
