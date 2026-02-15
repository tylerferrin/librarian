import { useMicrocosmEditor } from '../hooks/useMicrocosmEditor';
import { Knob, Toggle, TapButton, Select, GridSelector } from './controls';
import { ParameterCard } from './controls/ParameterCard';
import { EffectSelector } from './EffectSelector';
import type { SubdivisionValue, WaveformShape, PlaybackDirection, LooperRouting } from '../lib/midi';

interface MicrocosmEditorProps {
  deviceName: string;
}

const subdivisionOptions = [
  { value: 'QuarterNote', label: '1/4' },
  { value: 'HalfNote', label: '1/2' },
  { value: 'Tap', label: 'TAP' },
  { value: 'Double', label: '2x' },
  { value: 'Quadruple', label: '4x' },
  { value: 'Octuple', label: '8x' },
];

const shapeOptions = [
  { value: 'Square', label: 'Square' },
  { value: 'Ramp', label: 'Ramp' },
  { value: 'Triangle', label: 'Triangle' },
  { value: 'Saw', label: 'Saw' },
];

const directionOptions = [
  { value: 'Forward', label: 'Forward' },
  { value: 'Reverse', label: 'Reverse' },
];

const routingOptions = [
  { value: 'PostFX', label: 'Post FX' },
  { value: 'PreFX', label: 'Pre FX' },
];

export function MicrocosmEditor({ deviceName }: MicrocosmEditorProps) {
  const editor = useMicrocosmEditor(deviceName);
  const { state } = editor;


  if (editor.isLoading || !state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-secondary">Loading parameters...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {/* Preset & Global Controls */}
      <div className="flex items-center gap-4 flex-wrap bg-card-bg border border-border-light rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Toggle
            label="Bypass"
            value={state.bypass}
            onChange={editor.setBypass}
            activeColor="green"
          />
        </div>
        <div className="h-8 w-px bg-border-light" />
        <TapButton
          label="TAP Tempo"
          onTap={editor.tapTempo}
          variant="accent"
        />
        <Toggle
          label="Reverse Effect"
          value={state.reverse_effect}
          onChange={editor.setReverseEffect}
          activeColor="red"
        />
        <div className="flex-1" />
        <TapButton
          label="Save Preset"
          onTap={editor.presetSave}
        />
        <TapButton
          label="Copy Preset"
          onTap={editor.presetCopy}
        />
      </div>

      {/* Effect Type Selection */}
      <EffectSelector
        currentEffect={state.current_effect}
        currentVariation={state.current_variation}
        onSelectEffect={editor.setEffect}
      />

      {/* Main Parameter Grid - 8 Knobs matching physical pedal layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Knob 1: Activity */}
        <ParameterCard title="Activity">
          <Knob
            label="Activity"
            value={state.activity}
            onChange={editor.setActivity}
          />
        </ParameterCard>

        {/* Knob 2: Shape | Mod Freq. */}
        <ParameterCard title="Shape | Mod Freq.">
          <GridSelector
            label="Shape"
            value={state.shape}
            options={shapeOptions}
            onChange={(v) => editor.setShape(v as WaveformShape)}
            columns={2}
          />
          <Knob
            label="Mod Freq."
            value={state.frequency}
            onChange={editor.setFrequency}
          />
        </ParameterCard>

        {/* Knob 3: Filter | Filter Resonance */}
        <ParameterCard title="Filter | Filter Resonance">
          <div className="flex gap-3 items-center justify-center">
            <Knob
              label="Filter"
              value={state.cutoff}
              onChange={editor.setCutoff}
            />
            <Knob
              label="Filter Resonance"
              value={state.resonance}
              onChange={editor.setResonance}
            />
          </div>
        </ParameterCard>

        {/* Knob 4: Mix | Effect Volume */}
        <ParameterCard title="Mix | Effect Volume">
          <div className="flex gap-3 items-center justify-center">
            <Knob
              label="Mix"
              value={state.mix}
              onChange={editor.setMix}
            />
            <Knob
              label="Effect Volume"
              value={state.volume}
              onChange={editor.setVolume}
            />
          </div>
        </ParameterCard>

        {/* Knob 5: Time */}
        <ParameterCard title="Time">
          <GridSelector
            label="Subdiv"
            value={state.subdivision}
            options={subdivisionOptions}
            onChange={(v) => editor.setSubdivision(v as SubdivisionValue)}
            columns={3}
          />
          <Knob
            label="Time"
            value={state.time}
            onChange={editor.setTime}
          />
          <Toggle
            label="Hold Sampler"
            value={state.hold_sampler}
            onChange={editor.setHoldSampler}
          />
        </ParameterCard>

        {/* Knob 6: Repeats | Mod Depth */}
        <ParameterCard title="Repeats | Mod Depth">
          <div className="flex gap-3 items-center justify-center">
            <Knob
              label="Repeats"
              value={state.repeats}
              onChange={editor.setRepeats}
            />
            <Knob
              label="Mod Depth"
              value={state.depth}
              onChange={editor.setDepth}
            />
          </div>
        </ParameterCard>

        {/* Knob 7: Space | Reverb Time */}
        <ParameterCard title="Space | Reverb Time">
          <div className="flex gap-3 items-center justify-center">
            <Knob
              label="Space"
              value={state.space}
              onChange={editor.setSpace}
            />
            <Knob
              label="Reverb Time"
              value={state.reverb_time}
              onChange={editor.setReverbTime}
            />
          </div>
        </ParameterCard>

        {/* Knob 8: Loop Level | Looper Fade Time */}
        <ParameterCard title="Loop Level | Looper Fade Time">
          <div className="flex gap-3 items-center justify-center">
            <Knob
              label="Loop Level"
              value={state.loop_level}
              onChange={editor.setLoopLevel}
            />
            <Knob
              label="Looper Fade Time"
              value={state.fade_time}
              onChange={editor.setFadeTime}
            />
          </div>
        </ParameterCard>
      </div>

      {/* Phrase Looper - Full Width */}
      <ParameterCard title="Phrase Looper" className="w-full">
        <div className="w-full space-y-4">
          {/* Looper Transport */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <TapButton label="Record" onTap={editor.looperRecord} variant="danger" />
            <TapButton label="Play" onTap={editor.looperPlay} variant="accent" />
            <TapButton label="Overdub" onTap={editor.looperOverdub} variant="accent" />
            <TapButton label="Stop" onTap={editor.looperStop} />
            <TapButton label="Undo" onTap={editor.looperUndo} />
            <TapButton label="Erase" onTap={editor.looperErase} variant="danger" />
          </div>

          <div className="h-px bg-border-light" />

          {/* Looper Parameters */}
          <div className="flex flex-wrap gap-4 justify-center items-start">
            <Toggle
              label="Enable"
              value={state.looper_enabled}
              onChange={editor.setLooperEnabled}
            />
            <Knob
              label="Looper Playback Speed"
              value={state.looper_speed}
              onChange={editor.setLooperSpeed}
            />
            <GridSelector
              label="Speed (Stepped)"
              value={state.looper_speed_stepped}
              options={subdivisionOptions}
              onChange={(v) => editor.setLooperSpeedStepped(v as SubdivisionValue)}
              columns={3}
            />
            <GridSelector
              label="Direction"
              value={state.playback_direction}
              options={directionOptions}
              onChange={(v) => editor.setPlaybackDirection(v as PlaybackDirection)}
              columns={2}
            />
            <GridSelector
              label="Routing"
              value={state.routing}
              options={routingOptions}
              onChange={(v) => editor.setRouting(v as LooperRouting)}
              columns={2}
            />
          </div>

          <div className="h-px bg-border-light" />

          {/* Looper Modes */}
          <div className="flex flex-wrap gap-6 justify-center">
            <Toggle
              label="Looper Only"
              value={state.looper_only}
              onChange={editor.setLooperOnly}
            />
            <Toggle
              label="Burst"
              value={state.burst_mode}
              onChange={editor.setBurstMode}
            />
            <Toggle
              label="Quantize"
              value={state.quantized}
              onChange={editor.setQuantized}
            />
          </div>
        </div>
      </ParameterCard>
    </div>
  );
}
