// KLine Page v3.0 - 个人 K 线详情 · 完整技术分析
// 功能：K线图 + MA/布林带 + RSI/MACD 副图 + 成交量 + 形态识别 + 数据统计面板
// OW HUD Reborn Design

import { useState, useMemo } from "react";
import { Link } from "wouter";
import NavBar from "@/components/NavBar";
import OWCandlestickChart, { type IndicatorType } from "@/components/OWCandlestickChart";
import RSIMACDChart from "@/components/RSIMACDChart";
import StatsPanel from "@/components/StatsPanel";
import { personalKLine } from "@/lib/mockData";
import { buildCandleData } from "@/lib/candleData";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus,
  BarChart2, Activity, Target, Shield, Zap,
  ChevronDown, ChevronUp
} from "lucide-react";

type ShowCount = 20 | 30 | 50;
type SubPanel = "rsi" | "macd";
type ActiveTab = "chart" | "stats";

export default function KLine() {
  const [showCount, setShowCount] = useState<ShowCount>(30);
  const [indicator, setIndicator] = useState<IndicatorType>("ma");
  const [subPanel, setSubPanel] = useState<SubPanel>("rsi");
  const [showVolume, setShowVolume] = useState(true);
  const [showPatterns, setShowPatterns] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chart");
  const [showStopLoss, setShowStopLoss] = useState(true);

  const allCandles = useMemo(() => buildCandleData(personalKLine.matches as any), []);
  const candles = useMemo(() => allCandles.slice(-showCount), [allCandles, showCount]);

  const recentMatches = personalKLine.matches.slice(-10);
  const recentWins = recentMatches.filter((m) => m.matchRet === 1).length;
  const streakColor = personalKLine.streakType === "win" ? "#22C55E" : "#EF4444";

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const change = last && prev ? last.close - prev.close : 0;
  const isUp = change >= 0;

  return (
    <div className="min-h-screen hex-bg" style={{ background: "#0A0E1A" }}>
      <NavBar />
      <div className="pt-14 lg:pt-0 pl-0 lg:pl-56 min-h-screen">

        {/* ── Page header ── */}
        <div className="border-b sticky top-0 lg:top-0 z-30"
          style={{ borderColor: "rgba(0,180,216,0.2)", background: "rgba(8,12,24,0.97)", backdropFilter: "blur(12px)" }}>
          <div className="container py-2.5 flex items-center gap-3 flex-wrap">
            <Link href="/">
              <button className="flex items-center gap-1.5 transition-colors"
                style={{ fontFamily: "Rajdhani, sans-serif", color: "#64748B", letterSpacing: "0.06em", fontSize: "0.85rem" }}>
                <ArrowLeft size={14} />返回大盘
              </button>
            </Link>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#E2E8F0", letterSpacing: "0.05em" }}>
              我的排位 K 线
            </div>

            {/* Live price ticker */}
            {last && (
              <div className="flex items-center gap-2 ml-2">
                <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.1rem", color: isUp ? "#22C55E" : "#EF4444" }}>
                  {last.close >= 0 ? "+" : ""}{last.close.toFixed(0)}
                </span>
                <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.7rem", color: isUp ? "#22C55E" : "#EF4444" }}>
                  {isUp ? "▲" : "▼"}{Math.abs(change).toFixed(1)}
                </span>
              </div>
            )}

            {/* Show count */}
            <div className="ml-auto flex items-center gap-1.5">
              {([20, 30, 50] as ShowCount[]).map((n) => (
                <button key={n} onClick={() => setShowCount(n)}
                  className="px-2.5 py-1 text-xs transition-all"
                  style={{
                    fontFamily: "Orbitron, monospace",
                    background: showCount === n ? "rgba(0,180,216,0.2)" : "transparent",
                    border: `1px solid ${showCount === n ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                    color: showCount === n ? "#00B4D8" : "#64748B",
                    clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                  }}>
                  近{n}场
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container py-4 space-y-4">

          {/* ── Top stat row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-up">
            {[
              {
                label: "当前趋势",
                value: personalKLine.trend === "up" ? "上升" : personalKLine.trend === "down" ? "下行" : "震荡",
                icon: personalKLine.trend === "up" ? <TrendingUp size={14} color="#22C55E" /> : personalKLine.trend === "down" ? <TrendingDown size={14} color="#EF4444" /> : <Minus size={14} color="#EAB308" />,
                color: personalKLine.trend === "up" ? "#22C55E" : personalKLine.trend === "down" ? "#EF4444" : "#EAB308",
                sub: "TREND",
              },
              {
                label: personalKLine.streakType === "win" ? "当前连胜" : "当前连败",
                value: `${personalKLine.streakType === "win" ? "+" : "-"}${personalKLine.currentStreak}`,
                icon: <Activity size={14} color={streakColor} />,
                color: streakColor,
                sub: "STREAK",
              },
              {
                label: "近50场胜率",
                value: `${(personalKLine.winRate * 100).toFixed(1)}%`,
                icon: <BarChart2 size={14} color="#00B4D8" />,
                color: "#00B4D8",
                sub: "WIN RATE",
              },
              {
                label: "近10场战绩",
                value: `${recentWins}W${10 - recentWins}L`,
                icon: <Target size={14} color={recentWins >= 6 ? "#22C55E" : recentWins >= 4 ? "#EAB308" : "#EF4444"} />,
                color: recentWins >= 6 ? "#22C55E" : recentWins >= 4 ? "#EAB308" : "#EF4444",
                sub: "RECENT",
              },
            ].map((s) => (
              <div key={s.label} className="ow-card p-4">
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.5rem", color: "#334155", letterSpacing: "0.15em", marginBottom: 4 }}>
                  {s.sub}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {s.icon}
                  <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569" }}>{s.label}</span>
                </div>
                <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.5rem", color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Tab switcher ── */}
          <div className="flex gap-2 fade-in-up">
            {(["chart", "stats"] as ActiveTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-4 py-2 text-sm transition-all"
                style={{
                  fontFamily: "Rajdhani, sans-serif", fontWeight: 700, letterSpacing: "0.08em",
                  background: activeTab === tab ? "rgba(0,180,216,0.15)" : "transparent",
                  border: `1px solid ${activeTab === tab ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                  color: activeTab === tab ? "#00B4D8" : "#64748B",
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                }}>
                {tab === "chart" ? "📈 K线图表" : "📊 数据统计"}
              </button>
            ))}
          </div>

          {/* ── CHART TAB ── */}
          {activeTab === "chart" && (
            <>
              {/* Main chart card */}
              <div className="ow-card-lg p-4 fade-in-up">
                {/* Chart toolbar */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="ow-section-title text-sm" style={{ marginBottom: 0 }}>
                    个人排位 K 线（近{showCount}场）
                  </div>

                  {/* Indicator selector */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569", letterSpacing: "0.08em" }}>指标</span>
                    {([
                      { key: "none", label: "无" },
                      { key: "ma", label: "MA" },
                      { key: "bollinger", label: "BOLL" },
                    ] as { key: IndicatorType; label: string }[]).map(opt => (
                      <button key={opt.key} onClick={() => setIndicator(opt.key)}
                        className="px-2 py-0.5 text-xs transition-all"
                        style={{
                          fontFamily: "Orbitron, monospace",
                          background: indicator === opt.key ? "rgba(0,180,216,0.2)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${indicator === opt.key ? "#00B4D8" : "rgba(255,255,255,0.08)"}`,
                          color: indicator === opt.key ? "#00B4D8" : "#475569",
                          borderRadius: 2,
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Toggle options */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowVolume(v => !v)}
                      className="px-2 py-0.5 text-xs transition-all"
                      style={{
                        fontFamily: "Orbitron, monospace",
                        background: showVolume ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${showVolume ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: showVolume ? "#F97316" : "#475569",
                        borderRadius: 2,
                      }}>VOL</button>
                    <button onClick={() => setShowPatterns(v => !v)}
                      className="px-2 py-0.5 text-xs transition-all"
                      style={{
                        fontFamily: "Orbitron, monospace",
                        background: showPatterns ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${showPatterns ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.08)"}`,
                        color: showPatterns ? "#A78BFA" : "#475569",
                        borderRadius: 2,
                      }}>形态</button>
                  </div>
                </div>

                {/* Indicator legend */}
                <div className="flex items-center gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(34,197,94,0.8)", border: "1px solid #22C55E", borderRadius: 1 }} />
                      <span style={{ fontFamily: "Noto Sans SC, sans-serif", color: "#475569" }}>胜利</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span style={{ display: "inline-block", width: 10, height: 10, background: "rgba(239,68,68,0.8)", border: "1px solid #EF4444", borderRadius: 1 }} />
                      <span style={{ fontFamily: "Noto Sans SC, sans-serif", color: "#475569" }}>失败</span>
                    </span>
                  </div>
                  {indicator === "ma" && (
                    <div className="flex items-center gap-3 text-xs">
                      {[["MA5", "#F97316"], ["MA10", "#00B4D8"], ["MA20", "#A78BFA"]].map(([label, color]) => (
                        <span key={label} className="flex items-center gap-1.5">
                          <span style={{ display: "inline-block", width: 16, height: 2, background: color as string }} />
                          <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: color as string }}>{label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {indicator === "bollinger" && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span style={{ display: "inline-block", width: 16, height: 2, background: "#A78BFA" }} />
                        <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#A78BFA" }}>BOLL(20,2)</span>
                      </span>
                    </div>
                  )}
                  {showPatterns && (
                    <div className="flex items-center gap-3 text-xs">
                      {[["🔨 锤子线", "#22C55E"], ["★ 流星线", "#EF4444"], ["✛ 十字星", "#EAB308"], ["↑ 看涨吞没", "#22C55E"]].map(([label, color]) => (
                        <span key={label} style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.65rem", color: color as string }}>{label}</span>
                      ))}
                    </div>
                  )}
                </div>

                <OWCandlestickChart
                  data={candles}
                  height={360}
                  indicator={indicator}
                  showVolume={showVolume}
                  showPatterns={showPatterns}
                />

                <div className="flex items-center gap-3 mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.68rem", color: "#334155" }}>
                    纵轴 = 累计分数（胜+1/负-1）· 每根蜡烛 = 一场对局 · 影线 = 对局内波动 · VOL柱 = 对局时长
                  </span>
                </div>
              </div>

              {/* ── Sub panel: RSI / MACD ── */}
              <div className="ow-card-lg p-4 fade-in-up">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-1.5">
                    {(["rsi", "macd"] as SubPanel[]).map(p => (
                      <button key={p} onClick={() => setSubPanel(p)}
                        className="px-3 py-1 text-xs transition-all"
                        style={{
                          fontFamily: "Orbitron, monospace",
                          background: subPanel === p ? "rgba(0,180,216,0.2)" : "transparent",
                          border: `1px solid ${subPanel === p ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                          color: subPanel === p ? "#00B4D8" : "#64748B",
                          clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                        }}>
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#475569" }}>
                    {subPanel === "rsi"
                      ? "RSI(14) · >70超买（止盈考虑）· <30超卖（可能反弹）"
                      : "MACD(12,26,9) · DIF穿越DEA向上=看涨信号 · 柱绿转红=动能减弱"}
                  </div>
                  {subPanel === "macd" && (
                    <div className="flex items-center gap-3 ml-auto text-xs">
                      {[["DIF", "#00B4D8"], ["DEA", "#F97316"]].map(([label, color]) => (
                        <span key={label} className="flex items-center gap-1.5">
                          <span style={{ display: "inline-block", width: 14, height: 2, background: color as string }} />
                          <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: color as string }}>{label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <RSIMACDChart data={candles} activePanel={subPanel} />
              </div>

              {/* ── Win/Loss strip ── */}
              <div className="ow-card p-4 fade-in-up">
                <div className="ow-section-title text-sm mb-3">近{showCount}场胜负序列</div>
                <div className="flex flex-wrap gap-1">
                  {candles.map((c, i) => {
                    const isWin = c.matchRet === 1;
                    const isLoss = c.matchRet === -1;
                    const color = isWin ? "#22C55E" : isLoss ? "#EF4444" : "#EAB308";
                    const bg = isWin ? "rgba(34,197,94,0.75)" : isLoss ? "rgba(239,68,68,0.75)" : "rgba(234,179,8,0.75)";
                    return (
                      <div key={i}
                        title={`第${c.index}场: ${isWin ? "胜" : isLoss ? "负" : "平"} · ${c.hero} · ${c.map}`}
                        style={{
                          width: 22, height: 22, background: bg,
                          clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                          boxShadow: `0 0 4px ${color}60`,
                          cursor: "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.6rem", color: "#0A0E1A" }}>
                          {isWin ? "W" : isLoss ? "L" : "D"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Stop-loss advice ── */}
              <div className="ow-card p-4 fade-in-up">
                <button
                  className="flex items-center gap-2 w-full"
                  onClick={() => setShowStopLoss(v => !v)}
                >
                  <Shield size={14} color="#00B4D8" />
                  <div className="ow-section-title text-sm" style={{ marginBottom: 0 }}>止损建议 & 今日分析</div>
                  <div className="ml-auto">
                    {showStopLoss ? <ChevronUp size={14} color="#475569" /> : <ChevronDown size={14} color="#475569" />}
                  </div>
                </button>
                {showStopLoss && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    {[
                      {
                        icon: "✅",
                        bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)",
                        title: `当前连胜 ${personalKLine.currentStreak} 局`,
                        titleColor: "#22C55E",
                        desc: "K 线趋势向上，状态良好，可继续排位",
                      },
                      {
                        icon: "⚠️",
                        bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)",
                        title: "建议止损线：连败 2 局",
                        titleColor: "#EAB308",
                        desc: "连续出现 2 根红色蜡烛后，建议暂停休息 30 分钟",
                      },
                      {
                        icon: "📊",
                        bg: "rgba(0,180,216,0.08)", border: "rgba(0,180,216,0.2)",
                        title: "今日上分窗口：中等",
                        titleColor: "#00B4D8",
                        desc: "结合大盘天气指数 62，RSI 未超买，可以入场",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-sm"
                        style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                        <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                        <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.6 }}>
                          <span style={{ color: item.titleColor, fontWeight: 700 }}>{item.title}</span>
                          <br />{item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── STATS TAB ── */}
          {activeTab === "stats" && (
            <div className="fade-in-up">
              <StatsPanel data={allCandles} />
            </div>
          )}

          {/* Bottom actions */}
          <div className="flex gap-3 pb-6 fade-in-up">
            <Link href="/submit">
              <button className="ow-btn flex items-center gap-1.5 text-sm">
                <Zap size={13} />提交数据
              </button>
            </Link>
            <Link href="/">
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm transition-all"
                style={{
                  fontFamily: "Rajdhani, sans-serif", fontWeight: 600, letterSpacing: "0.06em",
                  color: "#64748B", border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", borderRadius: 2,
                }}>
                <BarChart2 size={13} />查看大盘
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
