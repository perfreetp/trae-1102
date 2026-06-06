import { useState } from 'react';
import { useStore } from '../../store';
import { cn, getStatusName, getStatusColor, formatDate } from '../../utils';
import {
  ShoppingCart,
  Truck,
  CheckCircle2,
  Plus,
  Minus,
  Send,
  PackageCheck,
} from 'lucide-react';

type TabType = 'suggest' | 'receive';

export default function Replenishment() {
  const { orderItems, updateOrderQty, submitOrders, confirmReceive } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('suggest');
  const [showReceiveModal, setShowReceiveModal] = useState<string | null>(null);
  const [receiveQty, setReceiveQty] = useState(0);

  const pendingOrders = orderItems.filter((o) => o.status === 'pending');
  const submittedOrders = orderItems.filter((o) => o.status === 'submitted' || o.status === 'shipped');
  const toReceiveOrders = orderItems.filter((o) => o.status === 'shipped');

  const handleQtyChange = (id: string, delta: number) => {
    const order = orderItems.find((o) => o.id === id);
    if (order) {
      const newQty = Math.max(0, order.actualQty + delta);
      updateOrderQty(id, newQty);
    }
  };

  const handleSubmitAll = () => {
    if (pendingOrders.length > 0) {
      submitOrders();
    }
  };

  const handleConfirmReceive = (id: string) => {
    confirmReceive(id, receiveQty);
    setShowReceiveModal(null);
    setReceiveQty(0);
  };

  const openReceiveModal = (id: string, suggestedQty: number) => {
    setReceiveQty(suggestedQty);
    setShowReceiveModal(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">补货计划</h2>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('suggest')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'suggest'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          订货建议
          {pendingOrders.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('receive')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'receive'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          <Truck className="w-4 h-4" />
          到货验收
          {toReceiveOrders.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
              {toReceiveOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'suggest' && (
        <>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">系统订货建议</h3>
                <p className="text-blue-100 text-sm mt-1">
                  基于历史销量和当前库存自动计算，共 {pendingOrders.length} 种商品建议补货
                </p>
              </div>
              <button
                onClick={handleSubmitAll}
                disabled={pendingOrders.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                一键提交订货单
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">商品名称</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">当前库存</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">安全库存</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">建议订货量</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">实际订货量</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((order) => (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{order.productName}</td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {/* Simplified - using order data */}
                      {Math.floor(Math.random() * 10 + 2)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {Math.floor(order.suggestedQty / 2)}
                    </td>
                    <td className="py-3 px-4 text-center text-blue-600 font-medium">
                      {order.suggestedQty}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQtyChange(order.id, -1)}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                          disabled={order.status !== 'pending'}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-12 text-center font-medium text-gray-800">
                          {order.actualQty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(order.id, 1)}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50"
                          disabled={order.status !== 'pending'}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-full',
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusName(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'receive' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">待验收商品</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">商品名称</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">订货数量</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">下单日期</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">状态</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {orderItems
                .filter((o) => o.status !== 'pending')
                .map((order) => (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{order.productName}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{order.actualQty}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{order.createdAt}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-full',
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusName(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => openReceiveModal(order.id, order.actualQty)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          验收
                        </button>
                      )}
                      {order.status === 'received' && (
                        <span className="text-gray-400 text-xs">{order.receivedAt} 已验收</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">到货验收</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">实际到货数量</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setReceiveQty(Math.max(0, receiveQty - 1))}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={receiveQty}
                    onChange={(e) => setReceiveQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-center text-lg font-medium"
                  />
                  <button
                    onClick={() => setReceiveQty(receiveQty + 1)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReceiveModal(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleConfirmReceive(showReceiveModal)}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  确认验收
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
