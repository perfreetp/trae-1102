import * as XLSX from 'xlsx';

export const formatCurrency = (value: number): string => {
  return `¥${value.toFixed(2)}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getExpiryLevel = (days: number): 'critical' | 'warning' | 'normal' => {
  if (days <= 2) return 'critical';
  if (days <= 7) return 'warning';
  return 'normal';
};

export const getShiftName = (type: string): string => {
  const map: Record<string, string> = {
    morning: '早班',
    afternoon: '中班',
    night: '晚班',
  };
  return map[type] || type;
};

export const getLeaveTypeName = (type: string): string => {
  const map: Record<string, string> = {
    sick: '病假',
    personal: '事假',
    annual: '年假',
  };
  return map[type] || type;
};

export const getStatusName = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    submitted: '已提交',
    shipped: '配送中',
    received: '已收货',
    approved: '已批准',
    rejected: '已拒绝',
    active: '进行中',
    ended: '已结束',
    repairing: '维修中',
    fixed: '已修复',
    pass: '合格',
    fail: '不合格',
  };
  return map[status] || status;
};

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    received: 'bg-green-100 text-green-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    ended: 'bg-gray-100 text-gray-800',
    repairing: 'bg-orange-100 text-orange-800',
    fixed: 'bg-green-100 text-green-800',
    pass: 'bg-green-100 text-green-800',
    fail: 'bg-red-100 text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const exportToExcel = (data: unknown[], filename: string, sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
