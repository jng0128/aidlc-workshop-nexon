import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useAuthStore } from '../stores/authStore';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f6fa',
};

const formStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px',
};

const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '32px',
  fontSize: '24px',
  fontWeight: 700,
  color: '#2c3e50',
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#333',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#3498db',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '8px',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#fdecea',
  color: '#c0392b',
  padding: '10px 12px',
  borderRadius: '4px',
  fontSize: '13px',
  marginBottom: '16px',
};

interface LoginResponse {
  accessToken: string;
  expiresIn: string;
  admin: {
    id: number;
    username: string;
    storeId: number;
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [storeIdentifier, setStoreIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<LoginResponse>('/auth/admin/login', {
        storeIdentifier,
        username,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.admin);
      navigate('/dashboard');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit} data-testid="login-form">
        <h1 style={titleStyle}>테이블오더 관리자</h1>

        {loginMutation.isError && (
          <div style={errorStyle} data-testid="login-error-message">
            {(loginMutation.error as any)?.response?.data?.message || '로그인에 실패했습니다'}
          </div>
        )}

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="storeIdentifier">매장 식별자</label>
          <input
            id="storeIdentifier"
            type="text"
            style={inputStyle}
            value={storeIdentifier}
            onChange={(e) => setStoreIdentifier(e.target.value)}
            placeholder="매장 식별자를 입력하세요"
            required
            data-testid="login-store-input"
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="username">사용자명</label>
          <input
            id="username"
            type="text"
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자명을 입력하세요"
            required
            data-testid="login-username-input"
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
            data-testid="login-password-input"
          />
        </div>

        <button
          type="submit"
          style={{
            ...buttonStyle,
            opacity: loginMutation.isPending ? 0.7 : 1,
          }}
          disabled={loginMutation.isPending}
          data-testid="login-submit-button"
        >
          {loginMutation.isPending ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
