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

const categories = ['饮料', '零食', '日用品', '冷冻食品', '速食', '烟酒'];

const productNames = [
  '可口可乐 500ml', '百事可乐 500ml', '农夫山泉 550ml', '怡宝 555ml',
  '康师傅红烧牛肉面', '统一老坛酸菜面', '乐事薯片原味', '乐事薯片黄瓜味',
  '奥利奥饼干', '旺旺雪饼', '益达口香糖', '绿箭口香糖',
  '维达纸巾 10包', '心相印纸巾', '蓝月亮洗手液', '舒肤佳香皂',
  '三全水饺 500g', '思念汤圆 400g', '伊利牛奶 250ml', '蒙牛酸奶 200g',
  '双汇火腿肠', '乌江榨菜', '老干妈辣椒酱', '海天酱油',
];

export const products: Product[] = productNames.map((name, index) => ({
  id: `P${String(index + 1).padStart(4, '0')}`,
  name,
  category: categories[index % categories.length],
  barcode: `69${String(Math.floor(Math.random() * 100000000000)).padStart(11, '0')}`,
  price: Math.floor(Math.random() * 300 + 50) / 100,
  cost: Math.floor(Math.random() * 200 + 30) / 100,
  stock: Math.floor(Math.random() * 50 + 5),
  safeStock: Math.floor(Math.random() * 10 + 5),
  shelfPosition: `A${Math.floor(index / 8) + 1}-${(index % 8) + 1}`,
  expiryDate: index < 8 ? new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
  salesVolume: Math.floor(Math.random() * 200 + 50),
  salesAmount: Math.floor(Math.random() * 10000 + 1000) / 100,
}));

export const orderItems: OrderItem[] = products.slice(0, 15).map((product, index) => ({
  id: `O${String(index + 1).padStart(4, '0')}`,
  productId: product.id,
  productName: product.name,
  suggestedQty: Math.max(0, Math.floor(product.safeStock * 1.5 - product.stock + 20)),
  actualQty: Math.max(0, Math.floor(product.safeStock * 1.5 - product.stock + 20)),
  status: ['pending', 'submitted', 'shipped', 'received'][index % 4] as OrderItem['status'],
  createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  receivedAt: index >= 12 ? new Date().toISOString().split('T')[0] : undefined,
}));

export const employees: Employee[] = [
  { id: 'E001', name: '张店长', position: '店长', phone: '13800138001' },
  { id: 'E002', name: '李小明', position: '店员', phone: '13800138002' },
  { id: 'E003', name: '王小红', position: '店员', phone: '13800138003' },
  { id: 'E004', name: '赵小刚', position: '店员', phone: '13800138004' },
  { id: 'E005', name: '陈小美', position: '店员', phone: '13800138005' },
];

const shiftTypes = [
  { type: 'morning', start: '07:00', end: '15:00' },
  { type: 'afternoon', start: '14:00', end: '22:00' },
  { type: 'night', start: '21:00', end: '07:00' },
];

export const shifts: Shift[] = [];
for (let i = 0; i < 7; i++) {
  const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  shiftTypes.forEach((st, stIndex) => {
    const emp = employees[(stIndex + i) % employees.length];
    shifts.push({
      id: `S${String(i * 3 + stIndex + 1).padStart(4, '0')}`,
      employeeId: emp.id,
      employeeName: emp.name,
      date,
      shiftType: st.type as Shift['shiftType'],
      startTime: st.start,
      endTime: st.end,
    });
  });
}

export const leaves: Leave[] = [
  {
    id: 'L001',
    employeeId: 'E002',
    employeeName: '李小明',
    type: 'sick',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: '感冒发烧，需要休息',
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'L002',
    employeeId: 'E003',
    employeeName: '王小红',
    type: 'annual',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: '年假，回老家',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

export const inspections: Inspection[] = [
  {
    id: 'I001',
    type: 'hygiene',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: '门面清洁', result: 'pass' },
      { name: '收银台卫生', result: 'pass' },
      { name: '货架清洁', result: 'pass' },
      { name: '冷藏柜卫生', result: 'fail', remark: '底部有积水' },
      { name: '地面清洁', result: 'pass' },
    ],
    status: 'fail',
    remark: '冷藏柜底部需要清理',
  },
];

export const equipmentFaults: EquipmentFault[] = [
  {
    id: 'F001',
    equipmentName: '冷藏柜1号',
    description: '制冷效果不佳，温度偏高',
    reportTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'repairing',
  },
  {
    id: 'F002',
    equipmentName: '收银机2号',
    description: '扫码枪有时无法识别条码',
    reportTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'fixed',
  },
];

export const promotions: Promotion[] = [
  {
    id: 'PM001',
    name: '夏季饮料特惠',
    type: 'discount',
    productIds: products.filter(p => p.category === '饮料').slice(0, 5).map(p => p.id),
    discountValue: 0.8,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    description: '全场饮料8折优惠',
  },
  {
    id: 'PM002',
    name: '周末零食特价',
    type: 'specialPrice',
    productIds: products.filter(p => p.category === '零食').slice(0, 3).map(p => p.id),
    specialPrice: 9.9,
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    description: '指定零食统一9.9元',
  },
];

export const salesData: SalesData[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const revenue = Math.floor(Math.random() * 5000 + 3000);
  const orders = Math.floor(Math.random() * 300 + 150);
  return {
    date,
    revenue,
    orders,
    avgOrderValue: Math.round((revenue / orders) * 100) / 100,
    profit: Math.floor(revenue * 0.3),
  };
});

export const todoItems: TodoItem[] = [
  { id: 'T001', title: '待处理订货', type: 'order', count: 8, priority: 'high' },
  { id: 'T002', title: '待验收商品', type: 'receipt', count: 3, priority: 'high' },
  { id: 'T003', title: '今日巡检', type: 'inspection', count: 1, priority: 'medium' },
  { id: 'T004', title: '待执行促销', type: 'promotion', count: 2, priority: 'medium' },
];

export const shelfSlots: ShelfSlot[] = [];
for (let row = 1; row <= 5; row++) {
  for (let col = 1; col <= 8; col++) {
    const idx = (row - 1) * 8 + (col - 1);
    const product = idx < products.length ? products[idx] : undefined;
    shelfSlots.push({
      id: `SH-${row}-${col}`,
      row,
      col,
      productId: product?.id,
      productName: product?.name,
    });
  }
}

export const displayProducts: Product[] = products.slice(0, 10).sort((a, b) => (b.salesVolume || 0) - (a.salesVolume || 0));

export const lowStockProducts: Product[] = products.filter(p => p.stock < p.safeStock);

export const expiringProducts: Product[] = products.filter(p => p.expiryDate);
