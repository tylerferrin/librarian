# UI Framework Options for Desktop Music Apps

*Research for Pedal Editor & Preset Manager - User Interface Strategy*

---

## Executive Summary

For a MIDI pedal editor, build **custom controls** (knobs, sliders, DIP switches) using **React + Tailwind CSS** as the foundation. Optionally use **shadcn/ui** for standard components (buttons, dialogs, forms).

Avoid heavy component libraries - music production UIs require specialized controls not found in standard libraries.

---

## UI Requirements Analysis

### Specialized Controls Needed

1. **Rotary Knobs**
   - MIDI parameter control (0-127)
   - Visual feedback (position indicator)
   - Mouse drag interaction
   - Touch support (iPad)

2. **Sliders**
   - Horizontal and vertical
   - MIDI value display
   - Snap-to-value options

3. **DIP Switches**
   - Toggle switches (binary on/off)
   - Multi-switch banks
   - Visual similarity to hardware

4. **Parameter Display**
   - Current value
   - Parameter name
   - Units (where applicable)

5. **Preset Browser**
   - List view
   - Grid view
   - Search and filter
   - Tag display

### Standard UI Components

- Buttons (save, load, sync)
- Modals/Dialogs (confirmations, settings)
- Forms (preset metadata)
- Navigation (pedal selection)
- Notifications/Toasts

---

## Recommended Approach: Custom + shadcn/ui

### Base Stack

```
React + TypeScript + Tailwind CSS + shadcn/ui
```

### Why This Combination?

1. **Tailwind CSS**: Utility-first styling, perfect for custom controls
2. **shadcn/ui**: Unstyled, accessible components for standard UI
3. **React**: Full control over specialized audio UI
4. **TypeScript**: Type safety for MIDI parameters

### Architecture

```
UI Components
├── Standard Components (shadcn/ui)
│   ├── Button
│   ├── Dialog
│   ├── Select
│   ├── Input
│   └── ...
└── Custom Audio Controls (built from scratch)
    ├── Knob
    ├── Slider (MIDI-aware)
    ├── DIPSwitch
    ├── ParameterGroup
    └── PresetCard
```

---

## Implementation: Custom MIDI Controls

### Rotary Knob Component

```tsx
// src/components/Knob.tsx
import { useState, useRef, useEffect } from 'react';
import { clamp } from '../utils/math';

interface KnobProps {
  value: number;        // 0-127
  min?: number;         // Default 0
  max?: number;         // Default 127
  label: string;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function Knob({
  value,
  min = 0,
  max = 127,
  label,
  onChange,
  size = 'md'
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  // Convert MIDI value to rotation angle (-135° to +135°)
  const angle = ((value - min) / (max - min)) * 270 - 135;
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 0.5;
      const newValue = clamp(
        startValueRef.current + Math.round(deltaY * sensitivity),
        min,
        max
      );
      
      if (newValue !== value) {
        onChange(newValue);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, value, min, max, onChange]);
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} relative cursor-pointer select-none`}
        onMouseDown={handleMouseDown}
      >
        {/* Knob body */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 shadow-lg">
          {/* Position indicator */}
          <div
            className="absolute inset-0 flex items-start justify-center pt-2"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <div className="w-1 h-6 bg-blue-400 rounded-full shadow-lg" />
          </div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-950" />
          </div>
        </div>
        
        {/* Tick marks */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {Array.from({ length: 11 }).map((_, i) => {
            const tickAngle = -135 + (i * 27);
            const isActive = angle >= tickAngle;
            return (
              <line
                key={i}
                x1="50"
                y1="10"
                x2="50"
                y2="15"
                stroke={isActive ? '#60a5fa' : '#4b5563'}
                strokeWidth="1"
                transform={`rotate(${tickAngle} 50 50)`}
              />
            );
          })}
        </svg>
      </div>
      
      {/* Label and value */}
      <div className="text-center">
        <div className="text-sm font-medium text-gray-200">{label}</div>
        <div className="text-xs text-gray-400">{value}</div>
      </div>
    </div>
  );
}
```

### MIDI Slider Component

```tsx
// src/components/MidiSlider.tsx
interface MidiSliderProps {
  value: number;        // 0-127
  label: string;
  onChange: (value: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function MidiSlider({
  value,
  label,
  onChange,
  orientation = 'horizontal'
}: MidiSliderProps) {
  const percentage = (value / 127) * 100;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };
  
  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center gap-2`}>
      <label className="text-sm font-medium text-gray-200">
        {label}
      </label>
      
      <div className="relative flex-1">
        <input
          type="range"
          min="0"
          max="127"
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:bg-blue-500 
                     [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:cursor-pointer"
        />
        
        {/* Value indicator */}
        <div 
          className="absolute top-[-24px] transform -translate-x-1/2 text-xs text-gray-400"
          style={{ left: `${percentage}%` }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
```

### DIP Switch Component

```tsx
// src/components/DIPSwitch.tsx
interface DIPSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function DIPSwitch({ label, value, onChange }: DIPSwitchProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-gray-400">{label}</div>
      
      <button
        onClick={() => onChange(!value)}
        className="relative w-12 h-20 bg-gray-800 rounded-lg shadow-inner border border-gray-700"
      >
        {/* Switch */}
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded transition-all duration-200 ${
            value
              ? 'top-1 bg-blue-500 shadow-lg'
              : 'bottom-1 bg-gray-600'
          }`}
        />
        
        {/* Labels */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[8px] text-gray-500">
          ON
        </div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] text-gray-500">
          OFF
        </div>
      </button>
    </div>
  );
}
```

### Parameter Group Component

```tsx
// src/components/ParameterGroup.tsx
interface ParameterGroupProps {
  title: string;
  children: React.ReactNode;
}

export function ParameterGroup({ title, children }: ParameterGroupProps) {
  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
        {title}
      </h3>
      
      <div className="grid grid-cols-4 gap-6">
        {children}
      </div>
    </div>
  );
}
```

---

## Standard Components: shadcn/ui

### Setup

```bash
npx shadcn-ui@latest init
```

### Commonly Used Components

```tsx
// Example usage
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Preset save dialog
export function PresetSaveDialog({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Preset</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Preset name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <div className="flex gap-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSave(name, tags)}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Alternative Component Libraries (Not Recommended)

### Why Avoid Heavy Libraries?

| Library | Why Not Suitable |
|---------|------------------|
| **Material-UI** | Too heavy, not audio-focused, generic design |
| **Ant Design** | Corporate UI, not suitable for creative tools |
| **Chakra UI** | Good but generic, lacks audio-specific controls |
| **Mantine** | Similar to Chakra, not specialized |

**Problem**: None have knobs, rotary controls, or specialized music hardware UI. You'd still build custom controls.

---

## Tauri-Specific UI Components

### @tauri-controls/react

Native window controls for Tauri apps.

```bash
npm install @tauri-controls/react
```

```tsx
// src/components/TitleBar.tsx
import { WindowTitlebar } from '@tauri-controls/react';

export function AppTitleBar() {
  return (
    <WindowTitlebar className="bg-gray-900">
      <div className="flex items-center gap-2 px-4">
        <img src="/icon.png" className="w-6 h-6" />
        <span className="text-sm font-medium">Pedal Editor</span>
      </div>
    </WindowTitlebar>
  );
}
```

---

## Color Scheme Recommendations

### Dark Mode (Primary)

Music production apps typically use dark UIs to reduce eye strain.

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary dark background
        'app-bg': '#0f0f0f',
        'panel-bg': '#1a1a1a',
        'control-bg': '#2d2d2d',
        
        // Accents
        'accent-blue': '#3b82f6',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        
        // Text
        'text-primary': '#e5e5e5',
        'text-secondary': '#a3a3a3',
        'text-muted': '#525252',
      }
    }
  }
};
```

### Example Application

```tsx
// Dark theme with accent colors
<div className="bg-app-bg min-h-screen text-text-primary">
  <div className="bg-panel-bg p-6 rounded-lg">
    <Knob
      value={64}
      label="Wow"
      onChange={handleChange}
    />
  </div>
</div>
```

---

## Layout Recommendations

### Desktop Layout

```tsx
// src/App.tsx
export function App() {
  return (
    <div className="flex h-screen bg-app-bg">
      {/* Sidebar - Pedal & Preset Selection */}
      <aside className="w-64 bg-panel-bg border-r border-gray-800 p-4">
        <PedalSelector />
        <PresetBrowser />
      </aside>
      
      {/* Main Editor */}
      <main className="flex-1 p-6 overflow-auto">
        <PedalEditor />
      </main>
      
      {/* Right Panel - MIDI & Settings */}
      <aside className="w-64 bg-panel-bg border-l border-gray-800 p-4">
        <MidiConnection />
        <QuickActions />
      </aside>
    </div>
  );
}
```

### Responsive Considerations

- Desktop: 3-column layout
- Tablet: 2-column (collapsible sidebar)
- Mobile: Single column with tabs

---

## Animation & Feedback

### MIDI Activity Indicator

```tsx
// Show visual feedback when MIDI is sent
export function MidiActivityIndicator() {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const handleMidiSent = () => {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 100);
    };
    
    eventBus.on('midi:sent', handleMidiSent);
    return () => eventBus.off('midi:sent', handleMidiSent);
  }, []);
  
  return (
    <div className={`w-2 h-2 rounded-full transition-colors ${
      isActive ? 'bg-green-500' : 'bg-gray-700'
    }`} />
  );
}
```

### Loading States

```tsx
// Preset loading state
{isLoading ? (
  <div className="animate-pulse">
    <div className="h-24 bg-gray-800 rounded-lg" />
  </div>
) : (
  <Knob {...props} />
)}
```

---

## Accessibility

### Keyboard Controls

- Arrow keys for knob adjustment
- Tab navigation
- Enter to activate
- Escape to close dialogs

```tsx
// Keyboard-accessible knob
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    onChange(Math.min(value + 1, max));
  } else if (e.key === 'ArrowDown') {
    onChange(Math.max(value - 1, min));
  }
};

<div
  tabIndex={0}
  onKeyDown={handleKeyDown}
  role="slider"
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuenow={value}
  aria-label={label}
>
  {/* Knob UI */}
</div>
```

---

## Performance Optimization

### Throttle MIDI Updates

```typescript
import { throttle } from 'lodash-es';

const sendMidiThrottled = throttle((value: number) => {
  midi.sendCC(channel, cc, value);
}, 16); // ~60fps

const handleKnobChange = (value: number) => {
  setLocalValue(value);        // Update UI immediately
  sendMidiThrottled(value);    // Send MIDI throttled
};
```

### Virtualize Large Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function PresetList({ presets }: { presets: Preset[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: presets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <PresetCard
            key={virtualRow.key}
            preset={presets[virtualRow.index]}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Testing UI Components

### Storybook Setup

```bash
npx storybook@latest init
```

```tsx
// src/components/Knob.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Knob } from './Knob';

const meta: Meta<typeof Knob> = {
  title: 'Controls/Knob',
  component: Knob,
};

export default meta;
type Story = StoryObj<typeof Knob>;

export const Default: Story = {
  args: {
    value: 64,
    label: 'Wow',
    onChange: (value) => console.log(value),
  },
};

export const Small: Story = {
  args: {
    value: 32,
    label: 'Flutter',
    size: 'sm',
    onChange: (value) => console.log(value),
  },
};
```

---

## Recommendation Summary

### Build This Stack:

```
Foundation: React + TypeScript + Tailwind CSS
├── Standard UI: shadcn/ui (buttons, dialogs, forms)
├── Custom Controls: Knob, Slider, DIPSwitch (built from scratch)
└── Tauri Native: @tauri-controls/react (window controls)
```

### Why This Works:

- ✅ Full control over audio-specific UI
- ✅ Lightweight (no bloated component library)
- ✅ Tailwind makes custom controls easy
- ✅ shadcn/ui provides accessible standard components
- ✅ Matches music production app aesthetics

**Don't try to fit a generic UI library to audio controls. Build the specialized components you need.**

---

## Next Steps

1. Set up Tailwind CSS
2. Install shadcn/ui for standard components
3. Build Knob, Slider, DIPSwitch components
4. Create ParameterGroup layout component
5. Design preset browser UI
6. Add keyboard navigation
7. Test with real MIDI hardware

**Focus on getting one pedal's UI perfect. The pattern will repeat for other pedals.**
