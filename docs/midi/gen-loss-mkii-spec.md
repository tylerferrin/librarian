# Chase Bliss Generation Loss MKII - MIDI Specification

**Last Updated:** February 12, 2026  
**Source:** [midi.guide](https://midi.guide/d/chase-bliss/generation-loss-mkii/)  
**Total Parameters:** 41 MIDI-controllable parameters

## Device Information

- **Manufacturer:** Chase Bliss Audio
- **Model:** Generation Loss MKII
- **MIDI Channel:** Configurable (typically Channel 1)
- **Connection:** USB MIDI (Class Compliant)
- **MIDI Implementation:** Control Change (CC) messages

---

## Main Control Knobs

These are the primary knobs on the pedal face.

| Parameter      | CC# | Range     | Type       | Default | Description |
|----------------|-----|-----------|------------|---------|-------------|
| Wow            | 14  | 0-127     | Continuous | 64      | Tape wow modulation amount |
| Volume         | 15  | 0-127     | Continuous | 100     | Output volume level |
| Model / LP     | 16  | 0-127     | Stepped    | 0       | Tape model selection (see Model Values below) |
| Flutter        | 17  | 0-127     | Continuous | 64      | Tape flutter modulation amount |
| Saturate / Gen | 18  | 0-127     | Continuous | 64      | Tape saturation / generation loss amount |
| Failure / HP   | 19  | 0-127     | Continuous | 0       | Tape failure amount / high-pass filter |
| Ramp Speed     | 20  | 0-127     | Continuous | 64      | Speed of parameter ramping |

### Model / LP Values (CC 16)

The Model parameter uses specific CC values to select different tape machine models:

| CC Value | Model Name      | Description |
|----------|-----------------|-------------|
| 0        | None            | No tape model |
| 15       | CPR-3300 Gen 1  | Compact cassette recorder, generation 1 |
| 24       | CPR-3300 Gen 2  | Compact cassette recorder, generation 2 |
| 33       | CPR-3300 Gen 3  | Compact cassette recorder, generation 3 |
| 43       | Portamax-RT     | Portable cassette recorder, real-time |
| 53       | Portamax-HT     | Portable cassette recorder, high-speed |
| 62       | CAM-8           | Camcorder audio |
| 72       | DICTATRON-EX    | Dictation machine, external mic |
| 82       | DICTATRON-IN    | Dictation machine, internal mic |
| 91       | FISHY 60        | Low-fidelity tape |
| 101      | MS-WALKER       | Personal stereo |
| 111      | AMU-2           | Answering machine unit |
| 127      | M-PEX           | Maximum degradation |

---

## Three-Position Toggle Switches

These toggles have three distinct positions.

| Parameter | CC# | Range | Type    | Values | Description |
|-----------|-----|-------|---------|--------|-------------|
| Dry       | 22  | 1-3   | Stepped | 1: Dry 1; 2: Dry 2; 3: Dry 3 | Dry signal routing mode |
| Noise     | 23  | 1-3   | Stepped | 1: Noise 1; 2: Noise 2; 3: Noise 3 | Noise character selection |
| Aux       | 21  | 1-3   | Stepped | 1: Aux 1; 2: Aux 2; 3: Aux 3 | Auxiliary function mode |

---

## Footswitches

Main pedal footswitches for bypass and mode control.

| Parameter     | CC#  | Range   | Type   | Values | Description |
|---------------|------|---------|--------|--------|-------------|
| Bypass/Engage | 102  | 0-127   | Binary | 0: Pedal off; 1-127: Pedal on | True bypass / engage |
| Aux Switch    | 103  | 0-127   | Binary | 0: Off; 1-127: On | Auxiliary footswitch |
| Alt Mode      | 104  | 0-127   | Binary | 0: Alt enter; 1-127: Alt exit | ALT parameter mode toggle |

---

## External Aux Switch (Chase Bliss Faves Switch)

External switch for preset recall or parameter control.

| Parameter     | CC#  | Range   | Type   | Values | Description |
|---------------|------|---------|--------|--------|-------------|
| Left Switch   | 105  | 0-127   | Binary | 0: Off; 1-127: On | Left footswitch |
| Center Switch | 106  | 0-127   | Binary | 0: Off; 1-127: On | Center footswitch |
| Right Switch  | 107  | 0-127   | Binary | 0: Off; 1-127: On | Right footswitch |

---

## DIP Switches - Left Bank

The left bank of 8 DIP switches controls parameter behavior and modulation routing.

| Parameter  | CC# | Range   | Type   | Values | Description |
|------------|-----|---------|--------|--------|-------------|
| Wow        | 61  | 0-127   | Binary | 0: Off; 1-127: On | Wow modulation enable |
| Flutter    | 62  | 0-127   | Binary | 0: Off; 1-127: On | Flutter modulation enable |
| Sat/Gen    | 63  | 0-127   | Binary | 0: Off; 1-127: On | Saturation/Generation enable |
| Failure/HP | 64  | 0-127   | Binary | 0: Off; 1-127: On | Failure/High-pass enable |
| Model/LP   | 65  | 0-127   | Binary | 0: Off; 1-127: On | Model/Low-pass enable |
| Bounce     | 66  | 0-127   | Binary | 0: Off; 1-127: On | Bounce mode enable |
| Random     | 67  | 0-127   | Binary | 0: Off; 1-127: On | Random modulation enable |
| Sweep      | 68  | 0-127   | Binary | 0: B (bottom); 1-127: T (top) | Sweep direction |

---

## DIP Switches - Right Bank

The right bank of 8 DIP switches controls advanced features and signal path options.

| Parameter | CC# | Range   | Type   | Values | Description |
|-----------|-----|---------|--------|--------|-------------|
| Polarity  | 71  | 0-127   | Binary | 0: F (forward); 1-127: R (reverse) | Modulation polarity |
| Classic   | 72  | 0-127   | Binary | 0: Off; 1-127: On | Classic mode enable |
| Miso      | 73  | 0-127   | Binary | 0: Off; 1-127: On | Miso mode enable |
| Spread    | 74  | 0-127   | Binary | 0: Off; 1-127: On | Stereo spread enable |
| Dry Type  | 75  | 0-127   | Binary | 0: Off; 1-127: On | Dry signal type |
| Drop Byp  | 76  | 0-127   | Binary | 0: Off; 1-127: On | Dropout bypass enable |
| Snag Byp  | 77  | 0-127   | Binary | 0: Off; 1-127: On | Snag bypass enable |
| Hum Byp   | 78  | 0-127   | Binary | 0: Off; 1-127: On | Hum bypass enable |

---

## Advanced Parameters

Additional control parameters for fine-tuning and system configuration.

| Parameter              | CC#  | Range   | Type       | Values | Description |
|------------------------|------|---------|------------|--------|-------------|
| Expression Pedal       | 100  | 0-127   | Continuous | —      | Expression pedal input |
| Aux Onset Time         | 24   | 0-127   | Continuous | —      | Auxiliary function onset timing |
| Hiss Level             | 27   | 0-127   | Continuous | —      | Tape hiss amount |
| Mechanical Noise Level | 28   | 0-127   | Continuous | —      | Mechanical tape noise amount |
| Crinkle Pop Level      | 29   | 0-127   | Continuous | —      | Tape crinkle/pop artifact level |
| Input Gain             | 32   | 1-3     | Stepped    | 1: Line level; 2: Instrument level; 3: High gain | Input gain stage |
| DSP Bypass             | 26   | 0-127   | Binary     | 0-63: True bypass; 64-127: DSP bypass | Bypass mode selection |
| Preset Save            | 111  | 1-122   | Stepped    | 1-122: Preset slot number | Save current settings to preset |
| Ramp/Bounce            | 52   | 0-127   | Binary     | 0: Off; 1-127: On | Ramp/Bounce mode toggle |

---

## MIDI Implementation Notes

### Message Format

All parameters use standard MIDI Control Change messages:

```
Status Byte: 0xB0 + (MIDI Channel - 1)
CC Number:   0-127 (parameter-specific)
Value:       0-127
```

Example (Channel 1, Wow = 100):
```
0xB0 0x0E 0x64
```

### Parameter Types

1. **Continuous (0-127):** Full range of values, smooth transitions
2. **Binary (0 or 1-127):** Off/On states (0 = Off, any value 1-127 = On)
3. **Stepped:** Discrete values for specific modes or settings

### Special Behaviors

- **Model/LP (CC 16):** Uses specific CC values for each tape model, not continuous
- **DSP Bypass (CC 26):** Uses range split (0-63 vs 64-127) for two bypass types
- **Toggles (CC 21-23):** Use values 1, 2, 3 (not 0-2) for three positions
- **Preset Save (CC 111):** Sending a value 1-122 saves to that preset slot

### Parameter Interaction

- DIP switches control which parameters are affected by modulation
- ALT mode (CC 104) changes the function of some front-panel controls
- Expression pedal (CC 100) can be assigned to control various parameters

---

## Testing Checklist

When implementing MIDI control:

- [ ] Verify pedal responds to all 7 main knob CCs (14-20)
- [ ] Test 3-position toggles use values 1, 2, 3 (not 0, 1, 2)
- [ ] Confirm Model/LP selects correct tape models at specific values
- [ ] Test bypass on/off with CC 102
- [ ] Verify all 16 DIP switches respond correctly (CC 61-68, 71-78)
- [ ] Test expression pedal input (CC 100)
- [ ] Confirm preset save functionality (CC 111)
- [ ] Verify binary parameters treat any value 1-127 as "on"
- [ ] Test rapid CC updates don't cause MIDI buffer overflow
- [ ] Confirm MIDI channel configuration matches pedal settings

---

## References

- **MIDI Guide Database:** https://midi.guide/d/chase-bliss/generation-loss-mkii/
- **Chase Bliss Audio:** https://www.chaseblissaudio.com/
- **MIDI Specification:** MIDI 1.0 Control Change messages
- **USB MIDI:** Class-compliant device (no drivers required on macOS)

---

*This specification is based on community-contributed data and should be verified against your physical pedal.*
