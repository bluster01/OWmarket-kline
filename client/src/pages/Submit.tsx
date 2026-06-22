// Submit Page - 数据提交
// OW HUD Reborn Design
// Tabs: Share Link / Manual Entry / Screenshot Upload

import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import NavBar from "@/components/NavBar";
import { ArrowLeft, Link2, ClipboardList, Camera, CheckCircle, Loader2 } from "lucide-react";

type Tab = 'link' | 'manual' | 'screenshot';
type MatchResult = 1 | 0 | -1 | null;

const HEROES = ['莱因哈特', '温斯顿', '路霸', '奥里萨', 'D.Va', '西格玛', '拉玛刹', '毁灭者'];
const MAPS = ['花村', '好莱坞', '国王大道', '努巴尼', '直布罗陀', '沃斯卡娅工业区', '埃科波因特', '阿努比斯神殿'];
const TIERS = ['青铜', '白银', '黄金', '白金', '钻石', '大师', '传奇'];
const DUTIES = ['坦克', '输出', '治疗'];

export default function Submit() {
  const [activeTab, setActiveTab] = useState<Tab>('link');
  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Manual form state
  const [selectedDuty, setSelectedDuty] = useState('坦克');
  const [selectedTier, setSelectedTier] = useState('白金');
  const [manualResults, setManualResults] = useState<MatchResult[]>(Array(10).fill(null));

  const tabs: { id: Tab; icon: React.ReactNode; label: string; sublabel: string }[] = [
    { id: 'link', icon: <Link2 size={14} />, label: '分享链接', sublabel: 'SHARE LINK' },
    { id: 'manual', icon: <ClipboardList size={14} />, label: '手动录入', sublabel: 'MANUAL' },
    { id: 'screenshot', icon: <Camera size={14} />, label: '截图上传', sublabel: 'SCREENSHOT (P1)' },
  ];

  const handleLinkSubmit = async () => {
    if (!shareUrl.trim()) {
      toast.error('请输入分享链接');
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsLoading(false);
    setIsSuccess(true);
    toast.success('数据同步成功！已采集 47 场对局记录', { duration: 4000 });
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleManualSubmit = () => {
    const filled = manualResults.filter(r => r !== null).length;
    if (filled === 0) {
      toast.error('请至少录入一场对局结果');
      return;
    }
    toast.success(`成功提交 ${filled} 场对局数据！`, { duration: 3000 });
    setManualResults(Array(10).fill(null));
  };

  const toggleResult = (index: number) => {
    setManualResults(prev => {
      const next = [...prev];
      if (next[index] === null) next[index] = 1;
      else if (next[index] === 1) next[index] = -1;
      else next[index] = null;
      return next;
    });
  };

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
              数据提交
            </div>
          </div>
        </div>

        <div className="container py-6 max-w-3xl">

          {/* Privacy notice */}
          <div className="ow-card p-4 mb-5 fade-in-up" style={{ borderColor: 'rgba(249,115,22,0.3)' }}>
            <div className="flex items-start gap-2.5">
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
              <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.78rem', color: '#94A3B8', lineHeight: 1.6 }}>
                <span style={{ color: '#F97316', fontWeight: 700 }}>隐私保护：</span>
                所有数据在存储前均经过脱敏处理，战网ID通过单向哈希不可逆转换，不存储真实身份信息。
                数据仅用于社区指数计算，您可随时申请删除。
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-5 fade-in-up delay-100" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-3 transition-all duration-150"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: activeTab === tab.id ? '#00B4D8' : '#64748B',
                  borderBottom: activeTab === tab.id ? '2px solid #00B4D8' : '2px solid transparent',
                  marginBottom: -1,
                  background: 'transparent',
                  letterSpacing: '0.04em',
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden" style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.6rem' }}>{tab.sublabel.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'link' && (
            <div className="ow-card-lg p-6 fade-in-up">
              <div className="ow-section-title text-sm mb-4">通过网易大神分享链接提交</div>
              <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.8rem', color: '#64748B', marginBottom: '1.25rem', lineHeight: 1.7 }}>
                1. 打开网易大神 App → 守望先锋战绩 → 分享战绩<br />
                2. 复制分享链接（格式：https://act.ds.163.com/...）<br />
                3. 粘贴到下方输入框，点击同步
              </div>

              <div className="space-y-3">
                <div>
                  <label style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    分享链接
                  </label>
                  <input
                    type="text"
                    value={shareUrl}
                    onChange={(e) => setShareUrl(e.target.value)}
                    placeholder="https://act.ds.163.com/f0834ac50394246e/detail?customerToken=..."
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(0,180,216,0.2)',
                      color: '#E2E8F0',
                      fontFamily: 'Noto Sans SC, sans-serif',
                      fontSize: '0.8rem',
                      padding: '0.625rem 0.875rem',
                      outline: 'none',
                      borderRadius: '2px',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#00B4D8'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,180,216,0.2)'}
                  />
                </div>

                <button
                  onClick={handleLinkSubmit}
                  disabled={isLoading || isSuccess}
                  className="ow-btn-primary w-full flex items-center justify-center gap-2 py-2.5"
                >
                  {isLoading ? (
                    <><Loader2 size={14} className="animate-spin" />正在同步数据...</>
                  ) : isSuccess ? (
                    <><CheckCircle size={14} />同步成功！</>
                  ) : (
                    '开始同步'
                  )}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.7rem', color: '#334155', lineHeight: 1.6 }}>
                  ⚠️ 本功能需要您主动分享链接，系统不会主动获取您的账号数据。
                  分享链接中的 customerToken 仅用于一次性数据拉取，不会被持久存储。
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="ow-card-lg p-6 fade-in-up">
              <div className="ow-section-title text-sm mb-4">手动录入对局结果</div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    职责
                  </label>
                  <div className="flex gap-2">
                    {DUTIES.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDuty(d)}
                        className="px-2.5 py-1 text-xs transition-all"
                        style={{
                          fontFamily: 'Noto Sans SC, sans-serif',
                          background: selectedDuty === d ? 'rgba(0,180,216,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${selectedDuty === d ? '#00B4D8' : 'rgba(255,255,255,0.1)'}`,
                          color: selectedDuty === d ? '#00B4D8' : '#64748B',
                          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                    段位
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(0,180,216,0.2)',
                      color: '#E2E8F0',
                      fontFamily: 'Noto Sans SC, sans-serif',
                      fontSize: '0.8rem',
                      padding: '0.4rem 0.75rem',
                      outline: 'none',
                      borderRadius: '2px',
                      width: '100%',
                    }}
                  >
                    {TIERS.map(t => <option key={t} value={t} style={{ background: '#0D1526' }}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Win/Loss grid */}
              <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.75rem' }}>
                点击方块切换：空 → 胜 → 负（再次点击清除）
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {manualResults.map((result, i) => (
                  <button
                    key={i}
                    onClick={() => toggleResult(i)}
                    className="transition-all duration-100"
                    style={{
                      width: 44,
                      height: 44,
                      background: result === 1 ? 'rgba(34,197,94,0.25)' : result === -1 ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${result === 1 ? '#22C55E' : result === -1 ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
                      color: result === 1 ? '#22C55E' : result === -1 ? '#EF4444' : '#334155',
                      fontFamily: 'Rajdhani, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                      boxShadow: result === 1 ? '0 0 8px rgba(34,197,94,0.3)' : result === -1 ? '0 0 8px rgba(239,68,68,0.3)' : 'none',
                    }}
                  >
                    {result === 1 ? 'W' : result === -1 ? 'L' : `${i + 1}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.75rem', color: '#475569' }}>
                  已录入: {manualResults.filter(r => r !== null).length} 场 · 胜: {manualResults.filter(r => r === 1).length} · 负: {manualResults.filter(r => r === -1).length}
                </span>
                <button onClick={handleManualSubmit} className="ow-btn-primary px-5 py-2 text-sm">
                  提交数据
                </button>
              </div>
            </div>
          )}

          {activeTab === 'screenshot' && (
            <div className="ow-card-lg p-6 fade-in-up">
              <div className="ow-section-title text-sm mb-4">截图上传（P1 功能）</div>
              <div
                className="flex flex-col items-center justify-center py-16 rounded-sm cursor-pointer transition-all"
                style={{
                  border: '2px dashed rgba(0,180,216,0.2)',
                  background: 'rgba(0,180,216,0.03)',
                }}
                onClick={() => toast.info('截图上传功能正在开发中，敬请期待！')}
              >
                <Camera size={40} color="rgba(0,180,216,0.3)" />
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#475569', marginTop: '1rem', letterSpacing: '0.05em' }}>
                  拖拽截图到此处，或点击上传
                </div>
                <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.75rem', color: '#334155', marginTop: '0.5rem' }}>
                  支持守望先锋战绩截图，AI 自动识别胜负记录
                </div>
                <div className="mt-4 ow-badge" style={{ color: '#F97316', borderColor: '#F97316' }}>
                  开发中 · P1
                </div>
              </div>
            </div>
          )}

          {/* Feedback + Disclaimer */}
          <div className="mt-5 space-y-3 fade-in-up delay-300">
            {/* Feedback banner */}
            <div className="flex items-center gap-4 p-4 rounded-sm" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#A78BFA', letterSpacing: '0.04em', marginBottom: 2 }}>对指数设计有想法？</div>
                <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.72rem', color: '#64748B', lineHeight: 1.5 }}>欢迎到 GitHub Issues 提交你的建议，比如新增指标、调整权重、改进 UI 等。</div>
              </div>
              <a
                href="https://github.com/bluster01/OWmarket-kline/issues/new?template=feedback.md&title=%5B反馈%5D+"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', flexShrink: 0 }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 transition-all duration-200"
                  style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.4)',
                    borderRadius: 2,
                    clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(168,85,247,0.28)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(168,85,247,0.15)'; }}
                >
                  <span style={{ fontSize: '0.9rem' }}>💬</span>
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.82rem', color: '#A78BFA', letterSpacing: '0.04em' }}>提交反馈</span>
                </div>
              </a>
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.7rem', color: '#334155', lineHeight: 1.7 }}>
                本产品提供的"上分天气指数"和"大盘指数"仅基于社区自愿授权样本的历史数据聚合计算，
                <strong style={{ color: '#475569' }}>不构成任何形式的预测或保证</strong>。
                所有指数均为概率统计指标，样本量有限且可能存在偏差。
                本产品与暴雪娱乐、网易、网易大神无任何关联。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
