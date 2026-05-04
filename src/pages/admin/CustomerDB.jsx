import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatKstDateTime } from '../../lib/time/kst';

const CustomerDB = () => {
  const colors = {
    primary: '#1B3A5C',
    secondary: '#2E75B6',
    success: '#27AE60',
    warning: '#E67E22',
    error: '#E74C3C',
    bg: '#F8F9FA',
    surface: '#FFFFFF',
    txt: '#333333',
    sub: '#666666',
    border: '#CCCCCC',
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      return;
    }

    (async () => {
      setLoading(true);

      let q = supabase
        .from('customers')
        .select('id, name, phone, region, products_owned, interests, marketing_consent, created_at', { count: 'exact' })
        .order('created_at', { ascending: false });

      const term = searchTerm.trim();
      if (term) {
        q = q.or(`name.ilike.%${term}%,phone.ilike.%${term}%,id.ilike.%${term}%`);
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      q = q.range(from, to);

      const res = await q;
      if (cancelled) return;

      if (res.error) {
        setRows([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      setRows(res.data || []);
      setTotalCount(res.count || 0);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [searchTerm, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>
          고객 DB 관리
        </h1>
        <p style={{ color: colors.sub }} className="text-sm mt-1">
          등록 고객 정보 조회 및 관리
        </p>
      </div>

      {/* Search */}
      <div
        className="rounded-lg shadow-md p-6 mb-6"
        style={{ backgroundColor: colors.surface }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: '1px',
          }}
        >
          <Search size={18} style={{ color: colors.sub }} />
          <input
            type="text"
            placeholder="고객명, ID, 연락처로 검색"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 bg-transparent outline-none"
            style={{ color: colors.txt }}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4" style={{ color: colors.sub }}>
        <p className="text-sm">
          총 <span className="font-semibold">{totalCount}</span>명의 고객이 조회되었습니다.
        </p>
      </div>

      {/* Table */}
      <div
        className="rounded-lg shadow-md overflow-hidden"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead
              style={{
                backgroundColor: colors.bg,
                borderBottomColor: colors.border,
                borderBottomWidth: '1px',
              }}
            >
              <tr>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  등록 일시
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  이름
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  연락처
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  거주지역
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  보유제품
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  관심분야
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  마케팅동의
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((customer) => (
                <tr
                  key={customer.id}
                  style={{
                    borderBottomColor: colors.border,
                    borderBottomWidth: '1px',
                  }}
                >
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {formatKstDateTime(customer.created_at)}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.txt }}>
                    {customer.name}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {customer.phone}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {customer.region || '-'}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {(customer.products_owned || []).join(', ')}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {(customer.interests || []).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      style={{
                        color: customer.marketing_consent ? colors.success : colors.error,
                        fontSize: '18px',
                      }}
                    >
                      {customer.marketing_consent ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div style={{ color: colors.sub }} className="text-sm">
            {currentPage} / {totalPages} 페이지
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg flex items-center gap-1 disabled:opacity-50"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: '1px',
                color: colors.txt,
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg flex items-center gap-1 disabled:opacity-50"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: '1px',
                color: colors.txt,
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {!loading && totalCount === 0 && (
        <div className="text-center py-12" style={{ color: colors.sub }}>
          <p>조회 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerDB;
