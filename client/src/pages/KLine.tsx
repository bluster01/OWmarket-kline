// KLine Page - 个人K线详情
// OW HUD Reborn Design
// Shows personal match history as K-line chart with stop-loss advice

import { useState } from "react";
import { Link } from "wouter";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import NavBar from "@/components/NavBar";
import { personalKLine } from "@/lib/mockData";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronRight, Shield, Zap, Target } from "lucide-react";

// Custom dot for win/loss
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  const isWin = payload.matchRet === 1;
  const isLoss = payload.matchRet === -1;
  const color = isWin ? '#22C55E' : isLoss ? '#EF4444' : '#EAB308';
  return (
    <circle
      cx={cx} cy={cy} r={4}
      fill={color}
      stroke="#0A0E1A"
      strokeWidth={1.5}
      style={{ filter: `drop-shadow(0 0 3px ${color})` }}
    />
  );
}

// Custom tooltip
function KLineTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{ background: 'rgba(13,21,38,0.97)', border: '1px solid rgba(0,180,216,0.3)', padding: '10px 14px', borderRadius: '2px', minWidth: 140 }}>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', color: '#64748B', fontSize: '0.7rem', marginBottom: '4px' }}>
          第 {d.index} 场
        </div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '0.9rem', color: d.matchRet === 1 ? '#22C55E' : d.matchRet === -1 ? '#EF4444' : '#EAB308' }}>
          {d.matchRet === 1 ? '胜利' : d.matchRet === -1 ? '失败' : '平局'}
        </div>
        <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
          {d.hero} · {d.map}
        </div>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', color: '#00B4D8', marginTop: '2px' }}>
          累计: {d.cumulativeScore > 0 ? '+' : ''}{d.cumulativeScore}
        </div>
      </div>
    );
  }
  return null;
}

export default function KLine() {
  const [showCount, setShowCount] = useState<20 | 50>(20);
  const matches = personalKLine.matches.slice(-showCount).map((m, i) => ({
    ...m,
    index: personalKLine.matches.length - showCount + i + 1,
    barColor: m.matchRet === 1 ? '#22C55E' : m.matchRet === -1 ? '#EF4444' : '#EAB308',
  }));

  const recentMatches = personalKLine.matches.slice(-10);
  const recentWins = recentMatches.filter(m => m.matchRet === 1).length;

  return (
    <div className="min-h-screen hex-bg" style={{ background: '#0A0E1A' }}>
      <NavBar />
      <div className="pt-14 lg:pt-0 pl-0 lg:pl-56 min-h-screen">

        {/* Header */}
        <div className="border-b" style={{ borderColor: 'rgba(0,180,216,0.2)', background: 'rgba(13,21,38,0.8)' }}>
          <div className="container py-4 flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-1.5 transition-colors" style={{ fontFamily: 'Rajdhani, sans-serif', color: '#64748B', letterSpacing: '0.06em', fontSize: '0.85rem' }}>
                <ArrowLeft size={14} />
                返回大盘
              </button>
            </Link>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#E2E8F0', letterSpacing: '0.05em' }}>
              我的排位 K 线
            </div>
            <div className="ml-auto flex items-center gap-2">
              {[20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setShowCount(n as 20 | 50)}
                  className="px-3 py-1 text-xs transition-all"
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    background: showCount === n ? 'rgba(0,180,216,0.2)' : 'transparent',
                    border: `1px solid ${showCount === n ? '#00B4D8' : 'rgba(255,255,255,0.1)'}`,
                    color: showCount === n ? '#00B4D8' : '#64748B',
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                  }}
                >
                  近{n}场
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container py-6 space-y-5">

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 fade-in-up">
            <div className="ow-card p-4 text-center">
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>当前趋势</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                {personalKLine.trend === 'up' && <TrendingUp size={16} color="#22C55E" />}
                {personalKLine.trend === 'down' && <TrendingDown size={16} color="#EF4444" />}
                {personalKLine.trend === 'sideways' && <Minus size={16} color="#EAB308" />}
                <span style={{
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem',
                  color: personalKLine.trend === 'up' ? '#22C55E' : personalKLine.trend === 'down' ? '#EF4444' : '#EAB308'
                }}>
                  {personalKLine.trend === 'up' ? '上升' : personalKLine.trend === 'down' ? '下行' : '震荡'}
                </span>
              </div>
            </div>
            <div className="ow-card p-4 text-center">
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {personalKLine.streakType === 'win' ? '当前连胜' : '当前连败'}
              </div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', color: personalKLine.streakType === 'win' ? '#22C55E' : '#EF4444', marginTop: '0.1rem' }}>
                {personalKLine.streakType === 'win' ? '+' : '-'}{personalKLine.currentStreak}
              </div>
            </div>
            <div className="ow-card p-4 text-center">
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>近50场胜率</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', color: '#00B4D8', marginTop: '0.1rem' }}>
                {(personalKLine.winRate * 100).toFixed(0)}%
              </div>
            </div>
            <div className="ow-card p-4 text-center">
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>近10场</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontWeight: 700, fontSize: '1.5rem', color: recentWins >= 6 ? '#22C55E' : recentWins >= 4 ? '#EAB308' : '#EF4444', marginTop: '0.1rem' }}>
                {recentWins}W{10 - recentWins}L
              </div>
            </div>
          </div>

          {/* K-Line Chart */}
          <div className="ow-card-lg p-5 fade-in-up delay-100">
            <div className="flex items-center justify-between mb-4">
              <div className="ow-section-title text-sm">累计分数走势（近{showCount}场）</div>
              <div className="flex items-center gap-3 text-xs" style={{ fontFamily: 'Noto Sans SC, sans-serif', color: '#475569' }}>
                <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />胜</span>
                <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />负</span>
                <span className="flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EAB308', display: 'inline-block' }} />平</span>
              </div>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={matches} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="index"
                    tick={{ fontFamily: 'Orbitron, monospace', fontSize: 9, fill: '#334155' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    tickLine={false}
                    interval={Math.floor(showCount / 10)}
                  />
                  <YAxis
                    tick={{ fontFamily: 'Orbitron, monospace', fontSize: 9, fill: '#334155' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<KLineTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(249,115,22,0.3)" strokeDasharray="4 4" />
                  <Bar dataKey="matchRet" opacity={0.25} maxBarSize={8}>
                    {matches.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.barColor} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="cumulativeScore"
                    stroke="#00B4D8"
                    strokeWidth={2}
                    dot={<CustomDot />}
                    activeDot={{ r: 6, fill: '#00B4D8', stroke: '#0A0E1A', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Win/Loss visual strip */}
          <div className="ow-card p-4 fade-in-up delay-200">
            <div className="ow-section-title text-sm mb-3">近{showCount}场胜负记录</div>
            <div className="flex flex-wrap gap-1">
              {matches.map((m, i) => (
                <div
                  key={i}
                  title={`第${m.index}场: ${m.matchRet === 1 ? '胜' : m.matchRet === -1 ? '负' : '平'} · ${m.hero} · ${m.map}`}
                  style={{
                    width: 18,
                    height: 18,
                    background: m.matchRet === 1 ? 'rgba(34,197,94,0.8)' : m.matchRet === -1 ? 'rgba(239,68,68,0.8)' : 'rgba(234,179,8,0.8)',
                    clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))',
                    boxShadow: m.matchRet === 1 ? '0 0 4px rgba(34,197,94,0.4)' : m.matchRet === -1 ? '0 0 4px rgba(239,68,68,0.4)' : 'none',
                    cursor: 'default',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stop-loss advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in-up delay-300">
            <div className="ow-card p-5">
              <div className="ow-section-title text-sm mb-4">
                <Shield size={14} className="ml-1" />
                止损建议
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 p-3 rounded-sm" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <span style={{ fontSize: '1rem' }}>✅</span>
                  <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6 }}>
                    <span style={{ color: '#22C55E', fontWeight: 700 }}>当前连胜 {personalKLine.currentStreak} 局</span>
                    <br />趋势向上，状态良好
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-sm" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                  <span style={{ fontSize: '1rem' }}>🟡</span>
                  <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6 }}>
                    <span style={{ color: '#EAB308', fontWeight: 700 }}>建议止损线</span>
                    <br />连续 2 局失败后建议暂停休息
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-sm" style={{ background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.2)' }}>
                  <span style={{ fontSize: '1rem' }}>🟢</span>
                  <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.6 }}>
                    <span style={{ color: '#00B4D8', fontWeight: 700 }}>当前趋势向上</span>
                    <br />{personalKLine.stopAdvice}
                  </div>
                </div>
              </div>
            </div>

            <div className="ow-card p-5">
              <div className="ow-section-title text-sm mb-4">
                <Target size={14} className="ml-1" />
                数据分析
              </div>
              <div className="space-y-3">
                {[
                  { label: '近50场胜率', value: `${(personalKLine.winRate * 100).toFixed(1)}%`, color: '#00B4D8', bar: personalKLine.winRate * 100 },
                  { label: '连胜动能', value: `${personalKLine.currentStreak}连胜`, color: '#22C55E', bar: Math.min(personalKLine.currentStreak * 15, 100) },
                  { label: '近10场胜率', value: `${recentWins * 10}%`, color: recentWins >= 6 ? '#22C55E' : recentWins >= 4 ? '#EAB308' : '#EF4444', bar: recentWins * 10 },
                  { label: '胜场数', value: `${personalKLine.winCount}/${personalKLine.totalCount}`, color: '#F97316', bar: (personalKLine.winCount / personalKLine.totalCount) * 100 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.75rem', color: '#64748B' }}>{item.label}</span>
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.75rem', color: item.color, fontWeight: 700 }}>{item.value}</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${item.bar}%`, background: item.color,
                        borderRadius: 2, boxShadow: `0 0 6px ${item.color}`,
                        transition: 'width 1s cubic-bezier(0.23,1,0.32,1)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <Link href="/submit">
                  <button className="ow-btn text-xs flex items-center gap-1">
                    <Zap size={11} />
                    提交数据
                  </button>
                </Link>
                <button
                  className="ow-btn text-xs flex items-center gap-1"
                  onClick={() => alert('分享功能即将上线')}
                >
                  分享K线图 <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* Recent match list */}
          <div className="ow-card p-5 fade-in-up delay-400">
            <div className="ow-section-title text-sm mb-4">最近对局记录</div>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['结果', '英雄', '地图', '时长', '段位'].map((h) => (
                      <th key={h} style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 0.75rem', textAlign: 'left' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {personalKLine.matches.slice(-10).reverse().map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', opacity: 1 - i * 0.05 }}>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span style={{
                          fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                          color: m.matchRet === 1 ? '#22C55E' : m.matchRet === -1 ? '#EF4444' : '#EAB308',
                        }}>
                          {m.matchRet === 1 ? '胜' : m.matchRet === -1 ? '负' : '平'}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#94A3B8' }}>{m.hero}</td>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#64748B' }}>{m.map}</td>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'Orbitron, monospace', fontSize: '0.7rem', color: '#475569' }}>
                        {Math.floor(m.duration / 60)}:{String(m.duration % 60).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.7rem', color: '#64748B' }}>
                          {m.rankTier === 'gold' ? '黄金' : '白金'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
