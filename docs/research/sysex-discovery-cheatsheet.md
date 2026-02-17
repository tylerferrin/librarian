# SysEx Discovery - Cheat Sheet

## Quick Commands

```bash
# Navigate to tauri directory
cd tauri

# Quick scan (~30 seconds)
cargo run --bin sysex-discovery -- "Chroma Console"

# Full scan (~2-3 minutes)
cargo run --bin sysex-discovery -- "Chroma Console" --full-scan

# Test custom hex command
cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 40 F7"

# List available MIDI devices
cargo run --bin test-midi-input
```

## What the Tool Tests

### Quick Scan (18 patterns)
- Standard request commands (0x11, 0x40, 0x41, 0x42)
- Commands with device ID (0x00, 0x7F)
- Eventide-style patterns (0x4C, 0x70)
- Sequential test (0x01, 0x02, 0x03, 0x10)

### Full Scan
- All 128 single-byte commands (0x00 - 0x7F)
- Format: `F0 00 02 4D [CMD] F7`

## Expected Outcomes

| Outcome | Meaning | Next Steps |
|---------|---------|------------|
| **No responses** | Device doesn't support SysEx dumps | Document finding, consider alternatives |
| **1-2 responses** | Partial protocol support | Analyze responses, test variations |
| **Many responses** | Full SysEx protocol! | Decode structure, document mapping |

## Results Location

```
./sysex-discovery-results/
├── response-[timestamp]-test[num].txt
```

Each file contains:
- Hex dump of sent command
- Hex dump of response
- ASCII representation
- Metadata

## Decoding Responses

If you get responses:

1. **Compare across presets**
   ```bash
   # Load preset 1 on pedal
   cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 40 F7"
   
   # Load preset 2 on pedal
   cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 40 F7"
   
   # Compare the two response files
   ```

2. **Look for patterns**
   - Consistent header/footer bytes
   - Expected length (35 params for Chroma Console)
   - Values that match known parameters

3. **Test single parameters**
   ```bash
   # Try parameter index
   cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 42 00 F7"
   cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 42 01 F7"
   ```

## Common SysEx Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| Request dump | Ask for all parameters | `F0 [mfg] 40 F7` |
| Dump response | Device sends state | `F0 [mfg] 41 [data...] F7` |
| Request param | Ask for single value | `F0 [mfg] 42 [param#] F7` |
| Param response | Device sends value | `F0 [mfg] 43 [param#] [value] F7` |

## Interpreting Results

### Example: Success Case

```
📤 Sending: [F0, 00, 02, 4D, 40, F7]
✅ RESPONSE RECEIVED!
   Length: 156 bytes
   Data: [F0, 00, 02, 4D, 41, 00, 12, 34, 56, ...]
```

**Analysis:**
- Command 0x40 → Response starts with 0x41 (command + 1 pattern)
- 156 bytes might include: header (5) + params (35×4) + checksum (1) + footer (1)
- Need to decode parameter mapping

### Example: Partial Response

```
📤 Sending: [F0, 00, 02, 4D, 0E, F7]
✅ RESPONSE RECEIVED!
   Length: 8 bytes
   Data: [F0, 00, 02, 4D, 0F, 01, 04, F7]
```

**Analysis:**
- Short response (8 bytes)
- Might be firmware version (0x01, 0x04 = v1.04)
- Or device status/acknowledgment

### Example: No Response

```
📤 Sending: [F0, 00, 02, 4D, 11, F7]
❌ No response (timeout)
```

**Analysis:**
- Command not implemented
- Or requires different format
- Try variations

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Device not found | Run `cargo run --bin test-midi-input` to see device name |
| Permission denied | Grant MIDI access in system settings |
| Compilation error | Run `cargo clean && cargo build` |
| Strange results | Power cycle pedal and try again |

## Safety Reminders

✅ **Safe:**
- Query/request commands (0x40-0x4F range)
- Reading current state
- Multiple tests of same command

⚠️ **Be Careful:**
- Write commands (might overwrite presets)
- Commands with large payloads
- Anything in 0x20-0x2F range

💡 **Best Practice:**
- Test with preset you don't care about
- Have backups of important presets
- Start with quick scan before full scan

## Sharing Findings

If you discover something:

1. ✅ Save response files
2. ✅ Document in `sysex-discovery-results.md`
3. ✅ Test consistency (run multiple times)
4. ✅ Test across different presets
5. ✅ Share on GitHub with:
   - Device info (model, firmware version)
   - Commands tested
   - Response files
   - Your analysis

## Related Tools

```bash
# Test MIDI input (see what device sends)
cargo run --bin test-midi-input

# Request device identity
# (TypeScript, in main app)
await requestDeviceIdentity("Chroma Console")
```

## Quick Reference: Hologram Manufacturer ID

```
Hologram Electronics LLC: 00 02 4D
```

All commands format:
```
F0 00 02 4D [COMMAND] [DATA...] F7
```

## Resources

- **Full Guide:** `/docs/research/sysex-discovery-guide.md`
- **Results Template:** `/docs/research/sysex-discovery-results.md`
- **MIDI Spec:** https://midi.org/specifications
- **MMA SysEx IDs:** https://midi.org/SysExIDtable
