// OWCandlestickChart - 守望先锋风格 K 线蜡烛图 v2.0
// 功能：蜡烛图 + MA均线 + 布林带 + 成交量柱 + K线形态识别
// 每根蜡烛 = 一场对局，绿色=胜，红色=败
// 技术指标：MA5/MA10/MA20、布林带(20,2)

import { useState, useRef, useCallback, useMemo } from "react";

export interface CandleData {
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
  matchRet: 1 | 0 | -1;
  hero: string;
  map: string;
  duration: number;
  rankTier: string;
  cumulativeScore: number;
}

// ── Technical indicator helpers ──────────────────────────────────────────────

function calcMA(data: CandleData[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((s, c) => s + c.close, 0) / period;
  });
}

function calcBollinger(data: CandleData[], period = 20, multiplier = 2) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, c) => s + c.close, 0) / period;
    const variance = slice.reduce((s, c) => s + Math.pow(c.close - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    return { upper: mean + multiplier * std, middle: mean, lower: mean - multiplier * std };
  });
}

// K线形态识别
type PatternType = "hammer" | "inverted_hammer" | "engulf_bull" | "engulf_bear" | "doji" | "shooting_star" | null;

function detectPattern(data: CandleData[], i: number): PatternType {
  const c = data[i];
  const body = Math.abs(c.close - c.open);
  const upperWick = c.high - Math.max(c.open, c.close);
  const lowerWick = Math.min(c.open, c.close) - c.low;
  const totalRange = c.high - c.low || 0.001;

  // Doji: body < 10% of range
  if (body / totalRange < 0.1) return "doji";

  // Hammer: small body at top, long lower wick (≥2x body), small upper wick
  if (lowerWick >= body * 2 && upperWick <= body * 0.5 && c.matchRet === -1) return "hammer";

  // Shooting star: small body at bottom, long upper wick
  if (upperWick >= body * 2 && lowerWick <= body * 0.5 && c.matchRet === 1) return "shooting_star";

  // Bullish engulfing
  if (i > 0) {
    const prev = data[i - 1];
    if (prev.matchRet === -1 && c.matchRet === 1 && c.open < prev.close && c.close > prev.open) return "engulf_bull";
    if (prev.matchRet === 1 && c.matchRet === -1 && c.open > prev.close && c.close < prev.open) return "engulf_bear";
  }

  return null;
}

const PATTERN_LABELS: Record<NonNullable<PatternType>, { label: string; color: string; emoji: string }> = {
  hammer: { label: "锤子线", color: "#22C55E", emoji: "🔨" },
  inverted_hammer: { label: "倒锤线", color: "#22C55E", emoji: "🔨" },
  engulf_bull: { label: "看涨吞没", color: "#22C55E", emoji: "↑" },
  engulf_bear: { label: "看跌吞没", color: "#EF4444", emoji: "↓" },
  doji: { label: "十字星", color: "#EAB308", emoji: "✛" },
  shooting_star: { label: "流星线", color: "#EF4444", emoji: "★" },
};

// ── Props ─────────────────────────────────────────────────────────────────────

export type IndicatorType = "none" | "ma" | "bollinger";

interface OWCandlestickChartProps {
  data: CandleData[];
  height?: number;
  indicator?: IndicatorType;
  showVolume?: boolean;
  showPatterns?: boolean;
}

const CANDLE_WIN_COLOR = "#22C55E";
const CANDLE_LOSS_COLOR = "#EF4444";
const CANDLE_DRAW_COLOR = "#EAB308";
const CANDLE_WIN_FILL = "rgba(34,197,94,0.85)";
const CANDLE_LOSS_FILL = "rgba(239,68,68,0.85)";
const CANDLE_DRAW_FILL = "rgba(234,179,8,0.85)";
const GRID_COLOR = "rgba(255,255,255,0.05)";
const AXIS_COLOR = "rgba(255,255,255,0.15)";

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function OWCandlestickChart({
  data,
  height = 320,
  indicator = "ma",
  showVolume = true,
  showPatterns = true,
}: OWCandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const PADDING = { top: 24, right: 16, bottom: showVolume ? 80 : 40, left: 56 };
  const VOL_HEIGHT = showVolume ? 36 : 0;

  const containerWidth = containerRef.current?.clientWidth || 800;
  const chartW = containerWidth - PADDING.left - PADDING.right;
  const mainH = height - PADDING.top - PADDING.bottom;
  const volAreaTop = PADDING.top + mainH + 8;

  const n = data.length;
  const candleWidth = Math.max(4, Math.min(18, (chartW / n) * 0.65));
  const candleGap = chartW / n;

  // Price range (include bollinger if active)
  const allPrices = data.flatMap((d) => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const paddedMin = minPrice - priceRange * 0.1;
  const paddedMax = maxPrice + priceRange * 0.1;
  const totalRange = paddedMax - paddedMin;

  const toY = (price: number) =>
    PADDING.top + mainH - ((price - paddedMin) / totalRange) * mainH;
  const toX = (i: number) =>
    PADDING.left + i * candleGap + candleGap / 2;

  // Y-axis ticks
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const price = paddedMin + (totalRange / (tickCount - 1)) * i;
    return { price, y: toY(price) };
  });

  // X-axis ticks
  const xTickInterval = Math.max(1, Math.floor(n / 10));
  const xTicks = data
    .filter((_, i) => i % xTickInterval === 0 || i === n - 1)
    .map((d) => ({ index: d.index, x: toX(data.indexOf(d)) }));

  // Technical indicators
  const ma5 = useMemo(() => calcMA(data, 5), [data]);
  const ma10 = useMemo(() => calcMA(data, 10), [data]);
  const ma20 = useMemo(() => calcMA(data, 20), [data]);
  const bollinger = useMemo(() => calcBollinger(data, 20, 2), [data]);

  // Volume
  const maxVol = Math.max(...data.map((d) => d.duration));

  // Patterns
  const patterns = useMemo(() =>
    showPatterns ? data.map((_, i) => detectPattern(data, i)) : data.map(() => null),
    [data, showPatterns]
  );

  // Build MA path
  function buildLinePath(values: (number | null)[], toYFn: (v: number) => number) {
    let path = "";
    values.forEach((v, i) => {
      if (v === null) return;
      const x = toX(i);
      const y = toYFn(v);
      path += path === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return path;
  }

  // Build bollinger band area path
  function buildBollingerArea() {
    const upper: string[] = [];
    const lower: string[] = [];
    bollinger.forEach((b, i) => {
      if (!b) return;
      upper.push(`${toX(i)},${toY(b.upper)}`);
      lower.push(`${toX(i)},${toY(b.lower)}`);
    });
    if (upper.length < 2) return "";
    return `M ${upper.join(" L ")} L ${lower.reverse().join(" L ")} Z`;
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - PADDING.left;
      const i = Math.round(mouseX / candleGap - 0.5);
      if (i >= 0 && i < n) {
        setHoveredIndex(i);
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        setHoveredIndex(null);
      }
    },
    [candleGap, n, PADDING.left]
  );

  const hovered = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredPattern = hoveredIndex !== null ? patterns[hoveredIndex] : null;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${containerWidth} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        {/* Background */}
        <rect x={0} y={0} width={containerWidth} height={height} fill="transparent" />

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <line key={i} x1={PADDING.left} y1={tick.y} x2={PADDING.left + chartW} y2={tick.y}
            stroke={GRID_COLOR} strokeWidth={1} strokeDasharray="4 4" />
        ))}

        {/* Zero line */}
        {(() => {
          const zeroY = toY(0);
          if (zeroY > PADDING.top && zeroY < PADDING.top + mainH) {
            return <line x1={PADDING.left} y1={zeroY} x2={PADDING.left + chartW} y2={zeroY}
              stroke="rgba(249,115,22,0.5)" strokeWidth={1} strokeDasharray="6 3" />;
          }
          return null;
        })()}

        {/* Axes */}
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + mainH} stroke={AXIS_COLOR} strokeWidth={1} />
        <line x1={PADDING.left} y1={PADDING.top + mainH} x2={PADDING.left + chartW} y2={PADDING.top + mainH} stroke={AXIS_COLOR} strokeWidth={1} />

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text key={i} x={PADDING.left - 6} y={tick.y + 4} textAnchor="end"
            fill="rgba(100,116,139,0.9)" fontSize={10} fontFamily="Orbitron, monospace">
            {tick.price >= 0 ? `+${tick.price.toFixed(0)}` : tick.price.toFixed(0)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((tick, i) => (
          <text key={i} x={tick.x} y={PADDING.top + mainH + 16} textAnchor="middle"
            fill="rgba(100,116,139,0.9)" fontSize={9} fontFamily="Orbitron, monospace">
            #{tick.index}
          </text>
        ))}

        {/* ── Bollinger Band ── */}
        {indicator === "bollinger" && (
          <>
            <path d={buildBollingerArea()} fill="rgba(168,85,247,0.07)" />
            <path d={buildLinePath(bollinger.map(b => b?.upper ?? null), toY)}
              fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth={1} strokeDasharray="3 2" />
            <path d={buildLinePath(bollinger.map(b => b?.middle ?? null), toY)}
              fill="none" stroke="rgba(168,85,247,0.7)" strokeWidth={1} />
            <path d={buildLinePath(bollinger.map(b => b?.lower ?? null), toY)}
              fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth={1} strokeDasharray="3 2" />
          </>
        )}

        {/* ── MA Lines ── */}
        {indicator === "ma" && (
          <>
            <path d={buildLinePath(ma5, toY)} fill="none" stroke="#F97316" strokeWidth={1.5} opacity={0.85} />
            <path d={buildLinePath(ma10, toY)} fill="none" stroke="#00B4D8" strokeWidth={1.5} opacity={0.85} />
            <path d={buildLinePath(ma20, toY)} fill="none" stroke="#A78BFA" strokeWidth={1.5} opacity={0.85} />
          </>
        )}

        {/* ── Candles ── */}
        {data.map((d, i) => {
          const x = toX(i);
          const openY = toY(d.open);
          const closeY = toY(d.close);
          const highY = toY(d.high);
          const lowY = toY(d.low);

          const isWin = d.matchRet === 1;
          const isLoss = d.matchRet === -1;
          const color = isWin ? CANDLE_WIN_COLOR : isLoss ? CANDLE_LOSS_COLOR : CANDLE_DRAW_COLOR;
          const fill = isWin ? CANDLE_WIN_FILL : isLoss ? CANDLE_LOSS_FILL : CANDLE_DRAW_FILL;

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
          const isHovered = hoveredIndex === i;

          const pattern = patterns[i];
          const patternInfo = pattern ? PATTERN_LABELS[pattern] : null;

          return (
            <g key={i}>
              {/* Hover highlight */}
              {isHovered && (
                <rect x={x - candleGap / 2} y={PADDING.top} width={candleGap} height={mainH}
                  fill="rgba(255,255,255,0.03)" />
              )}

              {/* Upper wick */}
              <line x1={x} y1={highY} x2={x} y2={bodyTop}
                stroke={color} strokeWidth={isHovered ? 2 : 1.5} opacity={isHovered ? 1 : 0.8} />

              {/* Lower wick */}
              <line x1={x} y1={bodyTop + bodyHeight} x2={x} y2={lowY}
                stroke={color} strokeWidth={isHovered ? 2 : 1.5} opacity={isHovered ? 1 : 0.8} />

              {/* Candle body */}
              <rect
                x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight}
                fill={fill} stroke={color} strokeWidth={isHovered ? 1.5 : 1} rx={1}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 2px ${color}40)`,
                  transition: "filter 0.1s",
                }}
              />

              {/* Doji cross */}
              {d.matchRet === 0 && (
                <line x1={x - candleWidth / 2 - 2} y1={openY} x2={x + candleWidth / 2 + 2} y2={openY}
                  stroke={CANDLE_DRAW_COLOR} strokeWidth={2} />
              )}

              {/* Pattern marker */}
              {patternInfo && showPatterns && (
                <text
                  x={x} y={patternInfo.color === "#22C55E" ? lowY + 14 : highY - 6}
                  textAnchor="middle" fontSize={9}
                  fill={patternInfo.color} fontFamily="Rajdhani, sans-serif"
                  style={{ filter: `drop-shadow(0 0 3px ${patternInfo.color})` }}
                >
                  {patternInfo.emoji}
                </text>
              )}

              {/* Volume bar */}
              {showVolume && (() => {
                const volH = Math.max(2, (d.duration / maxVol) * (VOL_HEIGHT - 4));
                return (
                  <rect
                    x={x - candleWidth / 2} y={volAreaTop + (VOL_HEIGHT - volH)}
                    width={candleWidth} height={volH}
                    fill={isWin ? "rgba(34,197,94,0.4)" : isLoss ? "rgba(239,68,68,0.4)" : "rgba(234,179,8,0.4)"}
                    rx={1}
                    style={{ filter: isHovered ? `drop-shadow(0 0 3px ${color})` : "none" }}
                  />
                );
              })()}
            </g>
          );
        })}

        {/* Crosshair */}
        {hoveredIndex !== null && (
          <>
            <line x1={toX(hoveredIndex)} y1={PADDING.top} x2={toX(hoveredIndex)} y2={PADDING.top + mainH}
              stroke="rgba(0,180,216,0.4)" strokeWidth={1} strokeDasharray="3 3" />
            <line x1={PADDING.left} y1={tooltipPos.y} x2={PADDING.left + chartW} y2={tooltipPos.y}
              stroke="rgba(0,180,216,0.2)" strokeWidth={1} strokeDasharray="3 3" />
          </>
        )}

        {/* Volume axis label */}
        {showVolume && (
          <>
            <line x1={PADDING.left} y1={volAreaTop} x2={PADDING.left + chartW} y2={volAreaTop}
              stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={PADDING.left - 6} y={volAreaTop + VOL_HEIGHT / 2 + 4} textAnchor="end"
              fill="rgba(100,116,139,0.6)" fontSize={8} fontFamily="Orbitron, monospace">VOL</text>
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            left: tooltipPos.x > containerWidth * 0.6 ? tooltipPos.x - 190 : tooltipPos.x + 12,
            top: Math.max(8, tooltipPos.y - 100),
            background: "rgba(10,14,26,0.97)",
            border: `1px solid ${hovered.matchRet === 1 ? "#22C55E" : hovered.matchRet === -1 ? "#EF4444" : "#EAB308"}`,
            padding: "10px 14px",
            borderRadius: "2px",
            pointerEvents: "none",
            zIndex: 50,
            minWidth: 180,
            clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#475569", marginBottom: 4, letterSpacing: "0.1em" }}>
            第 {hovered.index} 场
          </div>
          <div style={{
            fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem",
            color: hovered.matchRet === 1 ? "#22C55E" : hovered.matchRet === -1 ? "#EF4444" : "#EAB308",
            marginBottom: 6,
          }}>
            {hovered.matchRet === 1 ? "▲ 胜利" : hovered.matchRet === -1 ? "▼ 失败" : "— 平局"}
            {hoveredPattern && (
              <span style={{ fontSize: "0.7rem", marginLeft: 6, color: PATTERN_LABELS[hoveredPattern].color }}>
                · {PATTERN_LABELS[hoveredPattern].label}
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px" }}>
            {[
              { label: "开", value: hovered.open >= 0 ? `+${hovered.open.toFixed(1)}` : hovered.open.toFixed(1), color: "#94A3B8" },
              { label: "收", value: hovered.close >= 0 ? `+${hovered.close.toFixed(1)}` : hovered.close.toFixed(1), color: hovered.matchRet === 1 ? "#22C55E" : hovered.matchRet === -1 ? "#EF4444" : "#EAB308" },
              { label: "高", value: hovered.high >= 0 ? `+${hovered.high.toFixed(1)}` : hovered.high.toFixed(1), color: "#22C55E" },
              { label: "低", value: hovered.low >= 0 ? `+${hovered.low.toFixed(1)}` : hovered.low.toFixed(1), color: "#EF4444" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569", width: 14 }}>{item.label}</span>
                <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.75rem", color: item.color, fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: "0.72rem", color: "#64748B" }}>
              {hovered.hero} · {hovered.map}
            </div>
            <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#475569", marginTop: 2 }}>
              {formatDuration(hovered.duration)} · {hovered.rankTier}
            </div>
            {indicator === "ma" && (() => {
              const i = hoveredIndex!;
              const m5 = ma5[i]; const m10 = ma10[i]; const m20 = ma20[i];
              return (
                <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
                  {m5 !== null && <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#F97316" }}>MA5:{m5.toFixed(1)}</span>}
                  {m10 !== null && <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#00B4D8" }}>MA10:{m10.toFixed(1)}</span>}
                  {m20 !== null && <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#A78BFA" }}>MA20:{m20.toFixed(1)}</span>}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
