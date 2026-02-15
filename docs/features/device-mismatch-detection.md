# Device Mismatch Detection

## Overview

The Device Mismatch Detection feature protects you from accidentally sending MIDI messages to the wrong pedal by detecting when the selected pedal editor doesn't match your physically connected MIDI device.

## Problem

When using a MIDI interface (like a Bluetooth WIDI adapter or USB interface), the device name in your MIDI device list might be generic (e.g., "WIDI Jack"), rather than the specific pedal name. This creates a scenario where:

1. You connect to a MIDI device (e.g., WIDI Jack connected to Chroma Console)
2. The app correctly identifies it or you manually select "Chroma Console" 
3. Later, you use the pedal switcher to navigate to "Microcosm" editor
4. **Problem**: You're now sending Microcosm MIDI messages to a Chroma Console pedal!

## Solution

The app now includes three layers of protection:

### 1. Warning Banner
When you switch to a different pedal editor that doesn't match your connected device, a prominent warning banner appears with:
- Details about the mismatch
- Connected device name
- Selected editor vs. detected pedal type
- Actions:
  - "Disconnect & Reconnect" - Safely disconnect and connect to the correct device
  - "I know what I'm doing" - Dismiss the warning if you're intentionally using this configuration

### 2. Connection Status Indicator
A small warning icon (⚠️) appears next to the device name in the MIDI Connection section when a high-confidence mismatch is detected.

### 3. Smart Detection Logic
The detection algorithm uses multiple strategies:

- **High Confidence**: Device name contains specific pedal names (e.g., "Microcosm", "Chroma Console", "Gen Loss")
- **Medium Confidence**: Device name contains manufacturer name but not specific model
- **Low Confidence**: Generic MIDI interfaces (e.g., "WIDI Jack", "USB MIDI") - no warning shown as the actual pedal can't be determined

## Detection Patterns

### Microcosm (Hologram Electronics)
- Device name contains: `microcosm`
- Manufacturer: `hologram`

### Chroma Console (Chase Bliss Audio)
- Device name contains: `chroma`, `console`
- Manufacturer: `chase bliss`

### Gen Loss MKII (Chase Bliss Audio)
- Device name contains: `gen loss`, `generation loss`, `genloss`
- Manufacturer: `chase bliss`

### Generic Interfaces (No Warning)
- `widi`, `jack`, `usb`, `bluetooth`, `bt`, `midi`, `interface`
- Manufacturer names: `yamaha`, `roland`, `korg`, `iconnectivity`, `cme`

## User Experience

### Scenario 1: Direct USB Connection
```
Connected Device: "Hologram Microcosm"
Selected Editor: Microcosm
Result: ✅ No warning (exact match)

Switch to: Chroma Console
Result: ⚠️ High confidence warning - device name clearly shows Microcosm
```

### Scenario 2: Bluetooth MIDI Adapter
```
Connected Device: "WIDI Jack"
Selected Editor: Microcosm
Result: ✅ No warning (can't determine actual pedal from adapter name)

Switch to: Chroma Console
Result: ✅ No warning (can't determine actual pedal from adapter name)

Note: User should manually verify they're connected to the correct pedal
```

### Scenario 3: User Knows Best
```
Connected Device: "Chroma Console"
Selected Editor: Microcosm
User clicks: "I know what I'm doing"
Result: ✅ Warning dismissed, user takes responsibility
```

## Technical Implementation

### Files
- `src/lib/midi/deviceMismatchDetection.ts` - Core detection logic
- `src/components/DeviceMismatchWarning.tsx` - Warning banner component
- `src/components/nav/ConnectionStatus.tsx` - Connection status with warning indicator
- `src/App.tsx` - Integration and state management

### API

```typescript
interface DeviceMismatch {
  isMismatch: boolean;
  connectedDeviceName: string;
  selectedPedalType: PedalType;
  detectedPedalType: PedalType | null;
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

function detectDeviceMismatch(
  connectedDeviceName: string,
  selectedPedalType: PedalType
): DeviceMismatch;
```

## SysEx Device Identity Request (Implemented!)

We now support MIDI Universal Device Inquiry to identify the actual pedal connected, regardless of the MIDI interface name!

### How It Works

1. When connecting to a device, you can request its identity using MIDI SysEx
2. The app sends a Universal Device Inquiry message: `F0 7E 7F 06 01 F7`
3. The pedal responds with its manufacturer ID, device family, and model number
4. This allows accurate detection even with generic interfaces like "WIDI Jack"

### Using the Device Identity Feature

**In Development Mode:**

1. Connect to your MIDI device in the device selector
2. Expand the "Developer: Show Device Identity" section
3. Click "Request Identity" button
4. The app will query the pedal and display:
   - Manufacturer name (if known)
   - Manufacturer ID (hex bytes)
   - Device family code
   - Device model code
   - Software version
5. Click "Copy Mapping Code" to get the code snippet
6. Add the mapping to `src/lib/midi/deviceIdentity.ts` in the `KNOWN_DEVICES` array

**Example Output:**
```
Manufacturer: Unknown (0x00, 0x12, 0x34)
Device Family: 0x0001 (1)
Device Model: 0x0005 (5)
```

**Adding a Known Device:**
```typescript
// In src/lib/midi/deviceIdentity.ts, add to KNOWN_DEVICES:
{
  manufacturer_id: [0x00, 0x12, 0x34],
  device_family: 0x0001,
  device_model: 0x0005,
  pedal_type: 'Microcosm'
}
```

### Discovering Manufacturer IDs

Since Hologram and Chase Bliss manufacturer IDs aren't publicly documented, we need to discover them empirically:

1. Connect your pedal via WIDI Jack (or any interface)
2. Use the Device Identity Debug panel
3. Click "Request Identity"
4. Note the manufacturer ID, family, and model
5. Add the mapping to the codebase
6. Once added, the app will auto-detect your pedal type even with generic MIDI interfaces!

### Notes

- Not all MIDI devices support Identity Request (some may not respond)
- Timeout is 2-3 seconds - if no response, the device doesn't support this feature
- Some pedals may need to be powered on and in a specific mode to respond
- This is a standard MIDI feature, so most modern pedals should support it

## Future Enhancements

1. **User Confirmation**: Remember user's confirmation when they dismiss a warning
2. **Device Profiles**: Allow users to save device profiles mapping MIDI interface names to pedals
3. **Test Mode**: Add a "test connection" feature that sends a safe CC message and verifies response
4. **Auto-Discovery**: Automatically request identity when connecting to unknown/generic devices

## Related Documentation
- [MIDI Connection Guide](../midi/bluetooth-midi-setup.md)
- [Pedal Specifications](../midi/)
- [Architecture Overview](../architecture.md)
