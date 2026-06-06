import { useState } from 'react';
import { useStore } from '../../store';
import { formatCurrency, exportToExcel } from '../../utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  Download,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';

type PeriodType = 'day' | 'week' | 'month';

export default function Reports() {
  const { salesData } = useStore();
  const [period, setPeriod] = useState<PeriodType>('day');

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const totalProfit = salesData.reduce((sum, d) => sum + d.profit, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = salesData.map((d) => ({
    date: d.date.slice(5),
    销售额: d.revenue,
    毛利: d.profit,
    订单数: d.orders,
  }));

  const avgOrderValueData = salesData.map((d) => ({
    date: d.date.slice(5),
    客单价: d.avgOrderValue,
  }));

  const handleExport = () => {
    const exportData = salesData.map((d) => ({
      日期: d.date,
      销售额: d.revenue,
      订单数: d.orders,
      客单价: d.avgOrderValue,
      毛利: d.profit,
      毛利率: ((d.profit / d.revenue) * 100).toFixed(2) + '%',
    }));
    exportToExcel(exportData, `门店经营报表_${new Date().toISOString().split('T')[0]}`);
  };

  const summaryCards = [
    {
      label: '累计销售额',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '累计订单数',
      value: totalOrders.toString(),
      icon: BarChart3,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: '平均客单价',
      value: formatCurrency(avgOrderValue),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: '累计毛利',
      value: formatCurrency(totalProfit),
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-800">经营报表</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['day', 'week', 'month'] as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  period === p
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {p === 'day' ? '日' : p === 'week' ? '周' : '月'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            导出日报
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            销售趋势
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="销售额"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="毛利"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            订单量趋势
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="订单数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            客单价分析
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={avgOrderValueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [`¥${value.toFixed(2)}`, '客单价']}
                />
                <Line
                  type="monotone"
                  dataKey="客单价"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f59e0b' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            日报明细
          </h3>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            近14天数据
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">日期</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">销售额</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">订单数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">客单价</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">毛利</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">毛利率</th>
              </tr>
            </thead>
            <tbody>
              {[...salesData].reverse().map((data, index) => (
                <tr key={index} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-800">{data.date}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-800">
                    {formatCurrency(data.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{data.orders}</td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatCurrency(data.avgOrderValue)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-600">
                    {formatCurrency(data.profit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-600 font-medium">
                      {((data.profit / data.revenue) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
