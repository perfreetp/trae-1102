import { useState, useRef } from 'react';
import { useStore } from '../../store';
import { cn, formatDate, formatDateTime, getStatusName, getStatusColor } from '../../utils';
import {
  ClipboardCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  Plus,
  Camera,
  AlertTriangle,
  Clock,
  CheckCheck,
  X,
  Image,
} from 'lucide-react';

type TabType = 'hygiene' | 'equipment';

interface CheckItemForm {
  name: string;
  checked: boolean;
  remark: string;
}

export default function Inspection() {
  const {
    inspections,
    equipmentFaults,
    addInspection,
    addEquipmentFault,
    updateFaultStatus,
  } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('hygiene');
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [checkItems, setCheckItems] = useState<CheckItemForm[]>([
    { name: '门面清洁', checked: false, remark: '' },
    { name: '收银台卫生', checked: false, remark: '' },
    { name: '货架清洁', checked: false, remark: '' },
    { name: '冷藏柜卫生', checked: false, remark: '' },
    { name: '地面清洁', checked: false, remark: '' },
    { name: '洗手间卫生', checked: false, remark: '' },
    { name: '垃圾桶清理', checked: false, remark: '' },
  ]);
  const [inspectionPhotos, setInspectionPhotos] = useState<string[]>([]);

  const [faultForm, setFaultForm] = useState({
    equipmentName: '',
    description: '',
  });
  const [faultPhotos, setFaultPhotos] = useState<string[]>([]);

  const toggleItem = (index: number) => {
    setCheckItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  };

  const updateItemRemark = (index: number, remark: string) => {
    setCheckItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, remark } : item))
    );
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setter((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitInspection = () => {
    const allPass = checkItems.every((i) => i.checked);
    addInspection({
      type: 'hygiene',
      items: checkItems.map((i) => ({
        name: i.name,
        result: i.checked ? 'pass' : 'fail',
        remark: i.remark || undefined,
      })),
      status: allPass ? 'pass' : 'fail',
      photos: inspectionPhotos.length > 0 ? inspectionPhotos : undefined,
    });
    resetInspectionForm();
    setShowAddModal(false);
  };

  const handleSubmitFault = () => {
    if (faultForm.equipmentName && faultForm.description) {
      addEquipmentFault({
        ...faultForm,
        photos: faultPhotos.length > 0 ? faultPhotos : undefined,
      });
      setFaultForm({ equipmentName: '', description: '' });
      setFaultPhotos([]);
      setShowAddModal(false);
    }
  };

  const resetInspectionForm = () => {
    setCheckItems([
      { name: '门面清洁', checked: false, remark: '' },
      { name: '收银台卫生', checked: false, remark: '' },
      { name: '货架清洁', checked: false, remark: '' },
      { name: '冷藏柜卫生', checked: false, remark: '' },
      { name: '地面清洁', checked: false, remark: '' },
      { name: '洗手间卫生', checked: false, remark: '' },
      { name: '垃圾桶清理', checked: false, remark: '' },
    ]);
    setInspectionPhotos([]);
  };

  const openAddModal = () => {
    if (activeTab === 'hygiene') {
      resetInspectionForm();
    } else {
      setFaultForm({ equipmentName: '', description: '' });
      setFaultPhotos([]);
    }
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">门店巡检</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'hygiene' ? '新增巡检' : '上报故障'}
        </button>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('hygiene')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'hygiene'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          <ClipboardCheck className="w-4 h-4" />
          卫生巡检
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'equipment'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          <Wrench className="w-4 h-4" />
          设备故障
          {equipmentFaults.filter((f) => f.status !== 'fixed').length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
              {equipmentFaults.filter((f) => f.status !== 'fixed').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'hygiene' && (
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2.5 rounded-xl',
                      inspection.status === 'pass' ? 'bg-green-100' : 'bg-red-100'
                    )}
                  >
                    {inspection.status === 'pass' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">卫生巡检</h3>
                    <p className="text-xs text-gray-500">{formatDate(inspection.date)}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full',
                    getStatusColor(inspection.status)
                  )}
                >
                  {getStatusName(inspection.status)}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {inspection.items.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg text-sm',
                      item.result === 'pass' ? 'bg-green-50' : 'bg-red-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {item.result === 'pass' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      )}
                      <span
                        className={cn(
                          item.result === 'pass' ? 'text-green-700' : 'text-red-700'
                        )}
                      >
                        {item.name}
                      </span>
                    </div>
                    {item.remark && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">备注: {item.remark}</p>
                    )}
                  </div>
                ))}
              </div>
              {inspection.photos && inspection.photos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">巡检照片:</p>
                  <div className="flex gap-2">
                    {inspection.photos.map((photo, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={photo} alt="巡检照" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">设备名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">故障描述</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">照片</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">上报时间</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">状态</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {equipmentFaults.map((fault) => (
                <tr key={fault.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={cn(
                          'w-4 h-4',
                          fault.status === 'fixed' ? 'text-green-500' : 'text-orange-500'
                        )}
                      />
                      <span className="font-medium text-gray-800">{fault.equipmentName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                    {fault.description}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {fault.photos && fault.photos.length > 0 ? (
                      <div className="flex justify-center gap-1">
                        {fault.photos.slice(0, 3).map((photo, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded overflow-hidden border border-gray-200"
                          >
                            <img
                              src={photo}
                              alt="故障"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {fault.photos.length > 3 && (
                          <span className="text-xs text-gray-500">+{fault.photos.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">
                    {formatDateTime(fault.reportTime)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        getStatusColor(fault.status)
                      )}
                    >
                      {getStatusName(fault.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {fault.status === 'pending' && (
                      <button
                        onClick={() => updateFaultStatus(fault.id, 'repairing')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <Wrench className="w-3 h-3" />
                        开始维修
                      </button>
                    )}
                    {fault.status === 'repairing' && (
                      <button
                        onClick={() => updateFaultStatus(fault.id, 'fixed')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCheck className="w-3 h-3" />
                        修复完成
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {activeTab === 'hygiene' ? '卫生巡检' : '上报设备故障'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'hygiene' ? (
                <div className="space-y-3">
                  {checkItems.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        item.checked
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleItem(index)}
                      >
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                            item.checked
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          )}
                        >
                          {item.checked && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                      {!item.checked && (
                        <input
                          type="text"
                          value={item.remark}
                          onChange={(e) => updateItemRemark(index, e.target.value)}
                          placeholder="未通过原因（可选）..."
                          className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  ))}

                  <div className="pt-2">
                    <p className="text-sm text-gray-600 mb-2">上传巡检照片（可选）</p>
                    <div className="flex flex-wrap gap-2">
                      {inspectionPhotos.map((photo, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img
                            src={photo}
                            alt="巡检"
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removePhoto(i, setInspectionPhotos)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-xs mt-0.5">添加</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">设备名称</label>
                    <input
                      type="text"
                      value={faultForm.equipmentName}
                      onChange={(e) =>
                        setFaultForm({ ...faultForm, equipmentName: e.target.value })
                      }
                      placeholder="例如：冷藏柜1号"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">故障描述</label>
                    <textarea
                      rows={4}
                      value={faultForm.description}
                      onChange={(e) =>
                        setFaultForm({ ...faultForm, description: e.target.value })
                      }
                      placeholder="请详细描述故障情况..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">上传故障照片（可选）</p>
                    <div className="flex flex-wrap gap-2">
                      {faultPhotos.map((photo, i) => (
                        <div key={i} className="relative w-16 h-16">
                          <img
                            src={photo}
                            alt="故障"
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removePhoto(i, setFaultPhotos)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-xs mt-0.5">添加</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) =>
                activeTab === 'hygiene'
                  ? handlePhotoUpload(e, setInspectionPhotos)
                  : handlePhotoUpload(e, setFaultPhotos)
              }
              className="hidden"
            />

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={activeTab === 'hygiene' ? handleSubmitInspection : handleSubmitFault}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
