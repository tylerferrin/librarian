// Preset Library - main view for browsing and managing presets
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Star, Grid3x3, List } from 'lucide-react';
import { listPresets, deletePreset, toggleFavorite } from '@/lib/presets';
import { recallMicrocosmPreset } from '@/lib/midi/pedals/microcosm/api';
import type { Preset, PresetFilter } from '@/lib/presets/types';
import { PresetCard } from './PresetCard';
import { BankDrawer } from './BankDrawer';
import type { MicrocosmState } from '@/lib/midi/pedals/microcosm/types';

interface PresetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  deviceName: string;
  pedalType: string;
}

export function PresetLibrary({ isOpen, onClose, deviceName, pedalType }: PresetLibraryProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bankDrawerOpen, setBankDrawerOpen] = useState(false);
  const [selectedPresetForBank, setSelectedPresetForBank] = useState<Preset | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPresets();
    }
  }, [isOpen, pedalType]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const filter: PresetFilter = {
        pedalType,
        searchQuery: searchQuery || undefined,
        isFavorite: showFavoritesOnly ? true : undefined,
      };
      const result = await listPresets(filter);
      setPresets(result);
    } catch (error) {
      console.error('Failed to load presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreset = async (preset: Preset) => {
    try {
      // Deserialize and send to pedal
      const state = preset.parameters as MicrocosmState;
      await recallMicrocosmPreset(deviceName, state);
      
      // Show success feedback
      console.log('Loaded preset:', preset.name);
    } catch (error) {
      console.error('Failed to load preset:', error);
    }
  };

  const handleToggleFavorite = async (preset: Preset) => {
    try {
      await toggleFavorite(preset.id);
      await loadPresets();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async (preset: Preset) => {
    if (!confirm(`Delete "${preset.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deletePreset(preset.id);
      await loadPresets();
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  const handleSaveToBank = (preset: Preset) => {
    setSelectedPresetForBank(preset);
    setBankDrawerOpen(true);
  };

  const handleSearch = () => {
    loadPresets();
  };

  if (!isOpen) return null;

  const libraryContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center"
        style={{ zIndex: 9999 }}
        onClick={onClose}
      >
        {/* Library Window */}
        <div
          className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] m-4 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold text-white">Preset Library</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="p-4 border-b border-zinc-800 space-y-3">
            {/* Search */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search presets..."
                  className="w-full pl-10 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setTimeout(loadPresets, 0);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    showFavoritesOnly
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                  Favorites
                </button>
              </div>

              <div className="flex gap-1 border border-zinc-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-12 text-zinc-400">
                Loading presets...
              </div>
            ) : presets.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-lg mb-2">No presets found</p>
                <p className="text-sm">
                  Save your first preset from the editor!
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-3'
                }
              >
                {presets.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onLoad={handleLoadPreset}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                    onSaveToBank={handleSaveToBank}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Drawer (for saving selected preset to bank) */}
      {selectedPresetForBank && (
        <BankDrawer
          isOpen={bankDrawerOpen}
          onClose={() => {
            setBankDrawerOpen(false);
            setSelectedPresetForBank(null);
          }}
          deviceName={deviceName}
          pedalType={pedalType}
          onBankSelected={async (bankNumber) => {
            // Save the selected preset to the chosen bank
            console.log('Saving preset to bank:', bankNumber);
            setBankDrawerOpen(false);
            setSelectedPresetForBank(null);
          }}
        />
      )}
    </>
  );

  return createPortal(libraryContent, document.body);
}
