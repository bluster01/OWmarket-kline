// StatsPanel - 数据统计面板
// 包含：英雄胜率热力图、胜率分布、连胜/连败分析、地图胜率、时段分析
// OW HUD Reborn Design

import { useMemo } from "react";
import type { CandleData } from "./OWCandlestickChart";

interface StatsPanelProps {
  data: CandleData[];
}

// ── Hero stats ────────────────────────────────────────────────────────────────
function calcHeroStats(data: CandleData[]) {
  const map: Record<string, { wins: number; total: number }> = {};
  data.forEach(d => {
    if (!map[d.hero]) map[d.hero] = { wins: 0, total: 0 };
    map[d.hero].total++;
    if (d.matchRet === 1) map[d.hero].wins++;
  });
  return Object.entries(map)
    .map(([hero, s]) => ({ hero, winRate: s.wins / s.total, total: s.total, wins: s.wins }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}

// ── Map stats ─────────────────────────────────────────────────────────────────
function calcMapStats(data: CandleData[]) {
  const map: Record<string, { wins: number; total: number }> = {};
  data.forEach(d => {
    if (!map[d.map]) map[d.map] = { wins: 0, total: 0 };
    map[d.map].total++;
    if (d.matchRet === 1) map[d.map].wins++;
  });
  return Object.entries(map)
    .map(([mapName, s]) => ({ mapName, winRate: s.wins / s.total, total: s.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
}

// ── Streak analysis ───────────────────────────────────────────────────────────
function calcStreaks(data: CandleData[]) {
  const streaks: { type: "win" | "loss"; length: number; endIndex: number }[] = [];
  let current: "win" | "loss" | null = null;
  let count = 0;
  let startIdx = 0;

  data.forEach((d, i) => {
    const type = d.matchRet === 1 ? "win" : d.matchRet === -1 ? "loss" : null;
    if (type === null) { current = null; count = 0; return; }
    if (type === current) {
      count++;
    } else {
      if (current !== null && count >= 2) {
        streaks.push({ type: current, length: count, endIndex: i - 1 });
      }
      current = type;
      count = 1;
      startIdx = i;
    }
  });
  if (current !== null && count >= 2) {
    streaks.push({ type: current, length: count, endIndex: data.length - 1 });
  }

  const maxWin = streaks.filter(s => s.type === "win").reduce((m, s) => Math.max(m, s.length), 0);
  const maxLoss = streaks.filter(s => s.type === "loss").reduce((m, s) => Math.max(m, s.length), 0);
  const avgWin = streaks.filter(s => s.type === "win").reduce((s, v) => s + v.length, 0) / (streaks.filter(s => s.type === "win").length || 1);
  const avgLoss = streaks.filter(s => s.type === "loss").reduce((s, v) => s + v.length, 0) / (streaks.filter(s => s.type === "loss").length || 1);

  return { streaks, maxWin, maxLoss, avgWin, avgLoss };
}

// ── Win distribution (by score buckets) ──────────────────────────────────────
function calcWinDistribution(data: CandleData[]) {
  const scores = data.map(d => d.cumulativeScore);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const bucketCount = 8;
  const bucketSize = (max - min) / bucketCount || 1;

  return Array.from({ length: bucketCount }, (_, i) => {
    const lo = min + i * bucketSize;
    const hi = lo + bucketSize;
    const inBucket = data.filter(d => d.cumulativeScore >= lo && d.cumulativeScore < hi);
    const wins = inBucket.filter(d => d.matchRet === 1).length;
    return {
      label: `${lo >= 0 ? "+" : ""}${lo.toFixed(0)}`,
      total: inBucket.length,
      wins,
      winRate: inBucket.length > 0 ? wins / inBucket.length : 0,
    };
  });
}

// ── Heatmap color ─────────────────────────────────────────────────────────────
function heatColor(rate: number): string {
  if (rate >= 0.65) return "#22C55E";
  if (rate >= 0.55) return "#84CC16";
  if (rate >= 0.45) return "#EAB308";
  if (rate >= 0.35) return "#F97316";
  return "#EF4444";
}

function heatBg(rate: number): string {
  if (rate >= 0.65) return "rgba(34,197,94,0.15)";
  if (rate >= 0.55) return "rgba(132,204,22,0.12)";
  if (rate >= 0.45) return "rgba(234,179,8,0.12)";
  if (rate >= 0.35) return "rgba(249,115,22,0.12)";
  return "rgba(239,68,68,0.12)";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StatsPanel({ data }: StatsPanelProps) {
  const heroStats = useMemo(() => calcHeroStats(data), [data]);
  const mapStats = useMemo(() => calcMapStats(data), [data]);
  const { maxWin, maxLoss, avgWin, avgLoss, streaks } = useMemo(() => calcStreaks(data), [data]);
  const winDist = useMemo(() => calcWinDistribution(data), [data]);

  const totalWins = data.filter(d => d.matchRet === 1).length;
  const totalLosses = data.filter(d => d.matchRet === -1).length;
  const overallWR = data.length > 0 ? totalWins / data.length : 0;

  const cardStyle: React.CSSProperties = {
    background: "rgba(13,21,38,0.7)",
    border: "1px solid rgba(0,180,216,0.15)",
    borderRadius: 2,
    padding: "16px 18px",
    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "Rajdhani, sans-serif",
    fontWeight: 700,
    fontSize: "0.75rem",
    color: "#00B4D8",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

      {/* ── Hero Heatmap ── */}
      <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <div style={sectionTitle}>
          <span style={{ color: "#F97316" }}>▣</span> 英雄胜率热力图
          <span style={{ marginLeft: "auto", fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.65rem", color: "#475569", fontWeight: 400, letterSpacing: 0 }}>
            按场次排序，颜色深浅代表胜率高低
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {heroStats.map(h => (
            <div key={h.hero} style={{
              background: heatBg(h.winRate),
              border: `1px solid ${heatColor(h.winRate)}40`,
              borderRadius: 2,
              padding: "10px 12px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Win rate bar background */}
              <div style={{
                position: "absolute", left: 0, bottom: 0, height: 3,
                width: `${h.winRate * 100}%`,
                background: heatColor(h.winRate),
                boxShadow: `0 0 6px ${heatColor(h.winRate)}`,
              }} />
              <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.78rem", color: "#E2E8F0", fontWeight: 600, marginBottom: 4 }}>
                {h.hero}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1.1rem", color: heatColor(h.winRate) }}>
                  {(h.winRate * 100).toFixed(0)}%
                </span>
                <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569" }}>
                  {h.wins}W {h.total - h.wins}L
                </span>
              </div>
              <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.55rem", color: "#334155", marginTop: 2 }}>
                {h.total} 场
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Streak Analysis ── */}
      <div style={cardStyle}>
        <div style={sectionTitle}>
          <span style={{ color: "#22C55E" }}>≋</span> 连胜/连败分析
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { label: "最长连胜", value: `${maxWin}连胜`, color: "#22C55E" },
            { label: "最长连败", value: `${maxLoss}连败`, color: "#EF4444" },
            { label: "平均连胜", value: `${avgWin.toFixed(1)}场`, color: "#84CC16" },
            { label: "平均连败", value: `${avgLoss.toFixed(1)}场`, color: "#F97316" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 2, padding: "8px 10px",
            }}>
              <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.6rem", color: "#475569", letterSpacing: "0.08em", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: "Orbitron, monospace", fontWeight: 700, fontSize: "1rem", color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Streak timeline */}
        <div style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569", letterSpacing: "0.08em", marginBottom: 6 }}>
          连胜/连败序列（≥2场）
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {streaks.slice(-12).map((s, i) => (
            <div key={i} style={{
              padding: "3px 8px",
              background: s.type === "win" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              border: `1px solid ${s.type === "win" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              borderRadius: 2,
              fontFamily: "Orbitron, monospace",
              fontSize: "0.6rem",
              color: s.type === "win" ? "#22C55E" : "#EF4444",
            }}>
              {s.type === "win" ? "+" : "-"}{s.length}
            </div>
          ))}
          {streaks.length === 0 && (
            <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.7rem", color: "#334155" }}>暂无连胜/连败记录</span>
          )}
        </div>
      </div>

      {/* ── Map Win Rate ── */}
      <div style={cardStyle}>
        <div style={sectionTitle}>
          <span style={{ color: "#A78BFA" }}>◈</span> 地图胜率
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mapStats.map(m => (
            <div key={m.mapName}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.75rem", color: "#94A3B8" }}>{m.mapName}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#475569" }}>{m.total}场</span>
                  <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.75rem", fontWeight: 700, color: heatColor(m.winRate) }}>
                    {(m.winRate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${m.winRate * 100}%`,
                  background: heatColor(m.winRate),
                  boxShadow: `0 0 6px ${heatColor(m.winRate)}60`,
                  transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Win Distribution ── */}
      <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <div style={sectionTitle}>
          <span style={{ color: "#00B4D8" }}>▦</span> 分数段胜率分布
          <span style={{ marginLeft: "auto", fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.65rem", color: "#475569", fontWeight: 400, letterSpacing: 0 }}>
            总胜率 {(overallWR * 100).toFixed(1)}% · {totalWins}W {totalLosses}L
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
          {winDist.map((b, i) => {
            const barH = b.total > 0 ? Math.max(8, b.winRate * 72) : 4;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", height: barH,
                  background: heatColor(b.winRate),
                  opacity: b.total > 0 ? 0.85 : 0.2,
                  borderRadius: "2px 2px 0 0",
                  boxShadow: b.total > 0 ? `0 0 8px ${heatColor(b.winRate)}60` : "none",
                  transition: "height 0.8s cubic-bezier(0.23,1,0.32,1)",
                  position: "relative",
                }}>
                  {b.total > 0 && (
                    <div style={{
                      position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                      fontFamily: "Orbitron, monospace", fontSize: "0.55rem", color: heatColor(b.winRate),
                      whiteSpace: "nowrap",
                    }}>
                      {(b.winRate * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.5rem", color: "#334155", textAlign: "center" }}>
                  {b.label}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, display: "flex", gap: 16, justifyContent: "center" }}>
          {[
            { label: "≥65%", color: "#22C55E", text: "强势" },
            { label: "55-65%", color: "#84CC16", text: "占优" },
            { label: "45-55%", color: "#EAB308", text: "均势" },
            { label: "35-45%", color: "#F97316", text: "弱势" },
            { label: "<35%", color: "#EF4444", text: "劣势" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, background: l.color, borderRadius: 1 }} />
              <span style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.65rem", color: "#475569" }}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
