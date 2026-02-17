# MIDI Input Debugging Guide

## Problem: Not Receiving MIDI from Chroma Console

If you're not seeing incoming MIDI when turning knobs on your Chroma Console, follow these steps to diagnose the issue.

## Important Note: Does Your Device Send MIDI?

**Many MIDI-controllable pedals only RECEIVE MIDI commands but do NOT send parameter feedback.**

The Chroma Console manual doesn't explicitly state that it transmits CC messages when knobs are turned. It may only:
- Receive MIDI CC to control parameters
- Forward MIDI through (in Interface mode)
- Send MIDI clock signals

To verify if your device sends MIDI at all, use the test utility below.

## Step 1: Check MIDI Connections

When you run the app with the updated code, you'll see detailed logging:

```
🔍 Available MIDI input ports:
   - WIDI Bud Pro
   - Chroma Console
   - ...

✅ Found matching input port: Chroma Console
✅ MIDI input listener setup for: Chroma Console
```

**What to check:**
- Is your device listed in the available ports?
- Does the port name match what you're connecting to?
- Did the listener setup successfully?

## Step 2: Test with the MIDI Input Utility

Run the standalone test utility to see if your device sends MIDI at all:

```bash
cd tauri
cargo run --bin test-midi-input
```

This will:
1. List all available MIDI input ports
2. Connect to your device
3. Show ALL incoming MIDI messages (any type, any channel)

**Try this:**
- Turn knobs on your Chroma Console
- Press buttons
- Change parameters

**What you should see if it's working:**
```
📥 MIDI CC Received:
   Channel: 1
   CC#: 64
   Value: 87
   Timestamp: 123456
   Raw bytes: [0xB0, 0x40, 0x57]
```

**If you see NOTHING:**
- Your device may not transmit MIDI parameter changes
- Check if there's a setting on the device to enable MIDI output
- Verify your MIDI connection is bidirectional (not output-only)

## Step 3: Check MIDI Channel

The app now logs ALL incoming MIDI with channel information:

```
🎹 RAW MIDI CC: Status=0xB0, Channel=1, CC#=64, Value=87
📥 MIDI CC Forwarding to UI: Device=Chroma Console, CC#=64, Value=87
```

Or if the channel doesn't match:

```
🎹 RAW MIDI CC: Status=0xB1, Channel=2, CC#=64, Value=87
⏭️  Ignoring CC on channel 2 (expecting channel 1)
```

**What to check:**
- Are messages being received but on the wrong channel?
- Check your Chroma Console's MIDI channel setting (Global Settings → TILT knob)
- Make sure the app is connected to the same channel

## Step 4: Verify MIDI Interface Settings

The Chroma Console has different MIDI routing modes (Global Settings → RATE knob):

- **Interface Mode** - Acts as MIDI interface, forwards messages
- **Thru Mode** - Forwards DIN IN to DIN OUT

**These modes affect MIDI routing but may not enable parameter feedback.**

## Common Issues

### Issue 1: Device Doesn't Send MIDI
**Symptom:** No MIDI messages at all when turning knobs

**Solution:** Your device may not support MIDI parameter feedback. This is common with many pedals. They can:
- ✅ Receive MIDI to control parameters
- ❌ Send MIDI when parameters change

**Workaround:** You'll need to manually adjust parameters in the app.

### Issue 2: Wrong MIDI Channel
**Symptom:** See messages in logs but they're filtered out

```
⏭️  Ignoring CC on channel 2 (expecting channel 1)
```

**Solution:** 
1. Check Chroma Console global settings (press all 4 buttons simultaneously)
2. TILT knob sets MIDI channel (1-16)
3. Reconnect in the app with the correct channel

### Issue 3: No Input Port Found
**Symptom:** See this warning:

```
⚠️  No MIDI input port found for: Chroma Console
```

**Solution:**
- Your MIDI connection may be output-only
- Some USB-MIDI adapters are unidirectional
- Check if the device appears in the input port list

### Issue 4: MIDI Input Port Has Different Name
**Symptom:** Port list shows device but with a different name

**Solution:** The app searches for ports containing your device name. If the port is named differently:
- Try connecting with the exact port name shown in the list
- The port might include additional text (e.g., "WIDI Bud Pro" instead of "Chroma Console")

## Testing Without Hardware

To test the MIDI input system without a physical device:

1. Use a MIDI loopback (virtual MIDI cable)
2. Send MIDI from a DAW or MIDI utility to the app
3. Verify the app receives and processes the messages

**macOS:** Use IAC Driver (built-in virtual MIDI)
**Windows:** Use loopMIDI or similar

## Expected Behavior (When Working)

When fully working, you should see:

1. **In Console Logs:**
```
🔍 Available MIDI input ports:
   - Chroma Console
✅ Found matching input port: Chroma Console
✅ MIDI input listener setup for: Chroma Console
🎹 RAW MIDI CC: Status=0xB0, Channel=1, CC#=64, Value=87
📥 MIDI CC Forwarding to UI: Device=Chroma Console, CC#=64, Value=87
📥 MIDI CC received in UI: { device: 'Chroma Console', cc: 64, value: 87 }
```

2. **In the UI:**
- Knobs move when you turn them on the pedal
- Bypass buttons toggle when pressed
- Values update in real-time

## Still Not Working?

If you've verified:
- ✅ MIDI input port is found and connected
- ✅ Channel matches
- ✅ Test utility shows NO messages

**Conclusion:** Your Chroma Console likely does not transmit MIDI parameter feedback. This is a hardware limitation, not a software issue.

**Alternative:** Consider using the app as the source of truth and only adjust parameters in the software, not on the hardware.

## Report Your Findings

When reporting issues, include:
1. Output from `cargo run --bin test-midi-input`
2. List of available input ports
3. MIDI channel setting on your device
4. Whether you see ANY MIDI messages in the test utility
5. Your connection method (USB, DIN MIDI, Bluetooth, etc.)
