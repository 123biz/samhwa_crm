import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const res = await supabase
        .from('products')
        .select('id, name, price, image, description, category, features')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      setProduct(res.error ? null : (res.data || null));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-gray-600">불러오는 중...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <p className="text-gray-600">제품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-6 h-6 text-[#1B3A5C]" />
        </button>
        <h2 className="text-center font-bold text-gray-800">삼화메디칼</h2>
        <div className="w-6" />
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2E75B6] px-4 py-8 text-center">
        <div className="text-6xl mb-4">{product.image}</div>
      </div>

      {/* Product Info */}
      <div className="px-4 py-6 bg-white mb-4">
        <h1 className="text-3xl font-bold text-[#1B3A5C] mb-2">{product.name}</h1>
        <div className="mb-4">
          <span className="inline-block bg-[#2E75B6] text-white text-xs font-semibold px-3 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        <p className="text-2xl font-bold text-[#E74C3C] mb-2">
          {(product.price / 1000000).toFixed(1)}만원
        </p>
        <p className="text-gray-600">{product.description}</p>
      </div>

      {/* Features Section */}
      <div className="px-4 py-6 bg-white mb-4">
        <h3 className="text-lg font-bold text-[#1B3A5C] mb-4">주요 기능</h3>
        <div className="space-y-3">
          {(product.features || []).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#27AE60] flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Video Section */}
      <div className="px-4 py-6 bg-white mb-4">
        <h3 className="text-lg font-bold text-[#1B3A5C] mb-4">사용법 영상</h3>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="aspect-video bg-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-400 cursor-pointer transition"
            >
              <Play className="w-8 h-8 text-white" fill="white" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Fixed CTA - Spacer for fixed buttons */}
      <div className="h-28" />

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 px-4 py-3 space-y-2">
        <button
          onClick={() => navigate(`/chatbot/${product.id}`)}
          className="w-full bg-[#1B3A5C] text-white font-bold py-3 rounded-lg hover:bg-[#152a47] transition"
        >
          AS 문의하기
        </button>
        <button className="w-full bg-[#FEE500] text-gray-900 font-bold py-3 rounded-lg hover:bg-[#FDD835] transition">
          카카오톡 채널 추가
        </button>
      </div>
    </div>
  );
}
