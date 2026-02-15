import { useState } from 'react';
import { Save, Library } from 'lucide-react';
import { useChromaConsoleEditor } from '../../../hooks/pedals/chroma_console/useChromaConsoleEditor';
import { Knob, Toggle, TapButton, VerticalSelector } from '../../common';
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

export function ChromaConsoleEditor({ deviceName }: ChromaConsoleEditorProps) {
  const editor = useChromaConsoleEditor(deviceName);
  const { state, loadPreset, activePreset, isDirty, resetToPreset } = editor;
  
  // Preset Manager state
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Save to Library Dialog state
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);

  const handleUpdatePreset = async () => {
    if (!activePreset || !state) return;
    
    try {
      setUpdating(true);
      const { updatePreset, savePresetToBank, getBankState } = await import('@/lib/presets');
      
      await updatePreset({
        id: activePreset.id,
        parameters: state,
      });
      
      const bankState = await getBankState('ChromaConsole');
      const assignedBank = bankState.find(slot => slot.preset?.id === activePreset.id);
      
      if (assignedBank) {
        await savePresetToBank(deviceName, activePreset.id, assignedBank.bankNumber);
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

  return (
    <>
      <div className="space-y-6 select-none">
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
                {isDirty && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded transition-all duration-500 bg-accent-red/10 border border-accent-red/30 text-accent-red">
                    Modified
                  </span>
                )}
              </div>
              {isDirty && (
                <>
                  <button
                    onClick={handleUpdatePreset}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#10b981', color: '#ffffff' }}
                  >
                    <Save className="w-3 h-3" />
                    {updating ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => setLibraryDialogOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue transition-all"
                  >
                    <Library className="w-3 h-3" />
                    Save to Library
                  </button>
                  <button
                    onClick={resetToPreset}
                    className="px-3 py-1.5 text-xs font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-all duration-500"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Global Controls */}
        <div className="flex items-center gap-4 flex-wrap bg-card-bg border border-border-light rounded-lg p-3 shadow-sm">
          <Toggle
            label="Bypass"
            value={state.bypass_state === 'Bypass'}
            onChange={(v) => editor.setBypassState(v ? 'Bypass' : 'Engaged')}
            activeColor="green"
          />
          <div className="h-8 w-px bg-border-light" />
          <TapButton
            label="TAP Tempo"
            onTap={editor.tapTempo}
            variant="accent"
          />
          <div className="flex-1" />
          <TapButton
            label="Save Preset"
            onTap={() => setLibraryDialogOpen(true)}
            variant="accent"
          />
          <TapButton
            label="Preset Manager"
            onTap={() => setManagerOpen(true)}
            variant="accent"
          />
        </div>

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Column 1: Character (Red/Orange) */}
          <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.character}40` }}>
            {/* Knob Rows Container - Fixed height for alignment */}
            <div className="flex flex-col gap-4">
              {/* Knob Row 1 */}
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
              
              {/* Knob Row 2 */}
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

            {/* Bypass Button */}
            <div className="flex justify-center">
              <button
                onClick={() => editor.setCharacterBypass(!state.character_bypass)}
                className={`
                  px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
                  ${state.character_bypass 
                    ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
                    : 'text-white border-2 shadow-md'
                  }
                `}
                style={state.character_bypass ? {} : {
                  backgroundColor: COLUMN_COLORS.character,
                  borderColor: COLUMN_COLORS.character,
                }}
              >
                Character
              </button>
            </div>

            {/* Effect Selector */}
            <VerticalSelector
              label="Effect"
              value={state.character_module}
              options={CHARACTER_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
              onChange={(v) => editor.setCharacterModule(v as CharacterModule)}
              optionColors={EFFECT_COLOR_SEQUENCE}
            />
          </div>

          {/* Column 2: Movement (Yellow) */}
          <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.movement}40` }}>
            {/* Knob Rows Container - Fixed height for alignment */}
            <div className="flex flex-col gap-4">
              {/* Knob Row 1 */}
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
              
              {/* Knob Row 2 */}
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

            {/* Bypass Button */}
            <div className="flex justify-center">
              <button
                onClick={() => editor.setMovementBypass(!state.movement_bypass)}
                className={`
                  px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
                  ${state.movement_bypass 
                    ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
                    : 'text-white border-2 shadow-md'
                  }
                `}
                style={state.movement_bypass ? {} : {
                  backgroundColor: COLUMN_COLORS.movement,
                  borderColor: COLUMN_COLORS.movement,
                }}
              >
                Movement
              </button>
            </div>

            {/* Effect Selector */}
            <VerticalSelector
              label="Effect"
              value={state.movement_module}
              options={MOVEMENT_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
              onChange={(v) => editor.setMovementModule(v as MovementModule)}
              optionColors={EFFECT_COLOR_SEQUENCE}
            />
          </div>

          {/* Column 3: Diffusion (Green) */}
          <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.diffusion}40` }}>
            {/* Knob Rows Container - Fixed height for alignment */}
            <div className="flex flex-col gap-4">
              {/* Knob Row 1 */}
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
              
              {/* Knob Row 2 */}
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

            {/* Bypass Button */}
            <div className="flex justify-center">
              <button
                onClick={() => editor.setDiffusionBypass(!state.diffusion_bypass)}
                className={`
                  px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
                  ${state.diffusion_bypass 
                    ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
                    : 'text-white border-2 shadow-md'
                  }
                `}
                style={state.diffusion_bypass ? {} : {
                  backgroundColor: COLUMN_COLORS.diffusion,
                  borderColor: COLUMN_COLORS.diffusion,
                }}
              >
                Diffusion
              </button>
            </div>

            {/* Effect Selector */}
            <VerticalSelector
              label="Effect"
              value={state.diffusion_module}
              options={DIFFUSION_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
              onChange={(v) => editor.setDiffusionModule(v as DiffusionModule)}
              optionColors={EFFECT_COLOR_SEQUENCE}
            />
          </div>

          {/* Column 4: Texture (Light Blue) - Split into two cards */}
          <div className="flex flex-col gap-4">
            {/* Global Controls Card */}
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

            {/* Texture Effect Card */}
            <div className="flex flex-col gap-4 bg-card-bg border-2 rounded-lg p-4 shadow-sm" style={{ borderColor: `${COLUMN_COLORS.texture}40` }}>
              {/* Knob Row - Single row to match other columns' second row position */}
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

              {/* Bypass Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => editor.setTextureBypass(!state.texture_bypass)}
                  className={`
                    px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm
                    ${state.texture_bypass 
                      ? 'bg-gray-300 text-gray-600 border-2 border-gray-400' 
                      : 'text-white border-2 shadow-md'
                    }
                  `}
                  style={state.texture_bypass ? {} : {
                    backgroundColor: COLUMN_COLORS.texture,
                    borderColor: COLUMN_COLORS.texture,
                  }}
                >
                  Texture
                </button>
              </div>

              {/* Effect Selector */}
              <VerticalSelector
                label="Effect"
                value={state.texture_module}
                options={TEXTURE_MODULES.filter(m => m.id !== 'Off').map(m => ({ value: m.id, label: m.name }))}
                onChange={(v) => editor.setTextureModule(v as TextureModule)}
                optionColors={EFFECT_COLOR_SEQUENCE}
              />
            </div>
          </div>
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
