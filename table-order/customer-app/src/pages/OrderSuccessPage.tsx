import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/cartStore';
import { Order } from '../types';

function OrderSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const clearCart = useCartStore((state) => state.clearCart);
  const [countdown, setCountdown] = useState(5);

  const order = (location.state as { order?: Order })?.order;

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/menu', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  if (!order) {
    navigate('/menu', { replace: true });
    return null;
  }

  return (
    <div
      data-testid="order-success-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
          }}
        >
          {t('order.successTitle')}
        </h1>

        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px',
          }}
        >
          {t('order.successMessage')}
        </p>

        <div
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
            {t('order.orderNumber')}
          </p>
          <p
            data-testid="order-number"
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: '#2563eb',
            }}
          >
            {order.orderNumber}
          </p>
        </div>

        <p
          style={{
            fontSize: '14px',
            color: '#9ca3af',
          }}
        >
          {t('order.redirectMessage', { seconds: countdown })}
        </p>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
