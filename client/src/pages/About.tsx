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
                  OW MARKET · v0.2.0
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

          {/* Original Inspiration */}
          <div className="ow-card p-5 fade-in-up delay-400" style={{ borderColor: 'rgba(249,115,22,0.25)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>💡</div>
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#F97316', letterSpacing: '0.05em', marginBottom: 2 }}>原始创意来源</div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#78350F', letterSpacing: '0.12em' }}>ORIGINAL INSPIRATION</div>
              </div>
            </div>
            <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.8, marginBottom: 14 }}>
              本项目的核心理念——将守望先锋 ELO 排位数据类比为股票市场进行分析——源自 B 站 UP 主的创意视频。
              视频中提出了用股票思维理解排位涨跌、识别"上分窗口"的方法论，深度启发了本项目的指数设计和 K 线可视化方案。
            </div>
            <a
              href="https://b23.tv/v8ErBTL"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-sm transition-all duration-200"
              style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(249,115,22,0.15)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(249,115,22,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(249,115,22,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(249,115,22,0.25)'; }}
            >
              {/* Bilibili icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#F97316" style={{ flexShrink: 0 }}>
                <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.82rem', color: '#F97316', fontWeight: 600, lineHeight: 1.3 }}>
                  一种基于股票的elo分析方法和上分建议
                </div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#92400E', letterSpacing: '0.1em', marginTop: 2 }}>BILIBILI · B23.TV/V8ERBТL</div>
              </div>
              <ExternalLink size={14} color="#92400E" style={{ flexShrink: 0 }} />
            </a>
          </div>

          {/* GitHub Community Card */}
          <div className="ow-card-lg p-6 fade-in-up delay-500" style={{ background: 'linear-gradient(135deg, rgba(13,21,38,0.95), rgba(0,180,216,0.06))', borderColor: 'rgba(0,180,216,0.25)' }}>
            <div className="flex items-center gap-3 mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#00B4D8" style={{ filter: 'drop-shadow(0 0 6px rgba(0,180,216,0.5))', flexShrink: 0 }}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#E2E8F0', letterSpacing: '0.05em' }}>开源社区</div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#475569', letterSpacing: '0.15em' }}>BLUSTER01 / OWMARKET-KLINE</div>
              </div>
              <div className="ml-auto" style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', color: '#334155', letterSpacing: '0.1em' }}>v0.3.0 · 2026-06-22</div>
            </div>

            <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.7, marginBottom: 16 }}>
              本项目完全开源，欢迎 Star 关注进度、Watch 接收更新通知，或通过 Issues 提交你对指数设计的建议和反馈。
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Star */}
              <a
                href="https://github.com/bluster01/OWmarket-kline"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
                  style={{
                    background: 'rgba(234,179,8,0.12)',
                    border: '1px solid rgba(234,179,8,0.35)',
                    borderRadius: 2,
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(234,179,8,0.22)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(234,179,8,0.6)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(234,179,8,0.12)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(234,179,8,0.35)'; }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>⭐</span>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#EAB308', letterSpacing: '0.05em' }}>Star</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#92400E', letterSpacing: '0.08em' }}>收藏项目</div>
                  </div>
                </div>
              </a>

              {/* Watch */}
              <a
                href="https://github.com/bluster01/OWmarket-kline/subscription"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
                  style={{
                    background: 'rgba(0,180,216,0.1)',
                    border: '1px solid rgba(0,180,216,0.3)',
                    borderRadius: 2,
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,180,216,0.2)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,180,216,0.55)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,180,216,0.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,180,216,0.3)'; }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>👁</span>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#00B4D8', letterSpacing: '0.05em' }}>Watch</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#164E63', letterSpacing: '0.08em' }}>接收更新</div>
                  </div>
                </div>
              </a>

              {/* Issue */}
              <a
                href="https://github.com/bluster01/OWmarket-kline/issues/new?template=feedback.md&title=%5B反馈%5D+"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
                  style={{
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    borderRadius: 2,
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(168,85,247,0.2)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.55)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(168,85,247,0.1)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(168,85,247,0.3)'; }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>💬</span>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#A78BFA', letterSpacing: '0.05em' }}>提交反馈</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#4C1D95', letterSpacing: '0.08em' }}>ISSUES</div>
                  </div>
                </div>
              </a>

              {/* Fork */}
              <a
                href="https://github.com/bluster01/OWmarket-kline/fork"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
                  style={{
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 2,
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(34,197,94,0.16)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.5)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(34,197,94,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.25)'; }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>🍴</span>
                  <div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#22C55E', letterSpacing: '0.05em' }}>Fork</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#14532D', letterSpacing: '0.08em' }}>参与贡献</div>
                  </div>
                </div>
              </a>
            </div>

            {/* Changelog teaser */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.65rem', color: '#475569', letterSpacing: '0.1em', marginBottom: 8 }}>CHANGELOG</div>
              <div className="space-y-2">
                {[
                  { ver: 'v0.3.0', date: '2026-06-22', desc: 'MA/BOLL/RSI/MACD 技术指标、成交量、K线形态识别、英雄热力图', color: '#00B4D8' },
                  { ver: 'v0.2.0', date: '2026-06-22', desc: '真正的金融 K 线蜡烛图（红绿涨跌、实体+影线）', color: '#22C55E' },
                  { ver: 'v0.1.0', date: '2026-06-22', desc: '大盘首页、K线详情、数据提交、关于页面 MVP', color: '#64748B' },
                ].map(item => (
                  <div key={item.ver} className="flex items-start gap-3">
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem', color: item.color, fontWeight: 700, flexShrink: 0, paddingTop: 2 }}>{item.ver}</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', color: '#334155', flexShrink: 0, paddingTop: 2 }}>{item.date}</div>
                    <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.72rem', color: '#64748B', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom credit */}
          <div className="text-center pb-6 fade-in-up">
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.55rem', color: '#1E293B', letterSpacing: '0.2em' }}>
              OW MARKET · 数据仅供参考，不构成预测
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
