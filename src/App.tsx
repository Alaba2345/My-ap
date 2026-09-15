/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CryptoCoin, SurgeAlert, DeepResearchReport, ScannerConfig } from './types';
import { Header } from './components/Header';
import { SurgeAlertTicker } from './components/SurgeAlertTicker';
import { FilterControls, CategoryFilterType } from './components/FilterControls';
import { CoinCard } from './components/CoinCard';
import { CoinTable } from './components/CoinTable';
import { PerfectTradeCard } from './components/PerfectTradeCard';
import { TradeSetupModal } from './components/TradeSetupModal';
import { DeepResearchModal } from './components/DeepResearchModal';
import { AlertsHistoryDrawer } from './components/AlertsHistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { playSurgeAlertSound } from './utils/audioAlert';
import { requestNotificationPermission, sendDesktopNotification } from './utils/notification';
import { Flame, Radio, RefreshCw, AlertCircle } from 'lucide-react';

const DEFAULT_CONFIG: ScannerConfig = {
  min5mSurge: 2.5,
  min1hSurge: 6.0,
  min24hSurge: 12.0,
  minVolume24h: 1_000_000,
  soundEnabled: true,
  autoResearch: true,
  notificationsEnabled: false,
  activeFilter: 'all',
};

export default function App() {
  const [coins, setCoins] = useState<CryptoCoin[]>([]);
  const [alerts, setAlerts] = useState<SurgeAlert[]>([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState<boolean>(true);
  const [lastMarketUpdate, setLastMarketUpdate] = useState<number>(Date.now());
  const [marketError, setMarketError] = useState<string | null>(null);

  // Config & Watchlist with local storage
  const [config, setConfig] = useState<ScannerConfig>(() => {
    try {
      const saved = localStorage.getItem('crypto_radar_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('crypto_radar_watchlist');
      return saved ? new Set(JSON.parse(saved)) : new Set(['BTC', 'SOL', 'SUI', 'PEPE']);
    } catch {
      return new Set(['BTC', 'SOL', 'SUI', 'PEPE']);
    }
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilterType>('all');
  const [sortBy, setSortBy] = useState<'surgeScore' | 'change5m' | 'change1h' | 'change24h' | 'volume24h'>('surgeScore');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals & Drawers
  const [selectedSymbolForResearch, setSelectedSymbolForResearch] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<DeepResearchReport | null>(null);
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);

  // Trade Setup modal state
  const [selectedSymbolForTrade, setSelectedSymbolForTrade] = useState<string | null>(null);
  const [tradeModalDirection, setTradeModalDirection] = useState<'LONG' | 'SHORT' | undefined>(undefined);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Alert tracking ref to detect brand-new alerts
  const seenAlertIdsRef = useRef<Set<string>>(new Set());
  const autoResearchedSymbolsRef = useRef<Set<string>>(new Set());

  // Open Trade Setup Modal
  const handleOpenTradeModal = (symbol: string, direction?: 'LONG' | 'SHORT') => {
    setSelectedSymbolForTrade(symbol);
    setTradeModalDirection(direction);
    setIsTradeModalOpen(true);
  };

  // Save config
  const updateConfig = (newConfig: Partial<ScannerConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem('crypto_radar_config', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (newConfig.notificationsEnabled) {
      requestNotificationPermission();
    }
  };

  // Toggle watchlist
  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      try {
        localStorage.setItem('crypto_radar_watchlist', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Coins Map for fast lookup
  const coinsMap = useMemo(() => {
    const map = new Map<string, CryptoCoin>();
    for (const c of coins) {
      map.set(c.symbol, c);
    }
    return map;
  }, [coins]);

  // Deep Research trigger
  const runDeepResearch = useCallback(async (symbol: string, forceRefresh = false) => {
    const targetCoin = coinsMap.get(symbol);
    setSelectedSymbolForResearch(symbol);
    setIsResearchModalOpen(true);
    setIsResearchLoading(true);

    try {
      const res = await fetch('/api/crypto/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          name: targetCoin?.name || symbol,
          price: targetCoin?.price || 1.0,
          change5m: targetCoin?.change5m || 0,
          change1h: targetCoin?.change1h || 0,
          change24h: targetCoin?.change24h || 0,
          volume24h: targetCoin?.volume24h || 10_000_000,
          volumeSpikeMultiplier: targetCoin?.volumeSpikeMultiplier || 1.5,
          forceRefresh,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setCurrentReport(data.report);
      } else {
        throw new Error(data.error || 'Failed to generate deep research');
      }
    } catch (err: any) {
      console.error('Deep research error:', err);
    } finally {
      setIsResearchLoading(false);
    }
  }, [coinsMap]);

  // Fetch live market data
  const fetchMarketData = useCallback(async () => {
    try {
      const [marketRes, alertsRes] = await Promise.all([
        fetch('/api/crypto/market'),
        fetch('/api/crypto/alerts'),
      ]);

      if (marketRes.ok) {
        const marketData = await marketRes.json();
        if (marketData.success && Array.isArray(marketData.coins)) {
          setCoins(marketData.coins);
          setLastMarketUpdate(Date.now());
          setMarketError(null);
        }
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success && Array.isArray(alertsData.alerts)) {
          const newAlerts: SurgeAlert[] = alertsData.alerts;
          setAlerts(newAlerts);

          // Check for new alerts to trigger sounds and notifications
          for (const alert of newAlerts) {
            if (!seenAlertIdsRef.current.has(alert.id)) {
              seenAlertIdsRef.current.add(alert.id);

              // Sound alert
              if (config.soundEnabled) {
                playSurgeAlertSound();
              }

              // Desktop notification
              if (config.notificationsEnabled) {
                sendDesktopNotification(
                  `🚀 Breakout Alert: ${alert.symbol} (+${alert.surgePercent}% in 5m)`,
                  `${alert.name} is rapidly accelerating with ${alert.volumeMultiplier}x volume spike! Click to view AI Deep Research.`
                );
              }

              // Auto AI research if enabled and not yet researched
              if (config.autoResearch && !autoResearchedSymbolsRef.current.has(alert.symbol)) {
                autoResearchedSymbolsRef.current.add(alert.symbol);
                // Background pre-fetch so clicking research is instantaneous
                fetch('/api/crypto/deep-research', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    symbol: alert.symbol,
                    name: alert.name,
                    price: alert.currentPrice,
                    change5m: alert.surgePercent,
                    change1h: alert.surgePercent * 1.5,
                    change24h: alert.surgePercent * 2.5,
                    volume24h: 25_000_000,
                    volumeSpikeMultiplier: alert.volumeMultiplier,
                    forceRefresh: false,
                  }),
                }).catch(() => {});
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('Market fetch error:', err.message);
      setMarketError('Connecting to live orderbook feed...');
    } finally {
      setIsLoadingMarket(false);
    }
  }, [config.soundEnabled, config.notificationsEnabled, config.autoResearch]);

  // Polling loop for real-time market updates every 3.5s
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 3500);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  // Filter and sort coins
  const filteredAndSortedCoins = useMemo(() => {
    let list = [...coins];

    // Volume threshold filter
    list = list.filter((c) => c.volume24h >= config.minVolume24h);

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }

    // Category filter
    if (activeCategory === 'surging') {
      list = list.filter((c) => c.isSurging || c.change5m >= config.min5mSurge);
    } else if (activeCategory === 'long') {
      list = list.filter((c) => c.change1h >= 0);
    } else if (activeCategory === 'short') {
      list = list.filter((c) => c.change1h < 0);
    } else if (activeCategory === 'liquid') {
      list = list.filter((c) => c.turnover24h >= 15_000_000);
    } else if (activeCategory === 'mega') {
      list = list.filter((c) => c.marketCapTier === 'mega');
    } else if (activeCategory === 'watchlist') {
      list = list.filter((c) => watchlist.has(c.symbol));
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'surgeScore') return b.surgeScore - a.surgeScore;
      if (sortBy === 'change5m') return b.change5m - a.change5m;
      if (sortBy === 'change1h') return b.change1h - a.change1h;
      if (sortBy === 'change24h') return b.change24h - a.change24h;
      if (sortBy === 'volume24h') return b.turnover24h - a.turnover24h;
      return 0;
    });

    return list;
  }, [coins, config.minVolume24h, config.min5mSurge, searchTerm, activeCategory, sortBy, watchlist]);

  const activeSurgesCount = useMemo(() => {
    return coins.filter((c) => c.isSurging || c.change5m >= config.min5mSurge).length;
  }, [coins, config.min5mSurge]);

  const selectedCoin = useMemo(() => {
    if (!selectedSymbolForResearch) return undefined;
    return coinsMap.get(selectedSymbolForResearch);
  }, [selectedSymbolForResearch, coinsMap]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <Header
        config={config}
        onChangeConfig={updateConfig}
        activeSurgesCount={activeSurgesCount}
        totalCoinsCount={coins.length}
        alertsCount={alerts.length}
        onOpenAlertsHistory={() => setIsAlertsDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onTestSound={() => playSurgeAlertSound(0.6)}
      />

      {/* Breakout Surge Alert Ticker */}
      <SurgeAlertTicker
        alerts={alerts}
        onSelectCoinForResearch={(sym) => runDeepResearch(sym)}
        coinsMap={coinsMap}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5">
        {/* Error notification banner if any */}
        {marketError && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{marketError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchMarketData()}
              className="flex items-center gap-1 font-semibold underline hover:text-amber-200"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* PRIMARY FEATURE: Automated Perfect Coin Selection & Trade Setup (TP, Entry, SL) */}
        <section aria-label="Automated Perfect Trade Analysis">
          <PerfectTradeCard
            onOpenTradeModal={handleOpenTradeModal}
            onOpenResearch={(sym) => runDeepResearch(sym)}
          />
        </section>

        {/* Filter & Sorting bar */}
        <FilterControls
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          surgingCount={activeSurgesCount}
          watchlistCount={watchlist.size}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          config={config}
        />

        {/* Active View Display */}
        {isLoadingMarket && coins.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 text-zinc-500">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-xs font-medium">Scanning Bybit V5 Perpetual Markets & Calculating Setups...</span>
          </div>
        ) : filteredAndSortedCoins.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-8">
            <Radio className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
            <h3 className="text-sm font-bold text-zinc-300">No coins match current filter criteria</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              {activeCategory === 'surging'
                ? 'No coins currently meet the surge breakout threshold. Lower your 5m sensitivity in Settings to detect smaller moves.'
                : activeCategory === 'watchlist'
                ? 'Your watchlist is empty. Click the star icon on any token to track it here.'
                : 'Try adjusting your search keywords or volume threshold.'}
            </p>
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="mt-4 px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                View All Bybit Coins
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredAndSortedCoins.map((coin) => (
              <CoinCard
                key={coin.id}
                coin={coin}
                onOpenResearch={(sym) => runDeepResearch(sym)}
                onOpenTradeModal={handleOpenTradeModal}
                isWatchlisted={watchlist.has(coin.symbol)}
                onToggleWatchlist={toggleWatchlist}
                isResearchLoading={isResearchLoading && selectedSymbolForResearch === coin.symbol}
              />
            ))}
          </div>
        ) : (
          <CoinTable
            coins={filteredAndSortedCoins}
            onOpenResearch={(sym) => runDeepResearch(sym)}
            onOpenTradeModal={handleOpenTradeModal}
            watchlist={watchlist}
            onToggleWatchlist={toggleWatchlist}
          />
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-4 text-xs text-zinc-600 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Bybit Linear Perpetuals Live (760+ Coins) • Automated TP/SL Engine • Gemini 3.8 Flash AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Last sync: {new Date(lastMarketUpdate).toLocaleTimeString()}</span>
            <span>•</span>
            <span>Audio Alerts: {config.soundEnabled ? 'Enabled' : 'Muted'}</span>
          </div>
        </div>
      </footer>

      {/* Trade Setup (TP / Entry / SL) Modal */}
      <TradeSetupModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        symbol={selectedSymbolForTrade}
        coin={selectedSymbolForTrade ? coinsMap.get(selectedSymbolForTrade) : undefined}
        initialDirection={tradeModalDirection}
        onOpenResearch={(sym) => runDeepResearch(sym)}
      />

      {/* Deep Research Modal */}
      <DeepResearchModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        report={currentReport}
        coin={selectedCoin}
        isLoading={isResearchLoading}
        onRefreshResearch={() => {
          if (selectedSymbolForResearch) {
            runDeepResearch(selectedSymbolForResearch, true);
          }
        }}
      />

      {/* Alerts History Drawer */}
      <AlertsHistoryDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onOpenResearch={(sym) => runDeepResearch(sym)}
        onClearAlerts={() => setAlerts([])}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onChangeConfig={updateConfig}
        onTestSound={() => playSurgeAlertSound(0.6)}
      />
    </div>
  );
}
