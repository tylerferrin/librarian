# Hologram Microcosm - MIDI Specification

**Last Updated:** February 12, 2026  
**Source:** [midi.guide](https://midi.guide/d/hologram/microcosm/)  
**Total Parameters:** 35 MIDI-controllable parameters

## Device Information

- **Manufacturer:** Hologram Electronics
- **Model:** Microcosm
- **MIDI Channel:** Configurable (typically Channel 1)
- **Connection:** Bluetooth MIDI (via CME WIDI Jack or similar) or USB MIDI
- **MIDI Implementation:** Control Change (CC) messages

---

## Time Controls

Parameters controlling timing, tempo, and synchronization.

| Parameter    | CC# | Range   | Type       | Values | Description |
|--------------|-----|---------|------------|--------|-------------|
| Subdivision  | 5   | 0-127   | Stepped    | 0: 1/4; 1: 1/2; 2: TAP; 3: 2x; 4: 4x; 5: 8x | Time subdivision relative to tempo |
| Time         | 10  | 0-127   | Continuous | — | Controls Time Subdivision or Global Tempo |
| Hold Sampler | 48  | 0-127   | Binary     | 0-63: Off; 64-127: On | Freeze audio into continuous playback cycle |
| Tap Tempo    | 93  | 0-127   | Trigger    | 0-127: Tap | Send multiple times to set tempo |

### Subdivision Values (CC 5)

| CC Value | Subdivision | Description |
|----------|-------------|-------------|
| 0        | 1/4         | Quarter note |
| 1        | 1/2         | Half note |
| 2        | TAP         | Follows tap tempo |
| 3        | 2x          | Double speed |
| 4        | 4x          | Quadruple speed |
| 5        | 8x          | 8x speed |

---

## Special Sauce

Core effect parameters that define the character and intensity of effects.

| Parameter | CC# | Range   | Type       | Description |
|-----------|-----|---------|------------|-------------|
| Activity  | 6   | 0-127   | Continuous | Effect density - increase for complexity and variety |
| Repeats   | 11  | 0-127   | Continuous | Effect duration or frequency - works with Activity knob |

**Note:** Repeats function varies from preset to preset.

---

## Modulation

Parameters controlling pitch and amplitude modulation.

| Parameter | CC# | Range   | Type    | Values | Description |
|-----------|-----|---------|---------|--------|-------------|
| Shape     | 7   | 0-127   | Stepped | 0-31: Square; 32-63: Ramp; 64-95: Triangle; 96-127: Saw | Modulation waveform shape |
| Frequency | 14  | 0-127   | Continuous | — | Pitch modulation rate (LFO speed) |
| Depth     | 19  | 0-127   | Continuous | — | Modulation intensity |

### Shape Waveforms (CC 7)

| CC Range | Waveform | Description |
|----------|----------|-------------|
| 0-31     | Square   | Hard on/off modulation |
| 32-63    | Ramp     | Gradual rise |
| 64-95    | Triangle | Symmetrical rise/fall |
| 96-127   | Saw      | Sharp fall, gradual rise |

---

## Filter

Low-pass filter controls for tone shaping.

| Parameter | CC# | Range   | Type       | Description |
|-----------|-----|---------|------------|-------------|
| Cutoff    | 8   | 0-127   | Continuous | Low-pass filter cutoff frequency |
| Resonance | 15  | 0-127   | Continuous | Filter resonance (Q factor) |

---

## Effect Controls

Master effect parameters and routing.

| Parameter      | CC#  | Range   | Type   | Values | Description |
|----------------|------|---------|--------|--------|-------------|
| Mix            | 9    | 0-127   | Continuous | — | Balance between input signal and effect (0: dry, 127: 100% wet) |
| Volume         | 16   | 0-127   | Continuous | — | Effect master output volume |
| Reverse Effect | 47   | 0-127   | Trigger | 0-127: Reverse | Reverse effect playback direction |
| Bypass         | 102  | 0-127   | Binary | 0-63: Bypass; 64-127: Engage | Engage or bypass Microcosm |

---

## Reverb

Ambient space and reverb controls.

| Parameter | CC# | Range   | Type    | Values | Description |
|-----------|-----|---------|---------|--------|-------------|
| Space     | 12  | 0-127   | Continuous | — | Reverb/delay mix amount (127 = 100% wet) |
| Time      | 20  | 0-127   | Stepped | 0-31: Bright room; 32-63: Dark medium; 64-95: Large hall; 96-127: Ambient | Reverb mode and length |

### Reverb Modes (CC 20)

| CC Range | Mode         | Character |
|----------|--------------|-----------|
| 0-31     | Bright Room  | Short, bright reverb |
| 32-63    | Dark Medium  | Medium length, darker tone |
| 64-95    | Large Hall   | Long reverb tail |
| 96-127   | Ambient      | Longest, most atmospheric |

**Note:** Usage values unconfirmed - verify with physical pedal testing.

---

## Phrase Looper

Complete looper functionality with 15 dedicated parameters.

### Looper Playback Controls

| Parameter                 | CC# | Range   | Type    | Values | Description |
|---------------------------|-----|---------|---------|--------|-------------|
| Loop Level                | 13  | 0-127   | Continuous | — | Playback volume of phrase looper |
| Looper Playback Speed     | 17  | 0-127   | Continuous | — | Continuous speed control |
| Looper Playback (Stepped) | 18  | 0-127   | Stepped | 0: 1/4; 1: 1/2; 2: TAP; 3: 2x; 4: 4x; 5: 8x | Stepped speed divisions |
| Fade Time                 | 21  | 0-127   | Continuous | — | Loop crossfade duration |

### Looper Mode Switches

| Parameter          | CC# | Range   | Type   | Values | Description |
|--------------------|-----|---------|--------|--------|-------------|
| On/Off             | 22  | 0-127   | Binary | 0-63: Off; 64-127: On | Enable/disable looper |
| Playback Direction | 23  | 0-127   | Binary | 0-63: Forward; 64-127: Reverse | Loop playback direction |
| Routing            | 24  | 0-127   | Binary | 0-63: Post-FX; 64-127: Pre-FX | Looper signal routing |
| Only               | 25  | 0-127   | Binary | 0-63: Looper & Effects; 64-127: Looper Only | Mute effects, use as traditional looper |
| Burst              | 26  | 0-127   | Binary | 0-63: Default; 64-127: Burst | Fast one-layer loop creation mode |
| Quantized          | 27  | 0-127   | Binary | 0-63: Free; 64-127: Quantize | Quantize loops to nearest beat |

**Important Notes:**
- **Looper Only Mode:** Pitch Modulation, Reverb, and Filter remain active even in Looper Only mode
- **Burst Mode:** Phrases recorded in Burst mode won't save in User Presets unless Burst is deselected after recording
- **Quantize Mode:** If global tempo changes, effect and loop may desync. Switch presets to re-sync to loop tempo

### Looper Transport Controls

| Parameter | CC# | Range   | Type    | Values | Description |
|-----------|-----|---------|---------|--------|-------------|
| Record    | 28  | 0-127   | Trigger | 0-127: Record | Start recording |
| Play      | 29  | 0-127   | Trigger | 0-127: Play | Start/resume playback |
| Overdub   | 30  | 0-127   | Trigger | 0-127: Overdub | Record additional layers on top of loop |
| Stop      | 31  | 0-127   | Trigger | 0-127: Stop | Stop playback (retains recording for recall) |
| Erase     | 34  | 0-127   | Trigger | 0-127: Erase | Delete entire loop |
| Undo      | 35  | 0-127   | Trigger | 0-127: Undo | Remove overdub layer (keeps initial phrase) |

**Looper Workflow:**
1. **CC 28** - Start recording
2. **CC 28 again** - Stop recording, start playback
3. **CC 30** - Add overdub layers
4. **CC 35** - Undo last overdub
5. **CC 31** - Stop playback
6. **CC 29** - Resume playback
7. **CC 34** - Erase everything

---

## Preset Management

| Parameter | CC# | Range   | Type    | Values | Description |
|-----------|-----|---------|---------|--------|-------------|
| Copy      | 45  | 0-127   | Trigger | 0-127: Copy | Copy current preset |
| Save      | 46  | 0-127   | Trigger | 0-127: Save | Save current settings to preset |

---

## MIDI Implementation Notes

### Message Format

All parameters use standard MIDI Control Change messages:

```
Status Byte: 0xB0 + (MIDI Channel - 1)
CC Number:   0-127 (parameter-specific)
Value:       0-127
```

Example (Channel 1, Activity = 80):
```
0xB0 0x06 0x50
```

### Parameter Types

1. **Continuous (0-127):** Full range, smooth parameter changes
2. **Binary (0-63 vs 64-127):** Two states - Off (0-63) or On (64-127)
3. **Stepped:** Discrete values for specific modes (e.g., Subdivision, Shape)
4. **Trigger:** Send any value to trigger action (e.g., Tap Tempo, Transport controls)

### Special Behaviors

- **Binary Parameters:** Use 0-63 for "Off" and 64-127 for "On" (not just 0 and 127)
- **Trigger Parameters:** Sending any value (0-127) triggers the action
- **Tap Tempo (CC 93):** Send multiple times with quarter-note timing to set tempo
- **Transport Controls:** Act as momentary triggers, not toggles
- **Shape Waveform:** Uses range-based values (0-31, 32-63, etc.)

### Parameter Interactions

- **Activity + Repeats:** Work together to define effect character
- **Looper Only Mode:** Doesn't disable all effects (Filter, Reverb, Modulation still active)
- **Quantize Mode:** Syncs loop to tempo but can desync if global tempo changes
- **Overdub Layer:** Can be undone without erasing the base loop

---

## Bluetooth MIDI Considerations

When using Bluetooth MIDI adapters:

- **Latency:** Expect 10-30ms latency (acceptable for parameter control, not real-time audio)
- **Connection Stability:** Keep adapter within ~10 feet of Mac/iPad
- **Interference:** Avoid crowded 2.4GHz environments
- **Battery Life:** WIDI Jack and similar adapters typically last 8-12 hours
- **Pairing:** Most adapters appear as MIDI devices automatically once paired

**Recommended Adapters:**
- CME WIDI Jack (USB MIDI to Bluetooth)
- Yamaha MD-BT01 (5-pin DIN to Bluetooth)
- Quicco Sound mi.1 (Bluetooth MIDI adapter)

---

## Testing Checklist

When implementing MIDI control:

- [ ] Verify all 7 main knobs respond (Activity, Repeats, Mix, etc.)
- [ ] Test time subdivision stepped values (CC 5: 0, 1, 2, 3, 4, 5)
- [ ] Test shape waveforms (CC 7: ranges 0-31, 32-63, 64-95, 96-127)
- [ ] Confirm binary parameters use 0-63/64-127 split (not 0/127)
- [ ] Test tap tempo with multiple CC 93 messages
- [ ] Verify bypass on/off (CC 102)
- [ ] Test all looper transport controls (Record, Play, Overdub, Stop, Undo, Erase)
- [ ] Test looper mode switches (Direction, Routing, Only, Burst, Quantize)
- [ ] Confirm reverb mode changes (CC 20: 0-31, 32-63, 64-95, 96-127)
- [ ] Test preset save/copy (CC 45, 46)
- [ ] Verify rapid CC updates don't cause MIDI buffer overflow
- [ ] Test Bluetooth MIDI latency and stability

---

## Effect Presets

The Microcosm has **44 factory presets** organized by effect type:

- **Granular:** 11 presets
- **Glitch:** 11 presets  
- **Delay:** 11 presets
- **Looper:** 11 presets

Each preset responds differently to Activity, Repeats, and other parameters. MIDI control allows precise recall and real-time manipulation across all presets.

---

## References

- **MIDI Guide Database:** https://midi.guide/d/hologram/microcosm/
- **Hologram Electronics:** https://hologramelectronics.com/
- **Microcosm Manual:** Check manufacturer website for latest documentation
- **MIDI Specification:** MIDI 1.0 Control Change messages
- **Bluetooth MIDI:** Apple CoreMIDI + Bluetooth LE

---

## Version History

- **2026-02-12:** Initial specification created for Librarian project
- **2023-01-10:** Last update to midi.guide database (source)

---

*This specification is based on community-contributed data. Verify ranges and behaviors with your physical Microcosm pedal, especially reverb mode values which are marked as unconfirmed.*
