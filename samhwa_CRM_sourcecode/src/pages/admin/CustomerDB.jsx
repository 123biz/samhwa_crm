import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { customers } from '../../data/mockData';

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
  const [segmentFilter, setSegmentFilter] = useState('전체');
  const [sourceFilter, setSourceFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const segmentBadgeColors = {
    BUYER: '#2E75B6',
    LEAD: '#8E44AD',
    AGENT: '#16A085',
  };

  const sourceLabels = {
    QR_EVENT: 'QR 이벤트',
    QR_PRODUCT: 'QR 제품',
    QR_BANNER: 'QR 배너',
    DIRECT: '직접 추가',
  };

  // Filter data
  const filteredData = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.includes(searchTerm) ||
        customer.id.includes(searchTerm) ||
        customer.phone.includes(searchTerm);
      const matchesSegment =
        segmentFilter === '전체' || customer.segment === segmentFilter;
      const matchesSource =
        sourceFilter === '전체' || customer.source === sourceFilter;
      return matchesSearch && matchesSegment && matchesSource;
    });
  }, [searchTerm, segmentFilter, sourceFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIdx, startIdx + pageSize);

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

      {/* Search and Filters */}
      <div
        className="rounded-lg shadow-md p-6 mb-6"
        style={{ backgroundColor: colors.surface }}
      >
        {/* Search Bar */}
        <div className="mb-4">
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

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Segment Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
              세그먼트
            </label>
            <select
              value={segmentFilter}
              onChange={(e) => {
                setSegmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: '1px',
                color: colors.txt,
              }}
            >
              <option>전체</option>
              <option>BUYER</option>
              <option>LEAD</option>
              <option>AGENT</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
              유입경로
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 rounded-lg outline-none"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: '1px',
                color: colors.txt,
              }}
            >
              <option>전체</option>
              <option value="QR_EVENT">QR 이벤트</option>
              <option value="QR_PRODUCT">QR 제품</option>
              <option value="QR_BANNER">QR 배너</option>
              <option value="DIRECT">직접 추가</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4" style={{ color: colors.sub }}>
        <p className="text-sm">
          총 <span className="font-semibold">{filteredData.length}</span>명의 고객이 조회되었습니다.
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
                  ID
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  이름
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  연락처
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  세그먼트
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  유입경로
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  보유제품
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  마케팅동의
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  등록일
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((customer) => (
                <tr
                  key={customer.id}
                  style={{
                    borderBottomColor: colors.border,
                    borderBottomWidth: '1px',
                  }}
                >
                  <td className="py-3 px-4" style={{ color: colors.txt }}>
                    {customer.id}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.txt }}>
                    {customer.name}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {customer.phone}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor: segmentBadgeColors[customer.segment],
                      }}
                    >
                      {customer.segment}
                    </span>
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {sourceLabels[customer.source]}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {customer.productsOwned.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      style={{
                        color: customer.marketingConsent ? colors.success : colors.error,
                        fontSize: '18px',
                      }}
                    >
                      {customer.marketingConsent ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.sub }}>
                    {customer.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
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

      {filteredData.length === 0 && (
        <div className="text-center py-12" style={{ color: colors.sub }}>
          <p>조회 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerDB;
