import { TrendingUp, TrendingDown, Zap, Sparkles, Star, Target, ExternalLink } from 'lucide-react';
import React from 'react';
import { CryptoCoin } from '../types';
import { Sparkline } from './Sparkline';

interface CoinCardProps {
  key?: React.Key;
  coin: CryptoCoin;
  onOpenResearch: (symbol: string) => void;
  onOpenTradeModal?: (symbol: string, direction?: 'LONG' | 'SHORT') => void;
  onSelectForTrade?: (symbol: string) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  isResearchLoading?: boolean;
}

export function CoinCard({
  coin,
  onOpenResearch,
  onOpenTradeModal,
  onSelectForTrade,
  isWatchlisted,
  onToggleWatchlist,
  isResearchLoading = false,
}: CoinCardProps) {
  const isSurging = coin.isSurging || coin.change5m >= 2.0;
  const isBullish = coin.change1h >= 0;
  const isPerfectTrade =
    !['STOCK', 'SOXL', 'NVDA', 'TSLA', 'AAPL'].some((s) => coin.symbol.includes(s)) &&
    (coin.turnover24h || coin.volume24h) >= 8_000_000 &&
    (coin.surgeScore >= 50 || ['BTC', 'ETH', 'SOL', 'XRP', 'SUI', 'DOGE', 'AKE'].includes(coin.symbol) || Math.abs(coin.change1h) >= 2.0);

  const stageLabels: Record<string, { label: string; color: string; border: string }> = {
    breakout: { label: 'Breakout', color: 'bg-emerald-950 text-emerald-300', border: 'border-emerald-700/60' },
    accelerating: { label: 'Accelerating', color: 'bg-amber-950 text-amber-300', border: 'border-amber-700/60' },
    parabolic: { label: 'Parabolic Spike', color: 'bg-purple-950 text-purple-300', border: 'border-purple-700/60' },
    cooling: { label: 'Cooling Retest', color: 'bg-zinc-800 text-zinc-400', border: 'border-zinc-700' },
  };

  const currentStage = stageLabels[coin.surgeStage] || stageLabels.breakout;
  const bybitPair = coin.bybitSymbol || `${coin.symbol}USDT`;
  const turnoverDisplay = coin.turnover24h >= 1e9
    ? `$${(coin.turnover24h / 1e9).toFixed(2)}B`
    : `$${(coin.turnover24h / 1e6).toFixed(1)}M`;

  return (
    <div
      className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 ${
        isSurging
          ? 'bg-zinc-900/95 border-emerald-500/50 shadow-lg shadow-emerald-950/30 hover:border-emerald-400'
          : 'bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700'
      }`}
    >
      {/* Top row: Identity & Watchlist */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-zinc-100 tracking-tight">
                  {coin.symbol}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                  {bybitPair}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  isBullish
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                }`}>
                  {isBullish ? 'LONG' : 'SHORT'}
                </span>
                {isPerfectTrade && (
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5 shadow-2xs"
                    title="Qualifies as Bybit Perfect Trade setup"
                  >
                    <Target className="w-2.5 h-2.5 text-amber-400" />
                    Perfect Trade
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[130px]">
                {coin.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isSurging && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-0.5 ${currentStage.color} ${currentStage.border}`}
              >
                <Zap className="w-2.5 h-2.5" />
                {currentStage.label}
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleWatchlist(coin.symbol)}
              className="p-1 rounded-md text-zinc-500 hover:text-amber-400 transition-colors"
              title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
              aria-label="Toggle watchlist"
            >
              <Star
                className={`w-4 h-4 ${
                  isWatchlisted ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Price & Primary Velocity Badge */}
        <div className="flex items-baseline justify-between mb-2.5">
          <div>
            <div className="text-lg font-bold text-zinc-100 font-mono tracking-tight">
              ${coin.price < 0.0001 ? coin.price.toFixed(7) : coin.price < 1 ? coin.price.toFixed(5) : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
              <span>Bybit Turn: {turnoverDisplay}</span>
              {coin.fundingRate !== undefined && (
                <>
                  <span>•</span>
                  <span className={coin.fundingRate >= 0 ? 'text-zinc-400' : 'text-rose-400'}>
                    FR: {(coin.fundingRate * 100).toFixed(4)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 5-minute surge indicator badge */}
          <div
            className={`flex flex-col items-end px-2 py-0.5 rounded-lg border ${
              coin.change5m >= 0
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-0.5 text-xs font-bold font-mono">
              {coin.change5m >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{coin.change5m >= 0 ? '+' : ''}{coin.change5m.toFixed(1)}%</span>
            </div>
            <span className="text-[8px] text-zinc-400 font-medium">5m</span>
          </div>
        </div>

        {/* Sparkline chart & surge score */}
        <div className="flex items-center justify-between py-1.5 border-y border-zinc-800/80 mb-2.5">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
              Momentum Score
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-black ${coin.surgeScore > 75 ? 'text-emerald-400' : coin.surgeScore > 45 ? 'text-amber-400' : 'text-zinc-300'}`}>
                {coin.surgeScore}
              </span>
              <span className="text-[9px] text-zinc-500">/ 100</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <Sparkline
              data={coin.sparkline}
              width={100}
              height={28}
              isPositive={coin.change24h >= 0}
            />
          </div>
        </div>

        {/* Multi-Timeframe Matrix */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
          <div className="p-1 rounded-md bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[9px] text-zinc-500 block">1h</span>
            <span className={`text-xs font-semibold font-mono ${coin.change1h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {coin.change1h >= 0 ? '+' : ''}{coin.change1h.toFixed(1)}%
            </span>
          </div>

          <div className="p-1 rounded-md bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[9px] text-zinc-500 block">24h</span>
            <span className={`text-xs font-semibold font-mono ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
            </span>
          </div>

          <div className="p-1 rounded-md bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[9px] text-zinc-500 block">Spike</span>
            <span className={`text-xs font-semibold font-mono ${coin.volumeSpikeMultiplier >= 2.0 ? 'text-amber-400' : 'text-zinc-300'}`}>
              {coin.volumeSpikeMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* Actions: 1. Go For This Coin (Sets as active live trade) 2. TP/SL Plan 3. AI */}
      <div className="flex items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => onSelectForTrade?.(coin.symbol)}
          className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold tracking-wide flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-xs"
          title={`Select ${coin.symbol} as the active live Bybit trade`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Go For This</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenTradeModal?.(coin.symbol, isBullish ? 'LONG' : 'SHORT')}
          className="py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
          title={`Set custom TP, Entry, and SL for ${coin.symbol}`}
        >
          <span>TP/SL</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenResearch(coin.symbol)}
          disabled={isResearchLoading}
          className="py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 bg-zinc-850 hover:bg-zinc-800 text-purple-300 border border-purple-900/40 transition-colors"
          title="Gemini AI Deep Research"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </div>
    </div>
  );
}
