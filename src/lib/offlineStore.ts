import type { CropReport } from './supabase';

const REPORTS_KEY = 'crophealth_pending_reports';

type PendingReport = Partial<CropReport> & { _localId: string; _queuedAt: number };

function readQueue(): PendingReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? (JSON.parse(raw) as PendingReport[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: PendingReport[]) {
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(q));
  } catch {
    // storage may be full or unavailable
  }
}

export function enqueueReport(report: Partial<CropReport>): PendingReport {
  const local: PendingReport = {
    ...report,
    _localId: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    _queuedAt: Date.now(),
  };
  const q = readQueue();
  q.push(local);
  writeQueue(q);
  return local;
}

export function getPendingReports(): PendingReport[] {
  return readQueue();
}

export function removePendingReport(localId: string) {
  const q = readQueue().filter((r) => r._localId !== localId);
  writeQueue(q);
}

export async function flushPendingReports(send: (r: PendingReport) => Promise<boolean>) {
  const q = readQueue();
  if (q.length === 0) return 0;
  let sent = 0;
  const remaining: PendingReport[] = [];
  for (const r of q) {
    try {
      const ok = await send(r);
      if (ok) sent += 1;
      else remaining.push(r);
    } catch {
      remaining.push(r);
    }
  }
  writeQueue(remaining);
  return sent;
}
