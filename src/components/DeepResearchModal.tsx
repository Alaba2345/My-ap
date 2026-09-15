import { useState } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Target,
  Share2,
  Check,
  Zap,
  Activity,
  ArrowRight
} from 'lucide-react';
import { DeepResearchReport, CryptoCoin } from '../types';

interface DeepResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DeepResearchReport | null;
  coin: CryptoCoin | undefined;
  isLoading: boolean;
  onRefreshResearch: () => void;
}

export function DeepResearchModal({
  isOpen,
  onClose,
  report,
  coin,
  isLoading,
  onRefreshResearch,
}: DeepResearchModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyReport = () => {
    if (!report) return;
    const text = `🚨 [AI DEEP RESEARCH RADAR] ${report.name} (${report.symbol})
Price: $${report.priceAtAnalysis}
Sentiment: ${report.overallSentiment} (Velocity: ${report.surgeVelocityScore}/100, Risk: ${report.riskLevel})

⚡ PRIMARY CATALYST:
${report.primaryCatalyst}

📊 BREAKOUT ANALYSIS:
${report.executiveSummary}

🎯 KEY TECHNICAL LEVELS:
- Support: ${report.technicalKeyLevels.support}
- Resistance: ${report.technicalKeyLevels.resistance}
- Immediate Target: ${report.technicalKeyLevels.immediateTarget}
- Stretch Target: ${report.technicalKeyLevels.stretchTarget}
- Invalidation: ${report.technicalKeyLevels.invalidationLevel}

💡 ACTIONABLE TAKEAWAY:
${report.actionableTakeaway}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Extremely Bullish':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Bullish':
        return 'bg-emerald-950 text-emerald-400 border-emerald-700/60';
      case 'Neutral/Overheated':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      default:
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'Moderate':
        return 'text-amber-300 bg-amber-950/60 border-amber-800';
      case 'Elevated':
        return 'text-orange-400 bg-orange-950/60 border-orange-800';
      default:
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-100">
                  {coin?.name || report?.name || 'Cryptocurrency'} ({coin?.symbol || report?.symbol})
                </h2>
                {report && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getSentimentColor(
                      report.overallSentiment
                    )}`}
                  >
                    {report.overallSentiment}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                <span className="text-zinc-200 font-semibold text-sm">
                  ${coin?.price ? (coin.price < 1 ? coin.price.toFixed(5) : coin.price.toLocaleString()) : report?.priceAtAnalysis}
                </span>
                {coin && (
                  <span className={`font-bold flex items-center gap-0.5 ${coin.change5m >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    {coin.change5m >= 0 ? '+' : ''}{coin.change5m}% (5m)
                  </span>
                )}
                <span className="text-zinc-500">|</span>
                <span className="text-zinc-400">
                  {report ? `Analyzed ${new Date(report.timestamp).toLocaleTimeString()}` : 'Analyzing real-time order flow...'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefreshResearch}
              disabled={isLoading}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Re-run Gemini Deep Research"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Analysis</span>
            </button>

            {report && (
              <button
                type="button"
                onClick={handleCopyReport}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Copy full intelligence report"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/40">
                <Sparkles className="w-8 h-8 text-purple-400 animate-spin-slow" />
                <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-purple-400 opacity-20"></span>
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">
                  Gemini Deep Research Engine Active
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mt-1">
                  Synthesizing on-chain orderbook imbalances, social momentum, volume spikes, and macro catalysts for {coin?.name || 'this asset'}...
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Evaluating technical invalidation &amp; liquidity pool levels</span>
              </div>
            </div>
          ) : report ? (
            <>
              {/* Primary Catalyst Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-zinc-900 border border-purple-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 mt-0.5 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400 block mb-1">
                      Immediate Breakout Trigger
                    </span>
                    <p className="text-sm font-semibold text-zinc-100 leading-snug">
                      {report.primaryCatalyst}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantitative Metrics Bar (Velocity, Risk, Volume) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
                    Surge Velocity
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-400">
                      {report.surgeVelocityScore}
                    </span>
                    <span className="text-xs text-zinc-500">/ 100</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${report.surgeVelocityScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
                    Risk Assessment
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-base font-bold px-2 py-0.5 rounded border ${getRiskColor(report.riskLevel)}`}>
                      {report.riskLevel}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">({report.riskScore}/100)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        report.riskScore > 65 ? 'bg-rose-500' : report.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${report.riskScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
                    Orderbook Balance
                  </span>
                  <div className="text-xs font-semibold text-zinc-200 mt-1 leading-tight">
                    {report.marketContext.orderbookImbalance}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Top 2% Depth</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase block">
                    Funding Rate
                  </span>
                  <div className="text-xs font-semibold text-zinc-200 mt-1 leading-tight">
                    {report.marketContext.fundingRateSentiment}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Perp Sentiment</span>
                </div>
              </div>

              {/* Narrative Research & Breakout Analysis */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  Executive Research Thesis
                </h3>
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs leading-relaxed text-zinc-300 space-y-2.5">
                  <p className="font-medium text-zinc-200">
                    {report.executiveSummary}
                  </p>
                  <p className="text-zinc-400">
                    {report.breakoutAnalysis}
                  </p>
                </div>
              </div>

              {/* Technical Target Levels Box */}
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Algorithmic Price Targets &amp; Invalidation
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-medium">Based on Fibonacci &amp; Order Flow</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 block uppercase">Key Support</span>
                    <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
                      {report.technicalKeyLevels.support}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 block uppercase">Immediate Resistance</span>
                    <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
                      {report.technicalKeyLevels.resistance}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">Target 1 (Fast)</span>
                    <span className="text-xs font-bold text-emerald-300 mt-0.5 block">
                      {report.technicalKeyLevels.immediateTarget}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                    <span className="text-[10px] text-emerald-400 block uppercase font-bold">Target 2 (Stretch)</span>
                    <span className="text-xs font-bold text-emerald-300 mt-0.5 block">
                      {report.technicalKeyLevels.stretchTarget}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-rose-400 block uppercase font-bold">Invalidation Stop</span>
                    <span className="text-xs font-bold text-rose-300 mt-0.5 block">
                      {report.technicalKeyLevels.invalidationLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2-Column Grid: Catalysts & On-Chain Signals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Catalysts Breakdown */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    Contributing Catalysts
                  </h3>
                  <div className="space-y-2.5">
                    {report.catalysts.map((cat, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-xs text-zinc-200">
                            {cat.category}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              cat.impact === 'High'
                                ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {cat.impact} Impact
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {cat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* On-Chain Signals */}
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    On-Chain &amp; Liquidity Signals
                  </h3>
                  <div className="space-y-2.5">
                    {report.onChainSignals.map((sig, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-xs text-zinc-200 block">
                            {sig.metric}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {sig.reading}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            sig.status === 'bullish'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : sig.status === 'warning'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {sig.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Factors Warning Box */}
              {report.riskFactors && report.riskFactors.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
                  <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Key Risk Factors &amp; Liquidity Traps
                  </h3>
                  <ul className="space-y-1 text-xs text-rose-200/80 list-disc list-inside">
                    {report.riskFactors.map((rf, idx) => (
                      <li key={idx} className="leading-snug">{rf}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Strategic Takeaway */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block mb-1">
                  Strategic Trade / Decision Takeaway
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {report.actionableTakeaway}
                </p>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No report available. Click &quot;Refresh Analysis&quot; to generate deep research.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span>Powered by Gemini 3.8 Flash Momentum Research Model</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
