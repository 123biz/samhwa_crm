import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { dashboardKPI, friendsTrend, sourceDistribution, asLogs } from '../../data/mockData';

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

  const kpiCards = [
    {
      title: '카카오 친구 수',
      value: dashboardKPI.totalFriends.toLocaleString(),
      growth: dashboardKPI.friendsGrowth,
      borderColor: colors.secondary,
    },
    {
      title: '등록 고객 수',
      value: dashboardKPI.totalCustomers.toLocaleString(),
      growth: dashboardKPI.customersGrowth,
      borderColor: colors.success,
    },
    {
      title: '챗봇 자동응답률',
      value: `${dashboardKPI.chatbotAutoRate}%`,
      growth: dashboardKPI.chatbotGrowth,
      borderColor: colors.warning,
    },
    {
      title: 'QR 스캔 수',
      value: dashboardKPI.totalQRScans.toLocaleString(),
      growth: dashboardKPI.qrGrowth,
      borderColor: '#16A085',
    },
  ];

  const recentAsLogs = asLogs.slice(0, 5);

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
            <h3 style={{ color: colors.sub }} className="text-sm font-medium mb-2">
              {card.title}
            </h3>
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
            월별 친구 증가 트렌드
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
                dataKey="friends"
                stroke={colors.secondary}
                strokeWidth={2}
                name="카카오 친구"
              />
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

      {/* Recent AS Logs Table */}
      <div
        className="rounded-lg shadow-md p-6"
        style={{ backgroundColor: colors.surface }}
      >
        <h2 className="text-lg font-bold mb-4" style={{ color: colors.txt }}>
          최근 AS 접수
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: colors.border, borderBottomWidth: '1px' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  AS ID
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  고객명
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  제품명
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  증상
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  상태
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: colors.txt }}>
                  접수일시
                </th>
              </tr>
            </thead>
            <tbody>
              {recentAsLogs.map((log) => {
                const date = new Date(log.createdAt).toLocaleDateString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const statusColor = log.resolved ? colors.success : log.escalated ? colors.error : colors.warning;
                const statusText = log.resolved ? '해결완료' : log.escalated ? '대기' : '미해결';

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
                    <td className="py-3 px-4" style={{ color: colors.txt }}>
                      {log.product}
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.sub }}>
                      {log.symptom}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
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

export default Dashboard;
