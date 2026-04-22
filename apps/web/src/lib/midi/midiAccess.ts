// Singleton wrapper around navigator.requestMIDIAccess()
// Lazy-initialises once, caches the MIDIAccess object, and notifies listeners on device changes.

let accessPromise: Promise<MIDIAccess> | null = null;
const changeListeners = new Set<() => void>();

async function getAccess(): Promise<MIDIAccess> {
  if (!accessPromise) {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      return Promise.reject(new Error(
        'Web MIDI API is not available in this browser. Use Chrome, Edge, or Opera.'
      ));
    }

    // Request with sysex: true so Chrome shows its explicit MIDI permission
    // prompt and we can use SysEx for device identity later.
    accessPromise = navigator.requestMIDIAccess({ sysex: true })
      .then((access) => {
        access.onstatechange = () => changeListeners.forEach((fn) => fn());
        return access;
      })
      .catch((err) => {
        accessPromise = null;

        if (err instanceof DOMException && err.name === 'SecurityError') {
          throw new Error(
            'MIDI permission was denied. Click the lock icon in your address bar → Site settings → allow MIDI, then try again.'
          );
        }
        throw err;
      });
  }
  return accessPromise;
}

function deviceLabel(port: MIDIPort): string {
  return port.name ?? port.id;
}

export const midiAccess = {
  async listOutputNames(): Promise<string[]> {
    const access = await getAccess();
    const names = Array.from(access.outputs.values()).map(deviceLabel);
    return names;
  },

  async listInputNames(): Promise<string[]> {
    const access = await getAccess();
    return Array.from(access.inputs.values()).map(deviceLabel);
  },

  async getOutput(deviceName: string): Promise<MIDIOutput | undefined> {
    const access = await getAccess();
    for (const output of access.outputs.values()) {
      if (deviceLabel(output) === deviceName) return output;
    }
    return undefined;
  },

  async getInput(deviceName: string): Promise<MIDIInput | undefined> {
    const access = await getAccess();
    for (const input of access.inputs.values()) {
      if (deviceLabel(input) === deviceName) return input;
    }
    return undefined;
  },

  /** Register a listener for MIDI device connect/disconnect events. Returns an unsubscribe function. */
  onDeviceChange(listener: () => void): () => void {
    changeListeners.add(listener);
    return () => changeListeners.delete(listener);
  },
};
