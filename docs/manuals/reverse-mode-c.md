# Chase Bliss Audio Reverse Mode C — MIDI Implementation Manual

Source: https://www.chasebliss.com/s/Reverse-Mode-C_MIDI-Manual_Pedal_Chase-Bliss.pdf

**Default MIDI Channel:** 2  
**Preset Slots:** PC 1–122 (PC 0 = Live mode)  
**MIDI Interface:** TRS Type A (¼" TRS)

Reverse Mode C is a reverse delay/reverb pedal with an onboard sequencer and modulation engine.

---

## Knobs (CC 14–20)

| CC | Parameter  |
|----|------------|
| 14 | Time       |
| 15 | Mix        |
| 16 | Feedback   |
| 17 | Offset     |
| 18 | Balance    |
| 19 | Filter     |
| 20 | Ramp Speed |

---

## Toggles (CC 21–23)

Three-way switches: values 0–1 = position 1, value 2 = position 2, values 3+ = position 3.

| CC | Parameter      | Position 1       | Position 2 | Position 3    |
|----|----------------|------------------|------------|---------------|
| 21 | Mod Sync       | Sync (0–1)       | Off (2)    | Free (3+)     |
| 22 | Mod Type       | Vib (0–1)        | Trem (2)   | Freq (3+)     |
| 23 | Sequence Mode  | Run (0–1)        | Off (2)    | Env (3+)      |

---

## Hidden Options (CC 24–33)

Accessed via the Alt Menu (hold both footswitches).

| CC | Parameter              | Values                                                                    |
|----|------------------------|---------------------------------------------------------------------------|
| 24 | Sequencer Subdivision  | X16=0–15, X8=16–31, X4=32–47, X2=48–63, X1=64–79, X½=80–95, X¼=96–111, X⅛=112–127 |
| 25 | Ramping Waveform       | 0–127                                                                     |
| 27 | Mod Depth              | 0–127                                                                     |
| 28 | Mod Rate               | 0–127                                                                     |
| 31 | Octave Type            | Oct Down (0–1), Both Oct (2), Oct Up (3+)                                 |
| 33 | Sequence Spacing       | Rest (0–1), Skip (2+)                                                     |

---

## Footswitches

| CC  | Function                | Values               |
|-----|-------------------------|----------------------|
| 102 | Bypass                  | off = 0, on = 1+     |
| 103 | Tap Tempo               | any value            |
| 104 | Alt Menu (hold both)    | exit = 0, enter = 1+ |
| 105 | Freeze (hold left)      | off = 0, on = 1+     |
| 106 | Half Speed (hold right) | normal = 0, half = 1+|

---

## DIP Switches — Left Bank (CC 61–68)

Controls ramping / expression targets.

| CC | Switch    | Description                          |
|----|-----------|--------------------------------------|
| 61 | Time      | Enable ramp/expression on Time       |
| 62 | Offset    | Enable ramp/expression on Offset     |
| 63 | Balance   | Enable ramp/expression on Balance    |
| 64 | Filter    | Enable ramp/expression on Filter     |
| 65 | Feed      | Enable ramp/expression on Feedback   |
| 66 | Bounce    | Enable ramp bounce mode              |
| 67 | Sweep     | off = Bottom (0), on = Top (1+)      |
| 68 | Polarity  | off = Forward (0), on = Reverse (1+) |

---

## DIP Switches — Right Bank (CC 71–78)

Customize behavior.

| CC | Switch     | Description                    |
|----|------------|--------------------------------|
| 71 | Swap       | Swap channel routing           |
| 72 | Miso       | Mono in, stereo out            |
| 73 | Spread     | Stereo spread                  |
| 74 | Trails     | Trails on bypass               |
| 75 | Latch      | Latch footswitch behavior      |
| 76 | Feed Type  | Feedback type selection        |
| 77 | Fade Type  | Fade type selection            |
| 78 | Mod Type   | Modulation type                |

---

## Utility CCs

| CC  | Function          | Values                       |
|-----|-------------------|------------------------------|
| 51  | MIDI Clock Ignore | off = 0, on = 1+             |
| 52  | Ramp/Bounce       | off = 0, on = 1+             |
| 56  | Factory Reset     | any value                    |
| 57  | Dry Kill          | off = 0, on = 1+             |
| 93  | Tap Tempo         | any value                    |
| 100 | EOM (Expression over MIDI) | 0–127               |
| 111 | Preset Save       | 1–122 (selects slot to save) |
