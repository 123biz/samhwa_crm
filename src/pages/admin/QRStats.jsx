import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { QrCode } from 'lucide-react';
import { fetchQrStats } from '../../lib/data/qrStats';

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
    PRODUCT: colors.secondary,
    EVENT: colors.success,
    BANNER: colors.warning,
  };

  const typeLabels = {
    PRODUCT: '제품',
    EVENT: '이벤트',
    BANNER: '배너',
  };

  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState([]);
  const [qrScanDaily, setQrScanDaily] = useState([]);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setDataError(false);
      const res = await fetchQrStats({ days: 25 });
      if (cancelled) return;
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
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalScanCount = useMemo(
    () => qrCodes.reduce((sum, qr) => sum + (qr.scanCount || 0), 0),
    [qrCodes],
  );

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>
          QR 스캔 통계
        </h1>
        <p style={{ color: colors.sub }} className="text-sm mt-1">
          QR 코드 성과 분석 및 스캔 현황
        </p>
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
            className="rounded-lg shadow-md p-6"
            style={{ backgroundColor: colors.surface }}
          >
            {/* QR Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p style={{ color: colors.sub }} className="text-sm font-medium">
                  {qr.id}
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: colors.txt }}>
                  {qr.target}
                </p>
              </div>
              <QrCode size={32} style={{ color: colors.secondary, opacity: 0.3 }} />
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

            {/* Scan Count */}
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: colors.bg }}>
              <p style={{ color: colors.sub }} className="text-xs mb-1">
                총 스캔 수
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                {qr.scanCount.toLocaleString()}
              </p>
            </div>

            {/* Created Date */}
            <p style={{ color: colors.sub }} className="text-xs">
              생성일: {qr.createdAt}
            </p>
          </div>
        ))}
      </div>

      {/* Area Chart - Daily Scan Trend */}
      <div
        className="rounded-lg shadow-md p-6"
        style={{ backgroundColor: colors.surface }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
          일별 QR 스캔 추이
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={qrScanDaily}>
            <defs>
              <linearGradient id="colorProduct" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.secondary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEvent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.success} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBanner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.warning} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.warning} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="date" stroke={colors.sub} fontSize={12} />
            <YAxis stroke={colors.sub} fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="product"
              stroke={colors.secondary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProduct)"
              name="제품 QR"
            />
            <Area
              type="monotone"
              dataKey="event"
              stroke={colors.success}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEvent)"
              name="이벤트 QR"
            />
            <Area
              type="monotone"
              dataKey="banner"
              stroke={colors.warning}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBanner)"
              name="배너 QR"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      <div
        className="rounded-lg shadow-md p-6 mt-6"
        style={{ backgroundColor: colors.surface }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
          QR 통계 요약
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">
              총 QR 코드 수
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.txt }}>
              {qrCodes.length}개
            </p>
          </div>
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">
              총 스캔 수
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
              {totalScanCount.toLocaleString()}건
            </p>
          </div>
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">
              평균 스캔율
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.success }}>
              {qrCodes.length > 0 ? (totalScanCount / qrCodes.length).toFixed(0) : 0}건
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRStats;
