import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/axios';
import { Category, Menu } from '../types';
import { useCartStore } from '../stores/cartStore';

function MenuPage() {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data;
    },
  });

  const { data: menus = [] } = useQuery<Menu[]>({
    queryKey: ['menus', selectedCategoryId],
    queryFn: async () => {
      const params = selectedCategoryId ? { categoryId: selectedCategoryId } : {};
      const res = await apiClient.get('/menus', { params });
      return res.data;
    },
  });

  const handleAddToCart = (menu: Menu) => {
    addItem(menu);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <div data-testid="menu-page" style={{ padding: '16px' }}>
      <h1
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#1f2937',
        }}
      >
        {t('menu.title')}
      </h1>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <button
          data-testid="category-tab-all"
          onClick={() => setSelectedCategoryId(null)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: selectedCategoryId === null ? '#2563eb' : '#f3f4f6',
            color: selectedCategoryId === null ? '#fff' : '#4b5563',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          {t('menu.allCategories')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            data-testid={`category-tab-${category.id}`}
            onClick={() => setSelectedCategoryId(category.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor:
                selectedCategoryId === category.id ? '#2563eb' : '#f3f4f6',
              color:
                selectedCategoryId === category.id ? '#fff' : '#4b5563',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: '44px',
              minWidth: '44px',
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {menus.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>
          {t('menu.noMenus')}
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px',
          }}
        >
          {menus.map((menu) => (
            <div
              key={menu.id}
              data-testid={`menu-card-${menu.id}`}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {menu.imageUrl ? (
                <img
                  src={menu.imageUrl}
                  alt={menu.name}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '120px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                  }}
                >
                  🍽️
                </div>
              )}

              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1f2937',
                    marginBottom: '4px',
                  }}
                >
                  {menu.name}
                </h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {menu.description || t('menu.noDescription')}
                </p>
                <p
                  style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    marginBottom: '8px',
                  }}
                >
                  {formatPrice(menu.price)}
                </p>
                <button
                  data-testid={`add-to-cart-btn-${menu.id}`}
                  onClick={() => handleAddToCart(menu)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  {t('menu.addToCart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuPage;
