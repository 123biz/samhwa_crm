import { supabase } from '../supabaseClient';

function isoDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function displayMdKey(iso) {
  // iso: YYYY-MM-DD -> M/D
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
}

export async function fetchQrStats({ days = 25 } = {}) {
  if (!supabase) {
    return {
      ok: false,
      reason: 'missing_supabase',
      qrCodes: [],
      qrScanDaily: [],
    };
  }

  // 1) QR 코드 정의 목록
  // 기대 컬럼: id, type(PRODUCT|EVENT|BANNER), target, created_at(or createdAt), source(optional)
  const qrRes = await supabase
    .from('qr_codes')
    .select('id, type, target, created_at')
    .order('created_at', { ascending: false });

  if (qrRes.error) {
    return {
      ok: false,
      reason: 'qr_codes_query_failed',
      qrCodes: [],
      qrScanDaily: [],
    };
  }

  const qrCodes = (qrRes.data || []).map((r) => ({
    id: r.id,
    type: r.type,
    target: r.target,
    createdAt: r.created_at ? String(r.created_at).slice(0, 10) : '-',
    scanCount: 0,
  }));

  // 2) 최근 N일간 스캔 로그 가져와서 클라이언트에서 집계
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const logsRes = await supabase
    .from('qr_logs')
    .select('created_at, qr_code_id')
    .gte('created_at', start.toISOString())
    .lte('created_at', now.toISOString());

  if (logsRes.error) {
    // 카드 목록만이라도 보여주되, 스캔수/추이는 0으로 유지
    const daily = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      daily.push({ date: displayMdKey(isoDateKey(d)), product: 0, event: 0, banner: 0 });
    }
    return {
      ok: true,
      qrCodes,
      qrScanDaily: daily,
    };
  }

  const byQrId = new Map();
  const byDateType = new Map(); // key: YYYY-MM-DD -> { product,event,banner }

  // 초기화(날짜 축 고정)
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    byDateType.set(isoDateKey(d), { product: 0, event: 0, banner: 0 });
  }

  const typeByQrId = new Map(qrCodes.map((q) => [q.id, q.type]));

  for (const row of logsRes.data || []) {
    const qrId = row.qr_code_id;
    if (!qrId) continue;

    byQrId.set(qrId, (byQrId.get(qrId) || 0) + 1);

    const t = typeByQrId.get(qrId);
    if (!t) continue;

    const createdAt = row.created_at ? new Date(row.created_at) : null;
    if (!createdAt) continue;
    createdAt.setHours(0, 0, 0, 0);

    const key = isoDateKey(createdAt);
    const bucket = byDateType.get(key);
    if (!bucket) continue;

    if (t === 'PRODUCT') bucket.product += 1;
    else if (t === 'EVENT') bucket.event += 1;
    else if (t === 'BANNER') bucket.banner += 1;
  }

  for (const q of qrCodes) {
    q.scanCount = byQrId.get(q.id) || 0;
  }

  const qrScanDaily = Array.from(byDateType.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([iso, v]) => ({
      date: displayMdKey(iso),
      product: v.product,
      event: v.event,
      banner: v.banner,
    }));

  return { ok: true, qrCodes, qrScanDaily };
}

