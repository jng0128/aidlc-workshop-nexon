import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { TableInfo, OrderHistory } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const tableStyle: React.CSSProperties = {
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
  width: '150px',
};

const btnStyle = (color: string): React.CSSProperties => ({
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: color,
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  marginRight: '6px',
});

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '24px',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '80vh',
  overflowY: 'auto',
};

export default function TableManagementPage() {
  const queryClient = useQueryClient();
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmTableId, setConfirmTableId] = useState<number | null>(null);
  const [historyTableId, setHistoryTableId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch tables
  const { data: tables = [], isLoading } = useQuery<TableInfo[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await apiClient.get('/tables');
      return res.data;
    },
  });

  // Fetch history for selected table
  const { data: history = [] } = useQuery<OrderHistory[]>({
    queryKey: ['history', historyTableId, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const res = await apiClient.get(`/sessions/${historyTableId}/history`, { params });
      return res.data;
    },
    enabled: !!historyTableId,
  });

  // Add table mutation
  const addTableMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/tables', {
        tableNumber: parseInt(tableNumber, 10),
        password,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setTableNumber('');
      setPassword('');
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: async (tableId: number) => {
      const res = await apiClient.post(`/sessions/${tableId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setConfirmTableId(null);
    },
  });

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber || !password) return;
    addTableMutation.mutate();
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>테이블 관리</h1>
      </div>

      {/* Add Table Form */}
      <div style={formContainerStyle} data-testid="add-table-form">
        <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>테이블 추가</h3>
        <form onSubmit={handleAddTable} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <input
            type="number"
            style={inputStyle}
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="테이블 번호"
            required
            data-testid="table-number-input"
          />
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            data-testid="table-password-input"
          />
          <button type="submit" style={btnStyle('#3498db')} disabled={addTableMutation.isPending} data-testid="table-add-btn">
            {addTableMutation.isPending ? '추가 중...' : '추가'}
          </button>
        </form>
        {addTableMutation.isError && (
          <div style={{ color: '#e74c3c', fontSize: '13px', marginTop: '8px' }}>
            {(addTableMutation.error as any)?.response?.data?.message || '테이블 추가에 실패했습니다'}
          </div>
        )}
      </div>

      {/* Table List */}
      <table style={tableStyle} data-testid="table-list">
        <thead>
          <tr>
            <th style={thStyle}>테이블 번호</th>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>작업</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table.id}>
              <td style={tdStyle}>{table.tableNumber}번 테이블</td>
              <td style={tdStyle}>{table.id}</td>
              <td style={tdStyle}>
                <button
                  style={btnStyle('#e67e22')}
                  onClick={() => setConfirmTableId(table.id)}
                  data-testid={`complete-session-btn-${table.id}`}
                >
                  이용 완료
                </button>
                <button
                  style={btnStyle('#8e44ad')}
                  onClick={() => setHistoryTableId(table.id)}
                  data-testid={`history-btn-${table.id}`}
                >
                  과거 내역
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Complete Session Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmTableId}
        title="이용 완료"
        message="해당 테이블의 이용을 완료 처리하시겠습니까? 현재 세션이 종료됩니다."
        onConfirm={() => confirmTableId && completeSessionMutation.mutate(confirmTableId)}
        onCancel={() => setConfirmTableId(null)}
      />

      {/* History Modal */}
      {historyTableId && (
        <div style={modalOverlayStyle} onClick={() => setHistoryTableId(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()} data-testid="history-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>
                테이블 {tables.find((t) => t.id === historyTableId)?.tableNumber} 과거 내역
              </h2>
              <button
                style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => setHistoryTableId(null)}
              >
                ✕
              </button>
            </div>

            {/* Date Filter */}
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="date"
                style={inputStyle}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="history-start-date"
              />
              <span>~</span>
              <input
                type="date"
                style={inputStyle}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="history-end-date"
              />
            </div>

            {/* History List */}
            {history.length === 0 && <p style={{ color: '#666' }}>이력이 없습니다</p>}
            {history.map((item) => (
              <div
                key={item.id}
                style={{ border: '1px solid #eee', borderRadius: '6px', padding: '12px', marginBottom: '8px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{item.orderNumber}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(item.completedAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {item.orderData?.items?.map((oi: any, idx: number) => (
                    <span key={idx}>
                      {oi.menuName}×{oi.quantity}
                      {idx < item.orderData.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
                <div style={{ fontWeight: 600, marginTop: '4px' }}>
                  {item.totalAmount.toLocaleString('ko-KR')}원
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
