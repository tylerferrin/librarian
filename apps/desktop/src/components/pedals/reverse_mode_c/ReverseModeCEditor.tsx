// Chase Bliss Reverse Mode C Editor Component

import { useState } from 'react';
import { useReverseModeCEditor } from '@/hooks/pedals/reverse_mode_c/useReverseModeCEditor';
import { Knob } from '@/components/common/Knob';
import { Toggle } from '@/components/common/Toggle';
import { DipSwitch } from '@/components/common/DipSwitch';
import { VerticalSelector } from '@/components/common/VerticalSelector';
import { PedalUtilityCard } from '@/components/common/PedalUtilityCard';
import { PresetManagementCard } from '@/components/common/PresetManagementCard';
import { SaveToLibraryDialog } from '@/components/presets/SaveToLibraryDialog';
import { PresetDrawer } from '@/components/presets/PresetDrawer';
import { Save, Library, RotateCcw } from 'lucide-react';
import type {
  ReverseModeCState,
  ModSync,
  ModType,
  SequenceMode,
  OctaveType,
} from '@/lib/midi/pedals/reverse-mode-c';

interface ReverseModeCEditorProps {
  deviceName: string;
}

export function ReverseModeCEditor({ deviceName }: ReverseModeCEditorProps) {
  const editor = useReverseModeCEditor(deviceName);
  const {
    state, isLoading, error,
    setTime, setMix, setFeedback, setOffset, setBalance, setFilter, setRampSpeed,
    setModSync, setModType, setSequenceMode,
    setSequencerSubdivision, setRampingWaveform, setModDepth, setModRate,
    setOctaveType, setSequenceSpacing,
    setBypass, setTap, setFreeze, setHalfSpeed,
    setDipTime, setDipOffset, setDipBalance, setDipFilter, setDipFeed, setDipBounce,
    setDipSweep, setDipPolarity,
    setDipSwap, setDipMiso, setDipSpread, setDipTrails, setDipLatch,
    setDipFeedType, setDipFadeType, setDipModType,
    setMidiClockIgnore, setRampBounce, setDryKill, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Reverse Mode C...</div>
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
      const bankState = await getBankState('ReverseModeC');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: ReverseModeCState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#a855f7';
  const dipColor = '#a855f7';

  const modSyncOptions = [
    { value: 'Sync', label: 'SYNC' },
    { value: 'Off', label: 'OFF' },
    { value: 'Free', label: 'FREE' },
  ];
  const modTypeOptions = [
    { value: 'Vib', label: 'VIB' },
    { value: 'Trem', label: 'TREM' },
    { value: 'Freq', label: 'FREQ' },
  ];
  const sequenceModeOptions = [
    { value: 'Run', label: 'RUN' },
    { value: 'Off', label: 'OFF' },
    { value: 'Env', label: 'ENV' },
  ];
  const octaveTypeOptions = [
    { value: 'OctDown', label: 'DOWN' },
    { value: 'BothOct', label: 'BOTH' },
    { value: 'OctUp', label: 'UP' },
  ];

  const selectorColors = ['#6b7280', '#a855f7', '#7c3aed'];

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
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Reverse Mode C</h1>
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
            <div className="flex items-center gap-4 flex-wrap">
              <Toggle
                label="Effect"
                value={state.bypass}
                onChange={setBypass}
                activeColor="green"
              />
              <Toggle
                label="Freeze"
                value={state.freeze}
                onChange={setFreeze}
                activeColor="blue"
              />
              <Toggle
                label="½ Speed"
                value={state.half_speed}
                onChange={setHalfSpeed}
                activeColor="purple"
              />
              <Toggle
                label="Tap"
                value={state.tap}
                onChange={setTap}
                activeColor="amber"
              />
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
        <div className="relative">
          <div
            className="relative rounded-xl p-6 shadow-xl border-4"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              borderColor: '#a855f7',
            }}
          >
            {/* DIP Switches */}
            <div className="mb-6">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4 text-center">
                DIP Switches
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                {/* Left Bank */}
                <div>
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Left Bank
                  </div>
                  <div className="space-y-2.5">
                    <DipSwitch horizontal label="Time" description="Expand time range" value={state.dip_time} onChange={setDipTime} activeColor={dipColor} />
                    <DipSwitch horizontal label="Offset" description="Expand offset range" value={state.dip_offset} onChange={setDipOffset} activeColor={dipColor} />
                    <DipSwitch horizontal label="Balance" description="Expand balance range" value={state.dip_balance} onChange={setDipBalance} activeColor={dipColor} />
                    <DipSwitch horizontal label="Filter" description="Expand filter range" value={state.dip_filter} onChange={setDipFilter} activeColor={dipColor} />
                    <DipSwitch horizontal label="Feed" description="Expand feedback range" value={state.dip_feed} onChange={setDipFeed} activeColor={dipColor} />
                    <DipSwitch horizontal label="Bounce" description="Enable ramp bounce mode" value={state.dip_bounce} onChange={setDipBounce} activeColor={dipColor} />
                    <DipSwitch
                      horizontal
                      label="Sweep"
                      description={state.dip_sweep === 'Top' ? 'Sweep from top' : 'Sweep from bottom'}
                      value={state.dip_sweep === 'Top'}
                      onChange={(v) => setDipSweep(v ? 'Top' : 'Bottom')}
                      activeColor={dipColor}
                    />
                    <DipSwitch
                      horizontal
                      label="Polarity"
                      description={state.dip_polarity === 'Reverse' ? 'Reversed' : 'Normal'}
                      value={state.dip_polarity === 'Reverse'}
                      onChange={(v) => setDipPolarity(v ? 'Reverse' : 'Forward')}
                      activeColor={dipColor}
                    />
                  </div>
                </div>

                {/* Right Bank */}
                <div>
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Right Bank
                  </div>
                  <div className="space-y-2.5">
                    <DipSwitch horizontal label="Swap" description="Swap left/right channels" value={state.dip_swap} onChange={setDipSwap} activeColor={dipColor} />
                    <DipSwitch horizontal label="MISO" description="Mono in, stereo out" value={state.dip_miso} onChange={setDipMiso} activeColor={dipColor} />
                    <DipSwitch horizontal label="Spread" description="Stereo spread" value={state.dip_spread} onChange={setDipSpread} activeColor={dipColor} />
                    <DipSwitch horizontal label="Trails" description="Trails on bypass" value={state.dip_trails} onChange={setDipTrails} activeColor={dipColor} />
                    <DipSwitch horizontal label="Latch" description="Latch footswitch mode" value={state.dip_latch} onChange={setDipLatch} activeColor={dipColor} />
                    <DipSwitch horizontal label="Feed Type" description="Feedback type mode" value={state.dip_feed_type} onChange={setDipFeedType} activeColor={dipColor} />
                    <DipSwitch horizontal label="Fade Type" description="Fade type mode" value={state.dip_fade_type} onChange={setDipFadeType} activeColor={dipColor} />
                    <DipSwitch horizontal label="Mod Type" description="Modulation type mode" value={state.dip_mod_type} onChange={setDipModType} activeColor={dipColor} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-purple-600/40 mb-5" />

            {/* Main Knobs */}
            <div className="mb-6 space-y-4">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest text-center">
                Main
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="TIME" value={state.time} onChange={setTime} color={knobColor} size={72} />
                <Knob label="MIX" value={state.mix} onChange={setMix} color={knobColor} size={72} />
                <Knob label="FEEDBACK" value={state.feedback} onChange={setFeedback} color={knobColor} size={72} />
                <Knob label="OFFSET" value={state.offset} onChange={setOffset} color={knobColor} size={72} />
                <Knob label="BALANCE" value={state.balance} onChange={setBalance} color={knobColor} size={72} />
                <Knob label="FILTER" value={state.filter} onChange={setFilter} color={knobColor} size={72} />
                <Knob label="RAMP" value={state.ramp_speed} onChange={setRampSpeed} color={knobColor} size={72} />
              </div>

              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest text-center pt-2">
                Alt
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="SEQ SUB" value={state.sequencer_subdivision} onChange={setSequencerSubdivision} color={knobColor} size={72} />
                <Knob label="RAMP WAVE" value={state.ramping_waveform} onChange={setRampingWaveform} color={knobColor} size={72} />
                <Knob label="MOD DEPTH" value={state.mod_depth} onChange={setModDepth} color={knobColor} size={72} />
                <Knob label="MOD RATE" value={state.mod_rate} onChange={setModRate} color={knobColor} size={72} />
                <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={72} />
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-purple-600/40 mb-5" />

            {/* Toggle Selectors */}
            <div className="mb-5">
              <div className="flex justify-center items-start gap-5 flex-wrap">
                <VerticalSelector
                  label="MOD SYNC"
                  value={state.mod_sync}
                  options={modSyncOptions}
                  onChange={(v) => setModSync(v as ModSync)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="MOD TYPE"
                  value={state.mod_type}
                  options={modTypeOptions}
                  onChange={(v) => setModType(v as ModType)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="SEQ MODE"
                  value={state.sequence_mode}
                  options={sequenceModeOptions}
                  onChange={(v) => setSequenceMode(v as SequenceMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="OCTAVE"
                  value={state.octave_type}
                  options={octaveTypeOptions}
                  onChange={(v) => setOctaveType(v as OctaveType)}
                  optionColors={selectorColors}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-purple-600/40 mb-5" />

            {/* Additional Toggles */}
            <div className="mb-5">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 text-center">
                Advanced
              </div>
              <div className="flex justify-center items-center gap-6 flex-wrap">
                <Toggle
                  label="SEQ SPACING"
                  value={state.sequence_spacing}
                  onChange={setSequenceSpacing}
                  activeColor="purple"
                />
                <Toggle
                  label="RAMP BNC"
                  value={state.ramp_bounce}
                  onChange={setRampBounce}
                  activeColor="purple"
                />
                <Toggle
                  label="MIDI CLK IGN"
                  value={state.midi_clock_ignore}
                  onChange={setMidiClockIgnore}
                  activeColor="purple"
                />
                <Toggle
                  label="DRY KILL"
                  value={state.dry_kill}
                  onChange={setDryKill}
                  activeColor="red"
                />
              </div>
            </div>

            {/* Logo Area */}
            <div className="mt-5 text-center">
              <div className="text-lg font-bold text-purple-400/80 tracking-widest">
                CHASE BLISS AUDIO
              </div>
              <div className="text-xs text-gray-400 font-semibold tracking-wide">
                REVERSE MODE C
              </div>
            </div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Main Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Time:</strong> Reverse buffer length</li>
                <li><strong>Mix:</strong> Wet/dry blend</li>
                <li><strong>Feedback:</strong> Reverse repeat amount</li>
                <li><strong>Offset:</strong> Start point in buffer</li>
                <li><strong>Balance:</strong> Left/right balance</li>
                <li><strong>Filter:</strong> Tone filter on wet signal</li>
                <li><strong>Ramp:</strong> Internal modulation speed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Alt / Selectors</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Seq Sub:</strong> Sequencer subdivision</li>
                <li><strong>Ramp Wave:</strong> Ramping waveform shape</li>
                <li><strong>Mod Depth:</strong> Modulation depth</li>
                <li><strong>Mod Rate:</strong> Modulation rate</li>
                <li><strong>Mod Sync:</strong> Sync / Off / Free</li>
                <li><strong>Mod Type:</strong> Vib / Trem / Freq</li>
                <li><strong>Seq Mode:</strong> Run / Off / Env</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">DIP Switches</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Swap:</strong> Swap stereo channels</li>
                <li><strong>MISO:</strong> Mono in, stereo out</li>
                <li><strong>Spread:</strong> Stereo spread amount</li>
                <li><strong>Trails:</strong> Trails on bypass</li>
                <li><strong>Latch:</strong> Latch footswitch</li>
                <li><strong>Feed/Fade/Mod Type:</strong> Mode variants</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="ReverseModeC"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      {/* Preset Drawer */}
      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="ReverseModeC"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
