export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  safeStock: number;
  shelfPosition: string;
  expiryDate?: string;
  image?: string;
  salesVolume?: number;
  salesAmount?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  suggestedQty: number;
  actualQty: number;
  receivedQty?: number;
  status: 'pending' | 'submitted' | 'shipped' | 'received';
  createdAt: string;
  receivedAt?: string;
  remark?: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  phone: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  startTime: string;
  endTime: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'sick' | 'personal' | 'annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface InspectionItem {
  name: string;
  result: 'pass' | 'fail';
  remark?: string;
}

export interface Inspection {
  id: string;
  type: 'hygiene' | 'equipment';
  date: string;
  items: InspectionItem[];
  status: 'pass' | 'fail';
  photos?: string[];
  remark?: string;
}

export interface EquipmentFault {
  id: string;
  equipmentName: string;
  description: string;
  reportTime: string;
  status: 'pending' | 'repairing' | 'fixed';
  photos?: string[];
}

export interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'specialPrice';
  productIds: string[];
  products?: Product[];
  discountValue?: number;
  specialPrice?: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'ended';
  description?: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  profit: number;
}

export interface TodoItem {
  id: string;
  title: string;
  type: 'order' | 'receipt' | 'inspection' | 'promotion';
  count: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ShelfSlot {
  id: string;
  row: number;
  col: number;
  productId?: string;
  productName?: string;
}
