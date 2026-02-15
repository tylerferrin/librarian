# Device Profiles

## Overview

Device Profiles allow you to save mappings between MIDI interface names (like "WIDI Jack") and the actual pedals they're connected to. This is especially useful when using Bluetooth MIDI adapters or USB interfaces that don't pass through device identity information.

## The Problem

When using MIDI interfaces like WIDI Jack:
1. The interface name doesn't reveal the connected pedal
2. SysEx identity requests often return the interface's ID, not the pedal's
3. You have to manually select the pedal type each time

## The Solution

**Device Profiles** remember your configuration:
- "WIDI Jack" → Chroma Console
- "USB MIDI Interface" → Microcosm
- "IAC Driver Bus 1" → Gen Loss MKII

## How to Use

### Saving a Profile

1. **Connect to Your Device**
   - Open the Device Selector
   - Find your MIDI interface (e.g., "WIDI Jack")

2. **Select Your Pedal Type**
   - Use the dropdown to choose the correct pedal
   - Check "Remember this device"

3. **Done!**
   - The app will remember this mapping
   - Next time you connect, it auto-selects the correct pedal
   - Mismatch warnings will use your saved configuration

### What Gets Saved

```typescript
{
  interfaceName: "WIDI Jack",
  pedalType: "ChromaConsole",
  createdAt: "2026-02-14T..."
}
```

Stored in browser localStorage, persists across app restarts.

### Indicators

**Blue "Remembered" Badge:**
```
🔽 Remembered: Chroma Console
```
Appears when the app is using your saved profile.

**Green "Auto-detected" Badge:**
```
✓ Auto-detected: Microcosm
```
Appears when the device name clearly indicates the pedal.

## Use Cases

### Scenario 1: WIDI Jack with Multiple Pedals

You have one WIDI Jack that you swap between pedals:

1. **Session 1: Chroma Console**
   - Connect WIDI Jack
   - Select "Chroma Console"
   - Check "Remember"
   - Use the Chroma editor ✅

2. **Session 2: Switch to Microcosm**
   - Physically connect WIDI Jack to Microcosm
   - App still thinks it's Chroma (from saved profile)
   - Switch to Microcosm editor
   - Get mismatch warning ⚠️
   - Update profile or dismiss warning

3. **Solution**: Uncheck "Remember" if you frequently swap pedals

### Scenario 2: Dedicated WIDI Jack per Pedal

You have dedicated interfaces:
- "WIDI Jack #1" → always Chroma Console
- "WIDI Jack #2" → always Microcosm

1. Save profile for each WIDI Jack
2. Connect the appropriate one
3. App auto-detects correctly every time! ✅

### Scenario 3: Testing/Development

You want to test the wrong editor on purpose:

1. Connect to device with saved profile
2. Switch to different editor
3. Warning appears
4. Click "I know what I'm doing" to dismiss

## Managing Profiles

### View Saved Profiles

Open browser console:
```javascript
// Load all profiles
localStorage.getItem('librarian_device_profiles')
```

### Delete a Profile

1. Connect to the device
2. Uncheck "Remember this device"
3. Profile is removed on next connection

Or via console:
```javascript
localStorage.removeItem('librarian_device_profiles')
```

### Export/Backup Profiles

```javascript
// Copy this value
localStorage.getItem('librarian_device_profiles')
```

### Import/Restore Profiles

```javascript
// Paste your backup
localStorage.setItem('librarian_device_profiles', 'YOUR_BACKUP_HERE')
```

## Technical Details

### Storage
- **Location**: Browser localStorage
- **Key**: `librarian_device_profiles`
- **Format**: JSON array of profile objects
- **Persistence**: Survives browser restarts, cleared on browser data clear

### Profile Structure
```typescript
interface DeviceProfile {
  interfaceName: string;      // Exact MIDI device name
  pedalType: PedalType;       // 'Microcosm' | 'ChromaConsole' | 'GenLossMkii'
  nickname?: string;          // Optional user nickname (future)
  notes?: string;             // Optional notes (future)
  createdAt: string;          // ISO timestamp
}
```

### API

```typescript
import { 
  saveDeviceProfile, 
  getPedalTypeForDevice,
  hasDeviceProfile,
  deleteDeviceProfile 
} from '@/lib/midi/deviceProfiles';

// Save a profile
saveDeviceProfile('WIDI Jack', 'ChromaConsole');

// Check for saved profile
const pedalType = getPedalTypeForDevice('WIDI Jack');
// Returns: 'ChromaConsole' or null

// Check if profile exists
if (hasDeviceProfile('WIDI Jack')) {
  // Profile exists
}

// Delete profile
deleteDeviceProfile('WIDI Jack');
```

## Integration with Device Mismatch Detection

Device Profiles have the **highest priority** in mismatch detection:

1. **Saved Profile** (highest priority)
   - If you've saved "WIDI Jack" → Chroma Console
   - And you switch to Microcosm editor
   - High-confidence warning appears

2. **Name-Based Detection**
   - Device name contains pedal name
   - Medium to high confidence

3. **Generic Interface**
   - Can't determine pedal
   - No warning (low confidence)

This means your saved profiles override name-based detection and provide accurate warnings even with generic interfaces!

## Troubleshooting

### Profile Not Saving

**Check:**
- Browser localStorage enabled
- Not in private/incognito mode
- Browser storage not full

### Wrong Pedal Auto-Selected

**Solution:**
1. Uncheck "Remember this device"
2. Select correct pedal
3. Re-check "Remember this device"

### Multiple Devices Same Name

If you have multiple "WIDI Jack" devices:
- Profiles match by exact name
- All devices with same name use same profile
- Consider renaming devices in Bluetooth settings (if supported)

### Want to Reset Everything

```javascript
// Console command
localStorage.removeItem('librarian_device_profiles')
```

Then refresh the app.

## Best Practices

### ✅ DO:
- Save profiles for dedicated interfaces
- Update profile when physically changing connections
- Use "Remember" for stable setups

### ❌ DON'T:
- Save profiles if you frequently swap pedals
- Ignore mismatch warnings without verifying
- Forget to update profile after hardware changes

## Future Enhancements

Potential features:
- Multiple profiles per interface (time-based or manual switch)
- Sync profiles across devices (cloud storage)
- Import/export UI in settings
- Profile notes and nicknames
- Auto-detect profile conflicts
- Profile switching shortcuts

## Related Documentation

- [Device Mismatch Detection](./device-mismatch-detection.md)
- [SysEx Device Identity](./sysex-device-identity.md)
