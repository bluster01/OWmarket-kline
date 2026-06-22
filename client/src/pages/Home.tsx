// Home Page - 大盘首页
// OW HUD Reborn Design: Deep navy bg, cyan glow, orange accents
// Shows: Weather index, community K-line (candlestick), tier breakdown, advice panel

import { useState, useEffect } from "react";
import { Link } from "wouter";
import NavBar from "@/components/NavBar";
import CommunityCandlestickChart from "@/components/CommunityCandlestickChart";
import {
  todayIndex, tierIndices, modeBreakdown, dutyBreakdown, getWeatherInfo
} from "@/lib/mockData";
import { buildCommunityCandles } from "@/lib/candleData";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Info, ChevronRight, Zap } from "lucide-react";

// Animated counter hook
function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// Circular progress gauge
function CircularGauge({ value, max = 100, color, size = 80 }: { value: number; max?: number; color: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;
  const dashOffset = circumference - progress;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.23,1,0.32,1)", filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

export default function Home() {
  const weather = getWeatherInfo(todayIndex.sentimentScore);
  const sentimentCounter = useCounter(todayIndex.sentimentScore);
  const toxicityCounter = useCounter(todayIndex.toxicityRatio);
  const [selectedMode, setSelectedMode] = useState<"sport" | "leisure" | "fight">("sport");

  const communityCandles = buildCommunityCandles();
  const lastCandle = communityCandles[communityCandles.length - 1];
  const prevCandle = communityCandles[communityCandles.length - 2];
  const dayChange = lastCandle.close - prevCandle.close;
  const isDayUp = dayChange >= 0;

  const modeLabels: Record<string, string> = { sport: "竞技", leisure: "快速", fight: "角斗" };

  return (
    <div className="min-h-screen hex-bg" style={{ background: "#0A0E1A" }}>
      <NavBar />
      <div className="pt-14 lg:pt-0 pl-0 lg:pl-56 min-h-screen">

        {/* Hero banner */}
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0A0E1A 0%, #0D1526 50%, #0A0E1A 100%)", borderBottom: "1px solid rgba(0,180,216,0.2)" }}>
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/309926361772947966/7XWvfcHGSfqvTqbbpsbnaZ/ow-hero-bg-4KjobAZAzSCTtPe9Z5rEbD.webp)`, backgroundSize: "cover", backgroundPosition: "center right" }} />
          <div className="relative container py-5 lg:py-7">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="fade-in-up">
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#00B4D8", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
                  OVERWATCH CN SERVER · SEASON 16
                </div>
                <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#E2E8F0", lineHeight: 1.1 }}>
                  国服排位情绪大盘
                </h1>
                <p style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.85rem", color: "#64748B", marginTop: "0.25rem" }}>
                  先看大盘，再上分 · 基于社区自愿授权样本
                </p>
              </div>
              <div className="flex gap-2 fade-in-up delay-100">
                {(["sport", "leisure", "fight"] as const).map((mode) => (
                  <button key={mode} onClick={() => setSelectedMode(mode)} className="px-3 py-1.5 text-sm transition-all duration-150" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600, letterSpacing: "0.06em", background: selectedMode === mode ? "rgba(0,180,216,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedMode === mode ? "#00B4D8" : "rgba(255,255,255,0.1)"}`, color: selectedMode === mode ? "#00B4D8" : "#64748B", clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))" }}>
                    {modeLabels[mode]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container py-5 space-y-5">

          {/* Top 3 index cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weather */}
            <div className="ow-card p-5 fade-in-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.7rem", color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase" }}>上分天气</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontSize: "1.5rem" }}>{weather.emoji}</span>
                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: weather.color }}>{weather.label}</span>
                  </div>
                </div>
                <div className="relative">
                  <CircularGauge value={sentimentCounter} color={weather.color} size={72} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1rem", color: weather.color }}>{sentimentCounter}</span>
                  </div>
                </div>
              </div>
              <div className="ow-divider" />
              <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#64748B", lineHeight: 1.5 }}>
                情绪指数 {sentimentCounter}/100 · 建议{sentimentCounter >= 60 ? "入场" : sentimentCounter >= 50 ? "谨慎" : "观望"}
              </div>
            </div>

            {/* Loss streak */}
            <div className="ow-card p-5 fade-in-up delay-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.7rem", color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase" }}>连败压力</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: todayIndex.lossStreakRate < 0.2 ? "#22C55E" : todayIndex.lossStreakRate < 0.3 ? "#EAB308" : "#EF4444" }}>
                      {todayIndex.lossStreakRate < 0.2 ? "正常" : todayIndex.lossStreakRate < 0.3 ? "偏高" : "危险"}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <CircularGauge value={Math.round(todayIndex.lossStreakRate * 100)} color={todayIndex.lossStreakRate < 0.2 ? "#22C55E" : "#EAB308"} size={72} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "0.9rem", color: "#E2E8F0" }}>{Math.round(todayIndex.lossStreakRate * 100)}%</span>
                  </div>
                </div>
              </div>
              <div className="ow-divider" />
              <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#64748B", lineHeight: 1.5 }}>
                {Math.round(todayIndex.lossStreakRate * 100)}% 玩家处于连败中 · 处于≥2连败
              </div>
            </div>

            {/* Toxicity */}
            <div className="ow-card p-5 fade-in-up delay-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.7rem", color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase" }}>毒池指数</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: toxicityCounter < 30 ? "#22C55E" : toxicityCounter < 50 ? "#EAB308" : "#EF4444" }}>
                      {toxicityCounter < 30 ? "偏低" : toxicityCounter < 50 ? "中等" : "偏高"}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <CircularGauge value={toxicityCounter} color={toxicityCounter < 30 ? "#22C55E" : "#EAB308"} size={72} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1rem", color: "#E2E8F0" }}>{toxicityCounter}</span>
                  </div>
                </div>
              </div>
              <div className="ow-divider" />
              <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#64748B", lineHeight: 1.5 }}>
                毒池指数 {toxicityCounter}/100 · 连败集中度{toxicityCounter < 30 ? "正常" : "偏高"}
              </div>
            </div>
          </div>

          {/* Community Candlestick K-Line */}
          <div className="ow-card-lg p-5 fade-in-up delay-200">
            <div className="flex items-center justify-between mb-3">
              <div className="ow-section-title text-base">社区大盘 K 线</div>
              <div className="flex items-center gap-3">
                {/* Day change ticker */}
                <div className="flex items-center gap-1.5">
                  <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "0.9rem", color: isDayUp ? "#22C55E" : "#EF4444" }}>
                    {(lastCandle.close * 100).toFixed(2)}%
                  </span>
                  <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.75rem", color: isDayUp ? "#22C55E" : "#EF4444" }}>
                    {isDayUp ? "▲" : "▼"} {Math.abs(dayChange * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="ow-badge" style={{ color: "#22C55E", borderColor: "#22C55E" }}>实时</div>
              </div>
            </div>

            {/* OHLC summary bar */}
            <div className="flex items-center gap-4 mb-3 px-1 flex-wrap">
              {[
                { label: "开", value: `${(lastCandle.open * 100).toFixed(2)}%`, color: "#94A3B8" },
                { label: "高", value: `${(lastCandle.high * 100).toFixed(2)}%`, color: "#22C55E" },
                { label: "低", value: `${(lastCandle.low * 100).toFixed(2)}%`, color: "#EF4444" },
                { label: "收", value: `${(lastCandle.close * 100).toFixed(2)}%`, color: isDayUp ? "#22C55E" : "#EF4444" },
                { label: "量", value: `${lastCandle.volume.toLocaleString()}场`, color: "#64748B" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569" }}>{item.label}</span>
                  <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.75rem", color: item.color, fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>

            <CommunityCandlestickChart data={communityCandles} height={260} />

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(34,197,94,0.8)", border: "1px solid #22C55E", borderRadius: 1 }} />
                <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#64748B" }}>胜率上升</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(239,68,68,0.8)", border: "1px solid #EF4444", borderRadius: 1 }} />
                <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#64748B" }}>胜率下降</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ display: "inline-block", width: 20, height: 1, borderTop: "1px dashed #F97316" }} />
                <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#64748B" }}>50% 基准线</span>
              </div>
              <div className="ml-auto" style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#475569" }}>
                样本: {todayIndex.sampleSize.toLocaleString()} 人 / {todayIndex.totalMatches.toLocaleString()} 场
              </div>
            </div>
          </div>

          {/* Tier breakdown + Duty/Mode */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="ow-card p-5 fade-in-up delay-300">
              <div className="ow-section-title text-sm mb-4">分段指数</div>
              <div className="space-y-2.5">
                {tierIndices.map((tier) => (
                  <div key={tier.tier} className="flex items-center gap-3">
                    <div className="ow-badge text-xs flex-shrink-0" style={{ color: tier.tierColor, borderColor: tier.tierColor, minWidth: "2.5rem", textAlign: "center" }}>
                      {tier.tierLabel}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.75rem", color: "#E2E8F0" }}>{tier.sentimentScore}</span>
                        <div className="flex items-center gap-1">
                          {tier.trend === "up" && <TrendingUp size={12} color="#22C55E" />}
                          {tier.trend === "down" && <TrendingDown size={12} color="#EF4444" />}
                          {tier.trend === "sideways" && <Minus size={12} color="#94A3B8" />}
                          <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: tier.trend === "up" ? "#22C55E" : tier.trend === "down" ? "#EF4444" : "#94A3B8" }}>
                            {tier.trendValue > 0 ? `+${tier.trendValue}` : tier.trendValue === 0 ? "±0" : tier.trendValue}
                          </span>
                        </div>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${tier.sentimentScore}%`, background: tier.sentimentScore >= 55 ? "#22C55E" : tier.sentimentScore >= 45 ? "#EAB308" : "#EF4444", borderRadius: 2, transition: "width 1s cubic-bezier(0.23,1,0.32,1)", boxShadow: `0 0 6px ${tier.sentimentScore >= 55 ? "#22C55E" : tier.sentimentScore >= 45 ? "#EAB308" : "#EF4444"}` }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#475569", minWidth: "2.5rem", textAlign: "right" }}>
                      {(tier.winRate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="ow-card p-4 fade-in-up delay-400">
                <div className="ow-section-title text-sm mb-3">职责指数</div>
                <div className="grid grid-cols-3 gap-2">
                  {dutyBreakdown.map((duty) => (
                    <div key={duty.duty} className="text-center p-2.5 rounded-sm" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#94A3B8", marginBottom: "0.25rem" }}>{duty.label}</div>
                      <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.1rem", color: duty.sentimentScore >= 60 ? "#22C55E" : duty.sentimentScore >= 50 ? "#00B4D8" : "#EAB308" }}>{duty.sentimentScore}</div>
                      <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#475569", marginTop: "0.1rem" }}>{(duty.winRate * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ow-card p-4 fade-in-up delay-500">
                <div className="ow-section-title text-sm mb-3">模式指数</div>
                <div className="space-y-2">
                  {modeBreakdown.map((mode) => (
                    <div key={mode.mode} className="flex items-center gap-3">
                      <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8", minWidth: "2rem" }}>{mode.label}</span>
                      <div className="flex-1" style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${mode.sentimentScore}%`, background: "linear-gradient(90deg, #00B4D8, #0CC8EE)", borderRadius: 3, boxShadow: "0 0 6px rgba(0,180,216,0.4)" }} />
                      </div>
                      <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.7rem", color: "#00B4D8", minWidth: "1.5rem" }}>{mode.sentimentScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advice panel */}
          <div className="ow-card p-5 fade-in-up delay-400">
            <div className="ow-section-title text-sm mb-4">
              <Zap size={14} className="ml-1" />
              今日建议
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 p-3 rounded-sm" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <CheckCircle size={14} color="#22C55E" className="mt-0.5 flex-shrink-0" />
                <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.5 }}>
                  <span style={{ color: "#22C55E", fontWeight: 700 }}>上分窗口：中等偏上</span><br />整体环境偏暖，可以入场
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle size={14} color="#EF4444" className="mt-0.5 flex-shrink-0" />
                <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.5 }}>
                  <span style={{ color: "#EF4444", fontWeight: 700 }}>钻石段连败率偏高</span><br />钻石及以上段位谨慎入场
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-sm" style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.2)" }}>
                <Info size={14} color="#00B4D8" className="mt-0.5 flex-shrink-0" />
                <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.5 }}>
                  <span style={{ color: "#00B4D8", fontWeight: 700 }}>黄金段胜率上升</span><br />黄金-白金段可以积极入场
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#334155" }}>
                ⚠️ 所有指数仅为概率统计，不构成任何形式的预测或保证
              </span>
              <Link href="/kline">
                <button className="flex items-center gap-1 text-xs transition-colors" style={{ fontFamily: "Rajdhani, sans-serif", color: "#00B4D8", letterSpacing: "0.06em" }}>
                  查看我的K线 <ChevronRight size={12} />
                </button>
              </Link>
            </div>
          </div>

          {/* Stats footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-up delay-500">
            {[
              { label: "样本玩家", value: todayIndex.sampleSize.toLocaleString(), unit: "人", color: "#00B4D8" },
              { label: "今日对局", value: todayIndex.totalMatches.toLocaleString(), unit: "场", color: "#F97316" },
              { label: "7日胜率", value: `${(todayIndex.winRate7d * 100).toFixed(1)}`, unit: "%", color: "#22C55E" },
              { label: "波动率", value: todayIndex.volatility.toFixed(1), unit: "", color: "#EAB308" },
            ].map((stat) => (
              <div key={stat.label} className="ow-card p-3 text-center">
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{stat.label}</div>
                <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.3rem", color: stat.color }}>
                  {stat.value}<span style={{ fontSize: "0.7rem", marginLeft: "0.1rem" }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
