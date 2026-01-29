
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Flashcard, GraphNode, GraphLink } from '../types';

interface FlashcardGraphProps {
  flashcards: Flashcard[];
  onNodeClick: (card: Flashcard, mode: 'review' | 'edit') => void;
  onGoToTemp: () => void;
  onCompare: () => void;
}

const FlashcardGraph: React.FC<FlashcardGraphProps> = ({ flashcards, onNodeClick, onGoToTemp, onCompare }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState('ALL');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Robustly handle container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(containerRef.current);
    window.addEventListener('resize', updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Filtering logic with safety checks
  const filteredCards = useMemo(() => {
    const cards = flashcards || [];
    const now = new Date();
    let result = [...cards];
    
    if (timeRange === '7D') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(c => new Date(c.createdAt) >= sevenDaysAgo);
    } else if (timeRange === '1M') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      result = result.filter(c => new Date(c.createdAt) >= oneMonthAgo);
    }
    
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(c => 
        (c.title || "").toLowerCase().includes(s) || 
        (c.content || "").toLowerCase().includes(s)
      );
    }
    return result;
  }, [flashcards, search, timeRange]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Extract unique categories safely
    const categoriesSet = new Set<string>();
    filteredCards.forEach(c => {
      if (c.category) categoriesSet.add(c.category);
    });

    categoriesSet.forEach(cat => {
      const parts = cat.split(' / ');
      const label = parts[parts.length - 1] || '未分类';
      nodes.push({ id: cat, label: label, type: 'category', color: '#4f46e5' });
    });

    filteredCards.forEach(card => {
      nodes.push({ id: card.id, label: card.title || '无标题', type: 'flashcard', color: '#9333ea', data: card });
      if (card.category) {
        links.push({ source: card.category, target: card.id, type: 'belongs_to' });
      }
    });

    if (nodes.length === 0) return;

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));

    svg.call(zoom);

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(60));

    const link = g.append("g")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .on("click", (event, d) => {
        if (d.type === 'flashcard' && d.data) {
          onNodeClick(d.data, 'review');
        }
      })
      .call(d3.drag<any, any>()
        .on("start", (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }));

    node.append("circle")
      .attr("r", d => d.type === 'category' ? 24 : 16)
      .attr("fill", d => d.color || "#ccc")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("class", "shadow-sm transition-all duration-300 hover:scale-110");

    node.append("text")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("class", "node-label font-bold text-slate-600 pointer-events-none")
      .style("font-size", d => d.type === 'category' ? "12px" : "10px")
      .text(d => {
        const lbl = d.label || '';
        return lbl.length > 15 ? lbl.slice(0, 12) + '...' : lbl;
      });

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any)?.x || 0)
        .attr("y1", d => (d.source as any)?.y || 0)
        .attr("x2", d => (d.target as any)?.x || 0)
        .attr("y2", d => (d.target as any)?.y || 0);

      node.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };

  }, [filteredCards, onNodeClick, dimensions]);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap gap-4 items-center justify-between z-10 shadow-sm shrink-0">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="搜索标题或内容..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-5 py-2.5 bg-slate-100 border-2 border-transparent rounded-2xl text-sm w-72 focus:ring-0 focus:border-indigo-500 focus:bg-white transition-all outline-none"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {['ALL', '7D', '1M', '6M'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2 text-xs font-black rounded-xl transition-all ${timeRange === range ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {range === 'ALL' ? '全部' : range === '7D' ? '近7天' : range === '1M' ? '近1个月' : '近半年'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onCompare} className="px-6 py-2.5 text-sm bg-slate-900 text-white rounded-2xl hover:bg-black font-black transition-all flex items-center shadow-lg shadow-slate-200">
            <i className="fas fa-columns mr-2"></i>对比模式
          </button>
          <button onClick={onGoToTemp} className="px-6 py-2.5 text-sm bg-white text-slate-500 border border-slate-200 rounded-2xl hover:bg-slate-50 font-bold transition-all flex items-center shadow-sm">
            <i className="fas fa-archive mr-2"></i>暂存区
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-slate-50">
        {filteredCards.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none">
            <i className="fas fa-project-diagram text-8xl mb-6 opacity-20"></i>
            <p className="text-xl font-bold">图谱暂无内容</p>
            <p className="text-sm mt-2">请先生成闪卡并保存入库</p>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full block absolute inset-0"></svg>
        )}
      </div>

      <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-2xl z-20 pointer-events-none max-w-xs">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">图谱图例</h4>
        <div className="space-y-3">
          <div className="flex items-center text-xs font-bold text-slate-700">
            <span className="w-4 h-4 bg-indigo-600 rounded-full mr-3 shadow-lg shadow-indigo-100"></span>
            知识分类层级 (Category)
          </div>
          <div className="flex items-center text-xs font-bold text-slate-700">
            <span className="w-4 h-4 bg-purple-600 rounded-full mr-3 shadow-lg shadow-purple-100"></span>
            学习闪卡节点 (Flashcard)
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            <i className="fas fa-mouse-pointer mr-1"></i> 单击节点复习内容 <br/>
            <i className="fas fa-expand-alt mr-1"></i> 滚轮缩放图谱视野
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlashcardGraph;
