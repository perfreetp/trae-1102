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
} from 'lucide-react';

export default function Promotion() {
  const { promotions, products } = useStore();
  const [selectedPromo, setSelectedPromo] = useState<string | null>(null);

  const getPromoProducts = (productIds: string[]) => {
    return products.filter((p) => productIds.includes(p.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">促销执行</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={cn(
                'bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer',
                selectedPromo === promo.id
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-gray-100 hover:border-gray-200'
              )}
              onClick={() => setSelectedPromo(promo.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-xl',
                      promo.type === 'discount' ? 'bg-purple-100' : 'bg-orange-100'
                    )}
                  >
                    {promo.type === 'discount' ? (
                      <Percent className="w-6 h-6 text-purple-600" />
                    ) : (
                      <BadgeDollarSign className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{promo.name}</h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          getStatusColor(promo.status)
                        )}
                      >
                        {getStatusName(promo.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{promo.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Tag className="w-3.5 h-3.5" />
                        {promo.productIds.length} 款商品
                      </span>
                      {promo.type === 'discount' && promo.discountValue && (
                        <span className="text-xs font-medium text-purple-600">
                          {(promo.discountValue * 10).toFixed(1)} 折优惠
                        </span>
                      )}
                      {promo.type === 'specialPrice' && promo.specialPrice && (
                        <span className="text-xs font-medium text-orange-600">
                          特价 {formatCurrency(promo.specialPrice)}
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
          {selectedPromo ? (
            <>
              {(() => {
                const promo = promotions.find((p) => p.id === selectedPromo)!;
                const promoProducts = getPromoProducts(promo.productIds);
                return (
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
                                </div>
                              </div>
                              <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      className={cn(
                        'w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                        promo.status === 'active'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : promo.status === 'pending'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
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
                );
              })()}
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">请选择左侧促销活动</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
