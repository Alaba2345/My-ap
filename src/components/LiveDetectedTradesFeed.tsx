import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Target,
  Clock,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DetectedTradeSignal } from '../types';
import { playSurgeAlertSound } from '../utils/audioAlert';

interface LiveDetectedTradesFeedProps {
  onSelectCoinForTrade: (symbol: string) => void;
  onOpenTradeModal: (coin: any, direction?: 'LONG' | 'SHORT') => void;
  onOpenResearch: (symbol: string) => void;
  soundEnabled?: boolean;
}

function fmtPrice(val: number | undefined): string {
  if (val === undefined || isNaN(val)) return '0.00';
  if (val < 0.0001) return val.toFixed(7);
  if (val < 1) return val.toFixed(5);
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export function LiveDetectedTradesFeed({
  onSelectCoinForTrade,
  onOpenTradeModal,
  onOpenResearch,
  soundEnabled = true,
}: LiveDetectedTradesFeedProps) {
  const [signals, setSignals] = useState<DetectedTradeSignal[]>([]);
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [latestDetectedAlert, setLatestDetectedAlert] = useState<DetectedTradeSignal | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());
  const [audioMuted, setAudioMuted] = useState<boolean>(!soundEnabled);
  const seenSymbolsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef<boolean>(true);

  // Poll detected trades feed every 3.5 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchDetectedTrades = async () => {
      try {
        const res = await fetch('/api/crypto/detected-trades');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.success || !Array.isArray(data.signals)) return;

        const newSignals: DetectedTradeSignal[] = data.signals;
        setSignals(newSignals);
        setLastRefreshedAt(Date.now());

        // Check if any fresh symbol appeared that wasn't previously detected
        if (newSignals.length > 0) {
          const newest = newSignals[0];
          if (!seenSymbolsRef.current.has(newest.symbol)) {
            seenSymbolsRef.current.add(newest.symbol);
            if (!initialLoadRef.current) {
              setLatestDetectedAlert(newest);
              if (!audioMuted) {
                playSurgeAlertSound(0.75);
              }
            }
          }
          newSignals.forEach((s) => seenSymbolsRef.current.add(s.symbol));
        }
        initialLoadRef.current = false;
      } catch (err) {
        console.warn('Live detected trades polling error:', err);
      }
    };

    fetchDetectedTrades();
    const interval = setInterval(fetchDetectedTrades, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [audioMuted]);

  // Auto dismiss top alert after 9 seconds
  useEffect(() => {
    if (latestDetectedAlert) {
      const timer = setTimeout(() => setLatestDetectedAlert(null), 9000);
      return () => clearTimeout(timer);
    }
  }, [latestDetectedAlert]);

  // Copy signal trade parameters
  const handleCopySignal = (signal: DetectedTradeSignal, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `--- BYBIT DETECTED TRADE SIGNAL ---
Pair: ${signal.bybitSymbol}
Direction: ${signal.direction} (${signal.setupType})
Trigger: ${signal.detectedReason}
Recommended Entry: $${fmtPrice(signal.entryZone.recommended)}
Entry Range: $${fmtPrice(signal.entryZone.min)} - $${fmtPrice(signal.entryZone.max)}
TP1: $${fmtPrice(signal.targets.tp1.price)} (+${signal.targets.tp1.gainPercent}%)
TP2: $${fmtPrice(signal.targets.tp2.price)} (+${signal.targets.tp2.gainPercent}%)
TP3: $${fmtPrice(signal.targets.tp3.price)} (+${signal.targets.tp3.gainPercent}%)
Stop Loss: $${fmtPrice(signal.stopLoss.price)} (-${signal.stopLoss.lossPercent}%)
Risk/Reward: 1:${signal.riskRewardRatio} | Leverage: ${signal.recommendedLeverage}
Detected At: ${new Date(signal.detectedAt).toLocaleTimeString()}`;

    navigator.clipboard.writeText(text);
    setCopiedId(signal.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredSignals = signals.filter((s) => {
    if (directionFilter === 'ALL') return true;
    return s.direction === directionFilter;
  });

  return (
    <section
      id="live-detected-coins-section"
      className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 sm:p-5 shadow-xl relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-100 tracking-tight flex items-center gap-1.5">
                LIVE DETECTED COINS TO TRADE
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Auto-Streaming
                </span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <span>Instantly surfaces coins ready to execute as soon as Bybit orderflow breakout is detected</span>
            </p>
          </div>
        </div>

        {/* Controls: Filter & Sound */}
        <div className="flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setDirectionFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                directionFilter === 'ALL' ? 'bg-zinc-800 text-zinc-100 shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({signals.length})
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('LONG')}
              className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                directionFilter === 'LONG' ? 'bg-emerald-600 text-zinc-950 font-bold shadow-xs' : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              Long ({signals.filter((s) => s.direction === 'LONG').length})
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('SHORT')}
              className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                directionFilter === 'SHORT' ? 'bg-rose-600 text-zinc-950 font-bold shadow-xs' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <ArrowDownRight className="w-3 h-3" />
              Short ({signals.filter((s) => s.direction === 'SHORT').length})
            </button>
          </div>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setAudioMuted(!audioMuted)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              !audioMuted
                ? 'bg-zinc-900 border-zinc-700 text-emerald-400 hover:bg-zinc-800'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title={!audioMuted ? 'Chime on new detection enabled' : 'Chime muted'}
          >
            {!audioMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Flash Banner for newest detection */}
      {latestDetectedAlert && (
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-amber-950/80 border border-emerald-500/70 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400 font-extrabold uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  NEW COIN DETECTED TO TRADE:
                </span>
                <span className="text-emerald-300 font-black text-sm">{latestDetectedAlert.symbol}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                    latestDetectedAlert.direction === 'LONG'
                      ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-600'
                      : 'bg-rose-900/90 text-rose-200 border border-rose-600'
                  }`}
                >
                  {latestDetectedAlert.direction}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                {latestDetectedAlert.detectedReason} • Entry: ${fmtPrice(latestDetectedAlert.entryZone.recommended)} • TP1: ${fmtPrice(latestDetectedAlert.targets.tp1.price)} (+{latestDetectedAlert.targets.tp1.gainPercent}%) • SL: ${fmtPrice(latestDetectedAlert.stopLoss.price)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectCoinForTrade(latestDetectedAlert.symbol)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-950/40"
            >
              <Zap className="w-3.5 h-3.5 fill-zinc-950" />
              <span>Trade This Coin</span>
            </button>
            <button
              type="button"
              onClick={() => setLatestDetectedAlert(null)}
              className="px-2 py-1 rounded text-zinc-400 hover:text-zinc-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Detected Signals Cards Grid */}
      <div className="mt-3.5">
        {filteredSignals.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            <Radio className="w-6 h-6 mx-auto mb-2 text-zinc-600 animate-pulse" />
            <span>Scanning all Bybit linear perpetual orderbooks for fresh breakouts...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredSignals.map((signal, idx) => {
              const isLong = signal.direction === 'LONG';
              const isCopied = copiedId === signal.id;
              const isTopPick = idx === 0;

              return (
                <div
                  key={signal.id}
                  onClick={() => onSelectCoinForTrade(signal.symbol)}
                  className={`group relative rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                    isTopPick
                      ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-emerald-500/50 shadow-md shadow-emerald-950/20 hover:border-emerald-400'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* Top card row: Symbol, Direction, & Copy */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                              {signal.symbol}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">
                              {signal.bybitSymbol}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-zinc-300 font-mono">
                            ${fmtPrice(signal.currentPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-0.5 ${
                            isLong
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : 'bg-rose-950 text-rose-300 border border-rose-700/60'
                          }`}
                        >
                          {isLong ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {signal.direction}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopySignal(signal, e)}
                          className="p-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
                          title="Copy Bybit trade signal parameters"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Trigger reason badge */}
                    <div className="mt-2 text-[11px] font-medium text-amber-300/90 flex items-center gap-1 bg-amber-950/30 border border-amber-800/40 px-2 py-0.5 rounded-md">
                      <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{signal.detectedReason}</span>
                    </div>

                    {/* Trade Levels: Entry, TP1, TP2, SL */}
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-[11px]">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider block font-semibold">Entry</span>
                        <span className="text-zinc-200 font-mono font-bold">${fmtPrice(signal.entryZone.recommended)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-500 uppercase tracking-wider block font-semibold">TP 1</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          +{signal.targets.tp1.gainPercent}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-rose-500 uppercase tracking-wider block font-semibold">Stop Loss</span>
                        <span className="text-rose-400 font-mono font-bold">
                          -{signal.stopLoss.lossPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Stats footer: R:R and Confidence */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Target className="w-3 h-3 text-zinc-500" />
                        R:R <strong>1:{signal.riskRewardRatio}</strong>
                      </span>
                      <span>
                        Confidence: <strong className="text-emerald-400">{signal.confidenceScore}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCoinForTrade(signal.symbol);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 border border-emerald-500/30 hover:border-emerald-500"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Trade This</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTradeModal(
                          {
                            symbol: signal.symbol,
                            name: signal.name,
                            bybitSymbol: signal.bybitSymbol,
                            price: signal.currentPrice,
                            change1h: signal.change1h,
                            change5m: signal.change5m,
                            change24h: 0,
                            turnover24h: signal.turnover24h,
                            volume24h: signal.turnover24h,
                            volumeSpikeMultiplier: signal.volumeSpikeMultiplier,
                          },
                          signal.direction
                        );
                      }}
                      className="py-1 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
                      title="Open Order Modal"
                    >
                      Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
