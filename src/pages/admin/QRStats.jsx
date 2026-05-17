import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Pencil } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { fetchQrStats } from '../../lib/data/qrStats';
import { supabase } from '../../lib/supabaseClient';

const QRStats = () => {
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

  const typeColors = {
    // 제품/배너가 비슷해 보이지 않도록 더 선명하게 분리
    PRODUCT: '#2563EB', // vivid blue
    EVENT: colors.success,
    BANNER: '#DB2777', // magenta
  };

  const typeBgColors = {
    // 배경은 아주 연하게, 대신 라인 컬러로 강하게 구분
    PRODUCT: `${'#2563EB'}10`,
    EVENT: `${colors.success}10`,
    BANNER: `${'#DB2777'}10`,
  };

  const typeLabels = {
    PRODUCT: '제품',
    EVENT: '이벤트/전시회',
    BANNER: '카탈로그 배너',
  };

  const publicBaseUrl = (() => {
    const raw = import.meta.env.VITE_PUBLIC_APP_URL;
    if (!raw) return window.location.origin;
    try {
      return new URL(raw).origin;
    } catch {
      return raw.replace(/\/+$/, '');
    }
  })();

  const DEFAULT_EVENT_ID = 'kintex2026';
  const PLACEHOLDER_HOST = 'your-domain.com';

  const normalizeDestinationUrl = (rawUrl) => {
    if (!rawUrl) return null;

    // Relative URL is promoted to current public base URL.
    if (rawUrl.startsWith('/')) return `${publicBaseUrl}${rawUrl}`;

    try {
      const u = new URL(rawUrl);
      // Replace placeholder host with current deployment host automatically.
      if (u.host === PLACEHOLDER_HOST) return `${publicBaseUrl}${u.pathname}${u.search}`;
      return rawUrl;
    } catch {
      return null;
    }
  };

  const inferEventIdFromQr = (qr) => {
    const source = String(qr?.source || '').toUpperCase();
    const target = String(qr?.target || '');

    if (source.includes('BUSAN') || target.includes('부산')) return 'busan2026';
    if (source.includes('KINTEX') || target.includes('킨텍스')) return 'kintex2026';
    return DEFAULT_EVENT_ID;
  };

  const buildQrUrl = (qr) => {
    if (!qr?.id) return null;
    return `${publicBaseUrl}/go/${qr.id}`;
  };

  const downloadQrSvg = (qr) => {
    const url = buildQrUrl(qr);
    if (!url) return;

    const svg = document.getElementById(`qr-svg-${qr.id}`);
    if (!(svg instanceof SVGElement)) return;

    const cloned = svg.cloneNode(true);
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const data = new XMLSerializer().serializeToString(cloned);
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const href = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = href;
    a.download = `${qr.type || 'QR'}_${qr.source || qr.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  };

  const [chartMonthOffset, setChartMonthOffset] = useState(0); // 0 = 이번 달, 1 = 지난달, ...

  const { chartStartDate, chartEndDate, chartRangeLabel } = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() - chartMonthOffset;
    const start = new Date(y, m, 1);
    const end = chartMonthOffset === 0 ? now : new Date(y, m + 1, 0, 23, 59, 59, 999);
    const label = `${start.getFullYear()}년 ${start.getMonth() + 1}월`;
    return { chartStartDate: start, chartEndDate: end, chartRangeLabel: label };
  }, [chartMonthOffset]);

  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState([]);
  const [qrScanDaily, setQrScanDaily] = useState([]);
  const [dataError, setDataError] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setDataError(false);
    const res = await fetchQrStats({ startDate: chartStartDate, endDate: chartEndDate });
    if (!res.ok) {
      setDataError(true);
      setQrCodes([]);
      setQrScanDaily([]);
      setLoading(false);
      return;
    }
    setQrCodes(res.qrCodes);
    setQrScanDaily(res.qrScanDaily);
    setLoading(false);
  }, [chartStartDate, chartEndDate]);

  // 차트 구간만 다시 불러오기 (카드 유지)
  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    (async () => {
      setChartLoading(true);
      const res = await fetchQrStats({ startDate: chartStartDate, endDate: chartEndDate });
      if (cancelled) return;
      if (res.ok) setQrScanDaily(res.qrScanDaily);
      setChartLoading(false);
    })();
    return () => { cancelled = true; };
  }, [chartMonthOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      if (!supabase) {
        setProducts([]);
        setProductsLoading(false);
        return;
      }
      const res = await supabase.from('products').select('id, name, product_url').order('name', { ascending: true });
      if (cancelled) return;
      setProducts(res.error ? [] : (res.data || []));
      setProductsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const FIXED_DESTINATION_URL = 'https://anti-mywebpage-skt6.vercel.app/landing/all';

  const [createForm, setCreateForm] = useState({
    type: 'EVENT',
    productId: '',
    target: '',
    source: '',
    destinationUrl: FIXED_DESTINATION_URL,
  });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null); // qr row
  const [editForm, setEditForm] = useState(null);

  const composeProductUrl = useCallback((productId, source) => {
    if (!productId) return '';
    const product = productById.get(productId);
    const base = product?.product_url || `${publicBaseUrl}/product/${encodeURIComponent(productId)}`;
    if (!source) return base;
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}source=${encodeURIComponent(source)}`;
  }, [publicBaseUrl, productById]);

  const openEdit = (qr) => {
    setEditing(qr);
    const source = qr.source || '';
    const productId = qr.type === 'PRODUCT' ? (qr.target || '') : '';
    const destinationUrl = qr.type === 'PRODUCT'
      ? composeProductUrl(productId, source)
      : (qr.destinationUrl || '');
    setEditForm({
      type: qr.type,
      productId,
      target: qr.type === 'PRODUCT' ? '' : (qr.target || ''),
      source,
      destinationUrl,
    });
  };

  const resetCreate = () => {
    setCreateForm({ type: 'EVENT', productId: '', target: '', source: '', destinationUrl: FIXED_DESTINATION_URL });
  };

  const openCreate = () => {
    resetCreate();
    setCreateModalOffset({ x: 0, y: 0 });
    setCreating(true);
  };

  const [createModalOffset, setCreateModalOffset] = useState({ x: 0, y: 0 });

  const startCreateDrag = (e) => {
    // only left click / primary pointer
    if (e.button !== 0) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const startOffset = { ...createModalOffset };

    const onMove = (ev) => {
      setCreateModalOffset({
        x: startOffset.x + (ev.clientX - startX),
        y: startOffset.y + (ev.clientY - startY),
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!supabase) {
      alert('Supabase 설정이 필요합니다.');
      return;
    }
    const type = createForm.type;
    const target = type === 'PRODUCT' ? createForm.productId : createForm.target;
    if (!target) {
      alert('target을 입력/선택해 주세요.');
      return;
    }
    const destinationUrl = createForm.destinationUrl;
    if (!destinationUrl) {
      alert('이동할 URL(destination_url)을 입력해 주세요.');
      return;
    }
    const sourceVal = createForm.source.trim() || null;
    if (sourceVal && qrCodes.some((qr) => qr.source === sourceVal)) {
      alert(`"${sourceVal}"는 이미 사용 중인 source입니다. 다른 이름을 입력해 주세요.`);
      return;
    }
    try {
      setSaving(true);
      const res = await supabase
        .from('qr_codes')
        .insert({ type, target, source: sourceVal, destination_url: destinationUrl })
        .select('id')
        .single();
      if (res.error) {
        alert(`저장 실패: ${res.error.message}`);
        return;
      }
      resetCreate();
      setCreating(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!supabase) {
      alert('Supabase 설정이 필요합니다.');
      return;
    }
    if (!editing || !editForm) return;
    const type = editForm.type;
    const target = type === 'PRODUCT' ? editForm.productId : editForm.target;
    if (!target) {
      alert('target을 입력/선택해 주세요.');
      return;
    }
    const destinationUrl = editForm.destinationUrl || buildQrUrl({
      type,
      target,
      source: editForm.source || null,
      destinationUrl: null,
    });
    if (!destinationUrl) {
      alert('QR URL을 생성할 수 없습니다. source를 확인해 주세요.');
      return;
    }
    try {
      setSaving(true);
      const res = await supabase
        .from('qr_codes')
        .update({
          type,
          target,
          source: editForm.source ? editForm.source : null,
          destination_url: destinationUrl,
        })
        .eq('id', editing.id);
      if (res.error) {
        alert(`수정 실패: ${res.error.message}`);
        return;
      }
      setEditing(null);
      setEditForm(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const deleteQr = async (qr) => {
    if (!supabase) {
      alert('Supabase 설정이 필요합니다.');
      return;
    }
    if (!window.confirm('정말 삭제할까요?')) return;
    try {
      setSaving(true);
      const res = await supabase.from('qr_codes').delete().eq('id', qr.id);
      if (res.error) {
        alert(`삭제 실패: ${res.error.message}`);
        return;
      }
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const totalScanCount = useMemo(
    () => qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0),
    [qrCodes],
  );

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>
          QR 코드 관리
        </h1>
        <p style={{ color: colors.sub }} className="text-sm mt-1">
          QR 코드 성과 분석 및 스캔 현황
        </p>
      </div>

      {/* Summary Statistics */}
      <div
        className="rounded-lg shadow-md p-6 mb-8"
        style={{ backgroundColor: colors.surface }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
          QR 통계 요약
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">총 QR 코드 수</p>
            <p className="text-2xl font-bold" style={{ color: colors.txt }}>{qrCodes.length}개</p>
          </div>
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">총 스캔 수</p>
            <p className="text-2xl font-bold" style={{ color: colors.secondary }}>{totalScanCount.toLocaleString()}건</p>
          </div>
        </div>
      </div>


      {/* QR Code Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {loading && (
          <div className="col-span-full text-center py-10 text-sm" style={{ color: colors.sub }}>
            불러오는 중...
          </div>
        )}
        {!loading && dataError && (
          <div className="col-span-full text-center py-10 text-sm" style={{ color: colors.sub }}>
            QR 통계 데이터를 불러오지 못했습니다. (Supabase 테이블/권한을 확인하세요)
          </div>
        )}
        {!loading && !dataError && qrCodes.length === 0 && (
          <div className="col-span-full text-center py-10 text-sm" style={{ color: colors.sub }}>
            등록된 QR 코드가 없습니다.
          </div>
        )}
        {!loading && !dataError && qrCodes.map((qr) => (
          <div
            key={qr.id}
            className="rounded-lg shadow-md p-6 transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg"
            style={{
              backgroundColor: typeBgColors[qr.type] || colors.surface,
              borderLeft: `8px solid ${typeColors[qr.type] || colors.border}`,
            }}
          >
            {/* QR Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                {(() => {
                  const product = qr.type === 'PRODUCT' ? productById.get(qr.target) : null;
                  const href = product?.product_url || qr.destinationUrl;
                  const label = product?.name || qr.target;
                  const previewHref = href
                    ? href + (href.includes('?') ? '&' : '?') + 'preview=1'
                    : null;
                  return previewHref ? (
                    <a
                      href={previewHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: colors.secondary, cursor: 'pointer', fontWeight: 'bold', fontSize: '1.125rem' }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {label} ↗
                    </a>
                  ) : (
                    <p className="text-lg font-bold mt-1" style={{ color: colors.txt }}>{label}</p>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-white/60"
                  onClick={() => openEdit(qr)}
                  disabled={saving}
                  aria-label="수정"
                  title="수정"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </div>

            {/* Type Badge */}
            <div className="mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: typeColors[qr.type] }}
              >
                {typeLabels[qr.type]}
              </span>
            </div>

            {/* Scan + QR (1/2 split) */}
            <div className="mb-4 grid grid-cols-2 gap-4 items-start">
              <div className="pt-4">
                <div className="p-4 rounded-lg bg-transparent">
                  <p style={{ color: colors.sub }} className="text-xs mb-1">
                    총 스캔 수
                  </p>
                  <p className="text-3xl font-bold" style={{ color: colors.secondary }}>
                    {qr.scanCount.toLocaleString()}
                  </p>
                </div>
                <p style={{ color: colors.sub }} className="text-xs mt-6 pl-3">
                  생성일: {qr.createdAt}
                </p>
              </div>

              <div className="flex flex-col items-center justify-start pt-0 -mt-10">
                {buildQrUrl(qr) ? (
                  <>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <QRCodeSVG
                        id={`qr-svg-${qr.id}`}
                        value={buildQrUrl(qr)}
                        size={160}
                        includeMargin={true}
                      />
                    </div>
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-semibold text-gray-600 hover:text-gray-800 underline underline-offset-2 cursor-pointer"
                      onClick={() => downloadQrSvg(qr)}
                    >
                      SVG 다운로드
                    </button>
                  </>
                ) : (
                  <div className="text-[11px] text-gray-400 text-center leading-snug">
                    URL 없음
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 제품별 QR 스캔 수 — 마지막 빈 자리 */}
        {!loading && !dataError && (() => {
          const productQrs = qrCodes.filter(qr => qr.type === 'PRODUCT');
          if (productQrs.length === 0) return null;
          const barData = productQrs.map(qr => ({
            name: productById.get(qr.target)?.name || qr.target,
            스캔수: qr.scanCount,
          }));
          return (
            <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.surface }}>
              <p className="text-sm font-semibold mb-4" style={{ color: colors.txt }}>제품별 QR 스캔 수</p>
              <ResponsiveContainer width="100%" height={productQrs.length * 48 + 20}>
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
                  <XAxis type="number" stroke={colors.sub} fontSize={12} />
                  <YAxis type="category" dataKey="name" width={110} stroke={colors.sub} fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: 12 }} />
                  <Bar dataKey="스캔수" radius={[0, 4, 4, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={['#2563EB','#27AE60','#E67E22','#8E44AD','#DB2777','#0891B2'][i % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })()}
      </div>

      {/* QR 등록 버튼 */}
      <div className="flex justify-center mb-8">
        <button
          type="button"
          className="rounded-xl px-16 py-5 text-xl font-extrabold text-white cursor-pointer shadow hover:shadow-md"
          style={{ backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }}
          onClick={openCreate}
          disabled={saving}
        >
          QR 등록
        </button>
      </div>


      {/* Edit Modal */}
      {editing && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-bold text-primary">QR 수정</div>
                <div className="text-xs text-gray-500 mt-1">{editing.id}</div>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                onClick={() => { setEditing(null); setEditForm(null); }}
                disabled={saving}
              >
                닫기
              </button>
            </div>

            <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1 text-gray-500">타입</label>
                <select
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={editForm.type}
                  onChange={(e) => {
                    const t = e.target.value;
                    setEditForm((v) => ({
                      ...v,
                      type: t,
                      productId: '',
                      target: '',
                      destinationUrl: '',
                    }));
                  }}
                >
                  <option value="PRODUCT">제품</option>
                  <option value="EVENT">이벤트/전시회</option>
                  <option value="BANNER">카탈로그 배너</option>
                </select>
              </div>

              {editForm.type === 'PRODUCT' ? (
                <div>
                  <label className="block text-xs mb-1 text-gray-500">제품 선택</label>
                  <select
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    value={editForm.productId}
                    disabled={productsLoading}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setEditForm((v) => {
                        const next = { ...v, productId: pid };
                        next.destinationUrl = composeProductUrl(pid, v.source);
                        return next;
                      });
                    }}
                  >
                    <option value="">{productsLoading ? '불러오는 중...' : '선택하세요'}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs mb-1 text-gray-500">
                    {editForm.type === 'EVENT' ? '행사명' : '배너 명칭'}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    value={editForm.target}
                    onChange={(e) => setEditForm((v) => ({ ...v, target: e.target.value }))}
                    placeholder={editForm.type === 'EVENT' ? '예: 2026 킨텍스 건강박람회' : '예: 2026 봄 카탈로그 배너'}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs mb-1 text-gray-500">source (선택)</label>
                <input
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={editForm.source}
                  onChange={(e) => {
                    const s = e.target.value;
                    setEditForm((v) => {
                      const next = { ...v, source: s };
                      if (v.type === 'PRODUCT') next.destinationUrl = composeProductUrl(v.productId, s);
                      return next;
                    });
                  }}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs mb-1 text-gray-500">destination_url (필수)</label>
                <input
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={editForm.destinationUrl}
                  onChange={(e) => setEditForm((v) => ({ ...v, destinationUrl: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={() => { setEditing(null); setEditForm(null); }}
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }}
                  disabled={saving}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/40 px-4">
          <div
            className="fixed left-1/2 top-1/2 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
            style={{
              transform: `translate(calc(-50% + ${createModalOffset.x}px), calc(-50% + ${createModalOffset.y}px))`,
            }}
          >
            <div
              className="flex items-start justify-between mb-4 cursor-move select-none"
              onPointerDown={startCreateDrag}
              title="드래그해서 이동"
            >
              <div className="text-lg font-bold text-primary">QR 등록</div>
              <button
                type="button"
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                onClick={() => setCreating(false)}
                disabled={saving}
              >
                닫기
              </button>
            </div>

            <form onSubmit={submitCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1 text-gray-500">타입</label>
                <select
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={createForm.type}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setCreateForm((v) => ({
                      ...v,
                      type: nextType,
                      productId: '',
                      target: '',
                      destinationUrl: '',
                    }));
                  }}
                >
                  <option value="PRODUCT">제품</option>
                  <option value="EVENT">이벤트/전시회</option>
                  <option value="BANNER">카탈로그 배너</option>
                </select>
              </div>

              {createForm.type === 'PRODUCT' ? (
                <div>
                  <label className="block text-xs mb-1 text-gray-500">제품 선택</label>
                  <select
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    value={createForm.productId}
                    disabled={productsLoading}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setCreateForm((v) => {
                        const next = { ...v, productId: pid };
                        next.destinationUrl = composeProductUrl(pid, v.source);
                        return next;
                      });
                    }}
                  >
                    <option value="">{productsLoading ? '불러오는 중...' : '선택하세요'}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs mb-1 text-gray-500">
                    {createForm.type === 'EVENT' ? '행사명' : '배너 명칭'}
                  </label>
                  <input
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    value={createForm.target}
                    onChange={(e) => setCreateForm((v) => ({ ...v, target: e.target.value }))}
                    placeholder={createForm.type === 'EVENT' ? '예: 2026 킨텍스 건강박람회' : '예: 2026 봄 카탈로그 배너'}
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs mb-1 text-gray-500">source (선택 — 기존 목록 참고 후 새 이름 입력)</label>
                <div className="flex gap-2">
                  <select
                    className="w-48 rounded-md border border-gray-200 px-2 py-2 text-sm text-gray-500 shrink-0"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setCreateForm((v) => ({ ...v, source: e.target.value }));
                      e.target.value = '';
                    }}
                  >
                    <option value="">기존 목록 참고</option>
                    {qrCodes.filter((qr) => qr.source).map((qr) => (
                      <option key={qr.id} value={qr.source}>{qr.source}</option>
                    ))}
                  </select>
                  <input
                    className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
                    value={createForm.source}
                    onChange={(e) => setCreateForm((v) => ({ ...v, source: e.target.value }))}
                    placeholder="새 source 입력 (예: QR_EVENT_AI_2026)"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs mb-1 text-gray-500">destination_url</label>
                <input
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  value={createForm.destinationUrl}
                  onChange={(e) => setCreateForm((v) => ({ ...v, destinationUrl: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  onClick={resetCreate}
                  disabled={saving}
                >
                  초기화
                </button>
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }}
                  disabled={saving}
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



    </div>
  );
};

export default QRStats;
