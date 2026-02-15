// Preset Card - displays a single preset in the library with optional bank badges
import { Play, Star, Trash2 } from 'lucide-react';
import type { Preset } from '@/lib/presets/types';
import { formatBankSlot } from '@/lib/presets/utils';
import type { MicrocosmState } from '@/lib/midi/pedals/microcosm/types';
import { getEffectColors } from '@/lib/midi/pedals/microcosm/colors';

interface PresetCardProps {
  preset: Preset;
  /** Bank numbers this preset is currently assigned to (45-60) */
  bankSlots?: number[];
  /** 'library' renders full actions; 'select' makes the whole card clickable */
  mode?: 'library' | 'select';
  /** Whether this card is currently being loaded (shows spinner) */
  isLoading?: boolean;
  /** Whether all cards should be disabled (e.g. while another is loading) */
  disabled?: boolean;
  onLoad?: (preset: Preset) => void;
  onToggleFavorite?: (preset: Preset) => void;
  onDelete?: (preset: Preset) => void;
  onSaveToBank?: (preset: Preset) => void;
  /** Called when card is clicked in 'select' mode */
  onSelect?: (preset: Preset) => void;
}

export function PresetCard({
  preset,
  bankSlots = [],
  mode = 'library',
  isLoading = false,
  disabled = false,
  onLoad,
  onToggleFavorite,
  onDelete,
  onSaveToBank,
  onSelect,
}: PresetCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCardClick = () => {
    if (mode === 'select' && onSelect && !disabled && !isLoading) {
      onSelect(preset);
    }
  };

  // Get pedal type display name
  const getPedalTypeName = (pedalType: string): string => {
    const typeMap: Record<string, string> = {
      microcosm: 'Microcosm',
      // Add other pedal types as needed
    };
    return typeMap[pedalType.toLowerCase()] || pedalType;
  };

  // Get effect type and variation for Microcosm presets
  const getMicrocosmEffectInfo = (): { label: string; colors: { bgColor: string; textColor: string; borderColor: string } } | null => {
    if (preset.pedalType.toLowerCase() !== 'microcosm') return null;
    
    try {
      const state = preset.parameters as MicrocosmState;
      if (state.current_effect && state.current_variation) {
        const colors = getEffectColors(state.current_effect);
        if (colors) {
          return {
            label: `${state.current_effect} ${state.current_variation}`,
            colors: {
              bgColor: colors.bgColor,
              textColor: colors.textColor,
              borderColor: colors.borderColor,
            },
          };
        }
      }
    } catch (err) {
      console.warn('Failed to extract effect info from preset:', err);
    }
    return null;
  };

  const pedalTypeName = getPedalTypeName(preset.pedalType);
  const effectInfo = getMicrocosmEffectInfo();

  return (
    <div
      className={`relative bg-card-bg border border-border-light rounded-lg p-4 transition-colors ${
        mode === 'select'
          ? disabled || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-accent-blue cursor-pointer hover:shadow-md'
          : 'hover:border-zinc-600'
      }`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-medium truncate">{preset.name}</h3>
          <p className="text-xs text-text-muted mt-0.5">
            {formatDate(preset.updatedAt)}
          </p>
          
          {/* Pedal Type and Effect Info */}
          <div className="flex flex-col gap-0.5 mt-1.5">
            <p className="text-xs text-text-muted">
              {pedalTypeName} Preset
            </p>
            {effectInfo && (
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-sm border"
                  style={{
                    backgroundColor: effectInfo.colors.bgColor,
                    borderColor: effectInfo.colors.borderColor,
                  }}
                />
                <p 
                  className="text-xs font-medium"
                  style={{ color: effectInfo.colors.textColor }}
                >
                  {effectInfo.label}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bank Slot Badges */}
        {bankSlots.length > 0 && (
          <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
            <span className="text-[10px] text-text-muted font-medium">
              Pedal Bank:
            </span>
            <div className="flex items-center gap-1">
              {bankSlots.map((bankNum) => {
                const info = formatBankSlot(bankNum);
                return (
                  <span
                    key={bankNum}
                    className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded border"
                    style={{
                      color: info.color,
                      borderColor: info.color,
                      backgroundColor: `${info.color}15`,
                    }}
                    title={`Loaded in Bank ${info.label}`}
                  >
                    {info.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Favorite button (library mode only) */}
        {mode === 'library' && onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(preset);
            }}
            className="p-1.5 hover:bg-control-hover rounded transition-colors ml-2"
          >
            <Star
              className={`w-4 h-4 ${
                preset.isFavorite
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-text-muted'
              }`}
            />
          </button>
        )}
      </div>

      {/* Description */}
      {preset.description && (
        <p className="text-sm text-text-secondary mb-2 line-clamp-2">
          {preset.description}
        </p>
      )}

      {/* Tags */}
      {preset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {preset.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-control-bg text-text-muted text-xs rounded border border-border-light"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Loading indicator for select mode */}
      {mode === 'select' && isLoading && (
        <div className="flex items-center gap-2 pt-2 border-t border-border-light mt-2">
          <div className="w-3.5 h-3.5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-accent-blue font-medium">Loading to pedal...</span>
        </div>
      )}

      {/* Actions (library mode only) */}
      {mode === 'library' && (
        <div className="flex gap-2 pt-3 border-t border-border-light mt-2">
          {onLoad && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLoad(preset);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 rounded-lg text-accent-blue text-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Load
            </button>
          )}
          {onSaveToBank && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveToBank(preset);
              }}
              className="px-3 py-2 border border-control-border hover:bg-control-hover rounded-lg text-text-secondary text-sm transition-colors"
            >
              To Bank
            </button>
          )}
        </div>
      )}

      {/* Delete button - positioned in bottom right corner */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(preset);
          }}
          disabled={disabled || isLoading}
          className="absolute bottom-3 right-3 p-1.5 hover:bg-accent-red/10 rounded transition-colors text-text-muted hover:text-accent-red disabled:opacity-50"
          title="Delete preset"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
