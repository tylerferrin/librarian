# Bidirectional MIDI Communication

## Overview

The Librarian app now supports **bidirectional MIDI communication**, meaning it can both send and receive MIDI messages. This allows the app to stay in sync with your physical pedal when you turn knobs or change settings directly on the hardware.

**⚠️ Important Note:** Not all pedals support MIDI parameter feedback. The **Hologram Chroma Console**, for example, only receives MIDI commands and does not transmit CC messages when knobs are turned. This is a hardware limitation of the pedal, not the app. The infrastructure is ready and will automatically work with pedals that do support bidirectional MIDI.

## How It Works

### Architecture

1. **Backend (Rust)**:
   - `MidiManager` now opens both MIDI output (for sending) and MIDI input (for receiving) connections
   - When a MIDI CC message is received from a pedal, it's parsed and emitted as a Tauri event
   - The event is filtered by MIDI channel to ensure only relevant messages are processed

2. **Frontend (TypeScript/React)**:
   - New `useMIDIInput` hook listens for `midi-cc-received` events from the backend
   - The `useChromaConsoleEditor` hook (and other pedal hooks) use this to update UI state
   - When a knob is turned on the physical pedal, the UI automatically updates to reflect the change

### Data Flow

```
Physical Pedal → MIDI Hardware → Backend Listener → Tauri Event → Frontend Hook → UI Update
```

## Features

### What's Supported

- ✅ **Real-time knob updates**: Turn any knob on your Chroma Console and watch the UI update instantly
- ✅ **Bypass state sync**: Toggle bypasses on the pedal and see the buttons update in the app
- ✅ **Channel filtering**: Only processes messages on the configured MIDI channel
- ✅ **No feedback loops**: The app is smart enough to not send MIDI back when receiving updates

### Supported Parameters (Chroma Console)

All CC-controllable parameters are supported:

#### Primary Controls
- Tilt (CC 64)
- Rate (CC 66)
- Time (CC 68)
- Mix (CC 70)
- Amount knobs for all modules (CC 65, 67, 69, 71)

#### Secondary Controls  
- Sensitivity (CC 72)
- Drift controls (CC 74, 76)
- Output Level (CC 78)
- Effect Volume controls (CC 73, 75, 77, 79)

#### Bypass Controls
- Main bypass (CC 91)
- Module bypasses (CC 103, 104, 105, 106)

## Implementation Details

### Backend Changes

**File: `tauri/src/midi/manager.rs`**
- Added `MidiInput` support alongside existing `MidiOutput`
- New `setup_midi_input()` method creates input listeners for each connected device
- Input callback parses CC messages and emits `midi-cc-received` events
- Added `MidiCCEvent` struct for event payload

**File: `tauri/src/lib.rs`**
- Sets the Tauri `AppHandle` on `MidiManager` during app initialization
- This enables the manager to emit events to the frontend

### Frontend Changes

**New File: `src/hooks/useMIDIInput.ts`**
- Generic hook for listening to incoming MIDI CC messages
- Can filter by device name
- Automatically cleans up event listeners on unmount

**Modified File: `src/hooks/pedals/chroma_console/useChromaConsoleEditor.ts`**
- Added `useMIDIInput` integration
- `handleMidiCC` callback maps CC numbers to state properties
- Updates local state without triggering MIDI send (prevents feedback loops)

## Testing

### Manual Testing Steps

1. **Build and run the app**:
   ```bash
   npm run tauri:dev
   ```

2. **Connect your Chroma Console**:
   - Make sure your pedal is connected via MIDI
   - Connect to it in the app

3. **Test knob updates**:
   - Turn any knob on your Chroma Console
   - Watch the corresponding knob in the app UI update in real-time
   - Check the console for `📥 MIDI CC received` log messages

4. **Test bypass toggles**:
   - Press module bypass buttons on the pedal
   - See the UI buttons toggle between bypassed and engaged states

### Debugging

If MIDI input isn't working:

1. **Check console logs**:
   - Backend: Look for "✅ MIDI input listener setup for: [device]"
   - Frontend: Look for "📥 MIDI CC received in UI"

2. **Verify MIDI input port exists**:
   - Some devices may not expose an input port
   - Run the test utility: `cargo run --bin test-midi-input` in the `tauri` directory

3. **Check MIDI channel**:
   - Make sure your pedal is transmitting on the same channel the app is configured for
   - Default is usually channel 1

## Tested Pedals

### Hologram Chroma Console
- ✅ Receives MIDI CC (parameters can be controlled from app)
- ✅ Sends MIDI Clock (tempo sync)
- ❌ Does NOT send CC when knobs are turned (no parameter feedback)
- ❌ Does NOT send CC when bypass is toggled

**Conclusion:** The Chroma Console is a **receive-only** device for parameter control. You can control it from the app, but changes made on the pedal won't reflect in the UI.

### Other Pedals
If you have tested other pedals with Librarian, please report your findings! Pedals from manufacturers like Chase Bliss, Empress, and Meris are known to have robust MIDI implementations with bidirectional support.

## Future Enhancements

Potential improvements for bidirectional MIDI:

- [ ] Add MIDI learn functionality (map any knob to any parameter)
- [ ] Support for Program Change messages (switch presets from pedal)
- [ ] Display indicator when receiving MIDI (e.g., flash the knob)
- [ ] Add option to disable MIDI input per device
- [ ] Support for SysEx messages (full state dumps)
- [ ] Preset sync (detect when pedal preset changes and load matching app preset)
- [ ] Add pedal capability detection (auto-detect if bidirectional is supported)

## Technical Notes

### Performance

- MIDI input is handled in a separate thread to avoid blocking the UI
- Events are emitted immediately but batched by Tauri's event system
- No polling - fully event-driven

### Thread Safety

- `MidiInputConnection` is stored with `#[allow(dead_code)]` to keep it alive
- Dropping the connection automatically stops the listener
- The input callback captures a clone of the `AppHandle` for thread-safe event emission

### Error Handling

- If MIDI input port is not found, the app continues with output-only mode
- Failed event emissions are logged but don't crash the connection
- Invalid CC messages are silently ignored

## Related Files

- `tauri/src/midi/manager.rs` - Backend MIDI handling
- `src/hooks/useMIDIInput.ts` - Frontend MIDI input hook
- `src/hooks/pedals/chroma_console/useChromaConsoleEditor.ts` - Chroma Console integration
- `tauri/src/bin/test-midi-input.rs` - Testing utility

## See Also

- [MIDI Implementation Chart (Chroma Console)](../manuals/chroma-console.md)
- [Architecture Overview](../architecture.md)
