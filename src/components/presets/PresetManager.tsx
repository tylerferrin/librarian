// Preset Manager - unified interface for managing all 16 preset banks
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Play, Trash2, AlertCircle, Library } from 'lucide-react';
import { getBankState, savePreset, savePresetToBank, deletePreset } from '@/lib/presets';
import type { BankSlot, Preset } from '@/lib/presets/types';
import type { MicrocosmState } from '@/lib/midi/pedals/microcosm/types';
import { recallMicrocosmPreset } from '@/lib/midi/pedals/microcosm/api';
import { ConfirmModal } from './ConfirmModal';
import { LibraryDrawer } from './LibraryDrawer';

interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  pedalType: string;
  currentState: MicrocosmState | any;
  activePresetId?: string | null;
  onLoadPreset?: (state: MicrocosmState, presetId?: string, presetName?: string) => Promise<void>;
  onPresetSaved?: (presetId: string, presetName: string) => void;
  onPresetCleared?: () => void;
}

export function PresetManager({
  isOpen,
  onClose,
  deviceName,
  pedalType,
  currentState,
  activePresetId,
  onLoadPreset,
  onPresetSaved,
  onPresetCleared,
}: PresetManagerProps) {
  const [banks, setBanks] = useState<BankSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Save preset dialog state
  const [savingToBank, setSavingToBank] = useState<number | null>(null);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [presetTags, setPresetTags] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Loading state for individual presets
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  
  // Confirmation modals
  const [confirmReplace, setConfirmReplace] = useState<{ bankNumber: number; preset: Preset } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Preset | null>(null);

  // Library drawer state
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTargetSlot, setLibraryTargetSlot] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && banks.length === 0) {
      loadBanks();
    }
  }, [isOpen, pedalType]);

  // Close library drawer when preset manager closes
  useEffect(() => {
    if (!isOpen) {
      setIsLibraryOpen(false);
      setLibraryTargetSlot(null);
    }
  }, [isOpen]);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const bankState = await getBankState(pedalType);
      
      // Always ensure we have all 16 slots
      if (!bankState || bankState.length === 0) {
        const emptyBanks: BankSlot[] = [];
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
        
        for (let i = 45; i <= 60; i++) {
          const bankGroup = Math.floor((i - 45) / 4);
          const slotLetter = String.fromCharCode(65 + ((i - 45) % 4));
          emptyBanks.push({
            bankNumber: i,
            bankLabel: `Bank ${bankGroup + 1}${slotLetter}`,
            color: colors[bankGroup],
            preset: undefined,
          });
        }
        setBanks(emptyBanks);
      } else {
        setBanks(bankState);
      }
    } catch (error) {
      console.error('Failed to load bank state:', error);
      
      // On error, still create empty slots so UI isn't broken
      const emptyBanks: BankSlot[] = [];
      const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
      for (let i = 45; i <= 60; i++) {
        const bankGroup = Math.floor((i - 45) / 4);
        const slotLetter = String.fromCharCode(65 + ((i - 45) % 4));
        emptyBanks.push({
          bankNumber: i,
          bankLabel: `Bank ${bankGroup + 1}${slotLetter}`,
          color: colors[bankGroup],
          preset: undefined,
        });
      }
      setBanks(emptyBanks);
    } finally {
      setLoading(false);
    }
  };

  // --- Library drawer handlers ---
  const handleOpenLibraryFromHeader = () => {
    setLibraryTargetSlot(null);
    setIsLibraryOpen(true);
  };

  const handleOpenLibraryForSlot = (bankNumber: number) => {
    setLibraryTargetSlot(bankNumber);
    setIsLibraryOpen(true);
  };

  const handleLibraryClose = () => {
    setIsLibraryOpen(false);
    setLibraryTargetSlot(null);
  };

  const handleLibrarySlotLoaded = () => {
    // Refresh bank state after a preset was loaded into a slot
    loadBanks();
  };

  const handleLibraryLoadToEditor = async (
    state: MicrocosmState,
    presetId: string,
    presetName: string,
  ) => {
    if (onLoadPreset) {
      await onLoadPreset(state, presetId, presetName);
    } else {
      await recallMicrocosmPreset(deviceName, state);
    }
    // Close the preset manager too
    onClose();
  };

  // --- Existing handlers ---
  const handleStartSave = (bankNumber: number, existingPreset?: Preset) => {
    if (existingPreset) {
      setConfirmReplace({ bankNumber, preset: existingPreset });
    } else {
      setSavingToBank(bankNumber);
      setPresetName('');
      setPresetDescription('');
      setPresetTags('');
      setSaveError(null);
    }
  };

  const handleConfirmReplace = () => {
    if (confirmReplace) {
      setSavingToBank(confirmReplace.bankNumber);
      setPresetName(confirmReplace.preset.name);
      setPresetDescription(confirmReplace.preset.description || '');
      const tags = confirmReplace.preset.tags.join(', ');
      setPresetTags(tags);
      setSaveError(null);
    }
    setConfirmReplace(null);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim() || savingToBank === null) {
      setSaveError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const tagArray = presetTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const preset = await savePreset({
        name: presetName.trim(),
        pedalType,
        description: presetDescription.trim() || undefined,
        parameters: currentState,
        tags: tagArray,
      });

      await savePresetToBank(deviceName, preset.id, savingToBank);

      if (onPresetSaved) {
        onPresetSaved(preset.id, preset.name);
      }

      setSavingToBank(null);
      setPresetName('');
      setPresetDescription('');
      setPresetTags('');
      await loadBanks();
      
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLoadPreset = async (preset: Preset) => {
    try {
      setLoadingPresetId(preset.id);
      const state = preset.parameters as MicrocosmState;
      
      if (onLoadPreset) {
        await onLoadPreset(state, preset.id, preset.name);
      } else {
        await recallMicrocosmPreset(deviceName, state);
      }
      
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Failed to load preset:', error);
    } finally {
      setLoadingPresetId(null);
    }
  };

  const handleDeletePreset = async () => {
    if (!confirmDelete) return;

    try {
      const deletedPresetId = confirmDelete.id;
      await deletePreset(deletedPresetId);
      
      if (activePresetId === deletedPresetId && onPresetCleared) {
        onPresetCleared();
      }
      
      setConfirmDelete(null);
      await loadBanks();
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  const content = (
    <>
      {/* Overlay - covers full screen normally, or left 30% when library is open */}
      <div
        className={`fixed inset-0 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${
          // When library is open on desktop, only cover left side (not the drawers)
          isLibraryOpen ? 'md:right-[70%]' : ''
        }`}
        style={{ zIndex: 9997, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={() => {
          if (isLibraryOpen) {
            // Close library first
            handleLibraryClose();
          } else {
            onClose();
          }
        }}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full shadow-xl w-full md:w-[35%] border-l border-border-light transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 9999, backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 bg-card-header border-b border-border-light">
          <h2 className="text-lg font-semibold text-text-primary">Preset Manager</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenLibraryFromHeader}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 rounded-md text-accent-blue transition-colors"
            >
              <Library className="w-3.5 h-3.5" />
              View Library
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-control-hover rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={`p-4 overflow-y-auto h-[calc(100vh-73px)] transition-opacity duration-200 ${
            isLibraryOpen ? 'opacity-50 pointer-events-none' : ''
          }`}
          style={{ backgroundColor: '#f5f5f5' }}
        >
          {loading ? (
            <div className="text-center py-12 text-text-secondary">Loading banks...</div>
          ) : (
            <div className="space-y-6">
              {banks.length === 0 && (
                <div className="text-center py-4 text-accent-red text-sm">
                  No banks loaded. Total banks: {banks.length}
                </div>
              )}
              
              {/* Bank Groups */}
              {[1, 2, 3, 4].map((bankGroup) => {
                const bankSlots = banks.filter(
                  (slot) => Math.floor((slot.bankNumber - 45) / 4) === bankGroup - 1
                );
                const color = bankSlots[0]?.color || 'gray';

                return (
                  <div key={bankGroup} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2 px-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-border-default"
                        style={{ backgroundColor: color }}
                      />
                      Bank {bankGroup} ({bankSlots.length} slots)
                    </h3>

                    <div className="space-y-2">
                      {bankSlots.length === 0 ? (
                        <div className="text-xs text-text-muted px-1">No slots in this bank</div>
                      ) : (
                        bankSlots.map((slot) => {
                        const slotLetter = String.fromCharCode(
                          65 + (slot.bankNumber - 45) % 4
                        );

                        return (
                          <div
                            key={slot.bankNumber}
                            className="flex items-center gap-3 p-3 bg-card-bg rounded-lg border border-border-light shadow-sm"
                          >
                            {/* Slot Label */}
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-card-header border border-border-light">
                              <span className="text-xs font-mono font-semibold text-text-primary">
                                {slotLetter}
                              </span>
                            </div>

                            {/* Slot Content */}
                            {slot.preset ? (
                              <>
                                <div className="flex-1 min-w-0">
                                  <div className="text-text-primary text-sm font-medium truncate">
                                    {slot.preset.name}
                                  </div>
                                  {slot.preset.description && (
                                    <div className="text-xs text-text-muted truncate">
                                      {slot.preset.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 w-[140px]">
                                  <button
                                    onClick={() => handleLoadPreset(slot.preset!)}
                                    disabled={loadingPresetId === slot.preset!.id}
                                    className="flex items-center justify-center gap-1.5 flex-1 py-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 rounded-md text-accent-blue text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {loadingPresetId === slot.preset!.id ? (
                                      <>
                                        <div className="w-3 h-3 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                                        Loading
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3 h-3" />
                                        Load
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(slot.preset!)}
                                    className="p-1.5 hover:bg-accent-red/10 border border-control-border hover:border-accent-red/30 rounded-md text-text-muted hover:text-accent-red transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex-1 text-text-muted text-sm">Empty</div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenLibraryForSlot(slot.bankNumber)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 rounded-md text-accent-blue text-xs font-medium transition-colors"
                                  >
                                    <Library className="w-3 h-3" />
                                    Load from Library
                                  </button>
                                  <button
                                    onClick={() => handleStartSave(slot.bankNumber)}
                                    className="flex items-center justify-center p-1.5 bg-accent-green/10 hover:bg-accent-green/20 border border-accent-green/30 rounded-md text-accent-green transition-colors"
                                    title="Save current settings"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Library Drawer */}
      <LibraryDrawer
        isOpen={isLibraryOpen}
        onClose={handleLibraryClose}
        deviceName={deviceName}
        pedalType={pedalType}
        targetBankSlot={libraryTargetSlot}
        onSlotLoaded={handleLibrarySlotLoaded}
        onLoadToEditor={handleLibraryLoadToEditor}
        onPresetDeleted={(deletedId) => {
          // Clear active preset if the deleted preset was active
          if (activePresetId === deletedId && onPresetCleared) {
            onPresetCleared();
          }
          // Refresh banks to update UI
          loadBanks();
        }}
      />

      {/* Save Preset Dialog */}
      {savingToBank !== null && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 10000, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          onClick={() => setSavingToBank(null)}
        >
          <div
            className="rounded-lg shadow-xl w-full max-w-lg m-4 border border-border-light"
            style={{ backgroundColor: '#ffffff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-card-header border-b border-border-light">
              <h2 className="text-base font-semibold text-text-primary">Save Preset to Bank {savingToBank - 44}</h2>
              <button
                onClick={() => setSavingToBank(null)}
                className="p-2 hover:bg-control-hover rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {saveError && (
                <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-md text-accent-red text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  Name <span className="text-accent-red">*</span>
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="My Ambient Preset"
                  maxLength={100}
                  className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="A lush ambient sound..."
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={presetTags}
                  onChange={(e) => setPresetTags(e.target.value)}
                  placeholder="ambient, reverb, glitch"
                  className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-card-header">
              <button
                onClick={() => setSavingToBank(null)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={saving || !presetName.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Confirmation */}
      <ConfirmModal
        isOpen={confirmReplace !== null}
        title="Replace Existing Preset?"
        message={`Bank slot already contains "${confirmReplace?.preset.name}". Do you want to replace it with the current state?`}
        confirmLabel="Replace"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleConfirmReplace}
        onCancel={() => setConfirmReplace(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={confirmDelete !== null}
        title="Delete Preset?"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeletePreset}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );

  // Always render to DOM for animations, but start hidden
  return createPortal(content, document.body);
}
