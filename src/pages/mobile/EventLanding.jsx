import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../lib/supabaseClient';

const eventData = {
  kintex2026: {
    title: '2026 킨텍스 건강박람회',
    subtitle: '삼화메디칼과 함께하세요!',
  },
  busan2026: {
    title: '2026 부산 메디카 엑스포',
    subtitle: '최고의 건강기기를 만나보세요!',
  },
};

export default function EventLanding() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || null;
  const [products, setProducts] = useState([]);

  const didLogRef = useRef(false);

  const event = eventData[eventId] || eventData.kintex2026;

  useEffect(() => {
    if (!source) return;
    if (didLogRef.current) return;
    didLogRef.current = true;

    if (!supabase) return;

    (async () => {
      // source -> qr_codes 매핑이 있으면 qr_code_id까지 같이 저장
      const codeRes = await supabase
        .from('qr_codes')
        .select('id')
        .eq('source', source)
        .maybeSingle();

      const qrCodeId = !codeRes.error ? codeRes.data?.id ?? null : null;

      await supabase
        .from('qr_logs')
        .insert({
          created_at: new Date().toISOString(),
          source,
          qr_code_id: qrCodeId,
        });
    })().catch(() => {
      // UI는 디자인을 유지하기 위해 에러를 조용히 흡수합니다.
    });
  }, [source, eventId]);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;

    (async () => {
      const res = await supabase
        .from('products')
        .select('id, name, description, image, features')
        .order('name', { ascending: true });
      if (cancelled) return;
      if (res.error) {
        setProducts([]);
        return;
      }
      setProducts(res.data || []);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const registerPath = source
    ? `/register/${eventId}?source=${encodeURIComponent(source)}`
    : `/register/${eventId}`;

  const testSourceByEventId = {
    kintex2026: 'QR_EVENT_KINTEX_2026',
    busan2026: 'QR_EVENT_BUSAN_2026',
  };
  const testSource = source || testSourceByEventId[eventId] || 'QR_EVENT_KINTEX_2026';
  const publicBaseUrl = (() => {
    const raw = import.meta.env.VITE_PUBLIC_APP_URL;
    if (!raw) return window.location.origin;
    try {
      return new URL(raw).origin;
    } catch {
      return raw.replace(/\/+$/, '');
    }
  })();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2E75B6] px-4 py-12 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
        <p className="text-lg text-blue-100">{event.subtitle}</p>
      </div>

      {/* Test QR */}
      {
        <div className="bg-white border-b border-gray-200 px-4 py-6 text-center">
          <div className="font-bold text-[#1B3A5C] mb-2">테스트용 QR</div>
          <p className="text-xs text-gray-500 mb-4">
            휴대폰으로 스캔하면 `source` 포함 랜딩으로 진입하며 `qr_logs`가 기록됩니다.
          </p>
          <div className="flex items-center justify-center">
            {(() => {
              const base = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;
              const baseTrim = base.endsWith('/') ? base.slice(0, -1) : base;
              const url = `${publicBaseUrl}${baseTrim}/landing/${eventId}?source=${encodeURIComponent(testSource)}`;
              return <QRCodeCanvas value={url} size={180} includeMargin={false} />;
            })()}
          </div>
          <div className="mt-3 text-xs text-gray-500 break-all">
            source: {testSource}
          </div>
          <div className="mt-2 text-[10px] text-gray-400 break-all">
            {(() => {
              const base = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;
              const baseTrim = base.endsWith('/') ? base.slice(0, -1) : base;
              return `${publicBaseUrl}${baseTrim}/landing/${eventId}?source=${encodeURIComponent(testSource)}`;
            })()}
          </div>
        </div>
      }

      {/* Step Guide */}
      <div className="px-4 py-8 bg-white mb-4">
        <h2 className="text-xl font-bold text-[#1B3A5C] mb-6 text-center">이벤트 참여 3단계</h2>
        <div className="space-y-4">
          {[
            { step: '①', title: '정보 등록', icon: '📝' },
            { step: '②', title: '카카오 친구 추가', icon: '👋' },
            { step: '③', title: '사은품 수령', icon: '🎁' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="text-3xl">{item.icon}</div>
              <div>
                <div className="text-lg font-bold text-[#1B3A5C]">{item.title}</div>
                <p className="text-sm text-gray-600">
                  {idx === 0 && '기본 정보를 등록하여 이벤트에 참가합니다.'}
                  {idx === 1 && '삼화메디칼 카카오톡 채널을 친구 추가합니다.'}
                  {idx === 2 && '부스에서 사은품을 수령합니다.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={() => navigate(registerPath)}
          className="w-full bg-[#1B3A5C] text-white font-bold py-4 rounded-lg hover:bg-[#152a47] transition text-lg"
        >
          고객 정보 등록하기
        </button>
      </div>

      {/* Product Preview */}
      <div className="px-4 py-8">
        <h2 className="text-xl font-bold text-[#1B3A5C] mb-6 text-center">삼화메디칼 제품</h2>
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{product.image}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1B3A5C]">{product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map((feat, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-[#2E75B6] px-2 py-1 rounded">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-8 mt-8 text-center">
        <h3 className="font-bold text-[#1B3A5C] mb-3">삼화메디칼</h3>
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <p>고객센터: 1551-1346</p>
          <p>평일 09:00~18:00 (점심 12:00~13:00)</p>
        </div>
        <p className="text-xs text-gray-500">
          © 2026 삼화메디칼. All rights reserved.
        </p>
      </div>
    </div>
  );
}
