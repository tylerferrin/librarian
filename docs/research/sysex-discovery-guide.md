# SysEx Discovery Tool - User Guide

## What is This?

The SysEx Discovery Tool systematically tests MIDI System Exclusive (SysEx) commands to discover undocumented manufacturer-specific protocols. This helps us determine if devices like the Chroma Console support state dumps, parameter requests, or other advanced MIDI features.

## Quick Start

### Basic Usage

```bash
cd tauri
cargo run --bin sysex-discovery -- "Chroma Console"
```

This runs a **quick scan** testing ~20 common SysEx command patterns.

### Full Scan

```bash
cargo run --bin sysex-discovery -- "Chroma Console" --full-scan
```

Tests all 128 possible single-byte commands (0x00 - 0x7F). Takes ~2-3 minutes.

### Custom Command

```bash
cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 40 F7"
```

Test a specific SysEx message (useful if you found a reference in a manual or forum).

## Understanding Results

### No Responses ❌

```
❌ No responses received

This suggests:
  • Device doesn't implement SysEx state dumps
  • Commands tested don't match the protocol
  • Device requires specific initialization first
```

**What this means:**
- Most likely, the device doesn't support the SysEx commands we're looking for
- This is common with many guitar pedals
- Not a failure - we've definitively confirmed the limitation!

### Got Responses! ✅

```
✨ 2 command(s) received responses!

Successful commands:
  Request data dump (Standard)
  📤 Sent: [F0, 00, 02, 4D, 40, F7]
  📥 Received: 156 bytes
```

**What this means:**
- We found working SysEx commands!
- Check the `./sysex-discovery-results/` directory for captured data
- Time to analyze and decode the protocol

## Results Directory

All responses are saved to `./sysex-discovery-results/`:

```
sysex-discovery-results/
├── response-20260215-143022-test001.txt
├── response-20260215-143023-test002.txt
└── response-20260215-143024-test012.txt
```

Each file contains:
- Command that was sent
- Response data (hex dump)
- Human-readable ASCII representation
- Timestamp and metadata

## Safety Features

The tool is designed to be safe:

1. **Read-only focus** - Tests query/request commands first
2. **Rate limiting** - 100-200ms delay between commands
3. **No write operations** - Doesn't send preset data or parameter writes
4. **Ctrl+C safe** - Can abort at any time

## What We're Looking For

### Good Signs ✅

- Device sends back SysEx data
- Different commands get different responses
- Responses are consistent across multiple runs
- Response size matches parameter count (e.g., 35 params for Chroma Console)

### Neutral Signs ⚠️

- Device ACKs but sends no data (might need follow-up command)
- Very short responses (might be status/version info)
- Only one command works (might be limited protocol)

### No Responses ❌

- Device ignores all commands
- Likely doesn't implement manufacturer-specific SysEx
- Still valuable to know definitively!

## Next Steps After Discovery

### If You Find Working Commands:

1. **Test consistency**
   ```bash
   # Run same command multiple times
   cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 40 F7"
   ```

2. **Test across different presets**
   - Load preset 1, capture response
   - Load preset 2, capture response
   - Compare the differences

3. **Analyze response structure**
   - Look for patterns in hex data
   - Compare with known parameter values
   - Document the protocol format

4. **Share findings**
   - Open GitHub issue with results
   - Help the Chroma Console community!
   - Consider contacting Hologram with discoveries

### If No Commands Work:

1. **Confirm with manual/support**
   - Check official manual for SysEx documentation
   - Email Hologram support to ask about SysEx support
   - Search forums for any mentions

2. **Try alternative approaches**
   - Some devices need "handshake" first
   - Try sending after loading a preset
   - Test with different MIDI channels

3. **Document the finding**
   - Update app documentation
   - Note that device is CC-only
   - Helps future users understand limitations

## Understanding SysEx Format

### Basic Structure

```
F0                        Start of SysEx
00 02 4D                  Manufacturer ID (Hologram)
[COMMAND]                 Command byte
[DATA...]                 Optional data
F7                        End of SysEx
```

### Common Command Patterns

| Command | Typical Meaning |
|---------|----------------|
| 0x11    | Request current program/preset |
| 0x40    | Request data dump |
| 0x41    | Request all data |
| 0x42    | Request single parameter |
| 0x20-0x2F | Bank/program operations |

### Response Format

```
F0                        Start of SysEx
00 02 4D                  Manufacturer ID
[RESPONSE_CMD]            Response command (often CMD + 1)
[DATA...]                 Parameter data
F7                        End of SysEx
```

## Troubleshooting

### "Device not found" Error

```bash
# List available MIDI devices first
cargo run --bin test-midi-input
```

Make sure device name matches exactly.

### No Permission to Access MIDI

**macOS:**
- Go to System Settings → Privacy & Security → Input Monitoring
- Grant permission to Terminal or your IDE

**Linux:**
- Add user to `audio` group: `sudo usermod -a -G audio $USER`
- Restart session

### Device Hangs or Behaves Oddly

- Ctrl+C to abort
- Power cycle the pedal
- Use shorter timeout: modify source and reduce `timeout_ms`

## Real-World Example: Eventide H9

When the H9 SysEx protocol was discovered:

```
Send:    F0 1C 70 00 4C 00 F7        (Request current preset)
Receive: F0 1C 70 00 4D [300 bytes] F7 (Preset dump)

Send:    F0 1C 70 00 4F 00 00 F7     (Request param 0)
Receive: F0 1C 70 00 50 00 00 42 F7  (Param value = 0x42)
```

This allowed:
- Reading current state from pedal
- Backing up all presets
- Building comprehensive editors
- Two-way synchronization

## Contributing

If you discover working SysEx commands:

1. Save all response files
2. Document command → response mappings
3. Test across multiple presets/states
4. Share findings on GitHub
5. Help decode the protocol structure

## See Also

- [MIDI SysEx Device Identity](../features/sysex-device-identity.md) - Our existing identity implementation
- [Bidirectional MIDI](../features/bidirectional-midi.md) - Understanding MIDI feedback
- [MIDI Specification](https://midi.org/specifications) - Official MIDI docs
