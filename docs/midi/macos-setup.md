# macOS MIDI Setup Guide

This guide covers setting up MIDI communication with the Chase Bliss Generation Loss MKII on macOS.

## Prerequisites

- macOS 10.15 (Catalina) or later
- USB-C or USB-A to USB-B cable (for Gen Loss MKII connection)
- Chase Bliss Generation Loss MKII pedal
- Librarian app installed

---

## Hardware Connection

1. **Connect the Pedal:**
   - Plug USB cable into the Gen Loss MKII's USB port (rear panel)
   - Connect the other end to your Mac's USB port
   - Power on the pedal (9V DC power supply)

2. **Verify USB Connection:**
   - The pedal should be recognized as a USB MIDI device automatically
   - macOS supports USB MIDI class-compliant devices without additional drivers

---

## Testing MIDI Detection

### Using the Test Utility

The Librarian project includes a test utility to verify MIDI detection:

```bash
cd tauri
cargo run --bin test-midi-detection
```

**Expected Output:**

```
╔═══════════════════════════════════════════════════════════╗
║  Librarian - MIDI Device Detection Test                  ║
║  Testing midir integration with macOS CoreMIDI            ║
╚═══════════════════════════════════════════════════════════╝

Press Enter to scan for MIDI devices...

=== MIDI Input Ports ===
  [0] Gen Loss MKII

=== MIDI Output Ports ===
  [0] Gen Loss MKII

✅ MIDI device enumeration successful!

Summary:
  • Input ports found:  1
  • Output ports found: 1

Searching for 'Gen Loss' or 'Generation Loss' devices...
  ✓ Found: Gen Loss MKII (Input)
  ✓ Found: Gen Loss MKII (Output)

macOS Permissions Check:
  ✓ MIDI access appears to be working
    CoreMIDI is accessible without permission dialogs

Test complete!
```

### Device Name Variations

The Gen Loss MKII may appear with different names depending on firmware:
- `Gen Loss MKII`
- `Generation Loss MKII`
- `Chase Bliss Gen Loss MKII`
- `GLMKII`

The Librarian app searches for these variations automatically.

---

## macOS Privacy & Permissions

### CoreMIDI Access

**Good News:** Unlike camera or microphone access, macOS **does not require explicit permission** to access MIDI devices through CoreMIDI.

USB MIDI devices are:
- ✅ Automatically available to applications
- ✅ No permission dialog required
- ✅ No System Settings configuration needed

### System Settings (if needed)

If you experience issues:

1. **Open System Settings:**
   - Click Apple menu  > System Settings
   - Navigate to **Privacy & Security**

2. **Check Accessibility (if prompted):**
   - If Librarian requests Accessibility access (rare), grant it
   - This is only needed for certain low-level MIDI operations

3. **Check USB Accessories:**
   - Some Macs may have USB accessories restrictions
   - Ensure "Allow accessories to connect" is enabled (System Settings > Privacy & Security > Security)

---

## Troubleshooting

### Pedal Not Detected

**Symptoms:**
- Test utility shows "No MIDI devices found"
- Pedal doesn't appear in MIDI device list

**Solutions:**

1. **Check Physical Connection:**
   ```bash
   # Check if USB device is recognized
   system_profiler SPUSBDataType | grep -i "gen loss"
   ```
   If nothing appears, try:
   - Different USB cable
   - Different USB port on your Mac
   - Verify pedal is powered on

2. **Check Audio MIDI Setup:**
   - Open **Audio MIDI Setup** app (in /Applications/Utilities/)
   - Go to **Window > Show MIDI Studio**
   - Look for "Gen Loss MKII" in the device list
   - If present but grayed out, try right-clicking and selecting "Reset"

3. **Reset CoreMIDI:**
   ```bash
   # Kill CoreMIDI server (it will restart automatically)
   sudo killall -9 coreaudiod
   ```
   Then disconnect and reconnect the pedal.

4. **Check Pedal USB Mode:**
   - Some Chase Bliss pedals have USB configuration settings
   - Consult the Gen Loss MKII manual to ensure USB MIDI mode is enabled

### Connection Drops

**Symptoms:**
- Pedal detected initially but disappears
- Intermittent MIDI communication

**Solutions:**

1. **Cable Quality:**
   - Use a high-quality USB cable with good shielding
   - Avoid USB hubs if possible; connect directly to Mac

2. **Power Supply:**
   - Ensure pedal has stable 9V power supply
   - Some USB ports may not provide enough power for USB data + pedal operation

3. **USB Power Management:**
   - macOS may power down "idle" USB devices
   - Try sending periodic MIDI messages to keep connection active

### Permission Errors in Code

**Symptoms:**
- Rust code shows permission errors when accessing MIDI
- App crashes when trying to enumerate devices

**Solutions:**

1. **Check App Sandbox:**
   - If running in sandbox mode (Release builds), ensure entitlements include USB access
   - Check `tauri.conf.json` for entitlement settings

2. **Test in Development Mode:**
   ```bash
   cargo run  # Development mode has fewer restrictions
   ```

3. **Sign the Binary:**
   - Release builds may require code signing with proper entitlements
   - Add `com.apple.security.device.usb` entitlement

---

## Audio MIDI Setup App

macOS includes a built-in utility for managing MIDI devices:

### Opening Audio MIDI Setup

1. Open **Audio MIDI Setup** (/Applications/Utilities/)
2. Go to **Window > Show MIDI Studio** (⌘2)

### Useful Features

- **View All MIDI Devices:** See all connected MIDI hardware
- **Test MIDI I/O:** Click devices to see connection status
- **Reset Devices:** Right-click device > "Reset" if having issues
- **Create Virtual Ports:** For testing without hardware

### Testing MIDI Communication

You can use Audio MIDI Setup to verify the pedal is sending/receiving MIDI:

1. Select the Gen Loss MKII in MIDI Studio
2. Look for the activity indicator (should flash when MIDI is sent)
3. Use a MIDI monitor app like **MIDI Monitor** (free) to see actual CC messages

---

## Recommended MIDI Monitor Tools

For debugging MIDI communication:

1. **MIDI Monitor** (Free)
   - Download: https://www.snoize.com/MIDIMonitor/
   - Shows all MIDI messages in real-time
   - Useful for verifying CC values

2. **Audio MIDI Setup** (Built-in)
   - Built into macOS
   - Basic MIDI device management

3. **MIDI Utility Apps:**
   - Useful for sending test CC messages to the pedal
   - Verify parameter changes on the physical pedal

---

## Advanced: CoreMIDI Details

### How midir Uses CoreMIDI

The Librarian app uses the `midir` Rust library, which interfaces with CoreMIDI on macOS:

- **CoreMIDI:** Apple's system-level MIDI framework
- **Class-Compliant USB MIDI:** No drivers required for Gen Loss MKII
- **Low Latency:** Direct kernel-level MIDI communication

### MIDI Buffer Size

CoreMIDI typically uses:
- **Buffer size:** 256 bytes (sufficient for CC messages)
- **Latency:** < 1ms for USB MIDI
- **No rate limiting needed** for typical parameter changes

### Multiple Clients

Multiple apps can access the Gen Loss MKII simultaneously:
- Librarian can run alongside other MIDI software
- MIDI messages from all apps are merged by CoreMIDI
- Be careful not to send conflicting parameter values

---

## Next Steps

Once MIDI detection is working:

1. **Test Basic Communication:**
   - Run the MIDI detection test (see above)
   - Verify pedal appears in device list

2. **Test CC Messages:**
   - Use MIDI Monitor to watch for incoming messages
   - Try changing knobs on the pedal to see CC output (if bidirectional MIDI is implemented)

3. **Begin Librarian Integration:**
   - Implement Tauri MIDI commands
   - Build React UI for device selection
   - Test parameter control from the app

---

## Support Resources

- **Chase Bliss Audio:** https://www.chaseblissaudio.com/support
- **MIDI Specification:** [Gen Loss MKII MIDI Spec](./gen-loss-mkii-spec.md)
- **macOS CoreMIDI:** https://developer.apple.com/documentation/coremidi
- **midir Documentation:** https://docs.rs/midir/

---

*If you continue to experience issues, check the GitHub Issues page or contact Chase Bliss Audio support.*
