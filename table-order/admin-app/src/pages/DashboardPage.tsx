import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { TableInfo, Order, OrderStatus } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const headerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '16px',
};

const cardStyle = (hasNewOrder: boolean): React.CSSProperties => ({
  backgroundColor: hasNewOrder ? '#fff9e6' : '#fff',
  border: hasNewOrder ? '2px solid #f39c12' : '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '16px',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
  boxShadow: hasNewOrder ? '0 2px 8px rgba(243, 156, 18, 0.2)' : 'none',
});

const tableNumberStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '8px',
  color: '#2c3e50',
};

const totalStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#27ae60',
  marginBottom: '12px',
};

const orderPreviewStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  borderTop: '1px solid #eee',
  paddingTop: '8px',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '24px',
  width: '90%',
  maxWidth: '600px',
  maxHeight: '80vh',
  overflowY: 'auto',
};

const statusBadgeStyle = (status: OrderStatus): React.CSSProperties => {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '#f39c12',
    [OrderStatus.PREPARING]: '#3498db',
    [OrderStatus.COMPLETED]: '#27ae60',
    [OrderStatus.CANCELLED]: '#95a5a6',
  };
  return {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    backgroundColor: colors[status],
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
  };
};

const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '대기중',
  [OrderStatus.PREPARING]: '준비중',
  [OrderStatus.COMPLETED]: '완료',
  [OrderStatus.CANCELLED]: '취소',
};

const btnStyle = (color: string): React.CSSProperties => ({
  padding: '6px 12px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: color,
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  marginRight: '6px',
});

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch tables
  const { data: tables = [], isLoading: tablesLoading } = useQuery<TableInfo[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await apiClient.get('/tables');
      return res.data;
    },
  });

  // Fetch all orders
  const { data: allOrders = [] } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    },
  });

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: OrderStatus }) => {
      const res = await apiClient.patch(`/orders/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiClient.delete(`/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
    },
  });

  // Group orders by table
  const ordersByTable = tables.map((table) => {
    const tableOrders = allOrders.filter(
      (o) => o.tableId === table.id && o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED
    );
    const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const hasNewOrder = tableOrders.some((o) => o.status === OrderStatus.PENDING);
    return { table, orders: tableOrders, totalAmount, hasNewOrder };
  });

  // Get orders for selected table
  const selectedTableOrders = selectedTableId
    ? allOrders.filter((o) => o.tableId === selectedTableId)
    : [];

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    statusMutation.mutate({ orderId, status });
  };

  const handleDeleteOrder = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder.id);
      setShowDeleteConfirm(false);
    }
  };

  if (tablesLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>대시보드</h1>
        <p style={{ color: '#666', margin: '4px 0 0' }}>실시간 주문 현황</p>
      </div>

      <div style={gridStyle} data-testid="dashboard-grid">
        {ordersByTable.map(({ table, orders, totalAmount, hasNewOrder }) => (
          <div
            key={table.id}
            style={cardStyle(hasNewOrder)}
            onClick={() => setSelectedTableId(table.id)}
            data-testid={`table-card-${table.id}`}
          >
            <div style={tableNumberStyle}>테이블 {table.tableNumber}</div>
            <div style={totalStyle}>
              {totalAmount > 0 ? `${totalAmount.toLocaleString('ko-KR')}원` : '주문 없음'}
            </div>
            <div style={orderPreviewStyle}>
              {orders.length === 0 && <div>활성 주문 없음</div>}
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} style={{ marginBottom: '4px' }}>
                  <span style={statusBadgeStyle(order.status)}>{statusLabels[order.status]}</span>
                  {' '}
                  {order.items.slice(0, 2).map((item) => `${item.menuName}×${item.quantity}`).join(', ')}
                  {order.items.length > 2 && ' ...'}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedTableId && (
        <div style={modalOverlayStyle} onClick={() => { setSelectedTableId(null); setSelectedOrder(null); }}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()} data-testid="order-detail-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>
                테이블 {tables.find((t) => t.id === selectedTableId)?.tableNumber} 주문 내역
              </h2>
              <button
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => { setSelectedTableId(null); setSelectedOrder(null); }}
              >
                ✕
              </button>
            </div>

            {selectedTableOrders.length === 0 && <p style={{ color: '#666' }}>주문이 없습니다</p>}

            {selectedTableOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: selectedOrder?.id === order.id ? '#f0f8ff' : '#fff',
                }}
                onClick={() => setSelectedOrder(order)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600 }}>{order.orderNumber}</span>
                  <span style={statusBadgeStyle(order.status)}>{statusLabels[order.status]}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  {order.items.map((item) => (
                    <div key={item.id}>
                      {item.menuName} × {item.quantity} = {(item.unitPrice * item.quantity).toLocaleString('ko-KR')}원
                    </div>
                  ))}
                </div>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                  합계: {order.totalAmount.toLocaleString('ko-KR')}원
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {order.status === OrderStatus.PENDING && (
                    <button
                      style={btnStyle('#3498db')}
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, OrderStatus.PREPARING); }}
                      data-testid="status-change-btn"
                    >
                      준비 시작
                    </button>
                  )}
                  {order.status === OrderStatus.PREPARING && (
                    <button
                      style={btnStyle('#27ae60')}
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, OrderStatus.COMPLETED); }}
                      data-testid="status-change-btn"
                    >
                      완료
                    </button>
                  )}
                  {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PREPARING) && (
                    <button
                      style={btnStyle('#95a5a6')}
                      onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, OrderStatus.CANCELLED); }}
                      data-testid="status-change-btn"
                    >
                      취소
                    </button>
                  )}
                  <button
                    style={btnStyle('#e74c3c')}
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowDeleteConfirm(true); }}
                    data-testid="order-delete-btn"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="주문 삭제"
        message={`주문 ${selectedOrder?.orderNumber || ''}을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        onConfirm={handleDeleteOrder}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
