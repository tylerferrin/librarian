import { EFFECT_CATEGORIES, type EffectType, type EffectVariation, type EffectCategory } from '../../../lib/midi/pedals/microcosm';

interface EffectSelectorProps {
  currentEffect: EffectType;
  currentVariation: EffectVariation;
  onSelectEffect: (effect: EffectType, variation: EffectVariation) => void;
}

const VARIATIONS: EffectVariation[] = ['A', 'B', 'C', 'D'];

/** Color accents for each category */
const CATEGORY_COLORS: Record<EffectCategory, { 
  borderColor: string; 
  bgColor: string; 
  textColor: string; 
  activeBgColor: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  activeBgClass: string;
}> = {
  MicroLoop: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    textColor: '#a855f7',
    activeBgColor: '#a855f7',
    borderClass: 'border-accent-purple/40',
    bgClass: 'bg-accent-purple/10',
    textClass: 'text-accent-purple',
    activeBgClass: 'bg-accent-purple',
  },
  MultiDelay: {
    borderColor: 'rgba(6, 182, 212, 0.4)',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    textColor: '#06b6d4',
    activeBgColor: '#06b6d4',
    borderClass: 'border-accent-cyan/40',
    bgClass: 'bg-accent-cyan/10',
    textClass: 'text-accent-cyan',
    activeBgClass: 'bg-accent-cyan',
  },
  Granules: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b',
    activeBgColor: '#f59e0b',
    borderClass: 'border-accent-amber/40',
    bgClass: 'bg-accent-amber/10',
    textClass: 'text-accent-amber',
    activeBgClass: 'bg-accent-amber',
  },
  MultiPass: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    bgColor: 'rgba(244, 63, 94, 0.1)',
    textColor: '#f43f5e',
    activeBgColor: '#f43f5e',
    borderClass: 'border-accent-rose/40',
    bgClass: 'bg-accent-rose/10',
    textClass: 'text-accent-rose',
    activeBgClass: 'bg-accent-rose',
  },
};

export function EffectSelector({ currentEffect, currentVariation, onSelectEffect }: EffectSelectorProps) {
  return (
    <div className="bg-card-bg border border-border-light rounded-lg overflow-hidden shadow-sm select-none">
      {/* Header */}
      <div className="px-4 py-2 bg-card-header border-b border-border-light flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Effect Type
        </h3>
        <span className="text-xs text-text-muted">
          {currentEffect} / Variation {currentVariation}
        </span>
      </div>

      {/* Categories Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {EFFECT_CATEGORIES.map((category) => {
          const colors = CATEGORY_COLORS[category.id];
          const isCategoryActive = category.effects.some((e) => e.id === currentEffect);

          return (
            <div
              key={category.id}
              className={`rounded-lg border overflow-hidden ${isCategoryActive ? colors.borderClass : 'border-border-light'} ${isCategoryActive ? colors.bgClass : 'bg-card-header'}`}
            >
              {/* Category Header */}
              <div className={`px-3 py-1.5 border-b ${isCategoryActive ? colors.borderClass : 'border-border-light'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isCategoryActive ? colors.textClass : 'text-text-muted'}`}>
                  {category.name}
                </span>
              </div>

              {/* Effects List */}
              <div className="p-2 space-y-1.5">
                {category.effects.map((effect) => {
                  const isEffectActive = currentEffect === effect.id;

                  return (
                    <div key={effect.id}>
                      {/* Effect Name + Variation Buttons */}
                      <div 
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${isEffectActive ? 'border animate-gradient-wave' : ''}`}
                        style={isEffectActive ? {
                          backgroundImage: `linear-gradient(135deg, ${colors.bgColor} 0%, ${colors.borderColor.replace('0.4', '0.15')} 50%, ${colors.bgColor} 100%)`,
                          borderColor: colors.borderColor,
                          backgroundSize: '200% 100%',
                        } : {}}
                      >
                        <span
                          className={`text-xs font-medium w-16 shrink-0 ${isEffectActive ? 'font-semibold' : 'text-text-secondary'}`}
                          style={isEffectActive ? { color: colors.textColor } : {}}
                        >
                          {effect.name}
                        </span>
                        <div className="flex gap-1">
                          {VARIATIONS.map((variation) => {
                            const isActive = isEffectActive && currentVariation === variation;
                            
                            return (
                              <button
                                key={variation}
                                onClick={() => onSelectEffect(effect.id, variation)}
                                className={`w-7 h-6 rounded text-[10px] font-bold transition-all duration-150 ${
                                  isActive 
                                    ? 'text-white shadow-md border-2' 
                                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                                style={isActive ? {
                                  backgroundColor: colors.activeBgColor,
                                  borderColor: colors.borderColor,
                                } : {}}
                              >
                                {variation}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
