import { useState, useRef } from 'react';
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
  X,
  Check,
  Trash2,
} from 'lucide-react';

type ViewMode = 'list' | 'shelf' | 'photos';
type PhotoFilter = 'all' | 'byProduct' | 'byShelf';

export default function Products() {
  const {
    products,
    shelfSlots,
    updateShelfSlot,
    displayPhotos,
    addDisplayPhoto,
  } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('all');
  const [filterProductId, setFilterProductId] = useState<string>('');
  const [filterShelf, setFilterShelf] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'product' | 'shelf'>('product');
  const [uploadTargetId, setUploadTargetId] = useState<string>('');

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

  const availableProducts = products.filter(
    (p) => !shelfSlots.some((s) => s.productId === p.id && s.id !== selectedSlot)
  );

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const handleAssignProduct = (productId: string | null) => {
    if (selectedSlot) {
      updateShelfSlot(selectedSlot, productId);
      setSelectedSlot(null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        addDisplayPhoto({
          url,
          productId: uploadType === 'product' ? uploadTargetId : undefined,
          shelfSlotId: uploadType === 'shelf' ? uploadTargetId : undefined,
          shelfPosition:
            uploadType === 'shelf'
              ? shelfSlots.find((s) => s.id === uploadTargetId)
                ? `A${shelfSlots.find((s) => s.id === uploadTargetId)?.row}-${shelfSlots.find((s) => s.id === uploadTargetId)?.col}`
                : undefined
              : undefined,
        });
        setUploadTargetId('');
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPhotos = displayPhotos.filter((p) => {
    if (photoFilter === 'byProduct' && filterProductId) {
      return p.productId === filterProductId;
    }
    if (photoFilter === 'byShelf' && filterShelf) {
      return p.shelfSlotId === filterShelf;
    }
    return true;
  });

  const selectedSlotData = selectedSlot ? shelfSlots.find((s) => s.id === selectedSlot) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-800">商品管理</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors flex items-center gap-1.5 text-sm',
                viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <List className="w-4 h-4" />
              列表
            </button>
            <button
              onClick={() => setViewMode('shelf')}
              className={cn(
                'p-2 rounded-md transition-colors flex items-center gap-1.5 text-sm',
                viewMode === 'shelf' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
              货架
            </button>
            <button
              onClick={() => setViewMode('photos')}
              className={cn(
                'p-2 rounded-md transition-colors flex items-center gap-1.5 text-sm',
                viewMode === 'photos' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Image className="w-4 h-4" />
              陈列照
              {displayPhotos.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 rounded-full">
                  {displayPhotos.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {viewMode !== 'photos' && (
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
        </div>
      )}

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
                <th className="text-center py-3 px-4 font-medium text-gray-600">安全库存</th>
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
                  <td className="py-3 px-4 text-center text-gray-600">{product.safeStock}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3.5 h-3.5" />
                      {product.shelfPosition || '未设置'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'shelf' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              货架布局 - A区
              {selectedSlot && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
                  已选中货架 {selectedSlotData?.row}-{selectedSlotData?.col}
                </span>
              )}
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
                      const isSelected = slot?.id === selectedSlot;
                      return (
                        <div
                          key={`${row}-${col}`}
                          onClick={() => slot && handleSlotClick(slot.id)}
                          className={cn(
                            'flex-1 min-w-[100px] h-20 border-2 rounded-lg p-2 flex flex-col justify-center transition-all cursor-pointer',
                            slot?.productId
                              ? isSelected
                                ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-200'
                                : 'border-blue-200 bg-blue-50 hover:border-blue-400'
                              : isSelected
                              ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
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
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-medium text-gray-800 mb-4">
              {selectedSlot ? '调整货架商品' : '选择商品列表'}
            </h3>
            {selectedSlot ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">当前货架位</p>
                  <p className="font-medium text-gray-800">
                    A{selectedSlotData?.row}-{selectedSlotData?.col}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSlotData?.productName || '（空位）'}
                  </p>
                </div>
                {selectedSlotData?.productId && (
                  <button
                    onClick={() => handleAssignProduct(null)}
                    className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空此位置
                  </button>
                )}
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-2">选择商品放置此处：</p>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {availableProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleAssignProduct(product.id)}
                        className={cn(
                          'w-full text-left p-2 rounded-lg text-sm transition-colors',
                          product.id === selectedSlotData?.productId
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        )}
                      >
                        {product.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  取消选择
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">点击左侧货架格进行调整</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'photos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">陈列照片管理</h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPhotoFilter('all')}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md transition-colors',
                      photoFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    )}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setPhotoFilter('byProduct')}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md transition-colors',
                      photoFilter === 'byProduct' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    )}
                  >
                    按商品
                  </button>
                  <button
                    onClick={() => setPhotoFilter('byShelf')}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-md transition-colors',
                      photoFilter === 'byShelf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                    )}
                  >
                    按货架
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {photoFilter !== 'all' && (
              <div className="mb-4 flex items-center gap-3">
                {photoFilter === 'byProduct' && (
                  <select
                    value={filterProductId}
                    onChange={(e) => setFilterProductId(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white flex-1 max-w-xs"
                  >
                    <option value="">选择商品...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}
                {photoFilter === 'byShelf' && (
                  <select
                    value={filterShelf}
                    onChange={(e) => setFilterShelf(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white flex-1 max-w-xs"
                  >
                    <option value="">选择货架位...</option>
                    {shelfSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        A{s.row}-{s.col} {s.productName || ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              {[
                { label: '按商品上传', type: 'product' as const, options: products.map((p) => ({ id: p.id, label: p.name })) },
                { label: '按货架上传', type: 'shelf' as const, options: shelfSlots.map((s) => ({ id: s.id, label: `A${s.row}-${s.col} ${s.productName || ''}` })) },
              ].map((upload) => (
                <div key={upload.type} className="flex-1 min-w-[250px]">
                  <p className="text-sm text-gray-600 mb-2">{upload.label}</p>
                  <div className="flex gap-2">
                    <select
                      value={uploadType === upload.type ? uploadTargetId : ''}
                      onChange={(e) => {
                        setUploadType(upload.type);
                        setUploadTargetId(e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                    >
                      <option value="">选择...</option>
                      {upload.options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => uploadTargetId && fileInputRef.current?.click()}
                      disabled={!uploadTargetId}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      上传
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h4 className="text-sm font-medium text-gray-800 mb-4">
              照片列表 ({filteredPhotos.length})
            </h4>
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Image className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无陈列照片</p>
                <p className="text-xs mt-1">请先上传照片</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredPhotos.map((photo) => (
                  <div key={photo.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={photo.url}
                        alt="陈列照"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      {photo.productId && (
                        <p className="text-xs text-gray-600 truncate">
                          商品: {products.find((p) => p.id === photo.productId)?.name}
                        </p>
                      )}
                      {photo.shelfPosition && (
                        <p className="text-xs text-gray-500">货架: {photo.shelfPosition}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
