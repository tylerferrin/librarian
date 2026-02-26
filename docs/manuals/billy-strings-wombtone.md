# Chase Bliss Audio Billy Strings Wombtone — MIDI Implementation Manual

Source: https://static1.squarespace.com/static/66996f560c5e78462a46cd3c/t/66c60fe6490d1a653c48e58c/1724256231513/Billy+Strings+Wombtone_Midi+Manual_Pedal+Chase+Bliss.pdf

**Default MIDI Channel:** 2  
**Preset Slots:** PC 1–122 (PC 0 = Live mode)  
**MIDI Interface:** TRS Type A (¼" TRS)

The Billy Strings Wombtone is a limited-edition phaser pedal. It is the simplest Chase Bliss Audio
pedal MIDI-wise — there are no DIP switches, no Alt Menu, and no hidden options.

**Important:** The bypass CC uses a split range: 0–63 = off (bypassed), 64–127 = on (engaged).
This differs from all other Chase Bliss Audio pedals.

---

## Knobs (CC 14–20)

| CC | Parameter  |
|----|------------|
| 14 | Feed       |
| 15 | Volume     |
| 16 | Mix        |
| 17 | Rate       |
| 18 | Depth      |
| 19 | Form       |
| 20 | Ramp Speed |

---

## Toggles (CC 21)

| CC | Parameter            | Values                                                          |
|----|----------------------|-----------------------------------------------------------------|
| 21 | MIDI Note Divisions  | 0=whole, 1=half, 2=quarter triplet, 3=quarter, 4=eighth, 5=sixteenth |

*Note: Only one toggle parameter (CC 21). No CC 22 or CC 23.*

---

## Footswitches

| CC  | Function  | Values                                                           |
|-----|-----------|------------------------------------------------------------------|
| 102 | Bypass    | off (bypassed) = 0–63, on (engaged) = 64–127                    |
| 93  | Tap Tempo | any value                                                        |

*Note: No Alt Menu (CC 104), no secondary footswitch (CC 103).*

---

## Utility CCs

| CC  | Function          | Values                       |
|-----|-------------------|------------------------------|
| 51  | MIDI Clock Ignore | off = 0, listening = 127     |
| 100 | EOM (Expression over MIDI) | 0–127               |
| 111 | Preset Save       | 1–122 (selects slot to save) |

*Note: No DIP switches. No CC 61–68 or CC 71–78.*
