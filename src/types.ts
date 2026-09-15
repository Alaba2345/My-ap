export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change1m: number;
  change5m: number;
  change15m: number;
  change1h: number;
  change24h: number;
  volume24h: number;
  volumeSpikeMultiplier: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
  lastUpdated: number;
  marketCapTier: 'mega' | 'mid' | 'low' | 'degen';
  surgeScore: number; // 0 - 100
  isSurging: boolean;
  surgeStage: 'breakout' | 'accelerating' | 'parabolic' | 'cooling';
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
