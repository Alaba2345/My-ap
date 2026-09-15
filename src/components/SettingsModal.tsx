import { X, Sliders, Volume2, Sparkles, Bell, Check } from 'lucide-react';
import { ScannerConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScannerConfig;
  onChangeConfig: (newConfig: Partial<ScannerConfig>) => void;
  onTestSound: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onTestSound,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">
              Breakout Radar &amp; Alert Thresholds
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* 5-minute surge threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">
                Immediate 5-Minute Breakout Threshold
              </span>
              <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/60">
                +{config.min5mSurge}% in 5m
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={config.min5mSurge}
              onChange={(e) => onChangeConfig({ min5mSurge: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-zinc-500">
              Triggers an alert immediately when any coin accelerates faster than this rate in a 5-minute window.
            </p>
          </div>

          {/* 1-hour surge threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">
                1-Hour Momentum Threshold
              </span>
              <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/60">
                +{config.min1hSurge}% in 1h
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="20.0"
              step="1.0"
              value={config.min1hSurge}
              onChange={(e) => onChangeConfig({ min1hSurge: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Minimum 24h Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">
                Minimum 24h Volume Filter
              </span>
              <span className="font-bold text-zinc-300">
                ${(config.minVolume24h / 1_000_000).toFixed(1)}M USD
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[500_000, 1_000_000, 5_000_000, 15_000_000].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => onChangeConfig({ minVolume24h: vol })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    config.minVolume24h === vol
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  ${vol >= 1_000_000 ? `${vol / 1_000_000}M` : `${vol / 1_000}k`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500">
              Filters out illiquid low-volume microcaps to avoid false positive breakout alerts.
            </p>
          </div>

          {/* Toggles */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-3">
            {/* Auto AI Deep Research Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/20 border border-purple-900/40">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">
                    Auto Deep Research on Spike
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Automatically trigger Gemini to generate catalysts &amp; targets as soon as a surge begins.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.autoResearch}
                onChange={(e) => onChangeConfig({ autoResearch: e.target.checked })}
                className="w-4 h-4 accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Sound Alert Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">
                    Synthesizer Audio Chime
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Play futuristic dual-frequency audio ping when a surge triggers.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onTestSound}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  Test Sound
                </button>
                <input
                  type="checkbox"
                  checked={config.soundEnabled}
                  onChange={(e) => onChangeConfig({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Desktop Notifications */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">
                    Desktop Notifications
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Receive system breakout notifications even if this browser tab is in background.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.notificationsEnabled}
                onChange={(e) => onChangeConfig({ notificationsEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
