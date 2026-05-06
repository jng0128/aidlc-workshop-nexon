import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Menu, Category } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const filterStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
};

const formContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: '12px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '13px',
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const tableContainerStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  backgroundColor: '#f8f9fa',
  borderBottom: '2px solid #dee2e6',
  fontSize: '14px',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #eee',
  fontSize: '14px',
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

interface MenuFormData {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  categoryId: string;
}

const emptyForm: MenuFormData = {
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  categoryId: '',
};

export default function MenuManagementPage() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState<MenuFormData>(emptyForm);
  const [deleteMenuId, setDeleteMenuId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data;
    },
  });

  // Fetch menus
  const { data: menus = [], isLoading } = useQuery<Menu[]>({
    queryKey: ['menus', selectedCategoryId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      const res = await apiClient.get('/menus', { params });
      return res.data;
    },
  });

  // Create menu mutation
  const createMutation = useMutation({
    mutationFn: async (data: MenuFormData) => {
      const res = await apiClient.post('/menus', {
        name: data.name,
        price: parseInt(data.price, 10),
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
        categoryId: parseInt(data.categoryId, 10),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      resetForm();
    },
  });

  // Update menu mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MenuFormData }) => {
      const res = await apiClient.patch(`/menus/${id}`, {
        name: data.name,
        price: parseInt(data.price, 10),
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
        categoryId: parseInt(data.categoryId, 10),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      resetForm();
    },
  });

  // Delete menu mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/menus/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      setDeleteMenuId(null);
    },
  });

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingMenu(null);
    setIsFormOpen(false);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      price: String(menu.price),
      description: menu.description || '',
      imageUrl: menu.imageUrl || '',
      categoryId: String(menu.categoryId),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMenu) {
      updateMutation.mutate({ id: editingMenu.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>메뉴 관리</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            style={filterStyle}
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            data-testid="menu-category-filter"
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            style={btnStyle('#3498db')}
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            data-testid="menu-add-btn"
          >
            + 메뉴 추가
          </button>
        </div>
      </div>

      {/* Menu Form */}
      {isFormOpen && (
        <div style={formContainerStyle} data-testid="menu-form">
          <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>
            {editingMenu ? '메뉴 수정' : '메뉴 추가'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>메뉴명 *</label>
                <input
                  style={inputStyle}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="메뉴명"
                  required
                  data-testid="menu-name-input"
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>가격 *</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="가격"
                  required
                  min="0"
                  data-testid="menu-price-input"
                />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>카테고리 *</label>
                <select
                  style={inputStyle}
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  data-testid="menu-category-input"
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>이미지 URL</label>
                <input
                  style={inputStyle}
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="menu-image-input"
                />
              </div>
              <div style={{ ...inputGroupStyle, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>설명</label>
                <input
                  style={inputStyle}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="메뉴 설명"
                  data-testid="menu-description-input"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button type="submit" style={btnStyle('#27ae60')} data-testid="menu-submit-btn">
                {editingMenu ? '수정' : '추가'}
              </button>
              <button type="button" style={btnStyle('#95a5a6')} onClick={resetForm}>
                취소
              </button>
            </div>
            {(createMutation.isError || updateMutation.isError) && (
              <div style={{ color: '#e74c3c', fontSize: '13px', marginTop: '8px' }}>
                {((createMutation.error || updateMutation.error) as any)?.response?.data?.message || '저장에 실패했습니다'}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Menu List */}
      <table style={tableContainerStyle} data-testid="menu-list">
        <thead>
          <tr>
            <th style={thStyle}>메뉴명</th>
            <th style={thStyle}>가격</th>
            <th style={thStyle}>카테고리</th>
            <th style={thStyle}>이미지</th>
            <th style={thStyle}>작업</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => (
            <tr key={menu.id}>
              <td style={tdStyle}>
                <div style={{ fontWeight: 500 }}>{menu.name}</div>
                {menu.description && (
                  <div style={{ fontSize: '12px', color: '#666' }}>{menu.description}</div>
                )}
              </td>
              <td style={tdStyle}>{menu.price.toLocaleString('ko-KR')}원</td>
              <td style={tdStyle}>{menu.category?.name || '-'}</td>
              <td style={tdStyle}>
                {menu.imageUrl ? (
                  <img src={menu.imageUrl} alt={menu.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : '-'}
              </td>
              <td style={tdStyle}>
                <button
                  style={btnStyle('#f39c12')}
                  onClick={() => handleEdit(menu)}
                  data-testid={`menu-edit-btn-${menu.id}`}
                >
                  수정
                </button>
                <button
                  style={btnStyle('#e74c3c')}
                  onClick={() => setDeleteMenuId(menu.id)}
                  data-testid={`menu-delete-btn-${menu.id}`}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
          {menus.length === 0 && (
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', color: '#666' }} colSpan={5}>
                등록된 메뉴가 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={!!deleteMenuId}
        title="메뉴 삭제"
        message="이 메뉴를 삭제하시겠습니까?"
        onConfirm={() => deleteMenuId && deleteMutation.mutate(deleteMenuId)}
        onCancel={() => setDeleteMenuId(null)}
      />
    </div>
  );
}
