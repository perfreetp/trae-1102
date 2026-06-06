import { useStore } from '../../store';
import { formatCurrency, getDaysUntilExpiry, getExpiryLevel, cn, getStatusName, getStatusColor } from '../../utils';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Wallet,
  AlertTriangle,
  Clock,
  Trophy,
  ChevronRight,
  Package,
  CheckCircle,
  ClipboardList,
  Tag,
} from 'lucide-react';

export default function Dashboard() {
  const { products, salesData, todoItems } = useStore();

  const todayData = salesData[salesData.length - 1];
  const yesterdayData = salesData[salesData.length - 2];

  const growthRate = (field: 'revenue' | 'orders' | 'avgOrderValue' | 'profit') => {
    if (!yesterdayData) return 0;
    return ((todayData[field] - yesterdayData[field]) / yesterdayData[field]) * 100;
  };

  const topProducts = [...products]
    .sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0))
    .slice(0, 10);

  const lowStockProducts = products.filter((p) => p.stock < p.safeStock);

  const expiringProducts = products
    .filter((p) => p.expiryDate)
    .map((p) => ({
      ...p,
      daysLeft: getDaysUntilExpiry(p.expiryDate!),
    }))
    .filter((p) => p.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const statCards = [
    {
      label: '今日销售额',
      value: formatCurrency(todayData.revenue),
      icon: TrendingUp,
      growth: growthRate('revenue'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: '订单数',
      value: todayData.orders.toString(),
      icon: ShoppingBag,
      growth: growthRate('orders'),
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: '客单价',
      value: formatCurrency(todayData.avgOrderValue),
      icon: Users,
      growth: growthRate('avgOrderValue'),
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: '毛利',
      value: formatCurrency(todayData.profit),
      icon: Wallet,
      growth: growthRate('profit'),
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const todoIcons: Record<string, typeof Package> = {
    order: Package,
    receipt: CheckCircle,
    inspection: ClipboardList,
    promotion: Tag,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={cn(
                      'text-xs font-medium',
                      card.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {card.growth >= 0 ? '↑' : '↓'} {Math.abs(card.growth).toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-400">较昨日</span>
                </div>
              </div>
              <div className={cn('p-3 rounded-xl bg-gradient-to-br', card.color)}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              销售排行榜
            </h3>
            <span className="text-sm text-gray-500">Top 10</span>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => {
              const maxVolume = topProducts[0]?.salesVolume || 1;
              const percentage = ((product.salesVolume || 0) / maxVolume) * 100;
              return (
                <div key={product.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      index === 0 && 'bg-yellow-100 text-yellow-700',
                      index === 1 && 'bg-gray-100 text-gray-600',
                      index === 2 && 'bg-orange-100 text-orange-700',
                      index > 2 && 'bg-gray-50 text-gray-500'
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {product.name}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">
                        {product.salesVolume} 件
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">待办事项</h3>
          <div className="space-y-3">
            {todoItems.map((item) => {
              const Icon = todoIcons[item.type];
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        item.priority === 'high' ? 'bg-red-100' : 'bg-orange-100'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4',
                          item.priority === 'high' ? 'text-red-600' : 'text-orange-600'
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.count} 项待处理</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-800">库存预警</h3>
            <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {lowStockProducts.length} 种商品
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-medium text-gray-500">商品名称</th>
                  <th className="text-center py-2 font-medium text-gray-500">当前库存</th>
                  <th className="text-center py-2 font-medium text-gray-500">安全库存</th>
                  <th className="text-center py-2 font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 text-gray-800">{product.name}</td>
                    <td className="py-2.5 text-center">
                      <span className="text-red-600 font-medium">{product.stock}</span>
                    </td>
                    <td className="py-2.5 text-center text-gray-600">{product.safeStock}</td>
                    <td className="py-2.5 text-center">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                        库存不足
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-800">临期提醒</h3>
            <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              {expiringProducts.length} 种商品
            </span>
          </div>
          <div className="space-y-3">
            {expiringProducts.slice(0, 5).map((product) => {
              const level = getExpiryLevel(product.daysLeft);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      到期日：{product.expiryDate}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      level === 'critical' && 'bg-red-100 text-red-700',
                      level === 'warning' && 'bg-orange-100 text-orange-700',
                      level === 'normal' && 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    剩余 {product.daysLeft} 天
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
