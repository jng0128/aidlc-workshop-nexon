import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const overlayStyle: React.CSSProperties = {
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

const modalStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '24px',
  minWidth: '320px',
  maxWidth: '480px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '18px',
  fontWeight: 600,
};

const messageStyle: React.CSSProperties = {
  margin: '0 0 24px 0',
  fontSize: '14px',
  color: '#555',
  lineHeight: 1.5,
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
};

const cancelButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};

const confirmButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#e74c3c',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle} data-testid="confirm-modal-overlay" onClick={onCancel}>
      <div style={modalStyle} data-testid="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyle} data-testid="confirm-modal-title">{title}</h3>
        <p style={messageStyle} data-testid="confirm-modal-message">{message}</p>
        <div style={buttonContainerStyle}>
          <button
            style={cancelButtonStyle}
            onClick={onCancel}
            data-testid="confirm-modal-cancel"
          >
            취소
          </button>
          <button
            style={confirmButtonStyle}
            onClick={onConfirm}
            data-testid="confirm-modal-confirm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
