import { useState, useMemo } from 'react';
import { Save, GripVertical } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMicrocosmEditor } from '../../../hooks/pedals/microcosm/useMicrocosmEditor';
import { Knob, Toggle, TapButton, GridSelector } from '../../common';
import { ParameterCard } from '../../common/ParameterCard';
import { EffectSelector } from './EffectSelector';
import { PresetManager } from '../../presets';
import type { SubdivisionValue, PlaybackDirection, LooperRouting } from '../../../lib/midi/pedals/microcosm';

interface MicrocosmEditorProps {
  deviceName: string;
}

const PARAMETER_CARD_ORDER_KEY = 'microcosm-parameter-card-order';

type ParameterCardId = 'time' | 'effect-sauce' | 'modulation' | 'filter' | 'output' | 'reverb';

const DEFAULT_CARD_ORDER: ParameterCardId[] = ['time', 'effect-sauce', 'modulation', 'filter', 'output', 'reverb'];

const subdivisionOptions = [
  { value: 'QuarterNote', label: '1/4' },
  { value: 'HalfNote', label: '1/2' },
  { value: 'Tap', label: 'TAP' },
  { value: 'Double', label: '2x' },
  { value: 'Quadruple', label: '4x' },
  { value: 'Octuple', label: '8x' },
];

const directionOptions = [
  { value: 'Forward', label: 'Forward' },
  { value: 'Reverse', label: 'Reverse' },
];

const routingOptions = [
  { value: 'PostFX', label: 'Post FX' },
  { value: 'PreFX', label: 'Pre FX' },
];

interface SortableParameterCardProps {
  id: ParameterCardId;
  title: string;
  children: React.ReactNode;
}

function SortableParameterCard({ id, title, children }: SortableParameterCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <div className="relative h-full">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-10 p-1 cursor-grab active:cursor-grabbing hover:bg-black/5 rounded transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5 text-text-muted" />
        </div>
        <ParameterCard title={title} className="h-full">
          {children}
        </ParameterCard>
      </div>
    </div>
  );
}

export function MicrocosmEditor({ deviceName }: MicrocosmEditorProps) {
  const editor = useMicrocosmEditor(deviceName);
  const { state, loadPreset, activePreset, isDirty, resetToPreset } = editor;
  
  // Preset Manager state
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Parameter card order state
  const [cardOrder, setCardOrder] = useState<ParameterCardId[]>(() => {
    try {
      const saved = localStorage.getItem(PARAMETER_CARD_ORDER_KEY);
      if (saved) {
        const parsedOrder = JSON.parse(saved) as ParameterCardId[];
        // Validate that saved order contains all cards
        const allCardsPresent = DEFAULT_CARD_ORDER.every(cardId => 
          parsedOrder.includes(cardId)
        );
        if (allCardsPresent && parsedOrder.length === DEFAULT_CARD_ORDER.length) {
          return parsedOrder;
        }
      }
    } catch (e) {
      console.warn('Failed to load parameter card order from localStorage:', e);
    }
    return DEFAULT_CARD_ORDER;
  });

  // Set up sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cardOrder.indexOf(active.id as ParameterCardId);
      const newIndex = cardOrder.indexOf(over.id as ParameterCardId);
      
      const newOrder = arrayMove(cardOrder, oldIndex, newIndex);
      setCardOrder(newOrder);
      
      // Save to localStorage
      try {
        localStorage.setItem(PARAMETER_CARD_ORDER_KEY, JSON.stringify(newOrder));
      } catch (e) {
        console.warn('Failed to save parameter card order to localStorage:', e);
      }
    }
  };

  const handleUpdatePreset = async () => {
    if (!activePreset || !state) return;
    
    try {
      setUpdating(true);
      const { updatePreset, savePresetToBank, getBankState } = await import('@/lib/presets');
      
      // Update the preset with current state parameters
      await updatePreset({
        id: activePreset.id,
        parameters: state,
      });
      
      // Find which bank this preset is assigned to and re-save to pedal
      const bankState = await getBankState('Microcosm');
      const assignedBank = bankState.find(slot => slot.preset?.id === activePreset.id);
      
      if (assignedBank) {
        // Re-save to the same bank with updated parameters
        await savePresetToBank(deviceName, activePreset.id, assignedBank.bankNumber);
      }
      
      // Mark as clean (same preset, just updated)
      await loadPreset(state, activePreset.id, activePreset.name);
      
      console.log('✅ Updated preset:', activePreset.name);
    } catch (error) {
      console.error('❌ Failed to update preset:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Render function for each parameter card
  const renderParameterCard = (cardId: ParameterCardId) => {
    if (!state) return null;

    switch (cardId) {
      case 'time':
        return (
          <SortableParameterCard key="time" id="time" title="Time / Tempo">
            <GridSelector
              label="Subdiv"
              value={state.subdivision}
              options={subdivisionOptions}
              onChange={(v) => editor.setSubdivision(v as SubdivisionValue)}
              columns={3}
            />
            <Knob
              label="Time"
              value={state.time}
              onChange={editor.setTime}
            />
            <Toggle
              label="Hold Sampler"
              value={state.hold_sampler}
              onChange={editor.setHoldSampler}
            />
          </SortableParameterCard>
        );

      case 'effect-sauce':
        return (
          <SortableParameterCard key="effect-sauce" id="effect-sauce" title="Effect Sauce">
            <Knob
              label="Activity"
              value={state.activity}
              onChange={editor.setActivity}
            />
            <Knob
              label="Repeats"
              value={state.repeats}
              onChange={editor.setRepeats}
            />
          </SortableParameterCard>
        );

      case 'modulation':
        return (
          <SortableParameterCard key="modulation" id="modulation" title="Modulation">
            {/* Shape Type Indicators - Vertical Stack */}
            <div className="flex flex-col gap-1.5">
              {[
                { shape: 'Square', label: 'Square', color1: 'rgba(236, 72, 153, 0.15)', color2: 'rgba(236, 72, 153, 0.08)', border: 'rgba(236, 72, 153, 0.4)' },
                { shape: 'Ramp', label: 'Ramp', color1: 'rgba(251, 146, 60, 0.15)', color2: 'rgba(251, 146, 60, 0.08)', border: 'rgba(251, 146, 60, 0.4)' },
                { shape: 'Triangle', label: 'Triangle', color1: 'rgba(34, 197, 94, 0.15)', color2: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.4)' },
                { shape: 'Saw', label: 'Saw', color1: 'rgba(168, 85, 247, 0.15)', color2: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.4)' },
              ].map(({ shape, label, color1, color2, border }) => {
                const isActive = state.shape === shape;
                return (
                  <div
                    key={label}
                    className={`px-2 py-1 rounded text-[10px] font-semibold text-center border transition-all duration-700 ${isActive ? 'animate-gradient-wave' : 'opacity-50'}`}
                    style={isActive ? {
                      backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color1} 100%)`,
                      borderColor: border,
                      backgroundSize: '200% 100%',
                      color: border.replace('0.4', '1'),
                    } : {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      color: '#9ca3af',
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
            <Knob
              label="Shape"
              value={
                state.shape === 'Square' ? 0 :
                state.shape === 'Ramp' ? 42 :
                state.shape === 'Triangle' ? 85 : 127
              }
              onChange={(v) => {
                const shape = 
                  v < 32 ? 'Square' :
                  v < 64 ? 'Ramp' :
                  v < 96 ? 'Triangle' : 'Saw';
                editor.setShape(shape);
              }}
            />
            <Knob
              label="Mod Freq."
              value={state.frequency}
              onChange={editor.setFrequency}
            />
            <Knob
              label="Mod Depth"
              value={state.depth}
              onChange={editor.setDepth}
            />
          </SortableParameterCard>
        );

      case 'filter':
        return (
          <SortableParameterCard key="filter" id="filter" title="Filter">
            <Knob
              label="Filter"
              value={state.cutoff}
              onChange={editor.setCutoff}
            />
            <Knob
              label="Filter Resonance"
              value={state.resonance}
              onChange={editor.setResonance}
            />
          </SortableParameterCard>
        );

      case 'output':
        return (
          <SortableParameterCard key="output" id="output" title="Output">
            <Knob
              label="Mix"
              value={state.mix}
              onChange={editor.setMix}
            />
            <Knob
              label="Effect Volume"
              value={state.volume}
              onChange={editor.setVolume}
            />
          </SortableParameterCard>
        );

      case 'reverb':
        return (
          <SortableParameterCard key="reverb" id="reverb" title="Reverb">
            <Knob
              label="Space"
              value={state.space}
              onChange={editor.setSpace}
            />
            <Knob
              label="Reverb Time"
              value={state.reverb_time}
              onChange={editor.setReverbTime}
            />
            {/* Reverb Type Indicators - Vertical Stack */}
            <div className="flex flex-col gap-1.5">
              {[
                { range: [0, 31], label: 'Bright', color1: 'rgba(14, 165, 233, 0.15)', color2: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.4)' },
                { range: [32, 63], label: 'Dark', color1: 'rgba(99, 102, 241, 0.15)', color2: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.4)' },
                { range: [64, 95], label: 'Hall', color1: 'rgba(5, 150, 105, 0.15)', color2: 'rgba(5, 150, 105, 0.08)', border: 'rgba(5, 150, 105, 0.4)' },
                { range: [96, 127], label: 'Ambient', color1: 'rgba(139, 92, 246, 0.15)', color2: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.4)' },
              ].map(({ range, label, color1, color2, border }) => {
                const isActive = state.reverb_time >= range[0] && state.reverb_time <= range[1];
                return (
                  <div
                    key={label}
                    className={`px-2 py-1 rounded text-[10px] font-semibold text-center border transition-all duration-700 ${isActive ? 'animate-gradient-wave' : 'opacity-50'}`}
                    style={isActive ? {
                      backgroundImage: `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color1} 100%)`,
                      borderColor: border,
                      backgroundSize: '200% 100%',
                      color: border.replace('0.4', '1'),
                    } : {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      color: '#9ca3af',
                    }}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </SortableParameterCard>
        );

      default:
        return null;
    }
  };

  if (editor.isLoading || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-secondary">Loading parameters...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 select-none">
        {/* Active Preset Indicator */}
        {activePreset && (
          <div 
            className={`rounded-lg p-3 shadow-sm border transition-all duration-700 ${isDirty ? 'animate-gradient-wave' : ''}`}
            style={{ 
              backgroundImage: isDirty 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(251, 146, 60, 0.08) 50%, rgba(239, 68, 68, 0.12) 100%)'
                : 'linear-gradient(135deg, rgba(163, 230, 53, 0.12) 0%, rgba(132, 204, 22, 0.08) 100%)',
              borderColor: isDirty 
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(163, 230, 53, 0.3)',
              backgroundSize: isDirty ? '200% 100%' : '100% 100%',
            }}
          >
            <div className="flex items-center gap-3 min-h-[32px]">
              <div className="flex-1 flex items-center gap-2 min-h-[24px]">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Active Preset:
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {activePreset.name}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded transition-all duration-500 ${isDirty ? 'opacity-100 bg-accent-red/10 border border-accent-red/30 text-accent-red' : 'opacity-0 bg-warning/10 border border-warning/30 text-warning'}`}>
                  Modified
                </span>
              </div>
              <button
                onClick={handleUpdatePreset}
                disabled={!isDirty || updating}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all disabled:opacity-50 ${isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                style={{ backgroundColor: '#10b981', color: '#ffffff' }}
              >
                <Save className="w-3 h-3" />
                {updating ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={resetToPreset}
                disabled={!isDirty}
                className={`px-3 py-1.5 text-xs font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-all duration-500 ${isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Preset & Global Controls */}
      <div className="flex items-center gap-4 flex-wrap bg-card-bg border border-border-light rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Toggle
            label="Bypass"
            value={state.bypass}
            onChange={editor.setBypass}
            activeColor="green"
          />
        </div>
        <div className="h-8 w-px bg-border-light" />
        <TapButton
          label="TAP Tempo"
          onTap={editor.tapTempo}
          variant="accent"
        />
        <Toggle
          label="Reverse Effect"
          value={state.reverse_effect}
          onChange={editor.setReverseEffect}
          activeColor="red"
        />
        <div className="flex-1" />
        <TapButton
          label="Preset Manager"
          onTap={() => setManagerOpen(true)}
          variant="accent"
        />
      </div>

      {/* Effect Type Selection */}
      <EffectSelector
        currentEffect={state.current_effect}
        currentVariation={state.current_variation}
        onSelectEffect={editor.setEffect}
      />

      {/* Main Parameter Grid with Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleCardDragEnd}
      >
        <SortableContext
          items={cardOrder}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr items-stretch">
            {cardOrder.map(renderParameterCard)}
          </div>
        </SortableContext>
      </DndContext>

      {/* Phrase Looper - Full Width */}
      <ParameterCard title="Phrase Looper" className="w-full">
        <div className="w-full space-y-4">
          {/* Looper Transport */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <TapButton label="Record" onTap={editor.looperRecord} variant="danger" />
            <TapButton label="Play" onTap={editor.looperPlay} variant="accent" />
            <TapButton label="Overdub" onTap={editor.looperOverdub} variant="accent" />
            <TapButton label="Stop" onTap={editor.looperStop} />
            <TapButton label="Undo" onTap={editor.looperUndo} />
            <TapButton label="Erase" onTap={editor.looperErase} variant="danger" />
          </div>

          <div className="h-px bg-border-light" />

          {/* Looper Parameters */}
          <div className="flex flex-wrap gap-4 justify-center items-start">
            <Toggle
              label="Enable"
              value={state.looper_enabled}
              onChange={editor.setLooperEnabled}
            />
            <Knob
              label="Loop Level"
              value={state.loop_level}
              onChange={editor.setLoopLevel}
            />
            <Knob
              label="Looper Playback Speed"
              value={state.looper_speed}
              onChange={editor.setLooperSpeed}
            />
            <GridSelector
              label="Speed (Stepped)"
              value={state.looper_speed_stepped}
              options={subdivisionOptions}
              onChange={(v) => editor.setLooperSpeedStepped(v as SubdivisionValue)}
              columns={3}
            />
            <Knob
              label="Looper Fade Time"
              value={state.fade_time}
              onChange={editor.setFadeTime}
            />
            <GridSelector
              label="Direction"
              value={state.playback_direction}
              options={directionOptions}
              onChange={(v) => editor.setPlaybackDirection(v as PlaybackDirection)}
              columns={2}
            />
            <GridSelector
              label="Routing"
              value={state.routing}
              options={routingOptions}
              onChange={(v) => editor.setRouting(v as LooperRouting)}
              columns={2}
            />
          </div>

          <div className="h-px bg-border-light" />

          {/* Looper Modes */}
          <div className="flex flex-wrap gap-6 justify-center">
            <Toggle
              label="Looper Only"
              value={state.looper_only}
              onChange={editor.setLooperOnly}
            />
            <Toggle
              label="Burst"
              value={state.burst_mode}
              onChange={editor.setBurstMode}
            />
            <Toggle
              label="Quantize"
              value={state.quantized}
              onChange={editor.setQuantized}
            />
          </div>
        </div>
      </ParameterCard>
      </div>

      {/* Preset Manager */}
      <PresetManager
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="Microcosm"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={loadPreset}
        onPresetSaved={(presetId, presetName) => {
          // Set the newly saved preset as active (clean state)
          if (editor.state) {
            editor.loadPreset(editor.state, presetId, presetName);
          }
        }}
        onPresetCleared={() => {
          // Clear the active preset when deleted
          editor.clearActivePreset();
        }}
      />
    </>
  );
}
