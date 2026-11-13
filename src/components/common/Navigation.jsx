// src/components/common/Navigation.jsx
// Barre de navigation desktop (dock flottant en verre dépoli) et mobile (en-tête + barre flottante)

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
      <style>{`
        html, body, #root {
          background-color: #dce5f2 !important;
          background-image:
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.24) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.2) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.16) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(14, 165, 233, 0.2) 0px, transparent 50%) !important;
          background-attachment: fixed !important;
          color: #0f172a;
        }
        .sp-glass-panel {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.54) 100%);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1.5px solid rgba(255, 255, 255, 0.98);
          border-left: 1.5px solid rgba(255, 255, 255, 0.92);
          border-right: 1px solid rgba(255, 255, 255, 0.55);
          border-bottom: 1px solid rgba(255, 255, 255, 0.45);
          box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.06), inset 0 1px 0 0 #ffffff;
          border-radius: 24px;
        }
        .sp-glass-pill {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.66) 100%);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
        }
        .sp-nav-btn:hover {
          background-color: rgba(255, 255, 255, 0.55);
        }
      `}</style>

      {/* EN-TÊTE MOBILE STICKY EN VERRE */}
      {isMobile && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 900,
            background: 'rgba(255, 255, 255, 0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.85)',
            padding: '10px 16px',
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
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', letterSpacing: '0.02em' }}>
              Portail Partenaires
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className="sp-glass-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: activeTab === 'profil' ? '#111827' : undefined,
                color: activeTab === 'profil' ? '#ffffff' : '#0f172a',
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
                  backgroundColor: profilData?.autorise_a_vendre ? '#10b981' : '#f59e0b'
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
                borderRadius: '11px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.22)',
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

      {/* DOCK LATÉRAL GAUCHE FLOTTANT EN VERRE (DESKTOP) */}
      {!isMobile && (
        <div
          style={{
            width: '256px',
            padding: '18px 0 18px 18px',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="sp-glass-panel"
            style={{
              height: '100%',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              borderRadius: '28px'
            }}
          >
            {/* Logo STACK Partenaires centré comme sur la maquette */}
            <div style={{ marginBottom: '20px', textAlign: 'center', padding: '4px 8px' }}>
              <img
                src="/stack-logo-light.png"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/IMG_6804.png';
                }}
                alt="STACK"
                style={{ height: '30px', width: 'auto', objectFit: 'contain', display: 'inline-block' }}
              />
              <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
                Partenaires
              </div>
            </div>

            {/* Carte profil de l'agent */}
            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className={activeTab === 'profil' ? '' : 'sp-glass-pill'}
              style={{
                width: '100%',
                textAlign: 'left',
                background: activeTab === 'profil' ? '#111827' : undefined,
                border: activeTab === 'profil' ? '1px solid #111827' : undefined,
                borderRadius: '16px',
                padding: '11px 14px',
                marginBottom: '22px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: profilData?.autorise_a_vendre ? '#10b981' : '#f59e0b',
                      boxShadow: profilData?.autorise_a_vendre ? '0 0 6px #10b981' : 'none',
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color: activeTab === 'profil' ? '#ffffff' : '#0f172a',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {agent?.prenom} {agent?.nom}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: activeTab === 'profil' ? '#94a3b8' : '#64748b',
                    marginTop: '3px',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}
                >
                  {agent?.code}
                </div>
              </div>
              <div style={{ color: activeTab === 'profil' ? '#ffffff' : '#64748b', flexShrink: 0 }}>
                <Icon.User />
              </div>
            </button>

            {/* Liens de navigation */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto' }}>
              <button type="button" onClick={() => setActiveTab('bord')} style={navBtnStyle(activeTab === 'bord')}>
                <Icon.Bord /> Tableau de bord
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
                  <div style={{ margin: '10px 4px', borderTop: '1px solid rgba(148, 163, 184, 0.22)' }} />
                  <button
                    type="button"
                    onClick={() => setActiveTab('godmode')}
                    className={activeTab === 'godmode' ? '' : 'sp-glass-pill'}
                    style={{
                      ...navBtnStyle(activeTab === 'godmode'),
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon.Shield /> God Mode
                    </span>
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: '800',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        backgroundColor: activeTab === 'godmode' ? 'rgba(255,255,255,0.2)' : 'rgba(15, 23, 42, 0.08)',
                        color: activeTab === 'godmode' ? '#ffffff' : '#334155'
                      }}
                    >
                      ADMIN
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Bouton Se déconnecter en bas */}
            <button
              type="button"
              onClick={onLogout}
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'rgba(254, 226, 226, 0.65)',
                color: '#dc2626',
                border: '1px solid rgba(252, 165, 165, 0.5)',
                padding: '11px 14px',
                cursor: 'pointer',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '700',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon.Logout /> Se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* BARRE DE NAVIGATION MOBILE FLOTTANTE EN BAS */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 'max(14px, env(safe-area-inset-bottom, 10px))',
            left: '12px',
            right: '12px',
            zIndex: 950,
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: '1.5px solid #ffffff',
            borderRadius: '26px',
            display: 'grid',
            gridTemplateColumns: `repeat(${isSuperAdmin ? 6 : 5}, 1fr)`,
            padding: '5px 6px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)'
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
                  background: active ? 'rgba(15, 23, 42, 0.08)' : 'none',
                  border: 'none',
                  borderRadius: '18px',
                  padding: '6px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  color: active ? '#0f172a' : '#64748b',
                  fontWeight: active ? '800' : '600',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
