// About Page - 关于/说明
// OW HUD Reborn Design

import { Link } from "wouter";
import NavBar from "@/components/NavBar";
import { ArrowLeft, Shield, BarChart2, Zap, AlertTriangle, ExternalLink } from "lucide-react";

export default function About() {
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
              关于 / 说明
            </div>
          </div>
        </div>

        <div className="container py-6 max-w-3xl space-y-5">

          {/* Hero */}
          <div className="ow-card-lg p-6 fade-in-up" style={{ background: `linear-gradient(135deg, rgba(13,21,38,0.95), rgba(0,180,216,0.05))` }}>
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/309926361772947966/7XWvfcHGSfqvTqbbpsbnaZ/ow-logo-fAuvKZ8QwNXpPMtLUTjJq5.webp"
                alt="守望国服大盘"
                style={{ width: 56, height: 56, filter: 'drop-shadow(0 0 10px rgba(0,180,216,0.5))' }}
              />
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#E2E8F0', letterSpacing: '0.05em' }}>
                  守望国服大盘
                </div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', color: '#00B4D8', letterSpacing: '0.2em' }}>
                  OW MARKET · v0.1.0 MVP
                </div>
              </div>
            </div>
            <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.8 }}>
              守望国服大盘是一个基于社区自愿授权数据聚合的守望先锋排位情绪/上分环境指数系统，
              让玩家在排位前先看大盘，再决定是否上分。
            </div>
            <div className="mt-3 p-3 rounded-sm" style={{ background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.2)' }}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#00B4D8', letterSpacing: '0.05em' }}>
                "先看大盘，再上分"
              </div>
            </div>
          </div>

          {/* Core concepts */}
          <div className="ow-card p-5 fade-in-up delay-100">
            <div className="ow-section-title text-sm mb-4">
              <BarChart2 size={14} className="ml-1" />
              核心概念
            </div>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['概念', '股票市场', '守望国服大盘'].map(h => (
                      <th key={h} style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 0.75rem', textAlign: 'left' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['个股', '每股的涨跌', '每个玩家的K线（连胜/连负）'],
                    ['指数', '上证/深证指数', '国服排位情绪指数'],
                    ['板块', '行业板块', '分段/职责/模式分指数'],
                    ['开盘/收盘', '交易时间', '每日排位窗口'],
                    ['技术指标', 'MACD/RSI', '连胜动能/连败压力/波动率'],
                  ].map(([concept, stock, ow]) => (
                    <tr key={concept} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#00B4D8' }}>{concept}</td>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.78rem', color: '#64748B' }}>{stock}</td>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.78rem', color: '#94A3B8' }}>{ow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Index explanation */}
          <div className="ow-card p-5 fade-in-up delay-200">
            <div className="ow-section-title text-sm mb-4">
              <Zap size={14} className="ml-1" />
              指数说明
            </div>
            <div className="space-y-3">
              {[
                { name: '上分天气指数', range: '0-100', desc: '综合判断当前排位环境友好度。≥70为晴天，60-69为多云转晴，50-59为多云，40-49为阴雨，30-39为雷暴，<30为台风。', color: '#F97316' },
                { name: '连败压力指数', range: '0-100%', desc: '社区中处于≥2连败的玩家比例。数值越高说明当前环境越容易触发连败。', color: '#EF4444' },
                { name: '连胜动能指数', range: '0-100%', desc: '社区中处于≥3连胜的玩家比例。数值越高说明当前环境连胜动能越强。', color: '#22C55E' },
                { name: '毒池指数', range: '0-100', desc: '集中连败/碾压局密度。反映当前环境中极端局的集中程度。', color: '#A78BFA' },
                { name: '波动率', range: '0-50+', desc: '20场滚动窗口胜率的标准差×100。数值越高说明当前环境越不稳定。', color: '#EAB308' },
              ].map((idx) => (
                <div key={idx.name} className="flex items-start gap-3 p-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-shrink-0">
                    <div className="ow-badge" style={{ color: idx.color, borderColor: idx.color }}>
                      {idx.range}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: idx.color, marginBottom: '0.2rem' }}>
                      {idx.name}
                    </div>
                    <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>
                      {idx.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="ow-card p-5 fade-in-up delay-300">
            <div className="ow-section-title text-sm mb-4">
              <Shield size={14} className="ml-1" />
              隐私处理原则
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '🔒', title: '不存储', desc: '真实战网ID（单向hash）、真实姓名、IP地址' },
                { icon: '🚫', title: '不追踪', desc: '不跨站跟踪用户，不建立个人画像' },
                { icon: '📢', title: '明文告知', desc: '首页注明数据来源和局限性，概率语言表述' },
                { icon: '🗑️', title: '可删除', desc: '用户可随时申请删除自己的数据' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 p-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.2rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="ow-card p-5 fade-in-up delay-400" style={{ borderColor: 'rgba(249,115,22,0.3)' }}>
            <div className="flex items-start gap-2.5 mb-3">
              <AlertTriangle size={16} color="#F97316" className="flex-shrink-0 mt-0.5" />
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#F97316', letterSpacing: '0.05em' }}>
                免责声明
              </div>
            </div>
            <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.8 }}>
              本产品提供的"上分天气指数"和"大盘指数"仅基于社区自愿授权样本的历史数据聚合计算，
              <strong style={{ color: '#94A3B8' }}>不构成任何形式的预测或保证</strong>。
              所有指数均为概率统计指标，样本量有限且可能存在偏差。请玩家理性对待，以自身游戏体验为准，
              不应将此作为"必上分"或"必连败"的依据。
              <br /><br />
              <strong style={{ color: '#94A3B8' }}>本产品与暴雪娱乐、网易、网易大神无任何关联。</strong>
              所有守望先锋相关商标归暴雪娱乐所有。
            </div>
          </div>

          {/* Version info */}
          <div className="text-center py-4 fade-in-up delay-500">
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', color: '#1E293B', letterSpacing: '0.2em' }}>
              OW MARKET v0.1.0 MVP · 2026-06-22 · 数据仅供参考
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
