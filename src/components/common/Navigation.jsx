// src/components/common/Navigation.jsx
// Barre de navigation desktop (sidebar) et mobile (en-tete sticky + barre fixe en bas)

import { Icon } from './Icons';
import { navBtnStyle } from '../../styles/commonStyles';

export default function Navigation({
  isMobile,
  activeTab,
  setActiveTab,
  agent,
  profilData,
  isSuperAdmin,
  onLogout
}) {
  return (
    <>
      {/* EN-TETE MOBILE STICKY */}
      {isMobile && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 900,
            backgroundColor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e5e7eb',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <img
              src="/stack-logo-light.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/IMG_6804.png';
              }}
              alt="STACK"
              style={{ height: '22px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.02em' }}>
              Portail Partenaires
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 11px',
                borderRadius: '999px',
                backgroundColor: activeTab === 'profil' ? '#111827' : '#f3f4f6',
                color: activeTab === 'profil' ? '#ffffff' : '#111827',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: profilData?.autorise_a_vendre ? '#22c55e' : '#f59e0b'
                }}
              />
              <span style={{ textTransform: 'capitalize' }}>
                {agent?.prenom || agent?.nom || 'Mon Profil'}
              </span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              title="Déconnexion"
              style={{
                padding: '7px 9px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Icon.Logout />
            </button>
          </div>
        </div>
      )}

      {/* BANDEAU LATERAL GAUCHE (DESKTOP) */}
      {!isMobile && (
        <div
          style={{
            width: '260px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ marginBottom: '24px', paddingLeft: '6px' }}>
            <img
              src="/stack-logo-light.png"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/IMG_6804.png';
              }}
              alt="STACK"
              style={{ height: '28px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', marginTop: '6px', letterSpacing: '0.02em' }}>
              Portail Partenaires
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('profil')}
            style={{
              width: '100%',
              textAlign: 'left',
              backgroundColor: activeTab === 'profil' ? '#111827' : '#f6f6f7',
              border: activeTab === 'profil' ? '1px solid #111827' : '1px solid #e5e7eb',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '28px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: profilData?.autorise_a_vendre ? '#22c55e' : '#f59e0b'
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: activeTab === 'profil' ? '#ffffff' : '#111827',
                    textTransform: 'capitalize'
                  }}
                >
                  {agent?.prenom} {agent?.nom}
                </span>
              </div>
              <div
                style={{
                  fontSize: '11.5px',
                  color: activeTab === 'profil' ? '#9ca3af' : '#6b7280',
                  marginTop: '4px',
                  fontFamily: 'monospace'
                }}
              >
                {agent?.code}
              </div>
            </div>
            <div style={{ color: activeTab === 'profil' ? '#ffffff' : '#6b7280' }}>
              <Icon.User />
            </div>
          </button>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button type="button" onClick={() => setActiveTab('bord')} style={navBtnStyle(activeTab === 'bord')}>
              <Icon.Bord /> Tableau de Bord
            </button>
            <button type="button" onClick={() => setActiveTab('prospects')} style={navBtnStyle(activeTab === 'prospects')}>
              <Icon.Prospects /> Mes Prospects
            </button>
            <button type="button" onClick={() => setActiveTab('carte')} style={navBtnStyle(activeTab === 'carte')}>
              <Icon.MapPin /> Carte Prospection
            </button>
            <button type="button" onClick={() => setActiveTab('factures')} style={navBtnStyle(activeTab === 'factures')}>
              <Icon.Factures /> Factures Onboarding
            </button>
            <button type="button" onClick={() => setActiveTab('stock')} style={navBtnStyle(activeTab === 'stock')}>
              <Icon.Stock /> Stock & TPE
            </button>
            <button type="button" onClick={() => setActiveTab('academie')} style={navBtnStyle(activeTab === 'academie')}>
              <Icon.Academie /> Académie & Tutos
            </button>

            {isSuperAdmin && (
              <>
                <div style={{ margin: '12px 0', borderTop: '1px solid #e5e7eb' }} />
                <button
                  type="button"
                  onClick={() => setActiveTab('godmode')}
                  style={{
                    ...navBtnStyle(activeTab === 'godmode'),
                    backgroundColor: activeTab === 'godmode' ? '#111827' : '#f9fafb',
                    color: activeTab === 'godmode' ? '#ffffff' : '#111827',
                    border: '1px solid #e5e7eb',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon.Shield /> God Mode
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: activeTab === 'godmode' ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                      color: activeTab === 'godmode' ? '#fff' : '#374151'
                    }}
                  >
                    ADMIN
                  </span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              color: '#dc2626',
              border: '1px solid #fecaca',
              padding: '11px 14px',
              cursor: 'pointer',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: '600'
            }}
          >
            <Icon.Logout /> Quitter
          </button>
        </div>
      )}

      {/* BARRE DE NAVIGATION MOBILE FIXE EN BAS */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 950,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid #e5e7eb',
            display: 'grid',
            gridTemplateColumns: `repeat(${isSuperAdmin ? 7 : 6}, 1fr)`,
            padding: '6px 4px calc(6px + env(safe-area-inset-bottom, 0px)) 4px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.04)'
          }}
        >
          {[
            { key: 'bord', label: 'Bord', icon: <Icon.Bord /> },
            { key: 'prospects', label: 'Leads', icon: <Icon.Prospects /> },
            { key: 'carte', label: 'Carte', icon: <Icon.MapPin /> },
            { key: 'stock', label: 'Stock', icon: <Icon.Stock /> },
            { key: 'academie', label: 'Tutos', icon: <Icon.Academie /> },
            ...(isSuperAdmin ? [{ key: 'godmode', label: 'Admin', icon: <Icon.Shield /> }] : [])
          ].map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  color: active ? '#111827' : '#9ca3af',
                  fontWeight: active ? '700' : '500',
                  fontSize: '10.5px',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    backgroundColor: active ? '#f3f4f6' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
