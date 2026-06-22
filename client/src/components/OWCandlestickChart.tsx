// OWCandlestickChart - 守望先锋风格 K 线蜡烛图
// 每根蜡烛 = 一场对局
// 胜利 = 绿色上涨蜡烛（收盘 > 开盘）
// 失败 = 红色下跌蜡烛（收盘 < 开盘）
// 上下影线 = 该场对局的波动范围（模拟）
// 实体 = 开盘价到收盘价

import { useState, useRef, useCallback } from "react";

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

interface OWCandlestickChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
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

export default function OWCandlestickChart({ data, height = 320 }: OWCandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const PADDING = { top: 20, right: 16, bottom: 40, left: 52 };

  // Compute chart dimensions dynamically
  const containerWidth = containerRef.current?.clientWidth || 800;
  const chartW = containerWidth - PADDING.left - PADDING.right;
  const chartH = height - PADDING.top - PADDING.bottom;

  const n = data.length;
  const candleWidth = Math.max(4, Math.min(18, (chartW / n) * 0.65));
  const candleGap = chartW / n;

  // Price range
  const allPrices = data.flatMap((d) => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const paddedMin = minPrice - priceRange * 0.08;
  const paddedMax = maxPrice + priceRange * 0.08;
  const totalRange = paddedMax - paddedMin;

  const toY = (price: number) =>
    PADDING.top + chartH - ((price - paddedMin) / totalRange) * chartH;
  const toX = (i: number) =>
    PADDING.left + i * candleGap + candleGap / 2;

  // Y-axis ticks
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const price = paddedMin + (totalRange / (tickCount - 1)) * i;
    return { price, y: toY(price) };
  });

  // X-axis ticks (every ~5 candles)
  const xTickInterval = Math.max(1, Math.floor(n / 10));
  const xTicks = data
    .filter((_, i) => i % xTickInterval === 0 || i === n - 1)
    .map((d) => ({ index: d.index, x: toX(data.indexOf(d)) }));

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
          <line
            key={i}
            x1={PADDING.left}
            y1={tick.y}
            x2={PADDING.left + chartW}
            y2={tick.y}
            stroke={GRID_COLOR}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Zero line (cumulative score = 0) */}
        {(() => {
          const zeroY = toY(0);
          if (zeroY > PADDING.top && zeroY < PADDING.top + chartH) {
            return (
              <line
                x1={PADDING.left}
                y1={zeroY}
                x2={PADDING.left + chartW}
                y2={zeroY}
                stroke="rgba(249,115,22,0.5)"
                strokeWidth={1}
                strokeDasharray="6 3"
              />
            );
          }
          return null;
        })()}

        {/* Axes */}
        <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + chartH} stroke={AXIS_COLOR} strokeWidth={1} />
        <line x1={PADDING.left} y1={PADDING.top + chartH} x2={PADDING.left + chartW} y2={PADDING.top + chartH} stroke={AXIS_COLOR} strokeWidth={1} />

        {/* Y-axis labels */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={PADDING.left - 6}
            y={tick.y + 4}
            textAnchor="end"
            fill="rgba(100,116,139,0.9)"
            fontSize={10}
            fontFamily="Orbitron, monospace"
          >
            {tick.price >= 0 ? `+${tick.price.toFixed(0)}` : tick.price.toFixed(0)}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((tick, i) => (
          <text
            key={i}
            x={tick.x}
            y={PADDING.top + chartH + 16}
            textAnchor="middle"
            fill="rgba(100,116,139,0.9)"
            fontSize={9}
            fontFamily="Orbitron, monospace"
          >
            {tick.index}
          </text>
        ))}

        {/* Candles */}
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

          return (
            <g key={i}>
              {/* Hover highlight */}
              {isHovered && (
                <rect
                  x={x - candleGap / 2}
                  y={PADDING.top}
                  width={candleGap}
                  height={chartH}
                  fill="rgba(255,255,255,0.03)"
                />
              )}

              {/* Upper wick */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={bodyTop}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.5}
                opacity={isHovered ? 1 : 0.8}
              />

              {/* Lower wick */}
              <line
                x1={x}
                y1={bodyTop + bodyHeight}
                x2={x}
                y2={lowY}
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.5}
                opacity={isHovered ? 1 : 0.8}
              />

              {/* Candle body */}
              <rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={fill}
                stroke={color}
                strokeWidth={isHovered ? 1.5 : 1}
                rx={1}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 2px ${color}40)`,
                  transition: "filter 0.1s",
                }}
              />

              {/* Doji cross (draw) */}
              {d.matchRet === 0 && (
                <line
                  x1={x - candleWidth / 2 - 2}
                  y1={openY}
                  x2={x + candleWidth / 2 + 2}
                  y2={openY}
                  stroke={CANDLE_DRAW_COLOR}
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}

        {/* Crosshair on hover */}
        {hoveredIndex !== null && (
          <>
            <line
              x1={toX(hoveredIndex)}
              y1={PADDING.top}
              x2={toX(hoveredIndex)}
              y2={PADDING.top + chartH}
              stroke="rgba(0,180,216,0.4)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <line
              x1={PADDING.left}
              y1={tooltipPos.y}
              x2={PADDING.left + chartW}
              y2={tooltipPos.y}
              stroke="rgba(0,180,216,0.2)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            left: tooltipPos.x + 12,
            top: Math.max(8, tooltipPos.y - 80),
            background: "rgba(10,14,26,0.97)",
            border: `1px solid ${hovered.matchRet === 1 ? "#22C55E" : hovered.matchRet === -1 ? "#EF4444" : "#EAB308"}`,
            padding: "10px 14px",
            borderRadius: "2px",
            pointerEvents: "none",
            zIndex: 50,
            minWidth: 160,
            clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#475569", marginBottom: 6, letterSpacing: "0.1em" }}>
            第 {hovered.index} 场
          </div>
          <div style={{
            fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1.1rem",
            color: hovered.matchRet === 1 ? "#22C55E" : hovered.matchRet === -1 ? "#EF4444" : "#EAB308",
            marginBottom: 6,
          }}>
            {hovered.matchRet === 1 ? "▲ 胜利" : hovered.matchRet === -1 ? "▼ 失败" : "— 平局"}
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
            <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#475569", marginTop: 2 }}>
              {formatDuration(hovered.duration)} · {hovered.rankTier === "gold" ? "黄金" : "白金"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
