// KLine Page v4.0 - 首页 · 个人 K 线 + 引导输入
// 首次访问显示引导输入网易大神链接，加载后展示完整 K 线分析
// 全面适配移动端和 PC 端
// OW HUD Reborn Design

import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import NavBar from "@/components/NavBar";
import OWCandlestickChart, { type IndicatorType } from "@/components/OWCandlestickChart";
import RSIMACDChart from "@/components/RSIMACDChart";
import StatsPanel from "@/components/StatsPanel";
import { personalKLine } from "@/lib/mockData";
import { buildCandleData } from "@/lib/candleData";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, Minus,
  BarChart2, Activity, Target, Shield, Zap,
  ChevronDown, ChevronUp, Link2, ExternalLink,
  RefreshCw, User, AlertCircle,
} from "lucide-react";

type ShowCount = 20 | 30 | 50;
type SubPanel = "rsi" | "macd";
type ActiveTab = "chart" | "stats";
type LoadState = "idle" | "loading" | "loaded" | "error";

// ── Onboarding / Input section ────────────────────────────────────────────────
function OnboardingInput({ onLoad }: { onLoad: () => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast.error("请输入网易大神分享链接");
      return;
    }
    if (!url.includes("nie.com") && !url.includes("b23.tv") && !url.includes("http")) {
      toast.error("请输入有效的分享链接（以 https:// 开头）");
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2200));
    setLoading(false);
    toast.success("数据加载成功！已解析 50 场对局记录", { duration: 3000 });
    onLoad();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen hex-bg flex flex-col" style={{ background: "#0A0E1A" }}>
      <NavBar />
      <div className="pt-16 lg:pt-0 lg:pl-56 flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Hero section */}
        <div className="w-full max-w-xl text-center mb-10 fade-in-up">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div style={{
              width: 72, height: 72,
              background: "rgba(0,180,216,0.12)",
              border: "1.5px solid rgba(0,180,216,0.4)",
              borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
              boxShadow: "0 0 30px rgba(0,180,216,0.15)",
            }}>
              <TrendingUp size={32} color="#00B4D8" style={{ filter: "drop-shadow(0 0 8px rgba(0,180,216,0.7))" }} />
            </div>
          </div>

          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#00B4D8", letterSpacing: "0.2em", marginBottom: 10 }}>
            OW MARKET · PERSONAL K-LINE
          </div>
          <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 5vw, 2.4rem)", color: "#E2E8F0", lineHeight: 1.15, marginBottom: 12, letterSpacing: "0.02em" }}>
            先看 K 线，再上分
          </h1>
          <p style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.9rem", color: "#64748B", lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>
            把你的守望先锋排位对局做成金融 K 线图——
            <br />绿色蜡烛 = 胜利，红色蜡烛 = 失败，一眼看出你的上分趋势。
          </p>
        </div>

        {/* Input card */}
        <div className="w-full max-w-xl fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="ow-card-lg p-6"
            style={{ background: "rgba(10,14,26,0.95)", border: "1px solid rgba(0,180,216,0.25)" }}>

            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#00B4D8", letterSpacing: "0.1em", marginBottom: 4 }}>
              输入你的网易大神分享链接
            </div>
            <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#475569", marginBottom: 16, lineHeight: 1.6 }}>
              在网易大神 App → 战绩 → 分享，复制链接粘贴到下方
            </div>

            {/* Input row */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <div style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  color: "#475569", pointerEvents: "none",
                }}>
                  <Link2 size={14} />
                </div>
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://game.nie.com/..."
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(0,180,216,0.2)",
                    borderRadius: 2,
                    padding: "10px 12px 10px 36px",
                    fontFamily: "Noto Sans SC, sans-serif",
                    fontSize: "0.85rem",
                    color: "#E2E8F0",
                    outline: "none",
                    transition: "border-color 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.borderColor = "rgba(0,180,216,0.5)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(0,180,216,0.2)"; }}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ow-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                style={{ flexShrink: 0, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <TrendingUp size={14} />
                )}
                {loading ? "解析中..." : "加载K线"}
              </button>
            </div>

            {/* How to get link */}
            <a
              href="https://game.nie.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-sm transition-all duration-150"
              style={{
                background: "rgba(249,115,22,0.06)",
                border: "1px solid rgba(249,115,22,0.15)",
                textDecoration: "none",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(249,115,22,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(249,115,22,0.06)"; }}
            >
              <ExternalLink size={12} color="#F97316" style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#78350F", lineHeight: 1.5 }}>
                <span style={{ color: "#F97316", fontWeight: 600 }}>如何获取链接？</span>
                {" "}打开网易大神 App → 我的战绩 → 右上角分享 → 复制链接
              </span>
            </a>

            {/* Demo mode */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <button
                onClick={onLoad}
                className="w-full flex items-center justify-center gap-2 py-2.5 transition-all duration-150"
                style={{
                  fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: "0.85rem",
                  color: "#64748B", letterSpacing: "0.06em",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 2,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <User size={13} />
                使用演示数据体验
              </button>
              <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.68rem", color: "#334155", textAlign: "center", marginTop: 8 }}>
                演示数据为模拟数据，不代表真实战绩
              </div>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 fade-in-up" style={{ animationDelay: "0.2s" }}>
          {[
            { icon: "🟢🔴", text: "红绿蜡烛 K 线" },
            { icon: "📈", text: "MA / 布林带" },
            { icon: "⚡", text: "RSI / MACD" },
            { icon: "🔍", text: "K 线形态识别" },
            { icon: "🛡️", text: "止损建议" },
          ].map(f => (
            <div key={f.text}
              className="flex items-center gap-1.5 px-3 py-1.5"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 2,
              }}>
              <span style={{ fontSize: "0.8rem" }}>{f.icon}</span>
              <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.72rem", color: "#64748B" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 max-w-xl text-center fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start gap-2 p-3 rounded-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <AlertCircle size={12} color="#334155" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.68rem", color: "#334155", lineHeight: 1.7, textAlign: "left" }}>
              本工具仅供娱乐参考，不构成任何上分保证。数据来源于用户主动授权，与暴雪、网易无关。
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main K-Line Dashboard ─────────────────────────────────────────────────────
function KLineDashboard({ onReset }: { onReset: () => void }) {
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

        {/* ── Sticky page header ── */}
        <div className="border-b sticky top-0 lg:top-0 z-30"
          style={{ borderColor: "rgba(0,180,216,0.2)", background: "rgba(8,12,24,0.97)", backdropFilter: "blur(12px)" }}>
          <div className="container py-2.5 flex items-center gap-2 flex-wrap min-w-0">
            {/* Title */}
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E2E8F0", letterSpacing: "0.05em", flexShrink: 0 }}>
              我的排位 K 线
            </div>

            {/* Live ticker */}
            {last && (
              <div className="flex items-center gap-1.5 ml-1">
                <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1rem", color: isUp ? "#22C55E" : "#EF4444" }}>
                  {last.close >= 0 ? "+" : ""}{last.close.toFixed(0)}
                </span>
                <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: isUp ? "#22C55E" : "#EF4444" }}>
                  {isUp ? "▲" : "▼"}{Math.abs(change).toFixed(1)}
                </span>
              </div>
            )}

            {/* Show count — right side */}
            <div className="ml-auto flex items-center gap-1">
              {([20, 30, 50] as ShowCount[]).map((n) => (
                <button key={n} onClick={() => setShowCount(n)}
                  className="px-2 py-1 transition-all"
                  style={{
                    fontFamily: "Orbitron, monospace", fontSize: "0.65rem",
                    background: showCount === n ? "rgba(0,180,216,0.2)" : "transparent",
                    border: `1px solid ${showCount === n ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                    color: showCount === n ? "#00B4D8" : "#64748B",
                    clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
                  }}>
                  {n}场
                </button>
              ))}
              {/* Reset */}
              <button onClick={onReset}
                className="ml-1 px-2 py-1 transition-all flex items-center gap-1"
                style={{
                  fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem",
                  color: "#475569", border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", borderRadius: 2,
                }}>
                <RefreshCw size={10} />
                换账号
              </button>
            </div>
          </div>
        </div>

        <div className="container py-3 space-y-3">

          {/* ── Top stat row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 fade-in-up">
            {[
              {
                label: "当前趋势", sub: "TREND",
                value: personalKLine.trend === "up" ? "上升" : personalKLine.trend === "down" ? "下行" : "震荡",
                icon: personalKLine.trend === "up" ? <TrendingUp size={13} color="#22C55E" /> : personalKLine.trend === "down" ? <TrendingDown size={13} color="#EF4444" /> : <Minus size={13} color="#EAB308" />,
                color: personalKLine.trend === "up" ? "#22C55E" : personalKLine.trend === "down" ? "#EF4444" : "#EAB308",
              },
              {
                label: personalKLine.streakType === "win" ? "当前连胜" : "当前连败", sub: "STREAK",
                value: `${personalKLine.streakType === "win" ? "+" : "-"}${personalKLine.currentStreak}`,
                icon: <Activity size={13} color={streakColor} />, color: streakColor,
              },
              {
                label: "近50场胜率", sub: "WIN RATE",
                value: `${(personalKLine.winRate * 100).toFixed(1)}%`,
                icon: <BarChart2 size={13} color="#00B4D8" />, color: "#00B4D8",
              },
              {
                label: "近10场战绩", sub: "RECENT",
                value: `${recentWins}W${10 - recentWins}L`,
                icon: <Target size={13} color={recentWins >= 6 ? "#22C55E" : recentWins >= 4 ? "#EAB308" : "#EF4444"} />,
                color: recentWins >= 6 ? "#22C55E" : recentWins >= 4 ? "#EAB308" : "#EF4444",
              },
            ].map((s) => (
              <div key={s.label} className="ow-card p-3">
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.45rem", color: "#334155", letterSpacing: "0.15em", marginBottom: 3 }}>{s.sub}</div>
                <div className="flex items-center gap-1.5 mb-1">{s.icon}
                  <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.62rem", color: "#475569" }}>{s.label}</span>
                </div>
                <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.35rem", color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── Tab switcher ── */}
          <div className="flex gap-2 fade-in-up">
            {(["chart", "stats"] as ActiveTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="px-3 py-1.5 text-sm transition-all"
                style={{
                  fontFamily: "Rajdhani, sans-serif", fontWeight: 700, letterSpacing: "0.08em",
                  background: activeTab === tab ? "rgba(0,180,216,0.15)" : "transparent",
                  border: `1px solid ${activeTab === tab ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                  color: activeTab === tab ? "#00B4D8" : "#64748B",
                  clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))",
                }}>
                {tab === "chart" ? "📈 K线图表" : "📊 数据统计"}
              </button>
            ))}
          </div>

          {/* ── CHART TAB ── */}
          {activeTab === "chart" && (
            <>
              {/* Main chart card */}
              <div className="ow-card-lg p-3 sm:p-4 fade-in-up">

                {/* Toolbar — responsive wrapping */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="ow-section-title text-xs sm:text-sm" style={{ marginBottom: 0, flexShrink: 0 }}>
                    近{showCount}场 K 线
                  </div>

                  {/* Indicator selector */}
                  <div className="flex items-center gap-1 ml-auto flex-wrap">
                    <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.6rem", color: "#475569", letterSpacing: "0.08em" }}>指标</span>
                    {([
                      { key: "none", label: "无" },
                      { key: "ma", label: "MA" },
                      { key: "bollinger", label: "BOLL" },
                    ] as { key: IndicatorType; label: string }[]).map(opt => (
                      <button key={opt.key} onClick={() => setIndicator(opt.key)}
                        style={{
                          fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
                          background: indicator === opt.key ? "rgba(0,180,216,0.2)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${indicator === opt.key ? "#00B4D8" : "rgba(255,255,255,0.08)"}`,
                          color: indicator === opt.key ? "#00B4D8" : "#475569",
                          borderRadius: 2, padding: "2px 7px", cursor: "pointer",
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Toggle options */}
                  <div className="flex items-center gap-1">
                    {[
                      { key: "vol", label: "VOL", active: showVolume, toggle: () => setShowVolume(v => !v), color: "#F97316" },
                      { key: "pat", label: "形态", active: showPatterns, toggle: () => setShowPatterns(v => !v), color: "#A78BFA" },
                    ].map(btn => (
                      <button key={btn.key} onClick={btn.toggle}
                        style={{
                          fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
                          background: btn.active ? `rgba(${btn.color === "#F97316" ? "249,115,22" : "168,85,247"},0.15)` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${btn.active ? btn.color + "66" : "rgba(255,255,255,0.08)"}`,
                          color: btn.active ? btn.color : "#475569",
                          borderRadius: 2, padding: "2px 7px", cursor: "pointer",
                        }}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend — scrollable on mobile */}
                <div className="flex items-center gap-3 mb-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  <div className="flex items-center gap-2 text-xs flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <span style={{ display: "inline-block", width: 9, height: 9, background: "rgba(34,197,94,0.8)", border: "1px solid #22C55E", borderRadius: 1 }} />
                      <span style={{ fontFamily: "Noto Sans SC, sans-serif", color: "#475569", fontSize: "0.65rem" }}>胜</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span style={{ display: "inline-block", width: 9, height: 9, background: "rgba(239,68,68,0.8)", border: "1px solid #EF4444", borderRadius: 1 }} />
                      <span style={{ fontFamily: "Noto Sans SC, sans-serif", color: "#475569", fontSize: "0.65rem" }}>败</span>
                    </span>
                  </div>
                  {indicator === "ma" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {[["MA5", "#F97316"], ["MA10", "#00B4D8"], ["MA20", "#A78BFA"]].map(([label, color]) => (
                        <span key={label} className="flex items-center gap-1">
                          <span style={{ display: "inline-block", width: 14, height: 2, background: color }} />
                          <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.55rem", color }}>{label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {indicator === "bollinger" && (
                    <span className="flex items-center gap-1 flex-shrink-0">
                      <span style={{ display: "inline-block", width: 14, height: 2, background: "#A78BFA" }} />
                      <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.55rem", color: "#A78BFA" }}>BOLL(20,2)</span>
                    </span>
                  )}
                </div>

                {/* K-line chart — responsive height */}
                <OWCandlestickChart
                  data={candles}
                  height={window.innerWidth < 640 ? 240 : 320}
                  indicator={indicator}
                  showVolume={showVolume}
                  showPatterns={showPatterns}
                />

                <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.62rem", color: "#334155", lineHeight: 1.6 }}>
                    纵轴 = 累计分数 · 每根蜡烛 = 一场对局 · 影线 = 对局内波动 · VOL = 对局时长
                  </span>
                </div>
              </div>

              {/* ── Sub panel: RSI / MACD ── */}
              <div className="ow-card-lg p-3 sm:p-4 fade-in-up">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {(["rsi", "macd"] as SubPanel[]).map(p => (
                      <button key={p} onClick={() => setSubPanel(p)}
                        style={{
                          fontFamily: "Orbitron, monospace", fontSize: "0.65rem",
                          background: subPanel === p ? "rgba(0,180,216,0.2)" : "transparent",
                          border: `1px solid ${subPanel === p ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                          color: subPanel === p ? "#00B4D8" : "#64748B",
                          clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
                          padding: "3px 10px", cursor: "pointer",
                        }}>
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.65rem", color: "#475569", flex: 1, minWidth: 0 }}>
                    {subPanel === "rsi"
                      ? "RSI(14) · >70超买 · <30超卖"
                      : "MACD(12,26,9) · DIF穿越DEA=信号"}
                  </div>
                  {subPanel === "macd" && (
                    <div className="flex items-center gap-2 text-xs flex-shrink-0">
                      {[["DIF", "#00B4D8"], ["DEA", "#F97316"]].map(([label, color]) => (
                        <span key={label} className="flex items-center gap-1">
                          <span style={{ display: "inline-block", width: 12, height: 2, background: color }} />
                          <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.55rem", color }}>{label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <RSIMACDChart data={candles} activePanel={subPanel} />
              </div>

              {/* ── Win/Loss strip ── */}
              <div className="ow-card p-3 sm:p-4 fade-in-up">
                <div className="ow-section-title text-xs sm:text-sm mb-2">近{showCount}场胜负序列</div>
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
                          width: 20, height: 20, background: bg,
                          clipPath: "polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))",
                          boxShadow: `0 0 3px ${color}60`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                        <span style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.55rem", color: "#0A0E1A" }}>
                          {isWin ? "W" : isLoss ? "L" : "D"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Stop-loss advice ── */}
              <div className="ow-card p-3 sm:p-4 fade-in-up">
                <button className="flex items-center gap-2 w-full" onClick={() => setShowStopLoss(v => !v)}>
                  <Shield size={13} color="#00B4D8" />
                  <div className="ow-section-title text-xs sm:text-sm" style={{ marginBottom: 0 }}>止损建议 & 今日分析</div>
                  <div className="ml-auto">
                    {showStopLoss ? <ChevronUp size={13} color="#475569" /> : <ChevronDown size={13} color="#475569" />}
                  </div>
                </button>
                {showStopLoss && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    {[
                      { icon: "✅", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", title: `当前连胜 ${personalKLine.currentStreak} 局`, titleColor: "#22C55E", desc: "K 线趋势向上，状态良好，可继续排位" },
                      { icon: "⚠️", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)", title: "建议止损线：连败 2 局", titleColor: "#EAB308", desc: "连续出现 2 根红色蜡烛后，建议暂停休息 30 分钟" },
                      { icon: "📊", bg: "rgba(0,180,216,0.08)", border: "rgba(0,180,216,0.2)", title: "今日上分窗口：中等", titleColor: "#00B4D8", desc: "结合大盘天气指数 62，RSI 未超买，可以入场" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-sm"
                        style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                        <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>{item.icon}</span>
                        <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1.6 }}>
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
          <div className="flex flex-wrap gap-2 pb-6 fade-in-up">
            <Link href="/submit">
              <button className="ow-btn flex items-center gap-1.5 text-sm">
                <Zap size={13} />提交数据
              </button>
            </Link>
            <Link href="/market">
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm transition-all"
                style={{
                  fontFamily: "Rajdhani, sans-serif", fontWeight: 600, letterSpacing: "0.06em",
                  color: "#64748B", border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent", borderRadius: 2,
                }}>
                <BarChart2 size={13} />查看社区大盘
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Page entry ────────────────────────────────────────────────────────────────
export default function KLine() {
  const [loadState, setLoadState] = useState<LoadState>("idle");

  if (loadState !== "loaded") {
    return <OnboardingInput onLoad={() => setLoadState("loaded")} />;
  }
  return <KLineDashboard onReset={() => setLoadState("idle")} />;
}
