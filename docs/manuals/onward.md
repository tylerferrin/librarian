# Chase Bliss Audio Onward — MIDI Implementation Manual

Source: https://www.chasebliss.com/s/Onward_MIDI-Manual_Pedal_Chase-Bliss.pdf

**Default MIDI Channel:** 2  
**Preset Slots:** PC 1–122 (PC 0 = Live mode)  
**MIDI Interface:** TRS Type A (¼" TRS)

---

## Knobs (CC 14–20)

| CC | Parameter   |
|----|-------------|
| 14 | Size        |
| 15 | Mix         |
| 16 | Octave      |
| 17 | Error       |
| 18 | Sustain     |
| 19 | Texture     |
| 20 | Ramp Speed  |

---

## Toggles (CC 21–23)

Three-way switches: values 0–1 = position 1, value 2 = position 2, values 3+ = position 3.

| CC | Parameter  | Position 1        | Position 2    | Position 3       |
|----|------------|-------------------|---------------|------------------|
| 21 | Error Type | Timing (0–1)      | Condition (2) | Playback (3+)    |
| 22 | Fade       | Long (0–1)        | User (2)      | Short (3+)       |
| 23 | Animate    | Vibrato (0–1)     | Off (2)       | Chorus (3+)      |

---

## Hidden Options (CC 24–33)

Accessed via the Alt Menu (hold both footswitches).

| CC | Parameter       | Values  |
|----|-----------------|---------|
| 24 | Sensitivity     | 0–127   |
| 25 | Balance         | 0–127   |
| 26 | Duck Depth      | 0–127   |
| 27 | Error Blend     | 0–127   |
| 28 | User Fade       | 0–127   |
| 29 | Filter          | 0–127   |
| 31 | Error Routing   | Glitch (0–1), Both (2), Freeze (3+) |
| 32 | Sustain Routing | Glitch (0–1), Both (2), Freeze (3+) |
| 33 | Effects Routing | Glitch (0–1), Both (2), Freeze (3+) |

---

## Footswitches

| CC  | Function                  | Values               |
|-----|---------------------------|----------------------|
| 102 | Freeze Bypass             | off = 0, on = 1+     |
| 103 | Glitch Bypass             | off = 0, on = 1+     |
| 104 | Alt Menu (hold both)      | exit = 0, enter = 1+ |
| 105 | Glitch Hold (hold left)   | off = 0, on = 1+     |
| 106 | Freeze Hold (hold right)  | off = 0, on = 1+     |
| 108 | Retrigger Glitch          | any value            |
| 109 | Retrigger Freeze          | any value            |

---

## DIP Switches — Left Bank (CC 61–68)

Controls ramping / expression targets.

| CC | Switch    | Description                          |
|----|-----------|--------------------------------------|
| 61 | Size      | Enable ramp/expression on Size       |
| 62 | Error     | Enable ramp/expression on Error      |
| 63 | Sustain   | Enable ramp/expression on Sustain    |
| 64 | Texture   | Enable ramp/expression on Texture    |
| 65 | Octave    | Enable ramp/expression on Octave     |
| 66 | Bounce    | Enable ramp bounce mode              |
| 67 | Sweep     | off = Bottom (0), on = Top (1+)      |
| 68 | Polarity  | off = Forward (0), on = Reverse (1+) |

---

## DIP Switches — Right Bank (CC 71–78)

Customize behavior.

| CC | Switch     | Description                    |
|----|------------|--------------------------------|
| 71 | Miso       | Mono in, stereo out            |
| 72 | Spread     | Stereo spread                  |
| 73 | Latch      | Latch footswitch behavior      |
| 74 | Sidechain  | Sidechain / duck mode          |
| 75 | Duck       | Enable ducking                 |
| 76 | Reverse    | Reverse mode                   |
| 77 | 1/2 Speed  | Half speed mode                |
| 78 | Manual     | Manual mode                    |

---

## Utility CCs

| CC  | Function          | Values                       |
|-----|-------------------|------------------------------|
| 51  | MIDI Clock Ignore | ignore = 0, follow = 1+      |
| 52  | Ramp/Bounce       | off = 0, on = 1+             |
| 53  | MIDI Sync Subdivision | Whole=0, D.Half=1, Half=2, D.Qtr=3, Qtr=4, D.8th=5, 8th=6, 8th Trip=7, 16th=8 |
| 56  | Factory Reset     | any value                    |
| 57  | Dry Kill          | off = 0, on = 1+             |
| 58  | Trails            | off = 0, on = 1+             |
| 93  | Tap Tempo         | any value                    |
| 100 | EOM (Expression over MIDI) | 0–127               |
| 107 | Tap Tempo (alt)   | any value                    |
| 111 | Preset Save       | 1–122 (selects slot to save) |
