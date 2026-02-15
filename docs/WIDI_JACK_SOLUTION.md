# WIDI Jack & Bluetooth MIDI Solution

## What You Discovered

When testing the SysEx Device Identity feature with your WIDI Jack, you got:

```javascript
// WIDI Midi Bluetooth
{
  manufacturer_id: [0x00, 0x02, 0x4d],  // CME Pro Audio (WIDI manufacturer)
  device_family: 0x22c8,
  device_model: 0x21c3,
  pedal_type: '???',
}
```

## What This Means

**The WIDI Jack is responding with its OWN identity, not the Chroma Console's!**

This is actually expected behavior for MIDI interfaces:
- The WIDI Jack acts as the MIDI device
- It doesn't transparently pass SysEx messages to the downstream pedal
- It responds to identity requests as "WIDI Jack" (made by CME Pro Audio)
- Manufacturer ID `[0x00, 0x02, 0x4d]` = CME Pro Audio

## Why This Happens

Bluetooth MIDI adapters like WIDI Jack are **MIDI bridges**, not transparent cables:

```
Computer → Bluetooth → WIDI Jack → Pedal
         (SysEx here) ↑ Responds!
                            ↓ Never reaches pedal
```

The WIDI Jack intercepts the identity request and responds itself.

## The Solution: Device Profiles

Since we can't auto-detect the pedal via SysEx through a WIDI Jack, we implemented **Device Profiles** - a way to manually save the mapping and have the app remember it!

### New Features Added

**1. Device Profile Storage**
- `src/lib/midi/deviceProfiles.ts` - Profile management API
- Saves to browser localStorage
- Persists across app restarts

**2. "Remember This Device" Checkbox**
- Appears in Device Selector when you manually choose a pedal type
- When checked, saves the mapping: "WIDI Jack" → "Chroma Console"
- Next time you connect, auto-selects correctly!

**3. Enhanced Mismatch Detection**
- Now checks saved profiles FIRST (highest priority)
- If you saved "WIDI Jack" as Chroma Console
- And you switch to Microcosm editor
- You'll get a high-confidence warning! ⚠️

**4. Developer Tools (After Connection)**
- Added identity request button in Connection Status panel
- Try querying AFTER connecting to see if pedal responds differently
- Useful for testing various scenarios

## How to Use It

### First-Time Setup

1. **Connect Your WIDI Jack** (with Chroma Console attached)
   ```
   Device Selector → Find "WIDI Jack" or "WIDI-MIDI"
   ```

2. **Select Pedal Type**
   ```
   Dropdown → Choose "Chroma Console"
   ```

3. **Check "Remember This Device"**
   ```
   ✓ Remember this device
   App will auto-select Chroma Console for "WIDI Jack"
   ```

4. **Click Connect**

### Every Time After

1. **Connect WIDI Jack**
2. **App auto-selects** "Chroma Console" (from saved profile!)
3. **Blue badge appears**: "🔽 Remembered: Chroma Console"
4. **Click Connect** - no need to select again!

### Testing Mismatch Detection

1. **Connect with WIDI Jack** (recognized as Chroma Console)
2. **Open the app** → Shows Chroma Console editor
3. **Switch to Microcosm** in the pedal switcher
4. **Warning appears**: 
   ```
   ⚠️ You've previously configured "WIDI Jack" as a Chroma Console,
   but you're using the Microcosm editor.
   ```
5. **Success!** The protection works even with generic MIDI interfaces!

## Multiple Scenarios

### Scenario A: One WIDI Jack, Multiple Pedals

If you swap the WIDI Jack between pedals:

**Option 1: Don't Save Profile**
- Uncheck "Remember this device"
- Manually select pedal each time
- Most flexible

**Option 2: Update Profile When Swapping**
- Connect to new pedal
- Mismatch warning appears
- Update selection and save new profile

### Scenario B: Multiple WIDI Jacks

If you have multiple WIDI devices:
- Name them differently if possible (Bluetooth settings)
- Save separate profile for each
- "WIDI Jack #1" → Chroma Console
- "WIDI Jack #2" → Microcosm

### Scenario C: USB Direct Connection

When connecting pedals via USB:
- Device name likely shows pedal name
- Auto-detection works via name matching
- No profile needed (but doesn't hurt!)

## Technical Summary

### What We Built

**Files Created:**
- `src/lib/midi/deviceProfiles.ts` - Profile API
- `docs/features/device-profiles.md` - Complete guide

**Files Modified:**
- `src/components/DeviceSelector.tsx` - Added checkbox & profile loading
- `src/components/nav/ConnectionStatus.tsx` - Added dev tools for connected devices
- `src/lib/midi/deviceMismatchDetection.ts` - Check profiles first

**Storage Format:**
```typescript
// localStorage key: 'librarian_device_profiles'
[
  {
    interfaceName: "WIDI Jack",
    pedalType: "ChromaConsole",
    createdAt: "2026-02-14T..."
  }
]
```

### Priority Order for Detection

1. **Saved Profile** (Highest) - User explicitly configured
2. **Name-Based** (Medium) - Device name contains pedal name
3. **SysEx Identity** (Low for interfaces) - WIDI responds with its own ID
4. **Generic/Unknown** (Lowest) - Can't determine

## Next Steps

### Option 1: Use Device Profiles (Recommended)

This is the practical solution for your setup:
1. Save profile: WIDI Jack → Chroma Console
2. Get mismatch warnings when switching editors
3. Works reliably every time!

### Option 2: Try Connected Query

After connecting to WIDI Jack:
1. Open side nav → MIDI Connection section
2. Expand "Query Connected Pedal Identity"
3. Click "Request Identity"
4. See if the Chroma Console responds differently when actively connected

Some interfaces might pass through SysEx only after connection is established.

### Option 3: Direct USB Connection (If Available)

If your pedal has USB MIDI:
1. Connect directly via USB
2. SysEx identity should work perfectly
3. Discover the real manufacturer ID
4. Add to `KNOWN_DEVICES` for future

## Benefits You Now Have

✅ **Manual mapping** that persists across sessions  
✅ **Mismatch warnings** even with generic interfaces  
✅ **Auto-selection** of correct pedal when connecting  
✅ **Flexible** - can update or clear profiles anytime  
✅ **Works today** - no waiting for pedal manufacturers to respond

## Viewing Your Saved Profiles

Open browser console:
```javascript
// View all profiles
JSON.parse(localStorage.getItem('librarian_device_profiles'))

// Clear all profiles (if needed)
localStorage.removeItem('librarian_device_profiles')
```

## What About the CME ID?

The WIDI Jack manufacturer ID we discovered:
```javascript
{
  manufacturer_id: [0x00, 0x02, 0x4d],  // CME Pro Audio
  device_family: 0x22c8,
  device_model: 0x21c3,
}
```

This is useful for:
- Recognizing WIDI Jack devices automatically
- Could add to "generic interfaces" list
- Helpful for other users with WIDI products

We could add this to the code to automatically recognize CME devices as "generic interfaces" that need manual configuration.

## Summary

**Problem:** WIDI Jack responds with its own identity, not the pedal's  
**Solution:** Device Profiles - manually save and remember the mapping  
**Result:** You get all the safety features without needing SysEx to work!

The SysEx feature is still valuable for:
- Direct USB connections
- Future pedals that might respond differently
- Interfaces that do pass through SysEx

But for your current setup with WIDI Jack + Chroma Console, Device Profiles is the perfect solution! 🎉
