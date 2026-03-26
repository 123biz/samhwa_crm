import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const BroadcastMgmt = () => {
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

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetSegment: '전체',
    reservedAt: '',
  });
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content || !formData.reservedAt) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (!supabase) {
      alert('Supabase 설정이 필요합니다.');
      return;
    }

    (async () => {
      const payload = {
        title: formData.title,
        content: formData.content,
        target_segment: formData.targetSegment,
        reserved_at: new Date(formData.reservedAt).toISOString(),
        status: '예약중',
      };
      const res = await supabase.from('broadcasts').insert(payload).select('*').single();
      if (res.error) {
        alert('발신 예약에 실패했습니다.');
        return;
      }
      setBroadcasts((prev) => [res.data, ...prev]);
      setShowModal(false);
      setFormData({
        title: '',
        content: '',
        targetSegment: '전체',
        reservedAt: '',
      });
      alert('발신이 예약되었습니다.');
    })();
  };

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      return;
    }

    (async () => {
      setLoading(true);
      const res = await supabase
        .from('broadcasts')
        .select('id, title, target_segment, sent_at, open_rate, click_rate, sent_count, status')
        .order('sent_at', { ascending: false, nullsFirst: false })
        .order('reserved_at', { ascending: false, nullsFirst: false });
      if (cancelled) return;
      setBroadcasts(res.error ? [] : (res.data || []));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header with Button */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>
            발신 관리
          </h1>
          <p style={{ color: colors.sub }} className="text-sm mt-1">
            카카오톡 발신 이력 및 예약 관리
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 rounded-lg font-medium text-white"
          style={{ backgroundColor: colors.secondary }}
        >
          새 발신 작성
        </button>
      </div>

      {/* Broadcasts Table */}
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
                  제목
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  대상 세그먼트
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  발신일
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  오픈률
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  클릭률
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  발신수
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  상태
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="py-6 px-4 text-center text-sm" style={{ color: colors.sub }} colSpan={8}>
                    불러오는 중...
                  </td>
                </tr>
              )}
              {!loading && broadcasts.map((broadcast) => {
                const isCompleted = broadcast.status === '발신완료';
                const statusColor = isCompleted ? colors.success : colors.warning;

                return (
                  <tr
                    key={broadcast.id}
                    style={{
                      borderBottomColor: colors.border,
                      borderBottomWidth: '1px',
                    }}
                  >
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {broadcast.id}
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {broadcast.title}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        {broadcast.target_segment}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.sub }}>
                      {broadcast.sent_at ? String(broadcast.sent_at).slice(0, 16).replace('T', ' ') : '-'}
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {broadcast.open_rate ?? 0}%
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {broadcast.click_rate ?? 0}%
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      Number(broadcast.sent_count || 0).toLocaleString()
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                        }}
                      >
                        {broadcast.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg shadow-lg max-w-md w-full p-6"
            style={{ backgroundColor: colors.surface }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.txt }}>
                새 발신 작성
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:opacity-70"
                style={{ color: colors.sub }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
                  제목
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    borderWidth: '1px',
                    color: colors.txt,
                  }}
                  placeholder="발신 제목을 입력하세요"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
                  내용
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    borderWidth: '1px',
                    color: colors.txt,
                  }}
                  placeholder="발신 내용을 입력하세요"
                />
              </div>

              {/* Target Segment */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
                  대상 세그먼트
                </label>
                <select
                  name="targetSegment"
                  value={formData.targetSegment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg outline-none"
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

              {/* Reserved DateTime */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.txt }}>
                  발신 예약 일시
                </label>
                <input
                  type="datetime-local"
                  name="reservedAt"
                  value={formData.reservedAt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    borderWidth: '1px',
                    color: colors.txt,
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderWidth: '1px',
                  color: colors.txt,
                }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: colors.secondary }}
              >
                예약
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastMgmt;
