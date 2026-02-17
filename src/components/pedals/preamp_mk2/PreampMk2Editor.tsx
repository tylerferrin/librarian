// Chase Bliss Preamp MK II Editor Component - Pedal-style UI

import { useState } from 'react';
import { usePreampMk2Editor } from '@/hooks/pedals/preamp_mk2/usePreampMk2Editor';
import { VerticalSlider } from '@/components/common/VerticalSlider';
import { VerticalSelector } from '@/components/common/VerticalSelector';
import { Toggle } from '@/components/common/Toggle';
import { PedalUtilityCard } from '@/components/common/PedalUtilityCard';
import { PresetManagementCard } from '@/components/common/PresetManagementCard';
import { SaveToLibraryDialog } from '@/components/presets/SaveToLibraryDialog';
import { PresetDrawer } from '@/components/presets/PresetDrawer';
import { Save, Library, RotateCcw } from 'lucide-react';
import type { PreampMk2State, Jump, MidsPosition, QResonance, DiodeClipping, FuzzMode } from '@/lib/midi/pedals/preamp_mk2';

interface PreampMk2EditorProps {
  deviceName: string;
}

export function PreampMk2Editor({ deviceName }: PreampMk2EditorProps) {
  const {
    state,
    isLoading,
    error,
    setVolume,
    setTreble,
    setMids,
    setFrequency,
    setBass,
    setGain,
    setJump,
    setMidsPosition,
    setQResonance,
    setDiodeClipping,
    setFuzzMode,
    setBypass,
    loadPreset,
    activePreset,
    isDirty,
    resetToPreset,
    resetToPedalDefault,
    clearActivePreset,
  } = usePreampMk2Editor(deviceName);

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Preamp MK II...</div>
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
      const bankState = await getBankState('PreampMk2');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = (presetState: PreampMk2State, presetId: string, presetName: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  // Jump options
  const jumpOptions = [
    { value: 'Off', label: 'OFF' },
    { value: 'Zero', label: '0' },
    { value: 'Five', label: '5' },
  ];

  // Mids Position options
  const midsPositionOptions = [
    { value: 'Off', label: 'OFF' },
    { value: 'Pre', label: 'PRE' },
    { value: 'Post', label: 'POST' },
  ];

  // Q Resonance options
  const qResonanceOptions = [
    { value: 'Low', label: 'LOW' },
    { value: 'Mid', label: 'MID' },
    { value: 'High', label: 'HIGH' },
  ];

  // Diode Clipping options
  const diodeClippingOptions = [
    { value: 'Off', label: 'OFF' },
    { value: 'Silicon', label: 'SIL' },
    { value: 'Germanium', label: 'GERM' },
  ];

  // Fuzz Mode options
  const fuzzModeOptions = [
    { value: 'Off', label: 'OFF' },
    { value: 'Open', label: 'OPEN' },
    { value: 'Gated', label: 'GATED' },
  ];

  // Slider track color (grey)
  const sliderColor = '#6b7280';
  // Arcade button option colors: off = grey, first option = blue, second option = red
  const selectorOptionColors = ['#6b7280', '#3b82f6', '#b91c1c'];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800">
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
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Preamp MK II</h1>
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
          {/* Pedal Body - styled like the actual hardware */}
          <div 
            className="relative rounded-xl p-6 shadow-xl border-4"
            style={{
              background: 'linear-gradient(135deg, #f5f5f0 0%, #e8e8dd 100%)',
              borderColor: '#c4a574',
            }}
          >
            {/* Wood grain effect on sides */}
            <div className="absolute top-0 left-0 bottom-0 w-4 bg-gradient-to-r from-amber-200/60 to-amber-300/60 rounded-l-lg" />
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-gradient-to-l from-amber-200/60 to-amber-300/60 rounded-r-lg" />

            {/* Faders Section */}
            <div className="mb-6">
              <div className="flex justify-center items-end gap-8">
                <VerticalSlider
                  label="VOLUME"
                  value={state.volume}
                  onChange={setVolume}
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
                  label="MIDS"
                  value={state.mids}
                  onChange={setMids}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="FREQ"
                  value={state.frequency}
                  onChange={setFrequency}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="BASS"
                  value={state.bass}
                  onChange={setBass}
                  height={280}
                  color={sliderColor}
                />
                <VerticalSlider
                  label="GAIN"
                  value={state.gain}
                  onChange={setGain}
                  height={280}
                  color={sliderColor}
                />
              </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-gray-500/60 mb-5" />

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
                label="MIDS"
                value={state.mids_position}
                options={midsPositionOptions}
                onChange={(value) => setMidsPosition(value as MidsPosition)}
                optionColors={selectorOptionColors}
              />
              <VerticalSelector
                label="Q"
                value={state.q_resonance}
                options={qResonanceOptions}
                onChange={(value) => setQResonance(value as QResonance)}
                optionColors={selectorOptionColors}
              />
              <VerticalSelector
                label="DIODE"
                value={state.diode_clipping}
                options={diodeClippingOptions}
                onChange={(value) => setDiodeClipping(value as DiodeClipping)}
                optionColors={selectorOptionColors}
              />
              <VerticalSelector
                label="FUZZ"
                value={state.fuzz_mode}
                options={fuzzModeOptions}
                onChange={(value) => setFuzzMode(value as FuzzMode)}
                optionColors={selectorOptionColors}
              />
            </div>

            {/* Chase Bliss Logo Area */}
            <div className="mt-5 text-center">
              <div className="text-lg font-bold text-gray-700 tracking-widest">
                CHASE BLISS AUDIO
              </div>
              <div className="text-xs text-gray-500 font-semibold tracking-wide">
                AUTOMATONE PREAMP MKII
              </div>
            </div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mt-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Faders</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Volume:</strong> Master output level</li>
                <li><strong>Treble/Bass:</strong> High/Low frequency tone</li>
                <li><strong>Mids:</strong> Parametric boost/cut (±18dB)</li>
                <li><strong>Freq:</strong> Mids center frequency (150Hz-4kHz)</li>
                <li><strong>Gain:</strong> Input drive/overdrive</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Arcade Buttons</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Jump:</strong> Quick preset navigation</li>
                <li><strong>Mids:</strong> Pre/Post preamp position</li>
                <li><strong>Q:</strong> Parametric mids width</li>
                <li><strong>Diode:</strong> Clipping type selection</li>
                <li><strong>Fuzz:</strong> Silicon fuzz mode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="PreampMk2"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      {/* Preset Drawer - universal UI, opens with Library first */}
      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="PreampMk2"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
