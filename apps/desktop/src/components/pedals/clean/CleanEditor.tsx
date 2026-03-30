// Chase Bliss Audio Clean Editor Component

import { useState } from 'react';
import { useCleanEditor } from '@/hooks/pedals/clean/useCleanEditor';
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
  CleanState,
  ReleaseMode,
  EffectMode,
  PhysicsMode,
  EnvelopeMode,
  SpreadRouting,
} from '@/lib/midi/pedals/clean';

interface CleanEditorProps {
  deviceName: string;
}

export function CleanEditor({ deviceName }: CleanEditorProps) {
  const editor = useCleanEditor(deviceName);
  const {
    state, isLoading, error,
    setDynamics, setSensitivity, setWet, setAttack, setEq, setDry, setRampSpeed,
    setReleaseMode, setEffectMode, setPhysicsMode,
    setNoiseGateRelease, setNoiseGateSens, setSwellIn, setUserRelease,
    setBalanceFilter, setSwellOut, setEnvelopeMode, setSpreadRouting,
    setBypass, setSwell,
    setDipDynamics, setDipAttack, setDipEq, setDipDry, setDipWet,
    setDipBounce, setDipSweep, setDipPolarity,
    setDipMiso, setDipSpread, setDipLatch, setDipSidechain,
    setDipNoiseGate, setDipMotion, setDipSwellAux, setDipDusty,
    setRampBounce, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Clean...</div>
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
      const bankState = await getBankState('Clean');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: CleanState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#3b82f6';
  const dipColor = '#3b82f6';

  const releaseModeOptions = [
    { value: 'Fast', label: 'FAST' },
    { value: 'User', label: 'USER' },
    { value: 'Slow', label: 'SLOW' },
  ];
  const effectModeOptions = [
    { value: 'Shifty', label: 'SHIFTY' },
    { value: 'Manual', label: 'MANUAL' },
    { value: 'Modulated', label: 'MOD' },
  ];
  const physicsModeOptions = [
    { value: 'Wobbly', label: 'WOBBLY' },
    { value: 'Off', label: 'OFF' },
    { value: 'Twitchy', label: 'TWITCHY' },
  ];
  const envelopeModeOptions = [
    { value: 'Analog', label: 'ANALOG' },
    { value: 'Hybrid', label: 'HYBRID' },
    { value: 'Adaptive', label: 'ADAPT' },
  ];
  const spreadRoutingOptions = [
    { value: 'Eq', label: 'EQ' },
    { value: 'Both', label: 'BOTH' },
    { value: 'VolComp', label: 'VOL/CMP' },
  ];

  const selectorColors = ['#6b7280', '#3b82f6', '#1d4ed8'];

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
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Audio Clean</h1>
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
                activeColor="blue"
              />
              <Toggle
                label="Swell"
                value={state.swell}
                onChange={setSwell}
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
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
              borderColor: '#3b82f6',
            }}
          >
            {/* DIP Switches Section */}
            <div className="mb-6">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 text-center">
                DIP Switches
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                {/* Left Bank */}
                <div>
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Left Bank
                  </div>
                  <div className="space-y-2.5">
                    <DipSwitch horizontal label="Dynamics" description="Expand dynamics range" value={state.dip_dynamics} onChange={setDipDynamics} activeColor={dipColor} />
                    <DipSwitch horizontal label="Attack" description="Expand attack range" value={state.dip_attack} onChange={setDipAttack} activeColor={dipColor} />
                    <DipSwitch horizontal label="EQ" description="Expand EQ range" value={state.dip_eq} onChange={setDipEq} activeColor={dipColor} />
                    <DipSwitch horizontal label="Dry" description="Expand dry range" value={state.dip_dry} onChange={setDipDry} activeColor={dipColor} />
                    <DipSwitch horizontal label="Wet" description="Expand wet range" value={state.dip_wet} onChange={setDipWet} activeColor={dipColor} />
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
                    <DipSwitch horizontal label="MISO" description="Mono in, stereo out" value={state.dip_miso} onChange={setDipMiso} activeColor={dipColor} />
                    <DipSwitch horizontal label="Spread" description="Stereo spread mode" value={state.dip_spread} onChange={setDipSpread} activeColor={dipColor} />
                    <DipSwitch horizontal label="Latch" description="Latch footswitch mode" value={state.dip_latch} onChange={setDipLatch} activeColor={dipColor} />
                    <DipSwitch horizontal label="Sidechain" description="Sidechain mode" value={state.dip_sidechain} onChange={setDipSidechain} activeColor={dipColor} />
                    <DipSwitch horizontal label="Noise Gate" description="Enable noise gate" value={state.dip_noise_gate} onChange={setDipNoiseGate} activeColor={dipColor} />
                    <DipSwitch horizontal label="Motion" description="Motion tracking mode" value={state.dip_motion} onChange={setDipMotion} activeColor={dipColor} />
                    <DipSwitch horizontal label="Swell Aux" description="Swell aux mode" value={state.dip_swell_aux} onChange={setDipSwellAux} activeColor={dipColor} />
                    <DipSwitch horizontal label="Dusty" description="Dusty/vintage mode" value={state.dip_dusty} onChange={setDipDusty} activeColor={dipColor} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-blue-600/40 mb-5" />

            {/* Main Knobs */}
            <div className="mb-6 space-y-4">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center">
                Main
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="DYNAMICS" value={state.dynamics} onChange={setDynamics} color={knobColor} size={72} />
                <Knob label="SENSITIVITY" value={state.sensitivity} onChange={setSensitivity} color={knobColor} size={72} />
                <Knob label="WET" value={state.wet} onChange={setWet} color={knobColor} size={72} />
                <Knob label="ATTACK" value={state.attack} onChange={setAttack} color={knobColor} size={72} />
                <Knob label="EQ" value={state.eq} onChange={setEq} color={knobColor} size={72} />
                <Knob label="DRY" value={state.dry} onChange={setDry} color={knobColor} size={72} />
                <Knob label="RAMP" value={state.ramp_speed} onChange={setRampSpeed} color={knobColor} size={72} />
              </div>

              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center pt-2">
                Hidden Options
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="GATE REL" value={state.noise_gate_release} onChange={setNoiseGateRelease} color={knobColor} size={72} />
                <Knob label="GATE SENS" value={state.noise_gate_sens} onChange={setNoiseGateSens} color={knobColor} size={72} />
                <Knob label="SWELL IN" value={state.swell_in} onChange={setSwellIn} color={knobColor} size={72} />
                <Knob label="USER REL" value={state.user_release} onChange={setUserRelease} color={knobColor} size={72} />
                <Knob label="BAL FILTER" value={state.balance_filter} onChange={setBalanceFilter} color={knobColor} size={72} />
                <Knob label="SWELL OUT" value={state.swell_out} onChange={setSwellOut} color={knobColor} size={72} />
                <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={72} />
                <Toggle label="RAMP/BNC" value={state.ramp_bounce} onChange={setRampBounce} activeColor="blue" />
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-blue-600/40 mb-5" />

            {/* Toggle Selectors */}
            <div className="mb-5">
              <div className="flex justify-center items-start gap-5 flex-wrap">
                <VerticalSelector
                  label="RELEASE"
                  value={state.release_mode}
                  options={releaseModeOptions}
                  onChange={(v) => setReleaseMode(v as ReleaseMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="EFFECT"
                  value={state.effect_mode}
                  options={effectModeOptions}
                  onChange={(v) => setEffectMode(v as EffectMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="PHYSICS"
                  value={state.physics_mode}
                  options={physicsModeOptions}
                  onChange={(v) => setPhysicsMode(v as PhysicsMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="ENVELOPE"
                  value={state.envelope_mode}
                  options={envelopeModeOptions}
                  onChange={(v) => setEnvelopeMode(v as EnvelopeMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="SPREAD"
                  value={state.spread_routing}
                  options={spreadRoutingOptions}
                  onChange={(v) => setSpreadRouting(v as SpreadRouting)}
                  optionColors={selectorColors}
                />
              </div>
            </div>

            {/* Logo Area */}
            <div className="mt-5 text-center">
              <div className="text-lg font-bold text-blue-400/80 tracking-widest">
                CHASE BLISS AUDIO
              </div>
              <div className="text-xs text-gray-400 font-semibold tracking-wide">
                CLEAN
              </div>
            </div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Main Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Dynamics:</strong> Compression/expansion amount</li>
                <li><strong>Sensitivity:</strong> Envelope follower sensitivity</li>
                <li><strong>Wet:</strong> Wet signal level</li>
                <li><strong>Attack:</strong> Envelope attack time</li>
                <li><strong>EQ:</strong> Tone/EQ control</li>
                <li><strong>Dry:</strong> Dry signal level</li>
                <li><strong>Ramp:</strong> Internal modulation speed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Hidden Options</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Gate Rel:</strong> Noise gate release time</li>
                <li><strong>Gate Sens:</strong> Noise gate sensitivity</li>
                <li><strong>Swell In:</strong> Swell attack time</li>
                <li><strong>User Rel:</strong> User-defined release time</li>
                <li><strong>Bal Filter:</strong> Balance filter frequency</li>
                <li><strong>Swell Out:</strong> Swell decay time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Toggle Modes</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Release:</strong> Fast / User / Slow</li>
                <li><strong>Effect:</strong> Shifty / Manual / Modulated</li>
                <li><strong>Physics:</strong> Wobbly / Off / Twitchy</li>
                <li><strong>Envelope:</strong> Analog / Hybrid / Adaptive</li>
                <li><strong>Spread:</strong> EQ / Both / Vol+Comp</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="Clean"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      {/* Preset Drawer */}
      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="Clean"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
