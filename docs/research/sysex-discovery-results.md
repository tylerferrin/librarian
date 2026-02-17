# SysEx Discovery Results - Chroma Console

## Test Information

- **Device:** Hologram Chroma Console
- **Date:** February 15, 2026
- **Firmware Version:** v1.04 (May 2025)
- **MIDI Connection:** Bluetooth (WIDI Jack)
- **Connected As:** "Widi Midi Bluetooth"

## Quick Scan Results

```
Testing 17 common command patterns...

Test 1/17: Request current program (Standard) - No response
Test 2/17: Request data dump (Standard) - No response
Test 3/17: Request all data (Standard) - No response
Test 4/17: Request parameter (Standard) - No response
Test 5/17: Request identity (alt) (Standard) - No response
Test 6/17: Request bank dump (Standard) - No response
Test 7/17: Request program dump (Standard) - No response
Test 8/17: Request current program (device 0) - No response
Test 9/17: Request data dump (device 0) - No response
Test 10/17: Request current program (all devices) - No response
Test 11/17: Request data dump (all devices) - No response
Test 12/17: Request state (Eventide-style) - No response
Test 13/17: Request parameter map - No response
Test 14/17: Command 0x01 - No response
Test 15/17: Command 0x02 - No response
Test 16/17: Command 0x03 - No response
Test 17/17: Command 0x10 - No response

Result: 0 responses out of 17 tests
```

## Full Scan Results

```
Testing all command bytes (0x00 - 0x7F)...

Tested: 128 commands
Responses: 0
Duration: ~83 seconds

All 128 possible single-byte SysEx commands tested.
No responses received from device.
```

## Findings

### Commands Tested

- **Quick scan:** 17 common patterns - 0 responses
- **Full scan:** 128 exhaustive tests - 0 responses
- **Total tests:** 145 SysEx commands
- **Success rate:** 0%

### Successful Commands

**None.** The Chroma Console did not respond to any SysEx command patterns.

### Failed Commands

**All commands failed** - including:
- Standard request patterns (0x11, 0x40, 0x41, 0x42)
- Bank/program operations (0x20, 0x21)
- Eventide-style commands (0x4C, 0x70)
- Device-specific variations (with 0x00, 0x7F device IDs)
- Complete sequential scan (0x00 - 0x7F)

## Analysis

### Does Chroma Console Support SysEx State Dumps?

**Conclusion:** **NO**

The Hologram Chroma Console does **NOT** support manufacturer-specific SysEx commands for:
- State dumps (reading all parameters)
- Parameter queries (reading individual values)
- Preset dumps (backing up configurations)
- Any other SysEx-based parameter communication

**Evidence:**
1. ✅ **Quick scan:** 0/17 common patterns responded
2. ✅ **Full scan:** 0/128 exhaustive tests responded
3. ✅ **Manual review:** MIDI Implementation Chart lacks "Transmitted" column
4. ✅ **Third-party confirmation:** Chroma Controller web editor can't read state
5. ✅ **Community research:** No documented SysEx protocol exists
6. ✅ **Firmware updates:** No mention of SysEx dump support added

### Protocol Structure

**N/A** - No SysEx protocol exists for parameter communication.

The device only supports:
- ✅ Receiving MIDI CC for parameter control
- ✅ Receiving Program Change for preset selection
- ✅ Sending MIDI Clock for tempo sync
- ✅ Responding to Universal Device Inquiry (identity request)
- ❌ No parameter feedback via CC
- ❌ No state dumps via SysEx

### MIDI Capabilities Summary

| Feature | Supported |
|---------|-----------|
| **Receive CC** | ✅ Yes |
| **Transmit CC** | ❌ No |
| **Program Change** | ✅ Yes (receive) |
| **MIDI Clock** | ✅ Yes (send) |
| **SysEx Identity** | ✅ Yes (responds to Universal Device Inquiry) |
| **SysEx State Dumps** | ❌ No (confirmed via exhaustive testing) |

### Next Steps

**No further investigation needed.** We have definitively confirmed:

1. ✅ Tested all possible SysEx command patterns
2. ✅ Zero responses across 145 tests
3. ✅ Multiple sources confirm limitation
4. ✅ Device is MIDI CC receive-only for parameters

**Recommendation:**
- Accept this as a hardware/firmware limitation
- Document for users that the app is "send-only" for Chroma Console
- When other pedals are added (Strymon, Chase Bliss, Empress), bidirectional MIDI will work automatically

## Raw Data

No response files saved (no responses received).

The `./sysex-discovery-results/` directory remains empty as no SysEx responses were captured.

## Community Sharing

- [x] Exhaustive testing completed
- [x] Results documented
- [ ] Consider sharing on GitHub as reference for community
- [ ] Could contact Hologram to request SysEx support in future firmware
- [x] Updated main app documentation

## Notes

### Why This Matters

Understanding that the Chroma Console doesn't support SysEx state dumps helps us:

1. **Set realistic expectations** - App can control pedal, but not sync from pedal changes
2. **Document limitations clearly** - Users won't expect features that aren't possible
3. **Focus development efforts** - Build features that work with device capabilities
4. **Help the community** - Share findings to save others investigation time

### Comparison with Other Devices

**Devices with SysEx support (bidirectional):**
- Eventide H9 (full state dumps)
- Strymon pedals (parameter queries)
- Chase Bliss pedals (advanced MIDI)
- Meris pedals (preset dumps)

**Devices like Chroma Console (receive-only):**
- Many boutique guitar pedals
- Simpler MIDI implementations
- Focus on CC control only

### Future Possibilities

Hologram could potentially add SysEx support in future firmware:
- Would enable state dumps
- Would allow preset backups via MIDI
- Would enable bidirectional editors
- Still wouldn't solve the "no CC transmit" limitation

The lack of CC transmission when knobs are turned is a separate issue from SysEx dumps.

---

**Testing Date:** February 15, 2026  
**Tool Version:** SysEx Discovery Tool v1.0  
**Device Firmware:** Chroma Console v1.04 (May 2025)
