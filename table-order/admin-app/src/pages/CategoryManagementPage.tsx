import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Category } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const formContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
};

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  marginRight: '8px',
  width: '200px',
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

export default function CategoryManagementPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiClient.get('/categories');
      return res.data;
    },
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiClient.post('/categories', { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiClient.patch(`/categories/${id}`, { name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      resetForm();
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteCategoryId(null);
      setDeleteError(null);
    },
    onError: (error: any) => {
      setDeleteCategoryId(null);
      setDeleteError(error?.response?.data?.message || '카테고리 삭제에 실패했습니다');
    },
  });

  const resetForm = () => {
    setCategoryName('');
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, name: categoryName.trim() });
    } else {
      createMutation.mutate(categoryName.trim());
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>카테고리 관리</h1>
        <button
          style={btnStyle('#3498db')}
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          data-testid="category-add-btn"
        >
          + 카테고리 추가
        </button>
      </div>

      {/* Delete Error */}
      {deleteError && (
        <div
          style={{
            backgroundColor: '#fdecea',
            color: '#c0392b',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '16px',
          }}
          data-testid="category-delete-error"
        >
          {deleteError}
          <button
            style={{ marginLeft: '12px', border: 'none', background: 'none', cursor: 'pointer', color: '#c0392b' }}
            onClick={() => setDeleteError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Category Form */}
      {isFormOpen && (
        <div style={formContainerStyle} data-testid="category-form">
          <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>
            {editingCategory ? '카테고리 수정' : '카테고리 추가'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              style={inputStyle}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="카테고리명"
              required
              maxLength={50}
              data-testid="category-name-input"
            />
            <button type="submit" style={btnStyle('#27ae60')} data-testid="category-submit-btn">
              {editingCategory ? '수정' : '추가'}
            </button>
            <button type="button" style={btnStyle('#95a5a6')} onClick={resetForm}>
              취소
            </button>
          </form>
          {(createMutation.isError || updateMutation.isError) && (
            <div style={{ color: '#e74c3c', fontSize: '13px', marginTop: '8px' }}>
              {((createMutation.error || updateMutation.error) as any)?.response?.data?.message || '저장에 실패했습니다'}
            </div>
          )}
        </div>
      )}

      {/* Category List */}
      <table style={tableContainerStyle} data-testid="category-list">
        <thead>
          <tr>
            <th style={thStyle}>순서</th>
            <th style={thStyle}>카테고리명</th>
            <th style={thStyle}>작업</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td style={tdStyle}>{category.displayOrder + 1}</td>
              <td style={tdStyle}>{category.name}</td>
              <td style={tdStyle}>
                <button
                  style={btnStyle('#f39c12')}
                  onClick={() => handleEdit(category)}
                  data-testid={`category-edit-btn-${category.id}`}
                >
                  수정
                </button>
                <button
                  style={btnStyle('#e74c3c')}
                  onClick={() => setDeleteCategoryId(category.id)}
                  data-testid={`category-delete-btn-${category.id}`}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td style={{ ...tdStyle, textAlign: 'center', color: '#666' }} colSpan={3}>
                등록된 카테고리가 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmModal
        isOpen={!!deleteCategoryId}
        title="카테고리 삭제"
        message="이 카테고리를 삭제하시겠습니까? 카테고리 내 메뉴가 있으면 삭제할 수 없습니다."
        onConfirm={() => deleteCategoryId && deleteMutation.mutate(deleteCategoryId)}
        onCancel={() => setDeleteCategoryId(null)}
      />
    </div>
  );
}
