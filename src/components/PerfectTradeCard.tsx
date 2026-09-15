import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Calculator,
  Sparkles,
  TrendingUp,
  Activity,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TradeSetup, CryptoCoin } from '../types';

interface PerfectTradeCardProps {
  onOpenTradeModal: (symbol: string, direction?: 'LONG' | 'SHORT') => void;
  onOpenResearch: (symbol: string) => void;
}

export function PerfectTradeCard({
  onOpenTradeModal,
  onOpenResearch,
}: PerfectTradeCardProps) {
  const [trade, setTrade] = useState<TradeSetup | null>(null);
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);

  // Position sizing calculator state
  const [accountSize, setAccountSize] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(2.0); // 2% risk
  const [selectedLeverage, setSelectedLeverage] = useState<number>(5); // 5x leverage

  const fetchPerfectTrade = async (direction?: 'LONG' | 'SHORT', force = false) => {
    setIsLoading(true);
    try {
      const url = new URL('/api/crypto/perfect-trade', window.location.origin);
      if (direction) url.searchParams.set('direction', direction);
      if (force) url.searchParams.set('force', 'true');

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.trade) {
          setTrade(data.trade);
        }
      }
    } catch (err) {
      console.error('Failed to fetch perfect trade setup:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const dir = directionFilter === 'ALL' ? undefined : directionFilter;
    fetchPerfectTrade(dir);
  }, [directionFilter]);

  // Request AI institutional trade thesis
  const handleRequestAiThesis = async () => {
    if (!trade) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/crypto/trade-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: trade.symbol,
          bybitSymbol: trade.bybitSymbol,
          requestedDirection: trade.direction,
          useAi: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.trade) {
          setTrade(data.trade);
        }
      }
    } catch (err) {
      console.error('Failed to get AI thesis:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Copy Bybit Order Parameters to Clipboard
  const handleCopyOrder = () => {
    if (!trade) return;
    const format = (n: number) => n < 1 ? n.toFixed(5) : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

    const text = `--- BYBIT PERPETUAL TRADE SIGNAL ---
Pair: ${trade.bybitSymbol}
Action: ${trade.direction} (${trade.setupType})
Recommended Entry: $${format(trade.entryZone.recommended)}
Entry Range: $${format(trade.entryZone.min)} - $${format(trade.entryZone.max)}
------------------------------------
🎯 TAKE PROFIT TARGETS:
TP1: $${format(trade.targets.tp1.price)} (+${trade.targets.tp1.gainPercent}%) -> Close 50%, Move SL to Entry
TP2: $${format(trade.targets.tp2.price)} (+${trade.targets.tp2.gainPercent}%) -> Close 35%
TP3: $${format(trade.targets.tp3.price)} (+${trade.targets.tp3.gainPercent}%) -> Runner / Moonbag
------------------------------------
🛑 STOP LOSS (SL):
SL Price: $${format(trade.stopLoss.price)} (-${trade.stopLoss.lossPercent}%)
Invalidation: ${trade.stopLoss.invalidationReason}
Risk-to-Reward: 1:${trade.riskRewardRatio} | Recommended Leverage: ${trade.recommendedLeverage}
Generated: ${new Date(trade.generatedAt).toLocaleTimeString()}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Format price helper
  const fmt = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.0001) return val.toFixed(7);
    if (val < 1) return val.toFixed(5);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  // Sizing Calculations
  const calcData = useMemo(() => {
    if (!trade) return null;
    const maxRiskDollar = (accountSize * riskPercent) / 100;
    const lossPct = trade.stopLoss.lossPercent / 100;
    // Position size so that a stop out loses exactly maxRiskDollar
    const totalPositionSizeDollar = lossPct > 0 ? maxRiskDollar / lossPct : 0;
    const marginRequired = totalPositionSizeDollar / selectedLeverage;
    const coinUnits = trade.currentPrice > 0 ? totalPositionSizeDollar / trade.currentPrice : 0;

    const profitTP1Dollar = totalPositionSizeDollar * (trade.targets.tp1.gainPercent / 100);
    const profitTP2Dollar = totalPositionSizeDollar * (trade.targets.tp2.gainPercent / 100);
    const profitTP3Dollar = totalPositionSizeDollar * (trade.targets.tp3.gainPercent / 100);

    return {
      maxRiskDollar,
      totalPositionSizeDollar,
      marginRequired,
      coinUnits,
      profitTP1Dollar,
      profitTP2Dollar,
      profitTP3Dollar,
    };
  }, [trade, accountSize, riskPercent, selectedLeverage]);

  const isLong = trade?.direction === 'LONG';

  return (
    <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900/95 via-zinc-900/80 to-zinc-950 p-4 sm:p-5 shadow-xl shadow-emerald-950/20 overflow-hidden">
      {/* Background ambient accent */}
      <div className={`absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isLong ? 'bg-emerald-500' : 'bg-rose-500'
      }`} />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Target className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-100 tracking-tight flex items-center gap-1.5">
                PERFECT COIN TO TRADE
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 uppercase tracking-wider">
                  Bybit Linear #1 Pick
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-zinc-400">
              High-confluence momentum & volatility analysis across 760+ Bybit perpetual pairs
            </p>
          </div>
        </div>

        {/* Direction Filter Tabs & Re-analyze action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setDirectionFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                directionFilter === 'ALL'
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Best Pick
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('LONG')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                directionFilter === 'LONG'
                  ? 'bg-emerald-600 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-emerald-400'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Long Only</span>
            </button>
            <button
              type="button"
              onClick={() => setDirectionFilter('SHORT')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-colors ${
                directionFilter === 'SHORT'
                  ? 'bg-rose-600 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <ArrowDownRight className="w-3 h-3" />
              <span>Short Only</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const dir = directionFilter === 'ALL' ? undefined : directionFilter;
              fetchPerfectTrade(dir, true);
            }}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Scan Bybit Orderbooks Now"
            aria-label="Re-analyze Bybit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && !trade ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2 text-zinc-400">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-medium">Scanning 760+ Bybit orderbooks for prime institutional setup...</span>
        </div>
      ) : trade ? (
        <div className="mt-3.5 space-y-3.5">
          {/* Main Showcase Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            {/* Left: Coin identity & direction badge */}
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                isLong
                  ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-400'
                  : 'bg-rose-950/80 border-rose-600/60 text-rose-400'
              }`}>
                {isLong ? <ArrowUpRight className="w-6 h-6 stroke-[2.5]" /> : <ArrowDownRight className="w-6 h-6 stroke-[2.5]" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                    {trade.symbol}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {trade.bybitSymbol}
                  </span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wide border ${
                    isLong
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {trade.direction} (Perpetual)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-200">
                    Setup: <span className="text-emerald-400">{trade.setupType}</span>
                  </span>
                  <span>•</span>
                  <span>Leverage: <strong className="text-zinc-200">{trade.recommendedLeverage}</strong></span>
                  <span>•</span>
                  <span>Risk/Reward: <strong className="text-emerald-400">1:{trade.riskRewardRatio}</strong></span>
                </div>
              </div>
            </div>

            {/* Right: Price & Quick Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3">
              <div className="text-left sm:text-right">
                <div className="text-xs text-zinc-500 font-medium">Bybit Mark Price</div>
                <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono">
                  ${fmt(trade.currentPrice)}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Confluence Confidence: <span className="font-bold text-emerald-400">{trade.confidenceScore}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyOrder}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-xs"
                  title="Copy Bybit Entry, TP, and SL for order ticket"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Order</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onOpenTradeModal(trade.symbol, trade.direction)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                    isLong
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 shadow-emerald-950/40'
                      : 'bg-rose-600 hover:bg-rose-500 text-zinc-950 shadow-rose-950/40'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Execute Setup</span>
                </button>
              </div>
            </div>
          </div>

          {/* KEY TRADING TARGETS GRID: ENTRY, SL, TP1, TP2, TP3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* 1. ENTRY ZONE */}
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 text-[11px] font-semibold mb-1">
                <span className="flex items-center gap-1 text-zinc-300">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  ENTRY ZONE
                </span>
                <span className="text-[10px] text-zinc-500 uppercase">Limit / Market</span>
              </div>
              <div className="font-mono text-base font-extrabold text-zinc-100 my-0.5">
                ${fmt(trade.entryZone.recommended)}
              </div>
              <div className="text-[10px] text-zinc-400">
                Range: ${fmt(trade.entryZone.min)} - ${fmt(trade.entryZone.max)}
              </div>
            </div>

            {/* 2. STOP LOSS (SL) */}
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-300 text-[11px] font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  STOP LOSS (SL)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800/60 text-rose-400">
                  -{trade.stopLoss.lossPercent}%
                </span>
              </div>
              <div className="font-mono text-base font-extrabold text-rose-300 my-0.5">
                ${fmt(trade.stopLoss.price)}
              </div>
              <div className="text-[10px] text-rose-400/80 truncate" title={trade.stopLoss.invalidationReason}>
                Risk at 5x: -{(trade.stopLoss.lossPercent * 5).toFixed(1)}%
              </div>
            </div>

            {/* 3. TAKE PROFIT 1 */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-300 text-[11px] font-semibold mb-1">
                <span>TAKE PROFIT 1</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  +{trade.targets.tp1.gainPercent}%
                </span>
              </div>
              <div className="font-mono text-base font-extrabold text-emerald-300 my-0.5">
                ${fmt(trade.targets.tp1.price)}
              </div>
              <div className="text-[10px] text-emerald-400/80">
                R:R 1:{trade.targets.tp1.rr} • +{trade.targets.tp1.roiAtLeverage.lev5x}% (5x)
              </div>
            </div>

            {/* 4. TAKE PROFIT 2 (CORE) */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/50 flex flex-col justify-between relative shadow-xs">
              <span className="absolute -top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500 text-zinc-950 uppercase">
                Core Target
              </span>
              <div className="flex items-center justify-between text-emerald-300 text-[11px] font-semibold mb-1">
                <span>TAKE PROFIT 2</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                  +{trade.targets.tp2.gainPercent}%
                </span>
              </div>
              <div className="font-mono text-base font-extrabold text-emerald-200 my-0.5">
                ${fmt(trade.targets.tp2.price)}
              </div>
              <div className="text-[10px] text-emerald-300/90 font-medium">
                R:R 1:{trade.targets.tp2.rr} • +{trade.targets.tp2.roiAtLeverage.lev5x}% (5x)
              </div>
            </div>

            {/* 5. TAKE PROFIT 3 (RUNNER) */}
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-300 text-[11px] font-semibold mb-1">
                <span>TAKE PROFIT 3</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                  +{trade.targets.tp3.gainPercent}%
                </span>
              </div>
              <div className="font-mono text-base font-extrabold text-emerald-300 my-0.5">
                ${fmt(trade.targets.tp3.price)}
              </div>
              <div className="text-[10px] text-emerald-400/80">
                Runner Moonbag • +{trade.targets.tp3.roiAtLeverage.lev5x}% (5x)
              </div>
            </div>
          </div>

          {/* Institutional Confluence Factors */}
          <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                Technical & Orderflow Confluence Checklist
              </span>
              <div className="flex flex-wrap gap-2 mt-0.5">
                {trade.confluenceFactors.map((factor, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {factor}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Review button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRequestAiThesis}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/60 text-purple-200 text-xs font-semibold transition-colors"
                title="Get institutional trading thesis from Gemini AI"
              >
                <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'Analyzing...' : 'AI Trade Thesis'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCalculator(!showCalculator)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculator</span>
                {showCalculator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Interactive Position Calculator */}
          {showCalculator && calcData && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                    Bybit Position Sizer & Risk Management Calculator
                  </h4>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Target Risk: ${calcData.maxRiskDollar.toFixed(2)} ({riskPercent}%)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Account Size */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 font-medium">Trading Capital ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-500">$</span>
                    <input
                      type="number"
                      value={accountSize}
                      onChange={(e) => setAccountSize(Math.max(10, Number(e.target.value)))}
                      className="w-full pl-6 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-zinc-100 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Risk Percentage */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 font-medium">Max Risk per Trade (% of Capital)</label>
                  <div className="flex items-center gap-1.5">
                    {[1.0, 2.0, 3.0, 5.0].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRiskPercent(r)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          riskPercent === r
                            ? 'bg-emerald-600 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leverage Selection */}
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 font-medium">Bybit Leverage</label>
                  <div className="flex items-center gap-1.5">
                    {[2, 3, 5, 10].map((lev) => (
                      <button
                        key={lev}
                        type="button"
                        onClick={() => setSelectedLeverage(lev)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          selectedLeverage === lev
                            ? 'bg-emerald-600 text-zinc-950'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sizing Output Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-800/80">
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Position Size (Notional)</span>
                  <span className="font-mono text-xs font-extrabold text-zinc-200">
                    ${calcData.totalPositionSizeDollar.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    ~{calcData.coinUnits.toFixed(2)} {trade.symbol}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Margin Required</span>
                  <span className="font-mono text-xs font-extrabold text-emerald-400">
                    ${calcData.marginRequired.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-zinc-500 block">at {selectedLeverage}x leverage</span>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                  <span className="text-[10px] text-rose-400 block">Max Loss if Stopped</span>
                  <span className="font-mono text-xs font-extrabold text-rose-300">
                    -${calcData.maxRiskDollar.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-rose-400/70 block">Strict invalidation</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                  <span className="text-[10px] text-emerald-400 block">Profit at TP2 (Core)</span>
                  <span className="font-mono text-xs font-extrabold text-emerald-300">
                    +${calcData.profitTP2Dollar.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-emerald-400/70 block">
                    Net: +{((calcData.profitTP2Dollar / accountSize) * 100).toFixed(1)}% account gain
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
