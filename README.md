# 守望国服大盘 · OW Market K-Line

> **先看大盘，再上分** — 把守望先锋国服排位数据做成金融 K 线图

[![Live Demo](https://img.shields.io/badge/Live%20Demo-owmarket--7xwvfchg.manus.space-00B4D8?style=flat-square)](https://owmarket-7xwvfchg.manus.space)
[![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)

---

## 项目简介

守望国服大盘是一个基于社区自愿授权数据聚合的守望先锋排位情绪/上分环境指数系统。

核心理念：将股票市场的 K 线分析方法引入守望先锋排位，让玩家在上分前先"看盘"——通过社区整体胜率走势、个人对局 K 线、连败压力指数等维度，辅助判断当前是否适合进行排位。

**⚠️ 免责声明：所有数据均为概率统计，不构成任何形式的预测或保证。本项目与暴雪娱乐、网易、网易大神无任何关联。**

---

## 功能截图

| 大盘首页 | 个人 K 线 |
|---------|---------|
| 社区每日胜率蜡烛图 + 上分天气指数 | 每场对局红绿蜡烛 + 止损建议 |

---

## 核心功能

### 大盘首页
- **上分天气指数**（0–100）：综合判断当前排位环境友好度，≥70 晴天 / 60–69 多云转晴 / <30 台风
- **社区大盘 K 线**：每根蜡烛 = 一天，绿色上涨（胜率↑）/ 红色下跌（胜率↓），带成交量柱和 50% 基准线
- **连败压力指数**：社区中处于 ≥2 连败的玩家比例
- **毒池指数**：集中连败/翻压局密度，反映当前环境中极端局的集中程度
- **分段指数**：青铜 → 大师各段位的情绪分和胜率趋势
- **职责/模式指数**：坦克/输出/治疗 × 竞技/快速/角斗的细分数据

### 个人 K 线页
- **真正的金融 K 线蜡烛图**：每根蜡烛 = 一场对局
  - 🟢 绿色实体 = 胜利（收盘 > 开盘，累计分上涨）
  - 🔴 红色实体 = 失败（收盘 < 开盘，累计分下跌）
  - 上下影线 = 对局内波动范围
- **悬停 Tooltip**：显示开/高/低/收、英雄、地图、时长
- **近 20/30/50 场切换**
- **胜负序列条**：W/L 色块一览
- **止损建议**：基于当前连胜/连败状态给出入场建议
- **对局记录表**：最近 10 场详细数据

### 数据提交页
- 分享链接同步（网易大神 App）
- 手动录入（W/L 点击切换）
- 截图上传（规划中）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.6 |
| 路由 | Wouter |
| 样式 | Tailwind CSS 4 + 自定义 CSS 变量 |
| 图表 | 纯 SVG 自绘（无第三方图表库） |
| 动画 | Framer Motion + CSS transitions |
| UI 组件 | shadcn/ui (Radix UI) |
| 构建 | Vite 7 |
| 包管理 | pnpm |

**K 线图为完全自研 SVG 组件**，不依赖 ECharts / TradingView / Recharts，支持：
- OHLC 蜡烛实体 + 上下影线
- 鼠标悬停十字准线 + Tooltip
- 成交量柱（社区 K 线）
- 响应式 `viewBox` 自适应宽度

---

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/bluster01/OWmarket-kline.git
cd OWmarket-kline

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# → http://localhost:3000
```

### 目录结构

```
client/
  src/
    components/
      NavBar.tsx                  # 侧边栏导航（桌面 + 移动抽屉）
      OWCandlestickChart.tsx      # 个人 K 线蜡烛图（SVG）
      CommunityCandlestickChart.tsx # 社区大盘 K 线（SVG）
    pages/
      Home.tsx                    # 大盘首页
      KLine.tsx                   # 个人 K 线详情
      Submit.tsx                  # 数据提交
      About.tsx                   # 关于 / 说明
    lib/
      mockData.ts                 # 模拟数据（待替换为真实 API）
      candleData.ts               # OHLC 蜡烛数据生成工具
    index.css                     # 全局样式 + OW HUD 设计 token
```

---

## 设计系统

**OW HUD Reborn** — 守望先锋 HUD 风格

| Token | 值 | 用途 |
|-------|----|------|
| 背景色 | `#0A0E1A` | 深海军蓝主背景 |
| 主色 | `#00B4D8` | 青蓝色高亮 / 选中态 |
| 强调色 | `#F97316` | 橙色警告 / 零轴线 |
| 上涨 | `#22C55E` | 胜利 / 绿色蜡烛 |
| 下跌 | `#EF4444` | 失败 / 红色蜡烛 |
| 标题字体 | Rajdhani | 科幻风格标题 |
| 数字字体 | Orbitron | 数据展示 |
| 正文字体 | Noto Sans SC | 中文正文 |

---

## 创意来源 / Inspiration

本项目的核心理念源自 B 站 UP 主的创意视频：

> **[一种基于股票的elo分析方法和上分建议](https://b23.tv/v8ErBTL)**
> — 哔哩哔哩 · https://b23.tv/v8ErBTL

视频中提出了用股票思维理解排位涨跌、识别"上分窗口"的方法论，深度启发了本项目的指数设计和 K 线可视化方案。感谢原作者的创意！

---

## 路线图

- [x] v0.1.0 — 大盘首页 + K 线详情 + 数据提交 + 关于页
- [x] v0.2.0 — 真正的金融 K 线蜡烛图（SVG 自绘，红绿涨跌）
- [x] v0.3.0 — MA/BOLL/RSI/MACD 技术指标 + 成交量 + K线形态识别 + 英雄热力图
- [ ] v0.4.0 — K 线缩放/平移 + RSI 背离标注
- [ ] v0.5.0 — 接入网易大神分享链接真实解析
- [ ] v1.0.0 — 真实社区数据后端上线

---

## 数据说明

当前版本所有数据均为 **Mock 演示数据**，用于展示产品形态。

真实数据采集方案（规划中）：
1. 用户主动授权，通过网易大神 App 分享链接提交自己的战绩
2. 战网 ID 经单向哈希处理，不存储真实身份信息
3. 数据仅用于社区指数计算，用户可随时申请删除

---

## License

MIT © 2026 OW Market Contributors
