import { supabase } from './supabaseClient';

/**
 * qr_logs에 유입 기록. EventLanding과 동일: source 없으면 DIRECT, 있으면 qr_codes 매칭으로 qr_code_id 저장.
 */
export async function logQrVisit(sourceFromQuery) {
  if (!supabase) return;
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1') return;
  if (typeof window !== 'undefined') {
    const dedupeKey = `qrlog:${window.location.pathname}:${window.location.search}`;
    const now = Date.now();
    const last = Number(window.sessionStorage.getItem(dedupeKey) || 0);
    if (now - last < 10000) return;
    window.sessionStorage.setItem(dedupeKey, String(now));
  }

  const source = sourceFromQuery || null;
  const effectiveSource = source || 'DIRECT';

  let qrCodeId = null;
  if (source) {
    const codeRes = await supabase.from('qr_codes').select('id').eq('source', source).maybeSingle();
    qrCodeId = !codeRes.error ? codeRes.data?.id ?? null : null;
  }

  await supabase.from('qr_logs').insert({
    created_at: new Date().toISOString(),
    source: effectiveSource,
    qr_code_id: qrCodeId,
  });
}
