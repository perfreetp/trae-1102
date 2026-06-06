import { useState } from 'react';
import { useStore } from '../../store';
import { cn, getStatusName, getStatusColor } from '../../utils';
import {
  ShoppingCart,
  Truck,
  Plus,
  Minus,
  Send,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

type TabType = 'suggest' | 'receive';

export default function Replenishment() {
  const { products, orderItems, updateOrderQty, submitOrders, confirmReceive } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('suggest');
  const [showReceiveModal, setShowReceiveModal] = useState<string | null>(null);
  const [receiveQty, setReceiveQty] = useState(0);
  const [receiveRemark, setReceiveRemark] = useState('');

  const pendingOrders = orderItems.filter((o) => o.status === 'pending');

  const getProduct = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

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
    confirmReceive(id, receiveQty, receiveRemark);
    setShowReceiveModal(null);
    setReceiveQty(0);
    setReceiveRemark('');
  };

  const openReceiveModal = (id: string, orderedQty: number) => {
    setReceiveQty(orderedQty);
    setReceiveRemark('');
    setShowReceiveModal(id);
  };

  const currentOrder = showReceiveModal
    ? orderItems.find((o) => o.id === showReceiveModal)
    : null;

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
          {orderItems.filter((o) => o.status === 'shipped').length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
              {orderItems.filter((o) => o.status === 'shipped').length}
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
                {orderItems.map((order) => {
                  const product = getProduct(order.productId);
                  return (
                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {order.productName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            'font-medium',
                            product && product.stock < product.safeStock
                              ? 'text-red-600'
                              : 'text-gray-800'
                          )}
                        >
                          {product?.stock || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {product?.safeStock || order.suggestedQty}
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
                  );
                })}
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
                <th className="text-center py-3 px-4 font-medium text-gray-600">已验数量</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">差异</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">下单日期</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">状态</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {orderItems
                .filter((o) => o.status !== 'pending')
                .map((order) => {
                  const diff =
                    order.receivedQty !== undefined ? order.receivedQty - order.actualQty : null;
                  return (
                    <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {order.productName}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">{order.actualQty}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-emerald-600">
                          {order.receivedQty !== undefined ? order.receivedQty : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {diff !== null ? (
                          <span
                            className={cn(
                              'font-medium',
                              diff === 0
                                ? 'text-emerald-600'
                                : diff < 0
                                ? 'text-red-600'
                                : 'text-orange-600'
                            )}
                          >
                            {diff > 0 ? '+' : ''}
                            {diff}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
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
                          <div className="text-xs">
                            <p className="text-gray-500">{order.receivedAt} 已验收</p>
                            {order.remark && (
                              <p className="text-gray-400 truncate max-w-[120px]">
                                备注: {order.remark}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {showReceiveModal && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">到货验收</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{currentOrder.productName}</p>
                <p className="text-xs text-gray-500 mt-1">订货数量: {currentOrder.actualQty}</p>
              </div>

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
                    onChange={(e) =>
                      setReceiveQty(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-center text-lg font-medium"
                  />
                  <button
                    onClick={() => setReceiveQty(receiveQty + 1)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {receiveQty !== currentOrder.actualQty && (
                  <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    与订货数量差异: {receiveQty - currentOrder.actualQty > 0 ? '+' : ''}
                    {receiveQty - currentOrder.actualQty}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">差异备注（可选）</label>
                <textarea
                  rows={3}
                  value={receiveRemark}
                  onChange={(e) => setReceiveRemark(e.target.value)}
                  placeholder="如有差异，请说明原因..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReceiveModal(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleConfirmReceive(currentOrder.id)}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
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
