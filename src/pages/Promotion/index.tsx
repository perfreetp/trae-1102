import { useState } from 'react';
import { useStore } from '../../store';
import { cn, formatCurrency, getStatusName, getStatusColor, formatDate } from '../../utils';
import {
  Tag,
  Percent,
  BadgeDollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  X,
  Store,
} from 'lucide-react';

export default function Promotion() {
  const { promotions, products, updatePromotionStatus } = useStore();
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);
  const [showLabelPreview, setShowLabelPreview] = useState<string | null>(null);

  const getPromoProducts = (productIds: string[]) => {
    return products.filter((p) => productIds.includes(p.id));
  };

  const handleStartPromotion = (id: string) => {
    updatePromotionStatus(id, 'active');
  };

  const promo = selectedPromo ? promotions.find((p) => p.id === selectedPromo) : null;
  const promoProducts = promo ? getPromoProducts(promo.productIds) : [];
  const previewProduct = showLabelPreview
    ? promoProducts.find((p) => p.id === showLabelPreview)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">促销执行</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {promotions.map((p) => (
            <div
              key={p.id}
              className={cn(
                'bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer',
                selectedPromo === p.id
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-gray-100 hover:border-gray-200'
              )}
              onClick={() => setSelectedPromo(p.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-xl',
                      p.type === 'discount' ? 'bg-purple-100' : 'bg-orange-100'
                    )}
                  >
                    {p.type === 'discount' ? (
                      <Percent className="w-6 h-6 text-purple-600" />
                    ) : (
                      <BadgeDollarSign className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{p.name}</h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          getStatusColor(p.status)
                        )}
                      >
                        {getStatusName(p.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(p.startDate)} - {formatDate(p.endDate)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Tag className="w-3.5 h-3.5" />
                        {p.productIds.length} 款商品
                      </span>
                      {p.type === 'discount' && p.discountValue && (
                        <span className="text-xs font-medium text-purple-600">
                          {(p.discountValue * 10).toFixed(1)} 折优惠
                        </span>
                      )}
                      {p.type === 'specialPrice' && p.specialPrice && (
                        <span className="text-xs font-medium text-orange-600">
                          特价 {formatCurrency(p.specialPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">促销价签设置</h3>
          {promo ? (
            <>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{promo.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {promo.type === 'discount'
                    ? `全场 ${(promo.discountValue! * 10).toFixed(1)} 折`
                    : `统一特价 ${formatCurrency(promo.specialPrice!)}`}
                </p>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {promoProducts.map((product) => {
                  const finalPrice =
                    promo.type === 'discount'
                      ? product.price * (promo.discountValue || 1)
                      : promo.specialPrice || product.price;
                  return (
                    <div
                      key={product.id}
                      className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 line-through">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-xs font-medium text-red-600">
                              {formatCurrency(finalPrice)}
                            </span>
                            <span className="text-xs text-emerald-600 font-medium">
                              省{formatCurrency(product.price - finalPrice)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLabelPreview(product.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="预览价签"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => promo.status === 'pending' && handleStartPromotion(promo.id)}
                className={cn(
                  'w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  promo.status === 'active'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : promo.status === 'pending'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                )}
                disabled={promo.status === 'ended'}
              >
                {promo.status === 'active' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    促销进行中
                  </>
                ) : promo.status === 'pending' ? (
                  <>
                    <Clock className="w-4 h-4" />
                    开始执行
                  </>
                ) : (
                  '已结束'
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">请选择左侧促销活动</p>
            </div>
          )}
        </div>
      </div>

      {showLabelPreview && previewProduct && promo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">价签预览</h3>
              <button
                onClick={() => setShowLabelPreview(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gradient-to-br from-red-50 to-orange-50">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-500">连锁便利店</span>
                    {promo && (
                      <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                        促销
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-800 mb-2">
                    {previewProduct.name}
                  </p>

                  <div className="flex items-end gap-3">
                    <div>
                      <p className="text-xs text-gray-400 line-through">
                        原价: {formatCurrency(previewProduct.price)}
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {formatCurrency(
                          promo.type === 'discount'
                            ? previewProduct.price * (promo.discountValue || 1)
                            : promo.specialPrice || previewProduct.price
                        )}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-emerald-600 font-medium">
                        {promo.type === 'discount'
                          ? `${(promo.discountValue! * 10).toFixed(1)}折优惠`
                          : '特价优惠'}
                      </p>
                      <p className="text-xs text-gray-500">
                        有效期至 {formatDate(promo.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-mono">
                      {previewProduct.barcode}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                价签尺寸: 70mm × 40mm | 可直接打印使用
              </p>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowLabelPreview(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                关闭
              </button>
              <button
                onClick={() => {
                  alert('价签已发送至打印机！');
                  setShowLabelPreview(null);
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                打印价签
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
