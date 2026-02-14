# MIDI Testing Guide

**Last Updated:** 2026-02-12  
**Primary Test Device:** Hologram Microcosm (via Bluetooth MIDI)

## Overview

This guide walks you through testing MIDI communication between the Librarian app and your pedal. These tests verify that the Rust MIDI manager can successfully send parameters to your hardware.

## Prerequisites

1. **Physical Setup:**
   - Pedal is powered on
   - MIDI connection established (USB or Bluetooth)
   - For Bluetooth: WIDI adapter paired in macOS Bluetooth settings (see `bluetooth-midi-setup.md`)

2. **Verify Detection:**
   ```bash
   cd tauri
   cargo run --bin test-midi-detection
   ```
   
   This should detect your MIDI device. Note the **exact device name** shown (e.g., "Widi Midi Bluetooth").

3. **Launch the App:**
   ```bash
   pnpm run tauri dev
   ```

4. **Open Browser DevTools:**
   - Press `Cmd+Option+I` (macOS) or `Ctrl+Shift+I` (Linux/Windows)
   - Go to the **Console** tab

## Testing Workflow

All tests are performed via browser console commands. The app exposes all MIDI functions via `window.midi` for easy console testing.

**When the app loads, you should see:**
```
✅ MIDI functions available via window.midi
Example: await window.midi.listMidiDevices()
```

### Test 1: List Available Devices

Verify the app can see your MIDI device:

```javascript
await window.midi.listMidiDevices()
```

**Expected Output:**
```javascript
{
  inputs: [
    { name: "Widi Midi Bluetooth", is_input: true }
  ],
  outputs: [
    { name: "Widi Midi Bluetooth", is_input: false }
  ]
}
```

**Expected Output:**
```javascript
{
  inputs: [
    { name: "Widi Midi Bluetooth", is_input: true }
  ],
  outputs: [
    { name: "Widi Midi Bluetooth", is_input: false }
  ]
}
```

**Troubleshooting:**
- If empty arrays: Check physical connection, run detection test again
- If device missing: Ensure pedal is powered on and adapter is paired

---

### Test 2: Connect to Device

Establish a MIDI connection:

```javascript
// For Microcosm via Bluetooth
await window.midi.connectMicrocosm('Widi Midi Bluetooth', 1);
console.log('✓ Connected to Microcosm!');
```

```javascript
// For Gen Loss MKII via USB (when testing later)
await window.midi.connectGenLossMkii('Gen Loss MKII', 1);
console.log('✓ Connected to Gen Loss MKII!');
```

**Expected Output:**
```
✓ Connected to Microcosm!
```

**Troubleshooting:**
- `Device not found`: Check device name exactly matches output from Test 1
- `Connection failed`: Ensure no other app is using the MIDI device
- `Already connected`: Device is already connected, proceed to next test

---

### Test 3: Verify Connection Status

Check which devices are currently connected:

```javascript
await window.midi.getConnectedDevices()
```

**Expected Output:**
```javascript
[
  {
    device_name: "Widi Midi Bluetooth",
    pedal_type: "Microcosm",
    midi_channel: 1
  }
]
```

---

### Test 4: Continuous Parameters (0-127 Range)

Test parameters that accept any value from 0 to 127.

#### Microcosm: Activity Parameter

Controls the intensity of the current effect.

```javascript
// Set to minimum (0)
await window.midi.sendMicrocosmParameter(
  'Widi Midi Bluetooth',
  window.midi.MicrocosmParams.activity(0)
);
console.log('Activity = 0 (minimum)');

// Wait 2 seconds, then set to medium
await new Promise(r => setTimeout(r, 2000));

await window.midi.sendMicrocosmParameter(
  'Widi Midi Bluetooth',
  window.midi.MicrocosmParams.activity(64)
);
console.log('Activity = 64 (medium)');

// Wait 2 seconds, then set to maximum
await new Promise(r => setTimeout(r, 2000));

await window.midi.sendMicrocosmParameter(
  'Widi Midi Bluetooth',
  window.midi.MicrocosmParams.activity(127)
);
console.log('Activity = 127 (maximum)');
```

**Expected Behavior:**
- You should **hear** the effect intensity change on your pedal
- Activity knob on pedal may physically move (if motorized) or LED may change
- Three distinct levels of effect intensity: off/subtle → medium → intense

**Other Continuous Parameters to Test:**

```javascript
// Repeats (CC 16) - feedback/repetition amount
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Repeats: 100 }
});

// Mix (CC 17) - dry/wet blend
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Mix: 80 }
});

// ReverbMix (CC 20) - reverb amount
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { ReverbMix: 64 }
});

// Rate (CC 22) - modulation rate
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Rate: 50 }
});

// Detune (CC 23) - pitch offset
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Detune: 70 }
});
```

---

### Test 5: Binary Parameters (On/Off)

Test parameters that are either on (>= 64) or off (< 64).

#### Microcosm: Bypass

```javascript
// Bypass ON (effect muted)
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Bypass: true }
});
console.log('Bypass = ON (effect muted)');

await new Promise(r => setTimeout(r, 2000));

// Bypass OFF (effect active)
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Bypass: false }
});
console.log('Bypass = OFF (effect active)');
```

**Expected Behavior:**
- Bypass LED on pedal should turn on/off
- Audio effect should mute when bypassed, activate when unbypassed

**Other Binary Parameters:**

```javascript
// Looper Enable (CC 119)
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { LooperEnable: true }
});

// Freeze (CC 121)
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Freeze: true }
});
```

---

### Test 6: Stepped Parameters (Discrete Values)

Test parameters that accept only specific enumerated values.

#### Microcosm: Subdivision

Controls the timing subdivision for delay/looper effects.

```javascript
// Cycle through all subdivision values
const subdivisions = [
  'Whole',
  'Half',
  'Third',
  'Quarter',
  'Sixth',
  'Eighth',
  'Twelfth',
  'Sixteenth'
];

for (let subdiv of subdivisions) {
  await invoke('send_microcosm_parameter', {
    deviceName: 'Widi Midi Bluetooth',
    param: { Subdivision: subdiv }
  });
  console.log(`Subdivision = ${subdiv}`);
  await new Promise(r => setTimeout(r, 1500));
}
```

**Expected Behavior:**
- Each subdivision should produce a different timing for the delay/looper
- You should hear discrete steps, not a continuous change

#### Microcosm: Waveform Shape

```javascript
// Cycle through waveforms
const waveforms = ['Sine', 'Triangle', 'Saw', 'Square', 'Random'];

for (let shape of waveforms) {
  await invoke('send_microcosm_parameter', {
    deviceName: 'Widi Midi Bluetooth',
    param: { Shape: shape }
  });
  console.log(`Waveform shape = ${shape}`);
  await new Promise(r => setTimeout(r, 1500));
}
```

#### Microcosm: Reverb Mode

```javascript
// Cycle through reverb modes
const reverbModes = [
  'None',
  'Spring',
  'Hall',
  'Plate',
  'Dark',
  'Reverse',
  'Shimmer',
  'Infinite'
];

for (let mode of reverbModes) {
  await invoke('send_microcosm_parameter', {
    deviceName: 'Widi Midi Bluetooth',
    param: { ReverbMode: mode }
  });
  console.log(`Reverb mode = ${mode}`);
  await new Promise(r => setTimeout(r, 2000));
}
```

**Expected Behavior:**
- Each reverb mode should sound distinctly different
- LED indicators may change on the pedal

---

### Test 7: Trigger Parameters (Momentary Actions)

Test parameters that trigger an action when sent.

#### Microcosm: Tap Tempo

```javascript
// Send three tap tempo triggers to set tempo
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'TapTempo'
});
console.log('Tap 1');

await new Promise(r => setTimeout(r, 500));

await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'TapTempo'
});
console.log('Tap 2');

await new Promise(r => setTimeout(r, 500));

await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'TapTempo'
});
console.log('Tap 3 - Tempo set!');
```

**Expected Behavior:**
- After 2-3 taps, the pedal should sync its tempo to your tap rate
- LED may flash at the new tempo

#### Microcosm: Looper Controls

```javascript
// Record a loop
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'LooperRecord'
});
console.log('Recording started...');

// Play for a few seconds while recording
await new Promise(r => setTimeout(r, 3000));

// Stop recording (trigger again)
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'LooperRecord'
});
console.log('Recording stopped. Loop playing.');

// Play/stop the loop
await new Promise(r => setTimeout(r, 2000));
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'LooperPlayStop'
});
console.log('Loop stopped.');

await new Promise(r => setTimeout(r, 2000));
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'LooperPlayStop'
});
console.log('Loop playing again.');

// Clear the loop
await new Promise(r => setTimeout(r, 2000));
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. 'LooperClear'
});
console.log('Loop cleared.');
```

---

### Test 8: Get Current State

Retrieve the app's in-memory state for the connected device:

```javascript
const state = await invoke('get_microcosm_state', {
  deviceName: 'Widi Midi Bluetooth'
});
console.log('Current Microcosm state:', state);
```

**Expected Output:**
```javascript
{
  activity: 127,
  repeats: 100,
  mix: 80,
  subdivision: "Eighth",
  shape: "Sine",
  bypass: false,
  // ... all other parameters
}
```

**Note:** This returns the **app's internal state**, not a query to the pedal hardware. The state is updated whenever you send a parameter.

---

### Test 9: Preset Recall

Test recalling a complete preset (all parameters at once).

```javascript
// Define a preset
const preset = {
  activity: 100,
  repeats: 80,
  mix: 90,
  subdivision: 'Quarter',
  shape: 'Triangle',
  reverbMode: 'Hall',
  reverbMix: 70,
  rate: 50,
  detune: 64,
  bypass: false,
  freeze: false,
  looperEnable: false
  // ... you can include all parameters
};

// Recall the preset
await invoke('recall_microcosm_preset', {
  deviceName: 'Widi Midi Bluetooth',
  preset: preset
});
console.log('✓ Preset recalled!');
```

**Expected Behavior:**
- Multiple parameters should change on the pedal over ~1-2 seconds
- The pedal should sound exactly as defined in the preset
- There's a 20ms delay between each CC message to prevent MIDI buffer overflow

**Create a second preset and switch between them:**

```javascript
const preset1 = {
  activity: 127,
  mix: 100,
  subdivision: 'Eighth',
  reverbMode: 'Hall'
};

const preset2 = {
  activity: 30,
  mix: 50,
  subdivision: 'Whole',
  reverbMode: 'Dark'
};

// Load preset 1
await invoke('recall_microcosm_preset', {
  deviceName: 'Widi Midi Bluetooth',
  preset: preset1
});
console.log('Loaded Preset 1');

await new Promise(r => setTimeout(r, 3000));

// Load preset 2
await invoke('recall_microcosm_preset', {
  deviceName: 'Widi Midi Bluetooth',
  preset: preset2
});
console.log('Loaded Preset 2');
```

---

### Test 10: Disconnect

Close the MIDI connection:

```javascript
await invoke('disconnect_device', {
  deviceName: 'Widi Midi Bluetooth'
});
console.log('✓ Disconnected');

// Verify disconnection
const connected = await invoke('get_connected_devices');
console.log('Connected devices:', connected);  // Should be empty array
```

---

## Troubleshooting

### No Response from Pedal

1. **Verify physical connection:**
   - Run `cargo run --bin test-midi-detection` - is your device listed?
   - For Bluetooth: Check macOS Bluetooth settings - is adapter paired?

2. **Check MIDI channel:**
   - Microcosm default: Channel 1
   - Gen Loss MKII default: Channel 1
   - Verify your pedal's MIDI channel setting (consult manual)

3. **Test with simple parameter:**
   - Try Bypass toggle - it's the most obvious parameter
   - If Bypass works, MIDI is working

4. **Check browser console for errors:**
   - Rust errors will appear in the console
   - Look for `Device not found`, `Connection failed`, etc.

### Parameter Changes But No Sound

1. **Check Bypass state:**
   ```javascript
   // Ensure effect is not bypassed
   await invoke('send_microcosm_parameter', {
     deviceName: 'Widi Midi Bluetooth',
     param: { Bypass: false }
   });
   ```

2. **Check Mix parameter:**
   ```javascript
   // Ensure mix is not at 0 (fully dry)
   await invoke('send_microcosm_parameter', {
     deviceName: 'Widi Midi Bluetooth',
     param: { Mix: 80 }
   });
   ```

3. **Audio signal:**
   - Ensure you have audio input to the pedal (guitar/synth playing)
   - Check output cable connections

### MIDI Messages Too Fast

If the pedal seems to miss some parameter changes during preset recall:

- The current throttle is 20ms between CC messages
- Some pedals may need longer delays
- This can be adjusted in `tauri/src/midi/manager.rs` (search for `thread::sleep`)

### Bluetooth Latency

- Bluetooth MIDI has ~10-30ms latency (normal)
- For real-time performance, use USB MIDI if available
- WIDI adapters typically have better latency than generic BLE-MIDI

---

## Next Steps After Successful Testing

Once you've verified MIDI communication works:

1. **Phase 1.4:** Build React hooks (`useMIDI`, `useMIDIParameter`)
2. **Phase 2:** Create UI components (Knob, Switch, ParameterGroup)
3. **Connect UI to MIDI:** Wire up React components to call these Tauri commands
4. **Build first parameter panel:** Activity, Mix, Repeats with visual knobs

---

## Quick Reference: Common Commands

```javascript
// First, import invoke (do this once per console session)
const { invoke } = await import('@tauri-apps/api/core');

// List devices
await invoke('list_midi_devices');

// Connect Microcosm
await invoke('connect_microcosm', {
  deviceName: 'Widi Midi Bluetooth',
  midiChannel: 1
});

// Send parameter
await window.midi.sendMicrocosmParameter('Widi Midi Bluetooth', window.midi.MicrocosmParams. { Activity: 100 }
});

// Get state
await invoke('get_microcosm_state', {
  deviceName: 'Widi Midi Bluetooth'
});

// Disconnect
await invoke('disconnect_device', {
  deviceName: 'Widi Midi Bluetooth'
});
```

---

**See also:**
- `quick-test-commands.js` - Ready-to-paste test scripts
- `microcosm-spec.md` - Complete MIDI CC reference
- `bluetooth-midi-setup.md` - Bluetooth pairing guide
- `implementation-summary.md` - Architecture overview
