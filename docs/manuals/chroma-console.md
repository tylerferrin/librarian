# Chroma Console MIDI Implementation Manual

This manual documents the MIDI implementation for the Hologram Chroma Console granular micro-looper pedal.

## Table of Contents

- [Global Settings](#global-settings)
- [MIDI Implementation Chart](#midi-implementation-chart)
- [User Presets](#user-presets)

---

## 14 | Global Settings

The GLOBAL SETTINGS MENU lets you change the default behavior of Chroma Console to suit your needs.

### Entering the Global Settings Menu

To enter Chroma Console's GLOBAL SETTINGS MENU, press all buttons (A, B, C, and D) simultaneously and release.

### Configuration Options

Once in the GLOBAL SETTINGS MENU, Chroma Console's knobs are used to make changes to the global settings. Below is a table that illustrates the settings each knob can alter:

| Knob | Configuration | Options |
|------|--------------|---------|
| **TILT** | MIDI CHANNEL | 1-16 |
| **RATE** | MIDI ROUTING | Interface mode, Interface without internal clock, Thru mode, Thru without internal clock |
| **TIME** | MIDI CLOCK SOURCE | AUTO, USB MIDI, DIN MIDI, Internal clock only |
| **MIX** | N/A | N/A |
| **AMOUNT (CHARACTER)** | LED BRIGHTNESS | Min-Max |
| **AMOUNT (MOVEMENT)** | PRESET BROWSER AUDITION | Enable Preset Browser Audition, Disable Preset Browser Audition |
| **AMOUNT (DIFFUSION)** | BYPASS MODE | Buffered Bypass, Buffered Bypass with trails, True Bypass |
| **AMOUNT (TEXTURE)** | N/A | N/A |

---

### 1. MIDI Channel (TILT KNOB)

**Channels 1-4** (Red LEDs)  
**Channels 5-8** (Orange LEDs)  
**Channels 9-12** (Green LEDs)  
**Channels 13-16** (Blue LEDs)

This setting configures which channel Chroma Console will listen to incoming MIDI messages on. By default, Chroma Console is set to MIDI Channel 1.

---

### 2. MIDI Routing (RATE KNOB)

**Interface mode** (Purple LEDs: □■■■)

**Interface Mode (Default):** Chroma Console works like a USB MIDI interface. If you send a message from a computer to the Chroma Console over USB, it will be forwarded to the DIN MIDI OUT port. If you send a message to the DIN MIDI IN port, it will be forwarded to the computer over USB. Chroma Console's clock signals will be output to both DIN and USB MIDI.

**Interface without internal clock** (Purple LEDs: ■□■■)

**Interface without internal clock:** This setting functions the same way as Interface Mode, but Chroma Console does not send out its own internal clock messages. MIDI clock messages from the computer are forwarded along with all other MIDI messages.

**Thru mode** (Purple LEDs: ■■□■)

**Thru Mode:** Chroma Console forwards incoming messages from the DIN MIDI IN port to the DIN MIDI out port. Clock signals will be output to both DIN and USB MIDI.

**Thru without internal clock** (Purple LEDs: ■■■□)

**Thru without internal clock:** This setting functions the same as Thru Mode, but Chroma Console will not send out its own internal clock messages. MIDI clock messages sent to the DIN IN port will be forwarded to the DIN OUT port.

When Chroma Console is synced to External Clock sources, its Internal Clock, as it is referred to here, is equivalent to the External Clock BPM. See MIDI CLOCK SOURCE for more.

---

### 3. MIDI Clock Source (TIME KNOB)

**AUTO** (Orange LEDs: □■■■)  
**USB MIDI** (Orange LEDs: ■□■■)  
**DIN MIDI** (Orange LEDs: ■■□■)  
**Internal Only** (Orange LEDs: ■■■□)

Chroma Console has two hardware interfaces – USB MIDI and standard 5-PIN DIN MIDI. Chroma Console will sync the following effects to external MIDI clock:

Vibrato, Phaser, Tremolo, Cascade, Reels, Collage, and Reverse.

In Global Settings, you can configure Chroma Console to listen for clock messages from different external MIDI sources.

**Auto (Default):** In this mode, Chroma Console listens for clock on both USB and DIN MIDI and automatically switches between them. Incoming USB clock messages take priority over messages received on the MIDI DIN input.

**USB MIDI:** Chroma Console listens for MIDI clock over USB and ignores DIN MIDI clock messages.

**DIN MIDI:** Chroma Console listens for clock on the MIDI DIN input, and ignores it on USB.

**Internal clock only:** Chroma Console ignores all external clock messages and always uses its internal clock.

After receiving clock, you can switch back to Chroma Console's internal clock by sending a Stop message from the external MIDI clock source. If Chroma Console stops receiving clock messages, it will switch to its internal clock.

---

### 4. LED Brightness (CHARACTER AMOUNT KNOB)

**Min-Max** (Four Green LEDs)

This setting allows you to reduce the brightness of the LEDs for use in different lighting conditions. By default, LEDs are at 100% brightness—turn knob counter-clockwise to decrease brightness.

---

### 5. Preset Browser Audition (MOVEMENT AMOUNT KNOB)

**Audition** (Blue LEDs: □■■■)  
**Silent** (Blue LEDs: ■□■■)

By default, presets are auditioned while navigating through both the PRESET BROWSER and the COPY/SAVE menu. This global setting lets you disable preset audition, allowing you to navigate through presets without hearing their effects. When audition is disabled, the currently-active preset will persist until a new preset is loaded. Disabling this setting can be useful for live performance.

---

### 6. Bypass Mode (DIFFUSION AMOUNT KNOB)

This setting configures the bypass mode of the pedal.

**Buffered Bypass** (Teal LEDs: □■■■)

**Buffered Bypass:** Instrument input remains buffered when Chroma Console is disengaged, offering a more consistent dry tone and maintaining the stereo image when a mono input source is used. Effects immediately stop upon bypassing pedal.

**Buffered Bypass trails** (Teal LEDs: ■□■■)

**Buffered Bypass with trails:** The DIFFUSION effects will fade out naturally when bypassed but will not process any new audio until the effect is engaged again.

**True Bypass** (Teal LEDs: ■■□■)

**True Bypass:** Chroma Console uses two relays for stereo true bypass. When bypassed, the outputs are connected directly to the corresponding inputs. The pedal is electrically isolated from the input and output signals.

**When Chroma Console is set to True Bypass, the automatic mono-to-stereo and stereo-to-mono routings do not apply.**

---

## 16 | MIDI Implementation Chart

### Primary Controls

| Control | Message | Range |
|---------|---------|-------|
| **TILT** | CC# 64 | 0-127 |
| **RATE** | CC# 66 | 0-127 |
| **TIME** | CC# 68 | 0-127 |
| **MIX** | CC# 70 | 0-127 |
| **AMOUNT (CHARACTER)** | CC# 65 | 0-127 |
| **AMOUNT (MOVEMENT)** | CC# 67 | 0-127 |
| **AMOUNT (DIFFUSION)** | CC# 69 | 0-127 |
| **AMOUNT (TEXTURE)** | CC# 71 | 0-127 |

### Secondary Controls

| Control | Message | Range |
|---------|---------|-------|
| **SENSITIVITY** | CC# 72 | 0-127 |
| **DRIFT (MOVEMENT)** | CC# 74 | 0-127 |
| **DRIFT (DIFFUSION)** | CC# 76 | 0-127 |
| **OUTPUT LEVEL** | CC# 78 | 0-127 |
| **EFFECT VOL (CHARACTER)** | CC# 73 | 0-127 |
| **EFFECT VOL (MOVEMENT)** | CC# 75 | 0-127 |
| **EFFECT VOL (DIFFUSION)** | CC# 77 | 0-127 |
| **EFFECT VOL (TEXTURE)** | CC# 79 | 0-127 |

### Module Controls

#### Character Module (CC# 16)

| Effect | Range |
|--------|-------|
| **DRIVE** | 0-21 |
| **SWEETEN** | 22-43 |
| **FUZZ** | 44-65 |
| **HOWL** | 66-87 |
| **SWELL** | 88-109 |
| **OFF** | 110-127 |

#### Movement Module (CC# 17)

| Effect | Range |
|--------|-------|
| **DOUBLER** | 0-21 |
| **VIBRATO** | 22-43 |
| **PHASER** | 44-65 |
| **TREMOLO** | 66-87 |
| **PITCH** | 88-109 |
| **OFF** | 110-127 |

#### Diffusion Module (CC# 18)

| Effect | Range |
|--------|-------|
| **CASCADE** | 0-21 |
| **REELS** | 22-43 |
| **SPACE** | 44-65 |
| **COLLAGE** | 66-87 |
| **REVERSE** | 88-109 |
| **OFF** | 110-127 |

#### Texture Module (CC# 19)

| Effect | Range |
|--------|-------|
| **FILTER** | 0-21 |
| **SQUASH** | 22-43 |
| **CASSETTE** | 44-65 |
| **BROKEN** | 66-87 |
| **INTERFERENCE** | 88-109 |
| **OFF** | 110-127 |

### Bypass Controls

#### Standard Bypass (CC# 91)

| Mode | Range |
|------|-------|
| **BYPASS** | 0-63 |
| **ENGAGE** | 64-127 |

#### Dual Bypass Controls (CC# 92)

| Mode | Range |
|------|-------|
| **TOTAL BYPASS** | 0-31 |
| **DUAL BYPASS** | 32-63 |
| **TOTAL ENGAGE** | 64-127 |

#### Module Bypass Controls

- **CC# 103** (Character): BYPASS (0-63) / ENGAGE (64-127)
- **CC# 104** (Movement): BYPASS (0-63) / ENGAGE (64-127)
- **CC# 105** (Diffusion): BYPASS (0-63) / ENGAGE (64-127)
- **CC# 106** (Texture): BYPASS (0-63) / ENGAGE (64-127)

### Other Functions

| Function | Message | Range |
|----------|---------|-------|
| **GESTURE PLAY/REC** | CC# 80 | PLAY (0-63), RECORD (64-127) |
| **GESTURE STOP/ERASE** | CC# 81 | 0-127 |
| **CAPTURE** | CC# 82 | STOP/CLEAR (0-43), PLAY (44-87), RECORD (88-127) |
| **CAPTURE ROUTING** | CC# 83 | POST-FX (0-63), PRE-FX (64-127) |
| **TAP TEMPO** | CC# 93 | 0-127 |
| **FILTER MODE** | CC# 84 | LPF (0-43), TILT (44-87), HPF (88-127) |
| **CALIBRATION LEVEL** | CC# 94 | LOW (0-31), MEDIUM (32-63), HIGH (64-95), VERY HIGH (96-127) |
| **CALIBRATION MENU (ENTER)** | CC# 95 | EXIT (0-63), ENTER (64-127) |

---

## User Presets

Chroma Console has 80 user presets organized into 4 banks (A, B, C, D) of 20 presets each.

### Preset Bank Mapping (Program Change)

| Bank | Presets | Program Change |
|------|---------|----------------|
| **BANK A, 1-4** | PC# 0-3 |
| **BANK A, 5-8** | PC# 4-7 |
| **BANK A, 9-12** | PC# 8-11 |
| **BANK A, 13-16** | PC# 12-15 |
| **BANK A, 17-20** | PC# 16-19 |
| **BANK B, 1-4** | PC# 20-23 |
| **BANK B, 5-8** | PC# 24-27 |
| **BANK B, 9-12** | PC# 28-31 |
| **BANK B, 13-16** | PC# 32-35 |
| **BANK B, 17-20** | PC# 36-39 |
| **BANK C, 1-4** | PC# 40-43 |
| **BANK C, 5-8** | PC# 44-47 |
| **BANK C, 9-12** | PC# 48-51 |
| **BANK C, 13-16** | PC# 52-55 |
| **BANK C, 17-20** | PC# 56-59 |
| **BANK D, 1-4** | PC# 60-63 |
| **BANK D, 5-8** | PC# 64-67 |
| **BANK D, 9-12** | PC# 68-71 |
| **BANK D, 13-16** | PC# 72-75 |
| **BANK D, 17-20** | PC# 76-79 |

---

*This manual is a reference document for MIDI implementation of the Hologram Chroma Console pedal.*
