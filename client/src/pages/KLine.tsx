// KLine Page - 个人 K 线详情
// OW HUD Reborn Design
// 真正的金融 K 线蜡烛图：每根蜡烛 = 一场对局
// 绿色上涨 = 胜利，红色下跌 = 失败，带实体+上下影线

import { useState, useMemo } from "react";
import { Link } from "wouter";
import NavBar from "@/components/NavBar";
import OWCandlestickChart from "@/components/OWCandlestickChart";
import { personalKLine } from "@/lib/mockData";
import { buildCandleData } from "@/lib/candleData";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus,
  ChevronRight, Shield, Zap, Target, BarChart2
} from "lucide-react";

type ShowCount = 20 | 30 | 50;

export default function KLine() {
  const [showCount, setShowCount] = useState<ShowCount>(20);

  const allCandles = useMemo(() => buildCandleData(personalKLine.matches as any), []);
  const candles = useMemo(() => allCandles.slice(-showCount), [allCandles, showCount]);

  const recentMatches = personalKLine.matches.slice(-10);
  const recentWins = recentMatches.filter((m) => m.matchRet === 1).length;

  // Streak analysis
  const lastCandles = allCandles.slice(-5);
  const streakColor =
    personalKLine.streakType === "win" ? "#22C55E" : "#EF4444";

  // MA line for the visible window
  const ma5 = candles.map((_, i) => {
    if (i < 4) return null;
    const slice = candles.slice(i - 4, i + 1);
    return slice.reduce((s, c) => s + c.close, 0) / 5;
  });

  return (
    <div className="min-h-screen hex-bg" style={{ background: "#0A0E1A" }}>
      <NavBar />
      <div className="pt-14 lg:pt-0 pl-0 lg:pl-56 min-h-screen">

        {/* Page header */}
        <div
          className="border-b"
          style={{ borderColor: "rgba(0,180,216,0.2)", background: "rgba(13,21,38,0.92)", backdropFilter: "blur(8px)" }}
        >
          <div className="container py-3 flex items-center gap-4 flex-wrap">
            <Link href="/">
              <button
                className="flex items-center gap-1.5 transition-colors"
                style={{ fontFamily: "Rajdhani, sans-serif", color: "#64748B", letterSpacing: "0.06em", fontSize: "0.85rem" }}
              >
                <ArrowLeft size={14} />
                返回大盘
              </button>
            </Link>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#E2E8F0", letterSpacing: "0.05em" }}>
              我的排位 K 线
            </div>
            <div className="ml-auto flex items-center gap-2">
              {([20, 30, 50] as ShowCount[]).map((n) => (
                <button
                  key={n}
                  onClick={() => setShowCount(n)}
                  className="px-3 py-1 text-xs transition-all"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    background: showCount === n ? "rgba(0,180,216,0.2)" : "transparent",
                    border: `1px solid ${showCount === n ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                    color: showCount === n ? "#00B4D8" : "#64748B",
                    clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                  }}
                >
                  近{n}场
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container py-5 space-y-5">

          {/* ── Top stat row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-up">
            {[
              {
                label: "当前趋势",
                value: personalKLine.trend === "up" ? "上升" : personalKLine.trend === "down" ? "下行" : "震荡",
                icon: personalKLine.trend === "up" ? <TrendingUp size={15} color="#22C55E" /> : personalKLine.trend === "down" ? <TrendingDown size={15} color="#EF4444" /> : <Minus size={15} color="#EAB308" />,
                color: personalKLine.trend === "up" ? "#22C55E" : personalKLine.trend === "down" ? "#EF4444" : "#EAB308",
              },
              {
                label: personalKLine.streakType === "win" ? "当前连胜" : "当前连败",
                value: `${personalKLine.streakType === "win" ? "+" : "-"}${personalKLine.currentStreak}`,
                icon: null,
                color: streakColor,
              },
              {
                label: "近50场胜率",
                value: `${(personalKLine.winRate * 100).toFixed(0)}%`,
                icon: <BarChart2 size={14} color="#00B4D8" />,
                color: "#00B4D8",
              },
              {
                label: "近10场战绩",
                value: `${recentWins}W${10 - recentWins}L`,
                icon: null,
                color: recentWins >= 6 ? "#22C55E" : recentWins >= 4 ? "#EAB308" : "#EF4444",
              },
            ].map((s) => (
              <div key={s.label} className="ow-card p-4 text-center">
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                  {s.label}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {s.icon}
                  <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.4rem", color: s.color }}>
                    {s.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Candlestick Chart ── */}
          <div className="ow-card-lg p-5 fade-in-up delay-100">
            <div className="flex items-center justify-between mb-1">
              <div className="ow-section-title text-sm">
                个人排位 K 线（近{showCount}场）
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "Noto Sans SC, sans-serif", color: "#475569" }}>
                <span className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(34,197,94,0.8)", border: "1px solid #22C55E", borderRadius: 1 }} />
                  胜利（上涨）
                </span>
                <span className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(239,68,68,0.8)", border: "1px solid #EF4444", borderRadius: 1 }} />
                  失败（下跌）
                </span>
                <span className="flex items-center gap-1.5">
                  <span style={{ display: "inline-block", width: 10, height: 2, background: "rgba(249,115,22,0.5)", borderTop: "1px dashed #F97316" }} />
                  零轴
                </span>
              </div>
            </div>

            {/* Price ticker */}
            <div className="flex items-center gap-4 mb-3 px-1">
              {(() => {
                const last = candles[candles.length - 1];
                const prev = candles[candles.length - 2];
                if (!last || !prev) return null;
                const change = last.close - prev.close;
                const isUp = change >= 0;
                return (
                  <>
                    <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.5rem", color: isUp ? "#22C55E" : "#EF4444" }}>
                      {last.close >= 0 ? "+" : ""}{last.close.toFixed(0)}
                    </span>
                    <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.8rem", color: isUp ? "#22C55E" : "#EF4444" }}>
                      {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}
                    </span>
                    <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#475569" }}>
                      累计分 · 开: {last.open >= 0 ? "+" : ""}{last.open.toFixed(1)} 高: {last.high >= 0 ? "+" : ""}{last.high.toFixed(1)} 低: {last.low >= 0 ? "+" : ""}{last.low.toFixed(1)}
                    </span>
                  </>
                );
              })()}
            </div>

            <OWCandlestickChart data={candles} height={340} />

            {/* Chart footer */}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#334155" }}>
                纵轴 = 累计分数（胜+1 / 负-1）· 每根蜡烛 = 一场对局 · 影线 = 对局内波动
              </span>
            </div>
          </div>

          {/* ── Win/Loss strip ── */}
          <div className="ow-card p-4 fade-in-up delay-200">
            <div className="ow-section-title text-sm mb-3">近{showCount}场胜负序列</div>
            <div className="flex flex-wrap gap-1">
              {candles.map((c, i) => {
                const isWin = c.matchRet === 1;
                const isLoss = c.matchRet === -1;
                const color = isWin ? "#22C55E" : isLoss ? "#EF4444" : "#EAB308";
                const bg = isWin ? "rgba(34,197,94,0.75)" : isLoss ? "rgba(239,68,68,0.75)" : "rgba(234,179,8,0.75)";
                return (
                  <div
                    key={i}
                    title={`第${c.index}场: ${isWin ? "胜" : isLoss ? "负" : "平"} · ${c.hero} · ${c.map}`}
                    style={{
                      width: 20, height: 20,
                      background: bg,
                      clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                      boxShadow: `0 0 4px ${color}60`,
                      cursor: "default",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.6rem", color: "#0A0E1A" }}>
                      {isWin ? "W" : isLoss ? "L" : "D"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Stop-loss + Analysis ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in-up delay-300">
            {/* Stop-loss */}
            <div className="ow-card p-5">
              <div className="ow-section-title text-sm mb-4">
                <Shield size={14} className="ml-1" />
                止损建议
              </div>
              <div className="space-y-3">
                <div
                  className="flex items-start gap-2.5 p-3 rounded-sm"
                  style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
                >
                  <span style={{ fontSize: "1rem" }}>✅</span>
                  <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.6 }}>
                    <span style={{ color: "#22C55E", fontWeight: 700 }}>当前连胜 {personalKLine.currentStreak} 局</span>
                    <br />K 线趋势向上，状态良好，可继续排位
                  </div>
                </div>
                <div
                  className="flex items-start gap-2.5 p-3 rounded-sm"
                  style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}
                >
                  <span style={{ fontSize: "1rem" }}>⚠️</span>
                  <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.6 }}>
                    <span style={{ color: "#EAB308", fontWeight: 700 }}>建议止损线：连败 2 局</span>
                    <br />连续出现 2 根红色蜡烛后，建议暂停休息
                  </div>
                </div>
                <div
                  className="flex items-start gap-2.5 p-3 rounded-sm"
                  style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.2)" }}
                >
                  <span style={{ fontSize: "1rem" }}>📊</span>
                  <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8", lineHeight: 1.6 }}>
                    <span style={{ color: "#00B4D8", fontWeight: 700 }}>今日上分窗口：中等</span>
                    <br />结合大盘天气指数 62，当前可以入场
                  </div>
                </div>
              </div>
            </div>

            {/* Data analysis */}
            <div className="ow-card p-5">
              <div className="ow-section-title text-sm mb-4">
                <Target size={14} className="ml-1" />
                数据分析
              </div>
              <div className="space-y-3">
                {[
                  { label: "近50场胜率", value: `${(personalKLine.winRate * 100).toFixed(1)}%`, color: "#00B4D8", bar: personalKLine.winRate * 100 },
                  { label: "连胜动能", value: `${personalKLine.currentStreak}连胜`, color: "#22C55E", bar: Math.min(personalKLine.currentStreak * 15, 100) },
                  { label: "近10场胜率", value: `${recentWins * 10}%`, color: recentWins >= 6 ? "#22C55E" : recentWins >= 4 ? "#EAB308" : "#EF4444", bar: recentWins * 10 },
                  { label: "胜场 / 总场", value: `${personalKLine.winCount}/${personalKLine.totalCount}`, color: "#F97316", bar: (personalKLine.winCount / personalKLine.totalCount) * 100 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#64748B" }}>{item.label}</span>
                      <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.75rem", color: item.color, fontWeight: 700 }}>{item.value}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${item.bar}%`, background: item.color,
                        borderRadius: 2, boxShadow: `0 0 6px ${item.color}`,
                        transition: "width 1s cubic-bezier(0.23,1,0.32,1)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t flex gap-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <Link href="/submit">
                  <button className="ow-btn text-xs flex items-center gap-1">
                    <Zap size={11} />
                    提交数据
                  </button>
                </Link>
                <button
                  className="ow-btn text-xs flex items-center gap-1"
                  onClick={() => alert("分享功能即将上线")}
                >
                  分享K线图 <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Recent match table ── */}
          <div className="ow-card p-5 fade-in-up delay-400">
            <div className="ow-section-title text-sm mb-4">最近对局记录</div>
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["#", "结果", "英雄", "地图", "时长", "累计分", "段位"].map((h) => (
                      <th key={h} style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.5rem 0.75rem", textAlign: "left" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {personalKLine.matches.slice(-10).reverse().map((m, i) => {
                    const isWin = m.matchRet === 1;
                    const isLoss = m.matchRet === -1;
                    const resultColor = isWin ? "#22C55E" : isLoss ? "#EF4444" : "#EAB308";
                    const idx = personalKLine.matches.length - i;
                    return (
                      <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#334155" }}>
                          {idx}
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>
                          <div className="flex items-center gap-1.5">
                            <span style={{
                              display: "inline-block", width: 8, height: 8,
                              background: resultColor, borderRadius: 1,
                              boxShadow: `0 0 4px ${resultColor}`,
                            }} />
                            <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: resultColor }}>
                              {isWin ? "胜" : isLoss ? "负" : "平"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#94A3B8" }}>{m.hero}</td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.8rem", color: "#64748B" }}>{m.map}</td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "Orbitron, monospace", fontSize: "0.7rem", color: "#475569" }}>
                          {Math.floor(m.duration / 60)}:{String(m.duration % 60).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "Orbitron, monospace", fontSize: "0.75rem", color: m.cumulativeScore >= 0 ? "#22C55E" : "#EF4444", fontWeight: 700 }}>
                          {m.cumulativeScore >= 0 ? "+" : ""}{m.cumulativeScore}
                        </td>
                        <td style={{ padding: "0.5rem 0.75rem", fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#64748B" }}>
                          {m.rankTier === "gold" ? "黄金" : "白金"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
