import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ 
  checked, 
  onChange, 
  label, 
  disabled = false, 
  className = '' 
}: SwitchProps) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer ${className}`}>
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
      
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        
        <div className={`
          block w-14 h-8 rounded-full transition-colors duration-200 ease-in-out
          ${checked ? 'bg-indigo-600' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `} />
        
        <div className={`
          absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-6' : 'translate-x-0'}
          ${disabled ? 'opacity-50' : ''}
        `} />
      </div>
    </label>
  );
}
