/**
 * Device Mismatch Detection
 * 
 * Detects when the selected pedal type doesn't match the physically connected MIDI device.
 * This prevents accidentally sending wrong MIDI messages to the wrong pedal.
 */

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

/**
 * Detect if the connected device name matches the selected pedal type
 */
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

  // Check if user has saved a profile for this device (highest priority)
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

  // Try to detect what pedal the device name suggests
  const allPedals = pedalRegistry.getAll();
  let detectedPedal = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Check for exact pedal name match
  for (const pedal of allPedals) {
    const pedalNameLower = pedal.name.toLowerCase();
    const manufacturerLower = pedal.manufacturer.toLowerCase();
    
    // High confidence: device name contains pedal name
    if (deviceNameLower.includes(pedalNameLower)) {
      detectedPedal = pedal;
      confidence = 'high';
      break;
    }
    
    // Medium confidence: device name contains manufacturer
    if (deviceNameLower.includes(manufacturerLower)) {
      detectedPedal = pedal;
      confidence = 'medium';
      // Don't break - keep looking for a higher confidence match
    }
  }

  // Generic MIDI interfaces (Bluetooth adapters, USB interfaces) - don't assume mismatch
  const genericInterfaces = [
    'widi', 'jack', 'usb', 'bluetooth', 'bt', 'midi', 'interface',
    'yamaha', 'roland', 'korg', 'iconnectivity', 'cme',
    'iac', 'driver', 'bus'  // macOS virtual MIDI
  ];
  
  const isGenericInterface = genericInterfaces.some(keyword => 
    deviceNameLower.includes(keyword)
  );

  // Check for specific keywords that might indicate the pedal
  // Microcosm specific patterns
  if (deviceNameLower.includes('microcosm')) {
    const microcosm = allPedals.find(p => p.type === 'Microcosm');
    if (microcosm) {
      detectedPedal = microcosm;
      confidence = 'high';
    }
  }
  
  // Chroma Console specific patterns
  if (deviceNameLower.includes('chroma') || 
      (deviceNameLower.includes('console') && deviceNameLower.includes('chase'))) {
    const chromaConsole = allPedals.find(p => p.type === 'ChromaConsole');
    if (chromaConsole) {
      detectedPedal = chromaConsole;
      confidence = 'high';
    }
  }
  
  // Gen Loss specific patterns
  if (deviceNameLower.includes('gen loss') || 
      deviceNameLower.includes('generation loss') ||
      deviceNameLower.includes('genloss')) {
    const genLoss = allPedals.find(p => p.type === 'GenLossMkii');
    if (genLoss) {
      detectedPedal = genLoss;
      confidence = 'high';
    }
  }
  
  // Chase Bliss specific patterns (could be Gen Loss or Chroma Console)
  if (deviceNameLower.includes('chase bliss') || deviceNameLower.includes('chasebliss')) {
    // If we haven't detected a specific pedal yet, mark as Chase Bliss with medium confidence
    if (!detectedPedal) {
      // Default to the selected one if it's a Chase Bliss pedal
      if (selectedPedal.manufacturer.toLowerCase().includes('chase bliss')) {
        confidence = 'medium';
      }
    }
  }
  
  // If it's a generic interface and we couldn't detect a specific pedal, don't assume mismatch
  // User might have multiple pedals and is using a MIDI router/interface
  if (isGenericInterface && !detectedPedal) {
    // Low confidence - can't determine the actual pedal from interface name
    confidence = 'low';
  }

  // Determine if there's a mismatch
  const isMismatch = detectedPedal && detectedPedal.type !== selectedPedalType;
  
  let message = '';
  if (isMismatch && detectedPedal) {
    if (confidence === 'high') {
      message = `Your MIDI device "${connectedDeviceName}" appears to be a ${detectedPedal.name}, but you're using the ${selectedPedal.name} editor. This may send incorrect MIDI messages to your pedal.`;
    } else if (confidence === 'medium') {
      message = `Your MIDI device "${connectedDeviceName}" may be a ${detectedPedal.name}, but you're using the ${selectedPedal.name} editor. Please verify you're connected to the correct pedal.`;
    }
  }

  return {
    isMismatch: isMismatch || false,
    connectedDeviceName,
    selectedPedalType,
    detectedPedalType: detectedPedal?.type as PedalType || null,
    confidence,
    message,
  };
}

/**
 * Simple check if device name suggests it's connected to the selected pedal type
 */
export function isLikelyCorrectDevice(
  connectedDeviceName: string,
  selectedPedalType: PedalType
): boolean {
  const result = detectDeviceMismatch(connectedDeviceName, selectedPedalType);
  return !result.isMismatch || result.confidence === 'low';
}
