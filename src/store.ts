// localStorage-backed store for silence tracker data

export interface SilenceEntry {
  timestamp: number; // epoch ms
  durationMs: number;
  avgDb: number;
  level: 'silent' | 'quiet' | 'moderate' | 'loud';
}

export interface CheckIn {
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  sleep: number; // 1-5
}

export interface DayData {
  date: string;
  entries: SilenceEntry[];
  totalSilentMs: number;
  checkIn?: CheckIn;
}

const STORE_KEY = 'silence-tracker';

function load(): Record<string, DayData> {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
  } catch { return {}; }
}

function save(data: Record<string, DayData>) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDay(date: string): DayData {
  const data = load();
  return data[date] || { date, entries: [], totalSilentMs: 0 };
}

export function addEntry(entry: SilenceEntry) {
  const data = load();
  const date = new Date(entry.timestamp).toISOString().slice(0, 10);
  if (!data[date]) data[date] = { date, entries: [], totalSilentMs: 0 };
  data[date].entries.push(entry);
  if (entry.level === 'silent') {
    data[date].totalSilentMs += entry.durationMs;
  }
  save(data);
}

export function saveCheckIn(checkIn: CheckIn) {
  const data = load();
  if (!data[checkIn.date]) data[checkIn.date] = { date: checkIn.date, entries: [], totalSilentMs: 0 };
  data[checkIn.date].checkIn = checkIn;
  save(data);
}

export function getLast7Days(): DayData[] {
  const days: DayData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(getDay(key));
  }
  return days;
}

export function getAllDays(): DayData[] {
  const data = load();
  return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
}

export function classifyDb(db: number): SilenceEntry['level'] {
  if (db < 30) return 'silent';
  if (db < 45) return 'quiet';
  if (db < 60) return 'moderate';
  return 'loud';
}

export function getAchievements(): string[] {
  const data = load();
  const days = Object.values(data);
  const achievements: string[] = [];
  
  // Total silent minutes across all time
  const totalSilentMin = days.reduce((s, d) => s + d.totalSilentMs, 0) / 60000;
  if (totalSilentMin >= 1) achievements.push('🤫 First minute of silence');
  if (totalSilentMin >= 60) achievements.push('🕐 First hour of silence!');
  if (totalSilentMin >= 300) achievements.push('🏔️ 5 hours of total silence');
  if (totalSilentMin >= 1440) achievements.push('🌙 24 hours of lifetime silence');

  // Streak: consecutive days with >0 silent time
  let streak = 0, maxStreak = 0;
  const sorted = days.sort((a, b) => a.date.localeCompare(b.date));
  for (const d of sorted) {
    if (d.totalSilentMs > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
    else streak = 0;
  }
  if (maxStreak >= 3) achievements.push('🔥 3-day streak!');
  if (maxStreak >= 7) achievements.push('⭐ 7-day streak!');
  if (maxStreak >= 30) achievements.push('👑 30-day streak!');

  // Check-in streaks
  const checkIns = days.filter(d => d.checkIn).length;
  if (checkIns >= 1) achievements.push('📝 First check-in');
  if (checkIns >= 7) achievements.push('📊 Week of check-ins');

  // Single day records
  const maxDay = Math.max(...days.map(d => d.totalSilentMs / 60000), 0);
  if (maxDay >= 30) achievements.push('🎯 30-minute daily goal hit!');
  if (maxDay >= 60) achievements.push('🧘 60 minutes in one day');

  return achievements;
}

export function getQuietestHours(): number[] {
  const data = load();
  const hourBuckets: { total: number; count: number }[] = Array.from({ length: 24 }, () => ({ total: 0, count: 0 }));
  
  for (const day of Object.values(data)) {
    for (const e of day.entries) {
      const h = new Date(e.timestamp).getHours();
      hourBuckets[h].total += e.avgDb;
      hourBuckets[h].count++;
    }
  }

  return hourBuckets
    .map((b, i) => ({ hour: i, avg: b.count ? b.total / b.count : 999 }))
    .sort((a, b) => a.avg - b.avg)
    .filter(h => h.avg < 999)
    .slice(0, 3)
    .map(h => h.hour);
}

export function getHourlyHeatmap(): number[][] {
  // Returns 7 days x 24 hours of average dB
  const result: number[][] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const day = getDay(key);
    const hours = Array(24).fill(-1);
    const counts = Array(24).fill(0);
    for (const e of day.entries) {
      const h = new Date(e.timestamp).getHours();
      if (hours[h] === -1) hours[h] = 0;
      hours[h] += e.avgDb;
      counts[h]++;
    }
    result.push(hours.map((v, j) => counts[j] > 0 ? v / counts[j] : -1));
  }
  return result;
}
