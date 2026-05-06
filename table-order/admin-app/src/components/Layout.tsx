import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSse } from '../hooks/useSse';
import { useSseStore } from '../stores/sseStore';

const layoutStyle: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
};

const sidebarStyle: React.CSSProperties = {
  width: '220px',
  backgroundColor: '#2c3e50',
  color: '#ecf0f1',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0',
};

const logoStyle: React.CSSProperties = {
  padding: '0 20px 20px',
  fontSize: '18px',
  fontWeight: 700,
  borderBottom: '1px solid #34495e',
  marginBottom: '20px',
};

const navStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '12px 20px',
  color: '#bdc3c7',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'background-color 0.2s',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  backgroundColor: '#34495e',
  color: '#fff',
  borderLeft: '3px solid #3498db',
};

const footerStyle: React.CSSProperties = {
  padding: '20px',
  borderTop: '1px solid #34495e',
};

const logoutButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#e74c3c',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};

const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: '24px',
  backgroundColor: '#f5f6fa',
  overflowY: 'auto',
};

const sseIndicatorStyle = (connected: boolean): React.CSSProperties => ({
  padding: '8px 20px',
  fontSize: '12px',
  color: connected ? '#2ecc71' : '#e74c3c',
});

export default function Layout() {
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();
  const isConnected = useSseStore((state) => state.isConnected);

  // Establish SSE connection
  useSse();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={layoutStyle} data-testid="layout">
      <aside style={sidebarStyle} data-testid="sidebar">
        <div style={logoStyle}>
          테이블오더 관리
        </div>
        <nav style={navStyle}>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            data-testid="nav-dashboard"
          >
            📊 대시보드
          </NavLink>
          <NavLink
            to="/tables"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            data-testid="nav-tables"
          >
            🪑 테이블 관리
          </NavLink>
          <NavLink
            to="/menus"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            data-testid="nav-menus"
          >
            🍽️ 메뉴 관리
          </NavLink>
          <NavLink
            to="/categories"
            style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
            data-testid="nav-categories"
          >
            📁 카테고리 관리
          </NavLink>
        </nav>
        <div style={sseIndicatorStyle(isConnected)} data-testid="sse-status">
          {isConnected ? '● 실시간 연결됨' : '○ 연결 끊김'}
        </div>
        <div style={footerStyle}>
          {admin && (
            <div style={{ fontSize: '12px', marginBottom: '8px', color: '#bdc3c7' }}>
              {admin.username}
            </div>
          )}
          <button
            style={logoutButtonStyle}
            onClick={handleLogout}
            data-testid="logout-button"
          >
            로그아웃
          </button>
        </div>
      </aside>
      <main style={mainStyle} data-testid="main-content">
        <Outlet />
      </main>
    </div>
  );
}
