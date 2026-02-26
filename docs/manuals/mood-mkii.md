# Chase Bliss Audio Mood MkII — MIDI Implementation Manual

Source: https://www.chasebliss.com/s/MOOD-MKII_MIDI-Manual_Pedal_Chase-Bliss.pdf

**Default MIDI Channel:** 2  
**Preset Slots:** PC 1–122 (PC 0 = Live mode)  
**MIDI Interface:** TRS Type A (¼" TRS)

Mood MkII combines a micro-looper (left side) and a wet channel (right side: reverb, delay, or slip).
It also features a Synth Mode triggered by MIDI Note On messages.

---

## Knobs (CC 14–20)

| CC | Parameter                   | Notes                                    |
|----|-----------------------------|------------------------------------------|
| 14 | Time                        | Synced values available with MIDI clock  |
| 15 | Mix                         |                                          |
| 16 | Length                      | Synced values available with MIDI clock  |
| 17 | Modify (wet channel)        |                                          |
| 18 | Clock                       | Synced values available with MIDI clock  |
| 19 | Modify (stretch/tape speed) | Stepped parameter                        |
| 20 | Ramp Speed                  |                                          |

---

## Toggles (CC 21–23)

Three-way switches: values 0–1 = position 1, value 2 = position 2, values 3+ = position 3.

| CC | Parameter          | Position 1      | Position 2  | Position 3      |
|----|--------------------|-----------------|-------------|-----------------|
| 21 | Wet Channel Routing| Reverb (0–1)    | Delay (2)   | Slip (3+)       |
| 22 | Routing            | LFO (0–1)       | Mid (2)     | Env (3+)        |
| 23 | Micro-Looper       | Env (0–1)       | Tape (2)    | Stretch (3+)    |

---

## Hidden Options (CC 24–33)

Accessed via the Alt Menu (hold both footswitches).

| CC | Parameter      | Values  |
|----|----------------|---------|
| 24 | Stereo Width   | 0–127   |
| 25 | Ramping Waveform | 0–127 |
| 26 | Fade           | 0–127   |
| 27 | Tone           | 0–127   |
| 28 | Level Balance  | 0–127   |
| 29 | Direct Micro-Loop | 0–127|
| 31 | Sync           | on (0–1), no sync (2), auto (3+) |
| 32 | Spread         | only (0–1), both (2), only alt (3+) |
| 33 | Buffer Length  | Half MKI (0–1), Full (2+) |

---

## Footswitches

| CC  | Function               | Values                |
|-----|------------------------|-----------------------|
| 102 | Bypass (left side)     | off = 0, on = 1+      |
| 103 | Bypass (right side)    | off = 0, on = 1+      |
| 104 | Hidden Menu            | off = 0, on = 1+      |
| 105 | Freeze                 | off = 0, on = 1+      |
| 106 | Overdub                | off = 0, on = 1+      |
| 107 | Tap Tempo              | any value > 0         |

---

## DIP Switches — Left Bank (CC 61–68)

Controls ramping / expression targets.

| CC | Switch         | Description                              |
|----|----------------|------------------------------------------|
| 61 | Time           | Enable ramp/expression on Time           |
| 62 | Modify (wet)   | Enable ramp/expression on Modify (wet)   |
| 63 | Clock          | Enable ramp/expression on Clock          |
| 64 | Modify (looper)| Enable ramp/expression on Modify (looper)|
| 65 | Length         | Enable ramp/expression on Length         |
| 66 | Bounce         | Enable ramp bounce mode                  |
| 67 | Sweep          | off = Bottom (0), on = Top (1+)          |
| 68 | Polarity       | off = Forward (0), on = Reverse (1+)     |

---

## DIP Switches — Right Bank (CC 71–78)

Customize behavior.

| CC | Switch   | Description                          |
|----|----------|--------------------------------------|
| 71 | Classic  | Classic mode                         |
| 72 | Miso     | Mono in, stereo out                  |
| 73 | Spread   | Stereo spread                        |
| 74 | Dry Kill | Kill dry signal                      |
| 75 | Trails   | Trails on bypass                     |
| 76 | Latch    | Latch footswitch behavior            |
| 77 | No Dub   | Disable overdub                      |
| 78 | Smooth   | Smooth loop transitions              |

---

## MIDI Clock / Sync CCs

| CC | Function                | Values                                                        |
|----|-------------------------|---------------------------------------------------------------|
| 51 | MIDI Clock Ignore       | ignore = 0, follow = 1+                                       |
| 52 | Stop/Resume Ramping     | stop = 0, resume = 1+                                         |
| 53 | Clock Division (wet)    | 0=32nd, 1=16th, 2=8th, 3=dotted 8th, 4=qtr, 5=dotted qtr, 6=half, 7=whole |
| 54 | Clock Division (looper) | 0=32nd, 1=16th, 2=8th, 3=dotted 8th, 4=qtr, 5=dotted qtr, 6=half, 7=whole |
| 55 | True Bypass Mode        | Standard Buffered = 0, True Bypass = 1+                       |
| 93 | Tap Tempo               | any value > 0                                                 |

---

## Synth Mode CCs

Synth Mode is entered when the Mood MkII receives a MIDI Note On message.

| CC / Message | Function            | Values                                          |
|--------------|---------------------|-------------------------------------------------|
| Note On      | Enter Synth Mode    | Any MIDI note                                   |
| 58           | Output Type         | Open = 0, On/Off = 1, ADSR = 2+                 |
| 59           | Exit Synth Mode     | value > 1                                       |
| 57           | Octave Transpose    | 1=+12, 2=+24, 3=+36, 4=+48, 5=+60, 6=+72, 7=+84, 8=+96, 9=+108 semitones |
| 80           | Attack              | 0–127                                           |
| 81           | Decay               | 0–127                                           |
| 82           | Sustain             | 0–127                                           |
| 83           | Release             | 0–127                                           |
| 84           | Portamento          | 0–127                                           |
| 1            | Modulation Wheel    | 0–127 (±4 semitones)                            |
| Pitch Bend   | Pitch Bend          | ±4 semitones                                    |

---

## Utility CCs

| CC  | Function        | Values                       |
|-----|-----------------|------------------------------|
| 56  | Factory Reset   | any value                    |
| 100 | EOM (Expression over MIDI) | 0–127               |
| 110 | MIDI Reset      | 1–127                        |
| 111 | Preset Save     | 1–122 (selects slot to save) |
