// src/styles/commonStyles.js
// Styles communs et reutilisables pour STACK Partners

export const getCardStyle = (isMobile) => ({
  backgroundColor: '#ffffff',
  borderRadius: isMobile ? '18px' : '22px',
  border: '1px solid #e5e7eb',
  padding: isMobile ? '16px' : '24px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
  marginBottom: isMobile ? '16px' : '24px'
});

export const inputStyle = {
  flex: 1,
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  fontSize: '14px',
  color: '#111827',
  outline: 'none'
};

export const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 18px',
  backgroundColor: '#111827',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  fontSize: '13.5px',
  fontWeight: '600',
  cursor: 'pointer'
};

export const secondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '9px 14px',
  backgroundColor: '#f9fafb',
  color: '#111827',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '12.5px',
  fontWeight: '600',
  cursor: 'pointer'
};

export const navBtnStyle = (isActive) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  backgroundColor: isActive ? '#f3f4f6' : 'transparent',
  color: isActive ? '#111827' : '#6b7280',
  fontWeight: isActive ? '600' : '500',
  fontSize: '14px',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  textAlign: 'left'
});
