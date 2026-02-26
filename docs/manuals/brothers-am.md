# Chase Bliss Audio Brothers AM — MIDI Implementation Manual

Source: https://cb2k22.squarespace.com/s/Brothers-AM_MIDI-Manual_Pedal_Chase-Bliss.pdf

**Default MIDI Channel:** 2  
**Preset Slots:** PC 1–122 (PC 0 = Live mode)  
**MIDI Interface:** TRS Type A (¼" TRS)

Brothers AM is a two-channel overdrive/boost/distortion pedal. Each channel has independent
gain, tone, volume, and presence controls. There are no hidden options and no Alt Menu footswitch.

---

## Knobs

| CC | Parameter   |
|----|-------------|
| 14 | Gain 2      |
| 15 | Volume 2    |
| 16 | Gain 1      |
| 17 | Tone 2      |
| 18 | Volume 1    |
| 19 | Tone 1      |
| 27 | Presence 2  |
| 29 | Presence 1  |

---

## Toggles (CC 21–23)

Three-way switches: values 0–1 = position 1, value 2 = position 2, values 3+ = position 3.

| CC | Parameter    | Position 1           | Position 2    | Position 3        |
|----|--------------|----------------------|---------------|-------------------|
| 21 | Gain 2 Type  | Boost (0–1)          | OD (2)        | Dist (3+)         |
| 22 | Treble Boost | Full Sun (0–1)       | Off (2)       | Half Sun (3+)     |
| 23 | Gain 1 Type  | Dist (0–1)           | OD (2)        | Boost (3+)        |

---

## Footswitches

| CC  | Function             | Values            |
|-----|----------------------|-------------------|
| 102 | Channel 1 Bypass     | off = 0, on = 1+  |
| 103 | Channel 2 Bypass     | off = 0, on = 1+  |

*Note: No CC 104 (Alt Menu) — Brothers AM does not have a hidden options menu.*

---

## DIP Switches — Left Bank (CC 61–68)

Controls ramping / expression targets.

| CC | Switch    | Description                          |
|----|-----------|--------------------------------------|
| 61 | Volume 1  | Enable ramp/expression on Volume 1   |
| 62 | Volume 2  | Enable ramp/expression on Volume 2   |
| 63 | Gain 1    | Enable ramp/expression on Gain 1     |
| 64 | Gain 2    | Enable ramp/expression on Gain 2     |
| 65 | Tone 1    | Enable ramp/expression on Tone 1     |
| 66 | Tone 2    | Enable ramp/expression on Tone 2     |
| 67 | Sweep     | off = Bottom (0), on = Top (1+)      |
| 68 | Polarity  | off = Forward (0), on = Reverse (1+) |

---

## DIP Switches — Right Bank (CC 71–77)

*Note: Brothers AM only has 7 right-bank switches (CC 71–77); there is no CC 78.*

| CC | Switch      | Description                                |
|----|-------------|--------------------------------------------|
| 71 | Hi Gain 1   | High gain mode for Channel 1               |
| 72 | Hi Gain 2   | High gain mode for Channel 2               |
| 73 | MotoByp 1   | Motor bypass for Channel 1                 |
| 74 | MotoByp 2   | Motor bypass for Channel 2                 |
| 75 | Pres Link 1 | Presence link for Channel 1                |
| 76 | Pres Link 2 | Presence link for Channel 2                |
| 77 | Master      | Master volume mode                         |

---

## Utility CCs

| CC  | Function        | Values                       |
|-----|-----------------|------------------------------|
| 100 | EOM (Expression over MIDI) | 0–127               |
| 111 | Preset Save     | 1–122 (selects slot to save) |
