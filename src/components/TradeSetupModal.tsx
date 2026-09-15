import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Copy,
  Check,
  Calculator,
  Sparkles,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { TradeSetup, CryptoCoin } from '../types';

interface TradeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin?: CryptoCoin;
  symbol: string | null;
  initialDirection?: 'LONG' | 'SHORT';
  onOpenResearch?: (symbol: string) => void;
}

export function TradeSetupModal({
  isOpen,
  onClose,
  coin,
  symbol,
  initialDirection,
  onOpenResearch,
}: TradeSetupModalProps) {
  const [trade, setTrade] = useState<TradeSetup | null>(null);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>(initialDirection || 'LONG');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Position Sizing Calculator state
  const [accountSize, setAccountSize] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(2.0);
  const [selectedLeverage, setSelectedLeverage] = useState<number>(5);

  useEffect(() => {
    if (initialDirection) {
      setDirection(initialDirection);
    }
  }, [initialDirection]);

  // Fetch or generate trade setup for this coin
  const fetchTradeSetup = async (targetDirection?: 'LONG' | 'SHORT', useAi = false) => {
    const targetSymbol = symbol || coin?.symbol;
    if (!targetSymbol) return;

    setIsLoading(true);
    if (useAi) setIsAiLoading(true);

    try {
      const res = await fetch('/api/crypto/trade-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: targetSymbol,
          bybitSymbol: coin?.bybitSymbol || `${targetSymbol}USDT`,
          requestedDirection: targetDirection || direction,
          useAi,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.trade) {
          setTrade(data.trade);
          setDirection(data.trade.direction);
        }
      }
    } catch (err) {
      console.error('Failed to load trade setup:', err);
    } finally {
      setIsLoading(false);
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && (symbol || coin)) {
      fetchTradeSetup(initialDirection);
    }
  }, [isOpen, symbol, coin]);

  // Handle switching direction between LONG and SHORT
  const handleToggleDirection = (newDir: 'LONG' | 'SHORT') => {
    setDirection(newDir);
    fetchTradeSetup(newDir);
  };

  // Helper formatting
  const fmt = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '0.00';
    if (val < 0.0001) return val.toFixed(7);
    if (val < 1) return val.toFixed(5);
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  // Copy Bybit Order Text
  const handleCopyOrder = () => {
    if (!trade) return;
    const text = `--- BYBIT PERPETUAL ORDER ---
Pair: ${trade.bybitSymbol}
Action: ${trade.direction}
Recommended Entry: $${fmt(trade.entryZone.recommended)}
Entry Range: $${fmt(trade.entryZone.min)} - $${fmt(trade.entryZone.max)}
-----------------------------
TP1: $${fmt(trade.targets.tp1.price)} (+${trade.targets.tp1.gainPercent}%) -> Close 50% & SL to BE
TP2: $${fmt(trade.targets.tp2.price)} (+${trade.targets.tp2.gainPercent}%) -> Close 35%
TP3: $${fmt(trade.targets.tp3.price)} (+${trade.targets.tp3.gainPercent}%) -> Runner 15%
-----------------------------
SL: $${fmt(trade.stopLoss.price)} (-${trade.stopLoss.lossPercent}%)
Invalidation: ${trade.stopLoss.invalidationReason}
Risk/Reward: 1:${trade.riskRewardRatio} | Recommended Leverage: ${trade.recommendedLeverage}`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Position Calculations
  const calcData = useMemo(() => {
    if (!trade) return null;
    const maxRiskDollar = (accountSize * riskPercent) / 100;
    const lossPct = trade.stopLoss.lossPercent / 100;
    const totalPositionSizeDollar = lossPct > 0 ? maxRiskDollar / lossPct : 0;
    const marginRequired = totalPositionSizeDollar / selectedLeverage;
    const coinUnits = trade.currentPrice > 0 ? totalPositionSizeDollar / trade.currentPrice : 0;

    const profitTP1 = totalPositionSizeDollar * (trade.targets.tp1.gainPercent / 100);
    const profitTP2 = totalPositionSizeDollar * (trade.targets.tp2.gainPercent / 100);
    const profitTP3 = totalPositionSizeDollar * (trade.targets.tp3.gainPercent / 100);

    return {
      maxRiskDollar,
      totalPositionSizeDollar,
      marginRequired,
      coinUnits,
      profitTP1,
      profitTP2,
      profitTP3,
    };
  }, [trade, accountSize, riskPercent, selectedLeverage]);

  if (!isOpen) return null;

  const isLong = direction === 'LONG';
  const bybitPair = trade?.bybitSymbol || `${symbol}USDT`;
  const bybitUrl = `https://www.bybit.com/trade/usdt/${bybitPair}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl flex flex-col text-zinc-100">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur-md px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isLong ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-400' : 'bg-rose-950/80 border-rose-700/60 text-rose-400'
            }`}>
              {isLong ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-100 tracking-tight">
                  {trade?.symbol || symbol} Trade Setup
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {bybitPair}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isLong ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60' : 'bg-rose-950 text-rose-300 border-rose-700/60'
                }`}>
                  {direction}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Institutional Entry, Take Profit, and Stop Loss Parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={bybitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-400 px-2 py-1 rounded bg-zinc-800 border border-zinc-700"
              title="Open Bybit Trading Terminal"
            >
              <span>Bybit Live</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {isLoading && !trade ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-zinc-400">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className="text-xs font-medium">Calculating optimal risk/reward parameters...</span>
            </div>
          ) : trade ? (
            <>
              {/* Direction Switcher & Confluence Highlights */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400 font-medium mr-1">Position Strategy:</span>
                  <button
                    type="button"
                    onClick={() => handleToggleDirection('LONG')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      direction === 'LONG'
                        ? 'bg-emerald-600 text-zinc-950 shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>LONG (BUY)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleDirection('SHORT')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      direction === 'SHORT'
                        ? 'bg-rose-600 text-zinc-950 shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>SHORT (SELL)</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500">Current: </span>
                    <strong className="font-mono text-zinc-100">${fmt(trade.currentPrice)}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">R:R: </span>
                    <strong className="text-emerald-400 font-bold">1:{trade.riskRewardRatio}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">Rec. Lev: </span>
                    <strong className="text-zinc-200">{trade.recommendedLeverage}</strong>
                  </div>
                </div>
              </div>

              {/* TRADING TARGETS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ENTRY ZONE */}
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-1">
                    <span className="flex items-center gap-1 text-zinc-200">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      ENTRY ZONE
                    </span>
                    <span className="text-[10px] text-zinc-500">Limit / Market</span>
                  </div>
                  <div className="font-mono text-lg font-black text-zinc-100 my-1">
                    ${fmt(trade.entryZone.recommended)}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Execution Window: ${fmt(trade.entryZone.min)} - ${fmt(trade.entryZone.max)}
                  </div>
                </div>

                {/* STOP LOSS */}
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40">
                  <div className="flex items-center justify-between text-xs text-rose-300 font-semibold mb-1">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      STOP LOSS (SL)
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800/60 text-rose-400">
                      -{trade.stopLoss.lossPercent}%
                    </span>
                  </div>
                  <div className="font-mono text-lg font-black text-rose-300 my-1">
                    ${fmt(trade.stopLoss.price)}
                  </div>
                  <div className="text-[10px] text-rose-400/90 leading-tight">
                    {trade.stopLoss.invalidationReason}
                  </div>
                </div>

                {/* TAKE PROFIT 1 */}
                <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                    <span>TAKE PROFIT 1 (De-Risk)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                      +{trade.targets.tp1.gainPercent}%
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-emerald-300 my-0.5">
                    ${fmt(trade.targets.tp1.price)}
                  </div>
                  <div className="text-[10px] text-emerald-400/80">
                    Close 50% • Shift Stop Loss to Breakeven • +{trade.targets.tp1.roiAtLeverage.lev5x}% (5x)
                  </div>
                </div>

                {/* TAKE PROFIT 2 (CORE TARGET) */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-600/50 relative">
                  <span className="absolute top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500 text-zinc-950 uppercase">
                    Core Target
                  </span>
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                    <span>TAKE PROFIT 2</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                      +{trade.targets.tp2.gainPercent}%
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-emerald-200 my-0.5">
                    ${fmt(trade.targets.tp2.price)}
                  </div>
                  <div className="text-[10px] text-emerald-300/90 font-medium">
                    Close 35% • R:R 1:{trade.targets.tp2.rr} • +{trade.targets.tp2.roiAtLeverage.lev5x}% (5x)
                  </div>
                </div>

                {/* TAKE PROFIT 3 (RUNNER) */}
                <div className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                    <span>TAKE PROFIT 3 (Extended Runner)</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                      +{trade.targets.tp3.gainPercent}%
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold text-emerald-300 my-0.5">
                    ${fmt(trade.targets.tp3.price)}
                  </div>
                  <div className="text-[10px] text-emerald-400/80">
                    Remaining 15% position • Trail stop along 1h EMA • +{trade.targets.tp3.roiAtLeverage.lev5x}% (5x)
                  </div>
                </div>
              </div>

              {/* Confluence Factors */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Orderflow & Structural Confluence
                </span>
                <div className="space-y-1">
                  {trade.confluenceFactors.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Sizing Calculator */}
              {calcData && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                      Position Sizing & Risk Management
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      Risk: ${calcData.maxRiskDollar.toFixed(2)} ({riskPercent}%)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Capital ($ USD)</label>
                      <input
                        type="number"
                        value={accountSize}
                        onChange={(e) => setAccountSize(Math.max(10, Number(e.target.value)))}
                        className="w-full px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Risk %</label>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRiskPercent(r)}
                            className={`flex-1 py-1 rounded text-[11px] font-bold ${
                              riskPercent === r ? 'bg-emerald-600 text-zinc-950' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {r}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Leverage</label>
                      <div className="flex gap-1">
                        {[3, 5, 10].map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setSelectedLeverage(l)}
                            className={`flex-1 py-1 rounded text-[11px] font-bold ${
                              selectedLeverage === l ? 'bg-emerald-600 text-zinc-950' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {l}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/60 text-xs">
                    <div className="p-2 rounded bg-zinc-900/60">
                      <span className="text-[10px] text-zinc-500 block">Position Size</span>
                      <strong className="text-zinc-200 font-mono">${calcData.totalPositionSizeDollar.toFixed(1)}</strong>
                    </div>
                    <div className="p-2 rounded bg-zinc-900/60">
                      <span className="text-[10px] text-zinc-500 block">Margin</span>
                      <strong className="text-emerald-400 font-mono">${calcData.marginRequired.toFixed(1)}</strong>
                    </div>
                    <div className="p-2 rounded bg-rose-950/20">
                      <span className="text-[10px] text-rose-400 block">Max Loss (SL)</span>
                      <strong className="text-rose-300 font-mono">-${calcData.maxRiskDollar.toFixed(1)}</strong>
                    </div>
                    <div className="p-2 rounded bg-emerald-950/20">
                      <span className="text-[10px] text-emerald-400 block">TP2 Profit</span>
                      <strong className="text-emerald-300 font-mono">+${calcData.profitTP2.toFixed(1)}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-zinc-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCopyOrder}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Order Ticket</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchTradeSetup(direction, true)}
                    disabled={isAiLoading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/60 text-purple-200 text-xs font-semibold transition-colors"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isAiLoading ? 'animate-spin' : ''}`} />
                    <span>{isAiLoading ? 'Reviewing...' : 'AI Thesis'}</span>
                  </button>
                </div>

                <a
                  href={bybitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all ${
                    isLong
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950'
                      : 'bg-rose-600 hover:bg-rose-500 text-zinc-950'
                  }`}
                >
                  <span>Trade on Bybit Terminal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
