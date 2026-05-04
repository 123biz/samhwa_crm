import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, Label } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatKstDateTime } from '../../lib/time/kst';

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
  const [regionDistribution, setRegionDistribution] = useState([]);
  const [asLogs, setAsLogs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;

    (async () => {
      // 고객 수
      const cRes = await supabase.from('customers').select('created_at, region', { count: 'exact' });
      if (cancelled) return;
      const customers = cRes.error ? [] : (cRes.data || []);
      const totalCustomers = cRes.count || customers.length;

      // 거주 지역 분포
      const regionColors = {
        '서울/경기': '#2E75B6', '강원': '#27AE60', '충북': '#E67E22',
        '충남': '#E74C3C', '경북': '#8E44AD', '경남': '#16A085',
        '전북': '#F39C12', '전남': '#2980B9', '제주': '#1ABC9C',
      };
      const regionMap = new Map();
      for (const r of customers) {
        const region = r.region || '미입력';
        regionMap.set(region, (regionMap.get(region) || 0) + 1);
      }
      const regionDist = Array.from(regionMap.entries())
        .map(([region, value]) => ({ region, value, color: regionColors[region] || '#AAAAAA' }))
        .sort((a, b) => b.value - a.value);
      if (!cancelled) setRegionDistribution(regionDist);

      // QR 스캔 수 + source 분포
      const qRes = await supabase.from('qr_logs').select('source', { count: 'exact' });
      const totalQRScans = qRes.count || (qRes.error ? 0 : (qRes.data || []).length);

      // AS 로그(최근 10개)
      const asRes = await supabase
        .from('as_logs')
        .select('id, ticket_no, customer_name, product, symptom, resolved, escalated, actions_taken, utm_medium, utm_source, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (!cancelled) setAsLogs(asRes.error ? [] : (asRes.data || []));

      // QR 스캔 source 분포
      const srcMap = new Map();
      for (const r of (qRes.data || [])) {
        const s = r.source || 'DIRECT';
        srcMap.set(s, (srcMap.get(s) || 0) + 1);
      }
      const dist = Array.from(srcMap.entries()).map(([source, value]) => ({
        source:
          source === 'QR_EVENT_KINTEX_2026' ? '킨텍스 건강박람회'
            : source === 'QR_EVENT_BUSAN_2026' ? '부산 메디카 엑스포'
            : source.startsWith('QR_EVENT') ? 'QR 이벤트'
            : source.startsWith('QR_PRODUCT') ? 'QR 제품'
            : source.startsWith('QR_BANNER') ? 'QR 배너'
            : source === 'DIRECT' ? '직접'
            : source,
        value,
        color:
          source === 'QR_EVENT_KINTEX_2026' || source === 'QR_EVENT_BUSAN_2026' || source.startsWith('QR_EVENT')
            ? colors.secondary
            : source.startsWith('QR_PRODUCT')
              ? colors.success
              : source.startsWith('QR_BANNER')
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

        {/* Donut Chart - Region Distribution */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            등록 고객 거주 지역 분포
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionDistribution}
                dataKey="value"
                nameKey="region"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                labelLine={{ stroke: colors.border, strokeWidth: 1, length1: 10, length2: 10 }}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, x, y, textAnchor, name }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const insideX = cx + radius * Math.cos(-midAngle * RADIAN);
                  const insideY = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <g>
                      <text x={x} y={y} fill={colors.sub} textAnchor={textAnchor} dominantBaseline="central" fontSize={11}>
                        {name}
                      </text>
                      {percent > 0.03 && (
                        <g>
                          <text x={insideX} y={insideY - 6} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
                            {value}명
                          </text>
                          <text x={insideX} y={insideY + 6} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="bold">
                            ({(percent * 100).toFixed(0)}%)
                          </text>
                        </g>
                      )}
                    </g>
                  );
                }}
              >
                {regionDistribution.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
                <Label
                  value={`${kpi.totalCustomers}명`}
                  position="center"
                  fill={colors.txt}
                  style={{ fontSize: '20px', fontWeight: 'bold' }}
                />
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}명`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 최근 A/S 접수 현황 */}
      <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: colors.surface }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
          최근 A/S 접수 현황
        </h2>
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
                {['접수번호', '유입경로', '제품', '증상', '상태', '조치사항', '접수 일시'].map((h) => (
                  <th key={h} className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentAsLogs.length === 0 ? (
                <tr>
                  <td className="py-6 px-4 text-center text-sm" style={{ color: colors.sub }} colSpan={7}>
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                recentAsLogs.map((log) => {
                  const date = formatKstDateTime(log.created_at);
                  const statusColor = log.resolved ? colors.success : log.escalated ? colors.error : colors.warning;
                  const statusText = log.resolved ? '해결완료' : log.escalated ? '상담원 연결' : '미해결';
                  const mediumLabel = log.utm_medium === 'web' ? '웹(PC)' : log.utm_medium === 'mobile' ? '모바일' : null;
                  const sourceLabel = log.utm_source ? log.utm_source.toUpperCase() : null;
                  const channelLabel = mediumLabel && sourceLabel ? `${mediumLabel} - ${sourceLabel}` : mediumLabel || '수동입력';
                  const channelColor = log.utm_medium === 'web' ? '#2E75B6' : log.utm_medium === 'mobile' ? '#8E44AD' : '#666666';
                  return (
                    <tr key={log.id} style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                      <td className="py-3 px-4" style={{ color: colors.txt }}>{log.ticket_no || log.id}</td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${channelColor}15`, color: channelColor }}
                        >
                          {channelLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.sub }}>{log.product}</td>
                      <td className="py-3 px-4" style={{ color: colors.sub }}>{log.symptom}</td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.sub }}>{log.actions_taken || '-'}</td>
                      <td className="py-3 px-4" style={{ color: colors.sub }}>{date}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
