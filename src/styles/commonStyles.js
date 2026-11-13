// src/styles/commonStyles.js
// Styles communs et réutilisables pour STACK Partners — Thème Verre Cristal & Aurora

export const getCardStyle = (isMobile) => ({
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.54) 100%)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: isMobile ? '20px' : '24px',
  borderTop: '1.5px solid rgba(255, 255, 255, 0.98)',
  borderLeft: '1.5px solid rgba(255, 255, 255, 0.92)',
  borderRight: '1px solid rgba(255, 255, 255, 0.55)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.45)',
  padding: isMobile ? '18px 16px' : '24px',
  boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.06), inset 0 1px 0 0 #ffffff',
  marginBottom: isMobile ? '16px' : '22px',
  boxSizing: 'border-box'
});

export const inputStyle = {
  flex: 1,
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  background: 'rgba(255, 255, 255, 0.85)',
  border: '1px solid rgba(255, 255, 255, 0.95)',
  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 0 #ffffff',
  borderRadius: '13px',
  fontSize: '13.5px',
  fontWeight: '500',
  color: '#0f172a',
  outline: 'none'
};

export const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '11px 18px',
  backgroundColor: '#111827',
  color: '#ffffff',
  border: 'none',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.22)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
};

export const secondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '9px 15px',
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.68) 100%)',
  color: '#111827',
  border: '1px solid rgba(255, 255, 255, 0.96)',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff',
  borderRadius: '999px',
  fontSize: '12.5px',
  fontWeight: '700',
  cursor: 'pointer'
};

export const navBtnStyle = (isActive) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  backgroundColor: isActive ? '#111827' : 'transparent',
  color: isActive ? '#ffffff' : '#475569',
  fontWeight: isActive ? '700' : '600',
  fontSize: '13.5px',
  border: 'none',
  borderRadius: '16px',
  cursor: 'pointer',
  textAlign: 'left',
  boxShadow: isActive ? '0 8px 20px -4px rgba(17, 24, 39, 0.24)' : 'none',
  transition: 'all 0.18s ease'
});
