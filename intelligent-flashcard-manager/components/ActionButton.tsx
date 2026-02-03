
import React from 'react';

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, icon, onClick, variant = 'secondary' }) => {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-95 shadow-sm whitespace-nowrap overflow-hidden";
  
  const variants = {
    primary: "bg-[#5b52f9] text-white hover:bg-[#4a42d9] shadow-md shadow-indigo-100",
    secondary: "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50 hover:text-indigo-600",
    danger: "bg-white text-slate-500 border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]}`}
    >
      <span className="w-[18px] h-[18px] flex items-center justify-center">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
};

export default ActionButton;
