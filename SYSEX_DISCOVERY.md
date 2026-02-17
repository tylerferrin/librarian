# SysEx Discovery Tool - Quick Reference

## 🎯 What Does This Do?

Tests MIDI System Exclusive (SysEx) commands to discover if your Chroma Console (or other pedals) supports:
- State dumps (reading all parameters at once)
- Parameter requests (querying individual values)
- Preset dumps (backing up configurations)
- Other undocumented MIDI features

## 🚀 Quick Start

### 1. Connect Your Pedal
Make sure your Chroma Console is connected via MIDI (USB, DIN, or Bluetooth).

### 2. Run Quick Scan (Recommended First)
```bash
cd tauri
cargo run --bin sysex-discovery -- "Chroma Console"
```

This tests ~20 common SysEx patterns in about 30 seconds.

### 3. Check Results
Results are saved to `./sysex-discovery-results/`

## 📋 Usage Examples

### Quick Scan (30 seconds)
```bash
cargo run --bin sysex-discovery -- "Chroma Console"
```

### Full Scan (2-3 minutes, tests all 128 commands)
```bash
cargo run --bin sysex-discovery -- "Chroma Console" --full-scan
```

### Test Custom Command
```bash
cargo run --bin sysex-discovery -- "Chroma Console" --custom "F0 00 02 4D 40 F7"
```

### Test Different Device
```bash
cargo run --bin sysex-discovery -- "Microcosm"
cargo run --bin sysex-discovery -- "WIDI Jack"
```

## 🔍 Understanding Results

### ❌ No Responses (Most Likely)
```
❌ No responses received

This suggests:
  • Device doesn't implement SysEx state dumps
  • Commands tested don't match the protocol
```

**This is normal!** Many guitar pedals only support MIDI CC control, not SysEx dumps.

### ✅ Got Responses! (Exciting!)
```
✅ RESPONSE RECEIVED!
   Length: 156 bytes
   💾 Saved to: ./sysex-discovery-results/response-20260215-143022-test001.txt
```

**This means:**
1. We found a working SysEx command!
2. Check the results directory for captured data
3. Time to decode the protocol

## 📁 Results Directory

All responses are saved with timestamps:
```
sysex-discovery-results/
├── response-20260215-143022-test001.txt
├── response-20260215-143023-test002.txt
└── response-20260215-143024-test012.txt
```

Each file contains:
- Command sent
- Response received (hex and ASCII)
- Metadata and timestamps

## ⚠️ Safety Notes

- ✅ Safe to run - tests read-only commands first
- ✅ Rate-limited - won't flood your device
- ✅ No writes - doesn't modify presets
- ✅ Ctrl+C anytime - can abort safely

## 📚 Documentation

- **Full Guide:** [docs/research/sysex-discovery-guide.md](docs/research/sysex-discovery-guide.md)
- **Results Template:** [docs/research/sysex-discovery-results.md](docs/research/sysex-discovery-results.md)
- **Research Docs:** [docs/research/README.md](docs/research/README.md)

## 🎸 Real-World Example

When Eventide H9 SysEx was discovered:
```bash
Send:    F0 1C 70 00 4C 00 F7        # Request preset
Receive: F0 1C 70 00 4D [300 bytes]  # Full preset dump!
```

This enabled:
- Reading current state
- Backing up presets
- Building comprehensive editors
- Two-way sync

## 🤝 Contributing

If you discover working commands:
1. Save all result files
2. Document in `docs/research/sysex-discovery-results.md`
3. Share findings via GitHub issue
4. Help decode the protocol!

## 🛠️ Troubleshooting

### "Device not found"
```bash
# List available devices first
cargo run --bin test-midi-input
```

### Still Not Working?
See the full troubleshooting guide in [docs/research/sysex-discovery-guide.md](docs/research/sysex-discovery-guide.md)

## 🎯 What We're Testing

The tool tests Hologram's manufacturer ID (`00 02 4D`) with various command bytes:
- `0x11` - Request current program
- `0x40` - Request data dump  
- `0x41` - Request all data
- `0x42` - Request parameter
- And many more...

## 📞 Next Steps

1. **Run the quick scan** on your Chroma Console
2. **Document results** in `docs/research/sysex-discovery-results.md`
3. **Share findings** - even negative results are valuable!
4. If responses found, **analyze and decode** the protocol
5. **Help the community** by documenting discoveries

---

**Ready to discover?** 🔍

```bash
cd tauri
cargo run --bin sysex-discovery -- "Chroma Console"
```
