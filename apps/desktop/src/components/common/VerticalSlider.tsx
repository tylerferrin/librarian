// Vertical slider component for fader-style controls

import { useState, useRef, useEffect } from 'react';

interface VerticalSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  height?: number; // Height in pixels
  color?: string; // Slider track color
}

export function VerticalSlider({
  label,
  value,
  min = 0,
  max = 127,
  onChange,
  className = '',
  height = 200,
  color = '#3b82f6',
}: VerticalSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Convert value (0-127) to percentage (0-100) for display
  const percentage = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientY);
  };

  const updateValue = (clientY: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, ((rect.height - y) / rect.height) * 100));
    const newValue = Math.round((percentage / 100) * (max - min) + min);
    
    onChange(newValue);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Label */}
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </span>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="relative bg-gray-800 rounded-full cursor-pointer select-none shadow-inner"
        style={{ width: '32px', height: `${height}px` }}
        onMouseDown={handleMouseDown}
      >
        {/* Track Fill */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-100"
          style={{
            height: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />

        {/* Thumb/Handle */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-10 h-8 bg-gray-300 rounded-md shadow-lg transition-all duration-100 border-2 border-gray-400"
          style={{
            bottom: `calc(${percentage}% - 16px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Grip lines */}
          <div className="flex flex-col items-center justify-center h-full gap-0.5">
            <div className="w-6 h-0.5 bg-gray-600 rounded" />
            <div className="w-6 h-0.5 bg-gray-600 rounded" />
            <div className="w-6 h-0.5 bg-gray-600 rounded" />
          </div>
        </div>
      </div>

      {/* Value Display */}
      <span className="text-xs font-mono text-gray-500 tabular-nums">
        {value}
      </span>
    </div>
  );
}
