# Quick MIDI Input Test

I've added extensive debugging to help figure out why MIDI input isn't working. Here's what to do:

## Step 1: Run the Standalone Test (FASTEST WAY TO DIAGNOSE)

This will show if your Chroma Console sends MIDI at all:

```bash
cd tauri
cargo run --bin test-midi-input
```

Then **turn knobs on your Chroma Console** and watch for messages.

**If you see messages:** Your device sends MIDI! We just need to fix the channel/port matching.

**If you see NOTHING:** Your Chroma Console doesn't send parameter feedback via MIDI (common with many pedals).

## Step 2: Run the Full App with Debug Logging

```bash
npm run tauri:dev
```

Watch the terminal output when you connect to your Chroma Console. You'll see:

1. **Available MIDI input ports:**
```
🔍 Available MIDI input ports:
   - WIDI Bud Pro
   - Chroma Console
```

2. **Connection status:**
```
✅ Found matching input port: Chroma Console
✅ MIDI input listener setup for: Chroma Console
```

3. **When you turn a knob:**
```
🎹 RAW MIDI CC: Status=0xB0, Channel=1, CC#=64, Value=87
📥 MIDI CC Forwarding to UI: Device=Chroma Console, CC#=64, Value=87
```

## What Each Log Means

- `🔍 Available MIDI input ports` - Shows all devices that can send MIDI to the computer
- `✅ Found matching input port` - The app found your device's input port
- `⚠️  No MIDI input port found` - Your device isn't visible as an input (might be output-only)
- `🎹 RAW MIDI CC` - A MIDI message was received (any channel)
- `📥 MIDI CC Forwarding to UI` - Message matched the channel and was sent to the UI
- `⏭️  Ignoring CC on channel X` - Message received but wrong channel

## Common Scenarios

### Scenario 1: No Input Port Found
```
⚠️  No MIDI input port found for: Chroma Console
```

**This means:** The device doesn't appear as a MIDI input. Your connection might be:
- Output-only cable/adapter
- Device doesn't send MIDI feedback
- Different port name than expected

### Scenario 2: Messages on Wrong Channel
```
🎹 RAW MIDI CC: Status=0xB1, Channel=2, CC#=64, Value=87
⏭️  Ignoring CC on channel 2 (expecting channel 1)
```

**This means:** Device is sending MIDI but on channel 2, app expects channel 1.

**Fix:** 
- Chroma Console global settings: Press all 4 buttons
- Use TILT knob to set MIDI channel to match the app
- Or reconnect in app with channel 2

### Scenario 3: No Messages At All
You see:
```
✅ MIDI input listener setup for: Chroma Console
```

But when turning knobs: (nothing)

**This means:** The Chroma Console probably doesn't transmit MIDI when knobs are turned.

**This is NORMAL for many pedals.** They can receive MIDI commands but don't send feedback.

## Next Steps

**After running the test, report back:**

1. Do you see your device in the input port list?
2. Does the standalone test show ANY messages when turning knobs?
3. What channel is your Chroma Console set to? (Global settings → TILT knob)
4. How is it connected? (USB direct, MIDI interface, wireless, etc.)

## Full debugging guide
See: `docs/troubleshooting/midi-input-debugging.md`
