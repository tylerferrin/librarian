# Chase Bliss Audio Preamp MK II

## Overview

The **Automatone Preamp MK II** is a collaboration between Chase Bliss Audio and Benson Amps, combining the legendary Benson Preamp circuit with Chase Bliss's innovative features including motorized faders, MIDI control, and extensive preset management.

**Manufacturer:** Chase Bliss Audio  
**Type:** Overdrive/Fuzz/Preamp  
**MIDI:** Full CC control, 30 presets (3 banks × 10)  
**Icon:** 🎚️

## Features

- **Benson Preamp Circuit**: FET-based recreation of the Chimera tube amp preamp
- **Parametric Midrange**: Active parametric EQ borrowed from the Chase Bliss Condor
- **Selectable Clipping**: Transistor only (stock), silicon, or germanium diodes
- **Silicon Fuzz**: With open or gated modes
- **Motorized Faders**: Automatically move to show preset positions
- **30 Presets**: Organized in 3 banks of 10 presets each
- **Expression/CV Control**: Full expression pedal and CV integration

## MIDI Implementation

### CC Assignments

#### Faders (0-127)

| Parameter | CC# | Range | Description |
|-----------|-----|-------|-------------|
| Volume | 14 | 0-127 | Master output volume |
| Treble | 15 | 0-127 | High frequency control |
| Mids | 16 | 0-127 | Parametric mids boost/cut (±18dB) |
| Frequency | 17 | 0-127 | Parametric mids center frequency (150Hz - 4kHz) |
| Bass | 18 | 0-127 | Low frequency control |
| Gain | 19 | 0-127 | Input drive/gain |

#### Arcade Buttons (Values 1-3)

| Parameter | CC# | Values | Description |
|-----------|-----|--------|-------------|
| Jump | 22 | 1=Off, 2=Jump to 0, 3=Jump to 5 | Preset navigation helper |
| Mids Position | 23 | 1=Off, 2=Pre, 3=Post | Place mids before or after preamp |
| Q Resonance | 24 | 1=Low, 2=Mid, 3=High | Width of parametric mids curve |
| Diode Clipping | 25 | 1=Off, 2=Silicon, 3=Germanium | Clipping diode selection |
| Fuzz Mode | 26 | 1=Off, 2=Open, 3=Gated | Silicon fuzz mode |

#### Other Controls

| Parameter | CC# | Range | Description |
|-----------|-----|-------|-------------|
| Preset Save | 27 | 0-29 | Save current settings to preset slot |
| Expression | 100 | 0-127 | Expression pedal input |
| Bypass | 102 | 0=Bypass, 1-127=Engage | Effect bypass |

### Preset System

The Preamp MK II has **30 preset slots** organized in **3 banks of 10 presets each**:

- **Bank 1**: Presets 0-9
- **Bank 2**: Presets 10-19
- **Bank 3**: Presets 20-29

**Saving Presets:**
- Send CC 27 with value 0-29 to save current state to that slot
- Example: `CC 27, Value 5` saves to preset 5

**Recalling Presets:**
- Send **Program Change 0-29** to recall the corresponding preset slot
- Example: `PC 4` loads bank one, preset four; `PC 17` loads bank two, preset seven; `PC 20` loads bank three, preset zero
- Motorized faders will move to show the preset's saved positions
- You can also use the footswitches on the pedal to recall presets

**Jump Button:**
- **Off** (1): Normal preset scrolling
- **Jump to 0** (2): Preset footswitch skips to preset 0
- **Jump to 5** (3): Preset footswitch skips to preset 5

This allows quick toggling between two presets or creating groups within a bank.

## Parameter Descriptions

### Benson Preamp Section

**Volume**: Master output level after all processing

**Gain**: Input drive level - ranges from clean boost to overdrive to fuzz-like tones

**Treble**: High frequency shelf control - boosts or cuts treble frequencies

**Bass**: Low frequency shelf control - boosts or cuts bass frequencies

### Parametric Midrange (Condor)

**Mids**: Boost or cut middle frequencies up to ±18dB
- Center position (64): Flat/neutral
- Above 64: Boost
- Below 64: Cut/scoop

**Frequency**: Select which frequency is affected by the Mids control
- 0: ~150 Hz (low mids)
- 127: ~4 kHz (upper mids)

**Q Resonance**: Width of the frequency curve
- **Low**: Wide hump or scoop affecting a broad range
- **Mid**: More focused midrange control
- **High**: Very narrow, peak-like boost or notch

**Mids Position**: Where the mids circuit sits in the signal chain
- **Off**: Parametric mids disabled
- **Pre**: Before the preamp/clipping (affects drive character)
- **Post**: After the preamp/clipping (shapes final tone)

### Clipping & Fuzz

**Diode Clipping**: Selects the clipping diodes for the preamp
- **Off**: Transistor only (stock Benson sound)
- **Silicon**: Symmetrical silicon clipping (tube screamer flavor)
- **Germanium**: Asymmetrical germanium clipping (vintage fuzz flavor)

**Fuzz Mode**: Silicon fuzz inserted **before** the preamp
- **Off**: Fuzz circuit disabled
- **Open**: Wide open fuzz with full sustain
- **Gated**: Gated fuzz that cuts off as notes decay

## Expression Pedal Setup

The Preamp MK II supports both **local** (per-preset) and **global** (shared across presets) expression settings. Expression is configured directly on the pedal using its footswitches and menu system.

**Local Expression** (default):
- Each preset has its own expression setting
- Allows different expression behaviors for each sound

**Global Expression**:
- One expression setting shared across all presets
- Activated via the pedal's menu system

**Setup Process** (on the pedal):
1. Enter expression setup menu (TAP + BYPASS simultaneously)
2. **E Page**: Move faders up (on) or down (off) to assign to expression
3. **T Page (Toe)**: Set fader positions at full expression
4. **H Page (Heel)**: Set fader positions at zero expression
5. Exit menu to save

**Note**: Expression setup is performed on the pedal itself, not via MIDI. The Librarian reflects the pedal's current state but cannot configure expression mappings.

## Tips & Tricks

### Tone Stack Tips

- Start with all tone controls at 12 o'clock (value 64)
- The Benson stack is interactive - adjust Gain first, then shape with Treble and Bass
- Lower Gain settings reveal the preamp's transparent, clean character
- Higher Gain settings add harmonic richness and compression

### Parametric Mids Tips

- Use **Pre** position to shape how the preamp responds to your playing
- Use **Post** position to sculpt the final tonal balance
- **Low Q** is great for gentle tonal shaping
- **High Q** is perfect for scooping specific problem frequencies or adding presence

### Clipping & Fuzz Combinations

- **Transistor + Fuzz Off**: Classic clean Benson tones
- **Silicon + Fuzz Open**: Thick, saturated lead tones
- **Germanium + Fuzz Gated**: Velcro-like sputtery fuzz
- Try running the parametric mids **Post** to tame harsh fuzz frequencies

### Preset Organization

With 3 banks of 10 presets:
- **Bank 1**: Clean to edge-of-breakup tones
- **Bank 2**: Overdrive and distortion
- **Bank 3**: Fuzz and experimental sounds

Use the Jump button to create "sub-banks" for quick toggling between favorite sounds.

## Troubleshooting

**Faders not moving:**
- The faders are motorized and should automatically update when recalling presets
- This is a hardware feature and does not affect MIDI control
- Ensure preset is fully loaded before expecting fader movement

**Arcade buttons not responding:**
- Arcade buttons use values 1-3 (not 0-127)
- Verify correct value is being sent

**Preset save not working:**
- Ensure CC 27 value is between 0-29
- The pedal saves the current **knob positions**, not the Librarian's state
- Move the pedal's faders to desired positions before saving

**MIDI channel mismatch:**
- **Default MIDI channel is 2** (per Chase Bliss manual)
- Librarian automatically uses channel 2 when connecting to Preamp MK II
- To change the pedal's channel: hold both stomp switches when powering on, then send a Program Change; the pedal will set itself to that channel

## Resources

- [Official Manual (PDF)](https://static1.squarespace.com/static/622176a9b8d15d57ffbf5700/t/622cbf2e003db512efcb552e/1647099699264/Preamp+MKII_Manual_Pedal_Chase+Bliss.pdf)
- [MIDI CC Reference](https://midi.guide/d/chase-bliss/preamp-mkii/)
- [Chase Bliss Audio Website](https://www.chaseblissaudio.com/)
- [YouTube Tutorials](https://www.youtube.com/ChaseBlissAudio)

## Related Pedals

- **Benson Preamp**: The original pedal this is based on
- **Chase Bliss Condor**: Source of the parametric midrange circuit
- **Chase Bliss Automatone CXM 1978**: Another pedal in the Automatone series

---

*Documentation for Librarian v1.0*  
*Last updated: February 2026*
