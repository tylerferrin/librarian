import { useCallback, useRef, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
}

const START_ANGLE = -135;
const END_ANGLE = 135;
const TOTAL_ANGLE = END_ANGLE - START_ANGLE;

function valueToAngle(value: number, min: number, max: number): number {
  const normalized = (value - min) / (max - min);
  return START_ANGLE + normalized * TOTAL_ANGLE;
}

export function Knob({
  label,
  value,
  min = 0,
  max = 127,
  onChange,
  size = 64,
  className = '',
}: KnobProps) {
  const knobRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartValue = useRef(0);

  const angle = valueToAngle(value, min, max);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  // Arc for the value track
  const trackRadius = radius + 2;
  const normalizedValue = (value - min) / (max - min);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      dragStartY.current = e.clientY;
      dragStartValue.current = value;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [value]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;

      const dy = dragStartY.current - e.clientY;
      const sensitivity = 0.5;
      const delta = dy * sensitivity;
      const range = max - min;
      const newValue = Math.round(
        Math.min(max, Math.max(min, dragStartValue.current + (delta / 150) * range))
      );

      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [value, min, max, onChange]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Handle scroll wheel
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      const newValue = Math.min(max, Math.max(min, value + delta));
      if (newValue !== value) {
        onChange(newValue);
      }
    },
    [value, min, max, onChange]
  );

  useEffect(() => {
    const el = knobRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Indicator line
  const indicatorLength = radius - 8;
  const angleRad = (angle * Math.PI) / 180;
  const lineX1 = cx + (indicatorLength - 10) * Math.sin(angleRad);
  const lineY1 = cy - (indicatorLength - 10) * Math.cos(angleRad);
  const lineX2 = cx + indicatorLength * Math.sin(angleRad);
  const lineY2 = cy - indicatorLength * Math.cos(angleRad);

  // Value arc path
  const startAngleRad = (START_ANGLE * Math.PI) / 180;
  const valueAngleRad = (angle * Math.PI) / 180;
  const arcStartX = cx + trackRadius * Math.sin(startAngleRad);
  const arcStartY = cy - trackRadius * Math.cos(startAngleRad);
  const arcEndX = cx + trackRadius * Math.sin(valueAngleRad);
  const arcEndY = cy - trackRadius * Math.cos(valueAngleRad);
  
  // Calculate the angular difference to determine if we need the large arc flag
  const angleDiff = angle - START_ANGLE;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;
  
  const arcPath =
    normalizedValue > 0.01
      ? `M ${arcStartX} ${arcStartY} A ${trackRadius} ${trackRadius} 0 ${largeArcFlag} 1 ${arcEndX} ${arcEndY}`
      : '';

  return (
    <div className={`flex flex-col items-center gap-1 select-none ${className}`}>
      <svg
        ref={knobRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={trackRadius}
          fill="none"
          stroke="rgb(209, 213, 219)"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* Value arc */}
        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Knob body */}
        <circle
          cx={cx}
          cy={cy}
          r={radius - 4}
          fill="rgb(249, 250, 251)"
          stroke="rgb(156, 163, 175)"
          strokeWidth={1.5}
        />

        {/* Indicator line */}
        <line
          x1={lineX1}
          y1={lineY1}
          x2={lineX2}
          y2={lineY2}
          stroke="rgb(59, 130, 246)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>

      {/* Label */}
      <span className="text-[11px] text-text-secondary leading-tight text-center">
        {label}
      </span>
      {/* Value */}
      <span className="text-[10px] text-accent-blue font-mono tabular-nums font-semibold">
        {value}
      </span>
    </div>
  );
}
