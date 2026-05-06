import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CartBadge from './CartBadge';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    i18n.changeLanguage(newLang);
    localStorage.setItem('customer-language', newLang);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/menu', label: t('nav.menu'), icon: '🍽️' },
    { path: '/cart', label: t('nav.cart'), icon: '🛒', hasBadge: true },
    { path: '/orders', label: t('nav.orders'), icon: '📋' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, paddingBottom: '70px', overflowY: 'auto' }}>
        <Outlet />
      </div>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: '#fff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 1000,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              padding: '4px 12px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isActive(item.path) ? '#2563eb' : '#6b7280',
              fontSize: '11px',
              fontWeight: isActive(item.path) ? 600 : 400,
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>
              {item.icon}
            </span>
            {item.hasBadge && <CartBadge />}
            <span>{item.label}</span>
          </button>
        ))}

        <button
          onClick={toggleLanguage}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px',
            padding: '4px 12px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: '20px', marginBottom: '2px' }}>🌐</span>
          <span>{t('nav.language')}</span>
        </button>
      </nav>
    </div>
  );
}

export default Layout;
