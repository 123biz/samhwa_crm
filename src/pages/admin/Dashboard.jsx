import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Dashboard = () => {
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

  const [kpi, setKpi] = useState({
    totalAs: 0,
    totalCustomers: 0,
    customersGrowth: 0,
    chatbotAutoRate: 0,
    chatbotGrowth: 0,
    totalQRScans: 0,
    qrGrowth: 0,
  });
  const [friendsTrend, setFriendsTrend] = useState([]);
  const [sourceDistribution, setSourceDistribution] = useState([]);
  const [asLogs, setAsLogs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;

    (async () => {
      // 고객 수
      const cRes = await supabase.from('customers').select('created_at, source', { count: 'exact' });
      if (cancelled) return;
      const customers = cRes.error ? [] : (cRes.data || []);
      const totalCustomers = cRes.count || customers.length;

      // QR 스캔 수
      const qRes = await supabase.from('qr_logs').select('created_at', { count: 'exact' });
      const totalQRScans = qRes.count || (qRes.error ? 0 : (qRes.data || []).length);

      // AS 로그(최근 5개)
      const asRes = await supabase
        .from('as_logs')
        .select('id, ticket_no, customer_name, product, symptom, resolved, escalated, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!cancelled) setAsLogs(asRes.error ? [] : (asRes.data || []));

      // source 분포
      const srcMap = new Map();
      for (const r of customers) {
        const s = r.source || 'UNKNOWN';
        srcMap.set(s, (srcMap.get(s) || 0) + 1);
      }
      const dist = Array.from(srcMap.entries()).map(([source, value]) => ({
        source:
          source === 'QR_EVENT'
            ? 'QR 이벤트'
            : source === 'QR_PRODUCT'
              ? 'QR 제품'
              : source === 'QR_BANNER'
                ? 'QR 배너'
                : source === 'DIRECT'
                  ? '직접 추가'
                  : source,
        value,
        color:
          source === 'QR_EVENT'
            ? colors.secondary
            : source === 'QR_PRODUCT'
              ? colors.success
              : source === 'QR_BANNER'
                ? colors.warning
                : '#8E44AD',
      }));
      if (!cancelled) setSourceDistribution(dist);

      // 월별 트렌드(최근 6개월)
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ y: d.getFullYear(), m: d.getMonth() });
      }
      const regMap = new Map(months.map(({ y, m }) => [`${y}-${m}`, 0]));
      for (const r of customers) {
        if (!r.created_at) continue;
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!regMap.has(key)) continue;
        regMap.set(key, (regMap.get(key) || 0) + 1);
      }

      const trend = months.map(({ y, m }) => ({
        month: `${m + 1}월`,
        registrations: regMap.get(`${y}-${m}`) || 0,
      }));
      if (!cancelled) setFriendsTrend(trend);

      // 챗봇 자동응답률(AS 로그로 대체: resolved 비율)
      const asAllRes = await supabase.from('as_logs').select('resolved', { count: 'exact' }).limit(5000);
      const asAll = asAllRes.error ? [] : (asAllRes.data || []);
      const totalAs = asAllRes.count || asAll.length;
      const resolvedCount = asAll.filter((x) => x.resolved).length;
      const chatbotAutoRate = totalAs > 0 ? Number(((resolvedCount / totalAs) * 100).toFixed(1)) : 0;

      if (!cancelled) {
        setKpi((prev) => ({
          ...prev,
          totalCustomers,
          totalQRScans,
          chatbotAutoRate,
          totalAs,
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [colors.secondary, colors.success, colors.warning]);

  const kpiCards = useMemo(() => ([
    {
      title: 'QR 스캔 수',
      value: Number(kpi.totalQRScans || 0).toLocaleString(),
      growth: kpi.qrGrowth || 0,
      borderColor: '#16A085',
    },
    {
      title: '등록 고객 수',
      value: Number(kpi.totalCustomers || 0).toLocaleString(),
      growth: kpi.customersGrowth || 0,
      borderColor: colors.success,
    },
    {
      title: 'AS 접수 고객 수',
      value: Number(kpi.totalAs || 0).toLocaleString(),
      growth: 0,
      borderColor: colors.secondary,
    },
    {
      title: '챗봇 자동응답률',
      value: `${kpi.chatbotAutoRate || 0}%`,
      growth: kpi.chatbotGrowth || 0,
      borderColor: colors.warning,
    },
  ]), [kpi, colors.secondary, colors.success, colors.warning]);

  const recentAsLogs = asLogs;

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>대시보드</h1>
        <p style={{ color: colors.sub }} className="text-sm mt-1">삼화메디칼 CRM 시스템</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-lg shadow-md p-6 flex flex-col"
            style={{
              backgroundColor: colors.surface,
              borderLeft: `4px solid ${card.borderColor}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ color: colors.sub }} className="text-sm font-medium">
                {card.title}
              </h3>
            </div>
            <p className="text-2xl font-bold" style={{ color: colors.txt }}>
              {card.value}
            </p>
            <div className="mt-3 flex items-center gap-1">
              <TrendingUp size={16} style={{ color: colors.success }} />
              <span style={{ color: colors.success }} className="text-sm font-semibold">
                +{card.growth}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            월별 신규 등록 트렌드
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={friendsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="month" stroke={colors.sub} fontSize={12} />
              <YAxis stroke={colors.sub} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke={colors.success}
                strokeWidth={2}
                name="신규 등록"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Source Distribution */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            유입 경로별 분포
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis type="number" stroke={colors.sub} fontSize={12} />
              <YAxis dataKey="source" type="category" stroke={colors.sub} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" name="수" fill={colors.secondary}>
                {sourceDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
