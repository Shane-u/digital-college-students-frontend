
import React from 'react';

interface ProgressCircleProps {
  isGenerating: boolean;
  progress: number;
  onClick: () => void;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ isGenerating, progress, onClick }) => {
  const size = 44;
  const stroke = 3;
  const center = size / 2;
  const radius = center - stroke;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#f3e8ff"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#9333ea"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <i className={`fas fa-clone ${isGenerating ? 'text-purple-400 animate-pulse' : 'text-purple-600 group-hover:scale-110 transition-transform'}`}></i>
      </div>
      {isGenerating && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"></div>
      )}
    </div>
  );
};

export default ProgressCircle;
