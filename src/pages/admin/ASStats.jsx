import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  BarChart as HorizontalBarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Label,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatKstDateTime } from '../../lib/time/kst';

const getProductOrder = (name) => {
  if (!name) return 99;
  if (name.includes('바디러브')) return 1;
  if (name.includes('펌핑러브')) return 2;
  if (name.includes('매직케어')) return 3;
  if (name.includes('퍼펙트건')) return 4;
  return 99;
};

const ASStats = () => {
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

  const [asLogs, setAsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;

    (async () => {
      setLoading(true);
      const res = await supabase
        .from('as_logs')
        .select('id, ticket_no, customer_name, product, symptom, resolved, escalated, created_at, utm_source, utm_medium, actions_taken')
        .order('created_at', { ascending: false });
      if (cancelled) return;
      setAsLogs(res.error ? [] : (res.data || []));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate KPI statistics
  const stats = useMemo(() => {
    const totalQueries = asLogs.length;
    const resolvedCount = asLogs.filter((log) => log.resolved).length;
    const escalatedCount = asLogs.filter((log) => log.escalated).length;
    const autoResolveRate = totalQueries > 0 ? ((resolvedCount / totalQueries) * 100).toFixed(1) : '0.0';
    
    // 모바일 유입 비율 계산
    const mobileCount = asLogs.filter((log) => log.utm_medium === 'mobile').length;
    const mobileRatio = totalQueries > 0 ? ((mobileCount / totalQueries) * 100).toFixed(1) : '0.0';

    return {
      totalQueries,
      autoResolveRate,
      escalatedCount,
      mobileRatio,
    };
  }, [asLogs]);

  const productData = useMemo(() => {
    const map = new Map();
    for (const l of asLogs) {
      const k = l.product || '기타';
      const v = map.get(k) || { product: k, 해결: 0, 에스컬레이션: 0 };
      if (l.resolved) v.해결 += 1;
      if (l.escalated) v.에스컬레이션 += 1;
      map.set(k, v);
    }
    return Array.from(map.values()).sort((a, b) => getProductOrder(a.product) - getProductOrder(b.product));
  }, [asLogs]);

  const symptomByProductData = useMemo(() => {
    const map = new Map();
    for (const l of asLogs) {
      const p = l.product || '기타';
      const s = l.symptom || '기타';
      
      if (!map.has(p)) {
        map.set(p, { product: p, total: 0, symptoms: new Map() });
      }
      
      const productData = map.get(p);
      productData.total += 1;
      productData.symptoms.set(s, (productData.symptoms.get(s) || 0) + 1);
    }
    
    // Sort by custom order, format for charts
    return Array.from(map.values())
      .sort((a, b) => getProductOrder(a.product) - getProductOrder(b.product))
      .map(p => ({
        product: p.product,
        total: p.total,
        symptoms: Array.from(p.symptoms.entries()).map(([name, value]) => ({ name, value }))
      }));
  }, [asLogs]);

  const totalPages = Math.max(1, Math.ceil(asLogs.length / pageSize));
  const recentLogs = asLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const kpiCards = [
    {
      title: '총 문의 건수',
      value: stats.totalQueries,
      unit: '건',
    },
    {
      title: '모바일 유입',
      value: stats.mobileRatio,
      unit: '%',
    },
    {
      title: '자동해결률',
      value: stats.autoResolveRate,
      unit: '%',
    },
    {
      title: '상담원 연결 건수',
      value: stats.escalatedCount,
      unit: '건',
    },
  ];

  return (
    <div className="p-6" style={{ backgroundColor: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.txt }}>
          A/S 통계
        </h1>
        <p style={{ color: colors.sub }} className="text-sm mt-1">
          제품 A/S 및 고객 문의 통계
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-lg shadow-md p-6 flex flex-col"
            style={{
              backgroundColor: colors.surface,
              borderLeftColor: [colors.secondary, '#8E44AD', colors.success, colors.warning][idx % 4],
              borderLeftWidth: '4px',
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
      <div className="w-full mb-8">
        {/* Symptom Stats by Product - Donut Charts */}
        <div
          className="w-full rounded-lg shadow-md p-6 flex flex-col"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            제품별 증상 현황
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 flex-grow">
            {symptomByProductData.slice(0, 4).map((pData, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <h3 className="text-sm font-bold mb-6 px-4 py-1 text-center flex items-center justify-center break-keep rounded-full shadow-sm" style={{ backgroundColor: '#EDF2F7', color: colors.primary }}>
                  {pData.product}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pData.symptoms}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={65}
                      paddingAngle={2}
                      labelLine={{ stroke: colors.border, strokeWidth: 1, length1: 10, length2: 10 }}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, x, y, textAnchor, name }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const insideX = cx + radius * Math.cos(-midAngle * RADIAN);
                        const insideY = cy + radius * Math.sin(-midAngle * RADIAN);

                        // 긴 텍스트 자동 줄바꿈 로직 (띄어쓰기 기준 약 8~9자)
                        const words = name.split(' ');
                        const lines = [];
                        let currentLine = '';
                        words.forEach((word) => {
                          if ((currentLine + ' ' + word).trim().length <= 9) {
                            currentLine = (currentLine + ' ' + word).trim();
                          } else {
                            if (currentLine) lines.push(currentLine);
                            currentLine = word;
                          }
                        });
                        if (currentLine) lines.push(currentLine);

                        // 띄어쓰기 없는 아주 긴 단어 처리
                        if (lines.length === 1 && lines[0].length > 9) {
                          const str = lines[0];
                          lines[0] = str.substring(0, 9);
                          lines[1] = str.substring(9, 18) + (str.length > 18 ? '...' : '');
                        }

                        const lineHeight = 14;
                        const startY = y - ((lines.length - 1) * lineHeight) / 2;

                        return (
                          <g>
                            <text x={x} y={startY} fill={colors.sub} textAnchor={textAnchor} dominantBaseline="central" fontSize={11}>
                              {lines.map((line, i) => (
                                <tspan x={x} dy={i === 0 ? 0 : lineHeight} key={i}>
                                  {line}
                                </tspan>
                              ))}
                            </text>
                            {percent > 0.05 && (
                              <g>
                                <text x={insideX} y={insideY - 6} fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="bold">
                                  {value}건
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
                      {pData.symptoms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={[colors.secondary, colors.success, colors.warning, colors.error, '#8E44AD', '#34495E'][index % 6]} />
                      ))}
                      <Label
                        value={`${pData.total}건`}
                        position="center"
                        fill={colors.txt}
                        style={{ fontSize: '15px', fontWeight: 'bold' }}
                      />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                      }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent AS Logs Table */}
      <div
        className="rounded-lg shadow-md p-6"
        style={{ backgroundColor: colors.surface }}
      >
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
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  접수번호
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  유입경로
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  제품
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  증상
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  상태
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  조치사항
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  접수 일시
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="py-6 px-4 text-center text-sm" style={{ color: colors.sub }} colSpan={7}>
                    불러오는 중...
                  </td>
                </tr>
              )}
              {recentLogs.map((log) => {
                const date = formatKstDateTime(log.created_at);

                let statusColor = colors.warning;
                let statusText = '미해결';

                if (log.resolved) {
                  statusColor = colors.success;
                  statusText = '해결완료';
                } else if (log.escalated) {
                  statusColor = colors.error;
                  statusText = '상담원 연결';
                }

                // 유입경로 뱃지 색상
                const mediumLabel = log.utm_medium === 'web' ? '웹(PC)' : log.utm_medium === 'mobile' ? '모바일' : null;
                const sourceLabel = log.utm_source ? log.utm_source.toUpperCase() : null;
                const channelLabel = mediumLabel && sourceLabel ? `${mediumLabel} - ${sourceLabel}` : mediumLabel || log.customer_name || '수동입력';
                const channelColor = log.utm_medium === 'web' ? '#2E75B6' : log.utm_medium === 'mobile' ? '#8E44AD' : '#666666';

                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottomColor: colors.border,
                      borderBottomWidth: '1px',
                    }}
                  >
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {log.ticket_no || log.id}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${channelColor}15`,
                          color: channelColor,
                        }}
                      >
                        {channelLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.sub }}>
                      {log.product}
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.sub }}>
                      {log.symptom}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                        }}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.sub }}>
                      {log.actions_taken || '-'}
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.sub }}>
                      {date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {asLogs.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm" style={{ color: colors.sub }}>
              {currentPage} / {totalPages} 페이지 (총 {asLogs.length}건)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: '1px', color: colors.txt }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: '1px', color: colors.txt }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ASStats;
