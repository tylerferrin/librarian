# MIDI SysEx Device Identity Detection

## Overview

The app now uses **MIDI Universal Device Inquiry** (SysEx) to automatically identify connected pedals, even when using generic MIDI interfaces like WIDI Jack, USB-MIDI adapters, or Bluetooth dongles.

## Why This Matters

When you use a Bluetooth MIDI adapter (e.g., WIDI Jack) or USB MIDI interface, the device name doesn't reveal what pedal is connected:
- ❌ Device name: "WIDI Jack" → We don't know if it's a Microcosm or Chroma Console
- ✅ SysEx Identity Request → Pedal responds with its manufacturer ID and model!

## How It Works

### MIDI Universal Device Inquiry Protocol

The app sends a standard MIDI SysEx message asking "Who are you?":

```
F0 7E 7F 06 01 F7
```

The pedal responds with:
```
F0 7E [dev] 06 02 [manufacturer ID] [family] [model] [version] F7
```

### Implementation Details

**Backend (Rust):**
- `tauri/src/midi/identity.rs` - Core SysEx implementation
- Opens MIDI input/output connections
- Sends identity request
- Listens for response (with timeout)
- Parses manufacturer ID, device family, model, and software version

**Frontend (TypeScript):**
- `src/lib/midi/deviceIdentity.ts` - TypeScript API
- `src/components/DeviceIdentityDebug.tsx` - Debug UI component
- Invokes Tauri command to request identity
- Displays parsed information
- Provides code generation for adding new devices

## Usage Guide

### For Users (Testing Your Setup)

1. **Open Device Selector**
   - Start the app
   - You'll see available MIDI devices

2. **Expand Developer Panel** (Dev mode only)
   - Find your device in the list
   - Click "▶ Developer: Show Device Identity"
   - Click "Request Identity" button

3. **View Results**
   ```
   Manufacturer: Unknown
   Manufacturer ID: [0x00, 0x12, 0x34]
   Device Family: 0x0001 (1)
   Device Model: 0x0005 (5)
   ```

4. **Copy the Mapping**
   - Click "📋 Copy Mapping Code"
   - Share it with developers or add it yourself

### For Developers (Adding New Devices)

Once you've discovered a device's identity:

1. **Open `src/lib/midi/deviceIdentity.ts`**

2. **Add to `KNOWN_DEVICES` array:**
   ```typescript
   const KNOWN_DEVICES: ManufacturerMapping[] = [
     {
       manufacturer_id: [0x00, 0x12, 0x34], // From identity request
       device_family: 0x0001,               // Optional
       device_model: 0x0005,                // Optional
       pedal_type: 'Microcosm'              // Your pedal type
     },
     // Add more as discovered...
   ];
   ```

3. **Test It**
   - Restart the app
   - Connect via WIDI Jack or generic interface
   - App should now auto-detect the pedal type!

## Discovered Device IDs

### Known MIDI Interfaces

These devices respond to identity requests but are interfaces, not pedals:

**WIDI Jack (CME Pro Audio)** ✅ Discovered!
```
Manufacturer ID: [0x00, 0x02, 0x4D]
Device Family: 0x22C8 (8904)
Device Model: 0x21C3 (8643)
Software Version: "0104" (firmware v1.04)
Note: Does not pass through identity requests to connected pedals
```

### Currently Known Pedals

**Hologram Electronics Pedals** ✅ Discovered!

⚠️ **Important:** Both Chroma Console and Microcosm report **identical device identities**!

```
Manufacturer ID: [0x00, 0x20, 0x63]  // Hologram Electronics
Device Family: 0x048F (1167)
Device Model: 0x0000 (0)
Software Version: Varies by firmware

Pedals with this identity:
- Hologram Chroma Console
- Hologram Microcosm

Note: Cannot distinguish between these pedals via SysEx alone.
Use Device Profiles or name-based detection (direct USB connection).
```

**Implications:**
- ✅ Can detect: "This is a Hologram pedal"
- ❌ Cannot detect: Which Hologram pedal specifically
- 💡 Solution: Device Profiles (manual configuration) or direct USB (name in device string)

**Needed:**
- [ ] Chase Bliss Gen Loss MKII identity
- [ ] Other Chase Bliss pedals
- [ ] Test if direct USB shows unique device names

**Format to share:**
```
Pedal: Hologram Microcosm
Manufacturer ID: [0x??, 0x??, 0x??]
Device Family: 0x????
Device Model: 0x????
Software Version: [ASCII if applicable]
Connection: Direct USB / WIDI Jack / Other
```

### Standard MIDI Manufacturer IDs (Reference)

Some well-known manufacturer IDs for reference:
- `0x21` or `0x41` - Roland
- `0x43` - Yamaha
- `0x47` - Akai
- `0x00 [XX XX]` - Extended ID (3 bytes)

Hologram Electronics and Chase Bliss Audio likely have extended IDs or special codes we need to discover.

## Troubleshooting

### Device Doesn't Respond

**Possible reasons:**
1. Device doesn't support Universal Device Inquiry (rare for modern pedals)
2. Device is in a mode that doesn't respond to MIDI
3. MIDI connection issue
4. Timeout too short (default: 2 seconds)

**Solutions:**
- Ensure pedal is powered on and in normal operating mode
- Check MIDI connections
- Try increasing timeout in the code
- Test with direct USB connection first, then Bluetooth

### Wrong Information Returned

Some devices return non-standard identity replies. Check:
- Full hex dump in console logs
- Manufacturer ID format (1 byte vs 3 bytes)
- Device may need firmware update

### No Developer Panel Visible

The Device Identity Debug panel only appears in **development mode**:
```bash
npm run tauri dev
```

In production builds, this feature is hidden to avoid confusing regular users.

## Technical Reference

### MIDI Specification

- **MIDI 1.0 Specification**: Universal System Exclusive Messages
- **Sub-ID #1**: `06` (General Information)
- **Sub-ID #2**: `01` (Identity Request) or `02` (Identity Reply)
- **Device ID**: `7F` (broadcast to all devices)

### Message Format

**Request:**
```
F0 7E 7F 06 01 F7
│  │  │  │  │  └─ End of SysEx
│  │  │  │  └──── Sub-ID #2: Identity Request
│  │  │  └─────── Sub-ID #1: General Information
│  │  └────────── Device ID: 7F (all devices)
│  └───────────── Universal Non-Realtime SysEx
└──────────────── SysEx Status
```

**Reply:**
```
F0 7E [dev] 06 02 [mfg] [fam LSB] [fam MSB] [mod LSB] [mod MSB] [ver...] F7
```

### Code Structure

**Rust Backend:**
```rust
pub fn request_device_identity(
    device_name: &str,
    timeout_ms: u64,
) -> MidiResult<Option<DeviceIdentity>>
```

**TypeScript Frontend:**
```typescript
export async function requestDeviceIdentity(
  deviceName: string,
  timeoutMs: number = 2000
): Promise<DeviceIdentity | null>
```

## Contributing

If you discover manufacturer IDs for any pedals, please:
1. Test multiple times to confirm consistency
2. Note the pedal model and firmware version
3. Submit a PR or issue with the information
4. Help others by documenting your findings!

## Related Documentation

- [Device Mismatch Detection](./device-mismatch-detection.md)
- [MIDI Specification](https://www.midi.org/specifications)
- [Tauri IPC Documentation](https://tauri.app/v1/guides/features/command/)
