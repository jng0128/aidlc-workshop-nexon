export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Category {
  id: number;
  name: string;
  displayOrder: number;
  storeId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  categoryId: number;
  displayOrder: number;
  storeId?: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  tableId: number;
  sessionId: number;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface TableInfo {
  id: number;
  tableNumber: number;
  storeId: number;
  createdAt?: string;
}

export interface TableSession {
  id: number;
  tableId: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
}
