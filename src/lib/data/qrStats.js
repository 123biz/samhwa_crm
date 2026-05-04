import { supabase } from '../supabaseClient';
import { formatKstDate } from '../time/kst';

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

export async function fetchQrStats({ days = 25, endDate, startDate } = {}) {
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
  // destination_url 컬럼이 아직 없는 DB도 있을 수 있어, 실패 시 구버전 쿼리로 폴백합니다.
  let qrRes = await supabase
    .from('qr_codes')
    .select('id, type, target, source, destination_url, created_at')
    .order('created_at', { ascending: false });

  if (qrRes.error) {
    const msg = String(qrRes.error?.message || '');
    const missingDestinationUrl =
      msg.includes('destination_url') && (msg.includes('does not exist') || msg.includes('not found'));

    if (missingDestinationUrl) {
      qrRes = await supabase
        .from('qr_codes')
        .select('id, type, target, source, created_at')
        .order('created_at', { ascending: false });
    }
  }

  if (qrRes.error) {
    return {
      ok: false,
      reason: 'qr_codes_query_failed',
      qrCodes: [],
      qrScanDaily: [],
    };
  }

  const SOURCE_ORDER = [
    'QR_EVENT_KINTEX_2026',
    'QR_PRODUCT_BODY_LOVE',
    'QR_PRODUCT_ANKLE',
    'QR_PRODUCT_MAGIC_CARE',
    'QR_PRODUCT_PERFECT_GUN',
  ];

  const qrCodes = (qrRes.data || [])
    .map((r) => ({
      id: r.id,
      type: r.type,
      target: r.target,
      source: r.source,
      destinationUrl: r.destination_url ?? null,
      createdAt: formatKstDate(r.created_at),
      scanCount: 0,
    }))
    .sort((a, b) => {
      const ai = SOURCE_ORDER.indexOf(a.source);
      const bi = SOURCE_ORDER.indexOf(b.source);
      const aIdx = ai === -1 ? SOURCE_ORDER.length : ai;
      const bIdx = bi === -1 ? SOURCE_ORDER.length : bi;
      return aIdx - bIdx;
    });

  // 2) 날짜 범위 계산
  const now = endDate ? new Date(endDate) : new Date();
  now.setHours(23, 59, 59, 999);
  const start = startDate ? new Date(startDate) : new Date(now);
  if (!startDate) start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  // start~now 사이 일수 계산
  const totalDays = Math.round((now - start) / 86400000) + 1;

  const logsRes = await supabase
    .from('qr_logs')
    .select('created_at, qr_code_id')
    .gte('created_at', start.toISOString())
    .lte('created_at', now.toISOString());

  if (logsRes.error) {
    const daily = [];
    for (let i = 0; i < totalDays; i += 1) {
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
  for (let i = 0; i < totalDays; i += 1) {
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

