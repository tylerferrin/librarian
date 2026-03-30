// Chase Bliss Mood MkII Editor Component

import { useState } from 'react';
import { useMoodMkiiEditor } from '@/hooks/pedals/mood_mkii/useMoodMkiiEditor';
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
  MoodMkiiState,
  WetChannelRouting,
  MoodRouting,
  MicroLooper,
  MoodSync,
  MoodSpread,
} from '@/lib/midi/pedals/mood-mkii';

interface MoodMkiiEditorProps {
  deviceName: string;
}

export function MoodMkiiEditor({ deviceName }: MoodMkiiEditorProps) {
  const editor = useMoodMkiiEditor(deviceName);
  const {
    state, isLoading, error,
    setTime, setMix, setLength, setModifyWet, setClock, setModifyLooper, setRampSpeed,
    setWetChannelRouting, setRouting, setMicroLooper,
    setStereoWidth, setRampingWaveform, setFade, setTone, setLevelBalance, setDirectMicroLoop,
    setSync, setSpread, setBufferLength,
    setBypassLeft, setBypassRight, setHiddenMenu, setFreeze, setOverdub,
    setDipTime, setDipModifyWet, setDipClock, setDipModifyLooper, setDipLength,
    setDipBounce, setDipSweep, setDipPolarity,
    setDipClassic, setDipMiso, setDipSpread, setDipDryKill, setDipTrails,
    setDipLatch, setDipNoDub, setDipSmooth,
    setRampBounce, setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Mood MkII...</div>
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
      const bankState = await getBankState('MoodMkii');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: MoodMkiiState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#0d9488';
  const dipColor = '#0d9488';
  const selectorColors = ['#6b7280', '#0d9488', '#b91c1c'];

  const wetChannelOptions = [
    { value: 'Reverb', label: 'REVERB' },
    { value: 'Delay', label: 'DELAY' },
    { value: 'Slip', label: 'SLIP' },
  ];
  const routingOptions = [
    { value: 'Lfo', label: 'LFO' },
    { value: 'Mid', label: 'MID' },
    { value: 'Env', label: 'ENV' },
  ];
  const microLooperOptions = [
    { value: 'Env', label: 'ENV' },
    { value: 'Tape', label: 'TAPE' },
    { value: 'Stretch', label: 'STRETCH' },
  ];
  const syncOptions = [
    { value: 'On', label: 'ON' },
    { value: 'NoSync', label: 'NO SYNC' },
    { value: 'Auto', label: 'AUTO' },
  ];
  const spreadOptions = [
    { value: 'Only', label: 'ONLY' },
    { value: 'Both', label: 'BOTH' },
    { value: 'OnlyAlt', label: 'ONLY ALT' },
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
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Mood MkII</h1>
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
              <Toggle label="Left" value={state.bypass_left} onChange={setBypassLeft} activeColor="green" />
              <Toggle label="Right" value={state.bypass_right} onChange={setBypassRight} activeColor="green" />
              <Toggle label="Freeze" value={state.freeze} onChange={setFreeze} activeColor="blue" />
              <Toggle label="Overdub" value={state.overdub} onChange={setOverdub} activeColor="blue" />
              <Toggle label="Hidden" value={state.hidden_menu} onChange={setHiddenMenu} activeColor="purple" />
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
            background: 'linear-gradient(135deg, #0a1628 0%, #0d2a2a 50%, #0a3d3d 100%)',
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
                  <DipSwitch horizontal label="Time" description="Expand time range" value={state.dip_time} onChange={setDipTime} activeColor={dipColor} />
                  <DipSwitch horizontal label="Mod Wet" description="Expand modify wet range" value={state.dip_modify_wet} onChange={setDipModifyWet} activeColor={dipColor} />
                  <DipSwitch horizontal label="Clock" description="Expand clock range" value={state.dip_clock} onChange={setDipClock} activeColor={dipColor} />
                  <DipSwitch horizontal label="Mod Lpr" description="Expand modify looper range" value={state.dip_modify_looper} onChange={setDipModifyLooper} activeColor={dipColor} />
                  <DipSwitch horizontal label="Length" description="Expand loop length range" value={state.dip_length} onChange={setDipLength} activeColor={dipColor} />
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
                  <DipSwitch horizontal label="Classic" description="Classic mode" value={state.dip_classic} onChange={setDipClassic} activeColor={dipColor} />
                  <DipSwitch horizontal label="MISO" description="Mono in, stereo out" value={state.dip_miso} onChange={setDipMiso} activeColor={dipColor} />
                  <DipSwitch horizontal label="Spread" description="Stereo spread" value={state.dip_spread} onChange={setDipSpread} activeColor={dipColor} />
                  <DipSwitch horizontal label="Dry Kill" description="Kill dry signal" value={state.dip_dry_kill} onChange={setDipDryKill} activeColor={dipColor} />
                  <DipSwitch horizontal label="Trails" description="Enable trails on bypass" value={state.dip_trails} onChange={setDipTrails} activeColor={dipColor} />
                  <DipSwitch horizontal label="Latch" description="Latch looper" value={state.dip_latch} onChange={setDipLatch} activeColor={dipColor} />
                  <DipSwitch horizontal label="No Dub" description="Disable overdub" value={state.dip_no_dub} onChange={setDipNoDub} activeColor={dipColor} />
                  <DipSwitch horizontal label="Smooth" description="Smooth looper transitions" value={state.dip_smooth} onChange={setDipSmooth} activeColor={dipColor} />
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
              <Knob label="TIME" value={state.time} onChange={setTime} color={knobColor} size={72} />
              <Knob label="MIX" value={state.mix} onChange={setMix} color={knobColor} size={72} />
              <Knob label="LENGTH" value={state.length} onChange={setLength} color={knobColor} size={72} />
              <Knob label="MOD WET" value={state.modify_wet} onChange={setModifyWet} color={knobColor} size={72} />
              <Knob label="CLOCK" value={state.clock} onChange={setClock} color={knobColor} size={72} />
              <Knob label="MOD LOOP" value={state.modify_looper} onChange={setModifyLooper} color={knobColor} size={72} />
              <Knob label="RAMP" value={state.ramp_speed} onChange={setRampSpeed} color={knobColor} size={72} />
            </div>

            <div className="text-[10px] font-bold uppercase tracking-widest text-center pt-2" style={{ color: knobColor }}>Hidden Menu</div>
            <div className="flex justify-center items-end gap-4 flex-wrap">
              <Knob label="STEREO W" value={state.stereo_width} onChange={setStereoWidth} color={knobColor} size={72} />
              <Knob label="RAMP WFMR" value={state.ramping_waveform} onChange={setRampingWaveform} color={knobColor} size={72} />
              <Knob label="FADE" value={state.fade} onChange={setFade} color={knobColor} size={72} />
              <Knob label="TONE" value={state.tone} onChange={setTone} color={knobColor} size={72} />
              <Knob label="LEVEL BAL" value={state.level_balance} onChange={setLevelBalance} color={knobColor} size={72} />
              <Knob label="DIR LOOP" value={state.direct_micro_loop} onChange={setDirectMicroLoop} color={knobColor} size={72} />
              <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={72} />
              <Toggle label="RAMP/BNC" value={state.ramp_bounce} onChange={setRampBounce} activeColor="teal" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-5" style={{ backgroundColor: `${knobColor}60` }} />

          {/* Toggle Selectors */}
          <div className="mb-5">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3 text-center" style={{ color: knobColor }}>Controls</div>
            <div className="flex justify-center items-start gap-5 flex-wrap">
              <VerticalSelector
                label="WET CH"
                value={state.wet_channel_routing}
                options={wetChannelOptions}
                onChange={(v) => setWetChannelRouting(v as WetChannelRouting)}
                optionColors={selectorColors}
              />
              <VerticalSelector
                label="ROUTING"
                value={state.routing}
                options={routingOptions}
                onChange={(v) => setRouting(v as MoodRouting)}
                optionColors={selectorColors}
              />
              <VerticalSelector
                label="MICRO LPR"
                value={state.micro_looper}
                options={microLooperOptions}
                onChange={(v) => setMicroLooper(v as MicroLooper)}
                optionColors={selectorColors}
              />
              <VerticalSelector
                label="SYNC"
                value={state.sync}
                options={syncOptions}
                onChange={(v) => setSync(v as MoodSync)}
                optionColors={selectorColors}
              />
              <VerticalSelector
                label="SPREAD"
                value={state.spread}
                options={spreadOptions}
                onChange={(v) => setSpread(v as MoodSpread)}
                optionColors={selectorColors}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">BUFFER</div>
                <Toggle
                  label={state.buffer_length ? 'FULL' : 'HALF MKI'}
                  value={state.buffer_length}
                  onChange={setBufferLength}
                  activeColor="teal"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="mt-5 text-center">
            <div className="text-lg font-bold tracking-widest" style={{ color: `${knobColor}cc` }}>
              CHASE BLISS AUDIO
            </div>
            <div className="text-xs text-gray-400 font-semibold tracking-wide">MOOD MkII</div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>Main Knobs</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Time:</strong> Delay/reverb time</li>
                <li><strong>Mix:</strong> Wet/dry blend</li>
                <li><strong>Length:</strong> Loop length</li>
                <li><strong>Mod Wet:</strong> Modulation of wet signal</li>
                <li><strong>Clock:</strong> Internal clock rate</li>
                <li><strong>Mod Loop:</strong> Looper modulation</li>
                <li><strong>Ramp:</strong> Internal ramp speed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>Wet Channel Routing</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Reverb:</strong> Route wet to reverb side</li>
                <li><strong>Delay:</strong> Route wet to delay side</li>
                <li><strong>Slip:</strong> Route wet to slip looper</li>
              </ul>
              <h4 className="font-semibold mb-2 mt-3" style={{ color: knobColor }}>Micro-Looper</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Env:</strong> Envelope-triggered</li>
                <li><strong>Tape:</strong> Tape-style looping</li>
                <li><strong>Stretch:</strong> Time-stretching</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: knobColor }}>DIP Switches</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Classic:</strong> Classic Mood mode</li>
                <li><strong>Spread:</strong> Stereo spread effect</li>
                <li><strong>MISO:</strong> Mono in, stereo out</li>
                <li><strong>Dry Kill:</strong> Remove dry signal</li>
                <li><strong>Trails:</strong> Trails on bypass</li>
                <li><strong>No Dub:</strong> Disable overdub</li>
                <li><strong>Smooth:</strong> Smooth transitions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="MoodMkii"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="MoodMkii"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
