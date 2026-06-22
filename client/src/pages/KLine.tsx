// OW Market - Personal K-Line Page
// Supports: International server (OverFast API real data) + CN server (manual/demo)
// Fully responsive: mobile + PC
// OW HUD Reborn Design System

import { useState, useMemo, useRef, useEffect } from "react";
import NavBar from "@/components/NavBar";
import OWCandlestickChart, { type IndicatorType } from "@/components/OWCandlestickChart";
import RSIMACDChart from "@/components/RSIMACDChart";
import StatsPanel from "@/components/StatsPanel";
import { personalKLine } from "@/lib/mockData";
import { buildCandleData } from "@/lib/candleData";
import {
  fetchPlayerData,
  fetchPlayerDataById,
  searchPlayers,
  buildKLineFromPlayerData,
  formatRank,
  rankColor,
  type OWPlayerData,
  type OWSearchResult,
  type SimulatedCandle,
} from "@/lib/overfastApi";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown,
  BarChart2, Activity, Target, Shield,
  Link2, ExternalLink, RefreshCw, User, AlertCircle,
  Globe, MapPin, ChevronRight, Award, Search, CheckCircle, Lock,
} from "lucide-react";

type ShowCount = 20 | 30 | 50;
type SubPanel = "rsi" | "macd";
type ActiveTab = "chart" | "stats";
type ServerMode = "intl" | "cn";
type LoadState = "idle" | "loading" | "loaded" | "error";

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle = {
  background: "rgba(10,14,26,0.95)",
  border: "1px solid rgba(0,180,216,0.2)",
  borderRadius: 2,
  clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
};

// ── Server mode toggle ────────────────────────────────────────────────────────
function ServerToggle({ mode, onChange }: { mode: ServerMode; onChange: (m: ServerMode) => void }) {
  return (
    <div className="flex gap-1 p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}>
      {(["intl", "cn"] as ServerMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="flex items-center gap-1.5 px-3 py-1.5 transition-all duration-150"
          style={{
            fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: "0.8rem",
            letterSpacing: "0.05em",
            background: mode === m ? "rgba(0,180,216,0.2)" : "transparent",
            border: `1px solid ${mode === m ? "#00B4D8" : "transparent"}`,
            color: mode === m ? "#00B4D8" : "#64748B",
            borderRadius: 1,
          }}
        >
          {m === "intl" ? <Globe size={12} /> : <MapPin size={12} />}
          {m === "intl" ? "外服 (BattleTag)" : "国服 (大神链接)"}
        </button>
      ))}
    </div>
  );
}

// ── Onboarding / Input section ────────────────────────────────────────────────
const EXAMPLE_ACCOUNTS = [
  { name: "Flats", tag: "Flats", role: "坦克主播", games: 157 },
  { name: "KarQ", tag: "KarQ", role: "教学主播", games: 53 },
  { name: "TeKrop", tag: "TeKrop-2217", role: "API 作者", games: 19 },
];

function OnboardingInput({ onLoadDemo, onLoadIntl }: {
  onLoadDemo: () => void;
  onLoadIntl: (data: OWPlayerData) => void;
}) {
  const [mode, setMode] = useState<ServerMode>("intl");
  const [input, setInput] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchResults, setSearchResults] = useState<OWSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Debounced search as user types
  const handleInputChange = (val: string) => {
    setInput(val);
    setErrorMsg("");
    setLoadState("idle");
    setShowResults(false);

    if (mode !== "intl") return;
    // Only search if looks like a name (no # yet, length >= 2)
    const cleanVal = val.replace(/#.*/, "").trim();
    if (cleanVal.length < 2) { setSearchResults([]); return; }

    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchPlayers(cleanVal);
        setSearchResults(results.slice(0, 6));
        setShowResults(results.length > 0);
      } catch { /* silent */ }
    }, 500);
  };

  const handleSelectResult = async (result: OWSearchResult) => {
    setShowResults(false);
    setInput(result.name);
    setLoadState("loading");
    setErrorMsg("");
    try {
      const data = await fetchPlayerDataById(result.blizzard_id, result.name);
      setLoadState("loaded");
      toast.success(`已加载 ${data.summary.username} 的赛季数据！`, { duration: 3000 });
      onLoadIntl(data);
    } catch (err: unknown) {
      setLoadState("error");
      const msg = err instanceof Error ? err.message : "加载失败，请稍后重试";
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const handleSubmit = async () => {
    const val = input.trim();
    if (!val) {
      toast.error(mode === "intl" ? "请输入玩家名称或 BattleTag" : "请输入网易大神分享链接");
      return;
    }

    if (mode === "intl") {
      setLoadState("loading");
      setErrorMsg("");
      setShowResults(false);
      try {
        let data: OWPlayerData;
        if (val.includes("#")) {
          // Direct BattleTag lookup
          data = await fetchPlayerData(val);
        } else {
          // Search by name, use first public result
          const results = await searchPlayers(val);
          if (results.length === 0) throw new Error("未找到该玩家，请检查名称拼写（大小写敏感）");
          const publicResult = results.find(r => r.is_public) ?? results[0];
          if (!publicResult.is_public) {
            throw new Error("找到的账号战绩未公开，请在暴雪官网将战绩设为公开后重试");
          }
          data = await fetchPlayerDataById(publicResult.blizzard_id, publicResult.name);
        }
        setLoadState("loaded");
        toast.success(`已加载 ${data.summary.username} 的赛季数据！`, { duration: 3000 });
        onLoadIntl(data);
      } catch (err: unknown) {
        setLoadState("error");
        const msg = err instanceof Error ? err.message : "加载失败，请稍后重试";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } else {
      setLoadState("loading");
      await new Promise(r => setTimeout(r, 1800));
      setLoadState("idle");
      toast.info("国服数据接入开发中，已切换为演示数据", { duration: 4000 });
      onLoadDemo();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { setShowResults(false); handleSubmit(); }
    if (e.key === "Escape") setShowResults(false);
  };

  const isLoading = loadState === "loading";

  return (
    <div className="min-h-screen hex-bg flex flex-col" style={{ background: "#0A0E1A" }}>
      <NavBar />
      <div className="pt-16 lg:pt-0 lg:pl-56 flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Hero */}
        <div className="w-full max-w-xl text-center mb-8 fade-in-up">
          <div className="flex justify-center mb-5">
            <div style={{
              width: 72, height: 72,
              background: "rgba(0,180,216,0.12)",
              border: "1.5px solid rgba(0,180,216,0.4)",
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
          <h1 style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 5vw, 2.4rem)", color: "#E2E8F0", lineHeight: 1.15, marginBottom: 12 }}>
            先看 K 线，再上分
          </h1>
          <p style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.9rem", color: "#64748B", lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>
            把你的守望先锋排位对局做成金融 K 线图——
            <br />绿色蜡烛 = 胜利，红色蜡烛 = 失败，一眼看出你的上分趋势。
          </p>
        </div>

        {/* Input card */}
        <div className="w-full max-w-xl fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="p-6" style={cardStyle}>

            {/* Server toggle */}
            <div className="mb-5">
              <ServerToggle mode={mode} onChange={m => { setMode(m); setInput(""); setErrorMsg(""); setLoadState("idle"); }} />
            </div>

            {/* Label */}
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#00B4D8", letterSpacing: "0.1em", marginBottom: 4 }}>
              {mode === "intl" ? "搜索玩家 / 输入 BattleTag" : "输入网易大神分享链接"}
            </div>
            <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#475569", marginBottom: 14, lineHeight: 1.6 }}>
              {mode === "intl"
                ? "输入玩家名称自动搜索，或直接输入完整 BattleTag（PlayerName#1234）"
                : "在网易大神 App 查看守望先锋战绩后，点击右上角分享，复制链接粘贴到下方"}
            </div>

            {/* Input row with search dropdown */}
            <div className="relative mb-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }}>
                    {isLoading ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={14} />}
                  </div>
                  <input
                    ref={inputRef}
                    type={mode === "intl" ? "text" : "url"}
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={mode === "intl" ? "玩家名称或 PlayerName#1234" : "https://act.ds.163.com/f0834ac50394246e/detail?customerToken=..."}
                    style={{
                      width: "100%",
                      background: loadState === "error" ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${loadState === "error" ? "rgba(239,68,68,0.4)" : "rgba(0,180,216,0.2)"}`,
                      borderRadius: 2,
                      padding: "10px 12px 10px 36px",
                      fontFamily: "Noto Sans SC, sans-serif",
                      fontSize: "0.85rem",
                      color: "#E2E8F0",
                      outline: "none",
                      transition: "border-color 0.15s",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => { if (loadState !== "error") e.target.style.borderColor = "rgba(0,180,216,0.5)"; }}
                    onBlur={e => { setTimeout(() => setShowResults(false), 200); if (loadState !== "error") e.target.style.borderColor = "rgba(0,180,216,0.2)"; }}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="ow-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
                  style={{ flexShrink: 0, opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? "加载中..." : "查 K 线"}
                </button>
              </div>

              {/* Search results dropdown */}
              {showResults && searchResults.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 60,
                  background: "#0D1120", border: "1px solid rgba(0,180,216,0.3)",
                  borderRadius: 2, zIndex: 50, overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}>
                  {searchResults.map((r, i) => (
                    <button
                      key={r.blizzard_id}
                      onMouseDown={() => handleSelectResult(r)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-100"
                      style={{
                        borderBottom: i < searchResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        background: "transparent",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,180,216,0.08)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      {r.avatar ? (
                        <img src={r.avatar} alt={r.name} style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, border: "1px solid rgba(0,180,216,0.2)" }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,180,216,0.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={14} color="#00B4D8" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#E2E8F0" }}>{r.name}</div>
                        {r.title && <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.68rem", color: "#475569" }}>{r.title}</div>}
                      </div>
                      {r.is_public
                        ? <CheckCircle size={13} color="#22C55E" style={{ flexShrink: 0 }} />
                        : <Lock size={13} color="#EF4444" style={{ flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-2.5 mb-3 rounded-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <AlertCircle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#FCA5A5", lineHeight: 1.6 }}>
                  <div>{errorMsg}</div>
                  {errorMsg.includes("公开") && (
                    <a href="https://overwatch.blizzard.com/zh-tw/career/" target="_blank" rel="noopener noreferrer"
                      style={{ color: "#00B4D8", textDecoration: "underline", fontSize: "0.7rem", marginTop: 4, display: "inline-block" }}>
                      点此前往暴雪官网设置战绩公开 →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Example accounts (intl mode only) */}
            {mode === "intl" && loadState === "idle" && !errorMsg && (
              <div className="mb-3">
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.7rem", color: "#334155", letterSpacing: "0.1em", marginBottom: 6 }}>TRY THESE PUBLIC ACCOUNTS</div>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_ACCOUNTS.map(acc => (
                    <button
                      key={acc.tag}
                      onClick={() => { setInput(acc.tag); handleInputChange(acc.tag); }}
                      className="flex items-center gap-1.5 px-2.5 py-1 transition-all duration-150"
                      style={{
                        fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: "0.75rem",
                        color: "#64748B", letterSpacing: "0.05em",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 2,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#00B4D8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,180,216,0.3)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                    >
                      <CheckCircle size={10} />
                      {acc.name}
                      <span style={{ color: "#334155", fontSize: "0.65rem" }}>{acc.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Help link */}
            {mode === "intl" ? (
              <a
                href="https://overwatch.blizzard.com/zh-tw/career/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-sm transition-all duration-150 mb-3"
                style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.15)", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,180,216,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,180,216,0.06)"; }}
              >
                <ExternalLink size={12} color="#00B4D8" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1.5 }}>
                  <span style={{ color: "#00B4D8", fontWeight: 600 }}>如何设置战绩公开？</span>
                  {"登录暴雪官网 → 生涯 → 右上角隐私设置 → 战绩公开"}
                </span>
              </a>
            ) : (
              <a
                href="https://act.ds.163.com/f0834ac50394246e/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-sm transition-all duration-150 mb-3"
                style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(249,115,22,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(249,115,22,0.06)"; }}
              >
                <ExternalLink size={12} color="#F97316" style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1.5 }}>
                  <span style={{ color: "#F97316", fontWeight: 600 }}>如何获取链接？</span>
                  {"打开网易大神 App → 守望先锋战绩 → 右上角分享 → 复制链接"}
                </span>
              </a>
            )}

            {/* Demo mode */}
            <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <button
                onClick={onLoadDemo}
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
        <div className="flex flex-wrap justify-center gap-2 mt-6 fade-in-up" style={{ animationDelay: "0.2s" }}>
          {[
            { icon: "🟢🔴", text: "红绿蜡烛 K 线" },
            { icon: "📈", text: "MA / 布林带" },
            { icon: "⚡", text: "RSI / MACD" },
            { icon: "🔍", text: "K 线形态识别" },
            { icon: "🌐", text: "外服真实数据" },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-1.5 px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <span style={{ fontSize: "0.8rem" }}>{f.icon}</span>
              <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.72rem", color: "#64748B" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 max-w-xl text-center fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start gap-2 p-3 rounded-sm" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <AlertCircle size={12} color="#334155" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.68rem", color: "#334155", lineHeight: 1.7, textAlign: "left" }}>
              外服数据通过 OverFast API 获取（需战绩公开）。K 线为基于赛季统计数据的模拟重建，非逐场真实记录。本工具仅供娱乐参考，不构成任何上分保证。
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Player profile banner (for international server) ──────────────────────────
function PlayerBanner({ data }: { data: OWPlayerData }) {
  const pc = data.summary.competitive?.pc;
  const ranks = [
    { role: "坦克", rank: pc?.tank ?? null },
    { role: "输出", rank: pc?.damage ?? null },
    { role: "辅助", rank: pc?.support ?? null },
  ].filter(r => r.rank !== null);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Avatar */}
      <img
        src={data.summary.avatar}
        alt={data.summary.username}
        style={{ width: 36, height: 36, borderRadius: 2, border: "1px solid rgba(0,180,216,0.3)", flexShrink: 0 }}
        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      {/* Name */}
      <div>
        <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E2E8F0" }}>
          {data.summary.username}
        </div>
        <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.55rem", color: "#475569", letterSpacing: "0.1em" }}>
          {data.battletag} · 赛季 {pc?.season ?? "—"}
        </div>
      </div>
      {/* Ranks */}
      {ranks.map(({ role, rank }) => rank && (
        <div key={role} className="flex items-center gap-1">
          <img src={rank.rank_icon} alt={role} style={{ width: 20, height: 20 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <div>
            <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.62rem", color: "#475569" }}>{role}</div>
            <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.75rem", color: rankColor(rank.division) }}>
              {formatRank(rank)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── International server stats summary ───────────────────────────────────────
function IntlStatCards({ data }: { data: OWPlayerData }) {
  const s = data.summary.competitive?.pc;
  const g = data.stats.general;
  const topHeroes = Object.entries(data.stats.heroes)
    .filter(([, h]) => h.games_played >= 2)
    .sort((a, b) => b[1].games_played - a[1].games_played)
    .slice(0, 3);

  const heroDisplayMap: Record<string, string> = {
    ana: "安娜", baptiste: "巴蒂斯特", brigitte: "布里吉塔", illari: "伊拉里",
    kiriko: "雾子", lifeweaver: "生命编织者", lucio: "卢西奥", mercy: "天使",
    moira: "莫伊拉", zenyatta: "禅雅塔", juno: "朱诺",
    dva: "D.Va", doomfist: "末日铁拳", junker_queen: "废土女王", mauga: "毛加",
    orisa: "奥丽莎", ramattra: "拉玛刹", reinhardt: "莱因哈特", roadhog: "路霸",
    sigma: "西格玛", winston: "温斯顿", wrecking_ball: "破坏球", zarya: "扎利娅",
    ashe: "艾什", bastion: "堡垒", cassidy: "卡西迪", echo: "回声",
    genji: "源氏", hanzo: "半藏", junkrat: "狂鼠", mei: "美",
    pharah: "法老之鹰", reaper: "死神", sojourn: "征程", soldier_76: "士兵76",
    sombra: "桑布拉", symmetra: "秩序之光", torbjorn: "托比昂", tracer: "猎空",
    widowmaker: "黑百合",
  };

  const stats = [
    { label: "本赛季场数", sub: "GAMES", value: g.games_played.toString(), color: "#00B4D8" },
    { label: "胜率", sub: "WINRATE", value: `${g.winrate.toFixed(1)}%`, color: g.winrate >= 50 ? "#22C55E" : "#EF4444" },
    { label: "KDA", sub: "KDA RATIO", value: g.kda.toFixed(2), color: "#F97316" },
    { label: "场均伤害", sub: "AVG DMG", value: Math.round(g.average.damage).toLocaleString(), color: "#A855F7" },
  ];

  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map(st => (
          <div key={st.label} className="p-3" style={cardStyle}>
            <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.68rem", color: "#475569", marginBottom: 2 }}>{st.label}</div>
            <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.1rem", color: st.color }}>{st.value}</div>
            <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.5rem", color: "#334155", letterSpacing: "0.1em" }}>{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Top heroes */}
      {topHeroes.length > 0 && (
        <div className="p-3" style={cardStyle}>
          <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#64748B", letterSpacing: "0.1em", marginBottom: 10 }}>
            TOP HEROES · 本赛季
          </div>
          <div className="flex gap-3 flex-wrap">
            {topHeroes.map(([key, h]) => (
              <div key={key} className="flex items-center gap-2 flex-1 min-w-0" style={{ minWidth: 120 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 2, flexShrink: 0,
                  background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#00B4D8",
                }}>
                  {(heroDisplayMap[key] ?? key).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#CBD5E1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {heroDisplayMap[key] ?? key}
                  </div>
                  <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: h.winrate >= 50 ? "#22C55E" : "#EF4444" }}>
                    {h.games_played}场 · {h.winrate.toFixed(0)}%胜率
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main K-Line Dashboard ─────────────────────────────────────────────────────
function KLineDashboard({
  onReset,
  playerData,
  isDemo,
}: {
  onReset: () => void;
  playerData: OWPlayerData | null;
  isDemo: boolean;
}) {
  const [showCount, setShowCount] = useState<ShowCount>(30);
  const [indicator, setIndicator] = useState<IndicatorType>("ma");
  const [subPanel, setSubPanel] = useState<SubPanel>("rsi");
  const [showVolume, setShowVolume] = useState(true);
  const [showPatterns, setShowPatterns] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chart");
  const [showStopLoss, setShowStopLoss] = useState(true);

  // Build candle data from either real player data or demo data
  const allCandles = useMemo(() => {
    if (playerData && !isDemo) {
      const simulated = buildKLineFromPlayerData(playerData);
      // Convert SimulatedCandle to the format OWCandlestickChart expects
      return simulated.map((c: SimulatedCandle, i: number) => ({
        index: i,
        date: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        isWin: c.isWin,
        hero: c.hero,
        role: c.role,
        kda: c.kda,
        map: "—",
        duration: 0,
        pattern: undefined as string | undefined,
        matchRet: (c.isWin ? 1 : -1) as 1 | 0 | -1,
        rankTier: "—",
        cumulativeScore: c.close,
      }));
    }
    return buildCandleData(personalKLine.matches as any);
  }, [playerData, isDemo]);

  const candles = useMemo(() => allCandles.slice(-showCount), [allCandles, showCount]);

  // For demo mode, use personalKLine data; for real data, compute from candles
  const recentMatches = isDemo ? personalKLine.matches.slice(-10) : candles.slice(-10);
  const recentWins = isDemo
    ? (recentMatches as any[]).filter((m: any) => m.matchRet === 1).length
    : candles.slice(-10).filter(c => c.matchRet === 1).length;

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const change = last && prev ? last.close - prev.close : 0;
  const isUp = change >= 0;

  // Compute overall winrate from candles
  const totalWins = candles.filter(c => c.matchRet === 1).length;
  const winRate = candles.length > 0 ? (totalWins / candles.length * 100).toFixed(1) : "—";

  // Stop-loss suggestion
  const stopLossTriggered = recentWins <= 3;
  const stopLossMsg = stopLossTriggered
    ? `近10场仅胜 ${recentWins} 场，建议今日止损，明日再战`
    : `近10场胜 ${recentWins} 场，状态尚可，可继续上分`;

  return (
    <div className="min-h-screen hex-bg" style={{ background: "#0A0E1A" }}>
      <NavBar />
      <div className="pt-14 lg:pt-0 pl-0 lg:pl-56 min-h-screen">

        {/* ── Sticky page header ── */}
        <div className="border-b sticky top-0 lg:top-0 z-30"
          style={{ borderColor: "rgba(0,180,216,0.2)", background: "rgba(8,12,24,0.97)", backdropFilter: "blur(12px)" }}>
          <div className="container py-2.5 flex items-center gap-2 flex-wrap min-w-0">
            {/* Player banner or title */}
            {playerData && !isDemo ? (
              <PlayerBanner data={playerData} />
            ) : (
              <>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#E2E8F0", letterSpacing: "0.05em", flexShrink: 0 }}>
                  我的排位 K 线
                </div>
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
              </>
            )}

            {/* Controls — right side */}
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

          {/* Real player stats (international server) */}
          {playerData && !isDemo && (
            <div className="fade-in-up">
              <IntlStatCards data={playerData} />
            </div>
          )}

          {/* Demo stat row */}
          {isDemo && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 fade-in-up">
              {[
                { label: "当前趋势", sub: "TREND", value: personalKLine.trend === "up" ? "上升" : personalKLine.trend === "down" ? "下行" : "震荡", color: personalKLine.trend === "up" ? "#22C55E" : personalKLine.trend === "down" ? "#EF4444" : "#F97316" },
                { label: "连续状态", sub: "STREAK", value: `${(personalKLine as any).streakType === "win" ? "连胜" : "连败"} ${(personalKLine as any).streak ?? "—"}`, color: (personalKLine as any).streakType === "win" ? "#22C55E" : "#EF4444" },
                { label: "近10场胜率", sub: "RECENT WIN%", value: `${(recentWins / 10 * 100).toFixed(0)}%`, color: recentWins >= 5 ? "#22C55E" : "#EF4444" },
                { label: "本段胜率", sub: "WIN RATE", value: `${winRate}%`, color: parseFloat(winRate) >= 50 ? "#22C55E" : "#EF4444" },
              ].map(st => (
                <div key={st.label} className="p-3" style={cardStyle}>
                  <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.68rem", color: "#475569", marginBottom: 2 }}>{st.label}</div>
                  <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.1rem", color: st.color }}>{st.value}</div>
                  <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.5rem", color: "#334155", letterSpacing: "0.1em" }}>{st.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab bar ── */}
          <div className="flex gap-1 border-b" style={{ borderColor: "rgba(0,180,216,0.15)" }}>
            {([
              { id: "chart", label: "K线图表", icon: <BarChart2 size={13} /> },
              { id: "stats", label: "数据统计", icon: <Activity size={13} /> },
            ] as { id: ActiveTab; label: string; icon: React.ReactNode }[]).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 transition-all"
                style={{
                  fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: "0.8rem",
                  color: activeTab === tab.id ? "#00B4D8" : "#475569",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#00B4D8" : "transparent"}`,
                  background: "transparent",
                  letterSpacing: "0.05em",
                }}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {activeTab === "chart" && (
            <>
              {/* ── Indicator toolbar ── */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1">
                  {(["none", "ma", "bb"] as IndicatorType[]).map(ind => (
                    <button key={ind} onClick={() => setIndicator(ind)}
                      className="px-2 py-1 transition-all"
                      style={{
                        fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
                        background: indicator === ind ? "rgba(0,180,216,0.2)" : "transparent",
                        border: `1px solid ${indicator === ind ? "#00B4D8" : "rgba(255,255,255,0.1)"}`,
                        color: indicator === ind ? "#00B4D8" : "#475569",
                        borderRadius: 1,
                      }}>
                      {ind === "none" ? "无" : ind === "ma" ? "MA均线" : "布林带"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1">
                  {[
                    { key: "vol", label: "成交量", state: showVolume, toggle: () => setShowVolume(v => !v) },
                    { key: "pat", label: "形态", state: showPatterns, toggle: () => setShowPatterns(v => !v) },
                    { key: "sl", label: "止损线", state: showStopLoss, toggle: () => setShowStopLoss(v => !v) },
                  ].map(btn => (
                    <button key={btn.key} onClick={btn.toggle}
                      className="px-2 py-1 transition-all"
                      style={{
                        fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
                        background: btn.state ? "rgba(249,115,22,0.15)" : "transparent",
                        border: `1px solid ${btn.state ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.1)"}`,
                        color: btn.state ? "#F97316" : "#475569",
                        borderRadius: 1,
                      }}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Main candlestick chart ── */}
              <div style={cardStyle} className="overflow-hidden">
                <OWCandlestickChart
                  data={candles}
                  indicator={indicator}
                  showVolume={showVolume}
                  showPatterns={showPatterns}
                />
              </div>

              {/* ── Sub panel toggle ── */}
              <div className="flex gap-1">
                {(["rsi", "macd"] as SubPanel[]).map(p => (
                  <button key={p} onClick={() => setSubPanel(p)}
                    className="px-3 py-1 transition-all"
                    style={{
                      fontFamily: "Orbitron, monospace", fontSize: "0.6rem",
                      background: subPanel === p ? "rgba(168,85,247,0.15)" : "transparent",
                      border: `1px solid ${subPanel === p ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: subPanel === p ? "#A855F7" : "#475569",
                      borderRadius: 1,
                    }}>
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* ── RSI / MACD sub chart ── */}
              <div style={cardStyle} className="overflow-hidden">
                <RSIMACDChart data={candles} activePanel={subPanel} />
              </div>

              {/* ── Stop-loss suggestion ── */}
              {showStopLoss && (
                <div className="flex items-start gap-3 p-3" style={{
                  background: stopLossTriggered ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.06)",
                  border: `1px solid ${stopLossTriggered ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.2)"}`,
                  borderRadius: 2,
                }}>
                  {stopLossTriggered ? <Shield size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} /> : <Target size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <div>
                    <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: stopLossTriggered ? "#EF4444" : "#22C55E", letterSpacing: "0.05em", marginBottom: 2 }}>
                      {stopLossTriggered ? "⚠ 止损建议" : "✓ 状态良好"}
                    </div>
                    <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.78rem", color: "#94A3B8", lineHeight: 1.6 }}>
                      {stopLossMsg}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "stats" && (
            <StatsPanel data={candles} />
          )}

        </div>
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function KLine() {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [playerData, setPlayerData] = useState<OWPlayerData | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const handleLoadDemo = () => {
    setIsDemo(true);
    setPlayerData(null);
    setLoadState("loaded");
  };

  const handleLoadIntl = (data: OWPlayerData) => {
    setPlayerData(data);
    setIsDemo(false);
    setLoadState("loaded");
  };

  const handleReset = () => {
    setLoadState("idle");
    setPlayerData(null);
    setIsDemo(false);
  };

  if (loadState !== "loaded") {
    return <OnboardingInput onLoadDemo={handleLoadDemo} onLoadIntl={handleLoadIntl} />;
  }

  return (
    <KLineDashboard
      onReset={handleReset}
      playerData={playerData}
      isDemo={isDemo}
    />
  );
}
