// Device Mismatch Detection — pure TS, no MIDI API dependencies

import { pedalRegistry } from './pedalRegistry';
import type { PedalType } from './types';
import { getPedalTypeForDevice } from './deviceProfiles';

export interface DeviceMismatch {
  isMismatch: boolean;
  connectedDeviceName: string;
  selectedPedalType: PedalType;
  detectedPedalType: PedalType | null;
  confidence: 'high' | 'medium' | 'low';
  message: string;
}

export function detectDeviceMismatch(
  connectedDeviceName: string,
  selectedPedalType: PedalType
): DeviceMismatch {
  const deviceNameLower = connectedDeviceName.toLowerCase();
  const selectedPedal = pedalRegistry.get(selectedPedalType);

  if (!selectedPedal) {
    return {
      isMismatch: false,
      connectedDeviceName,
      selectedPedalType,
      detectedPedalType: null,
      confidence: 'low',
      message: 'Unknown pedal type selected',
    };
  }

  const savedPedalType = getPedalTypeForDevice(connectedDeviceName);
  if (savedPedalType && savedPedalType !== selectedPedalType) {
    const savedPedal = pedalRegistry.get(savedPedalType);
    if (savedPedal) {
      return {
        isMismatch: true,
        connectedDeviceName,
        selectedPedalType,
        detectedPedalType: savedPedalType,
        confidence: 'high',
        message: `You've previously configured "${connectedDeviceName}" as a ${savedPedal.name}, but you're using the ${selectedPedal.name} editor. This may send incorrect MIDI messages to your pedal.`,
      };
    }
  }

  const allPedals = pedalRegistry.getAll();
  let detectedPedal = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  for (const pedal of allPedals) {
    const pedalNameLower = pedal.name.toLowerCase();
    const manufacturerLower = pedal.manufacturer.toLowerCase();
    if (deviceNameLower.includes(pedalNameLower)) {
      detectedPedal = pedal;
      confidence = 'high';
      break;
    }
    if (deviceNameLower.includes(manufacturerLower)) {
      detectedPedal = pedal;
      confidence = 'medium';
    }
  }

  const genericInterfaces = [
    'widi', 'jack', 'usb', 'bluetooth', 'bt', 'midi', 'interface',
    'yamaha', 'roland', 'korg', 'iconnectivity', 'cme',
    'iac', 'driver', 'bus',
  ];
  const isGenericInterface = genericInterfaces.some((kw) => deviceNameLower.includes(kw));

  if (deviceNameLower.includes('microcosm')) {
    const m = allPedals.find((p) => p.type === 'Microcosm');
    if (m) { detectedPedal = m; confidence = 'high'; }
  }
  if (deviceNameLower.includes('chroma') || (deviceNameLower.includes('console') && deviceNameLower.includes('chase'))) {
    const c = allPedals.find((p) => p.type === 'ChromaConsole');
    if (c) { detectedPedal = c; confidence = 'high'; }
  }
  if (deviceNameLower.includes('gen loss') || deviceNameLower.includes('generation loss') || deviceNameLower.includes('genloss')) {
    const g = allPedals.find((p) => p.type === 'GenLossMkii');
    if (g) { detectedPedal = g; confidence = 'high'; }
  }

  if (isGenericInterface && !detectedPedal) {
    confidence = 'low';
  }

  const isMismatch = !!(detectedPedal && detectedPedal.type !== selectedPedalType);

  let message = '';
  if (isMismatch && detectedPedal) {
    if (confidence === 'high') {
      message = `Your MIDI device "${connectedDeviceName}" appears to be a ${detectedPedal.name}, but you're using the ${selectedPedal.name} editor.`;
    } else if (confidence === 'medium') {
      message = `Your MIDI device "${connectedDeviceName}" may be a ${detectedPedal.name}, but you're using the ${selectedPedal.name} editor.`;
    }
  }

  return {
    isMismatch,
    connectedDeviceName,
    selectedPedalType,
    detectedPedalType: (detectedPedal?.type as PedalType) || null,
    confidence,
    message,
  };
}

export function isLikelyCorrectDevice(
  connectedDeviceName: string,
  selectedPedalType: PedalType
): boolean {
  const result = detectDeviceMismatch(connectedDeviceName, selectedPedalType);
  return !result.isMismatch || result.confidence === 'low';
}
