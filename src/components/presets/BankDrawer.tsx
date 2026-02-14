// Bank Drawer - shows 16 user banks for Microcosm with color coding
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getBankState } from '@/lib/presets';
import type { BankSlot, Preset } from '@/lib/presets/types';

interface BankDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  pedalType: string;
  onBankSelected?: (bankNumber: number, preset?: Preset) => void;
}

export function BankDrawer({ isOpen, onClose, deviceName: _deviceName, pedalType, onBankSelected }: BankDrawerProps) {
  const [banks, setBanks] = useState<BankSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBanks();
    }
  }, [isOpen, pedalType]);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const bankState = await getBankState(pedalType);
      setBanks(bankState);
    } catch (error) {
      console.error('Failed to load bank state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBankClick = (slot: BankSlot) => {
    setSelectedBank(slot.bankNumber);
    onBankSelected?.(slot.bankNumber, slot.preset);
  };

  if (!isOpen) return null;

  const drawerContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className="fixed right-0 top-0 h-full w-96 bg-zinc-900 shadow-xl transform transition-transform"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Pedal Banks</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-73px)]">
          {loading ? (
            <div className="text-center py-8 text-zinc-400">
              Loading banks...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group banks by color (4 banks with 4 slots each) */}
              {[1, 2, 3, 4].map((bankGroup) => {
                const bankSlots = banks.filter(
                  (slot) => Math.floor((slot.bankNumber - 45) / 4) === bankGroup - 1
                );
                const color = bankSlots[0]?.color || 'gray';

                return (
                  <div key={bankGroup} className="space-y-2">
                    <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full`}
                        style={{ backgroundColor: color }}
                      />
                      Bank {bankGroup}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {bankSlots.map((slot) => {
                        const slotLetter = String.fromCharCode(65 + (slot.bankNumber - 45) % 4); // A-D
                        const isSelected = selectedBank === slot.bankNumber;
                        const hasPreset = !!slot.preset;

                        return (
                          <button
                            key={slot.bankNumber}
                            onClick={() => handleBankClick(slot)}
                            className={`
                              relative p-3 rounded-lg border transition-all
                              ${isSelected
                                ? 'border-blue-500 bg-blue-500/10'
                                : hasPreset
                                ? 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                              }
                            `}
                          >
                            <div className="text-center">
                              <div className="text-xs font-mono text-zinc-500 mb-1">
                                {slotLetter}
                              </div>
                              {hasPreset ? (
                                <div className="text-xs text-white truncate">
                                  {slot.preset!.name}
                                </div>
                              ) : (
                                <div className="text-xs text-zinc-600">Empty</div>
                              )}
                            </div>
                            {hasPreset && (
                              <div
                                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-400">
            <p className="mb-1">
              <strong className="text-zinc-300">Click a slot</strong> to select it for saving a preset.
            </p>
            <p>
              Slots show presets saved by the app. Manual pedal saves won't appear here.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
