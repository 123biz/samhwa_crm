import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function StaffVerify() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || null;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      if (!id) {
        setCustomer(null);
        setLoading(false);
        return;
      }
      if (!supabase) {
        setErrorMsg('Supabase 설정이 필요합니다.');
        setLoading(false);
        return;
      }

      const res = await supabase.from('customers').select('id, name, phone, gift_status').eq('id', id).maybeSingle();
      if (cancelled) return;

      if (res.error) {
        setErrorMsg('고객 정보를 불러오지 못했습니다.');
        setCustomer(null);
        setLoading(false);
        return;
      }

      setCustomer(res.data || null);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isClaimed = customer?.gift_status === 'claimed';

  const phoneTail = useMemo(() => {
    if (!customer?.phone) return '';
    const v = String(customer.phone);
    return v.length > 4 ? v.slice(-4) : v;
  }, [customer?.phone]);

  const handleClaim = async () => {
    if (!id || !supabase) return;
    if (isClaimed) return;

    try {
      setClaiming(true);
      const now = new Date().toISOString();
      const res = await supabase
        .from('customers')
        .update({ gift_status: 'claimed', claimed_at: now })
        .eq('id', id)
        .select('id, name, phone, gift_status')
        .maybeSingle();

      if (res.error) throw res.error;
      setCustomer(res.data || customer);
    } catch {
      setErrorMsg('사은품 지급 처리에 실패했습니다.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 z-10">
        <h1 className="text-lg font-bold text-center text-[#1B3A5C]">사은품 지급 검증</h1>
      </div>

      <div className="px-4 py-6">
        {loading && (
          <div className="text-center py-10 text-gray-600 text-sm">로딩 중...</div>
        )}

        {!loading && errorMsg && (
          <div className="bg-[#F0F4F8] border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && !customer && (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm">해당 고객을 찾을 수 없습니다.</p>
          </div>
        )}

        {!loading && customer && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">고객명</div>
              <div className="text-lg font-bold text-[#1B3A5C]">{customer.name}</div>

              <div className="mt-3 text-sm text-gray-500 mb-1">연락처 뒷자리</div>
              <div className="text-lg font-bold text-[#1B3A5C]">***{phoneTail}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">사은품 지급 상태</div>
              <div className={`text-lg font-bold ${isClaimed ? 'text-[#27AE60]' : 'text-[#E67E22]'}`}>
                {isClaimed ? '지급 완료' : '지급 대기'}
              </div>
            </div>

            {!isClaimed && (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className={`w-full font-bold py-3 rounded-lg mt-2 transition ${
                  isClaimed ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1B3A5C] text-white hover:bg-[#152a47]'
                }`}
              >
                사은품 지급 완료
              </button>
            )}

            {isClaimed && (
              <div className="text-center text-xs text-gray-500 pt-2">
                이미 지급이 완료된 고객입니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

