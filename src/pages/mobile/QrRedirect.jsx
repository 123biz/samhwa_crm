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

      // 외부 URL일 때만 여기서 로그. 내부 URL은 도착 페이지에서 직접 logQrVisit을 호출.
      const isExternal = (() => {
        try { return new URL(data.destination_url).origin !== window.location.origin; }
        catch { return false; }
      })();

      if (!preview && isExternal) {
        await supabase.from('qr_logs').insert({
          created_at: new Date().toISOString(),
          source: data.source || 'DIRECT',
          qr_code_id: qrId,
        });
      }

      window.location.href = data.destination_url;
    })();
  }, [qrId]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ color: '#666' }}>이동 중...</p>
    </div>
  );
}
