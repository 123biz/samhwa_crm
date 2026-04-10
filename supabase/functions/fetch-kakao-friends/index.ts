import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const kakaoKey     = Deno.env.get('KAKAO_REST_API_KEY');
    const kakaoChannel = Deno.env.get('KAKAO_CHANNEL_ID');

    if (!kakaoKey || !kakaoChannel) {
      return new Response(
        JSON.stringify({ error: 'Missing KAKAO_REST_API_KEY or KAKAO_CHANNEL_ID' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const kakaoRes = await fetch(
      `https://kapi.kakao.com/v1/channel?channel_public_id=${encodeURIComponent(kakaoChannel)}`,
      { headers: { Authorization: `KakaoAK ${kakaoKey}` } },
    );

    if (!kakaoRes.ok) {
      const body = await kakaoRes.text();
      return new Response(
        JSON.stringify({ error: 'Kakao API error', status: kakaoRes.status, body }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const json = await kakaoRes.json();
    console.log('Kakao API response:', JSON.stringify(json));

    const friendCount =
      json?.channel?.subscriberCount ??
      json?.subscriber_count ??
      0;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error: insertError } = await supabase
      .from('kakao_stats')
      .insert({ friend_count: friendCount });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true, friend_count: friendCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
