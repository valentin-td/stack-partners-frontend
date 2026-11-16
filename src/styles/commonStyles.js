// src/styles/commonStyles.js
// Styles communs et réutilisables pour STACK Partners — Support dynamique des ambiances Jour & Nuit

export const getCardStyle = (isMobile) => ({
  background: 'var(--sp-bg-card, linear-gradient(145deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.72) 100%))',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  transform: 'translateZ(0)',
  borderRadius: isMobile ? '20px' : '24px',
  borderTop: 'var(--sp-border-card-top, 1.5px solid rgba(255, 255, 255, 0.98))',
  borderLeft: 'var(--sp-border-card-left, 1.5px solid rgba(255, 255, 255, 0.92))',
  borderRight: 'var(--sp-border-card-right, 1px solid rgba(255, 255, 255, 0.60))',
  borderBottom: 'var(--sp-border-card-bottom, 1px solid rgba(255, 255, 255, 0.50))',
  padding: isMobile ? '18px 16px' : '24px',
  boxShadow: 'var(--sp-shadow-card, 0 10px 28px -6px rgba(15, 23, 42, 0.05), inset 0 1px 0 0 #ffffff)',
  marginBottom: isMobile ? '16px' : '22px',
  boxSizing: 'border-box',
  color: 'var(--sp-text-main, #0f172a)'
});

export const inputStyle = {
  flex: 1,
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  background: 'var(--sp-bg-input, rgba(255, 255, 255, 0.92))',
  border: 'var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.32))',
  boxShadow: 'var(--sp-shadow-input, 0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 0 #ffffff)',
  borderRadius: '13px',
  fontSize: '13.5px',
  fontWeight: '500',
  color: 'var(--sp-text-main, #0f172a)',
  outline: 'none'
};

export const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '11px 18px',
  backgroundColor: 'var(--sp-btn-primary, #111827)',
  color: 'var(--sp-btn-primary-text, #ffffff)',
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
  background: 'var(--sp-bg-pill, linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.68) 100%))',
  color: 'var(--sp-text-main, #111827)',
  border: 'var(--sp-border-pill, 1px solid rgba(255, 255, 255, 0.96))',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff)',
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
  backgroundColor: isActive ? 'var(--sp-nav-active-bg, #111827)' : 'transparent',
  color: isActive ? 'var(--sp-nav-active-color, #ffffff)' : 'var(--sp-text-muted, #475569)',
  fontWeight: isActive ? '700' : '600',
  fontSize: '13.5px',
  border: 'none',
  borderRadius: '16px',
  cursor: 'pointer',
  textAlign: 'left',
  boxShadow: isActive ? '0 8px 20px -4px rgba(17, 24, 39, 0.24)' : 'none',
  transition: 'all 0.18s ease'
});
