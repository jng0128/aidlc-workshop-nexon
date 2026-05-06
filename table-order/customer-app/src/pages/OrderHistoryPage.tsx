import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/axios';
import { Order, TableSession, OrderStatus } from '../types';

function OrderHistoryPage() {
  const { t } = useTranslation();

  const { data: session } = useQuery<TableSession | null>({
    queryKey: ['currentSession'],
    queryFn: async () => {
      const res = await apiClient.get('/sessions/current');
      return res.data;
    },
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders', session?.id],
    queryFn: async () => {
      if (!session?.id) return [];
      const res = await apiClient.get('/orders', {
        params: { sessionId: session.id },
      });
      return res.data;
    },
    enabled: !!session?.id,
  });

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { bg: '#fef3c7', text: '#92400e' };
      case OrderStatus.PREPARING:
        return { bg: '#dbeafe', text: '#1e40af' };
      case OrderStatus.COMPLETED:
        return { bg: '#d1fae5', text: '#065f46' };
      case OrderStatus.CANCELLED:
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div data-testid="order-history-page" style={{ padding: '16px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#1f2937',
        }}
      >
        {t('order.historyTitle')}
      </h1>

      {sortedOrders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9ca3af',
          }}
        >
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>📋</p>
          <p style={{ fontSize: '16px' }}>{t('order.noOrders')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedOrders.map((order) => {
            const statusColor = getStatusColor(order.status);
            return (
              <div
                key={order.id}
                data-testid={`order-card-${order.id}`}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f3f4f6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1f2937',
                      }}
                    >
                      {order.orderNumber}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {formatTime(order.createdAt)}
                    </p>
                  </div>
                  <span
                    data-testid={`order-status-${order.id}`}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                    }}
                  >
                    {t(`status.${order.status}`)}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: '8px',
                  }}
                >
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        fontSize: '13px',
                        color: '#6b7280',
                      }}
                    >
                      <span>
                        {item.menuName} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #f3f4f6',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937' }}>
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;
