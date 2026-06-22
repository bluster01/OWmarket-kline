// Mock data for OW Market prototype
// All data is simulated for demonstration purposes

export type WeatherType = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'typhoon';

export interface DailyIndex {
  date: string;
  sentimentScore: number;
  upWindowScore: number;
  weather: WeatherType;
  weatherLabel: string;
  advice: string;
  winRate: number;
  winRate7d: number;
  winStreakRate: number;
  lossStreakRate: number;
  volatility: number;
  toxicityRatio: number;
  sampleSize: number;
  totalMatches: number;
  confidenceInterval: [number, number];
}

export interface TierIndex {
  tier: string;
  tierLabel: string;
  tierColor: string;
  sentimentScore: number;
  winRate: number;
  trend: 'up' | 'down' | 'sideways';
  trendValue: number;
}

export interface MatchRecord {
  id: string;
  timestamp: number;
  matchRet: 1 | 0 | -1;
  hero: string;
  map: string;
  duration: number;
  cumulativeScore: number;
  rankTier: string;
}

export interface KLineData {
  trend: 'up' | 'down' | 'sideways';
  currentStreak: number;
  streakType: 'win' | 'loss' | 'none';
  winCount: number;
  totalCount: number;
  winRate: number;
  stopAdvice: string;
  matches: MatchRecord[];
}

export interface HistoryPoint {
  date: string;
  winRate: number;
  sentimentScore: number;
  totalMatches: number;
}

// Weather mapping
export function getWeatherInfo(score: number): { type: WeatherType; label: string; emoji: string; color: string; bgColor: string } {
  if (score >= 70) return { type: 'sunny', label: '晴天', emoji: '☀️', color: '#F97316', bgColor: 'rgba(249,115,22,0.15)' };
  if (score >= 60) return { type: 'partly-cloudy', label: '多云转晴', emoji: '⛅', color: '#EAB308', bgColor: 'rgba(234,179,8,0.15)' };
  if (score >= 50) return { type: 'cloudy', label: '多云', emoji: '☁️', color: '#94A3B8', bgColor: 'rgba(148,163,184,0.15)' };
  if (score >= 40) return { type: 'rainy', label: '阴雨', emoji: '🌧️', color: '#60A5FA', bgColor: 'rgba(96,165,250,0.15)' };
  if (score >= 30) return { type: 'stormy', label: '雷暴', emoji: '⛈️', color: '#A78BFA', bgColor: 'rgba(167,139,250,0.15)' };
  return { type: 'typhoon', label: '台风', emoji: '🌪️', color: '#EF4444', bgColor: 'rgba(239,68,68,0.15)' };
}

// Today's main index (mock)
export const todayIndex: DailyIndex = {
  date: '2026-06-22',
  sentimentScore: 62,
  upWindowScore: 58,
  weather: 'partly-cloudy',
  weatherLabel: '多云转晴',
  advice: '竞技环境整体偏暖，黄金-白金段胜率略高于平均，建议谨慎入场',
  winRate: 0.512,
  winRate7d: 0.508,
  winStreakRate: 0.28,
  lossStreakRate: 0.18,
  volatility: 12.3,
  toxicityRatio: 24,
  sampleSize: 1802,
  totalMatches: 4876,
  confidenceInterval: [0.498, 0.526],
};

// Tier breakdown
export const tierIndices: TierIndex[] = [
  { tier: 'bronze', tierLabel: '青铜', tierColor: '#CD7F32', sentimentScore: 42, winRate: 0.487, trend: 'sideways', trendValue: 0 },
  { tier: 'silver', tierLabel: '白银', tierColor: '#C0C0C0', sentimentScore: 47, winRate: 0.496, trend: 'sideways', trendValue: -1 },
  { tier: 'gold', tierLabel: '黄金', tierColor: '#FFD700', sentimentScore: 55, winRate: 0.518, trend: 'up', trendValue: 3 },
  { tier: 'platinum', tierLabel: '白金', tierColor: '#E5E4E2', sentimentScore: 48, winRate: 0.503, trend: 'down', trendValue: -2 },
  { tier: 'diamond', tierLabel: '钻石', tierColor: '#B9F2FF', sentimentScore: 51, winRate: 0.509, trend: 'sideways', trendValue: 1 },
  { tier: 'master', tierLabel: '大师', tierColor: '#F97316', sentimentScore: 44, winRate: 0.491, trend: 'down', trendValue: -3 },
];

// 15-day history for community K-line
export const communityHistory: HistoryPoint[] = [
  { date: '06/08', winRate: 0.498, sentimentScore: 50, totalMatches: 3200 },
  { date: '06/09', winRate: 0.503, sentimentScore: 53, totalMatches: 3400 },
  { date: '06/10', winRate: 0.515, sentimentScore: 61, totalMatches: 4100 },
  { date: '06/11', winRate: 0.521, sentimentScore: 65, totalMatches: 4300 },
  { date: '06/12', winRate: 0.509, sentimentScore: 57, totalMatches: 3900 },
  { date: '06/13', winRate: 0.494, sentimentScore: 47, totalMatches: 3600 },
  { date: '06/14', winRate: 0.488, sentimentScore: 43, totalMatches: 3100 },
  { date: '06/15', winRate: 0.501, sentimentScore: 51, totalMatches: 3800 },
  { date: '06/16', winRate: 0.513, sentimentScore: 59, totalMatches: 4200 },
  { date: '06/17', winRate: 0.519, sentimentScore: 63, totalMatches: 4500 },
  { date: '06/18', winRate: 0.507, sentimentScore: 55, totalMatches: 4000 },
  { date: '06/19', winRate: 0.495, sentimentScore: 48, totalMatches: 3700 },
  { date: '06/20', winRate: 0.502, sentimentScore: 52, totalMatches: 3900 },
  { date: '06/21', winRate: 0.508, sentimentScore: 56, totalMatches: 4200 },
  { date: '06/22', winRate: 0.512, sentimentScore: 62, totalMatches: 4876 },
];

// Personal K-line mock data
export const personalKLine: KLineData = {
  trend: 'up',
  currentStreak: 4,
  streakType: 'win',
  winCount: 31,
  totalCount: 50,
  winRate: 0.62,
  stopAdvice: '当前连胜4局，趋势向上，可以继续排位。若出现连续2局失败，建议暂停休息。',
  matches: [
    { id: '1', timestamp: Date.now() - 49 * 3600000, matchRet: -1, hero: '莱因哈特', map: '花村', duration: 720, cumulativeScore: -1, rankTier: 'gold' },
    { id: '2', timestamp: Date.now() - 48 * 3600000, matchRet: 1, hero: '温斯顿', map: '好莱坞', duration: 840, cumulativeScore: 0, rankTier: 'gold' },
    { id: '3', timestamp: Date.now() - 47 * 3600000, matchRet: 1, hero: '莱因哈特', map: '国王大道', duration: 960, cumulativeScore: 1, rankTier: 'gold' },
    { id: '4', timestamp: Date.now() - 46 * 3600000, matchRet: -1, hero: '路霸', map: '努巴尼', duration: 780, cumulativeScore: 0, rankTier: 'gold' },
    { id: '5', timestamp: Date.now() - 45 * 3600000, matchRet: -1, hero: '莱因哈特', map: '花村', duration: 660, cumulativeScore: -1, rankTier: 'gold' },
    { id: '6', timestamp: Date.now() - 44 * 3600000, matchRet: 1, hero: '温斯顿', map: '好莱坞', duration: 900, cumulativeScore: 0, rankTier: 'gold' },
    { id: '7', timestamp: Date.now() - 43 * 3600000, matchRet: 1, hero: '莱因哈特', map: '国王大道', duration: 840, cumulativeScore: 1, rankTier: 'gold' },
    { id: '8', timestamp: Date.now() - 42 * 3600000, matchRet: 1, hero: '奥里萨', map: '努巴尼', duration: 780, cumulativeScore: 2, rankTier: 'gold' },
    { id: '9', timestamp: Date.now() - 41 * 3600000, matchRet: -1, hero: '路霸', map: '花村', duration: 720, cumulativeScore: 1, rankTier: 'gold' },
    { id: '10', timestamp: Date.now() - 40 * 3600000, matchRet: 1, hero: '莱因哈特', map: '好莱坞', duration: 960, cumulativeScore: 2, rankTier: 'gold' },
    { id: '11', timestamp: Date.now() - 39 * 3600000, matchRet: 1, hero: '温斯顿', map: '国王大道', duration: 840, cumulativeScore: 3, rankTier: 'gold' },
    { id: '12', timestamp: Date.now() - 38 * 3600000, matchRet: -1, hero: '莱因哈特', map: '努巴尼', duration: 660, cumulativeScore: 2, rankTier: 'platinum' },
    { id: '13', timestamp: Date.now() - 37 * 3600000, matchRet: -1, hero: '奥里萨', map: '花村', duration: 720, cumulativeScore: 1, rankTier: 'platinum' },
    { id: '14', timestamp: Date.now() - 36 * 3600000, matchRet: 1, hero: '莱因哈特', map: '好莱坞', duration: 900, cumulativeScore: 2, rankTier: 'platinum' },
    { id: '15', timestamp: Date.now() - 35 * 3600000, matchRet: 1, hero: '温斯顿', map: '国王大道', duration: 840, cumulativeScore: 3, rankTier: 'platinum' },
    { id: '16', timestamp: Date.now() - 34 * 3600000, matchRet: 1, hero: '路霸', map: '努巴尼', duration: 780, cumulativeScore: 4, rankTier: 'platinum' },
    { id: '17', timestamp: Date.now() - 33 * 3600000, matchRet: -1, hero: '莱因哈特', map: '花村', duration: 660, cumulativeScore: 3, rankTier: 'platinum' },
    { id: '18', timestamp: Date.now() - 32 * 3600000, matchRet: 1, hero: '奥里萨', map: '好莱坞', duration: 960, cumulativeScore: 4, rankTier: 'platinum' },
    { id: '19', timestamp: Date.now() - 31 * 3600000, matchRet: 1, hero: '莱因哈特', map: '国王大道', duration: 840, cumulativeScore: 5, rankTier: 'platinum' },
    { id: '20', timestamp: Date.now() - 30 * 3600000, matchRet: -1, hero: '温斯顿', map: '努巴尼', duration: 720, cumulativeScore: 4, rankTier: 'platinum' },
    { id: '21', timestamp: Date.now() - 29 * 3600000, matchRet: -1, hero: '路霸', map: '花村', duration: 780, cumulativeScore: 3, rankTier: 'platinum' },
    { id: '22', timestamp: Date.now() - 28 * 3600000, matchRet: -1, hero: '莱因哈特', map: '好莱坞', duration: 660, cumulativeScore: 2, rankTier: 'platinum' },
    { id: '23', timestamp: Date.now() - 27 * 3600000, matchRet: 1, hero: '奥里萨', map: '国王大道', duration: 900, cumulativeScore: 3, rankTier: 'platinum' },
    { id: '24', timestamp: Date.now() - 26 * 3600000, matchRet: 1, hero: '莱因哈特', map: '努巴尼', duration: 840, cumulativeScore: 4, rankTier: 'platinum' },
    { id: '25', timestamp: Date.now() - 25 * 3600000, matchRet: 1, hero: '温斯顿', map: '花村', duration: 780, cumulativeScore: 5, rankTier: 'platinum' },
    { id: '26', timestamp: Date.now() - 24 * 3600000, matchRet: -1, hero: '路霸', map: '好莱坞', duration: 720, cumulativeScore: 4, rankTier: 'platinum' },
    { id: '27', timestamp: Date.now() - 23 * 3600000, matchRet: 1, hero: '莱因哈特', map: '国王大道', duration: 960, cumulativeScore: 5, rankTier: 'platinum' },
    { id: '28', timestamp: Date.now() - 22 * 3600000, matchRet: 1, hero: '奥里萨', map: '努巴尼', duration: 840, cumulativeScore: 6, rankTier: 'platinum' },
    { id: '29', timestamp: Date.now() - 21 * 3600000, matchRet: -1, hero: '莱因哈特', map: '花村', duration: 660, cumulativeScore: 5, rankTier: 'platinum' },
    { id: '30', timestamp: Date.now() - 20 * 3600000, matchRet: 1, hero: '温斯顿', map: '好莱坞', duration: 900, cumulativeScore: 6, rankTier: 'platinum' },
    { id: '31', timestamp: Date.now() - 19 * 3600000, matchRet: -1, hero: '路霸', map: '国王大道', duration: 780, cumulativeScore: 5, rankTier: 'platinum' },
    { id: '32', timestamp: Date.now() - 18 * 3600000, matchRet: 1, hero: '莱因哈特', map: '努巴尼', duration: 840, cumulativeScore: 6, rankTier: 'platinum' },
    { id: '33', timestamp: Date.now() - 17 * 3600000, matchRet: 1, hero: '奥里萨', map: '花村', duration: 720, cumulativeScore: 7, rankTier: 'platinum' },
    { id: '34', timestamp: Date.now() - 16 * 3600000, matchRet: -1, hero: '莱因哈特', map: '好莱坞', duration: 660, cumulativeScore: 6, rankTier: 'platinum' },
    { id: '35', timestamp: Date.now() - 15 * 3600000, matchRet: 1, hero: '温斯顿', map: '国王大道', duration: 960, cumulativeScore: 7, rankTier: 'platinum' },
    { id: '36', timestamp: Date.now() - 14 * 3600000, matchRet: 1, hero: '路霸', map: '努巴尼', duration: 840, cumulativeScore: 8, rankTier: 'platinum' },
    { id: '37', timestamp: Date.now() - 13 * 3600000, matchRet: -1, hero: '莱因哈特', map: '花村', duration: 780, cumulativeScore: 7, rankTier: 'platinum' },
    { id: '38', timestamp: Date.now() - 12 * 3600000, matchRet: -1, hero: '奥里萨', map: '好莱坞', duration: 720, cumulativeScore: 6, rankTier: 'platinum' },
    { id: '39', timestamp: Date.now() - 11 * 3600000, matchRet: 1, hero: '莱因哈特', map: '国王大道', duration: 900, cumulativeScore: 7, rankTier: 'platinum' },
    { id: '40', timestamp: Date.now() - 10 * 3600000, matchRet: 1, hero: '温斯顿', map: '努巴尼', duration: 840, cumulativeScore: 8, rankTier: 'platinum' },
    { id: '41', timestamp: Date.now() - 9 * 3600000, matchRet: -1, hero: '路霸', map: '花村', duration: 660, cumulativeScore: 7, rankTier: 'platinum' },
    { id: '42', timestamp: Date.now() - 8 * 3600000, matchRet: 1, hero: '莱因哈特', map: '好莱坞', duration: 960, cumulativeScore: 8, rankTier: 'platinum' },
    { id: '43', timestamp: Date.now() - 7 * 3600000, matchRet: 1, hero: '奥里萨', map: '国王大道', duration: 840, cumulativeScore: 9, rankTier: 'platinum' },
    { id: '44', timestamp: Date.now() - 6 * 3600000, matchRet: -1, hero: '莱因哈特', map: '努巴尼', duration: 780, cumulativeScore: 8, rankTier: 'platinum' },
    { id: '45', timestamp: Date.now() - 5 * 3600000, matchRet: 1, hero: '温斯顿', map: '花村', duration: 900, cumulativeScore: 9, rankTier: 'platinum' },
    { id: '46', timestamp: Date.now() - 4 * 3600000, matchRet: 1, hero: '路霸', map: '好莱坞', duration: 840, cumulativeScore: 10, rankTier: 'platinum' },
    { id: '47', timestamp: Date.now() - 3 * 3600000, matchRet: -1, hero: '莱因哈特', map: '国王大道', duration: 720, cumulativeScore: 9, rankTier: 'platinum' },
    { id: '48', timestamp: Date.now() - 2 * 3600000, matchRet: 1, hero: '奥里萨', map: '努巴尼', duration: 960, cumulativeScore: 10, rankTier: 'platinum' },
    { id: '49', timestamp: Date.now() - 1 * 3600000, matchRet: 1, hero: '莱因哈特', map: '花村', duration: 840, cumulativeScore: 11, rankTier: 'platinum' },
    { id: '50', timestamp: Date.now() - 0.5 * 3600000, matchRet: 1, hero: '温斯顿', map: '好莱坞', duration: 780, cumulativeScore: 12, rankTier: 'platinum' },
  ],
};

// Mode breakdown
export const modeBreakdown = [
  { mode: 'sport', label: '竞技', sentimentScore: 62, winRate: 0.512, sampleSize: 2341 },
  { mode: 'leisure', label: '快速', sentimentScore: 55, winRate: 0.503, sampleSize: 1876 },
  { mode: 'fight', label: '角斗', sentimentScore: 48, winRate: 0.498, sampleSize: 659 },
];

// Duty breakdown
export const dutyBreakdown = [
  { duty: 'tank', label: '坦克', sentimentScore: 58, winRate: 0.508, sampleSize: 1234 },
  { duty: 'dps', label: '输出', sentimentScore: 61, winRate: 0.514, sampleSize: 1876 },
  { duty: 'healer', label: '治疗', sentimentScore: 65, winRate: 0.521, sampleSize: 1566 },
];
