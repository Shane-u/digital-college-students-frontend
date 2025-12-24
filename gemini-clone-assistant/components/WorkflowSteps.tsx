
import React from 'react';
import { WorkflowData } from '../types';

interface WorkflowStepsProps {
  workflow: WorkflowData;
  currentNodeId?: string;
}

const BASE_IMG_URL = 'https://bailian.cdut.edu.cn';

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ workflow, currentNodeId }) => {
  if (!workflow || !workflow.nodes) return null;

  // We sort nodes based on edges to create a logical sequence if possible, 
  // or just use the order provided.
  const nodes = workflow.nodes;

  return (
    <div className="w-full my-4 p-4 bg-[#f8fafd] rounded-2xl border border-[#edf2f7] overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        {nodes.map((node, index) => {
          const isActive = node.id === currentNodeId;
          const isDone = nodes.findIndex(n => n.id === currentNodeId) > index;
          const iconUrl = node.data?.config?.icon?.startsWith('/') 
            ? `${BASE_IMG_URL}${node.data.config.icon}` 
            : node.data?.config?.icon;

          return (
            <React.Fragment key={node.id}>
              <div className="flex flex-col items-center group relative max-w-[120px]">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 shadow-lg scale-110' 
                      : isDone 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-white border-gray-200 opacity-60'
                  }`}
                >
                  {iconUrl ? (
                    <img 
                      src={iconUrl} 
                      alt={node.data?.config?.title} 
                      className={`w-5 h-5 object-contain ${isActive || isDone ? 'brightness-0 invert' : ''}`} 
                    />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isActive || isDone ? 'bg-white' : 'bg-gray-300'}`} />
                  )}
                </div>
                
                <span className={`mt-2 text-[11px] font-medium text-center truncate w-full px-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {node.data?.config?.title}
                </span>

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1f1f1f] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {node.data?.config?.desc || node.data?.config?.title}
                </div>
              </div>

              {index < nodes.length - 1 && (
                <div className={`h-0.5 w-8 -mt-6 transition-colors duration-500 ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;
