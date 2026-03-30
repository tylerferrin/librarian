// Chase Bliss Billy Strings Wombtone Editor Component

import { useState } from 'react';
import { useBillyStringsWombtoneEditor } from '@/hooks/pedals/billy_strings_wombtone/useBillyStringsWombtoneEditor';
import { Knob } from '@/components/common/Knob';
import { Toggle } from '@/components/common/Toggle';
import { VerticalSelector } from '@/components/common/VerticalSelector';
import { PedalUtilityCard } from '@/components/common/PedalUtilityCard';
import { PresetManagementCard } from '@/components/common/PresetManagementCard';
import { SaveToLibraryDialog } from '@/components/presets/SaveToLibraryDialog';
import { PresetDrawer } from '@/components/presets/PresetDrawer';
import { Save, Library, RotateCcw } from 'lucide-react';
import type { BillyStringsWombtoneState } from '@/lib/midi/pedals/billy-strings-wombtone';
import { NOTE_DIVISION_LABELS } from '@/lib/midi/pedals/billy-strings-wombtone';

interface BillyStringsWombtoneEditorProps {
  deviceName: string;
}

export function BillyStringsWombtoneEditor({ deviceName }: BillyStringsWombtoneEditorProps) {
  const editor = useBillyStringsWombtoneEditor(deviceName);
  const {
    state, isLoading, error,
    setFeed, setVolume, setMix, setRate, setDepth, setForm, setRampSpeed,
    setNoteDivision, setBypass, setMidiClockIgnore, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Billy Strings Wombtone...</div>
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
    if (state) await loadPreset(state, presetId, presetName);
  };

  const handleUpdatePreset = async () => {
    if (!activePreset || !state) return;
    try {
      setUpdating(true);
      const { updatePreset, savePresetToBank, getBankState } = await import('@/lib/presets');
      await updatePreset({ id: activePreset.id, parameters: state });
      const bankState = await getBankState('BillyStringsWombtone');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: BillyStringsWombtoneState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#eab308';
  const selectorColors = ['#6b7280', '#eab308', '#b91c1c', '#3b82f6', '#10b981', '#a855f7'];

  const noteDivisionOptions = Object.entries(NOTE_DIVISION_LABELS).map(([value, label]) => ({
    value: String(value),
    label: label.toUpperCase(),
  }));

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800">
      <button
        onClick={() => setManagerOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-card-bg hover:bg-control-hover rounded-md border border-control-border transition-colors shadow-lg"
        title="Open Preset Manager"
        aria-label="Open Preset Manager"
      >
        <Library className="w-5 h-5 text-text-primary" />
      </button>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Billy Strings Wombtone</h1>
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
            <div className="flex items-center gap-4">
              <Toggle label="Bypass" value={state.bypass} onChange={setBypass} activeColor="green" />
              <Toggle label="MIDI Clk" value={state.midi_clock_ignore} onChange={setMidiClockIgnore} activeColor="blue" />
            </div>
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

        {/* Pedal Body */}
        <div
          className="relative rounded-xl p-6 shadow-xl border-4"
          style={{
            background: 'linear-gradient(135deg, #1a1400 0%, #2a2000 50%, #3a2d00 100%)',
            borderColor: knobColor,
          }}
        >
          {/* Main Knobs */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4 text-center" style={{ color: knobColor }}>
              Main Controls
            </div>
            <div className="flex justify-center items-end gap-4 flex-wrap">
              <Knob label="FEED" value={state.feed} onChange={setFeed} color={knobColor} size={72} />
              <Knob label="VOLUME" value={state.volume} onChange={setVolume} color={knobColor} size={72} />
              <Knob label="MIX" value={state.mix} onChange={setMix} color={knobColor} size={72} />
              <Knob label="RATE" value={state.rate} onChange={setRate} color={knobColor} size={72} />
              <Knob label="DEPTH" value={state.depth} onChange={setDepth} color={knobColor} size={72} />
              <Knob label="FORM" value={state.form} onChange={setForm} color={knobColor} size={72} />
              <Knob label="RAMP" value={state.ramp_speed} onChange={setRampSpeed} color={knobColor} size={72} />
              <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={72} />
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-5" style={{ backgroundColor: `${knobColor}60` }} />

          {/* Note Division */}
          <div className="flex justify-center">
            <VerticalSelector
              label="NOTE DIVISION"
              value={String(state.note_division)}
              options={noteDivisionOptions}
              onChange={(v) => setNoteDivision(Number(v))}
              optionColors={selectorColors}
            />
          </div>

          {/* Logo */}
          <div className="mt-6 text-center">
            <div className="text-lg font-bold tracking-widest" style={{ color: `${knobColor}cc` }}>
              CHASE BLISS AUDIO
            </div>
            <div className="text-xs text-gray-400 font-semibold tracking-wide">BILLY STRINGS WOMBTONE</div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>Main Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Feed:</strong> Feedback amount</li>
                <li><strong>Volume:</strong> Output level</li>
                <li><strong>Mix:</strong> Wet/dry blend</li>
                <li><strong>Rate:</strong> LFO/modulation rate</li>
                <li><strong>Depth:</strong> Modulation depth</li>
                <li><strong>Form:</strong> Waveform shape</li>
                <li><strong>Ramp:</strong> Ramp modulation speed</li>
                <li><strong>Expression:</strong> Expression pedal value</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>Note Division</h4>
              <ul className="space-y-1 text-xs">
                {Object.entries(NOTE_DIVISION_LABELS).map(([value, label]) => (
                  <li key={value}><strong>{value}:</strong> {label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="BillyStringsWombtone"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="BillyStringsWombtone"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
