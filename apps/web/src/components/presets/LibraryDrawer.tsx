// Library Drawer - secondary drawer for browsing all saved presets
// Slides out from behind the Preset Manager drawer to the left
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Library, ArrowLeft } from 'lucide-react';
import { getPresetsWithBanks, savePresetToBank, deletePreset } from '@/lib/presets';
import type { PresetWithBanks, BankConfig } from '@/lib/presets/types';
import type { MicrocosmState } from '@/lib/midi/pedals/microcosm/types';
import { pedalRegistry } from '@/lib/midi/pedalRegistry';
import { formatBankSlot } from '@/lib/presets/utils';
import { PresetCard } from './PresetCard';
import { ConfirmModal } from './ConfirmModal';

interface LibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  pedalType: string;
  /** If set, clicking a preset saves it to this bank slot (primary flow) */
  targetBankSlot?: number | null;
  /** Called after successfully loading a preset to a bank slot (primary flow) */
  onSlotLoaded?: () => void;
  /** Called to load a preset into the editor without saving to bank (secondary flow) */
  onLoadToEditor?: (state: MicrocosmState, presetId: string, presetName: string) => Promise<void>;
  /** Called when a preset is deleted (to clear active preset if needed) */
  onPresetDeleted?: (presetId: string) => void;
}

export function LibraryDrawer({
  isOpen,
  onClose,
  deviceName,
  pedalType,
  targetBankSlot,
  onSlotLoaded,
  onLoadToEditor,
  onPresetDeleted,
}: LibraryDrawerProps) {
  const [presets, setPresets] = useState<PresetWithBanks[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);

  // Conflict confirmation state
  const [confirmSlot, setConfirmSlot] = useState<{
    preset: PresetWithBanks;
    existingPresetName: string;
    bankSlot: number;
  } | null>(null);

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState<PresetWithBanks | null>(null);

  const loadPresets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPresetsWithBanks(pedalType);
      setPresets(result);
    } catch (err) {
      console.error('Failed to load presets with banks:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [pedalType]);

  // Load bank config from pedal definition
  useEffect(() => {
    const pedal = pedalRegistry.get(pedalType);
    if (pedal?.bankConfig) {
      setBankConfig(pedal.bankConfig);
    }
  }, [pedalType]);

  useEffect(() => {
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen, loadPresets]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handlePresetSelect = async (preset: PresetWithBanks) => {
    if (loadingPresetId) return; // Prevent double-clicks

    if (targetBankSlot != null) {
      // Primary flow: save to specific bank slot
      // Check if the slot already has a preset (find the existing preset name)
      const existingInSlot = presets.find(
        (p) => p.bankNumbers.includes(targetBankSlot) && p.id !== preset.id
      );

      if (existingInSlot) {
        // Show conflict confirmation
        setConfirmSlot({
          preset,
          existingPresetName: existingInSlot.name,
          bankSlot: targetBankSlot,
        });
        return;
      }

      await saveToBankSlot(preset, targetBankSlot);
    } else {
      // Secondary flow: load to editor only
      await loadToEditor(preset);
    }
  };

  const saveToBankSlot = async (preset: PresetWithBanks, bankSlot: number) => {
    try {
      setLoadingPresetId(preset.id);
      const result = await savePresetToBank(deviceName, preset.id, bankSlot);
      
      if (bankConfig) {
        const slotLabel = formatBankSlot(bankSlot, bankConfig).label;
        if (result.manualSaveRequired && result.instructions) {
          console.log(`Loaded "${preset.name}" to bank slot ${slotLabel}. Manual save required: ${result.instructions}`);
        } else {
          console.log(`Saved "${preset.name}" to bank slot ${slotLabel}`);
        }
      }
      
      onSlotLoaded?.();
      onClose();
    } catch (err) {
      console.error('Failed to save preset to bank:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingPresetId(null);
    }
  };

  const loadToEditor = async (preset: PresetWithBanks) => {
    if (!onLoadToEditor) return;

    try {
      setLoadingPresetId(preset.id);
      const state = preset.parameters as MicrocosmState;
      await onLoadToEditor(state, preset.id, preset.name);
      console.log(`Loaded "${preset.name}" to editor`);
      onClose();
    } catch (err) {
      console.error('Failed to load preset to editor:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingPresetId(null);
    }
  };

  const handleConfirmReplace = async () => {
    if (!confirmSlot) return;
    await saveToBankSlot(confirmSlot.preset, confirmSlot.bankSlot);
    setConfirmSlot(null);
  };

  const handleDeletePreset = (preset: PresetWithBanks) => {
    setConfirmDelete(preset);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const deletedId = confirmDelete.id;
      await deletePreset(deletedId);
      console.log(`Deleted preset: ${confirmDelete.name}`);
      setConfirmDelete(null);
      
      // Notify parent that preset was deleted (so it can clear active preset if needed)
      onPresetDeleted?.(deletedId);
      
      // Refresh the preset list
      await loadPresets();
    } catch (err) {
      console.error('Failed to delete preset:', err);
      setError(err instanceof Error ? err.message : String(err));
      setConfirmDelete(null);
    }
  };

  const targetSlotInfo = targetBankSlot != null && bankConfig ? formatBankSlot(targetBankSlot, bankConfig) : null;

  const content = (
    <>
      {/* Drawer - slides from right, positioned to the left of PresetManager */}
      <div
        className={`fixed right-0 top-0 h-full shadow-xl border-l border-r border-border-light transition-all duration-300 ease-in-out w-full md:w-[35%] md:right-[35%] ${
          isOpen
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
        style={{
          // Same level as overlay, but won't overlap since this is positioned left
          zIndex: 9998,
          backgroundColor: '#fafafa',
        }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 bg-card-header border-b border-border-light">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-control-hover rounded-md transition-colors"
              title="Close library"
            >
              <ArrowLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <Library className="w-4.5 h-4.5 text-text-secondary" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Preset Library</h2>
              {targetSlotInfo && (
                <p className="text-xs text-text-muted leading-tight">
                  Loading to Bank{' '}
                  <span
                    className="font-bold"
                    style={{ color: targetSlotInfo.color }}
                  >
                    {targetSlotInfo.label}
                  </span>
                </p>
              )}
              {!targetSlotInfo && (
                <p className="text-xs text-text-muted leading-tight">Tap a preset to load it</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-control-hover rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-3 p-3 bg-accent-red/10 border border-accent-red/20 rounded-md">
            <p className="text-accent-red text-xs">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-73px)]">
          {loading ? (
            <div className="text-center py-12 text-text-secondary">
              <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading presets...
            </div>
          ) : presets.length === 0 ? (
            // Empty state
            <div className="text-center py-12 px-4">
              <Library className="w-10 h-10 text-text-muted mx-auto mb-4 opacity-40" />
              <p className="text-text-secondary text-sm font-medium mb-2">
                No saved presets yet.
              </p>
              <p className="text-text-muted text-xs leading-relaxed">
                Save your current settings to build your library!
              </p>
              <p className="text-text-muted text-xs mt-3 leading-relaxed opacity-75">
                Tip: Use &quot;Save Current&quot; on any bank slot to add presets to your library.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {presets.map((presetWithBanks) => (
                <PresetCard
                  key={presetWithBanks.id}
                  preset={presetWithBanks}
                  bankSlots={presetWithBanks.bankNumbers}
                  bankConfig={bankConfig || undefined}
                  mode="select"
                  isLoading={loadingPresetId === presetWithBanks.id}
                  disabled={loadingPresetId !== null && loadingPresetId !== presetWithBanks.id}
                  onSelect={() => handlePresetSelect(presetWithBanks)}
                  onDelete={() => handleDeletePreset(presetWithBanks)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slot Conflict Confirmation */}
      <ConfirmModal
        isOpen={confirmSlot !== null}
        title="Replace Existing Preset?"
        message={`Bank ${targetSlotInfo?.label ?? ''} already contains "${confirmSlot?.existingPresetName}". Do you want to replace it with "${confirmSlot?.preset.name}"?`}
        confirmLabel="Replace"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleConfirmReplace}
        onCancel={() => setConfirmSlot(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={confirmDelete !== null}
        title="Delete Preset?"
        message={
          confirmDelete && confirmDelete.bankNumbers.length > 0 && bankConfig
            ? `"${confirmDelete.name}" is currently loaded in pedal bank ${confirmDelete.bankNumbers.map(num => formatBankSlot(num, bankConfig).label).join(', ')}. Deleting this preset will remove it from both the app library and the pedal bank. This action cannot be undone.`
            : `Are you sure you want to delete "${confirmDelete?.name}"? This preset will be permanently removed from your library and cannot be recovered.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );

  return createPortal(content, document.body);
}
