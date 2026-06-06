import { useState } from 'react';
import { useStore } from '../../store';
import { cn, formatCurrency } from '../../utils';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Package,
  MapPin,
  Upload,
  Image,
} from 'lucide-react';

export default function Products() {
  const { products, shelfSlots } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'shelf'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    const matchCategory = selectedCategory === '全部' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const rows = Array.from(new Set(shelfSlots.map((s) => s.row))).sort();
  const cols = Array.from(new Set(shelfSlots.map((s) => s.col))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-800">商品管理</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('shelf')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'shelf' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索商品名称或条码..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Upload className="w-4 h-4" />
          上传陈列照
        </button>
      </div>

      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">商品信息</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">分类</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">条码</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">售价</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">库存</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">货架位置</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600 font-mono text-xs">
                    {product.barcode}
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-gray-800">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'font-medium',
                        product.stock < product.safeStock ? 'text-red-600' : 'text-gray-800'
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {product.shelfPosition}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'shelf' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            货架布局 - A区
          </h3>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="flex gap-2 mb-2 pl-16">
                {cols.map((col) => (
                  <div key={col} className="flex-1 min-w-[100px] text-center text-xs text-gray-500">
                    第{col}层
                  </div>
                ))}
              </div>
              {rows.map((row) => (
                <div key={row} className="flex gap-2 mb-2 items-center">
                  <div className="w-14 text-sm text-gray-500">货架{row}</div>
                  {cols.map((col) => {
                    const slot = shelfSlots.find((s) => s.row === row && s.col === col);
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={cn(
                          'flex-1 min-w-[100px] h-20 border-2 border-dashed rounded-lg p-2 flex flex-col justify-center transition-all cursor-pointer',
                          slot?.productId
                            ? 'border-blue-200 bg-blue-50 hover:border-blue-400'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        )}
                      >
                        {slot?.productName ? (
                          <>
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {slot.productName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{slot.id}</p>
                          </>
                        ) : (
                          <div className="text-center">
                            <Image className="w-5 h-5 text-gray-300 mx-auto" />
                            <p className="text-xs text-gray-400 mt-1">空位</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            提示：点击货架格可以调整商品陈列位置
          </p>
        </div>
      )}
    </div>
  );
}
