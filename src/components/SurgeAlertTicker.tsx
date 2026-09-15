import { Zap, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { SurgeAlert, CryptoCoin } from '../types';

interface SurgeAlertTickerProps {
  alerts: SurgeAlert[];
  onSelectCoinForResearch: (symbol: string) => void;
  coinsMap: Map<string, CryptoCoin>;
}

export function SurgeAlertTicker({ alerts, onSelectCoinForResearch, coinsMap }: SurgeAlertTickerProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-zinc-900/70 border-b border-zinc-800/80 px-4 py-2 text-xs text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-zinc-300">Radar Scanning Active:</span>
          <span>Monitoring real-time order flow & velocity spikes across all tracked pairs.</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-zinc-500 text-[11px]">
          <span>Sensitivity: 5m &gt; 2.5%</span>
          <span>Volume Spurt: &gt; 2.0x</span>
        </div>
      </div>
    );
  }

  // Display the top 3 most recent active alerts
  const displayAlerts = alerts.slice(0, 3);

  return (
    <div className="bg-emerald-950/40 border-b border-emerald-800/50 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 font-extrabold text-[11px] tracking-wide uppercase flex items-center gap-1 shadow-xs shadow-emerald-500/50">
            <Zap className="w-3 h-3 fill-zinc-950" /> Breakout Detected
          </span>
          <span className="text-xs text-emerald-300/80 hidden sm:inline">
            Sudden velocity surge detected in orderbook:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {displayAlerts.map((alert) => {
            const coin = coinsMap.get(alert.symbol);
            const currentPrice = coin ? coin.price : alert.currentPrice;
            const surgeGain = alert.surgePercent;

            return (
              <div
                key={alert.id}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-emerald-500/40 hover:border-emerald-400 text-xs transition-all shrink-0 group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                    {alert.symbol}
                  </span>
                  <span className="text-zinc-400 text-[11px]">
                    ${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <TrendingUp className="w-3 h-3" />
                  +{surgeGain.toFixed(1)}% (5m)
                </span>

                {alert.volumeMultiplier >= 2.0 && (
                  <span className="hidden lg:inline text-[10px] text-amber-300 font-semibold px-1 rounded bg-amber-950/60 border border-amber-800/50">
                    {alert.volumeMultiplier}x Vol
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => onSelectCoinForResearch(alert.symbol)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-[10px] tracking-wide uppercase transition-colors shadow-xs"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Deep Research
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
