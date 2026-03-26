import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';

const Analytics = () => {
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

  const [broadcasts, setBroadcasts] = useState([]);
  const [sourceCounts, setSourceCounts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;

    (async () => {
      const bRes = await supabase
        .from('broadcasts')
        .select('id, title, status, open_rate, click_rate, sent_count')
        .order('sent_at', { ascending: false, nullsFirst: false });

      if (!cancelled) setBroadcasts(bRes.error ? [] : (bRes.data || []));

      const cRes = await supabase
        .from('customers')
        .select('source');
      if (cancelled) return;
      if (cRes.error) {
        setSourceCounts([]);
        return;
      }
      const map = new Map();
      for (const r of cRes.data || []) {
        const k = r.source || 'UNKNOWN';
        map.set(k, (map.get(k) || 0) + 1);
      }
      setSourceCounts(Array.from(map.entries()).map(([k, v]) => ({ source: k, value: v })));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const completedBroadcasts = broadcasts.filter((b) => b.status === '발신완료');
    const totalSent = completedBroadcasts.reduce((sum, b) => sum + Number(b.sent_count || 0), 0);
    const avgOpenRate =
      completedBroadcasts.length > 0
        ? (
            completedBroadcasts.reduce((sum, b) => sum + Number(b.open_rate || 0), 0) /
            completedBroadcasts.length
          ).toFixed(1)
        : 0;
    const avgClickRate =
      completedBroadcasts.length > 0
        ? (
            completedBroadcasts.reduce((sum, b) => sum + Number(b.click_rate || 0), 0) /
            completedBroadcasts.length
          ).toFixed(1)
        : 0;

    return {
      totalSent: broadcasts.length,
      avgOpenRate,
      avgClickRate,
      totalReached: totalSent,
    };
  }, [broadcasts]);

  // Data for bar chart (open vs click rate comparison)
  const comparisonData = broadcasts
    .filter((b) => b.status === '발신완료')
    .map((b) => ({
      name: b.title.substring(0, 12),
      오픈율: Number(b.open_rate || 0),
      클릭률: Number(b.click_rate || 0),
    }));

  // UTM source (from customers.source)
  const utmData = sourceCounts.map((s) => ({
    name:
      s.source === 'QR_EVENT'
        ? 'QR 이벤트'
        : s.source === 'QR_PRODUCT'
          ? 'QR 제품'
          : s.source === 'QR_BANNER'
            ? 'QR 배너'
            : s.source === 'DIRECT'
              ? '직접 추가'
              : s.source,
    value: s.value,
  }));

  const pieColors = ['#2E75B6', '#27AE60', '#E67E22', '#8E44AD'];

  const kpiCards = [
    {
      title: '총 발신 수',
      value: stats.totalSent,
      unit: '회',
    },
    {
      title: '평균 오픈률',
      value: stats.avgOpenRate,
      unit: '%',
    },
    {
      title: '평균 클릭률',
      value: stats.avgClickRate,
      unit: '%',
    },
    {
      title: '총 도달 수',
      value: stats.totalReached.toLocaleString(),
      unit: '명',
    },
  ];

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>
          발신 효과 분석
        </h1>
        <p style={{ color: colors.sub }} className="text-sm mt-1">
          카카오톡 발신 성과 분석 및 통계
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-lg shadow-md p-6 flex flex-col"
            style={{
              backgroundColor: colors.surface,
              borderTopColor: colors.secondary,
              borderTopWidth: '3px',
            }}
          >
            <h3 style={{ color: colors.sub }} className="text-sm font-medium mb-2">
              {card.title}
            </h3>
            <p className="text-2xl font-bold" style={{ color: colors.txt }}>
              {card.value}
              <span className="text-lg ml-1" style={{ color: colors.sub }}>
                {card.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Open vs Click Rate */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            발신별 오픈률 vs 클릭률
          </h2>
          {comparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="name" stroke={colors.sub} fontSize={12} />
                <YAxis stroke={colors.sub} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="오픈율" fill={colors.secondary} name="오픈률" />
                <Bar dataKey="클릭률" fill={colors.success} name="클릭률" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8" style={{ color: colors.sub }}>
              <p>발신된 데이터가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Pie Chart: UTM Source */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            유입 경로별 분포
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={utmData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {utmData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={pieColors[idx]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats Section */}
      <div
        className="rounded-lg shadow-md p-6 mt-6"
        style={{ backgroundColor: colors.surface }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
          발신 현황 요약
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">
              완료된 발신
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.success }}>
              {broadcasts.filter((b) => b.status === '발신완료').length}회
            </p>
          </div>
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">
              예약 중인 발신
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.warning }}>
              {broadcasts.filter((b) => b.status === '예약중').length}회
            </p>
          </div>
          <div>
            <p style={{ color: colors.sub }} className="text-sm mb-2">
              최고 오픈률
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
              {Math.max(...broadcasts.map((b) => b.openRate)).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
