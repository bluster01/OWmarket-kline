// OverFast API service layer
// API: https://overfast-api.tekrop.fr
// Provides OW2 international server player stats (no per-match history, only season aggregates)

const BASE_URL = "https://overfast-api.tekrop.fr";

export interface OWSearchResult {
  blizzard_id: string;
  name: string;
  avatar: string | null;
  namecard: string | null;
  title: string | null;
  career_url: string;
  is_public: boolean;
  last_updated_at: number | null;
}

// Search players by name (returns multiple results)
export async function searchPlayers(name: string): Promise<OWSearchResult[]> {
  const res = await fetch(`${BASE_URL}/players?name=${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`搜索失败 (${res.status})`);
  const data = await res.json();
  return (data.results ?? []) as OWSearchResult[];
}

// Fetch player data by Blizzard internal ID (from search results)
export async function fetchPlayerDataById(blizzardId: string, displayName: string): Promise<OWPlayerData> {
  const [summaryRes, statsRes] = await Promise.all([
    fetch(`${BASE_URL}/players/${encodeURIComponent(blizzardId)}/summary`),
    fetch(`${BASE_URL}/players/${encodeURIComponent(blizzardId)}/stats/summary?gamemode=competitive`),
  ]);

  if (!summaryRes.ok) {
    if (summaryRes.status === 404) throw new Error("找不到该玩家，请确认账号存在且战绩设为公开");
    throw new Error(`获取玩家信息失败 (${summaryRes.status})`);
  }
  if (!statsRes.ok) {
    if (statsRes.status === 404) throw new Error("该玩家暂无本赛季竞技数据，或战绩未公开");
    throw new Error(`获取战绩数据失败 (${statsRes.status})`);
  }

  const summary = await summaryRes.json() as OWPlayerSummary;
  const stats = await statsRes.json() as OWStatsSummary;
  return { summary, stats, battletag: displayName };
}

export interface OWPlayerSummary {
  username: string;
  avatar: string;
  namecard: string | null;
  title: string | null;
  endorsement: { level: number; frame: string };
  competitive: {
    pc?: {
      season: number;
      tank: OWRank | null;
      damage: OWRank | null;
      support: OWRank | null;
    };
  };
}

export interface OWRank {
  division: string;  // "bronze"|"silver"|"gold"|"platinum"|"diamond"|"master"|"grandmaster"|"champion"
  tier: number;      // 1-5
  role_icon: string;
  rank_icon: string;
  tier_icon: string;
}

export interface OWStatsSummary {
  general: {
    games_played: number;
    games_won: number;
    games_lost: number;
    time_played: number;
    winrate: number;
    kda: number;
    total: { eliminations: number; assists: number; deaths: number; damage: number; healing: number };
    average: { eliminations: number; assists: number; deaths: number; damage: number; healing: number };
  };
  roles: {
    tank?: OWRoleStats;
    damage?: OWRoleStats;
    support?: OWRoleStats;
  };
  heroes: Record<string, OWHeroStats>;
}

export interface OWRoleStats {
  games_played: number;
  games_won: number;
  games_lost: number;
  time_played: number;
  winrate: number;
  kda: number;
  total: { eliminations: number; assists: number; deaths: number; damage: number; healing: number };
  average: { eliminations: number; assists: number; deaths: number; damage: number; healing: number };
}

export interface OWHeroStats {
  games_played: number;
  games_won: number;
  games_lost: number;
  time_played: number;
  winrate: number;
  kda: number;
}

export interface OWPlayerData {
  summary: OWPlayerSummary;
  stats: OWStatsSummary;
  battletag: string;
}

// Division to numeric score mapping (for K-line baseline)
const DIVISION_SCORE: Record<string, number> = {
  bronze: 500,
  silver: 1000,
  gold: 1500,
  platinum: 2000,
  diamond: 2500,
  master: 3000,
  grandmaster: 3500,
  champion: 4000,
};

function divisionToScore(rank: OWRank | null): number {
  if (!rank) return 1500;
  const base = DIVISION_SCORE[rank.division] ?? 1500;
  // tier 1 = highest in division, tier 5 = lowest
  return base + (5 - rank.tier) * 80;
}

// Fetch player profile (summary + rank)
export async function fetchPlayerSummary(battletag: string): Promise<OWPlayerSummary> {
  const tag = battletag.replace("#", "-");
  const res = await fetch(`${BASE_URL}/players/${encodeURIComponent(tag)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("找不到该玩家，请确认 BattleTag 正确且战绩设为公开");
    throw new Error(`获取玩家信息失败 (${res.status})`);
  }
  const data = await res.json();
  return data.summary as OWPlayerSummary;
}

// Fetch competitive stats summary
export async function fetchPlayerStats(battletag: string): Promise<OWStatsSummary> {
  const tag = battletag.replace("#", "-");
  const res = await fetch(`${BASE_URL}/players/${encodeURIComponent(tag)}/stats/summary?gamemode=competitive`);
  if (!res.ok) {
    if (res.status === 404) throw new Error("该玩家暂无竞技赛季数据，或战绩未公开");
    throw new Error(`获取战绩数据失败 (${res.status})`);
  }
  return await res.json() as OWStatsSummary;
}

// Fetch both in parallel
export async function fetchPlayerData(battletag: string): Promise<OWPlayerData> {
  const [summary, stats] = await Promise.all([
    fetchPlayerSummary(battletag),
    fetchPlayerStats(battletag),
  ]);
  return { summary, stats, battletag };
}

// ── K-line generation from season aggregate data ──────────────────────────────
// Since OverFast API has no per-match history, we reconstruct a plausible
// match sequence from: total games, winrate, hero distribution, role stats.
// This is a statistical simulation, not actual match replay.

export interface SimulatedCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isWin: boolean;
  hero: string;
  role: string;
  kda: number;
}

function heroDisplayName(key: string): string {
  const map: Record<string, string> = {
    ana: "安娜", baptiste: "巴蒂斯特", brigitte: "布里吉塔", illari: "伊拉里",
    kiriko: "雾子", lifeweaver: "生命编织者", lucio: "卢西奥", mercy: "天使",
    moira: "莫伊拉", zenyatta: "禅雅塔", juno: "朱诺",
    dva: "D.Va", doomfist: "末日铁拳", junker_queen: "废土女王", mauga: "毛加",
    orisa: "奥丽莎", ramattra: "拉玛刹", reinhardt: "莱因哈特", roadhog: "路霸",
    sigma: "西格玛", winston: "温斯顿", wrecking_ball: "破坏球", zarya: "扎利娅",
    ashe: "艾什", bastion: "堡垒", cassidy: "卡西迪", echo: "回声",
    genji: "源氏", hanzo: "半藏", junkrat: "狂鼠", mei: "美",
    pharah: "法老之鹰", reaper: "死神", sojourn: "征程", soldier_76: "士兵76",
    sombra: "桑布拉", symmetra: "秩序之光", torbjorn: "托比昂", tracer: "猎空",
    widowmaker: "黑百合",
  };
  return map[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function buildKLineFromPlayerData(data: OWPlayerData): SimulatedCandle[] {
  const { stats } = data;
  const { general, heroes, roles } = stats;

  if (!general || general.games_played === 0) return [];

  // Determine current rank score as K-line endpoint
  const pc = data.summary.competitive?.pc;
  const tankScore = divisionToScore(pc?.tank ?? null);
  const dmgScore = divisionToScore(pc?.damage ?? null);
  const supScore = divisionToScore(pc?.support ?? null);
  // Use best rank as baseline
  const rankScores = [tankScore, dmgScore, supScore].filter(s => s !== 1500);
  const currentScore = rankScores.length > 0 ? Math.max(...rankScores) : 1500;

  // Build hero pool sorted by games played
  const heroPool = Object.entries(heroes)
    .filter(([, h]) => h.games_played > 0)
    .sort((a, b) => b[1].games_played - a[1].games_played)
    .slice(0, 12);

  // Determine role for each hero
  const tankHeroes = new Set(["dva", "doomfist", "junker_queen", "mauga", "orisa", "ramattra", "reinhardt", "roadhog", "sigma", "winston", "wrecking_ball", "zarya"]);
  const supportHeroes = new Set(["ana", "baptiste", "brigitte", "illari", "kiriko", "lifeweaver", "lucio", "mercy", "moira", "zenyatta", "juno"]);

  function heroRole(key: string): string {
    if (tankHeroes.has(key)) return "坦克";
    if (supportHeroes.has(key)) return "辅助";
    return "输出";
  }

  // Total games to simulate (cap at 60 for display)
  const totalGames = Math.min(general.games_played, 60);
  const winCount = Math.round(totalGames * (general.winrate / 100));
  const lossCount = totalGames - winCount;

  // Create win/loss sequence with realistic streaks
  const results: boolean[] = [];
  let winsLeft = winCount;
  let lossesLeft = lossCount;

  // Shuffle with streak tendency (3-4 game streaks)
  const rng = (seed: number) => {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  };
  const rand = rng(general.games_played * 137 + winCount * 31);

  let streak = 0;
  let lastWin = rand() > 0.5;
  for (let i = 0; i < totalGames; i++) {
    const streakBias = streak >= 3 ? 0.35 : streak >= 2 ? 0.45 : 0.5;
    const winProb = winsLeft / (winsLeft + lossesLeft);
    const adjustedProb = lastWin
      ? Math.min(winProb, winProb * (1 - streakBias) + streakBias * 0.3)
      : Math.max(winProb, winProb * (1 - streakBias) + streakBias * 0.7);

    const isWin = rand() < adjustedProb && winsLeft > 0;
    if (isWin && winsLeft > 0) { winsLeft--; results.push(true); }
    else if (lossesLeft > 0) { lossesLeft--; results.push(false); }
    else { winsLeft--; results.push(true); }

    streak = isWin === lastWin ? streak + 1 : 1;
    lastWin = isWin;
  }

  // Build candles from results
  // Work backwards from currentScore
  const candles: SimulatedCandle[] = [];
  let score = currentScore;

  // First pass: compute scores backwards
  const scoreSeq: number[] = [score];
  for (let i = results.length - 1; i >= 0; i--) {
    const isWin = results[i];
    const delta = isWin ? -(15 + rand() * 10) : (15 + rand() * 10);
    score += delta; // going backwards, so reverse
    scoreSeq.unshift(Math.max(100, score));
  }

  // Second pass: build candles forward
  const now = new Date();
  for (let i = 0; i < results.length; i++) {
    const isWin = results[i];
    const open = scoreSeq[i];
    const close = scoreSeq[i + 1];
    const delta = Math.abs(close - open);
    const high = Math.max(open, close) + rand() * delta * 0.6;
    const low = Math.min(open, close) - rand() * delta * 0.4;

    // Pick hero weighted by games played
    const heroIdx = Math.floor(rand() * heroPool.length);
    const [heroKey, heroStats] = heroPool[Math.min(heroIdx, heroPool.length - 1)];
    const kda = heroStats.kda + (rand() - 0.5) * 0.5;

    // Date: spread over ~60 days
    const daysAgo = results.length - i;
    const matchDate = new Date(now);
    matchDate.setDate(matchDate.getDate() - daysAgo);
    const dateStr = `${matchDate.getMonth() + 1}/${matchDate.getDate()}`;

    candles.push({
      date: dateStr,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume: Math.round(10 + rand() * 40),
      isWin,
      hero: heroDisplayName(heroKey),
      role: heroRole(heroKey),
      kda: Math.round(kda * 100) / 100,
    });
  }

  return candles;
}

// Format rank display
export function formatRank(rank: OWRank | null): string {
  if (!rank) return "未定级";
  const divMap: Record<string, string> = {
    bronze: "青铜", silver: "白银", gold: "黄金", platinum: "铂金",
    diamond: "钻石", master: "大师", grandmaster: "宗师", champion: "冠军",
  };
  return `${divMap[rank.division] ?? rank.division} ${rank.tier}`;
}

export function rankColor(division: string): string {
  const colors: Record<string, string> = {
    bronze: "#CD7F32", silver: "#C0C0C0", gold: "#FFD700",
    platinum: "#00B4D8", diamond: "#B9F2FF", master: "#FF6B35",
    grandmaster: "#FF4500", champion: "#FF1493",
  };
  return colors[division] ?? "#94A3B8";
}
