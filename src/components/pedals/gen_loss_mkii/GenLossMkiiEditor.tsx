// Chase Bliss Generation Loss MKII Editor Component

import { useState } from 'react';
import { useGenLossMkiiEditor } from '@/hooks/pedals/gen_loss_mkii/useGenLossMkiiEditor';
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
  GenLossMkiiState,
  DryMode,
  NoiseMode,
  AuxMode,
  InputGain,
  DspBypassMode,
} from '@/lib/midi/pedals/gen-loss-mkii';
import { TAPE_MODELS, TAPE_MODEL_NAMES } from '@/lib/midi/pedals/gen-loss-mkii';

interface GenLossMkiiEditorProps {
  deviceName: string;
}

export function GenLossMkiiEditor({ deviceName }: GenLossMkiiEditorProps) {
  const editor = useGenLossMkiiEditor(deviceName);
  const {
    state, isLoading, error,
    setWow, setVolume, setModel, setFlutter, setSaturate, setFailure, setRampSpeed,
    setDryMode, setNoiseMode, setAuxMode,
    setBypass, setAuxSwitch,
    setDipWow, setDipFlutter, setDipSatGen, setDipFailureHp,
    setDipModelLp, setDipBounce, setDipRandom, setDipSweep,
    setDipPolarity, setDipClassic, setDipMiso, setDipSpread,
    setDipDryType, setDipDropByp, setDipSnagByp, setDipHumByp,
    setExpression, setAuxOnsetTime, setHissLevel, setMechanicalNoise,
    setCrinklePop, setInputGain, setDspBypass, setRampBounce,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Generation Loss MKII...</div>
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
      const bankState = await getBankState('GenLossMkii');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: GenLossMkiiState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#d97706';
  const dipColor = '#d97706';

  // Toggle option configs
  const dryModeOptions = [
    { value: 'Dry1', label: 'NONE' },
    { value: 'Dry2', label: 'SMALL' },
    { value: 'Dry3', label: 'UNITY' },
  ];
  const noiseModeOptions = [
    { value: 'Noise1', label: 'NONE' },
    { value: 'Noise2', label: 'MILD' },
    { value: 'Noise3', label: 'HEAVY' },
  ];
  const auxModeOptions = [
    { value: 'Aux1', label: 'STOP' },
    { value: 'Aux2', label: 'FILTER' },
    { value: 'Aux3', label: 'FAIL' },
  ];
  const inputGainOptions = [
    { value: 'LineLevel', label: 'LINE' },
    { value: 'InstrumentLevel', label: 'INST' },
    { value: 'HighGain', label: 'HIGH' },
  ];
  const dspBypassOptions = [
    { value: 'TrueBypass', label: 'TRUE' },
    { value: 'DspBypass', label: 'DSP' },
  ];

  const selectorColors = ['#6b7280', '#d97706', '#b91c1c'];

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
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Generation Loss MKII</h1>
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
              <Toggle
                label="Effect"
                value={state.bypass}
                onChange={setBypass}
                activeColor="green"
              />
              <Toggle
                label="Aux"
                value={state.aux_switch}
                onChange={setAuxSwitch}
                activeColor="blue"
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
              borderColor: '#d97706',
            }}
          >
            {/* DIP Switches Section */}
            <div className="mb-6">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-4 text-center">
                DIP Switches
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                {/* Left Bank */}
                <div>
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Left Bank
                  </div>
                  <div className="space-y-2.5">
                    <DipSwitch horizontal label="Wow" description="Expand wow LFO range" value={state.dip_wow} onChange={setDipWow} activeColor={dipColor} />
                    <DipSwitch horizontal label="Flutter" description="Expand flutter LFO range" value={state.dip_flutter} onChange={setDipFlutter} activeColor={dipColor} />
                    <DipSwitch horizontal label="Saturate" description="Expand saturation range" value={state.dip_sat_gen} onChange={setDipSatGen} activeColor={dipColor} />
                    <DipSwitch horizontal label="Failure" description="Expand failure range" value={state.dip_failure_hp} onChange={setDipFailureHp} activeColor={dipColor} />
                    <DipSwitch horizontal label="Model / LP" description="Enable model low-pass filter" value={state.dip_model_lp} onChange={setDipModelLp} activeColor={dipColor} />
                    <DipSwitch horizontal label="Bounce" description="Enable ramp bounce mode" value={state.dip_bounce} onChange={setDipBounce} activeColor={dipColor} />
                    <DipSwitch horizontal label="Random" description="Randomize ramp waveform" value={state.dip_random} onChange={setDipRandom} activeColor={dipColor} />
                    <DipSwitch
                      horizontal
                      label="Sweep"
                      description={state.dip_sweep === 'Top' ? 'Sweep from top' : 'Sweep from bottom'}
                      value={state.dip_sweep === 'Top'}
                      onChange={(v) => setDipSweep(v ? 'Top' : 'Bottom')}
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
                    <DipSwitch
                      horizontal
                      label="Polarity"
                      description={state.dip_polarity === 'Reverse' ? 'Reversed' : 'Normal'}
                      value={state.dip_polarity === 'Reverse'}
                      onChange={(v) => setDipPolarity(v ? 'Reverse' : 'Forward')}
                      activeColor={dipColor}
                    />
                    <DipSwitch horizontal label="Classic" description="Original Gen Loss mode" value={state.dip_classic} onChange={setDipClassic} activeColor={dipColor} />
                    <DipSwitch horizontal label="MISO" description="Mono in, stereo out" value={state.dip_miso} onChange={setDipMiso} activeColor={dipColor} />
                    <DipSwitch horizontal label="Spread" description="Failure-based stereo spread" value={state.dip_spread} onChange={setDipSpread} activeColor={dipColor} />
                    <DipSwitch horizontal label="Dry Type" description="Alter dry signal path" value={state.dip_dry_type} onChange={setDipDryType} activeColor={dipColor} />
                    <DipSwitch horizontal label="Drop Bypass" description="Disable drop failures" value={state.dip_drop_byp} onChange={setDipDropByp} activeColor={dipColor} />
                    <DipSwitch horizontal label="Snag Bypass" description="Disable snag failures" value={state.dip_snag_byp} onChange={setDipSnagByp} activeColor={dipColor} />
                    <DipSwitch horizontal label="Hum Bypass" description="Disable hum failures" value={state.dip_hum_byp} onChange={setDipHumByp} activeColor={dipColor} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-amber-600/40 mb-5" />

            {/* Knobs — Main + Alt, all visible */}
            <div className="mb-6 space-y-4">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center">
                Main
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="WOW" value={state.wow} onChange={setWow} color={knobColor} size={72} />
                <Knob label="FLUTTER" value={state.flutter} onChange={setFlutter} color={knobColor} size={72} />
                <Knob label="SATURATE" value={state.saturate} onChange={setSaturate} color={knobColor} size={72} />
                <Knob label="FAILURE" value={state.failure} onChange={setFailure} color={knobColor} size={72} />
                <Knob label="VOLUME" value={state.volume} onChange={setVolume} color={knobColor} size={72} />
                <Knob label="RAMP" value={state.ramp_speed} onChange={setRampSpeed} color={knobColor} size={72} />
              </div>

              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest text-center pt-2">
                Alt
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="AUX ONSET" value={state.aux_onset_time} onChange={setAuxOnsetTime} color={knobColor} size={72} />
                <Knob label="HISS" value={state.hiss_level} onChange={setHissLevel} color={knobColor} size={72} />
                <Knob label="MECH NOISE" value={state.mechanical_noise} onChange={setMechanicalNoise} color={knobColor} size={72} />
                <Knob label="CRINKLE" value={state.crinkle_pop} onChange={setCrinklePop} color={knobColor} size={72} />
                <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={72} />
                <Toggle label="RAMP/BNC" value={state.ramp_bounce} onChange={setRampBounce} activeColor="amber" />
              </div>
            </div>

            {/* Model Selector */}
            <div className="mb-5">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 text-center">
                Tape Model
              </div>
              <div className="grid grid-cols-4 gap-2">
                {TAPE_MODELS.map((model) => {
                  const isActive = state.model === model;
                  return (
                    <button
                      key={model}
                      onClick={() => setModel(model)}
                      className={`px-3 py-2.5 rounded-md text-xs font-semibold transition-all text-center ${
                        isActive
                          ? 'text-white shadow-md border'
                          : 'bg-gray-800 border border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                      }`}
                      style={isActive ? { backgroundColor: knobColor, borderColor: knobColor } : {}}
                    >
                      {TAPE_MODEL_NAMES[model]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-amber-600/40 mb-5" />

            {/* Toggle Selectors */}
            <div className="mb-5">
              <div className="flex justify-center items-start gap-5 flex-wrap">
                <VerticalSelector
                  label="DRY MODE"
                  value={state.dry_mode}
                  options={dryModeOptions}
                  onChange={(v) => setDryMode(v as DryMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="NOISE MODE"
                  value={state.noise_mode}
                  options={noiseModeOptions}
                  onChange={(v) => setNoiseMode(v as NoiseMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="AUX MODE"
                  value={state.aux_mode}
                  options={auxModeOptions}
                  onChange={(v) => setAuxMode(v as AuxMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="INPUT GAIN"
                  value={state.input_gain}
                  options={inputGainOptions}
                  onChange={(v) => setInputGain(v as InputGain)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="DSP BYPASS"
                  value={state.dsp_bypass}
                  options={dspBypassOptions}
                  onChange={(v) => setDspBypass(v as DspBypassMode)}
                  optionColors={['#6b7280', '#d97706']}
                />
              </div>
            </div>

            {/* Logo Area */}
            <div className="mt-5 text-center">
              <div className="text-lg font-bold text-amber-400/80 tracking-widest">
                CHASE BLISS AUDIO
              </div>
              <div className="text-xs text-gray-400 font-semibold tracking-wide">
                GENERATION LOSS MKII
              </div>
            </div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-amber-400 mb-2">Main Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Wow:</strong> Slow, smooth pitch modulation</li>
                <li><strong>Flutter:</strong> Fast, twitchy random modulation</li>
                <li><strong>Saturate:</strong> Magnetic tape saturation</li>
                <li><strong>Failure:</strong> Snags, drops, crinkles, pops</li>
                <li><strong>Volume:</strong> Wet signal output level</li>
                <li><strong>Ramp:</strong> Internal modulation speed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-amber-400 mb-2">Alt Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Aux Onset:</strong> Time for aux to engage</li>
                <li><strong>Hiss:</strong> Background hiss level</li>
                <li><strong>Mech Noise:</strong> Mechanical noise amount</li>
                <li><strong>Crinkle:</strong> Crinkle and pop level</li>
                <li><strong>Expression:</strong> Expression pedal value</li>
                <li><strong>Ramp/Bnc:</strong> Ramp bounce on/off</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-amber-400 mb-2">DIP Switches</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Classic:</strong> Original Gen Loss mode</li>
                <li><strong>Spread:</strong> Failure-based stereo image</li>
                <li><strong>Miso:</strong> Mono input, stereo output</li>
                <li><strong>Drop/Snag/Hum Byp:</strong> Disable failure types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="GenLossMkii"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      {/* Preset Drawer */}
      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="GenLossMkii"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
