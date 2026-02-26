# Chase Bliss Audio Lossy — MIDI Implementation Manual

Source: https://www.chasebliss.com/s/Lossy_Pedal_MIDI-Manual_Chase-Bliss_Goodhertz.pdf

**Default MIDI Channel:** 2  
**Preset Slots:** PC 1–122 (PC 0 = Live mode)  
**MIDI Interface:** TRS Type A (¼" TRS)

Lossy is a digital audio degradation pedal designed in collaboration with Goodhertz.

---

## Knobs (CC 14–20)

| CC | Parameter  |
|----|------------|
| 14 | Filter     |
| 15 | Global     |
| 16 | Reverb     |
| 17 | Freq       |
| 18 | Speed      |
| 19 | Loss       |
| 20 | Ramp Speed |

---

## Toggles (CC 21–23)

Three-way switches: values 0–1 = position 1, value 2 = position 2, values 3+ = position 3.

| CC | Parameter    | Position 1         | Position 2 | Position 3    |
|----|--------------|--------------------|------------|---------------|
| 21 | Filter Slope | 6dB (0–1)          | 24dB (2)   | 96dB (3+)     |
| 22 | Packet Mode  | Repeat (0–1)       | Clean (2)  | Loss (3+)     |
| 23 | Loss Mode    | Inverse (0–1)      | Standard (2) | Jitter (3+) |

---

## Hidden Options (CC 24–33)

Accessed via the Alt Menu (hold both footswitches).

| CC | Parameter          | Values  |
|----|--------------------|---------|
| 24 | Gate               | 0–127   |
| 25 | Freezer            | 0–127   |
| 26 | Verb Decay         | 0–127   |
| 27 | Limiter Threshold  | 0–127   |
| 28 | Auto Gain          | 0–127   |
| 29 | Loss Gain          | 0–127   |
| 33 | Weighting          | Dark (0–1), Neutral (2), Bright (3+) |

---

## Footswitches

| CC  | Function                   | Values               |
|-----|----------------------------|----------------------|
| 102 | Bypass                     | off = 0, on = 1+     |
| 103 | Freeze Slushie (press left)| off = 0, on = 1+     |
| 104 | Alt Menu (hold both)       | exit = 0, enter = 1+ |
| 105 | Freeze Solid (hold left)   | off = 0, on = 1+     |
| 106 | Gate (hold right)          | off = 0, on = 1+     |

---

## DIP Switches — Left Bank (CC 61–68)

Controls ramping / expression targets.

| CC | Switch    | Description                          |
|----|-----------|--------------------------------------|
| 61 | Filter    | Enable ramp/expression on Filter     |
| 62 | Freq      | Enable ramp/expression on Freq       |
| 63 | Speed     | Enable ramp/expression on Speed      |
| 64 | Loss      | Enable ramp/expression on Loss       |
| 65 | Verb      | Enable ramp/expression on Reverb     |
| 66 | Bounce    | Enable ramp bounce mode              |
| 67 | Sweep     | off = Bottom (0), on = Top (1+)      |
| 68 | Polarity  | off = Forward (0), on = Reverse (1+) |

---

## DIP Switches — Right Bank (CC 71–78)

Customize behavior.

| CC | Switch   | Description                    |
|----|----------|--------------------------------|
| 71 | Miso     | Mono in, stereo out            |
| 72 | Spread   | Stereo spread                  |
| 73 | Trails   | Trails on bypass               |
| 74 | Latch    | Latch footswitch behavior      |
| 75 | Pre/Post | Pre or post signal routing     |
| 76 | Slow     | Slow mode                      |
| 77 | Invert   | Invert signal                  |
| 78 | All Wet  | 100% wet signal                |

---

## Utility CCs

| CC  | Function        | Values                       |
|-----|-----------------|------------------------------|
| 52  | Ramp/Bounce     | off = 0, on = 1+             |
| 56  | Factory Reset   | any value                    |
| 57  | Dry Kill        | off = 0, on = 1+             |
| 100 | EOM (Expression over MIDI) | 0–127               |
| 111 | Preset Save     | 1–122 (selects slot to save) |
