import { create } from 'zustand';
import type {
  Product,
  OrderItem,
  Employee,
  Shift,
  Leave,
  Inspection,
  EquipmentFault,
  Promotion,
  SalesData,
  TodoItem,
  ShelfSlot,
} from '../types';
import {
  products as mockProducts,
  orderItems as mockOrders,
  employees as mockEmployees,
  shifts as mockShifts,
  leaves as mockLeaves,
  inspections as mockInspections,
  equipmentFaults as mockFaults,
  promotions as mockPromotions,
  salesData as mockSalesData,
  todoItems as mockTodos,
  shelfSlots as mockShelfSlots,
} from '../mock/data';

interface StoreState {
  products: Product[];
  orderItems: OrderItem[];
  employees: Employee[];
  shifts: Shift[];
  leaves: Leave[];
  inspections: Inspection[];
  equipmentFaults: EquipmentFault[];
  promotions: Promotion[];
  salesData: SalesData[];
  todoItems: TodoItem[];
  shelfSlots: ShelfSlot[];
  updateOrderQty: (id: string, qty: number) => void;
  submitOrders: () => void;
  confirmReceive: (id: string, qty: number) => void;
  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;
  addEquipmentFault: (fault: Omit<EquipmentFault, 'id' | 'reportTime' | 'status'>) => void;
  addInspection: (inspection: Omit<Inspection, 'id' | 'date'>) => void;
  updateFaultStatus: (id: string, status: EquipmentFault['status']) => void;
}

export const useStore = create<StoreState>((set) => ({
  products: mockProducts,
  orderItems: mockOrders,
  employees: mockEmployees,
  shifts: mockShifts,
  leaves: mockLeaves,
  inspections: mockInspections,
  equipmentFaults: mockFaults,
  promotions: mockPromotions,
  salesData: mockSalesData,
  todoItems: mockTodos,
  shelfSlots: mockShelfSlots,

  updateOrderQty: (id, qty) =>
    set((state) => ({
      orderItems: state.orderItems.map((o) =>
        o.id === id ? { ...o, actualQty: qty } : o
      ),
    })),

  submitOrders: () =>
    set((state) => ({
      orderItems: state.orderItems.map((o) =>
        o.status === 'pending' ? { ...o, status: 'submitted' as const } : o
      ),
    })),

  confirmReceive: (id, qty) =>
    set((state) => ({
      orderItems: state.orderItems.map((o) =>
        o.id === id
          ? { ...o, status: 'received' as const, receivedQty: qty, receivedAt: new Date().toISOString().split('T')[0] }
          : o
      ),
    })),

  approveLeave: (id) =>
    set((state) => ({
      leaves: state.leaves.map((l) =>
        l.id === id ? { ...l, status: 'approved' as const } : l
      ),
    })),

  rejectLeave: (id) =>
    set((state) => ({
      leaves: state.leaves.map((l) =>
        l.id === id ? { ...l, status: 'rejected' as const } : l
      ),
    })),

  addEquipmentFault: (fault) =>
    set((state) => ({
      equipmentFaults: [
        {
          ...fault,
          id: `F${String(state.equipmentFaults.length + 1).padStart(3, '0')}`,
          reportTime: new Date().toISOString(),
          status: 'pending' as const,
        },
        ...state.equipmentFaults,
      ],
    })),

  addInspection: (inspection) =>
    set((state) => ({
      inspections: [
        {
          ...inspection,
          id: `I${String(state.inspections.length + 1).padStart(3, '0')}`,
          date: new Date().toISOString().split('T')[0],
        },
        ...state.inspections,
      ],
    })),

  updateFaultStatus: (id, status) =>
    set((state) => ({
      equipmentFaults: state.equipmentFaults.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    })),
}));
