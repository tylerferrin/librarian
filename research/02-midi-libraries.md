# MIDI Library Analysis

*Research for Pedal Editor & Preset Manager - MIDI Communication Strategy*

---

## Executive Summary

For **Tauri + Rust backend**: Use **midir** crate (cross-platform, excellent timing)  
For **Electron + Node.js backend**: Use **@julusian/midi** (actively maintained, prebuilt binaries)

---

## Option 1: Rust MIDI (for Tauri)

### midir (Recommended)

**Repository**: https://github.com/Boddlnagg/midir  
**Maintenance**: Active (widely used in Rust audio community)  
**Platforms**: macOS (CoreMIDI), Windows (WinMM/WinRT), Linux (ALSA)

#### Features

- Cross-platform MIDI I/O
- Low-latency (close to C/C++ performance)
- Send and receive MIDI messages
- Virtual ports supported
- Thread-safe

#### API Example

```rust
use midir::{MidiOutput, MidiOutputConnection};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let midi_out = MidiOutput::new("Pedal Editor")?;
    
    // List available MIDI ports
    let ports = midi_out.ports();
    for (i, port) in ports.iter().enumerate() {
        println!("{}: {}", i, midi_out.port_name(port)?);
    }
    
    // Connect to a port
    let port = &ports[0];
    let mut conn = midi_out.connect(port, "pedal-output")?;
    
    // Send MIDI CC: Channel 0, CC 22, Value 127
    let status = 0xB0; // CC on channel 0
    conn.send(&[status, 22, 127])?;
    
    // Send Program Change: Channel 0, Program 5
    conn.send(&[0xC0, 5])?;
    
    // Send SysEx
    conn.send(&[0xF0, 0x7E, 0x01, 0x06, 0x01, 0xF7])?;
    
    Ok(())
}
```

#### Tauri Integration

```rust
// tauri/src/midi.rs
use midir::{MidiOutput, MidiOutputConnection};
use std::sync::Mutex;
use tauri::State;

pub struct MidiState {
    connection: Mutex<Option<MidiOutputConnection>>,
}

#[tauri::command]
pub fn connect_midi_port(
    port_index: usize,
    state: State<MidiState>,
) -> Result<String, String> {
    let midi_out = MidiOutput::new("Pedal Editor")
        .map_err(|e| e.to_string())?;
    
    let ports = midi_out.ports();
    let port = ports.get(port_index)
        .ok_or("Invalid port index")?;
    
    let port_name = midi_out.port_name(port)
        .map_err(|e| e.to_string())?;
    
    let connection = midi_out.connect(port, "pedal-output")
        .map_err(|e| e.to_string())?;
    
    *state.connection.lock().unwrap() = Some(connection);
    
    Ok(port_name)
}

#[tauri::command]
pub fn send_cc(
    channel: u8,
    controller: u8,
    value: u8,
    state: State<MidiState>,
) -> Result<(), String> {
    let mut conn_lock = state.connection.lock().unwrap();
    let conn = conn_lock.as_mut()
        .ok_or("MIDI not connected")?;
    
    let status = 0xB0 | (channel & 0x0F);
    conn.send(&[status, controller & 0x7F, value & 0x7F])
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn send_program_change(
    channel: u8,
    program: u8,
    state: State<MidiState>,
) -> Result<(), String> {
    let mut conn_lock = state.connection.lock().unwrap();
    let conn = conn_lock.as_mut()
        .ok_or("MIDI not connected")?;
    
    let status = 0xC0 | (channel & 0x0F);
    conn.send(&[status, program & 0x7F])
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_midi_ports() -> Result<Vec<String>, String> {
    let midi_out = MidiOutput::new("Pedal Editor")
        .map_err(|e| e.to_string())?;
    
    let ports = midi_out.ports();
    ports.iter()
        .map(|p| midi_out.port_name(p).map_err(|e| e.to_string()))
        .collect()
}
```

```rust
// tauri/src/main.rs
mod midi;

fn main() {
    tauri::Builder::default()
        .manage(midi::MidiState {
            connection: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            midi::list_midi_ports,
            midi::connect_midi_port,
            midi::send_cc,
            midi::send_program_change,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### TypeScript Frontend (React)

```typescript
// src/lib/midi.ts
import { invoke } from '@tauri-apps/api/tauri';

export interface MidiPort {
  index: number;
  name: string;
}

export class MidiService {
  async listPorts(): Promise<string[]> {
    return await invoke<string[]>('list_midi_ports');
  }
  
  async connect(portIndex: number): Promise<string> {
    return await invoke<string>('connect_midi_port', { portIndex });
  }
  
  async sendCC(channel: number, controller: number, value: number): Promise<void> {
    await invoke('send_cc', { channel, controller, value });
  }
  
  async sendProgramChange(channel: number, program: number): Promise<void> {
    await invoke('send_program_change', { channel, program });
  }
}

export const midi = new MidiService();
```

```tsx
// src/components/MidiConnection.tsx
import { useState, useEffect } from 'react';
import { midi } from '../lib/midi';

export function MidiConnection() {
  const [ports, setPorts] = useState<string[]>([]);
  const [connected, setConnected] = useState<string | null>(null);
  
  useEffect(() => {
    midi.listPorts().then(setPorts);
  }, []);
  
  const connect = async (index: number) => {
    const portName = await midi.connect(index);
    setConnected(portName);
  };
  
  return (
    <div>
      <h2>MIDI Ports</h2>
      {ports.map((port, i) => (
        <button key={i} onClick={() => connect(i)}>
          {port}
        </button>
      ))}
      {connected && <p>Connected to: {connected}</p>}
    </div>
  );
}
```

#### Pros

- ✅ Excellent performance and timing
- ✅ Cross-platform (macOS, Windows, Linux)
- ✅ No native module rebuild issues
- ✅ Type-safe Rust
- ✅ Active maintenance

#### Cons

- ⚠️ Requires Rust knowledge
- ⚠️ More verbose than high-level libraries

---

## Option 2: Node.js MIDI (for Electron)

### @julusian/midi (Recommended for Electron)

**Repository**: https://github.com/julusian/node-midi  
**NPM**: `@julusian/midi`  
**Maintenance**: Active (modern fork of node-midi)  
**Weekly Downloads**: ~1.7K

#### Features

- RtMidi wrapper (CoreMIDI on macOS)
- Prebuilt binaries for macOS (x64 & ARM64)
- CC, Program Change, SysEx support
- Virtual ports
- Stream API

#### Installation

```bash
npm install @julusian/midi
```

For Electron:
```json
{
  "scripts": {
    "postinstall": "electron-builder install-app-deps"
  }
}
```

#### API Example

```typescript
// main.ts (Electron main process)
import midi from '@julusian/midi';

const output = new midi.Output();

// List ports
console.log('MIDI Ports:');
for (let i = 0; i < output.getPortCount(); i++) {
  console.log(`${i}: ${output.getPortName(i)}`);
}

// Open port
output.openPort(0);

// Send CC: Channel 0, CC 22, Value 127
output.sendMessage([0xB0, 22, 127]);

// Send Program Change: Channel 0, Program 5
output.sendMessage([0xC0, 5]);

// Send SysEx
output.sendMessage([0xF0, 0x7E, 0x01, 0x06, 0x01, 0xF7]);

// Close
output.closePort();
```

#### Electron IPC Integration

```typescript
// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import midi from '@julusian/midi';

let output: midi.Output | null = null;

ipcMain.handle('midi:list-ports', () => {
  const temp = new midi.Output();
  const ports: string[] = [];
  for (let i = 0; i < temp.getPortCount(); i++) {
    ports.push(temp.getPortName(i));
  }
  temp.closePort();
  return ports;
});

ipcMain.handle('midi:connect', (event, portIndex: number) => {
  if (output) {
    output.closePort();
  }
  output = new midi.Output();
  output.openPort(portIndex);
  return output.getPortName(portIndex);
});

ipcMain.handle('midi:send-cc', (event, channel: number, cc: number, value: number) => {
  if (!output) throw new Error('MIDI not connected');
  const status = 0xB0 | (channel & 0x0F);
  output.sendMessage([status, cc & 0x7F, value & 0x7F]);
});

ipcMain.handle('midi:send-program-change', (event, channel: number, program: number) => {
  if (!output) throw new Error('MIDI not connected');
  const status = 0xC0 | (channel & 0x0F);
  output.sendMessage([status, program & 0x7F]);
});
```

```typescript
// src/lib/midi.ts (Renderer process)
const { ipcRenderer } = window.require('electron');

export class MidiService {
  async listPorts(): Promise<string[]> {
    return await ipcRenderer.invoke('midi:list-ports');
  }
  
  async connect(portIndex: number): Promise<string> {
    return await ipcRenderer.invoke('midi:connect', portIndex);
  }
  
  async sendCC(channel: number, controller: number, value: number): Promise<void> {
    await ipcRenderer.invoke('midi:send-cc', channel, controller, value);
  }
  
  async sendProgramChange(channel: number, program: number): Promise<void> {
    await ipcRenderer.invoke('midi:send-program-change', channel, program);
  }
}

export const midi = new MidiService();
```

#### Pros

- ✅ Actively maintained
- ✅ Prebuilt binaries (no compilation on macOS)
- ✅ Compatible with Electron
- ✅ TypeScript definitions included
- ✅ Stream API for advanced use

#### Cons

- ⚠️ Requires electron-rebuild
- ⚠️ Native module version compatibility
- ⚠️ Low-level API (raw byte arrays)

---

### easymidi (Alternative for Electron)

**Repository**: https://github.com/dinchak/node-easymidi  
**NPM**: `easymidi`  
**Weekly Downloads**: ~1.5K

#### Features

- Higher-level API than @julusian/midi
- Event-based interface
- Named message types (`cc`, `program`, `sysex`)
- Depends on node-midi (older, less maintained)

#### API Example

```typescript
import easymidi from 'easymidi';

const output = new easymidi.Output('IAC Driver Bus 1');

// Send CC (named interface)
output.send('cc', {
  controller: 22,
  value: 127,
  channel: 0
});

// Send Program Change
output.send('program', {
  number: 5,
  channel: 0
});

// Send SysEx
output.send('sysex', [0xF0, 0x7E, 0x01, 0x06, 0x01, 0xF7]);

// List devices
console.log(easymidi.getInputs());
console.log(easymidi.getOutputs());
```

#### Pros

- ✅ Easier API (named messages)
- ✅ Event-driven
- ✅ TypeScript types included

#### Cons

- ⚠️ Depends on unmaintained node-midi
- ⚠️ Requires electron-rebuild
- ⚠️ Potential build issues

**Verdict**: Consider if you prefer the higher-level API, but be aware of the unmaintained dependency.

---

### JZZ (Universal MIDI)

**Repository**: https://github.com/jazz-soft/JZZ  
**NPM**: `jzz`  
**Weekly Downloads**: ~7.5K

#### Features

- Works in Node.js and browser (Web MIDI API semantics)
- MIDI 2.0 and MPE support
- Rich API with helpers
- Async/await and chaining

#### API Example

```typescript
import JZZ from 'jzz';

JZZ().or('Cannot start MIDI')
  .openMidiOut()
  .or('Cannot open MIDI Out port')
  .then((port) => {
    // Send CC
    port.send([0xB0, 22, 127]);
    
    // Send Program Change
    port.send([0xC0, 5]);
    
    // Using helpers
    port.noteOn(0, 'C5', 127);
    port.noteOff(0, 'C5');
  });
```

#### Pros

- ✅ Rich ecosystem
- ✅ MIDI 2.0 support
- ✅ Cross-platform abstraction
- ✅ Active maintenance

#### Cons

- ⚠️ Extra abstraction layer
- ⚠️ Heavier than other options
- ⚠️ Native addon (jazz-midi) has had Electron issues

**Verdict**: Good for complex MIDI applications, but overkill for basic CC/Program Change.

---

## MIDI Message Reference

### Control Change (CC)

```
Status Byte: 0xB0 - 0xBF (0xB0 | channel)
Data Byte 1: Controller number (0-127)
Data Byte 2: Value (0-127)
```

Example (Channel 0, CC 22, Value 64):
```rust
[0xB0, 22, 64]
```

### Program Change

```
Status Byte: 0xC0 - 0xCF (0xC0 | channel)
Data Byte: Program number (0-127)
```

Example (Channel 0, Program 5):
```rust
[0xC0, 5]
```

### System Exclusive (SysEx)

```
Start: 0xF0
...data bytes...
End: 0xF7
```

Example:
```rust
[0xF0, 0x7E, 0x01, 0x06, 0x01, 0xF7]
```

---

## Performance Comparison

| Library | Platform | Latency | Memory | Build Complexity |
|---------|----------|---------|--------|------------------|
| **midir** (Rust) | All | ~1-5ms | Low | Low (Cargo) |
| **@julusian/midi** | All | ~10-50ms | Medium | Medium (electron-rebuild) |
| **easymidi** | All | ~10-50ms | Medium | Medium (electron-rebuild) |
| **JZZ** | All | ~10-50ms | Medium | Medium (electron-rebuild) |

**Note**: Node.js latency includes event loop overhead. Rust/native is more predictable.

---

## Recommendation Summary

### For Tauri: Use midir

```toml
# Cargo.toml
[dependencies]
midir = "0.9"
```

**Why**: 
- Direct native integration
- Excellent performance
- No version compatibility issues
- Natural fit with Tauri's Rust backend

### For Electron: Use @julusian/midi

```bash
npm install @julusian/midi
```

**Why**:
- Actively maintained
- Prebuilt binaries
- Straightforward API
- Proven in production

### Both Options Are Production-Ready

- **Tauri + midir**: Better performance, cleaner architecture
- **Electron + @julusian/midi**: Faster initial development, familiar stack

Either choice will work well for a MIDI pedal editor. **Choose based on your framework decision (Tauri vs Electron), not MIDI library preference.**

---

## Testing Strategy

### Manual Testing Checklist

- [ ] List MIDI ports correctly
- [ ] Connect to hardware pedal
- [ ] Send CC messages (verify on pedal)
- [ ] Send Program Change messages
- [ ] Send rapid CC updates (knob tweaking)
- [ ] Reconnect after pedal power cycle
- [ ] Multiple MIDI ports simultaneously

### Automated Testing

```typescript
// Example test (adjust for your stack)
describe('MIDI Service', () => {
  it('should list available ports', async () => {
    const ports = await midi.listPorts();
    expect(Array.isArray(ports)).toBe(true);
  });
  
  it('should send CC messages', async () => {
    // Use virtual MIDI port for testing
    await midi.connect(0);
    await expect(midi.sendCC(0, 22, 127)).resolves.not.toThrow();
  });
});
```

---

## Next Steps

1. Choose framework (Tauri or Electron)
2. Implement basic MIDI connection UI
3. Test with actual pedal hardware
4. Build parameter mapping system
5. Add preset send/receive functionality

**Start simple**: Connect, send CC, verify on hardware. Everything else builds on this foundation.
