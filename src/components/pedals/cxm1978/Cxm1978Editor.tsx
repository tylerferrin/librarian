// Chase Bliss / Meris CXM 1978 Automatone Editor Component

import { useState } from 'react';
import { useCxm1978Editor } from '@/hooks/pedals/cxm1978/useCxm1978Editor';
import { VerticalSlider } from '@/components/common/VerticalSlider';
import { VerticalSelector } from '@/components/common/VerticalSelector';
import { Toggle } from '@/components/common/Toggle';
import { PedalUtilityCard } from '@/components/common/PedalUtilityCard';
import { PresetManagementCard } from '@/components/common/PresetManagementCard';
import { SaveToLibraryDialog } from '@/components/presets/SaveToLibraryDialog';
import { PresetDrawer } from '@/components/presets/PresetDrawer';
import { Save, Library, RotateCcw } from 'lucide-react';
import type { Cxm1978State, Jump, ReverbType, Diffusion, TankMod, Clock } from '@/lib/midi/pedals/cxm1978';

interface Cxm1978EditorProps {
  deviceName: string;
}

export function Cxm1978Editor({ deviceName }: Cxm1978EditorProps) {
  const {
    state,
    isLoading,
    error,
    setBass,
    setMids,
    setCross,
    setTreble,
    setMix,
    setPreDly,
    setJump,
    setReverbType,
    setDiffusion,
    setTankMod,
    setClock,
    setBypass,
    loadPreset,
    activePreset,
    isDirty,
    resetToPreset,
    resetToPedalDefault,
    clearActivePreset,
  } = useCxm1978Editor(deviceName);

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading CXM 1978...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">No state available</div>
      </div>
    );
  }

  const handleLibrarySaved = async (presetId: string, presetName: string) => {
    if (state) {
      await loadPreset(state, presetId, presetName);
    }
  };

  const handleUpdatePreset = async () => {
    if (!activePreset || !state) return;
    try {
      setUpdating(true);
      const { updatePreset, savePresetToBank, getBankState } = await import('@/lib/presets');
      await updatePreset({ id: activePreset.id, parameters: state });
      const bankState = await getBankState('Cxm1978');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (
    presetState: Cxm1978State,
    presetId?: string,
    presetName?: string,
    skipMidiSend?: boolean,
  ) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  // Jump options
  const jumpOptions = [
    { value: 'Off', label: 'OFF' },
    { value: 'Zero', label: '0' },
    { value: 'Five', label: '5' },
  ];

  // Reverb Type options
  const reverbTypeOptions = [
    { value: 'Room', label: 'ROOM' },
    { value: 'Plate', label: 'PLATE' },
    { value: 'Hall', label: 'HALL' },
  ];

  // Diffusion options
  const diffusionOptions = [
    { value: 'Low', label: 'LOW' },
    { value: 'Med', label: 'MED' },
    { value: 'High', label: 'HIGH' },
  ];

  // Tank Mod options
  const tankModOptions = [
    { value: 'Low', label: 'LOW' },
    { value: 'Med', label: 'MED' },
    { value: 'High', label: 'HIGH' },
  ];

  // Clock options
  const clockOptions = [
    { value: 'HiFi', label: 'HIFI' },
    { value: 'Standard', label: 'STD' },
    { value: 'LoFi', label: 'LOFI' },
  ];

  // Slider track color (blue-grey for reverb)
  const sliderColor = '#6b7280';
  // Arcade button option colors: first = grey, second = blue, third = deep blue
  const selectorOptionColors = ['#6b7280', '#3b82f6', '#1d4ed8'];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 to-slate-800">
      {/* Fixed Preset Manager Button */}
      <button
        onClick={() => setManagerOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-card-bg hover:bg-control-hover rounded-md border border-control-border transition-colors shadow-lg"
        title="Open Preset Manager"
        aria-label="Open Preset Manager"
      >
        <Library className="w-5 h-5 text-text-primary" />
      </button>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss / Meris CXM 1978</h1>
          {activePreset && (
            <div className="text-sm">
              <span className="text-gray-400">Active: </span>
              <span className="text-white font-semibold">{activePreset.name}</span>
              {isDirty && <span className="ml-2 text-yellow-400">●</span>}
            </div>
          )}
        </div>

        {/* Utility Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <PedalUtilityCard>
            <Toggle
              label="Effect"
              value={!state.bypass}
              onChange={(engaged) => setBypass(!engaged)}
              activeColor="green"
            />
          </PedalUtilityCard>
          <PresetManagementCard
            activePreset={activePreset ? { name: activePreset.name, isDirty } : null}
          >
            <div className="grid grid-cols-2 gap-2 w-full">
              {activePreset ? (
                isDirty ? (
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
                      onClick={() => { resetToPedalDefault(); clearActivePreset(); }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-all"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Pedal Default
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { resetToPedalDefault(); clearActivePreset(); }}
                    className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Pedal Default
                  </button>
                )
              ) : (
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

        {/* Pedal-Style Interface */}
        <div className="relative">
          {/* Pedal Body — styled like the actual hardware */}
          <div
            className="relative rounded-xl p-6 shadow-xl border-4"
            style={{
              background: 'linear-gradient(135deg, #f0f4f8 0%, #dce6ef 100%)',
              borderColor: '#a8bfcf',
            }}
          >
            {/* Wood grain effect on sides */}
            <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-amber-200/60 to-amber-300/60 rounded-l-lg" />
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-amber-200/60 to-amber-300/60 rounded-r-lg" />

            {/* Faders Section */}
            <div className="mb-6">
              <div className="flex justify-center items-end gap-8">
                <VerticalSlider
                  label="BASS"
                  value={state.bass}
                  onChange={setBass}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="MIDS"
                  value={state.mids}
                  onChange={setMids}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="CROSS"
                  value={state.cross}
                  onChange={setCross}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="TREBLE"
                  value={state.treble}
                  onChange={setTreble}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="MIX"
                  value={state.mix}
                  onChange={setMix}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="PRE-DLY"
                  value={state.pre_dly}
                  onChange={setPreDly}
                  height={280}
                  color={sliderColor}
                />
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-slate-400/60 mb-5" />

            {/* Arcade Buttons Section */}
            <div className="flex justify-center items-start gap-5">
              <VerticalSelector
                label="JUMP"
                value={state.jump}
                options={jumpOptions}
                onChange={(value) => setJump(value as Jump)}
                optionColors={selectorOptionColors}
              />
              <VerticalSelector
                label="TYPE"
                value={state.reverb_type}
                options={reverbTypeOptions}
                onChange={(value) => setReverbType(value as ReverbType)}
                optionColors={selectorOptionColors}
              />
              <VerticalSelector
                label="DIFF"
                value={state.diffusion}
                options={diffusionOptions}
                onChange={(value) => setDiffusion(value as Diffusion)}
                optionColors={selectorOptionColors}
              />
              <VerticalSelector
                label="MOD"
                value={state.tank_mod}
                options={tankModOptions}
                onChange={(value) => setTankMod(value as TankMod)}
                optionColors={selectorOptionColors}
              />
              <VerticalSelector
                label="CLOCK"
                value={state.clock}
                options={clockOptions}
                onChange={(value) => setClock(value as Clock)}
                optionColors={selectorOptionColors}
              />
            </div>

            {/* Chase Bliss Logo Area */}
            <div className="mt-5 text-center">
              <div className="text-lg font-bold text-slate-700 tracking-widest">
                CHASE BLISS AUDIO
              </div>
              <div className="text-xs text-slate-500 font-semibold tracking-wide">
                AUTOMATONE CXM 1978
              </div>
            </div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Faders</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Bass:</strong> Bass frequency decay time</li>
                <li><strong>Mids:</strong> Mids frequency decay time</li>
                <li><strong>Cross:</strong> Crossover frequency (bass/mids split)</li>
                <li><strong>Treble:</strong> High frequency output level</li>
                <li><strong>Mix:</strong> Wet/dry blend (0=dry, 127=wet)</li>
                <li><strong>Pre-Dly:</strong> Pre-delay time before reverb tail</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Arcade Buttons</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Jump:</strong> Quick preset navigation</li>
                <li><strong>Type:</strong> Room / Plate / Hall algorithm</li>
                <li><strong>Diff:</strong> Early reflection density</li>
                <li><strong>Mod:</strong> Tank modulation depth</li>
                <li><strong>Clock:</strong> HiFi / Standard / LoFi quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="Cxm1978"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      {/* Preset Drawer */}
      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="Cxm1978"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
