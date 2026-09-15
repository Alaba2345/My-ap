import { Sparkles, Star, TrendingUp, TrendingDown, Zap, ArrowUpRight } from 'lucide-react';
import { CryptoCoin } from '../types';
import { Sparkline } from './Sparkline';

interface CoinTableProps {
  coins: CryptoCoin[];
  onOpenResearch: (symbol: string) => void;
  watchlist: Set<string>;
  onToggleWatchlist: (symbol: string) => void;
}

export function CoinTable({
  coins,
  onOpenResearch,
  watchlist,
  onToggleWatchlist,
}: CoinTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider">
          <tr>
            <th className="py-3 px-3 w-10 text-center">★</th>
            <th className="py-3 px-3">Coin</th>
            <th className="py-3 px-3">Price</th>
            <th className="py-3 px-3 text-right">5m Surge</th>
            <th className="py-3 px-3 text-right">1h Change</th>
            <th className="py-3 px-3 text-right">24h Change</th>
            <th className="py-3 px-3 text-right">Volume (24h)</th>
            <th className="py-3 px-3 text-center">Vol Multiplier</th>
            <th className="py-3 px-3 text-center w-28">24h Trend</th>
            <th className="py-3 px-3 text-center">Surge Score</th>
            <th className="py-3 px-3 text-right">AI Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {coins.map((coin) => {
            const isWatchlisted = watchlist.has(coin.symbol);
            const isSurging = coin.isSurging || coin.change5m >= 2.0;

            return (
              <tr
                key={coin.id}
                className={`transition-colors hover:bg-zinc-800/40 ${
                  isSurging ? 'bg-emerald-950/20' : ''
                }`}
              >
                {/* Watchlist star */}
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleWatchlist(coin.symbol)}
                    className="text-zinc-600 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 mx-auto ${
                        isWatchlisted ? 'text-amber-400 fill-amber-400' : ''
                      }`}
                    />
                  </button>
                </td>

                {/* Coin Info */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-100">{coin.symbol}</span>
                        {isSurging && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                            Breakout
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 truncate max-w-[110px]">
                        {coin.name}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3 px-3 font-semibold text-zinc-100">
                  ${coin.price < 1 ? coin.price.toFixed(5) : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>

                {/* 5m Surge Rate */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs ${
                      coin.change5m >= 2.0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                        : coin.change5m >= 0
                        ? 'text-emerald-400'
                        : 'text-zinc-500'
                    }`}
                  >
                    {coin.change5m >= 0 ? '+' : ''}{coin.change5m.toFixed(1)}%
                  </span>
                </td>

                {/* 1h Change */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={`font-medium ${
                      coin.change1h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {coin.change1h >= 0 ? '+' : ''}{coin.change1h.toFixed(1)}%
                  </span>
                </td>

                {/* 24h Change */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={`font-semibold ${
                      coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                  </span>
                </td>

                {/* 24h Volume */}
                <td className="py-3 px-3 text-right font-medium text-zinc-300">
                  ${(coin.volume24h / 1_000_000).toFixed(1)}M
                </td>

                {/* Vol Multiplier */}
                <td className="py-3 px-3 text-center">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      coin.volumeSpikeMultiplier >= 2.5
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'text-zinc-400'
                    }`}
                  >
                    {coin.volumeSpikeMultiplier.toFixed(1)}x
                  </span>
                </td>

                {/* Sparkline */}
                <td className="py-2 px-3 text-center">
                  <div className="flex justify-center">
                    <Sparkline
                      data={coin.sparkline}
                      width={90}
                      height={24}
                      isPositive={coin.change24h >= 0}
                    />
                  </div>
                </td>

                {/* Surge Momentum Score */}
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-block font-black text-xs px-2 py-0.5 rounded ${
                      coin.surgeScore >= 75
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : coin.surgeScore >= 45
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {coin.surgeScore}
                  </span>
                </td>

                {/* Deep Research CTA */}
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => onOpenResearch(coin.symbol)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-emerald-600 hover:text-zinc-950 text-zinc-200 text-[11px] font-bold transition-colors border border-zinc-700 hover:border-emerald-500"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Research</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
