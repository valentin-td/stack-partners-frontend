// src/components/common/Toast.jsx
// Notification flottante temporaire (succes ou erreur)

export default function Toast({ toastMsg, isMobile }) {
  if (!toastMsg) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? '90px' : '28px',
        right: isMobile ? '16px' : '28px',
        left: isMobile ? '16px' : 'auto',
        maxWidth: isMobile ? 'none' : '420px',
        zIndex: 99999,
        backgroundColor: toastMsg.isError ? '#fef2f2' : '#111827',
        color: toastMsg.isError ? '#dc2626' : '#ffffff',
        border: toastMsg.isError ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.12)',
        padding: '14px 20px',
        borderRadius: '14px',
        fontSize: '13.5px',
        fontWeight: '600',
        boxShadow: '0 14px 35px rgba(0,0,0,0.22)'
      }}
    >
      {toastMsg.text}
    </div>
  );
}
