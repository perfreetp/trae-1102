import { useState } from 'react';
import { useStore } from '../../store';
import {
  cn,
  getShiftName,
  getLeaveTypeName,
  getStatusName,
  getStatusColor,
  formatDate,
} from '../../utils';
import {
  CalendarClock,
  Users,
  Plus,
  Check,
  X,
  Clock,
  FileText,
  Edit,
} from 'lucide-react';

type TabType = 'shift' | 'leave';

const shiftTypeConfig = {
  morning: { label: '早班', start: '07:00', end: '15:00', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  afternoon: { label: '中班', start: '14:00', end: '22:00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  night: { label: '晚班', start: '21:00', end: '07:00', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
};

export default function Schedule() {
  const { shifts, leaves, employees, approveLeave, rejectLeave, addLeave, addShift } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('shift');
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [showAddShift, setShowAddShift] = useState(false);
  const [editingShift, setEditingShift] = useState<{ date: string; employeeId: string } | null>(null);

  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    type: 'sick' as const,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const [shiftForm, setShiftForm] = useState({
    employeeId: '',
    date: '',
    shiftType: 'morning' as const,
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const getShiftForEmployeeDate = (employeeId: string, date: string) => {
    return shifts.find((s) => s.employeeId === employeeId && s.date === date);
  };

  const handleSubmitLeave = () => {
    if (leaveForm.employeeId && leaveForm.startDate && leaveForm.endDate && leaveForm.reason) {
      const emp = employees.find((e) => e.id === leaveForm.employeeId);
      if (emp) {
        addLeave({
          employeeId: leaveForm.employeeId,
          employeeName: emp.name,
          type: leaveForm.type,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          reason: leaveForm.reason,
        });
        setLeaveForm({ employeeId: '', type: 'sick', startDate: '', endDate: '', reason: '' });
        setShowAddLeave(false);
      }
    }
  };

  const handleSubmitShift = () => {
    if (shiftForm.employeeId && shiftForm.date && shiftForm.shiftType) {
      const emp = employees.find((e) => e.id === shiftForm.employeeId);
      const config = shiftTypeConfig[shiftForm.shiftType];
      if (emp) {
        addShift({
          employeeId: shiftForm.employeeId,
          employeeName: emp.name,
          date: shiftForm.date,
          shiftType: shiftForm.shiftType,
          startTime: config.start,
          endTime: config.end,
        });
        setShiftForm({ employeeId: '', date: '', shiftType: 'morning' });
        setShowAddShift(false);
        setEditingShift(null);
      }
    }
  };

  const openEditShift = (date: string, employeeId: string) => {
    const existing = getShiftForEmployeeDate(employeeId, date);
    setShiftForm({
      employeeId,
      date,
      shiftType: (existing?.shiftType as typeof shiftForm.shiftType) || 'morning',
    });
    setEditingShift({ date, employeeId });
    setShowAddShift(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">排班考勤</h2>
        <div className="flex gap-2">
          {activeTab === 'shift' && (
            <button
              onClick={() => {
                setShiftForm({ employeeId: '', date: '', shiftType: 'morning' });
                setEditingShift(null);
                setShowAddShift(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              新增班次
            </button>
          )}
          {activeTab === 'leave' && (
            <button
              onClick={() => setShowAddLeave(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              登记请假
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('shift')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'shift'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          <CalendarClock className="w-4 h-4" />
          班次安排
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'leave'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          )}
        >
          <FileText className="w-4 h-4" />
          请假登记
          {leaves.filter((l) => l.status === 'pending').length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
              {leaves.filter((l) => l.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'shift' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              本周排班表
              <span className="text-xs text-gray-500 ml-2">（点击格子可调整班次）</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-3 bg-gray-50 text-sm font-medium text-gray-600">员工</div>
                {weekDates.map((date, i) => (
                  <div
                    key={i}
                    className={cn(
                      'p-3 text-center border-l border-gray-100',
                      i === 0 && 'bg-blue-50'
                    )}
                  >
                    <p className="text-xs text-gray-500">{weekDays[date.getDay()]}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {date.getMonth() + 1}/{date.getDate()}
                    </p>
                  </div>
                ))}
              </div>
              {employees.map((emp) => (
                <div key={emp.id} className="grid grid-cols-8 border-b border-gray-50">
                  <div className="p-3 text-sm">
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.position}</p>
                  </div>
                  {weekDates.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const shift = getShiftForEmployeeDate(emp.id, dateStr);
                    const config = shift ? shiftTypeConfig[shift.shiftType] : null;
                    return (
                      <div
                        key={i}
                        className="p-2 border-l border-gray-50 min-h-[60px] cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => openEditShift(dateStr, emp.id)}
                      >
                        {shift && config ? (
                          <div className={cn('p-2 rounded-lg text-xs border', config.color)}>
                            <p className="font-medium">{getShiftName(shift.shiftType)}</p>
                            <p className="opacity-75">
                              {shift.startTime}-{shift.endTime}
                            </p>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <Edit className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100" />
                            <span className="text-xs text-gray-300">点击排班</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 flex items-center gap-4">
            {Object.entries(shiftTypeConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={cn('w-3 h-3 rounded', config.color.split(' ')[0])}></span>
                <span className="text-xs text-gray-600">
                  {config.label} {config.start}-{config.end}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">请假申请</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">员工</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">类型</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">请假时间</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">事由</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">申请时间</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">状态</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{leave.employeeName}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {getLeaveTypeName(leave.type)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{leave.reason}</td>
                  <td className="py-3 px-4 text-center text-gray-500">{leave.createdAt}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        getStatusColor(leave.status)
                      )}
                    >
                      {getStatusName(leave.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {leave.status === 'pending' && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => approveLeave(leave.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="批准"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectLeave(leave.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="拒绝"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingShift ? '调整班次' : '新增班次'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">选择员工</label>
                <select
                  value={shiftForm.employeeId}
                  onChange={(e) => setShiftForm({ ...shiftForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择员工...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">排班日期</label>
                <input
                  type="date"
                  value={shiftForm.date}
                  onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">班次类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(shiftTypeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setShiftForm({ ...shiftForm, shiftType: key as typeof shiftForm.shiftType })
                      }
                      className={cn(
                        'p-3 rounded-lg border-2 text-sm transition-all',
                        shiftForm.shiftType === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-gray-500">{config.start}-{config.end}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddShift(false);
                    setEditingShift(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitShift}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">登记请假</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">选择员工</label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择员工...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">请假类型</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, type: e.target.value as typeof leaveForm.type })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sick">病假</option>
                  <option value="personal">事假</option>
                  <option value="annual">年假</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">请假事由</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="请输入请假事由..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddLeave(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitLeave}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
