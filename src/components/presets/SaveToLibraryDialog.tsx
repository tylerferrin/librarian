// Save to Library Dialog - save current pedal state to library without bank assignment
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import { savePreset } from '@/lib/presets';
import type { MicrocosmState } from '@/lib/midi/pedals/microcosm/types';

interface SaveToLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pedalType: string;
  currentState: MicrocosmState | any;
  onSaved?: (presetId: string, presetName: string) => void;
}

export function SaveToLibraryDialog({
  isOpen,
  onClose,
  pedalType,
  currentState,
  onSaved,
}: SaveToLibraryDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Save preset to library only (no bank assignment)
      const preset = await savePreset({
        name: name.trim(),
        pedalType,
        description: description.trim() || undefined,
        parameters: currentState,
        tags: tagArray,
      });

      // Reset form
      setName('');
      setDescription('');
      setTags('');

      onSaved?.(preset.id, preset.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const dialogContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 10001, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          className="rounded-lg shadow-xl w-full max-w-lg m-4 border border-border-light"
          style={{ backgroundColor: '#ffffff' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-card-header border-b border-border-light">
            <h2 className="text-base font-semibold text-text-primary">Save to Library</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-control-hover rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-md text-accent-red text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-accent-blue/5 border border-accent-blue/20 rounded-md">
              <p className="text-xs text-text-secondary">
                This will save your current settings to the library without writing to the pedal bank.
                You can load this preset from the library later.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Name <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Ambient Preset"
                maxLength={100}
                className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A lush ambient sound with..."
                rows={4}
                className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ambient, reverb, glitch"
                className="w-full px-4 py-2.5 text-sm bg-control-bg border border-control-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-6 py-4 border-t border-border-light bg-card-header">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium border border-control-border rounded-md bg-card-bg text-text-primary hover:bg-control-hover transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save to Library'}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dialogContent, document.body);
}
