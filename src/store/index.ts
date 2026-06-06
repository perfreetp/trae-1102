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
  DisplayPhoto,
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
  displayPhotos: DisplayPhoto[];

  updateOrderQty: (id: string, qty: number) => void;
  submitOrders: () => void;
  confirmReceive: (id: string, qty: number, remark?: string) => void;

  approveLeave: (id: string) => void;
  rejectLeave: (id: string) => void;
  addLeave: (leave: Omit<Leave, 'id' | 'status' | 'createdAt'>) => void;

  addEquipmentFault: (fault: Omit<EquipmentFault, 'id' | 'reportTime' | 'status'>) => void;
  updateFaultStatus: (id: string, status: EquipmentFault['status']) => void;

  addInspection: (inspection: Omit<Inspection, 'id' | 'date'>) => void;

  updatePromotionStatus: (id: string, status: Promotion['status']) => void;

  updateShelfSlot: (slotId: string, productId: string | null) => void;

  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, shift: Partial<Omit<Shift, 'id'>>) => void;

  addDisplayPhoto: (photo: Omit<DisplayPhoto, 'id' | 'uploadedAt'>) => void;
}

export const useStore = create<StoreState>((set, get) => ({
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
  displayPhotos: [],

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

  confirmReceive: (id, qty, remark) =>
    set((state) => ({
      orderItems: state.orderItems.map((o) =>
        o.id === id
          ? {
              ...o,
              status: 'received' as const,
              receivedQty: qty,
              receivedAt: new Date().toISOString().split('T')[0],
              remark: remark || o.remark,
            }
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

  addLeave: (leave) =>
    set((state) => ({
      leaves: [
        {
          ...leave,
          id: `L${String(state.leaves.length + 1).padStart(3, '0')}`,
          status: 'pending' as const,
          createdAt: new Date().toISOString().split('T')[0],
        },
        ...state.leaves,
      ],
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

  updateFaultStatus: (id, status) =>
    set((state) => ({
      equipmentFaults: state.equipmentFaults.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
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

  updatePromotionStatus: (id, status) =>
    set((state) => ({
      promotions: state.promotions.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),

  updateShelfSlot: (slotId, productId) =>
    set((state) => {
      const slot = state.shelfSlots.find((s) => s.id === slotId);
      if (!slot) return state;

      const position = `A${slot.row}-${slot.col}`;
      const product = productId
        ? state.products.find((p) => p.id === productId)
        : null;

      const newShelfSlots = state.shelfSlots.map((s) => {
        if (s.id === slotId) {
          return {
            ...s,
            productId: productId || undefined,
            productName: product?.name,
          };
        }
        if (productId && s.productId === productId && s.id !== slotId) {
          return { ...s, productId: undefined, productName: undefined };
        }
        return s;
      });

      const newProducts = state.products.map((p) => {
        if (p.id === productId) {
          return { ...p, shelfPosition: position };
        }
        if (slot.productId === p.id) {
          return { ...p, shelfPosition: '' };
        }
        return p;
      });

      return { shelfSlots: newShelfSlots, products: newProducts };
    }),

  addShift: (shift) =>
    set((state) => {
      const existingIndex = state.shifts.findIndex(
        (s) => s.employeeId === shift.employeeId && s.date === shift.date
      );

      if (existingIndex >= 0) {
        const newShifts = [...state.shifts];
        newShifts[existingIndex] = { ...newShifts[existingIndex], ...shift };
        return { shifts: newShifts };
      }

      return {
        shifts: [
          {
            ...shift,
            id: `S${String(state.shifts.length + 1).padStart(4, '0')}`,
          },
          ...state.shifts,
        ],
      };
    }),

  updateShift: (id, shift) =>
    set((state) => ({
      shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...shift } : s)),
    })),

  addDisplayPhoto: (photo) =>
    set((state) => ({
      displayPhotos: [
        {
          ...photo,
          id: `DP${String(state.displayPhotos.length + 1).padStart(4, '0')}`,
          uploadedAt: new Date().toISOString(),
        },
        ...state.displayPhotos,
      ],
    })),
}));
