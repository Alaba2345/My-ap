import { Volume2, VolumeX, Bell, BellOff, Settings, History, Sparkles, Activity } from 'lucide-react';
import { ScannerConfig } from '../types';

interface HeaderProps {
  config: ScannerConfig;
  onChangeConfig: (newConfig: Partial<ScannerConfig>) => void;
  activeSurgesCount: number;
  totalCoinsCount: number;
  alertsCount: number;
  onOpenAlertsHistory: () => void;
  onOpenSettings: () => void;
  onTestSound: () => void;
}

export function Header({
  config,
  onChangeConfig,
  activeSurgesCount,
  totalCoinsCount,
  alertsCount,
  onOpenAlertsHistory,
  onOpenSettings,
  onTestSound,
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Live status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                Bybit Crypto Radar
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase tracking-wider">
                  Bybit 760+ Linear Pairs
                </span>
              </h1>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <span>Automated TP / SL Analysis</span>
              <span className="inline-block w-1 h-1 rounded-full bg-zinc-700" />
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Sparkles className="w-3 h-3" /> Real-Time Perfect Trade Selection
              </span>
            </p>
          </div>
        </div>

        {/* Real-time stats & controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Surges Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <span className="text-zinc-500">Bybit Pairs:</span>
            <span className="font-bold text-zinc-200">{totalCoinsCount > 0 ? totalCoinsCount : '760+'}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500">Active Surges:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded ${activeSurgesCount > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'text-zinc-400'}`}>
              {activeSurgesCount}
            </span>
          </div>

          {/* Auto Research Toggle */}
          <button
            type="button"
            onClick={() => onChangeConfig({ autoResearch: !config.autoResearch })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              config.autoResearch
                ? 'bg-purple-950/70 text-purple-200 border-purple-700/60 shadow-xs shadow-purple-900/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
            title="Automatically run Gemini Deep Research immediately when any coin starts running up"
          >
            <Sparkles className={`w-3.5 h-3.5 ${config.autoResearch ? 'text-purple-400 animate-spin-slow' : 'text-zinc-500'}`} />
            <span>Auto AI Research</span>
            <span className={`w-2 h-2 rounded-full ${config.autoResearch ? 'bg-purple-400' : 'bg-zinc-600'}`} />
          </button>

          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !config.soundEnabled;
              onChangeConfig({ soundEnabled: next });
              if (next) onTestSound();
            }}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              config.soundEnabled
                ? 'bg-zinc-900 border-zinc-700 text-emerald-400 hover:bg-zinc-800'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={config.soundEnabled ? 'Sound alert enabled (Click to mute)' : 'Sound muted (Click to unmute)'}
            aria-label="Toggle sound alerts"
          >
            {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications Toggle */}
          <button
            type="button"
            onClick={() => onChangeConfig({ notificationsEnabled: !config.notificationsEnabled })}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              config.notificationsEnabled
                ? 'bg-zinc-900 border-zinc-700 text-amber-400 hover:bg-zinc-800'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={config.notificationsEnabled ? 'Desktop notifications on' : 'Enable desktop notifications'}
            aria-label="Toggle notifications"
          >
            {config.notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          {/* Alerts History Drawer Button */}
          <button
            type="button"
            onClick={onOpenAlertsHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>Alerts</span>
            {alertsCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Scanner and Alert Settings"
            aria-label="Scanner settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
