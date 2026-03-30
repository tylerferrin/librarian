// Save Preset Dialog - save current pedal state as a preset
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import { savePreset, savePresetToBank } from '@/lib/presets';
import type { MicrocosmState } from '@/lib/midi/pedals/microcosm/types';

interface SavePresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  pedalType: string;
  currentState: MicrocosmState | any;
  onSaved?: () => void;
}

export function SavePresetDialog({
  isOpen,
  onClose,
  deviceName,
  pedalType,
  currentState,
  onSaved,
}: SavePresetDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [bankNumber, setBankNumber] = useState<number>(45);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('SavePresetDialog isOpen changed to:', isOpen);
    if (isOpen) {
      console.log('Dialog should be rendering now!');
    }
  }, [isOpen]);

  console.log('SavePresetDialog rendering with isOpen:', isOpen);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Parse tags
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Save preset to library
      const preset = await savePreset({
        name: name.trim(),
        pedalType,
        description: description.trim() || undefined,
        parameters: currentState,
        tags: tagArray,
      });

      // Always save to pedal bank (required for state consistency)
      await savePresetToBank(deviceName, preset.id, bankNumber);

      // Reset form
      setName('');
      setDescription('');
      setTags('');
      setBankNumber(45);

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    console.log('SavePresetDialog: isOpen is false, returning null');
    return null;
  }

  console.log('SavePresetDialog: isOpen is TRUE, rendering dialog');

  const dialogContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md m-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">Save Preset</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Ambient Preset"
                maxLength={100}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A lush ambient sound with..."
                rows={3}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ambient, reverb, glitch"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Bank Selection (Required) */}
            <div className="pt-4 border-t border-zinc-800">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Pedal Bank <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Select which bank slot to save this preset to on your pedal.
              </p>
              <select
                value={bankNumber}
                onChange={(e) => setBankNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {Array.from({ length: 16 }, (_, i) => {
                  const num = 45 + i;
                  const bankGroup = Math.floor(i / 4) + 1;
                  const slot = String.fromCharCode(65 + (i % 4));
                  const colors = ['Red', 'Yellow', 'Green', 'Blue'];
                  const color = colors[Math.floor(i / 4)];
                  return (
                    <option key={num} value={num}>
                      PC {num} - Bank {bankGroup}{slot} ({color})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 border-t border-zinc-800">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preset'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}
