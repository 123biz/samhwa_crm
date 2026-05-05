import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function QrRedirect() {
  const { qrId } = useParams();

  useEffect(() => {
    if (!supabase || !qrId) return;

    const preview = new URLSearchParams(window.location.search).get('preview') === '1';

    (async () => {
      const { data } = await supabase
        .from('qr_codes')
        .select('source, destination_url')
        .eq('id', qrId)
        .maybeSingle();

      if (!data?.destination_url) return;

      const isExternal = (() => {
        try { return new URL(data.destination_url).origin !== window.location.origin; }
        catch { return false; }
      })();

      if (!preview) {
        await supabase.from('qr_logs').insert({
          created_at: new Date().toISOString(),
          source: data.source || 'DIRECT',
          qr_code_id: qrId,
        });
      }

      // 내부 URL은 랜딩 페이지 중복 로깅 방지를 위해 _qr=1 마커 추가
      let redirectUrl = data.destination_url;
      if (!isExternal) {
        try {
          const u = new URL(data.destination_url, window.location.origin);
          u.searchParams.set('_qr', '1');
          redirectUrl = u.toString();
        } catch { /* 파싱 실패 시 원본 사용 */ }
      }
      window.location.href = redirectUrl;
    })();
  }, [qrId]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ color: '#666' }}>이동 중...</p>
    </div>
  );
}
