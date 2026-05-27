import { OHLCVPoint } from "../services/market-data.service";
import { calculateSMA, calculateATR, calculateRSI, calculateMACD, calculateADX } from "./indicators";

export interface PatternResult {
  type: "BREAKOUT" | "REVERSAL" | "RANGE" | "VOLATILITY";
  signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "HIGH" | "LOW";
  description: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

export function detectBreakout(ohlcv: OHLCVPoint[], lookback = 20): PatternResult | null {
  if (ohlcv.length < lookback) return null;

  const lastIdx = ohlcv.length - 1;
  const currentCandle = ohlcv[lastIdx];
  
  // Find highest high and lowest low in lookback period (excluding current candle)
  let highestHigh = -Infinity;
  let lowestLow = Infinity;
  for (let i = lastIdx - lookback; i < lastIdx; i++) {
    if (ohlcv[i].high > highestHigh) highestHigh = ohlcv[i].high;
    if (ohlcv[i].low < lowestLow) lowestLow = ohlcv[i].low;
  }

  // Volume surge check
  const volumes = ohlcv.map(c => c.volume);
  const volSma = calculateSMA(volumes, lookback);
  const currentVolSma = volSma[lastIdx - 1]; // SMA up to previous candle
  
  const isVolumeSurge = currentCandle.volume > currentVolSma * 1.5;

  if (currentCandle.close > highestHigh && isVolumeSurge) {
    return {
      type: "BREAKOUT",
      signal: "BULLISH",
      description: `Price broke above the ${lookback}-period high with a volume surge.`,
      confidence: "HIGH"
    };
  }

  if (currentCandle.close < lowestLow && isVolumeSurge) {
    return {
      type: "BREAKOUT",
      signal: "BEARISH",
      description: `Price broke below the ${lookback}-period low with a volume surge.`,
      confidence: "HIGH"
    };
  }

  return null;
}

export function detectTrendReversal(ohlcv: OHLCVPoint[]): PatternResult | null {
  if (ohlcv.length < 30) return null;

  const closes = ohlcv.map(c => c.close);
  const rsi = calculateRSI(closes, 14);
  const macdData = calculateMACD(closes);
  
  const lastIdx = closes.length - 1;
  const curRsi = rsi[lastIdx];
  const prevRsi = rsi[lastIdx - 1];
  
  const curMacd = macdData[lastIdx];
  const prevMacd = macdData[lastIdx - 1];

  // Bullish Reversal: RSI crossing up from oversold (< 30) AND MACD crossing signal line upwards
  if (prevRsi < 30 && curRsi >= 30) {
    if (curMacd.macd > curMacd.signal && prevMacd.macd <= prevMacd.signal) {
      return {
        type: "REVERSAL",
        signal: "BULLISH",
        description: "RSI crossed above 30 from oversold while MACD made a bullish crossover.",
        confidence: "HIGH"
      };
    }
  }

  // Bearish Reversal: RSI crossing down from overbought (> 70) AND MACD crossing signal line downwards
  if (prevRsi > 70 && curRsi <= 70) {
    if (curMacd.macd < curMacd.signal && prevMacd.macd >= prevMacd.signal) {
      return {
        type: "REVERSAL",
        signal: "BEARISH",
        description: "RSI crossed below 70 from overbought while MACD made a bearish crossover.",
        confidence: "HIGH"
      };
    }
  }

  return null;
}

export function detectRange(ohlcv: OHLCVPoint[]): PatternResult | null {
  if (ohlcv.length < 20) return null;

  const highs = ohlcv.map(c => c.high);
  const lows = ohlcv.map(c => c.low);
  const closes = ohlcv.map(c => c.close);
  
  const adxData = calculateADX(highs, lows, closes, 14);
  const currentAdx = adxData.adx[closes.length - 1];

  if (currentAdx < 25) {
    return {
      type: "RANGE",
      signal: "NEUTRAL",
      description: `ADX is below 25 (${currentAdx.toFixed(1)}), indicating a weak trend / ranging market.`,
      confidence: "MEDIUM"
    };
  }

  return null;
}

export function detectVolatility(ohlcv: OHLCVPoint[]): PatternResult | null {
  if (ohlcv.length < 20) return null;

  const highs = ohlcv.map(c => c.high);
  const lows = ohlcv.map(c => c.low);
  const closes = ohlcv.map(c => c.close);
  
  const atr = calculateATR(highs, lows, closes, 14);
  const atrSma = calculateSMA(atr, 20); // 20-period moving average of ATR
  
  const lastIdx = closes.length - 1;
  const currentAtr = atr[lastIdx];
  const averageAtr = atrSma[lastIdx];

  if (currentAtr > averageAtr * 1.5) {
    return {
      type: "VOLATILITY",
      signal: "HIGH",
      description: "Current ATR is significantly higher than its historical average, indicating high market volatility.",
      confidence: "HIGH"
    };
  } else if (currentAtr < averageAtr * 0.5) {
    return {
      type: "VOLATILITY",
      signal: "LOW",
      description: "Current ATR is significantly lower than its historical average, indicating a volatility squeeze.",
      confidence: "HIGH"
    };
  }

  return {
    type: "VOLATILITY",
    signal: "NEUTRAL",
    description: "Market volatility is within normal historical ranges.",
    confidence: "MEDIUM"
  };
}

export function detectAllPatterns(ohlcv: OHLCVPoint[]): PatternResult[] {
  const patterns: PatternResult[] = [];
  
  const breakout = detectBreakout(ohlcv);
  if (breakout) patterns.push(breakout);

  const reversal = detectTrendReversal(ohlcv);
  if (reversal) patterns.push(reversal);

  const range = detectRange(ohlcv);
  if (range) patterns.push(range);

  const volatility = detectVolatility(ohlcv);
  if (volatility) patterns.push(volatility);

  return patterns;
}
