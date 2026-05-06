import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/cartStore';

function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotalAmount } =
    useCartStore();

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const totalAmount = getTotalAmount();

  return (
    <div data-testid="cart-page" style={{ padding: '16px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#1f2937',
        }}
      >
        {t('cart.title')}
      </h1>

      {items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#9ca3af',
          }}
        >
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</p>
          <p style={{ fontSize: '16px' }}>{t('cart.emptyCart')}</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div
                key={item.menuId}
                data-testid={`cart-item-${item.menuId}`}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.menuName}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    🍽️
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: '4px',
                    }}
                  >
                    {item.menuName}
                  </p>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#2563eb',
                      fontWeight: 500,
                    }}
                  >
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    data-testid={`quantity-decrease-${item.menuId}`}
                    onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#fff',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      minWidth: '24px',
                      textAlign: 'center',
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    data-testid={`quantity-increase-${item.menuId}`}
                    onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: '1px solid #d1d5db',
                      backgroundColor: '#fff',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  data-testid={`remove-item-${item.menuId}`}
                  onClick={() => removeItem(item.menuId)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#fef2f2',
                    color: '#ef4444',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Total & Actions */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f3f4f6',
            }}
          >
            <div
              data-testid="cart-total"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
                {t('cart.totalAmount')}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                {formatPrice(totalAmount)}
              </span>
            </div>

            <button
              data-testid="order-btn"
              onClick={() => navigate('/order-confirm')}
              disabled={items.length === 0}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: items.length === 0 ? '#93c5fd' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                marginBottom: '8px',
                minHeight: '48px',
              }}
            >
              {t('cart.orderButton')}
            </button>

            <button
              data-testid="clear-cart-btn"
              onClick={clearCart}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#fff',
                color: '#ef4444',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              {t('cart.clearButton')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
