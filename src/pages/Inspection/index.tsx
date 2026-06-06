import { useState } from 'react';
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
} from 'lucide-react';

type TabType = 'hygiene' | 'equipment';

export default function Inspection() {
  const { inspections, equipmentFaults, addInspection, addEquipmentFault, updateFaultStatus } =
    useStore();
  const [activeTab, setActiveTab] = useState<TabType>('hygiene');
  const [showAddModal, setShowAddModal] = useState(false);

  const hygieneItems = [
    { name: '门面清洁', checked: false, remark: '' },
    { name: '收银台卫生', checked: false, remark: '' },
    { name: '货架清洁', checked: false, remark: '' },
    { name: '冷藏柜卫生', checked: false, remark: '' },
    { name: '地面清洁', checked: false, remark: '' },
    { name: '洗手间卫生', checked: false, remark: '' },
    { name: '垃圾桶清理', checked: false, remark: '' },
  ];

  const [checkItems, setCheckItems] = useState(hygieneItems);
  const [faultForm, setFaultForm] = useState({
    equipmentName: '',
    description: '',
  });

  const toggleItem = (index: number) => {
    setCheckItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
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
    });
    setCheckItems(hygieneItems);
    setShowAddModal(false);
  };

  const handleSubmitFault = () => {
    if (faultForm.equipmentName && faultForm.description) {
      addEquipmentFault(faultForm);
      setFaultForm({ equipmentName: '', description: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">门店巡检</h2>
        <button
          onClick={() => setShowAddModal(true)}
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
                      <p className="text-xs text-gray-500 mt-1 ml-6">{item.remark}</p>
                    )}
                  </div>
                ))}
              </div>
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
                  <td className="py-3 px-4 text-gray-600">{fault.description}</td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {activeTab === 'hygiene' ? '卫生巡检' : '上报设备故障'}
            </h3>

            {activeTab === 'hygiene' ? (
              <div className="space-y-3">
                {checkItems.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      item.checked
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => toggleItem(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          item.checked
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        )}
                      >
                        {item.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  上传照片
                </button>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitInspection}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    提交
                  </button>
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
                <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                  <Camera className="w-4 h-4" />
                  上传故障照片
                </button>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitFault}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    提交上报
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
