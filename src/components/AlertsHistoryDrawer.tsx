import { X, Sparkles, TrendingUp, Clock, Zap, Trash2 } from 'lucide-react';
import { SurgeAlert } from '../types';

interface AlertsHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SurgeAlert[];
  onOpenResearch: (symbol: string) => void;
  onClearAlerts: () => void;
}

export function AlertsHistoryDrawer({
  isOpen,
  onClose,
  alerts,
  onOpenResearch,
  onClearAlerts,
}: AlertsHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">
              Breakout Alerts Log
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              {alerts.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {alerts.length > 0 && (
              <button
                type="button"
                onClick={onClearAlerts}
                className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                title="Clear alerts log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs">
              <Zap className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
              <p className="font-medium text-zinc-400">No alerts triggered yet</p>
              <p className="mt-1">The radar is actively scanning for coins running up.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const minutesAgo = Math.max(0, Math.floor((Date.now() - alert.detectedAt) / 60000));
              const timeString =
                minutesAgo < 1
                  ? 'Just now'
                  : minutesAgo < 60
                  ? `${minutesAgo}m ago`
                  : new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-zinc-100">
                          {alert.symbol}
                        </span>
                        <span className="text-xs text-zinc-400 truncate max-w-[120px]">
                          {alert.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeString}
                        </span>
                        <span>•</span>
                        <span>Trigger: ${alert.initialPrice < 1 ? alert.initialPrice.toFixed(4) : alert.initialPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <TrendingUp className="w-3 h-3" />
                        +{alert.surgePercent.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">
                        Peak Gain: +{alert.peakGainPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {alert.aiSummarySnippet && (
                    <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 leading-snug flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{alert.aiSummarySnippet}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-medium text-amber-400 bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-800/40">
                      ⚡ {alert.volumeMultiplier}x Volume
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenResearch(alert.symbol);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-emerald-600 hover:text-zinc-950 text-zinc-200 text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Deep Research</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
