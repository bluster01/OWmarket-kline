// NavBar - OW HUD Reborn Design
// Left sidebar navigation with Overwatch HUD aesthetic
// Colors: #0A0E1A bg, #00B4D8 cyan, #F97316 orange

import { Link, useLocation } from "wouter";
import { BarChart2, TrendingUp, Upload, Info, Activity, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { path: "/", icon: BarChart2, label: "大盘首页", sublabel: "MARKET" },
  { path: "/kline", icon: TrendingUp, label: "K线详情", sublabel: "K-LINE" },
  { path: "/submit", icon: Upload, label: "数据提交", sublabel: "SUBMIT" },
  { path: "/about", icon: Info, label: "关于", sublabel: "ABOUT" },
];

export default function NavBar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(8, 12, 24, 0.97)',
          borderBottom: '1px solid rgba(0, 180, 216, 0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div style={{ width: 28, height: 28, background: 'rgba(0,180,216,0.2)', border: '1px solid rgba(0,180,216,0.4)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={14} color="#00B4D8" />
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#E2E8F0', letterSpacing: '0.04em' }}>守望国服大盘</div>
          </div>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: '#64748B', padding: '4px' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className="lg:hidden fixed top-0 left-0 h-full z-50 w-56 flex flex-col"
        style={{
          background: 'rgba(8, 12, 24, 0.99)',
          borderRight: '1px solid rgba(0, 180, 216, 0.2)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(0,180,216,0.2)' }}>
          <div style={{ width: 36, height: 36, background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.4)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={18} color="#00B4D8" />
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#E2E8F0', letterSpacing: '0.05em', lineHeight: 1.2 }}>守望国服大盘</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#00B4D8', letterSpacing: '0.15em' }}>OW MARKET</div>
          </div>
        </div>
        <div className="flex flex-col gap-1 px-2 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className="flex items-center gap-3 px-3 py-3 rounded-sm cursor-pointer"
                  style={{
                    background: isActive ? 'rgba(0,180,216,0.15)' : 'transparent',
                    borderLeft: isActive ? '2px solid #00B4D8' : '2px solid transparent',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} style={{ color: isActive ? '#00B4D8' : '#64748B', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.85rem', fontWeight: isActive ? 700 : 400, color: isActive ? '#E2E8F0' : '#94A3B8' }}>{item.label}</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: isActive ? '#00B4D8' : '#475569', letterSpacing: '0.12em' }}>{item.sublabel}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex fixed left-0 top-0 h-full w-56 z-50 flex-col"
        style={{
          background: 'rgba(8, 12, 24, 0.97)',
          borderRight: '1px solid rgba(0, 180, 216, 0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(0,180,216,0.2)' }}>
          <div
            style={{
              width: 36, height: 36,
              background: 'rgba(0,180,216,0.15)',
              border: '1px solid rgba(0,180,216,0.4)',
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BarChart2 size={18} color="#00B4D8" style={{ filter: 'drop-shadow(0 0 4px rgba(0,180,216,0.6))' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#E2E8F0', letterSpacing: '0.05em', lineHeight: 1.2 }}>
              守望国服大盘
            </div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '0.5rem', color: '#00B4D8', letterSpacing: '0.15em' }}>
              OW MARKET
            </div>
          </div>
        </div>

        {/* Season badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 mx-3 mt-3 rounded-sm" style={{ background: 'rgba(0,180,216,0.08)', border: '1px solid rgba(0,180,216,0.2)' }}>
          <Activity size={12} color="#00B4D8" />
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.7rem', color: '#94A3B8', letterSpacing: '0.08em' }}>
            S16 赛季 · 实时
          </span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 6px #22C55E', animation: 'pulse-glow 2s ease-in-out infinite' }} />
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 px-2 mt-4 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className="flex items-center gap-3 px-3 py-3 rounded-sm cursor-pointer transition-all duration-150 group"
                  style={{
                    background: isActive ? 'rgba(0,180,216,0.15)' : 'transparent',
                    borderLeft: isActive ? '2px solid #00B4D8' : '2px solid transparent',
                    boxShadow: isActive ? 'inset 0 0 20px rgba(0,180,216,0.05)' : 'none',
                  }}
                >
                  <Icon
                    size={18}
                    style={{ color: isActive ? '#00B4D8' : '#64748B', flexShrink: 0, transition: 'color 0.15s' }}
                  />
                  <div>
                    <div style={{
                      fontFamily: 'Noto Sans SC, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? '#E2E8F0' : '#94A3B8',
                      transition: 'color 0.15s',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '0.5rem',
                      color: isActive ? '#00B4D8' : '#475569',
                      letterSpacing: '0.12em',
                      transition: 'color 0.15s',
                    }}>
                      {item.sublabel}
                    </div>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-1 h-4 rounded-full" style={{ background: '#00B4D8', boxShadow: '0 0 6px #00B4D8' }} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer stats */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(0,180,216,0.15)' }}>
          <div style={{ fontFamily: 'Noto Sans SC, sans-serif', fontSize: '0.65rem', color: '#475569', lineHeight: 1.7 }}>
            <div>样本量: <span style={{ color: '#94A3B8' }}>1,802 人</span></div>
            <div>对局数: <span style={{ color: '#94A3B8' }}>4,876 场</span></div>
            <div style={{ marginTop: '0.25rem', color: '#334155', fontSize: '0.6rem' }}>
              数据仅供参考，不构成预测
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
