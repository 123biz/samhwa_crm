import React, { useMemo } from 'react';
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
} from 'recharts';
import { asLogs, asProductStats, asSymptomStats } from '../../data/mockData';

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

  // Calculate KPI statistics
  const stats = useMemo(() => {
    const totalQueries = asLogs.length;
    const resolvedCount = asLogs.filter((log) => log.resolved).length;
    const escalatedCount = asLogs.filter((log) => log.escalated).length;
    const autoResolveRate = ((resolvedCount / totalQueries) * 100).toFixed(1);

    return {
      totalQueries,
      autoResolveRate,
      escalatedCount,
    };
  }, []);

  // Prepare data for product bar chart (stacked)
  const productData = asProductStats.map((item) => ({
    product: item.product,
    해결: item.resolved,
    에스컬레이션: item.escalated,
  }));

  // Prepare data for symptom horizontal bar chart
  const symptomData = asSymptomStats.map((item) => ({
    symptom: item.symptom.substring(0, 10),
    count: item.count,
  }));

  // Recent AS logs
  const recentLogs = asLogs.slice(0, 10);

  const kpiCards = [
    {
      title: '총 문의 건수',
      value: stats.totalQueries,
      unit: '건',
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
          AS 통계
        </h1>
        <p style={{ color: colors.sub }} className="text-sm mt-1">
          제품 AS 및 고객 문의 통계
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-lg shadow-md p-6 flex flex-col"
            style={{
              backgroundColor: colors.surface,
              borderLeftColor: [colors.secondary, colors.success, colors.warning][idx],
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Product Stats - Stacked Bar Chart */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            제품별 AS 현황
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="product" stroke={colors.sub} fontSize={12} />
              <YAxis stroke={colors.sub} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="해결" stackId="a" fill={colors.success} />
              <Bar dataKey="에스컬레이션" stackId="a" fill={colors.error} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Symptom Stats - Horizontal Bar Chart */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: colors.surface }}
        >
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
            증상별 문의 건수
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <HorizontalBarChart data={symptomData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis type="number" stroke={colors.sub} fontSize={12} />
              <YAxis dataKey="symptom" type="category" stroke={colors.sub} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill={colors.secondary}>
                {symptomData.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={[colors.secondary, colors.success, colors.warning, colors.error, '#8E44AD'][
                      idx % 5
                    ]}
                  />
                ))}
              </Bar>
            </HorizontalBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent AS Logs Table */}
      <div
        className="rounded-lg shadow-md p-6"
        style={{ backgroundColor: colors.surface }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
          최근 AS 접수 현황
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
                  AS ID
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  고객명
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
                  접수 일시
                </th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => {
                const date = new Date(log.createdAt).toLocaleDateString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                let statusColor = colors.warning;
                let statusText = '미해결';

                if (log.resolved) {
                  statusColor = colors.success;
                  statusText = '해결완료';
                } else if (log.escalated) {
                  statusColor = colors.error;
                  statusText = '상담원 연결';
                }

                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottomColor: colors.border,
                      borderBottomWidth: '1px',
                    }}
                  >
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {log.id}
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {log.customerName}
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
                      {date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ASStats;
