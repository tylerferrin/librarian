# Bluetooth MIDI Setup Guide (macOS)

This guide covers connecting MIDI pedals to your Mac using Bluetooth MIDI adapters.

## Overview

Bluetooth MIDI allows wireless communication between your Mac and MIDI-enabled pedals. This is particularly useful for pedals like the Hologram Microcosm when used with a Bluetooth MIDI adapter.

### Benefits

- ✅ **Wireless:** No USB cables required
- ✅ **Flexibility:** Position pedals anywhere within Bluetooth range (~30 feet)
- ✅ **Multiple Devices:** Connect multiple pedals simultaneously
- ✅ **Works with iPad:** Same adapters work with iPad/iPhone

### Tradeoffs

- ⚠️ **Latency:** 10-30ms typical (acceptable for parameter control, not real-time audio)
- ⚠️ **Battery:** Adapters need charging/batteries
- ⚠️ **Interference:** Can be affected by Wi-Fi/Bluetooth congestion

---

## Recommended Bluetooth MIDI Adapters

### CME WIDI Jack (Recommended)

- **Connection:** USB-A MIDI host to Bluetooth
- **Latency:** ~10ms
- **Battery:** Built-in rechargeable, 8-12 hours
- **Range:** 30+ feet
- **Price:** ~$60-80
- **Buy:** [CME Website](https://www.cme-pro.com/widi-jack/)

**Why we recommend it:** Low latency, reliable connection, no external power needed.

### Yamaha MD-BT01

- **Connection:** 5-pin DIN MIDI to Bluetooth
- **Latency:** ~15ms
- **Power:** 2x AAA batteries
- **Range:** 30 feet
- **Price:** ~$60

**Good for:** Pedals with 5-pin MIDI ports

### Quicco Sound mi.1

- **Connection:** 5-pin DIN MIDI to Bluetooth
- **Latency:** ~20ms
- **Battery:** Built-in rechargeable
- **Range:** 30 feet
- **Price:** ~$50

---

## Setup Instructions

### Step 1: Connect Adapter to Pedal

**For Hologram Microcosm (using WIDI Jack):**

1. Power off the Microcosm
2. Plug WIDI Jack into the USB MIDI host port on the Microcosm
3. Power on the Microcosm
4. WIDI Jack LED should start blinking (discovery mode)

**For other pedals:**
- Use appropriate adapter for your pedal's MIDI port type (USB, 5-pin DIN, etc.)

### Step 2: Pair with macOS

1. **Open Bluetooth Settings:**
   - Click Apple menu  > System Settings
   - Navigate to **Bluetooth**
   - Ensure Bluetooth is turned on

2. **Put Adapter in Pairing Mode:**
   - WIDI Jack: Automatically in pairing mode when first powered on
   - Other adapters: Check manual for pairing button/procedure

3. **Pair the Device:**
   - Wait for adapter to appear in "Nearby Devices" (e.g., "WIDI Jack")
   - Click **Connect**
   - Wait for status to change to "Connected"

4. **Verify Pairing:**
   - Adapter LED should turn solid or slow blink (connected state)
   - Device should show "Connected" in Bluetooth settings

### Step 3: Configure MIDI Connection

1. **Open Audio MIDI Setup:**
   - Open `/Applications/Utilities/Audio MIDI Setup.app`
   - Go to **Window > Show MIDI Studio** (⌘2)

2. **Verify Bluetooth MIDI Device:**
   - You should see a new MIDI device (e.g., "WIDI Jack", "BLE-MIDI", or adapter name)
   - Click it to see connection status
   - If grayed out, try disconnecting and reconnecting Bluetooth

3. **Test Connection:**
   - In Audio MIDI Setup, select the Bluetooth MIDI device
   - Activity lights should flash when you change parameters on the pedal
   - Use MIDI Monitor app to verify CC messages are being received

### Step 4: Test with Librarian

Run the MIDI detection test:

```bash
cd tauri
cargo run --bin test-midi-detection
```

**Expected Output:**

```
🔍 Hologram Microcosm:
  ✓ Found: WIDI Jack (Input)
  ✓ Found: WIDI Jack (Output)
```

**Note:** The device may appear as the adapter name (e.g., "WIDI Jack") rather than "Microcosm".

---

## Troubleshooting

### Adapter Not Appearing in Bluetooth

**Symptoms:**
- Adapter doesn't show up in macOS Bluetooth settings
- LED on adapter not blinking

**Solutions:**

1. **Check Power:**
   - Ensure pedal is powered on
   - Check adapter battery (if battery-powered)
   - Try charging adapter if rechargeable

2. **Reset Adapter:**
   - Power off pedal
   - Unplug adapter, wait 10 seconds
   - Plug back in and power on
   - Check if it enters pairing mode

3. **Clear Bluetooth Cache (macOS):**
   ```bash
   sudo rm -rf /Library/Preferences/com.apple.Bluetooth.plist
   sudo killall -HUP bluetoothd
   ```
   Then restart Mac and try pairing again.

### Connected But No MIDI Data

**Symptoms:**
- Bluetooth shows "Connected"
- Device appears in Audio MIDI Setup
- No MIDI messages detected in MIDI Monitor

**Solutions:**

1. **Check MIDI Routing:**
   - Open Audio MIDI Setup > MIDI Studio
   - Verify device is not grayed out
   - Try disconnecting and reconnecting

2. **Pedal MIDI Channel:**
   - Ensure pedal is set to send on MIDI Channel 1 (or match your app settings)
   - Check pedal manual for MIDI configuration

3. **Adapter Configuration:**
   - Some adapters have companion apps for configuration
   - Check if adapter needs firmware update
   - Verify adapter is in "MIDI mode" not "audio mode"

### High Latency or Dropped Messages

**Symptoms:**
- Parameter changes lag behind knob movements
- Some MIDI messages don't arrive
- Intermittent connection

**Solutions:**

1. **Reduce Distance:**
   - Move Mac closer to pedal/adapter
   - Avoid obstacles between Mac and adapter
   - Keep within 10-15 feet for best performance

2. **Reduce Interference:**
   - Turn off nearby Wi-Fi routers (2.4GHz band)
   - Move away from microwaves, wireless phones
   - Disconnect other Bluetooth devices

3. **Update Adapter Firmware:**
   - Check manufacturer website for firmware updates
   - Some adapters have configuration apps (e.g., WIDI App)

4. **Throttle MIDI Messages:**
   - In your app, add throttling (50-100ms) between CC messages
   - Avoid sending rapid parameter changes

### Device Disconnects Randomly

**Symptoms:**
- Connection drops after a few minutes
- Have to re-pair frequently

**Solutions:**

1. **Battery Issues:**
   - Charge adapter if rechargeable
   - Replace batteries if battery-powered
   - Low battery can cause unstable connections

2. **macOS Power Saving:**
   - Go to System Settings > Battery
   - Disable "Put hard disks to sleep when possible"
   - Disable Bluetooth power management

3. **Adapter Sleep Mode:**
   - Some adapters sleep after inactivity
   - Send periodic MIDI messages to keep alive
   - Check adapter settings/firmware for sleep timeout

---

## MIDI Monitor App (for Testing)

**Recommended:** [MIDI Monitor by Snoize](https://www.snoize.com/MIDIMonitor/)

### Installing MIDI Monitor

1. Download from https://www.snoize.com/MIDIMonitor/
2. Open DMG and drag to Applications
3. Launch MIDI Monitor

### Testing Bluetooth MIDI

1. **Select Input:**
   - In MIDI Monitor, go to Sources menu
   - Check your Bluetooth MIDI device (e.g., "WIDI Jack")

2. **Test Parameter Changes:**
   - Change a knob on your pedal
   - You should see CC messages appear:
     ```
     Channel 1  Control 6  Activity  Value 80
     Channel 1  Control 11 Repeats   Value 64
     ```

3. **Check Latency:**
   - Move a knob quickly
   - Note timestamp of messages
   - Typical Bluetooth MIDI latency: 10-30ms

---

## Advanced: Multiple Pedals

You can connect multiple pedals simultaneously using multiple Bluetooth MIDI adapters:

### Setup

1. Pair each adapter individually with macOS
2. Each adapter will appear as a separate MIDI device
3. Librarian will detect all connected devices

### Best Practices

- **Unique Names:** Use companion apps to rename adapters (e.g., "Microcosm BT", "Gen Loss BT")
- **MIDI Channels:** Assign different MIDI channels to each pedal to avoid conflicts
- **Bandwidth:** Limit to 2-3 simultaneous Bluetooth MIDI connections for best performance

---

## Bluetooth MIDI on iPad

The same adapters work with iPad/iPhone:

1. Pair adapter in iOS/iPadOS Bluetooth settings
2. Adapter appears automatically in MIDI-enabled apps
3. Use Librarian (when iPad version is released)

**Note:** iPad typically has better Bluetooth range and stability than Mac due to newer Bluetooth chips.

---

## Technical Details

### Bluetooth LE MIDI Specification

- **Protocol:** MIDI over Bluetooth Low Energy (BLE-MIDI)
- **Standard:** Apple BLE-MIDI specification
- **MTU:** Typically 20-23 bytes per packet
- **Latency:** 10-30ms typical, up to 50ms worst case
- **Jitter:** ±5ms
- **Throughput:** ~31.25 kbps (same as traditional MIDI)

### CoreMIDI Integration

macOS CoreMIDI treats Bluetooth MIDI devices as standard MIDI ports:
- No special code needed in Librarian
- Same `midir` library works for both USB and Bluetooth
- Transparent to application layer

### Latency Breakdown

| Component           | Latency   |
|---------------------|-----------|
| Pedal processing    | 1-2ms     |
| Adapter encoding    | 2-5ms     |
| Bluetooth LE        | 7.5-15ms  |
| macOS CoreMIDI      | < 1ms     |
| **Total**           | **10-23ms** |

**Conclusion:** Acceptable for parameter control, not suitable for note-on/note-off timing.

---

## Product Comparison

| Adapter      | Latency | Battery    | Range | Price | Best For |
|--------------|---------|------------|-------|-------|----------|
| WIDI Jack    | ~10ms   | 8-12 hrs   | 30 ft | $70   | USB MIDI pedals |
| Yamaha MD-BT01 | ~15ms | 2x AAA     | 30 ft | $60   | 5-pin DIN pedals |
| Quicco mi.1  | ~20ms   | Rechargeable | 30 ft | $50   | Budget option |

---

## References

- **BLE-MIDI Specification:** https://www.midi.org/specifications/midi-transports-specifications/bluetooth-le-midi
- **Apple CoreMIDI:** https://developer.apple.com/documentation/coremidi
- **CME WIDI:** https://www.cme-pro.com/widi-series/
- **MIDI Monitor:** https://www.snoize.com/MIDIMonitor/

---

*For USB MIDI setup (Gen Loss MKII), see [`macos-setup.md`](./macos-setup.md)*
