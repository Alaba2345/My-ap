import { TrendingUp, TrendingDown, Zap, Sparkles, Star, ArrowUpRight } from 'lucide-react';
import React from 'react';
import { CryptoCoin } from '../types';
import { Sparkline } from './Sparkline';

interface CoinCardProps {
  key?: React.Key;
  coin: CryptoCoin;
  onOpenResearch: (symbol: string) => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  isResearchLoading?: boolean;
}

export function CoinCard({
  coin,
  onOpenResearch,
  isWatchlisted,
  onToggleWatchlist,
  isResearchLoading = false,
}: CoinCardProps) {
  const isSurging = coin.isSurging || coin.change5m >= 2.0;

  const stageLabels: Record<string, { label: string; color: string; border: string }> = {
    breakout: { label: 'Breakout', color: 'bg-emerald-950 text-emerald-300', border: 'border-emerald-700/60' },
    accelerating: { label: 'Accelerating', color: 'bg-amber-950 text-amber-300', border: 'border-amber-700/60' },
    parabolic: { label: 'Parabolic Spike', color: 'bg-purple-950 text-purple-300', border: 'border-purple-700/60' },
    cooling: { label: 'Cooling Retest', color: 'bg-zinc-800 text-zinc-400', border: 'border-zinc-700' },
  };

  const currentStage = stageLabels[coin.surgeStage] || stageLabels.breakout;

  return (
    <div
      className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
        isSurging
          ? 'bg-zinc-900/95 border-emerald-500/50 shadow-lg shadow-emerald-950/30 hover:border-emerald-400'
          : 'bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700'
      }`}
    >
      {/* Top row: Identity & Watchlist */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-zinc-100 tracking-tight">
                  {coin.symbol}
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase">
                  {coin.marketCapTier}
                </span>
              </div>
              <span className="text-xs text-zinc-400 font-medium truncate max-w-[130px]">
                {coin.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isSurging && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${currentStage.color} ${currentStage.border}`}
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
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-xl font-bold text-zinc-100 tracking-tight">
              ${coin.price < 1 ? coin.price.toFixed(5) : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
            <div className="text-[11px] text-zinc-500">
              24h Vol: ${(coin.volume24h / 1_000_000).toFixed(1)}M
            </div>
          </div>

          {/* 5-minute surge indicator badge */}
          <div
            className={`flex flex-col items-end px-2.5 py-1 rounded-lg border ${
              coin.change5m >= 0
                ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
            }`}
          >
            <div className="flex items-center gap-0.5 text-xs font-bold">
              {coin.change5m >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{coin.change5m >= 0 ? '+' : ''}{coin.change5m.toFixed(1)}%</span>
            </div>
            <span className="text-[9px] text-zinc-400 font-medium">5m Velocity</span>
          </div>
        </div>

        {/* Sparkline chart & surge score */}
        <div className="flex items-center justify-between py-2 border-y border-zinc-800/80 mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Surge Score
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-base font-black ${coin.surgeScore > 75 ? 'text-emerald-400' : coin.surgeScore > 45 ? 'text-amber-400' : 'text-zinc-300'}`}>
                {coin.surgeScore}
              </span>
              <span className="text-[10px] text-zinc-500">/ 100</span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <Sparkline
              data={coin.sparkline}
              width={110}
              height={32}
              isPositive={coin.change24h >= 0}
            />
          </div>
        </div>

        {/* Multi-Timeframe Matrix */}
        <div className="grid grid-cols-3 gap-2 mb-3.5 text-center">
          <div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">1h</span>
            <span className={`text-xs font-semibold ${coin.change1h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {coin.change1h >= 0 ? '+' : ''}{coin.change1h.toFixed(1)}%
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">24h</span>
            <span className={`text-xs font-semibold ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
            </span>
          </div>

          <div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">Vol Spike</span>
            <span className={`text-xs font-semibold ${coin.volumeSpikeMultiplier >= 2.0 ? 'text-amber-400' : 'text-zinc-300'}`}>
              {coin.volumeSpikeMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* Action: Trigger Instant AI Deep Research */}
      <button
        type="button"
        onClick={() => onOpenResearch(coin.symbol)}
        disabled={isResearchLoading}
        className={`w-full py-2 px-3 rounded-lg text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all shadow-xs ${
          isSurging
            ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 shadow-emerald-900/30'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Deep Research Breakout</span>
        <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
      </button>
    </div>
  );
}
