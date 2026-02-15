# Hologram Pedal Identity Limitation

## Discovery

After testing both the Chroma Console and Microcosm through WIDI Jack with updated firmware (v0233), we discovered that **both pedals report identical MIDI device identities**.

## Test Results

### Chroma Console
```
Manufacturer ID: [0x00, 0x20, 0x63]  // Hologram Electronics
Device Family: 0x048F (1167)
Device Model: 0x0000
Software Version: "0233"
```

### Microcosm
```
Manufacturer ID: [0x00, 0x20, 0x63]  // Hologram Electronics
Device Family: 0x048F (1167)
Device Model: 0x0000
Software Version: "0233"
```

**They are IDENTICAL!**

## What This Means

### ✅ What We CAN Detect

1. **Manufacturer**: Hologram Electronics
2. **It's a pedal**: Not a MIDI interface
3. **Generic Hologram device**: Helps narrow down possibilities

### ❌ What We CANNOT Detect

1. **Which pedal**: Cannot distinguish Microcosm from Chroma Console
2. **Automatic switching**: Can't auto-select correct editor via SysEx alone

## Why This Happens

### Likely Reasons

1. **Shared Firmware Base**
   - Both pedals may use the same core firmware
   - Device Model field not customized per product
   - Common in products from same manufacturer family

2. **Generic Identity Implementation**
   - Hologram may use a single Device Model for all pedals
   - Model field set to 0x0000 (unspecified)
   - Family 0x048F represents "Hologram product line"

3. **Not Required by MIDI Spec**
   - MIDI spec doesn't mandate unique IDs per model
   - Only requires unique manufacturer ID
   - Implementation details left to manufacturer

### Comparison with Other Manufacturers

**Roland/Yamaha/Korg:**
- Typically use unique Device Model numbers per product
- Example: Roland D-50 vs Roland JD-800 have different models

**Boutique Manufacturers:**
- Often use generic identities
- Rely on device names for distinction
- Smaller product lines = less need for unique IDs

## Solutions

### Solution 1: Device Profiles ✅ (Already Implemented)

**How it works:**
1. User manually selects pedal type first time
2. Checks "Remember this device"
3. App saves: "WIDI Jack" → Chroma Console
4. Future connections auto-select correctly

**Pros:**
- Works today
- Reliable
- User has full control

**Cons:**
- Manual first-time setup
- Must update if physically swapping pedals

### Solution 2: Name-Based Detection (When Available)

**Direct USB Connection:**
- Device name likely includes model: "Hologram Microcosm" or "Chroma Console"
- Name-based detection works

**WIDI Jack:**
- Generic name: "Widi Midi Bluetooth"
- Cannot distinguish

**Recommendation:**
- Check device name first
- Fall back to Device Profiles for generic interfaces

### Solution 3: CC Mapping Fingerprinting 🔬

**Theory:**
- Each pedal has unique CC mappings
- Send probe CCs and observe responses
- Match response pattern to known pedal

**Chroma Console Signature:**
```
CC 64-71: Primary controls (TILT, RATE, TIME, MIX, etc.)
CC 16-19: Module selection
CC 91: Bypass
```

**Microcosm Signature:**
```
CC 5-11: Primary controls (Subdivision, Activity, Time, etc.)
CC 12-27: Extended controls
Program Changes: Effect selection
```

**Implementation:**
```typescript
async function detectHologramPedal(deviceName: string): Promise<PedalType | null> {
  // Probe Chroma Console CCs
  await sendCC(deviceName, 1, 64, 64); // TILT
  const chromaResponse = await checkResponse();
  
  // Probe Microcosm CCs
  await sendCC(deviceName, 1, 5, 1);   // Subdivision
  const microcosmResponse = await checkResponse();
  
  if (chromaResponse.changed) return 'ChromaConsole';
  if (microcosmResponse.changed) return 'Microcosm';
  return null;
}
```

**Pros:**
- Automatic detection
- Works through any interface
- No manual configuration

**Cons:**
- Requires sending test messages (might be audible)
- Need to save/restore state
- More complex implementation
- Requires pedal to be powered and responding

### Solution 4: Request Hologram Update Firmware

**Long-term solution:**
- Contact Hologram Electronics
- Request unique Device Model numbers in future firmware
- Chroma Console: Model 0x0001
- Microcosm: Model 0x0002

**Likelihood:**
- Depends on Hologram's development priorities
- May not be high priority for them
- Worth suggesting though!

## Current Implementation

### What We've Done

1. **Detect Manufacturer**: ✅
   ```typescript
   if (identity.manufacturer_id === [0x00, 0x20, 0x63]) {
     console.log('Detected Hologram pedal');
   }
   ```

2. **Warn About Ambiguity**: ✅
   ```typescript
   if (isHologramGenericIdentity(identity)) {
     console.warn('Cannot distinguish between Microcosm and Chroma Console');
     console.warn('Use Device Profiles for accurate detection');
     return null; // Force manual selection
   }
   ```

3. **Device Profiles**: ✅
   - User can manually configure
   - Saves to localStorage
   - Works reliably

### What Users Should Do

**First Time Setup:**
1. Connect via WIDI Jack
2. See both Chroma Console and Microcosm as options
3. Manually select correct one
4. Check "Remember this device"
5. Done!

**Future Connections:**
- App auto-selects based on saved profile
- Mismatch warning if you switch editors
- Update profile if you physically swap pedals

## Testing Direct USB

### Next Steps

We should test if direct USB connections show unique device names:

**Microcosm via USB:**
- Device name: "Hologram Microcosm" (?)
- Device identity: [0x00, 0x20, 0x63], 0x048F, 0x0000

**Chroma Console via USB:**
- Device name: "Chroma Console" (?)
- Device identity: [0x00, 0x20, 0x63], 0x048F, 0x0000

If device names are unique, we can:
1. Check name first (high priority)
2. Fall back to SysEx for manufacturer confirmation
3. Use Device Profiles for generic interfaces

## Comparison Matrix

| Detection Method | Chroma Console | Microcosm | Works via WIDI | Requires User Input |
|-----------------|----------------|-----------|----------------|---------------------|
| **SysEx Identity** | ⚠️ Generic | ⚠️ Generic | ✅ | - |
| **Device Name** | ✅ (USB?) | ✅ (USB?) | ❌ | - |
| **Device Profiles** | ✅ | ✅ | ✅ | ✅ First time |
| **CC Fingerprinting** | ✅ | ✅ | ✅ | - |

## Recommendations

### For This Project

**Short Term:**
1. ✅ Keep Device Profiles as primary method
2. ✅ Show "Hologram pedal detected" message
3. ✅ Prompt user to select which Hologram pedal
4. ⏳ Test direct USB for unique names

**Long Term:**
1. ⏳ Implement CC fingerprinting as verification
2. ⏳ Build database of CC signatures
3. ⏳ Add "Auto-detect via CC probe" option in settings
4. ⏳ Contact Hologram about unique IDs in future firmware

### For Users

**Best Practice:**
1. Use Device Profiles (most reliable)
2. If you frequently swap pedals, uncheck "Remember"
3. If using USB, device name should help
4. Wait for CC fingerprinting feature for auto-detection

## Lessons Learned

### For MIDI Implementation

1. **Don't Assume Unique IDs**: Not all manufacturers implement unique Device Models
2. **Multiple Detection Methods**: Always have fallbacks
3. **User Configuration**: Sometimes manual is more reliable
4. **Document Limitations**: Be transparent about what works and what doesn't

### For This Project

1. **SysEx is powerful but not magic**: Got us 90% there
2. **Device Profiles are essential**: Perfect fallback
3. **Community input matters**: Real testing reveals real limitations
4. **Documentation is key**: Users need to understand trade-offs

## Success Despite Limitation

Even though we can't distinguish Hologram pedals automatically via SysEx:

✅ **We achieved the primary goal**: Device mismatch detection works!
- User configures once via Device Profile
- Mismatch warning if switching editors
- Protection from sending wrong MIDI messages

✅ **We learned manufacturer IDs**: Valuable for community
- Hologram Electronics: [0x00, 0x20, 0x63]
- CME Pro Audio: [0x00, 0x02, 0x4D]

✅ **We proved SysEx forwarding works**: With WIDI v0233+
- Opens door for other pedals
- Chase Bliss pedals likely have unique IDs
- Can expand database over time

✅ **We built robust infrastructure**:
- Multiple detection methods
- Clear user feedback
- Good fallbacks
- Professional implementation

## Future Discoveries

As we test more pedals, we may find:
- Chase Bliss pedals have unique Device Models ✨
- Other manufacturers with better implementations
- Patterns we can use for CC fingerprinting
- Firmware updates from Hologram

This limitation doesn't diminish the success - it just defines the boundaries of what's possible with current hardware/firmware.

---

**Status:** Documented and understood
**Impact:** Low - Device Profiles solve the problem
**Next Steps:** Test more pedals, consider CC fingerprinting
