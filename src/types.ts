export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  bybitSymbol?: string;
  price: number;
  change1m: number;
  change5m: number;
  change15m: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  turnover24h?: number;
  openInterest?: number;
  fundingRate?: number;
  volumeSpikeMultiplier: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
  lastUpdated: number;
  marketCapTier: 'mega' | 'mid' | 'low' | 'degen';
  surgeScore: number; // 0 - 100
  isSurging: boolean;
  surgeStage: 'breakout' | 'accelerating' | 'parabolic' | 'cooling';
  quickSignal?: 'BUY' | 'SELL' | 'NEUTRAL';
}

export interface TradeTarget {
  price: number;
  gainPercent: number;
  rr: number;
  label: string;
  roiAtLeverage?: {
    lev3x: number;
    lev5x: number;
    lev10x: number;
  };
}

export interface TradeSetup {
  symbol: string;
  name: string;
  bybitSymbol: string;
  currentPrice: number;
  direction: 'LONG' | 'SHORT';
  setupType: 'Breakout Continuation' | 'High-Volume Surge' | 'Support Bounce' | 'Overextended Exhaustion Short' | 'Range Breakout';
  confidenceScore: number; // 0 - 100
  entryZone: {
    min: number;
    max: number;
    recommended: number;
  };
  targets: {
    tp1: TradeTarget;
    tp2: TradeTarget;
    tp3: TradeTarget;
  };
  stopLoss: {
    price: number;
    lossPercent: number;
    invalidationReason: string;
    riskAtLeverage?: {
      lev3x: number;
      lev5x: number;
      lev10x: number;
    };
  };
  riskRewardRatio: number; // e.g. 3.2
  recommendedLeverage: string; // e.g. "3x - 5x"
  maxRiskPercent: number; // e.g. 1.5 - 2%
  confluenceFactors: string[];
  summary: string;
  generatedAt: number;
  isAiGenerated?: boolean;
}

export interface SurgeAlert {
  id: string;
  symbol: string;
  name: string;
  detectedAt: number;
  initialPrice: number;
  currentPrice: number;
  peakGainPercent: number;
  timeframe: string;
  surgePercent: number;
  volumeMultiplier: number;
  hasAiResearch: boolean;
  aiSummarySnippet?: string;
}

export interface DetectedTradeSignal {
  id: string;
  symbol: string;
  name: string;
  bybitSymbol: string;
  currentPrice: number;
  direction: 'LONG' | 'SHORT';
  setupType: string;
  confidenceScore: number;
  detectedReason: string;
  detectedAt: number;
  entryZone: {
    min: number;
    max: number;
    recommended: number;
  };
  targets: {
    tp1: TradeTarget;
    tp2: TradeTarget;
    tp3: TradeTarget;
  };
  stopLoss: {
    price: number;
    lossPercent: number;
    invalidationReason: string;
  };
  recommendedLeverage: string;
  riskRewardRatio: number;
  volumeSpikeMultiplier: number;
  change1h: number;
  change5m: number;
  turnover24h: number;
}

export interface CatalystItem {
  category: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface OnChainSignal {
  metric: string;
  reading: string;
  status: 'bullish' | 'neutral' | 'warning';
}

export interface DeepResearchReport {
  symbol: string;
  name: string;
  priceAtAnalysis: number;
  timestamp: number;
  overallSentiment: 'Extremely Bullish' | 'Bullish' | 'Neutral/Overheated' | 'High Risk / Speculative';
  surgeVelocityScore: number; // 1 - 100
  riskScore: number; // 1 - 100
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'Extreme';
  primaryCatalyst: string;
  executiveSummary: string;
  breakoutAnalysis: string;
  catalysts: CatalystItem[];
  onChainSignals: OnChainSignal[];
  technicalKeyLevels: {
    support: string;
    resistance: string;
    immediateTarget: string;
    stretchTarget: string;
    invalidationLevel: string;
  };
  marketContext: {
    orderbookImbalance: string;
    volumeVerdict: string;
    fundingRateSentiment: string;
  };
  riskFactors: string[];
  actionableTakeaway: string;
}

export interface ScannerConfig {
  min5mSurge: number;
  min1hSurge: number;
  min24hSurge: number;
  minVolume24h: number;
  soundEnabled: boolean;
  autoResearch: boolean;
  notificationsEnabled: boolean;
  activeFilter: 'all' | 'mega' | 'mid' | 'low' | 'watchlist';
}
