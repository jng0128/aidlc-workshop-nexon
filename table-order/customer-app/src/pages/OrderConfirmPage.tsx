import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/cartStore';
import apiClient from '../api/axios';

function OrderConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getTotalAmount } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const totalAmount = getTotalAmount();

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const orderItems = items.map((item) => ({
        menuName: item.menuName,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const response = await apiClient.post('/orders', { items: orderItems });
      const order = response.data;

      navigate('/order-success', { state: { order }, replace: true });
    } catch {
      setError(t('order.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  return (
    <div data-testid="order-confirm-page" style={{ padding: '16px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#1f2937',
        }}
      >
        {t('order.confirmTitle')}
      </h1>

      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f3f4f6',
          marginBottom: '16px',
        }}
      >
        {items.map((item) => (
          <div
            key={item.menuId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <div>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#1f2937' }}>
                {item.menuName}
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                {formatPrice(item.price)} × {item.quantity}
              </p>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            marginTop: '8px',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
            {t('cart.totalAmount')}
          </span>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {error && (
        <p
          style={{
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {error}
        </p>
      )}

      <button
        data-testid="confirm-order-btn"
        onClick={handleConfirmOrder}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: loading ? '#93c5fd' : '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          minHeight: '52px',
        }}
      >
        {loading ? '...' : t('order.confirmButton')}
      </button>
    </div>
  );
}

export default OrderConfirmPage;
