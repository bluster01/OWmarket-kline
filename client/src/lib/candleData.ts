// candleData.ts
// Converts raw match records into OHLC candlestick data
// Each candle = one match
// Cumulative score is the "price"
// Win = green candle (close > open), Loss = red candle (close < open)
// Wicks simulate intra-match volatility

import type { CandleData } from "@/components/OWCandlestickChart";

interface RawMatch {
  id: string;
  matchRet: 1 | 0 | -1;
  hero: string;
  map: string;
  duration: number;
  cumulativeScore: number;
  rankTier: string;
}

export function buildCandleData(matches: RawMatch[]): CandleData[] {
  return matches.map((m, i) => {
    const prevScore = i === 0 ? m.cumulativeScore - m.matchRet : matches[i - 1].cumulativeScore;
    const open = prevScore;
    const close = m.cumulativeScore;

    // Simulate wicks: wins have upper wick, losses have lower wick
    const wickSize = 0.3 + Math.random() * 0.5;
    let high: number;
    let low: number;

    if (m.matchRet === 1) {
      // Green candle: close > open, upper wick above close, small lower wick
      high = close + wickSize;
      low = open - wickSize * 0.3;
    } else if (m.matchRet === -1) {
      // Red candle: close < open, lower wick below close, small upper wick
      high = open + wickSize * 0.3;
      low = close - wickSize;
    } else {
      // Doji: open ≈ close
      high = open + wickSize * 0.5;
      low = open - wickSize * 0.5;
    }

    return {
      index: i + 1,
      open,
      high,
      low,
      close,
      matchRet: m.matchRet,
      hero: m.hero,
      map: m.map,
      duration: m.duration,
      rankTier: m.rankTier,
      cumulativeScore: m.cumulativeScore,
    };
  });
}

// Community K-line: each candle = one day
// Open = previous day's close winRate, Close = today's winRate
export interface DayCandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // total matches
  trend: "up" | "down" | "flat";
}

export function buildCommunityCandles(): DayCandleData[] {
  const raw = [
    { date: "06/08", wr: 0.498, vol: 3200 },
    { date: "06/09", wr: 0.503, vol: 3400 },
    { date: "06/10", wr: 0.515, vol: 4100 },
    { date: "06/11", wr: 0.521, vol: 4300 },
    { date: "06/12", wr: 0.509, vol: 3900 },
    { date: "06/13", wr: 0.494, vol: 3600 },
    { date: "06/14", wr: 0.488, vol: 3100 },
    { date: "06/15", wr: 0.501, vol: 3800 },
    { date: "06/16", wr: 0.513, vol: 4200 },
    { date: "06/17", wr: 0.519, vol: 4500 },
    { date: "06/18", wr: 0.507, vol: 4000 },
    { date: "06/19", wr: 0.495, vol: 3700 },
    { date: "06/20", wr: 0.502, vol: 3900 },
    { date: "06/21", wr: 0.508, vol: 4200 },
    { date: "06/22", wr: 0.512, vol: 4876 },
  ];

  return raw.map((d, i) => {
    const open = i === 0 ? d.wr - 0.001 : raw[i - 1].wr;
    const close = d.wr;
    const isUp = close >= open;
    const wickRange = 0.002 + Math.random() * 0.004;
    const high = Math.max(open, close) + (isUp ? wickRange : wickRange * 0.4);
    const low = Math.min(open, close) - (isUp ? wickRange * 0.4 : wickRange);
    return {
      date: d.date,
      open,
      high,
      low,
      close,
      volume: d.vol,
      trend: close > open ? "up" : close < open ? "down" : "flat",
    };
  });
}
