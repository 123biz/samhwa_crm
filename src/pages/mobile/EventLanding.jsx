import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../lib/supabaseClient';
import { logQrVisit } from '../../lib/logQrVisit';

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
  const [eventQr, setEventQr] = useState(null);

  const lastLogKeyRef = useRef(null);

  const event = eventData[eventId] || eventData.kintex2026;

  useEffect(() => {
    const key = `${eventId}:${source ?? ''}`;
    if (lastLogKeyRef.current === key) return;
    lastLogKeyRef.current = key;
    logQrVisit(source).catch(() => {});
  }, [source, eventId]);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;

    (async () => {
      const res = await supabase
        .from('products')
        .select('id, name, description, image, features, product_url')
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
  const expectedSource = testSourceByEventId[eventId] || 'QR_EVENT_KINTEX_2026';
  const publicBaseUrl = (() => {
    const raw = import.meta.env.VITE_PUBLIC_APP_URL;
    if (!raw) return window.location.origin;
    try {
      return new URL(raw).origin;
    } catch {
      return raw.replace(/\/+$/, '');
    }
  })();

  const resolveQrUrl = (rawUrl, fallbackSource) => {
    if (rawUrl) {
      if (rawUrl.startsWith('/')) return `${publicBaseUrl}${rawUrl}`;
      try {
        const u = new URL(rawUrl);
        if (u.host === 'your-domain.com') return `${publicBaseUrl}${u.pathname}${u.search}`;
        return rawUrl;
      } catch {
        // ignore and fallback below
      }
    }
    return `${publicBaseUrl}/landing/${eventId}?source=${encodeURIComponent(fallbackSource)}`;
  };

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setEventQr(null);
      return;
    }

    (async () => {
      const res = await supabase
        .from('qr_codes')
        .select('source, destination_url')
        .eq('source', expectedSource)
        .maybeSingle();
      if (cancelled) return;
      setEventQr(res.error ? null : (res.data || null));
    })();

    return () => {
      cancelled = true;
    };
  }, [expectedSource]);

  const testSource = eventQr?.source || source || expectedSource;
  const testQrUrl = resolveQrUrl(eventQr?.destination_url, testSource);

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
          <div className="flex items-center justify-center">
            {(() => {
              return <QRCodeCanvas value={testQrUrl} size={180} includeMargin={false} />;
            })()}
          </div>
          <div className="mt-3 text-xs text-gray-500 break-all">
            source: {testSource}
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
          {products.map(product => {
            const productImageMap = {
              body_love: '/product_bodylove.jpg',
              perfect_gun: '/product_perfectgun.jpg',
              ankle: '/product_pumpinglove.jpg',
            };
            const imgSrc = productImageMap[product.id];
            return (
              <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  {imgSrc && (
                    <img src={imgSrc} alt={product.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-[#1B3A5C]">{product.name}</h3>
                      {product.product_url && (
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs font-semibold text-white px-3 py-2 rounded-lg no-underline text-center transition active:translate-y-px"
                          style={{
                            background: 'linear-gradient(180deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                            border: '1px solid #be123c',
                          }}
                        >
                          상세페이지
                        </a>
                      )}
                    </div>
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
            );
          })}
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
