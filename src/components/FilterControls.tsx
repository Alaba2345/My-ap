import React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Flame,
  Star,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Target,
  X,
  Sparkles
} from 'lucide-react';
import { ScannerConfig } from '../types';

export type CategoryFilterType = 'all' | 'perfect' | 'surging' | 'long' | 'short' | 'liquid' | 'mega' | 'watchlist';

interface FilterControlsProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeCategory: CategoryFilterType;
  onCategoryChange: (cat: CategoryFilterType) => void;
  sortBy: 'surgeScore' | 'change5m' | 'change1h' | 'change24h' | 'volume24h';
  onSortByChange: (sort: 'surgeScore' | 'change5m' | 'change1h' | 'change24h' | 'volume24h') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  surgingCount: number;
  watchlistCount: number;
  perfectTradesCount?: number;
  onOpenSettings: () => void;
  onVolumeThresholdChange?: (vol: number) => void;
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
  perfectTradesCount = 0,
  onOpenSettings,
  onVolumeThresholdChange,
  config,
}: FilterControlsProps) {
  const categories: { id: CategoryFilterType; label: string; count?: number; icon?: any; badgeColor?: string }[] = [
    { id: 'all', label: 'All Bybit Coins' },
    {
      id: 'perfect',
      label: '⭐ Perfect Trades',
      count: perfectTradesCount,
      icon: Target,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    { id: 'surging', label: 'Surging Now', count: surgingCount, icon: Flame },
    { id: 'long', label: 'Long Setups', icon: ArrowUpRight },
    { id: 'short', label: 'Short Setups', icon: ArrowDownRight },
    { id: 'liquid', label: 'Top Liquid (> $15M)', icon: Droplets },
    { id: 'watchlist', label: 'Watchlist', count: watchlistCount, icon: Star },
  ];

  const quickKeywordChips = [
    { label: '⭐ perfect trade', query: 'perfect trade' },
    { label: '🔥 top pick', query: 'top pick' },
    { label: '📈 long', query: 'long' },
    { label: '📉 short', query: 'short' },
    { label: '🚀 breakout', query: 'breakout' },
    { label: '💧 >$10M vol', query: '10m' },
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
                      cat.id === 'perfect'
                        ? isActive
                          ? 'text-amber-700'
                          : 'text-amber-400'
                        : cat.id === 'surging'
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
                        : cat.id === 'perfect' && cat.count > 0
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
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
            <span>Radar Settings</span>
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

      {/* Search and Quick Filters Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Enhanced Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search coin (SOL, BTC) or keyword: 'perfect trade', 'long', 'breakout'..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500 focus:outline-hidden text-xs text-zinc-200 placeholder-zinc-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Volume Threshold Dropdown & Sort selector */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end text-xs">
            {/* Volume Threshold Filter Direct Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Volume Threshold:</span>
              <select
                value={config.minVolume24h}
                onChange={(e) => onVolumeThresholdChange?.(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-semibold cursor-pointer focus:border-emerald-500"
              >
                <option value={0}>All Volume ($0+)</option>
                <option value={1000000}>$1M+ Turnover</option>
                <option value={5000000}>$5M+ Turnover</option>
                <option value={10000000}>⭐ $10M+ (Perfect Trade Threshold)</option>
                <option value={25000000}>$25M+ High Liquidity</option>
                <option value={50000000}>$50M+ Tier-1 Bluechips</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-hidden font-medium cursor-pointer"
              >
                <option value="surgeScore">⚡ Surge Momentum Score</option>
                <option value="change5m">🚀 5-Min Surge % (Breakouts)</option>
                <option value="change1h">⏱️ 1-Hour Change %</option>
                <option value="change24h">📈 24-Hour Gain %</option>
                <option value="volume24h">📊 24h Volume / Turnover</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Search Keyword Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Keywords:
          </span>
          {quickKeywordChips.map((chip) => {
            const isChipActive = searchTerm.toLowerCase().trim() === chip.query;
            return (
              <button
                key={chip.query}
                type="button"
                onClick={() => onSearchChange(isChipActive ? '' : chip.query)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  isChipActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
