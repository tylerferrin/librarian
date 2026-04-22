// Chase Bliss Lossy Editor Component

import { useState } from 'react';
import { useLossyEditor } from '@/hooks/pedals/lossy/useLossyEditor';
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
  LossyState,
  FilterSlope,
  PacketMode,
  LossEffect,
  Weighting,
} from '@/lib/midi/pedals/lossy';

interface LossyEditorProps {
  deviceName: string;
}

export function LossyEditor({ deviceName }: LossyEditorProps) {
  const editor = useLossyEditor(deviceName);
  const {
    state, isLoading, error,
    setFilter, setGlobal, setReverb, setFreq, setSpeed, setLoss, setRampSpeed,
    setFilterSlope, setPacketMode, setLossEffect,
    setGate, setFreezer, setVerbDecay, setLimiterThreshold, setAutoGain, setLossGain, setWeighting,
    setBypass, setFreezeSlushie, setAltMode, setFreezeSolid, setGateSwitch,
    setDipFilter, setDipFreq, setDipSpeed, setDipLoss, setDipVerb, setDipBounce,
    setDipSweep, setDipPolarity,
    setDipMiso, setDipSpread, setDipTrails, setDipLatch, setDipPrePost,
    setDipSlow, setDipInvert, setDipAllWet,
    setRampBounce, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Lossy...</div>
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
      const bankState = await getBankState('Lossy');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: LossyState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#ef4444';
  const dipColor = '#ef4444';
  const selectorColors = ['#6b7280', '#ef4444', '#b91c1c'];

  const filterSlopeOptions = [
    { value: 'Db6', label: '6 dB' },
    { value: 'Db24', label: '24 dB' },
    { value: 'Db96', label: '96 dB' },
  ];
  const packetModeOptions = [
    { value: 'Repeat', label: 'REPEAT' },
    { value: 'Clean', label: 'CLEAN' },
    { value: 'LossMode', label: 'LOSS' },
  ];
  const lossEffectOptions = [
    { value: 'Inverse', label: 'INVERSE' },
    { value: 'Standard', label: 'STANDARD' },
    { value: 'Jitter', label: 'JITTER' },
  ];
  const weightingOptions = [
    { value: 'Dark', label: 'DARK' },
    { value: 'Neutral', label: 'NEUTRAL' },
    { value: 'Bright', label: 'BRIGHT' },
  ];

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

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Lossy</h1>
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
              <Toggle label="Bypass" value={state.bypass} onChange={setBypass} activeColor="green" />
              <Toggle label="Freeze Slush" value={state.freeze_slushie} onChange={setFreezeSlushie} activeColor="blue" />
              <Toggle label="Freeze Solid" value={state.freeze_solid} onChange={setFreezeSolid} activeColor="blue" />
              <Toggle label="Gate" value={state.gate_switch} onChange={setGateSwitch} activeColor="purple" />
              <Toggle label="Alt Mode" value={state.alt_mode} onChange={setAltMode} activeColor="amber" />
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
            background: 'linear-gradient(135deg, #1a0000 0%, #2a0808 50%, #3a1010 100%)',
            borderColor: knobColor,
          }}
        >
          {/* DIP Switches */}
          <div className="mb-6">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-4 text-center" style={{ color: knobColor }}>
              DIP Switches
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-0">
              {/* Left Bank */}
              <div>
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Left Bank</div>
                <div className="space-y-2.5">
                  <DipSwitch horizontal label="Filter" description="Expand filter range" value={state.dip_filter} onChange={setDipFilter} activeColor={dipColor} />
                  <DipSwitch horizontal label="Freq" description="Expand frequency range" value={state.dip_freq} onChange={setDipFreq} activeColor={dipColor} />
                  <DipSwitch horizontal label="Speed" description="Expand speed range" value={state.dip_speed} onChange={setDipSpeed} activeColor={dipColor} />
                  <DipSwitch horizontal label="Loss" description="Expand loss range" value={state.dip_loss} onChange={setDipLoss} activeColor={dipColor} />
                  <DipSwitch horizontal label="Verb" description="Expand reverb range" value={state.dip_verb} onChange={setDipVerb} activeColor={dipColor} />
                  <DipSwitch horizontal label="Bounce" description="Enable ramp bounce" value={state.dip_bounce} onChange={setDipBounce} activeColor={dipColor} />
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
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Right Bank</div>
                <div className="space-y-2.5">
                  <DipSwitch horizontal label="MISO" description="Mono in, stereo out" value={state.dip_miso} onChange={setDipMiso} activeColor={dipColor} />
                  <DipSwitch horizontal label="Spread" description="Stereo spread" value={state.dip_spread} onChange={setDipSpread} activeColor={dipColor} />
                  <DipSwitch horizontal label="Trails" description="Trails on bypass" value={state.dip_trails} onChange={setDipTrails} activeColor={dipColor} />
                  <DipSwitch horizontal label="Latch" description="Latch footswitch" value={state.dip_latch} onChange={setDipLatch} activeColor={dipColor} />
                  <DipSwitch horizontal label="Pre/Post" description="Pre or post signal path" value={state.dip_pre_post} onChange={setDipPrePost} activeColor={dipColor} />
                  <DipSwitch horizontal label="Slow" description="Slow ramp mode" value={state.dip_slow} onChange={setDipSlow} activeColor={dipColor} />
                  <DipSwitch horizontal label="Invert" description="Invert ramp polarity" value={state.dip_invert} onChange={setDipInvert} activeColor={dipColor} />
                  <DipSwitch horizontal label="All Wet" description="Full wet signal" value={state.dip_all_wet} onChange={setDipAllWet} activeColor={dipColor} />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-5" style={{ backgroundColor: `${knobColor}60` }} />

          {/* Main Knobs */}
          <div className="mb-6 space-y-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: knobColor }}>Main</div>
            <div className="flex justify-center items-end gap-4 flex-wrap">
              <Knob label="FILTER" value={state.filter} onChange={setFilter} color={knobColor} size={72} />
              <Knob label="GLOBAL" value={state.global} onChange={setGlobal} color={knobColor} size={72} />
              <Knob label="REVERB" value={state.reverb} onChange={setReverb} color={knobColor} size={72} />
              <Knob label="FREQ" value={state.freq} onChange={setFreq} color={knobColor} size={72} />
              <Knob label="SPEED" value={state.speed} onChange={setSpeed} color={knobColor} size={72} />
              <Knob label="LOSS" value={state.loss} onChange={setLoss} color={knobColor} size={72} />
              <Knob label="RAMP" value={state.ramp_speed} onChange={setRampSpeed} color={knobColor} size={72} />
            </div>

            <div className="text-[10px] font-bold uppercase tracking-widest text-center pt-2" style={{ color: knobColor }}>Alt / Hidden Menu</div>
            <div className="flex justify-center items-end gap-4 flex-wrap">
              <Knob label="GATE" value={state.gate} onChange={setGate} color={knobColor} size={72} />
              <Knob label="FREEZER" value={state.freezer} onChange={setFreezer} color={knobColor} size={72} />
              <Knob label="VERB DECAY" value={state.verb_decay} onChange={setVerbDecay} color={knobColor} size={72} />
              <Knob label="LIMITER" value={state.limiter_threshold} onChange={setLimiterThreshold} color={knobColor} size={72} />
              <Knob label="AUTO GAIN" value={state.auto_gain} onChange={setAutoGain} color={knobColor} size={72} />
              <Knob label="LOSS GAIN" value={state.loss_gain} onChange={setLossGain} color={knobColor} size={72} />
              <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={72} />
              <Toggle label="RAMP/BNC" value={state.ramp_bounce} onChange={setRampBounce} activeColor="red" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-5" style={{ backgroundColor: `${knobColor}60` }} />

          {/* Toggle Selectors */}
          <div className="mb-5">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: knobColor }}>Controls</div>
            <div className="flex justify-center items-start gap-5 flex-wrap">
              <VerticalSelector
                label="FILTER SLOPE"
                value={state.filter_slope}
                options={filterSlopeOptions}
                onChange={(v) => setFilterSlope(v as FilterSlope)}
                optionColors={selectorColors}
              />
              <VerticalSelector
                label="PACKET MODE"
                value={state.packet_mode}
                options={packetModeOptions}
                onChange={(v) => setPacketMode(v as PacketMode)}
                optionColors={selectorColors}
              />
              <VerticalSelector
                label="LOSS EFFECT"
                value={state.loss_effect}
                options={lossEffectOptions}
                onChange={(v) => setLossEffect(v as LossEffect)}
                optionColors={selectorColors}
              />
              <VerticalSelector
                label="WEIGHTING"
                value={state.weighting}
                options={weightingOptions}
                onChange={(v) => setWeighting(v as Weighting)}
                optionColors={selectorColors}
              />
            </div>
          </div>

          {/* Logo */}
          <div className="mt-5 text-center">
            <div className="text-lg font-bold tracking-widest" style={{ color: `${knobColor}cc` }}>
              CHASE BLISS AUDIO
            </div>
            <div className="text-xs text-gray-400 font-semibold tracking-wide">LOSSY</div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>Main Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Filter:</strong> Filter cutoff frequency</li>
                <li><strong>Global:</strong> Overall loss amount</li>
                <li><strong>Reverb:</strong> Reverb mix</li>
                <li><strong>Freq:</strong> Packet frequency</li>
                <li><strong>Speed:</strong> Modulation speed</li>
                <li><strong>Loss:</strong> Packet loss amount</li>
                <li><strong>Ramp:</strong> Ramp modulation speed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>Toggles</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Filter Slope:</strong> 6/24/96 dB/octave</li>
                <li><strong>Packet Mode:</strong> Repeat/Clean/Loss</li>
                <li><strong>Loss Effect:</strong> Inverse/Standard/Jitter</li>
                <li><strong>Weighting:</strong> Dark/Neutral/Bright EQ</li>
              </ul>
              <h4 className="font-semibold mb-2 mt-3" style={{ color: knobColor }}>Footswitches</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Bypass:</strong> Effect on/off</li>
                <li><strong>Freeze Slushie:</strong> Soft freeze</li>
                <li><strong>Freeze Solid:</strong> Hard freeze</li>
                <li><strong>Gate:</strong> Gate on/off</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>DIP Switches</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>MISO:</strong> Mono in, stereo out</li>
                <li><strong>Spread:</strong> Stereo spread</li>
                <li><strong>Trails:</strong> Reverb trails on bypass</li>
                <li><strong>Pre/Post:</strong> Signal chain position</li>
                <li><strong>Slow:</strong> Slow ramp mode</li>
                <li><strong>Invert:</strong> Invert ramp polarity</li>
                <li><strong>All Wet:</strong> Full wet output</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="Lossy"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="Lossy"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
