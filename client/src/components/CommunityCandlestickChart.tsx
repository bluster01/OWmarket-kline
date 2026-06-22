// CommunityCandlestickChart - 社区大盘 K 线蜡烛图
// 每根蜡烛 = 一天
// 绿色 = 当日胜率高于前日（上涨）
// 红色 = 当日胜率低于前日（下跌）

import { useState, useRef } from "react";
import type { DayCandleData } from "@/lib/candleData";

interface Props {
  data: DayCandleData[];
  height?: number;
}

const WIN_COLOR = "#22C55E";
const LOSS_COLOR = "#EF4444";
const FLAT_COLOR = "#EAB308";

export default function CommunityCandlestickChart({ data, height = 240 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const PAD = { top: 16, right: 16, bottom: 48, left: 60 };
  const containerWidth = containerRef.current?.clientWidth || 760;
  const chartW = containerWidth - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  const n = data.length;
  const candleGap = chartW / n;
  const candleWidth = Math.max(6, candleGap * 0.6);

  const allPrices = data.flatMap((d) => [d.high, d.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 0.001;
  const paddedMin = minPrice - priceRange * 0.15;
  const paddedMax = maxPrice + priceRange * 0.15;
  const totalRange = paddedMax - paddedMin;

  const toY = (p: number) => PAD.top + chartH - ((p - paddedMin) / totalRange) * chartH;
  const toX = (i: number) => PAD.left + i * candleGap + candleGap / 2;

  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount }, (_, i) => {
    const price = paddedMin + (totalRange / (tickCount - 1)) * i;
    return { price, y: toY(price) };
  });

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${containerWidth} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left - PAD.left;
          const i = Math.round(mx / candleGap - 0.5);
          if (i >= 0 && i < n) {
            setHoveredIndex(i);
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          } else {
            setHoveredIndex(null);
          }
        }}
        onMouseLeave={() => setHoveredIndex(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        {/* Grid */}
        {yTicks.map((t, i) => (
          <line key={i} x1={PAD.left} y1={t.y} x2={PAD.left + chartW} y2={t.y}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="4 4" />
        ))}

        {/* 50% reference line */}
        {(() => {
          const y50 = toY(0.5);
          return (
            <g>
              <line x1={PAD.left} y1={y50} x2={PAD.left + chartW} y2={y50}
                stroke="rgba(249,115,22,0.45)" strokeWidth={1} strokeDasharray="6 3" />
              <text x={PAD.left + chartW + 2} y={y50 + 4} fill="#F97316" fontSize={9}
                fontFamily="Orbitron, monospace">50%</text>
            </g>
          );
        })()}

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + chartH}
          stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <line x1={PAD.left} y1={PAD.top + chartH} x2={PAD.left + chartW} y2={PAD.top + chartH}
          stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {/* Y labels */}
        {yTicks.map((t, i) => (
          <text key={i} x={PAD.left - 6} y={t.y + 4} textAnchor="end"
            fill="rgba(100,116,139,0.9)" fontSize={10} fontFamily="Orbitron, monospace">
            {(t.price * 100).toFixed(1)}%
          </text>
        ))}

        {/* Volume bars at bottom */}
        {data.map((d, i) => {
          const maxVol = Math.max(...data.map((x) => x.volume));
          const volHeight = (d.volume / maxVol) * 28;
          const isUp = d.trend === "up";
          const color = isUp ? WIN_COLOR : d.trend === "down" ? LOSS_COLOR : FLAT_COLOR;
          return (
            <rect key={i}
              x={toX(i) - candleWidth / 2}
              y={PAD.top + chartH + 4}
              width={candleWidth}
              height={volHeight}
              fill={color}
              opacity={0.25}
              rx={1}
            />
          );
        })}

        {/* Candles */}
        {data.map((d, i) => {
          const x = toX(i);
          const openY = toY(d.open);
          const closeY = toY(d.close);
          const highY = toY(d.high);
          const lowY = toY(d.low);
          const isUp = d.trend === "up";
          const color = isUp ? WIN_COLOR : d.trend === "down" ? LOSS_COLOR : FLAT_COLOR;
          const bodyTop = Math.min(openY, closeY);
          const bodyH = Math.max(Math.abs(closeY - openY), 2);
          const isHov = hoveredIndex === i;

          return (
            <g key={i}>
              {isHov && (
                <rect x={x - candleGap / 2} y={PAD.top} width={candleGap} height={chartH}
                  fill="rgba(255,255,255,0.03)" />
              )}
              {/* Upper wick */}
              <line x1={x} y1={highY} x2={x} y2={bodyTop}
                stroke={color} strokeWidth={isHov ? 2 : 1.5} opacity={0.85} />
              {/* Lower wick */}
              <line x1={x} y1={bodyTop + bodyH} x2={x} y2={lowY}
                stroke={color} strokeWidth={isHov ? 2 : 1.5} opacity={0.85} />
              {/* Body */}
              <rect
                x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyH}
                fill={isUp ? "rgba(34,197,94,0.8)" : d.trend === "down" ? "rgba(239,68,68,0.8)" : "rgba(234,179,8,0.8)"}
                stroke={color} strokeWidth={isHov ? 1.5 : 1} rx={1}
                style={{ filter: isHov ? `drop-shadow(0 0 5px ${color})` : `drop-shadow(0 0 2px ${color}50)` }}
              />
            </g>
          );
        })}

        {/* X labels */}
        {data.map((d, i) => {
          if (i % 3 !== 0 && i !== n - 1) return null;
          return (
            <text key={i} x={toX(i)} y={PAD.top + chartH + 14} textAnchor="middle"
              fill="rgba(100,116,139,0.8)" fontSize={9} fontFamily="Orbitron, monospace">
              {d.date}
            </text>
          );
        })}

        {/* Crosshair */}
        {hoveredIndex !== null && (
          <line x1={toX(hoveredIndex)} y1={PAD.top} x2={toX(hoveredIndex)} y2={PAD.top + chartH}
            stroke="rgba(0,180,216,0.4)" strokeWidth={1} strokeDasharray="3 3" />
        )}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div style={{
          position: "absolute",
          left: tooltipPos.x + 12,
          top: Math.max(8, tooltipPos.y - 90),
          background: "rgba(10,14,26,0.97)",
          border: `1px solid ${data[hoveredIndex].trend === "up" ? WIN_COLOR : data[hoveredIndex].trend === "down" ? LOSS_COLOR : FLAT_COLOR}`,
          padding: "10px 14px",
          borderRadius: "2px",
          pointerEvents: "none",
          zIndex: 50,
          minWidth: 150,
          clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}>
          {(() => {
            const d = data[hoveredIndex];
            const color = d.trend === "up" ? WIN_COLOR : d.trend === "down" ? LOSS_COLOR : FLAT_COLOR;
            return (
              <>
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#475569", marginBottom: 6, letterSpacing: "0.1em" }}>
                  {d.date}
                </div>
                <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: "1rem", color, marginBottom: 6 }}>
                  {d.trend === "up" ? "▲ 上涨" : d.trend === "down" ? "▼ 下跌" : "— 横盘"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px" }}>
                  {[
                    { label: "开", value: `${(d.open * 100).toFixed(2)}%`, color: "#94A3B8" },
                    { label: "收", value: `${(d.close * 100).toFixed(2)}%`, color },
                    { label: "高", value: `${(d.high * 100).toFixed(2)}%`, color: WIN_COLOR },
                    { label: "低", value: `${(d.low * 100).toFixed(2)}%`, color: LOSS_COLOR },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "0.65rem", color: "#475569", width: 14 }}>{item.label}</span>
                      <span style={{ fontFamily: "Orbitron, monospace", fontSize: "0.72rem", color: item.color, fontWeight: 700 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", fontFamily: "Orbitron, monospace", fontSize: "0.65rem", color: "#475569" }}>
                  成交量: {d.volume.toLocaleString()} 场
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
