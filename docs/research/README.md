# Research Tools & Documentation

This directory contains tools and documentation for researching MIDI protocols and device capabilities.

## Tools

### SysEx Discovery Tool

**Purpose:** Systematically test SysEx commands to discover undocumented manufacturer-specific protocols.

**Location:** `tauri/src/bin/sysex-discovery.rs`

**Quick Start:**
```bash
cd tauri
cargo run --bin sysex-discovery -- "Chroma Console"
```

**Documentation:** [sysex-discovery-guide.md](./sysex-discovery-guide.md)

**Results:** Results are saved to `./sysex-discovery-results/` and documented in [sysex-discovery-results.md](./sysex-discovery-results.md)

## Research Documentation

### Active Research

- [sysex-discovery-results.md](./sysex-discovery-results.md) - Results from testing Chroma Console SysEx capabilities

### Historical Research

- [MIDI Libraries](../../research/02-midi-libraries.md) - Initial research on Rust MIDI libraries
- [Product Vision](../../product-vision.md) - Original project vision including SysEx support goals

## Research Goals

### Current

1. **Determine if Chroma Console supports SysEx state dumps**
   - Test common SysEx command patterns
   - Document any discovered protocols
   - Share findings with community

2. **Understand limitations of receive-only MIDI**
   - Document what's possible vs. impossible
   - Identify workarounds
   - Set realistic user expectations

### Future

1. **Test other Hologram pedals**
   - Microcosm SysEx capabilities
   - Compare implementations across product line

2. **Test competing devices**
   - Strymon pedals (known bidirectional support)
   - Chase Bliss pedals (advanced MIDI)
   - Establish baseline expectations

3. **Reverse engineering**
   - If SysEx dumps found, decode parameter mapping
   - Document protocol structure
   - Build protocol documentation for community

## Contributing

If you discover working SysEx commands or interesting MIDI behaviors:

1. Run the discovery tool and save results
2. Document findings in `sysex-discovery-results.md`
3. Share captured data files
4. Open GitHub issue or PR with findings

## See Also

- [MIDI Architecture](../architecture.md#midi-system) - Overall MIDI system architecture
- [SysEx Device Identity](../features/sysex-device-identity.md) - Implemented identity detection
- [Bidirectional MIDI](../features/bidirectional-midi.md) - MIDI feedback documentation
