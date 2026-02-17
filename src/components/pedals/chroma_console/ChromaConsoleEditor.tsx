import { useState } from 'react';
import { Save, Library, GripVertical, ArrowRight, RotateCcw } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useChromaConsoleEditor } from '../../../hooks/pedals/chroma_console/useChromaConsoleEditor';
import { Knob, Toggle, TapButton, VerticalSelector, PedalUtilityCard, UtilityDivider, PresetManagementCard } from '../../common';
import { PresetManager, SaveToLibraryDialog } from '../../presets';
import {
  CHARACTER_MODULES,
  MOVEMENT_MODULES,
  DIFFUSION_MODULES,
  TEXTURE_MODULES,
  type CharacterModule,
  type MovementModule,
  type DiffusionModule,
  type TextureModule,
  type ModuleSlot,
} from '../../../lib/midi/pedals/chroma_console';

interface ChromaConsoleEditorProps {
  deviceName: string;
}

// Color scheme for each column
const COLUMN_COLORS = {
  character: '#ef4444',   // Red/Orange
  movement: '#eab308',    // Yellow
  diffusion: '#22c55e',   // Green
  texture: '#38bdf8',     // Light Blue
};

// Effect selector color sequence: red, yellow, green, blue, purple
const EFFECT_COLOR_SEQUENCE = ['#ef4444', '#eab308', '#22c55e', '#38bdf8', '#a855f7'];

interface SortableColumnProps {
  id: ModuleSlot;
  children: React.ReactNode;
}

function SortableColumn({ id, children }: SortableColumnProps) {
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
          title="Drag to reorder signal path"
        >
          <GripVertical className="w-3.5 h-3.5 text-text-muted" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function ChromaConsoleEditor({ deviceName }: ChromaConsoleEditorProps) {
  const editor = useChromaConsoleEditor(deviceName);
  const { state, loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault } = editor;
  
  // Preset Manager state
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Save to Library Dialog state
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);

  // Set up drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const handleColumnDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && state) {
      const currentPath = state.signal_path || ['character', 'movement', 'diffusion', 'texture'];
      const oldIndex = currentPath.indexOf(active.id as ModuleSlot);
      const newIndex = currentPath.indexOf(over.id as ModuleSlot);
      
      const newPath = arrayMove(currentPath, oldIndex, newIndex);
      editor.setSignalPath(newPath);
    }
  };

  const handleUpdatePreset = async () => {
    if (!activePreset || !state) return;
    
    try {
      setUpdating(true);
      const { updatePreset, savePresetToBank, getBankState } = await import('@/lib/presets');
      
      await updatePreset({
        id: activePreset.id,
        parameters: state,
      });
      
      // Find ALL banks this preset is assigned to and re-save to each
      const bankState = await getBankState('ChromaConsole');
      const assignedBanks = bankState.filter(slot => slot.preset?.id === activePreset.id);
      
      if (assignedBanks.length > 0) {
        console.log(`📝 Re-saving preset to ${assignedBanks.length} pedal bank(s)...`);
        // Re-save to all assigned banks with updated parameters
        for (const bank of assignedBanks) {
          await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
        }
        console.log('✅ Updated preset on pedal');
      }
      
      await loadPreset(state, activePreset.id, activePreset.name);
      
      console.log('✅ Updated preset:', activePreset.name);
    } catch (error) {
      console.error('❌ Failed to update preset:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleLibrarySaved = async (presetId: string, presetName: string) => {
    console.log('✅ Saved to library:', presetName);
    if (state) {
      await loadPreset(state, presetId, presetName);
    }
  };

  if (editor.isLoading || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-secondary">Loading parameters...</div>
      </div>
    );
  }

  // Ensure signal_path exists (fallback for states loaded from pedal)
  const signalPath = state.signal_path || ['character', 'movement', 'diffusion', 'texture'];
  const defaultSignalPath: ModuleSlot[] = ['character', 'movement', 'diffusion', 'texture'];
  const isDefaultOrder = JSON.stringify(signalPath) === JSON.stringify(defaultSignalPath);

  // Column render functions
  const renderCharacterColumn = () => (
    <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.character}40` }}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-4">
          <Knob
            label="Tilt"
            value={state.tilt}
            onChange={editor.setTilt}
            color={COLUMN_COLORS.character}
            size={72}
          />
          <Knob
            label="Sensitivity"
            value={state.sensitivity}
            onChange={editor.setSensitivity}
            color={COLUMN_COLORS.character}
            size={72}
          />
        </div>
        <div className="flex justify-center gap-4">
          <Knob
            label="Amount"
            value={state.amount_character}
            onChange={editor.setAmountCharacter}
            color={COLUMN_COLORS.character}
            size={72}
          />
          <Knob
            label="Effect Vol"
            value={state.effect_vol_character}
            onChange={editor.setEffectVolCharacter}
            color={COLUMN_COLORS.character}
            size={72}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <div
          className={`
            px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
            ${state.character_bypass 
              ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
              : 'text-white border-2 shadow-md animate-breathe'
            }
          `}
          style={state.character_bypass ? {} : {
            backgroundColor: COLUMN_COLORS.character,
            borderColor: COLUMN_COLORS.character,
          }}
        >
          Character
        </div>
      </div>
      <VerticalSelector
        label="Effect"
        value={state.character_module}
        options={CHARACTER_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
        onChange={(v) => {
          if (v === state.character_module) {
            editor.setCharacterModule('Off' as CharacterModule);
          } else {
            editor.setCharacterModule(v as CharacterModule);
          }
        }}
        optionColors={EFFECT_COLOR_SEQUENCE}
      />
    </div>
  );

  const renderMovementColumn = () => (
    <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.movement}40` }}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-4">
          <Knob
            label="Rate"
            value={state.rate}
            onChange={editor.setRate}
            color={COLUMN_COLORS.movement}
            size={72}
          />
          <Knob
            label="Drift"
            value={state.drift_movement}
            onChange={editor.setDriftMovement}
            color={COLUMN_COLORS.movement}
            size={72}
          />
        </div>
        <div className="flex justify-center gap-4">
          <Knob
            label="Amount"
            value={state.amount_movement}
            onChange={editor.setAmountMovement}
            color={COLUMN_COLORS.movement}
            size={72}
          />
          <Knob
            label="Effect Vol"
            value={state.effect_vol_movement}
            onChange={editor.setEffectVolMovement}
            color={COLUMN_COLORS.movement}
            size={72}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <div
          className={`
            px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
            ${state.movement_bypass 
              ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
              : 'text-white border-2 shadow-md animate-breathe'
            }
          `}
          style={state.movement_bypass ? {} : {
            backgroundColor: COLUMN_COLORS.movement,
            borderColor: COLUMN_COLORS.movement,
          }}
        >
          Movement
        </div>
      </div>
      <VerticalSelector
        label="Effect"
        value={state.movement_module}
        options={MOVEMENT_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
        onChange={(v) => {
          if (v === state.movement_module) {
            editor.setMovementModule('Off' as MovementModule);
          } else {
            editor.setMovementModule(v as MovementModule);
          }
        }}
        optionColors={EFFECT_COLOR_SEQUENCE}
      />
    </div>
  );

  const renderDiffusionColumn = () => (
    <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.diffusion}40` }}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-4">
          <Knob
            label="Time"
            value={state.time}
            onChange={editor.setTime}
            color={COLUMN_COLORS.diffusion}
            size={72}
          />
          <Knob
            label="Drift"
            value={state.drift_diffusion}
            onChange={editor.setDriftDiffusion}
            color={COLUMN_COLORS.diffusion}
            size={72}
          />
        </div>
        <div className="flex justify-center gap-4">
          <Knob
            label="Amount"
            value={state.amount_diffusion}
            onChange={editor.setAmountDiffusion}
            color={COLUMN_COLORS.diffusion}
            size={72}
          />
          <Knob
            label="Effect Vol"
            value={state.effect_vol_diffusion}
            onChange={editor.setEffectVolDiffusion}
            color={COLUMN_COLORS.diffusion}
            size={72}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <div
          className={`
            px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
            ${state.diffusion_bypass 
              ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
              : 'text-white border-2 shadow-md animate-breathe'
            }
          `}
          style={state.diffusion_bypass ? {} : {
            backgroundColor: COLUMN_COLORS.diffusion,
            borderColor: COLUMN_COLORS.diffusion,
          }}
        >
          Diffusion
        </div>
      </div>
      <VerticalSelector
        label="Effect"
        value={state.diffusion_module}
        options={DIFFUSION_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
        onChange={(v) => {
          if (v === state.diffusion_module) {
            editor.setDiffusionModule('Off' as DiffusionModule);
          } else {
            editor.setDiffusionModule(v as DiffusionModule);
          }
        }}
        optionColors={EFFECT_COLOR_SEQUENCE}
      />
    </div>
  );

  const renderTextureColumn = () => (
    <div className="flex flex-col gap-4">
      <div className="bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.texture}40` }}>
        <div className="flex justify-center gap-4">
          <Knob
            label="Mix"
            value={state.mix}
            onChange={editor.setMix}
            color={COLUMN_COLORS.texture}
            size={72}
          />
          <Knob
            label="Output Level"
            value={state.output_level}
            onChange={editor.setOutputLevel}
            color={COLUMN_COLORS.texture}
            size={72}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.texture}40` }}>
        <div className="flex justify-center gap-4">
          <Knob
            label="Amount"
            value={state.amount_texture}
            onChange={editor.setAmountTexture}
            color={COLUMN_COLORS.texture}
            size={72}
          />
          <Knob
            label="Effect Vol"
            value={state.effect_vol_texture}
            onChange={editor.setEffectVolTexture}
            color={COLUMN_COLORS.texture}
            size={72}
          />
        </div>
        <div className="flex justify-center">
          <div
            className={`
              px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
              ${state.texture_bypass 
                ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
                : 'text-white border-2 shadow-md animate-breathe'
              }
            `}
            style={state.texture_bypass ? {} : {
              backgroundColor: COLUMN_COLORS.texture,
              borderColor: COLUMN_COLORS.texture,
            }}
          >
            Texture
          </div>
        </div>
        <VerticalSelector
          label="Effect"
          value={state.texture_module}
          options={TEXTURE_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
          onChange={(v) => {
            if (v === state.texture_module) {
              editor.setTextureModule('Off' as TextureModule);
            } else {
              editor.setTextureModule(v as TextureModule);
            }
          }}
          optionColors={EFFECT_COLOR_SEQUENCE}
        />
      </div>
    </div>
  );

  const columnMap: Record<ModuleSlot, () => JSX.Element> = {
    character: renderCharacterColumn,
    movement: renderMovementColumn,
    diffusion: renderDiffusionColumn,
    texture: renderTextureColumn,
  };

  return (
    <>
      {/* Fixed Preset Manager Button - Top Right */}
      <button
        onClick={() => setManagerOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-card-bg hover:bg-control-hover rounded-md border border-control-border transition-colors shadow-lg"
        title="Open Preset Manager"
        aria-label="Open Preset Manager"
      >
        <Library className="w-5 h-5 text-text-primary" />
      </button>

      <div className="space-y-6 select-none">
        {/* Control Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pedal Utilities */}
          <PedalUtilityCard>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Toggle
                  label="Bypass"
                  value={state.bypass_state === 'Bypass'}
                  onChange={(v) => editor.setBypassState(v ? 'Bypass' : 'Engaged')}
                  activeColor="green"
                />
                <UtilityDivider />
                <TapButton
                  label="TAP Tempo"
                  onTap={editor.tapTempo}
                  variant="accent"
                />
              </div>
              {!isDefaultOrder && (
                <button
                  onClick={() => editor.setSignalPath(defaultSignalPath)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-card-bg text-text-primary hover:bg-control-hover border border-control-border transition-all"
                  title="Reset signal path to default order"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Signal Path
                </button>
              )}
            </div>
          </PedalUtilityCard>

          {/* Preset Management */}
          <PresetManagementCard
            activePreset={activePreset ? { name: activePreset.name, isDirty } : null}
          >
            <div className="grid grid-cols-2 gap-2 w-full">
              {activePreset ? (
                // Preset is active (modified or unmodified)
                isDirty ? (
                  // Modified preset - show Update, Save to Library, and Reset buttons
                  <>
                    <button
                      onClick={handleUpdatePreset}
                      disabled={updating}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all disabled:opacity-50"
                      style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                    >
                      <Save className="w-3 h-3" />
                      {updating ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={() => setLibraryDialogOpen(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue transition-all"
                    >
                      <Library className="w-3 h-3" />
                      Save to Library
                    </button>
                    <button
                      onClick={resetToPreset}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Preset
                    </button>
                    <button
                      onClick={resetToPedalDefault}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Pedal Default
                    </button>
                  </>
                ) : (
                  // Unmodified preset - only show Pedal Default
                  <button
                    onClick={resetToPedalDefault}
                    className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Pedal Default
                  </button>
                )
              ) : (
                // No preset active - show Save Preset button
                <button
                  onClick={() => setLibraryDialogOpen(true)}
                  className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue transition-all"
                >
                  <Library className="w-3 h-3" />
                  Save Preset
                </button>
              )}
            </div>
          </PresetManagementCard>
        </div>

        {/* 4-Column Layout with Drag-and-Drop Signal Path */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleColumnDragEnd}
        >
          <SortableContext
            items={signalPath}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {signalPath.map((slotId, index) => (
                <div key={slotId} className="relative">
                  <SortableColumn id={slotId}>
                    {columnMap[slotId]()}
                  </SortableColumn>
                  {/* Arrow indicator between columns (not after last) */}
                  {index < signalPath.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-[24px] transform -translate-y-1/2 z-20">
                      <ArrowRight className="w-6 h-6 text-text-muted opacity-50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {/* Signal Path Info */}
        <div className="text-center">
          <p className="text-xs text-text-muted">
            Drag columns to represent a reordered signal path (visual only, you must do this manually on the pedal)
          </p>
        </div>
      </div>

      {/* Preset Manager */}
      <PresetManager
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="ChromaConsole"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={loadPreset as any}
        onPresetSaved={(presetId, presetName) => {
          if (editor.state) {
            editor.loadPreset(editor.state, presetId, presetName);
          }
        }}
        onPresetCleared={() => {
          editor.clearActivePreset();
        }}
      />

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="ChromaConsole"
        currentState={state}
        onSaved={handleLibrarySaved}
      />
    </>
  );
}
