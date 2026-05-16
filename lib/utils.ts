export function isParis(): string {
  return 'Europe/Paris';
}

export function nowParis(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
}

export function formatDateParis(date: Date): string {
  return date.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
}

export function todayISO(): string {
  const now = nowParis();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getISOWeek(date: Date = nowParis()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function isJourOff(date: string, joursOff: string[]): boolean {
  return joursOff.includes(date);
}

export function formatAllure(secondsPerKm: number): string {
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  return `${mins}:${String(secs).padStart(2, '0')}/km`;
}

export function formatDistance(meters: number): string {
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
