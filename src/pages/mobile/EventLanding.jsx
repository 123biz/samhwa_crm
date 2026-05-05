import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { supabase } from '../../lib/supabaseClient';
import { logQrVisit } from '../../lib/logQrVisit';

const eventData = {
  kintex2026: {
    title: '2026 킨텍스 건강박람회',
    subtitle: '국민의 건강을 생각하는 기업 삼화메디칼과 함께 하세요!',
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

  const skipLog = searchParams.get('_qr') === '1';
  const lastLogKeyRef = useRef(null);

  const event = eventData[eventId] || eventData.kintex2026;

  useEffect(() => {
    if (skipLog) return;
    const key = `${eventId}:${source ?? ''}`;
    if (lastLogKeyRef.current === key) return;
    lastLogKeyRef.current = key;
    logQrVisit(source).catch(() => {});
  }, [source, eventId, skipLog]);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;

    (async () => {
      const res = await supabase
        .from('products')
        .select('id, name, description, image, features, product_url');
      if (cancelled) return;
      if (res.error) {
        setProducts([]);
        return;
      }
      const ORDER = ['body_love', 'ankle', 'magic_care', 'perfect_gun'];
      const sorted = (res.data || []).sort(
        (a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id)
      );
      setProducts(sorted);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const registerPath = source
    ? `/register/${eventId}?source=${encodeURIComponent(source)}`
    : `/register/${eventId}`;

  const testSourceByEventId = {
    all: 'QR_EVENT_ALL',
    kintex2026: 'QR_EVENT_ALL',
    busan2026: 'QR_EVENT_BUSAN_2026',
  };
  const expectedSource = testSourceByEventId[eventId] || 'QR_EVENT_ALL';
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
    <div className="max-w-md mx-auto min-h-screen bg-bg">
      {/* Hero Section */}
      <div className="bg-linear-to-br from-primary to-secondary px-4 py-12 text-center text-white">
        <h1 className="text-6xl font-bold mb-2">SOMOKO</h1>
        <p className="text-lg text-blue-100">삼화메디칼과 함께 하세요!</p>
      </div>

      {/* Test QR */}
      {
        <div className="bg-white border-b border-gray-200 px-4 py-6 text-center">
          <div className="flex items-center justify-center">
            <QRCodeCanvas value={`${publicBaseUrl}/landing/all`} size={180} includeMargin={false} />
          </div>
        </div>
      }

      {/* Step Guide */}
      <div className="px-4 py-8 bg-white mb-4">
        <h2 className="text-xl font-bold text-primary mb-6 text-center">이벤트 참여 2단계</h2>
        <div className="space-y-4">
          {[
            { title: '정보 등록', icon: '📝', desc: '기본 정보를 등록하여 이벤트에 참가합니다.' },
            { title: '카카오 친구 추가', icon: '👋', desc: '삼화메디칼 카카오톡 채널을 친구 추가합니다.' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="text-3xl">{item.icon}</div>
              <div>
                <div className="text-lg font-bold text-primary">{item.title}</div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-4 py-4 space-y-2">
        <button
          onClick={() => navigate(registerPath)}
          className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-[#152a47] transition text-lg"
        >
          고객 정보 등록하기
        </button>
      </div>

      {/* Product Preview */}
      <div className="px-4 py-8">
        <h2 className="text-xl font-bold text-primary mb-6 text-center">삼화메디칼 제품</h2>
        <div className="space-y-4">
          {products.map(product => {
            const productImageMap = {
              body_love: '/product_bodylove.jpg',
              ankle: '/product_pumpinglove.jpg',
              magic_care: '/product_magiccare.jpg',
              perfect_gun: '/product_perfectgun.jpg',
            };
            const imgSrc = productImageMap[product.id];
            return (
              <div key={product.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  {imgSrc && (
                    <img src={imgSrc} alt={product.name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-primary">{product.name}</h3>
                      {product.product_url && (
                        <a
                          href={product.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-semibold text-white px-3 py-2 rounded-lg no-underline text-center transition active:translate-y-px"
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
                        <span key={idx} className="text-xs bg-blue-100 text-secondary px-2 py-1 rounded">
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
        <h3 className="font-bold text-primary mb-3">삼화메디칼</h3>
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
