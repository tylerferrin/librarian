// Chase Bliss Audio Onward Editor Component

import { useState } from 'react';
import { useOnwardEditor } from '@/hooks/pedals/onward/useOnwardEditor';
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
  OnwardState,
  ErrorType,
  FadeMode,
  AnimateMode,
  Routing,
} from '@/lib/midi/pedals/onward';

interface OnwardEditorProps {
  deviceName: string;
}

export function OnwardEditor({ deviceName }: OnwardEditorProps) {
  const editor = useOnwardEditor(deviceName);
  const {
    state, isLoading, error,
    setSize, setMix, setOctave, setError, setSustain, setTexture, setRampSpeed,
    setErrorType, setFadeMode, setAnimateMode,
    setSensitivity, setBalance, setDuckDepth, setErrorBlend, setUserFade, setFilter,
    setErrorRouting, setSustainRouting, setEffectsRouting,
    setFreezeBypass, setGlitchBypass,
    setDipSize, setDipError, setDipSustain, setDipTexture, setDipOctave,
    setDipBounce, setDipSweep, setDipPolarity,
    setDipMiso, setDipSpread, setDipLatch, setDipSidechain,
    setDipDuck, setDipReverse, setDipHalfSpeed, setDipManual,
    setMidiClockIgnore, setRampBounce, setDryKill, setTrails, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Onward...</div>
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
      const bankState = await getBankState('Onward');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: OnwardState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#10b981';
  const dipColor = '#10b981';

  const errorTypeOptions = [
    { value: 'Timing', label: 'TIMING' },
    { value: 'Condition', label: 'COND' },
    { value: 'Playback', label: 'PLAYBACK' },
  ];
  const fadeModeOptions = [
    { value: 'Long', label: 'LONG' },
    { value: 'User', label: 'USER' },
    { value: 'Short', label: 'SHORT' },
  ];
  const animateModeOptions = [
    { value: 'Vibrato', label: 'VIBRATO' },
    { value: 'Off', label: 'OFF' },
    { value: 'Chorus', label: 'CHORUS' },
  ];
  const routingOptions = [
    { value: 'Glitch', label: 'GLITCH' },
    { value: 'Both', label: 'BOTH' },
    { value: 'Freeze', label: 'FREEZE' },
  ];

  const selectorColors = ['#6b7280', '#10b981', '#059669'];

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
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Audio Onward</h1>
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
                label="Freeze"
                value={state.freeze_bypass}
                onChange={setFreezeBypass}
                activeColor="green"
              />
              <Toggle
                label="Glitch"
                value={state.glitch_bypass}
                onChange={setGlitchBypass}
                activeColor="green"
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
              background: 'linear-gradient(135deg, #0a1a12 0%, #064e3b 50%, #065f46 100%)',
              borderColor: '#10b981',
            }}
          >
            {/* DIP Switches Section */}
            <div className="mb-6">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4 text-center">
                DIP Switches
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                {/* Left Bank */}
                <div>
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Left Bank
                  </div>
                  <div className="space-y-2.5">
                    <DipSwitch horizontal label="Size" description="Expand size range" value={state.dip_size} onChange={setDipSize} activeColor={dipColor} />
                    <DipSwitch horizontal label="Error" description="Expand error range" value={state.dip_error} onChange={setDipError} activeColor={dipColor} />
                    <DipSwitch horizontal label="Sustain" description="Expand sustain range" value={state.dip_sustain} onChange={setDipSustain} activeColor={dipColor} />
                    <DipSwitch horizontal label="Texture" description="Expand texture range" value={state.dip_texture} onChange={setDipTexture} activeColor={dipColor} />
                    <DipSwitch horizontal label="Octave" description="Expand octave range" value={state.dip_octave} onChange={setDipOctave} activeColor={dipColor} />
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
                    <DipSwitch horizontal label="Duck" description="Ducking mode" value={state.dip_duck} onChange={setDipDuck} activeColor={dipColor} />
                    <DipSwitch horizontal label="Reverse" description="Reverse playback" value={state.dip_reverse} onChange={setDipReverse} activeColor={dipColor} />
                    <DipSwitch horizontal label="Half Speed" description="Half speed mode" value={state.dip_half_speed} onChange={setDipHalfSpeed} activeColor={dipColor} />
                    <DipSwitch horizontal label="Manual" description="Manual trigger mode" value={state.dip_manual} onChange={setDipManual} activeColor={dipColor} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-emerald-600/40 mb-5" />

            {/* Main Knobs */}
            <div className="mb-6 space-y-4">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">
                Main
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="SIZE" value={state.size} onChange={setSize} color={knobColor} size={72} />
                <Knob label="MIX" value={state.mix} onChange={setMix} color={knobColor} size={72} />
                <Knob label="OCTAVE" value={state.octave} onChange={setOctave} color={knobColor} size={72} />
                <Knob label="ERROR" value={state.error} onChange={setError} color={knobColor} size={72} />
                <Knob label="SUSTAIN" value={state.sustain} onChange={setSustain} color={knobColor} size={72} />
                <Knob label="TEXTURE" value={state.texture} onChange={setTexture} color={knobColor} size={72} />
                <Knob label="RAMP" value={state.ramp_speed} onChange={setRampSpeed} color={knobColor} size={72} />
              </div>

              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center pt-2">
                Hidden Options
              </div>
              <div className="flex justify-center items-end gap-4 flex-wrap">
                <Knob label="SENSITIVITY" value={state.sensitivity} onChange={setSensitivity} color={knobColor} size={72} />
                <Knob label="BALANCE" value={state.balance} onChange={setBalance} color={knobColor} size={72} />
                <Knob label="DUCK DEPTH" value={state.duck_depth} onChange={setDuckDepth} color={knobColor} size={72} />
                <Knob label="ERR BLEND" value={state.error_blend} onChange={setErrorBlend} color={knobColor} size={72} />
                <Knob label="USER FADE" value={state.user_fade} onChange={setUserFade} color={knobColor} size={72} />
                <Knob label="FILTER" value={state.filter} onChange={setFilter} color={knobColor} size={72} />
                <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={72} />
              </div>

              <div className="flex justify-center items-center gap-4 flex-wrap pt-1">
                <Toggle label="RAMP/BNC" value={state.ramp_bounce} onChange={setRampBounce} activeColor="green" />
                <Toggle label="MIDI CLK IGN" value={state.midi_clock_ignore} onChange={setMidiClockIgnore} activeColor="green" />
                <Toggle label="DRY KILL" value={state.dry_kill} onChange={setDryKill} activeColor="green" />
                <Toggle label="TRAILS" value={state.trails} onChange={setTrails} activeColor="green" />
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-emerald-600/40 mb-5" />

            {/* Toggle Selectors */}
            <div className="mb-5">
              <div className="flex justify-center items-start gap-5 flex-wrap">
                <VerticalSelector
                  label="ERROR TYPE"
                  value={state.error_type}
                  options={errorTypeOptions}
                  onChange={(v) => setErrorType(v as ErrorType)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="FADE MODE"
                  value={state.fade_mode}
                  options={fadeModeOptions}
                  onChange={(v) => setFadeMode(v as FadeMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="ANIMATE"
                  value={state.animate_mode}
                  options={animateModeOptions}
                  onChange={(v) => setAnimateMode(v as AnimateMode)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="ERR ROUTE"
                  value={state.error_routing}
                  options={routingOptions}
                  onChange={(v) => setErrorRouting(v as Routing)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="SUS ROUTE"
                  value={state.sustain_routing}
                  options={routingOptions}
                  onChange={(v) => setSustainRouting(v as Routing)}
                  optionColors={selectorColors}
                />
                <VerticalSelector
                  label="FX ROUTE"
                  value={state.effects_routing}
                  options={routingOptions}
                  onChange={(v) => setEffectsRouting(v as Routing)}
                  optionColors={selectorColors}
                />
              </div>
            </div>

            {/* Logo Area */}
            <div className="mt-5 text-center">
              <div className="text-lg font-bold text-emerald-400/80 tracking-widest">
                CHASE BLISS AUDIO
              </div>
              <div className="text-xs text-gray-400 font-semibold tracking-wide">
                ONWARD
              </div>
            </div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-emerald-400 mb-2">Main Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Size:</strong> Loop/grain size</li>
                <li><strong>Mix:</strong> Wet/dry blend</li>
                <li><strong>Octave:</strong> Octave shift amount</li>
                <li><strong>Error:</strong> Glitch/error density</li>
                <li><strong>Sustain:</strong> Freeze sustain time</li>
                <li><strong>Texture:</strong> Granular texture control</li>
                <li><strong>Ramp:</strong> Internal modulation speed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-400 mb-2">Hidden Options</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Sensitivity:</strong> Trigger sensitivity</li>
                <li><strong>Balance:</strong> Freeze/glitch balance</li>
                <li><strong>Duck Depth:</strong> Ducking depth</li>
                <li><strong>Err Blend:</strong> Error blend amount</li>
                <li><strong>User Fade:</strong> User-defined fade time</li>
                <li><strong>Filter:</strong> Output filter frequency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-400 mb-2">Routing &amp; Modes</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Error Type:</strong> Timing / Condition / Playback</li>
                <li><strong>Fade Mode:</strong> Long / User / Short</li>
                <li><strong>Animate:</strong> Vibrato / Off / Chorus</li>
                <li><strong>Routing:</strong> Glitch / Both / Freeze</li>
                <li><strong>Freeze/Glitch:</strong> Independent bypass toggles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="Onward"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      {/* Preset Drawer */}
      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="Onward"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
