// Chase Bliss Brothers AM Editor Component

import { useState } from 'react';
import { useBrothersAmEditor } from '@/hooks/pedals/brothers_am/useBrothersAmEditor';
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
  BrothersAmState,
  Gain2Type,
  TrebleBoost,
  Gain1Type,
} from '@/lib/midi/pedals/brothers-am';

interface BrothersAmEditorProps {
  deviceName: string;
}

export function BrothersAmEditor({ deviceName }: BrothersAmEditorProps) {
  const editor = useBrothersAmEditor(deviceName);
  const {
    state, isLoading, error,
    setGain2, setVolume2, setTone2, setPresence2,
    setGain1, setVolume1, setTone1, setPresence1,
    setGain2Type, setTrebleBoost, setGain1Type,
    setChannel1Bypass, setChannel2Bypass,
    setDipVolume1, setDipVolume2, setDipGain1, setDipGain2,
    setDipTone1, setDipTone2, setDipSweep, setDipPolarity,
    setDipHiGain1, setDipHiGain2, setDipMotoByp1, setDipMotoByp2,
    setDipPresLink1, setDipPresLink2, setDipMaster,
    setExpression,
    loadPreset, activePreset, isDirty, resetToPreset, resetToPedalDefault, clearActivePreset,
  } = editor;

  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg">Loading Brothers AM...</div>
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
      const bankState = await getBankState('BrothersAm');
      const assignedBanks = bankState.filter((slot) => slot.preset?.id === activePreset.id);
      for (const bank of assignedBanks) {
        await savePresetToBank(deviceName, activePreset.id, bank.bankNumber);
      }
      await loadPreset(state, activePreset.id, activePreset.name);
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadPreset = async (presetState: BrothersAmState, presetId?: string, presetName?: string, skipMidiSend?: boolean) => {
    loadPreset(presetState, presetId, presetName, skipMidiSend);
    setManagerOpen(false);
  };

  const knobColor = '#f97316';
  const dipColor = '#f97316';

  const gain2TypeOptions = [
    { value: 'Boost', label: 'BOOST' },
    { value: 'OD', label: 'OD' },
    { value: 'Dist', label: 'DIST' },
  ];
  const trebleBoostOptions = [
    { value: 'FullSun', label: 'FULL' },
    { value: 'Off', label: 'OFF' },
    { value: 'HalfSun', label: 'HALF' },
  ];
  const gain1TypeOptions = [
    { value: 'Dist', label: 'DIST' },
    { value: 'OD', label: 'OD' },
    { value: 'Boost', label: 'BOOST' },
  ];

  const selectorColors = ['#6b7280', '#f97316', '#b91c1c'];

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
          <h1 className="text-xl font-bold text-white mb-1">Chase Bliss Brothers AM</h1>
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
                label="Ch1 Active"
                value={state.channel1_bypass}
                onChange={setChannel1Bypass}
                activeColor="green"
              />
              <Toggle
                label="Ch2 Active"
                value={state.channel2_bypass}
                onChange={setChannel2Bypass}
                activeColor="orange"
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
              borderColor: '#f97316',
            }}
          >
            {/* DIP Switches */}
            <div className="mb-6">
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-4 text-center">
                DIP Switches
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0">
                {/* Left Bank */}
                <div>
                  <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Left Bank
                  </div>
                  <div className="space-y-2.5">
                    <DipSwitch horizontal label="Volume 1" description="Expand channel 1 volume range" value={state.dip_volume1} onChange={setDipVolume1} activeColor={dipColor} />
                    <DipSwitch horizontal label="Volume 2" description="Expand channel 2 volume range" value={state.dip_volume2} onChange={setDipVolume2} activeColor={dipColor} />
                    <DipSwitch horizontal label="Gain 1" description="Expand channel 1 gain range" value={state.dip_gain1} onChange={setDipGain1} activeColor={dipColor} />
                    <DipSwitch horizontal label="Gain 2" description="Expand channel 2 gain range" value={state.dip_gain2} onChange={setDipGain2} activeColor={dipColor} />
                    <DipSwitch horizontal label="Tone 1" description="Expand channel 1 tone range" value={state.dip_tone1} onChange={setDipTone1} activeColor={dipColor} />
                    <DipSwitch horizontal label="Tone 2" description="Expand channel 2 tone range" value={state.dip_tone2} onChange={setDipTone2} activeColor={dipColor} />
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
                    <DipSwitch horizontal label="Hi Gain 1" description="High gain mode channel 1" value={state.dip_hi_gain1} onChange={setDipHiGain1} activeColor={dipColor} />
                    <DipSwitch horizontal label="Hi Gain 2" description="High gain mode channel 2" value={state.dip_hi_gain2} onChange={setDipHiGain2} activeColor={dipColor} />
                    <DipSwitch horizontal label="Moto Byp 1" description="Motor bypass channel 1" value={state.dip_moto_byp1} onChange={setDipMotoByp1} activeColor={dipColor} />
                    <DipSwitch horizontal label="Moto Byp 2" description="Motor bypass channel 2" value={state.dip_moto_byp2} onChange={setDipMotoByp2} activeColor={dipColor} />
                    <DipSwitch horizontal label="Pres Link 1" description="Link presence to channel 1" value={state.dip_pres_link1} onChange={setDipPresLink1} activeColor={dipColor} />
                    <DipSwitch horizontal label="Pres Link 2" description="Link presence to channel 2" value={state.dip_pres_link2} onChange={setDipPresLink2} activeColor={dipColor} />
                    <DipSwitch horizontal label="Master" description="Master volume mode" value={state.dip_master} onChange={setDipMaster} activeColor={dipColor} />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-orange-600/40 mb-5" />

            {/* Two-Channel Layout */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Channel 2 */}
              <div className="bg-black/20 rounded-lg p-4 border border-orange-600/30">
                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-3 text-center">
                  Channel 2
                </div>
                <div className="flex justify-center items-end gap-3 flex-wrap mb-4">
                  <Knob label="GAIN" value={state.gain2} onChange={setGain2} color={knobColor} size={64} />
                  <Knob label="VOLUME" value={state.volume2} onChange={setVolume2} color={knobColor} size={64} />
                  <Knob label="TONE" value={state.tone2} onChange={setTone2} color={knobColor} size={64} />
                  <Knob label="PRESENCE" value={state.presence2} onChange={setPresence2} color={knobColor} size={64} />
                </div>
                <div className="flex justify-center">
                  <VerticalSelector
                    label="GAIN TYPE"
                    value={state.gain2_type}
                    options={gain2TypeOptions}
                    onChange={(v) => setGain2Type(v as Gain2Type)}
                    optionColors={selectorColors}
                  />
                </div>
              </div>

              {/* Channel 1 */}
              <div className="bg-black/20 rounded-lg p-4 border border-orange-600/30">
                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-3 text-center">
                  Channel 1
                </div>
                <div className="flex justify-center items-end gap-3 flex-wrap mb-4">
                  <Knob label="GAIN" value={state.gain1} onChange={setGain1} color={knobColor} size={64} />
                  <Knob label="VOLUME" value={state.volume1} onChange={setVolume1} color={knobColor} size={64} />
                  <Knob label="TONE" value={state.tone1} onChange={setTone1} color={knobColor} size={64} />
                  <Knob label="PRESENCE" value={state.presence1} onChange={setPresence1} color={knobColor} size={64} />
                </div>
                <div className="flex justify-center">
                  <VerticalSelector
                    label="GAIN TYPE"
                    value={state.gain1_type}
                    options={gain1TypeOptions}
                    onChange={(v) => setGain1Type(v as Gain1Type)}
                    optionColors={selectorColors}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-orange-600/40 mb-5" />

            {/* Shared Controls */}
            <div className="mb-5">
              <div className="flex justify-center items-start gap-6 flex-wrap">
                <VerticalSelector
                  label="TREBLE BOOST"
                  value={state.treble_boost}
                  options={trebleBoostOptions}
                  onChange={(v) => setTrebleBoost(v as TrebleBoost)}
                  optionColors={selectorColors}
                />
                <div className="flex flex-col items-center gap-2">
                  <Knob label="EXPRESSION" value={state.expression} onChange={setExpression} color={knobColor} size={64} />
                </div>
              </div>
            </div>

            {/* Logo Area */}
            <div className="mt-5 text-center">
              <div className="text-lg font-bold text-orange-400/80 tracking-widest">
                CHASE BLISS AUDIO
              </div>
              <div className="text-xs text-gray-400 font-semibold tracking-wide">
                BROTHERS AM
              </div>
            </div>
          </div>
        </div>

        {/* Control Reference */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-semibold text-white mb-2">Control Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">Channel Controls</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Gain:</strong> Drive/gain level per channel</li>
                <li><strong>Volume:</strong> Output level per channel</li>
                <li><strong>Tone:</strong> Treble/bass balance per channel</li>
                <li><strong>Presence:</strong> High-frequency presence per channel</li>
                <li><strong>Gain Type:</strong> Boost / Overdrive / Distortion</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">Shared Controls</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Treble Boost:</strong> Full Sun / Off / Half Sun</li>
                <li><strong>Expression:</strong> Expression pedal value</li>
                <li><strong>Ch1/Ch2 Active:</strong> Channel bypass states</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-400 mb-2">DIP Switches</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Hi Gain 1/2:</strong> High gain mode per channel</li>
                <li><strong>Moto Byp 1/2:</strong> Motor bypass per channel</li>
                <li><strong>Pres Link 1/2:</strong> Presence link per channel</li>
                <li><strong>Master:</strong> Master volume mode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Dialog */}
      <SaveToLibraryDialog
        isOpen={libraryDialogOpen}
        onClose={() => setLibraryDialogOpen(false)}
        pedalType="BrothersAm"
        currentState={state}
        onSaved={handleLibrarySaved}
      />

      {/* Preset Drawer */}
      <PresetDrawer
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        deviceName={deviceName}
        pedalType="BrothersAm"
        currentState={state}
        activePresetId={activePreset?.id}
        onLoadPreset={handleLoadPreset}
        onPresetSaved={handleLibrarySaved}
      />
    </div>
  );
}
