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

      if (!preview) {
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
