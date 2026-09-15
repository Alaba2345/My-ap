import { Search, LayoutGrid, List, Flame, Star, SlidersHorizontal } from 'lucide-react';
import { ScannerConfig } from '../types';

interface FilterControlsProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeCategory: 'all' | 'surging' | 'mega' | 'mid' | 'low' | 'watchlist';
  onCategoryChange: (cat: 'all' | 'surging' | 'mega' | 'mid' | 'low' | 'watchlist') => void;
  sortBy: 'surgeScore' | 'change5m' | 'change1h' | 'change24h' | 'volume24h';
  onSortByChange: (sort: 'surgeScore' | 'change5m' | 'change1h' | 'change24h' | 'volume24h') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  surgingCount: number;
  watchlistCount: number;
  onOpenSettings: () => void;
  config: ScannerConfig;
}

export function FilterControls({
  searchTerm,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  surgingCount,
  watchlistCount,
  onOpenSettings,
  config,
}: FilterControlsProps) {
  const categories: { id: 'all' | 'surging' | 'mega' | 'mid' | 'low' | 'watchlist'; label: string; count?: number; icon?: any }[] = [
    { id: 'all', label: 'All Pairs' },
    { id: 'surging', label: 'Surging Now', count: surgingCount, icon: Flame },
    { id: 'mega', label: 'Mega Caps' },
    { id: 'mid', label: 'Mid-Tier L1s' },
    { id: 'low', label: 'Low-Caps & Gems' },
    { id: 'watchlist', label: 'Watchlist', count: watchlistCount, icon: Star },
  ];

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-zinc-800/80">
      {/* Category Pills & View Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-xs'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/80'
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      cat.id === 'surging'
                        ? isActive
                          ? 'text-orange-600 fill-orange-500'
                          : 'text-orange-400'
                        : cat.id === 'watchlist'
                        ? isActive
                          ? 'text-amber-600 fill-amber-500'
                          : 'text-amber-400'
                        : ''
                    }`}
                  />
                )}
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-200'
                        : cat.id === 'surging' && cat.count > 0
                        ? 'bg-orange-950 text-orange-300 border border-orange-700/50'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* View Mode & Thresholds Indicator */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Min 5m Surge: <strong className="text-zinc-200">+{config.min5mSurge}%</strong></span>
          </button>

          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Card Grid View"
              aria-label="Cards view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Dense Terminal Table View"
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Sort controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search coin symbol or name (e.g. SUI, PEPE)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500 focus:outline-hidden text-xs text-zinc-200 placeholder-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-zinc-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-hidden font-medium cursor-pointer"
          >
            <option value="surgeScore">⚡ Surge Momentum Score</option>
            <option value="change5m">🚀 5-Min Surge % (Breakouts)</option>
            <option value="change1h">⏱️ 1-Hour Change %</option>
            <option value="change24h">📈 24-Hour Gain %</option>
            <option value="volume24h">📊 24h Volume</option>
          </select>
        </div>
      </div>
    </div>
  );
}
