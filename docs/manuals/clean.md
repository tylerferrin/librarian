# Chase Bliss Audio Clean — MIDI Implementation Manual

Source: https://cb2k22.squarespace.com/s/Clean_Midi-Manual_Pedal_Chase-Bliss.pdf

**Default MIDI Channel:** 2  
**Preset Slots:** PC 1–122 (PC 0 = Live mode)  
**MIDI Interface:** TRS Type A (¼" TRS)

---

## Knobs (CC 14–20)

| CC | Parameter     |
|----|---------------|
| 14 | Dynamics      |
| 15 | Sensitivity   |
| 16 | Wet           |
| 17 | Attack        |
| 18 | EQ            |
| 19 | Dry           |
| 20 | Ramp Speed    |

---

## Toggles (CC 21–23)

Three-way switches: values 0–1 = position 1, value 2 = position 2, values 3+ = position 3.

| CC | Parameter   | Position 1    | Position 2 | Position 3 |
|----|-------------|---------------|------------|------------|
| 21 | Release     | Fast (0–1)    | User (2)   | Slow (3+)  |
| 22 | Mode        | Shifty (0–1)  | Manual (2) | Modulated (3+) |
| 23 | Physics     | Wobbly (0–1)  | Off (2)    | Twitchy (3+) |

---

## Hidden Options (CC 24–33)

Accessed via the Alt Menu (hold both footswitches).

| CC | Parameter       | Values  |
|----|-----------------|---------|
| 24 | Noise Gate Release | 0–127 |
| 25 | Noise Gate Sens | 0–127   |
| 26 | Swell In        | 0–127   |
| 27 | User Release    | 0–127   |
| 28 | Balance Filter  | 0–127   |
| 29 | Swell Out       | 0–127   |
| 31 | Envelope Mode   | Analog (0–1), Hybrid (2), Adaptive (3+) |
| 32 | Shifty Mode     | ASR Shifty (0–1), ENV Shifty (3+) |
| 33 | Spread Routing  | EQ (0–1), Both (2), Vol/Comp (3+) |

---

## Footswitches

| CC  | Function              | Values                      |
|-----|-----------------------|-----------------------------|
| 102 | Bypass                | off = 0, on = 1+            |
| 103 | Swell (press left)    | off = 0, on = 1+            |
| 104 | Alt Menu (hold both)  | exit = 0, enter = 1+        |
| 105 | Swell Hold (hold left)| off = 0, on = 1+            |
| 106 | Dynamics Max (hold right) | off = 0, on = 1+        |

---

## DIP Switches — Left Bank (CC 61–68)

Controls ramping / expression targets.

| CC | Switch     | Description                        |
|----|------------|------------------------------------|
| 61 | Dynamics   | Enable ramp/expression on Dynamics |
| 62 | Attack     | Enable ramp/expression on Attack   |
| 63 | EQ         | Enable ramp/expression on EQ       |
| 64 | Dry        | Enable ramp/expression on Dry      |
| 65 | Wet        | Enable ramp/expression on Wet      |
| 66 | Bounce     | Enable ramp bounce mode            |
| 67 | Sweep      | off = Bottom (0), on = Top (1+)    |
| 68 | Polarity   | off = Forward (0), on = Reverse (1+) |

---

## DIP Switches — Right Bank (CC 71–78)

Customize behavior.

| CC | Switch     | Description                          |
|----|------------|--------------------------------------|
| 71 | Miso       | Mono in, stereo out                  |
| 72 | Spread     | Stereo spread                        |
| 73 | Latch      | Latch footswitch behavior            |
| 74 | Sidechain  | Sidechain mode                       |
| 75 | Noise Gate | Enable noise gate                    |
| 76 | Motion     | Motion mode                          |
| 77 | Swell Aux  | Swell on aux input                   |
| 78 | Dusty      | Dusty mode                           |

---

## Utility CCs

| CC  | Function        | Values                        |
|-----|-----------------|-------------------------------|
| 52  | Ramp/Bounce     | off = 0, on = 1+              |
| 56  | Factory Reset   | any value                     |
| 100 | EOM (Expression over MIDI) | 0–127              |
| 111 | Preset Save     | 1–122 (selects slot to save)  |
