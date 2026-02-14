// Preset Card - displays a single preset in the library
import { Play, Star, Trash2 } from 'lucide-react';
import type { Preset } from '@/lib/presets/types';

interface PresetCardProps {
  preset: Preset;
  onLoad: (preset: Preset) => void;
  onToggleFavorite: (preset: Preset) => void;
  onDelete: (preset: Preset) => void;
  onSaveToBank: (preset: Preset) => void;
}

export function PresetCard({
  preset,
  onLoad,
  onToggleFavorite,
  onDelete,
  onSaveToBank,
}: PresetCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{preset.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {preset.pedalType} • {formatDate(preset.updatedAt)}
          </p>
        </div>
        <button
          onClick={() => onToggleFavorite(preset)}
          className="p-1.5 hover:bg-zinc-800 rounded transition-colors ml-2"
        >
          <Star
            className={`w-4 h-4 ${
              preset.isFavorite
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-zinc-600'
            }`}
          />
        </button>
      </div>

      {/* Description */}
      {preset.description && (
        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
          {preset.description}
        </p>
      )}

      {/* Tags */}
      {preset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {preset.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-zinc-800">
        <button
          onClick={() => onLoad(preset)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Load
        </button>
        <button
          onClick={() => onSaveToBank(preset)}
          className="px-3 py-2 border border-zinc-700 hover:bg-zinc-800 rounded-lg text-zinc-300 text-sm transition-colors"
        >
          To Bank
        </button>
        <button
          onClick={() => onDelete(preset)}
          className="p-2 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
