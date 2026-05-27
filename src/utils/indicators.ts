/**
 * Technical Indicators Utility
 * Custom implementation of standard financial indicators and TradingView-style analysis rating.
 */

// Helper: Simple Moving Average (SMA)
export function calculateSMA(values: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      sma.push(values[i]); // Fallback
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += values[i - j];
      }
      sma.push(sum / period);
    }
  }
  return sma;
}

// Helper: Exponential Moving Average (EMA)
export function calculateEMA(values: number[], period: number): number[] {
  const ema: number[] = [];
  if (values.length === 0) return [];
  const k = 2 / (period + 1);

  // Seed first value with SMA
  let sum = 0;
  const seedPeriod = Math.min(period, values.length);
  for (let i = 0; i < seedPeriod; i++) {
    sum += values[i];
  }
  let currentEma = sum / seedPeriod;

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      ema.push(values[i]);
    } else if (i === period - 1) {
      ema.push(currentEma);
    } else {
      currentEma = values[i] * k + currentEma * (1 - k);
      ema.push(currentEma);
    }
  }
  return ema;
}

// Relative Strength Index (RSI)
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (closes.length <= period) {
    return closes.map(() => 50);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(-diff);
    }
  }

  // First averages
  let avgGain = gains.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, val) => sum + val, 0) / period;

  // Fill initial values with 50
  for (let i = 0; i < period; i++) {
    rsi.push(50);
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - 100 / (1 + rs));

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const currentRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + currentRs));
  }

  return rsi;
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  if (closes.length < slowPeriod) {
    return closes.map(() => ({ macd: 0, signal: 0, hist: 0 }));
  }

  const ema12 = calculateEMA(closes, fastPeriod);
  const ema26 = calculateEMA(closes, slowPeriod);
  const macdLine = ema12.map((val, idx) => val - ema26[idx]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const hist = macdLine.map((val, idx) => val - signalLine[idx]);

  return closes.map((_, idx) => ({
    macd: macdLine[idx],
    signal: signalLine[idx],
    hist: hist[idx],
  }));
}

// Stochastic Oscillator (%K, %D)
export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod = 14,
  dPeriod = 3
): { k: number[]; d: number[] } {
  const kValues: number[] = [];
  const length = closes.length;

  for (let i = 0; i < length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(50); // Fallback
    } else {
      const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
      const highSlice = highs.slice(i - kPeriod + 1, i + 1);
      const minLow = Math.min(...lowSlice);
      const maxHigh = Math.max(...highSlice);

      const diff = maxHigh - minLow;
      if (diff === 0) {
        kValues.push(50);
      } else {
        kValues.push(((closes[i] - minLow) / diff) * 100);
      }
    }
  }

  const dValues = calculateSMA(kValues, dPeriod);
  return { k: kValues, d: dValues };
}

// Commodity Channel Index (CCI)
export function calculateCCI(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 20
): number[] {
  const cci: number[] = [];
  const tp = closes.map((c, i) => (c + highs[i] + lows[i]) / 3);
  const smaTp = calculateSMA(tp, period);

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      cci.push(0);
    } else {
      let sumMeanDev = 0;
      for (let j = 0; j < period; j++) {
        sumMeanDev += Math.abs(tp[i - j] - smaTp[i]);
      }
      const meanDev = sumMeanDev / period;
      if (meanDev === 0) {
        cci.push(0);
      } else {
        cci.push((tp[i] - smaTp[i]) / (0.015 * meanDev));
      }
    }
  }
  return cci;
}

// Average Directional Index (ADX)
export function calculateADX(
  highs: number[],
  lows: number[],
  closes: number[],
  period = 14
): { adx: number[]; plusDI: number[]; minusDI: number[] } {
  const adx: number[] = [];
  const plusDI: number[] = [];
  const minusDI: number[] = [];
  const length = closes.length;

  if (length <= period) {
    return {
      adx: closes.map(() => 25),
      plusDI: closes.map(() => 25),
      minusDI: closes.map(() => 25),
    };
  }

  const tr: number[] = [highs[0] - lows[0]];
  const plusDM: number[] = [0];
  const minusDM: number[] = [0];

  for (let i = 1; i < length; i++) {
    const highDiff = highs[i] - highs[i - 1];
    const lowDiff = lows[i - 1] - lows[i];

    const currentTr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    tr.push(currentTr);

    if (highDiff > lowDiff && highDiff > 0) {
      plusDM.push(highDiff);
    } else {
      plusDM.push(0);
    }

    if (lowDiff > highDiff && lowDiff > 0) {
      minusDM.push(lowDiff);
    } else {
      minusDM.push(0);
    }
  }

  // Smooth using modified moving average (Wilder's)
  let smoothedTR = tr.slice(0, period).reduce((sum, v) => sum + v, 0);
  let smoothedPlusDM = plusDM.slice(0, period).reduce((sum, v) => sum + v, 0);
  let smoothedMinusDM = minusDM.slice(0, period).reduce((sum, v) => sum + v, 0);

  for (let i = 0; i < period; i++) {
    plusDI.push(25);
    minusDI.push(25);
    adx.push(25);
  }

  const getDI = (dm: number, trVal: number) => (trVal === 0 ? 0 : (dm / trVal) * 100);
  plusDI.push(getDI(smoothedPlusDM, smoothedTR));
  minusDI.push(getDI(smoothedMinusDM, smoothedTR));

  const dxValues: number[] = [];
  const calcDX = (p: number, m: number) => {
    const sum = p + m;
    return sum === 0 ? 0 : (Math.abs(p - m) / sum) * 100;
  };
  dxValues.push(calcDX(plusDI[period], minusDI[period]));

  for (let i = period + 1; i < length; i++) {
    smoothedTR = smoothedTR - smoothedTR / period + tr[i];
    smoothedPlusDM = smoothedPlusDM - smoothedPlusDM / period + plusDM[i];
    smoothedMinusDM = smoothedMinusDM - smoothedMinusDM / period + minusDM[i];

    const currentPlusDI = getDI(smoothedPlusDM, smoothedTR);
    const currentMinusDI = getDI(smoothedMinusDM, smoothedTR);

    plusDI.push(currentPlusDI);
    minusDI.push(currentMinusDI);
    dxValues.push(calcDX(currentPlusDI, currentMinusDI));
  }

  // Smooth DX to get ADX
  let adxSum = dxValues.slice(0, period).reduce((sum, v) => sum + v, 0);
  let currentADX = adxSum / period;

  // We fill from period * 2
  for (let i = period; i < period * 2; i++) {
    adx.push(currentADX);
  }

  for (let i = period * 2; i < length; i++) {
    currentADX = (currentADX * (period - 1) + dxValues[i - period]) / period;
    adx.push(currentADX);
  }

  return { adx, plusDI, minusDI };
}

// Awesome Oscillator (AO)
export function calculateAO(highs: number[], lows: number[]): number[] {
  const ao: number[] = [];
  const medianPrices = highs.map((h, i) => (h + lows[i]) / 2);
  const sma5 = calculateSMA(medianPrices, 5);
  const sma34 = calculateSMA(medianPrices, 34);

  for (let i = 0; i < highs.length; i++) {
    ao.push(sma5[i] - sma34[i]);
  }
  return ao;
}

// Momentum
export function calculateMomentum(closes: number[], period = 10): number[] {
  const mom: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      mom.push(0);
    } else {
      mom.push(closes[i] - closes[i - period]);
    }
  }
  return mom;
}

// Average True Range (ATR)
export function calculateATR(highs: number[], lows: number[], closes: number[], period = 14): number[] {
  const atr: number[] = [];
  const tr: number[] = [];

  if (closes.length === 0) return [];

  // First TR
  tr.push(highs[0] - lows[0]);
  for (let i = 1; i < closes.length; i++) {
    const currentTr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    tr.push(currentTr);
  }

  // Calculate ATR
  let currentAtr = tr.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
  for (let i = 0; i < period; i++) {
    atr.push(currentAtr); // Seed first elements
  }

  for (let i = period; i < tr.length; i++) {
    currentAtr = (currentAtr * (period - 1) + tr[i]) / period;
    atr.push(currentAtr);
  }
  return atr;
}

// On-Balance Volume (OBV)
export function calculateOBV(closes: number[], volumes: number[]): number[] {
  const obv: number[] = [];
  if (closes.length === 0) return [];

  obv.push(volumes[0]);
  for (let i = 1; i < closes.length; i++) {
    let currentObv = obv[i - 1];
    if (closes[i] > closes[i - 1]) {
      currentObv += volumes[i];
    } else if (closes[i] < closes[i - 1]) {
      currentObv -= volumes[i];
    }
    obv.push(currentObv);
  }
  return obv;
}

// Generate TradingView-style Analysis Rating
export interface IndicatorDetails {
  value: number;
  action: "BUY" | "SELL" | "NEUTRAL";
}

export interface TARatingResult {
  summary: {
    rating: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
    buyCount: number;
    sellCount: number;
    neutralCount: number;
  };
  oscillators: {
    rating: "BUY" | "SELL" | "NEUTRAL";
    buyCount: number;
    sellCount: number;
    neutralCount: number;
    items: {
      rsi?: IndicatorDetails;
      stoch?: { k: number; d: number; action: "BUY" | "SELL" | "NEUTRAL" };
      cci?: IndicatorDetails;
      adx?: IndicatorDetails;
      ao?: IndicatorDetails;
      momentum?: IndicatorDetails;
      macd?: { macd: number; signal: number; action: "BUY" | "SELL" | "NEUTRAL" };
    };
  };
  movingAverages: {
    rating: "BUY" | "SELL" | "NEUTRAL";
    buyCount: number;
    sellCount: number;
    neutralCount: number;
    items: {
      ema10: IndicatorDetails;
      sma10: IndicatorDetails;
      ema20: IndicatorDetails;
      sma20: IndicatorDetails;
      ema30: IndicatorDetails;
      sma30: IndicatorDetails;
      ema50: IndicatorDetails;
      sma50: IndicatorDetails;
      ema100: IndicatorDetails;
      sma100: IndicatorDetails;
      ema200: IndicatorDetails;
      sma200: IndicatorDetails;
    };
  };
  volatility: {
    atr: number;
  };
  volume: {
    obv: number;
    obvAction: "BUY" | "SELL" | "NEUTRAL";
  };
}

export function generateTradingViewRating(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[] = []
): TARatingResult {
  const len = closes.length;
  const lastIdx = len - 1;

  if (len < 200) {
    // Return neutral if not enough data
    return {
      summary: { rating: "NEUTRAL", buyCount: 0, sellCount: 0, neutralCount: 0 },
      oscillators: { rating: "NEUTRAL", buyCount: 0, sellCount: 0, neutralCount: 0, items: {} },
      movingAverages: { rating: "NEUTRAL", buyCount: 0, sellCount: 0, neutralCount: 0, items: {} as any },
      volatility: { atr: 0 },
      volume: { obv: 0, obvAction: "NEUTRAL" },
    };
  }

  // Fetch indicator values
  const rsi = calculateRSI(closes, 14);
  const stoch = calculateStochastic(highs, lows, closes, 14, 3);
  const cci = calculateCCI(highs, lows, closes, 20);
  const adxData = calculateADX(highs, lows, closes, 14);
  const ao = calculateAO(highs, lows);
  const mom = calculateMomentum(closes, 10);
  const macdData = calculateMACD(closes, 12, 26, 9);

  // Moving Averages
  const ema10 = calculateEMA(closes, 10);
  const sma10 = calculateSMA(closes, 10);
  const ema20 = calculateEMA(closes, 20);
  const sma20 = calculateSMA(closes, 20);
  const ema30 = calculateEMA(closes, 30);
  const sma30 = calculateSMA(closes, 30);
  const ema50 = calculateEMA(closes, 50);
  const sma50 = calculateSMA(closes, 50);
  const ema100 = calculateEMA(closes, 100);
  const sma100 = calculateSMA(closes, 100);
  const ema200 = calculateEMA(closes, 200);
  const sma200 = calculateSMA(closes, 200);

  // Additional Indicators
  const atr = calculateATR(highs, lows, closes, 14);
  const curAtr = atr[lastIdx];

  const obv = volumes.length === len ? calculateOBV(closes, volumes) : closes.map(() => 0);
  const curObv = obv[lastIdx];
  const obvSma = calculateSMA(obv, 20); // 20-period SMA of OBV
  const curObvSma = obvSma[lastIdx];
  
  let obvAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curObv > curObvSma) obvAction = "BUY";
  else if (curObv < curObvSma) obvAction = "SELL";

  const price = closes[lastIdx];

  // 1. Oscillators evaluation
  let oscBuy = 0, oscSell = 0, oscNeutral = 0;

  // RSI
  const curRsi = rsi[lastIdx];
  let rsiAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curRsi < 30) rsiAction = "BUY";
  else if (curRsi > 70) rsiAction = "SELL";
  if (rsiAction === "BUY") oscBuy++; else if (rsiAction === "SELL") oscSell++; else oscNeutral++;

  // Stochastic
  const curStochK = stoch.k[lastIdx];
  const curStochD = stoch.d[lastIdx];
  let stochAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curStochK < 20 && curStochK > curStochD) stochAction = "BUY";
  else if (curStochK > 80 && curStochK < curStochD) stochAction = "SELL";
  if (stochAction === "BUY") oscBuy++; else if (stochAction === "SELL") oscSell++; else oscNeutral++;

  // CCI
  const curCCI = cci[lastIdx];
  let cciAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curCCI < -100) cciAction = "BUY";
  else if (curCCI > 100) cciAction = "SELL";
  if (cciAction === "BUY") oscBuy++; else if (cciAction === "SELL") oscSell++; else oscNeutral++;

  // ADX
  const curADX = adxData.adx[lastIdx];
  const curPlusDI = adxData.plusDI[lastIdx];
  const curMinusDI = adxData.minusDI[lastIdx];
  let adxAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curADX > 25) {
    if (curPlusDI > curMinusDI) adxAction = "BUY";
    else if (curMinusDI > curPlusDI) adxAction = "SELL";
  }
  if (adxAction === "BUY") oscBuy++; else if (adxAction === "SELL") oscSell++; else oscNeutral++;

  // AO
  const curAO = ao[lastIdx];
  const prevAO = ao[lastIdx - 1];
  let aoAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curAO > 0 && prevAO <= 0) aoAction = "BUY";
  else if (curAO < 0 && prevAO >= 0) aoAction = "SELL";
  if (aoAction === "BUY") oscBuy++; else if (aoAction === "SELL") oscSell++; else oscNeutral++;

  // Momentum
  const curMom = mom[lastIdx];
  const prevMom = mom[lastIdx - 1];
  let momAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curMom > 0 && prevMom <= 0) momAction = "BUY";
  else if (curMom < 0 && prevMom >= 0) momAction = "SELL";
  if (momAction === "BUY") oscBuy++; else if (momAction === "SELL") oscSell++; else oscNeutral++;

  // MACD
  const curMacd = macdData[lastIdx].macd;
  const curSignal = macdData[lastIdx].signal;
  let macdAction: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (curMacd > curSignal) macdAction = "BUY";
  else if (curMacd < curSignal) macdAction = "SELL";
  if (macdAction === "BUY") oscBuy++; else if (macdAction === "SELL") oscSell++; else oscNeutral++;

  let oscRating: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (oscBuy > oscSell && oscBuy > oscNeutral) oscRating = "BUY";
  else if (oscSell > oscBuy && oscSell > oscNeutral) oscRating = "SELL";

  // 2. Moving Averages evaluation
  let maBuy = 0, maSell = 0, maNeutral = 0;

  const evaluateMA = (maVal: number, currentPrice: number): "BUY" | "SELL" | "NEUTRAL" => {
    if (currentPrice > maVal) return "BUY";
    if (currentPrice < maVal) return "SELL";
    return "NEUTRAL";
  };

  const maItemsList = [
    { name: "ema10", val: ema10[lastIdx] },
    { name: "sma10", val: sma10[lastIdx] },
    { name: "ema20", val: ema20[lastIdx] },
    { name: "sma20", val: sma20[lastIdx] },
    { name: "ema30", val: ema30[lastIdx] },
    { name: "sma30", val: sma30[lastIdx] },
    { name: "ema50", val: ema50[lastIdx] },
    { name: "sma50", val: sma50[lastIdx] },
    { name: "ema100", val: ema100[lastIdx] },
    { name: "sma100", val: sma100[lastIdx] },
    { name: "ema200", val: ema200[lastIdx] },
    { name: "sma200", val: sma200[lastIdx] },
  ];

  const movingAveragesItems: any = {};
  maItemsList.forEach((item) => {
    const act = evaluateMA(item.val, price);
    if (act === "BUY") maBuy++; else if (act === "SELL") maSell++; else maNeutral++;
    movingAveragesItems[item.name] = { value: item.val, action: act };
  });

  let maRating: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
  if (maBuy > maSell) maRating = "BUY";
  else if (maSell > maBuy) maRating = "SELL";

  // 3. Summary Rating Calculation
  const totalBuy = oscBuy + maBuy;
  const totalSell = oscSell + maSell;
  const totalNeutral = oscNeutral + maNeutral;

  let summaryRating: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL" = "NEUTRAL";
  const totalRatingCount = totalBuy + totalSell + totalNeutral;

  if (totalRatingCount > 0) {
    const buyRatio = totalBuy / totalRatingCount;
    const sellRatio = totalSell / totalRatingCount;

    if (buyRatio >= 0.7) summaryRating = "STRONG_BUY";
    else if (buyRatio >= 0.5) summaryRating = "BUY";
    else if (sellRatio >= 0.7) summaryRating = "STRONG_SELL";
    else if (sellRatio >= 0.5) summaryRating = "SELL";
    else summaryRating = "NEUTRAL";
  }

  return {
    summary: {
      rating: summaryRating,
      buyCount: totalBuy,
      sellCount: totalSell,
      neutralCount: totalNeutral,
    },
    oscillators: {
      rating: oscRating,
      buyCount: oscBuy,
      sellCount: oscSell,
      neutralCount: oscNeutral,
      items: {
        rsi: { value: curRsi, action: rsiAction },
        stoch: { k: curStochK, d: curStochD, action: stochAction },
        cci: { value: curCCI, action: cciAction },
        adx: { value: curADX, action: adxAction },
        ao: { value: curAO, action: aoAction },
        momentum: { value: curMom, action: momAction },
        macd: { macd: curMacd, signal: curSignal, action: macdAction },
      },
    },
    movingAverages: {
      rating: maRating,
      buyCount: maBuy,
      sellCount: maSell,
      neutralCount: maNeutral,
      items: movingAveragesItems,
    },
    volatility: {
      atr: curAtr,
    },
    volume: {
      obv: curObv,
      obvAction: obvAction,
    },
  };
}
