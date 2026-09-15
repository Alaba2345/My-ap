import { Sparkles, Star, TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';
import { CryptoCoin } from '../types';
import { Sparkline } from './Sparkline';

interface CoinTableProps {
  coins: CryptoCoin[];
  onOpenResearch: (symbol: string) => void;
  onOpenTradeModal?: (symbol: string, direction?: 'LONG' | 'SHORT') => void;
  watchlist: Set<string>;
  onToggleWatchlist: (symbol: string) => void;
}

export function CoinTable({
  coins,
  onOpenResearch,
  onOpenTradeModal,
  watchlist,
  onToggleWatchlist,
}: CoinTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider">
          <tr>
            <th className="py-3 px-3 w-10 text-center">★</th>
            <th className="py-3 px-3">Bybit Pair</th>
            <th className="py-3 px-3">Mark Price</th>
            <th className="py-3 px-3 text-center">Signal</th>
            <th className="py-3 px-3 text-right">5m Surge</th>
            <th className="py-3 px-3 text-right">1h Change</th>
            <th className="py-3 px-3 text-right">24h Change</th>
            <th className="py-3 px-3 text-right">24h Turnover</th>
            <th className="py-3 px-3 text-right">Funding</th>
            <th className="py-3 px-3 text-center w-24">Trend</th>
            <th className="py-3 px-3 text-right">Trade Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {coins.map((coin) => {
            const isWatchlisted = watchlist.has(coin.symbol);
            const isSurging = coin.isSurging || coin.change5m >= 2.0;
            const isBullish = coin.change1h >= 0;
            const isPerfectTrade =
              !['STOCK', 'SOXL', 'NVDA', 'TSLA', 'AAPL'].some((s) => coin.symbol.includes(s)) &&
              (coin.turnover24h || coin.volume24h) >= 8_000_000 &&
              (coin.surgeScore >= 50 || ['BTC', 'ETH', 'SOL', 'XRP', 'SUI', 'DOGE', 'AKE'].includes(coin.symbol) || Math.abs(coin.change1h) >= 2.0);
            const bybitPair = coin.bybitSymbol || `${coin.symbol}USDT`;
            const turnoverDisplay = coin.turnover24h >= 1e9
              ? `$${(coin.turnover24h / 1e9).toFixed(2)}B`
              : `$${(coin.turnover24h / 1e6).toFixed(1)}M`;

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
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1 rounded">
                          {bybitPair}
                        </span>
                        {isSurging && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                            Breakout
                          </span>
                        )}
                        {isPerfectTrade && (
                          <span
                            className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5"
                            title="Qualifies as Bybit Perfect Trade setup"
                          >
                            <Target className="w-2.5 h-2.5 text-amber-400" />
                            Perfect Trade
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 truncate max-w-[120px]">
                        {coin.name}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3 px-3 font-semibold text-zinc-100 font-mono">
                  ${coin.price < 0.0001 ? coin.price.toFixed(7) : coin.price < 1 ? coin.price.toFixed(5) : coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </td>

                {/* Signal Badge */}
                <td className="py-3 px-3 text-center">
                  <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                    isBullish
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                      : 'bg-rose-950 text-rose-400 border-rose-800/60'
                  }`}>
                    {isBullish ? 'LONG' : 'SHORT'}
                  </span>
                </td>

                {/* 5m Surge Rate */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs font-mono ${
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
                    className={`font-semibold font-mono ${
                      coin.change1h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {coin.change1h >= 0 ? '+' : ''}{coin.change1h.toFixed(1)}%
                  </span>
                </td>

                {/* 24h Change */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={`font-semibold font-mono ${
                      coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                  </span>
                </td>

                {/* 24h Bybit Turnover */}
                <td className="py-3 px-3 text-right font-medium text-zinc-300 font-mono">
                  {turnoverDisplay}
                </td>

                {/* Funding Rate */}
                <td className="py-3 px-3 text-right font-mono text-[11px] text-zinc-400">
                  {coin.fundingRate !== undefined ? `${(coin.fundingRate * 100).toFixed(4)}%` : '0.01%'}
                </td>

                {/* Sparkline */}
                <td className="py-2 px-3 text-center">
                  <div className="flex justify-center">
                    <Sparkline
                      data={coin.sparkline}
                      width={80}
                      height={22}
                      isPositive={coin.change24h >= 0}
                    />
                  </div>
                </td>

                {/* Actions: TP/SL & AI */}
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenTradeModal?.(coin.symbol, isBullish ? 'LONG' : 'SHORT')}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-[11px] font-bold transition-all shadow-xs"
                      title="Set TP, Entry, and SL"
                    >
                      <Target className="w-3 h-3" />
                      <span>TP/SL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenResearch(coin.symbol)}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-purple-300 text-[11px] transition-colors border border-zinc-700"
                      title="AI Research"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
