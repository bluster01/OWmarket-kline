// RSIMACDChart - RSI + MACD 副图面板
// RSI(14): 相对强弱指数，超买>70，超卖<30
// MACD(12,26,9): DIF线、DEA线、MACD柱
// 每个数据点对应一场对局的累计分数

import { useRef, useState, useCallback, useMemo } from "react";
import type { CandleData } from "./OWCandlestickChart";

// ── RSI Calculation ──────────────────────────────────────────────────────────
function calcRSI(data: CandleData[], period = 14): (number | null)[] {
  const closes = data.map(d => d.close);
  const result: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period) { result.push(null); continue; }
    const changes = closes.slice(i - period + 1, i + 1).map((c, j, arr) =>
      j === 0 ? 0 : c - arr[j - 1]
    ).slice(1);
    const gains = changes.filter(c => c > 0);
    const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.reduce((s, v) => s + v, 0) / period;
    const avgLoss = losses.reduce((s, v) => s + v, 0) / period;
    if (avgLoss === 0) { result.push(100); continue; }
    const rs = avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }
  return result;
}

// ── EMA Calculation ──────────────────────────────────────────────────────────
function calcEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  values.forEach((v, i) => {
    if (i === 0) { ema.push(v); return; }
    ema.push(v * k + ema[i - 1] * (1 - k));
  });
  return ema;
}

// ── MACD Calculation ─────────────────────────────────────────────────────────
function calcMACD(data: CandleData[], fast = 12, slow = 26, signal = 9) {
  const closes = data.map(d => d.close);
  const emaFast = calcEMA(closes, fast);
  const emaSlow = calcEMA(closes, slow);
  const dif = emaFast.map((f, i) => f - emaSlow[i]);
  const dea = calcEMA(dif, signal);
  const macd = dif.map((d, i) => (d - dea[i]) * 2);
  return { dif, dea, macd };
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface RSIMACDChartProps {
  data: CandleData[];
  activePanel: "rsi" | "macd";
}

const GRID_COLOR = "rgba(255,255,255,0.05)";
const AXIS_COLOR = "rgba(255,255,255,0.12)";
const HEIGHT = 120;
const PADDING = { top: 12, right: 16, bottom: 28, left: 56 };

export default function RSIMACDChart({ data, activePanel }: RSIMACDChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const containerWidth = containerRef.current?.clientWidth || 800;
  const chartW = containerWidth - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;
  const n = data.length;
  const candleGap = chartW / n;

  const toX = (i: number) => PADDING.left + i * candleGap + candleGap / 2;

  const rsi = useMemo(() => calcRSI(data, 14), [data]);
  const { dif, dea, macd } = useMemo(() => calcMACD(data), [data]);

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
    [candleGap, n]
  );

  // ── RSI Panel ──────────────────────────────────────────────────────────────
  function renderRSI() {
    const toY = (v: number) => PADDING.top + chartH - ((v - 0) / 100) * chartH;
    const ticks = [0, 30, 50, 70, 100];

    let path = "";
    rsi.forEach((v, i) => {
      if (v === null) return;
      const x = toX(i); const y = toY(v);
      path += path === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    return (
      <>
        {/* Grid + labels */}
        {ticks.map(t => {
          const y = toY(t);
          const isZone = t === 30 || t === 70;
          return (
            <g key={t}>
              <line x1={PADDING.left} y1={y} x2={PADDING.left + chartW} y2={y}
                stroke={isZone ? "rgba(255,255,255,0.12)" : GRID_COLOR}
                strokeWidth={isZone ? 1 : 0.5}
                strokeDasharray={isZone ? "4 3" : "2 4"} />
              <text x={PADDING.left - 6} y={y + 4} textAnchor="end"
                fill={isZone ? "rgba(100,116,139,0.8)" : "rgba(71,85,105,0.6)"}
                fontSize={8} fontFamily="Orbitron, monospace">{t}</text>
            </g>
          );
        })}

        {/* Overbought/oversold fill */}
        <clipPath id="rsi-clip">
          <rect x={PADDING.left} y={PADDING.top} width={chartW} height={chartH} />
        </clipPath>
        <rect x={PADDING.left} y={PADDING.top} width={chartW} height={toY(70) - PADDING.top}
          fill="rgba(239,68,68,0.04)" clipPath="url(#rsi-clip)" />
        <rect x={PADDING.left} y={toY(30)} width={chartW} height={PADDING.top + chartH - toY(30)}
          fill="rgba(34,197,94,0.04)" clipPath="url(#rsi-clip)" />

        {/* RSI line */}
        <path d={path} fill="none" stroke="#F97316" strokeWidth={1.5} clipPath="url(#rsi-clip)" />

        {/* Hovered dot */}
        {hoveredIndex !== null && rsi[hoveredIndex] !== null && (
          <circle cx={toX(hoveredIndex)} cy={toY(rsi[hoveredIndex]!)} r={3}
            fill="#F97316" stroke="#0A0E1A" strokeWidth={1.5} />
        )}

        {/* Zone labels */}
        <text x={PADDING.left + 4} y={toY(70) - 3} fontSize={7} fill="rgba(239,68,68,0.6)" fontFamily="Rajdhani, sans-serif">超买</text>
        <text x={PADDING.left + 4} y={toY(30) + 10} fontSize={7} fill="rgba(34,197,94,0.6)" fontFamily="Rajdhani, sans-serif">超卖</text>
      </>
    );
  }

  // ── MACD Panel ─────────────────────────────────────────────────────────────
  function renderMACD() {
    const allVals = [...dif, ...dea, ...macd].filter(v => isFinite(v));
    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const range = maxV - minV || 1;
    const pad = range * 0.15;
    const lo = minV - pad; const hi = maxV + pad;
    const toY = (v: number) => PADDING.top + chartH - ((v - lo) / (hi - lo)) * chartH;
    const zeroY = toY(0);
    const barW = Math.max(2, candleGap * 0.6);

    let difPath = ""; let deaPath = "";
    dif.forEach((v, i) => {
      const x = toX(i); const y = toY(v);
      difPath += difPath === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    dea.forEach((v, i) => {
      const x = toX(i); const y = toY(v);
      deaPath += deaPath === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    return (
      <>
        <clipPath id="macd-clip">
          <rect x={PADDING.left} y={PADDING.top} width={chartW} height={chartH} />
        </clipPath>

        {/* Zero line */}
        <line x1={PADDING.left} y1={zeroY} x2={PADDING.left + chartW} y2={zeroY}
          stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 3" />
        <text x={PADDING.left - 6} y={zeroY + 4} textAnchor="end"
          fill="rgba(100,116,139,0.7)" fontSize={8} fontFamily="Orbitron, monospace">0</text>

        {/* MACD histogram bars */}
        {macd.map((v, i) => {
          const x = toX(i);
          const isPos = v >= 0;
          const barTop = isPos ? toY(v) : zeroY;
          const barH = Math.abs(toY(v) - zeroY);
          return (
            <rect key={i}
              x={x - barW / 2} y={barTop} width={barW} height={Math.max(1, barH)}
              fill={isPos ? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"}
              clipPath="url(#macd-clip)"
              style={{ filter: hoveredIndex === i ? `drop-shadow(0 0 3px ${isPos ? "#22C55E" : "#EF4444"})` : "none" }}
            />
          );
        })}

        {/* DIF line */}
        <path d={difPath} fill="none" stroke="#00B4D8" strokeWidth={1.5} clipPath="url(#macd-clip)" />
        {/* DEA line */}
        <path d={deaPath} fill="none" stroke="#F97316" strokeWidth={1.5} clipPath="url(#macd-clip)" />

        {/* Hovered dots */}
        {hoveredIndex !== null && (
          <>
            <circle cx={toX(hoveredIndex)} cy={toY(dif[hoveredIndex])} r={3}
              fill="#00B4D8" stroke="#0A0E1A" strokeWidth={1.5} />
            <circle cx={toX(hoveredIndex)} cy={toY(dea[hoveredIndex])} r={3}
              fill="#F97316" stroke="#0A0E1A" strokeWidth={1.5} />
          </>
        )}
      </>
    );
  }

  const hoveredRSI = hoveredIndex !== null ? rsi[hoveredIndex] : null;
  const hoveredDIF = hoveredIndex !== null ? dif[hoveredIndex] : null;
  const hoveredDEA = hoveredIndex !== null ? dea[hoveredIndex] : null;
  const hoveredMACD = hoveredIndex !== null ? macd[hoveredIndex] : null;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg
        width="100%" height={HEIGHT}
        viewBox={`0 0 ${containerWidth} ${HEIGHT}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        <rect x={0} y={0} width={containerWidth} height={HEIGHT} fill="transparent" />

        {/* Axes */}
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + chartH} stroke={AXIS_COLOR} strokeWidth={1} />
        <line x1={PADDING.left} y1={PADDING.top + chartH} x2={PADDING.left + chartW} y2={PADDING.top + chartH} stroke={AXIS_COLOR} strokeWidth={1} />

        {activePanel === "rsi" ? renderRSI() : renderMACD()}

        {/* Crosshair */}
        {hoveredIndex !== null && (
          <line x1={toX(hoveredIndex)} y1={PADDING.top} x2={toX(hoveredIndex)} y2={PADDING.top + chartH}
            stroke="rgba(0,180,216,0.3)" strokeWidth={1} strokeDasharray="3 3" />
        )}

        {/* X labels */}
        {data.filter((_, i) => i % Math.max(1, Math.floor(n / 10)) === 0 || i === n - 1).map((d, _, arr) => {
          const i = data.indexOf(d);
          return (
            <text key={i} x={toX(i)} y={PADDING.top + chartH + 16} textAnchor="middle"
              fill="rgba(100,116,139,0.7)" fontSize={8} fontFamily="Orbitron, monospace">
              #{d.index}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div style={{
          position: "absolute",
          left: tooltipPos.x > containerWidth * 0.6 ? tooltipPos.x - 160 : tooltipPos.x + 10,
          top: 4,
          background: "rgba(10,14,26,0.95)",
          border: "1px solid rgba(0,180,216,0.3)",
          padding: "6px 10px",
          borderRadius: 2,
          pointerEvents: "none",
          zIndex: 50,
          display: "flex", gap: 12,
        }}>
          {activePanel === "rsi" && hoveredRSI !== null && (
            <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: hoveredRSI > 70 ? "#EF4444" : hoveredRSI < 30 ? "#22C55E" : "#F97316" }}>
              RSI({14}): {hoveredRSI.toFixed(1)}
            </span>
          )}
          {activePanel === "macd" && hoveredDIF !== null && (
            <>
              <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#00B4D8" }}>DIF:{hoveredDIF.toFixed(2)}</span>
              <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: "#F97316" }}>DEA:{hoveredDEA!.toFixed(2)}</span>
              <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.6rem", color: hoveredMACD! >= 0 ? "#22C55E" : "#EF4444" }}>MACD:{hoveredMACD!.toFixed(2)}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
