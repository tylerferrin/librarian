/**
 * Librarian - Quick MIDI Test Commands (Tauri v2)
 * 
 * Copy-paste these into browser DevTools console (Cmd+Option+I)
 * to quickly test MIDI communication with your pedal.
 * 
 * Prerequisites:
 * 1. Run: pnpm run tauri dev
 * 2. Open DevTools Console
 * 3. Update DEVICE_NAME below to match your actual device
 * 
 * IMPORTANT: This uses Tauri v2 API - must import invoke from @tauri-apps/api/core
 */

// Import Tauri invoke function
const { invoke } = await import('@tauri-apps/api/core');

// ============================================================================
// CONFIGURATION - UPDATE THIS!
// ============================================================================

const DEVICE_NAME = 'Widi Midi Bluetooth';  // Change to YOUR device name!
const MIDI_CHANNEL = 1;                      // Default for most pedals

// ============================================================================
// TEST 1: List Available Devices
// ============================================================================

console.log('📋 Listing MIDI devices...');
const devices = await invoke('list_midi_devices');
console.log('Available devices:', devices);
console.log('💡 Update DEVICE_NAME in this script to match one of the devices above');

// ============================================================================
// TEST 2: Connect to Microcosm
// ============================================================================

console.log(`🔌 Connecting to "${DEVICE_NAME}"...`);
await invoke('connect_microcosm', {
  deviceName: DEVICE_NAME,
  midiChannel: MIDI_CHANNEL
});
console.log('✅ Connected to Microcosm!');

// ============================================================================
// TEST 3: Verify Connection
// ============================================================================

const connected = await invoke('get_connected_devices');
console.log('🔗 Connected devices:', connected);

// ============================================================================
// TEST 4: Activity Parameter (Continuous 0-127)
// ============================================================================

console.log('🎚️ Testing Activity parameter...');

// Minimum
await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Activity: 0 }
});
console.log('  Activity = 0 (minimum)');
await new Promise(r => setTimeout(r, 2000));

// Medium
await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Activity: 64 }
});
console.log('  Activity = 64 (medium)');
await new Promise(r => setTimeout(r, 2000));

// Maximum
await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Activity: 127 }
});
console.log('  Activity = 127 (maximum)');
console.log('✅ Activity test complete - You should hear intensity change');

// ============================================================================
// TEST 5: Bypass (Binary On/Off)
// ============================================================================

console.log('🔇 Testing Bypass...');

// Bypass ON
await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Bypass: true }
});
console.log('  Bypass = ON (effect muted)');
await new Promise(r => setTimeout(r, 2000));

// Bypass OFF
await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Bypass: false }
});
console.log('  Bypass = OFF (effect active)');
console.log('✅ Bypass test complete - LED should have toggled');

// ============================================================================
// TEST 6: Subdivision (Stepped Parameter)
// ============================================================================

console.log('⏱️ Testing Subdivision...');

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
    deviceName: DEVICE_NAME,
    param: { Subdivision: subdiv }
  });
  console.log(`  Subdivision = ${subdiv}`);
  await new Promise(r => setTimeout(r, 1500));
}
console.log('✅ Subdivision test complete - You should hear different timings');

// ============================================================================
// TEST 7: Waveform Shape (Stepped Parameter)
// ============================================================================

console.log('〰️ Testing Waveform Shape...');

const waveforms = ['Sine', 'Triangle', 'Saw', 'Square', 'Random'];

for (let shape of waveforms) {
  await invoke('send_microcosm_parameter', {
    deviceName: DEVICE_NAME,
    param: { Shape: shape }
  });
  console.log(`  Shape = ${shape}`);
  await new Promise(r => setTimeout(r, 1500));
}
console.log('✅ Waveform shape test complete');

// ============================================================================
// TEST 8: Reverb Mode (Stepped Parameter)
// ============================================================================

console.log('🏛️ Testing Reverb Mode...');

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
    deviceName: DEVICE_NAME,
    param: { ReverbMode: mode }
  });
  console.log(`  ReverbMode = ${mode}`);
  await new Promise(r => setTimeout(r, 2000));
}
console.log('✅ Reverb mode test complete - Each should sound different');

// ============================================================================
// TEST 9: Multiple Continuous Parameters
// ============================================================================

console.log('🎛️ Testing multiple continuous parameters...');

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Repeats: 100 }
});
console.log('  Repeats = 100');

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Mix: 80 }
});
console.log('  Mix = 80');

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { ReverbMix: 70 }
});
console.log('  ReverbMix = 70');

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Rate: 50 }
});
console.log('  Rate = 50');

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: { Detune: 64 }
});
console.log('  Detune = 64');

console.log('✅ Multiple parameters test complete');

// ============================================================================
// TEST 10: Tap Tempo (Trigger)
// ============================================================================

console.log('👆 Testing Tap Tempo...');

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: 'TapTempo'
});
console.log('  Tap 1');
await new Promise(r => setTimeout(r, 500));

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: 'TapTempo'
});
console.log('  Tap 2');
await new Promise(r => setTimeout(r, 500));

await invoke('send_microcosm_parameter', {
  deviceName: DEVICE_NAME,
  param: 'TapTempo'
});
console.log('  Tap 3 - Tempo set!');
console.log('✅ Tap tempo test complete');

// ============================================================================
// TEST 11: Get Current State
// ============================================================================

console.log('📊 Getting current state...');
const state = await invoke('get_microcosm_state', {
  deviceName: DEVICE_NAME
});
console.log('Current Microcosm state:', state);
console.log('✅ State retrieved successfully');

// ============================================================================
// TEST 12: Preset Recall
// ============================================================================

console.log('💾 Testing Preset Recall...');

const preset1 = {
  activity: 127,
  mix: 100,
  subdivision: 'Eighth',
  reverbMode: 'Hall',
  reverbMix: 80,
  repeats: 90,
  bypass: false
};

const preset2 = {
  activity: 30,
  mix: 50,
  subdivision: 'Whole',
  reverbMode: 'Dark',
  reverbMix: 40,
  repeats: 40,
  bypass: false
};

// Load preset 1
console.log('  Loading Preset 1 (bright, active)...');
await invoke('recall_microcosm_preset', {
  deviceName: DEVICE_NAME,
  preset: preset1
});
console.log('  ✓ Preset 1 loaded');
await new Promise(r => setTimeout(r, 3000));

// Load preset 2
console.log('  Loading Preset 2 (dark, subtle)...');
await invoke('recall_microcosm_preset', {
  deviceName: DEVICE_NAME,
  preset: preset2
});
console.log('  ✓ Preset 2 loaded');
await new Promise(r => setTimeout(r, 3000));

// Back to preset 1
console.log('  Loading Preset 1 again...');
await invoke('recall_microcosm_preset', {
  deviceName: DEVICE_NAME,
  preset: preset1
});
console.log('  ✓ Preset 1 loaded');

console.log('✅ Preset recall test complete - You should hear distinct preset changes');

// ============================================================================
// TEST 13: Disconnect
// ============================================================================

console.log('🔌 Disconnecting...');
await invoke('disconnect_device', {
  deviceName: DEVICE_NAME
});
console.log('✅ Disconnected');

const connectedAfter = await invoke('get_connected_devices');
console.log('Connected devices (should be empty):', connectedAfter);

// ============================================================================
// ALL TESTS COMPLETE
// ============================================================================

console.log('');
console.log('════════════════════════════════════════════════════════════════');
console.log('✅ ALL MIDI TESTS COMPLETE!');
console.log('════════════════════════════════════════════════════════════════');
console.log('');
console.log('If all tests passed, MIDI communication is working correctly!');
console.log('');
console.log('Next steps:');
console.log('  1. Phase 1.4: Build React hooks (useMIDI, useMIDIParameter)');
console.log('  2. Phase 2: Create UI components (Knob, Switch, etc.)');
console.log('  3. Connect UI to these MIDI commands');
console.log('');
console.log('See docs/midi/testing-guide.md for detailed explanations of each test.');
console.log('');
