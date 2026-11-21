// src/components/common/Navigation.jsx
// Barre de navigation desktop (dock flottant en verre dépoli) et mobile (en-tête + barre flottante)
// Ergonomie Salon Premium : zéro bouton noir ou rouge agressif, confort visuel longue durée

import { Icon } from './Icons';

export default function Navigation({
  isMobile,
  activeTab,
  setActiveTab,
  agent,
  profilData,
  isSuperAdmin,
  onLogout,
  isDarkMode = false,
  onToggleTheme = () => {}
}) {
  // Style doux et non agressif pour les éléments de navigation de la barre latérale
  const getSoftNavBtnStyle = (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    padding: '10px 13px',
    borderRadius: '13px',
    border: isActive
      ? isDarkMode
        ? '1px solid rgba(16, 185, 129, 0.42)'
        : '1px solid rgba(16, 185, 129, 0.35)'
      : '1px solid transparent',
    background: isActive
      ? isDarkMode
        ? 'rgba(16, 185, 129, 0.16)'
        : 'rgba(16, 185, 129, 0.13)'
      : 'transparent',
    color: isActive
      ? isDarkMode
        ? '#34d399'
        : '#059669'
      : 'var(--sp-text-main, #18181b)',
    fontSize: '13px',
    fontWeight: isActive ? '800' : '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    boxSizing: 'border-box'
  });

  const navItems = [
    { key: 'bord', label: 'Tableau de bord', shortLabel: 'Bord', icon: <Icon.Bord /> },
    { key: 'prospects', label: 'Mes Prospects', shortLabel: 'Leads', icon: <Icon.Prospects /> },
    { key: 'carte', label: 'Carte & Prospection', shortLabel: 'Carte', icon: <Icon.MapPin /> },
    { key: 'simulateur', label: 'Simulateur Anti-Planity', shortLabel: 'Simulateur', icon: <Icon.Calculator /> },
    { key: 'factures', label: 'Factures Onboarding', shortLabel: 'Factures', icon: <Icon.Factures /> },
    { key: 'stock', label: 'Stock & TPE', shortLabel: 'Stock', icon: <Icon.Stock /> },
    { key: 'academie', label: 'Académie & Tutos', shortLabel: 'Tutos', icon: <Icon.Academie /> }
  ];

  return (
    <>
      <style>{`
        .sp-aurora-bg, .sp-ambient-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-color: var(--sp-bg-app, #f3f1ed);
          background-image: var(--sp-gradient-app);
          transition: background-color 0.25s ease;
        }
        .sp-sidebar-link:hover {
          background: rgba(148, 163, 184, 0.12) !important;
        }
        .sp-logout-btn {
          background: transparent;
          color: var(--sp-text-muted, #64748b);
          border: 1px solid var(--sp-border-pill, rgba(148, 163, 184, 0.24));
        }
        .sp-logout-btn:hover {
          background: rgba(220, 38, 38, 0.09) !important;
          color: #dc2626 !important;
          border-color: rgba(220, 38, 38, 0.28) !important;
        }
      `}</style>

      {/* Fond d'ambiance fixe sur iOS et Desktop */}
      <div className="sp-aurora-bg" />

      {/* EN-TÊTE MOBILE FIXE ET FLOU AVEC SAFE-AREA IPHONE */}
      {isMobile && (
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 9000,
            background: 'var(--sp-mobile-header-bg, linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.82) 100%))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: 'var(--sp-border-card, 1px solid rgba(148, 163, 184, 0.22))',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.06)',
            paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
            paddingLeft: 'max(env(safe-area-inset-left, 0px), 14px)',
            paddingRight: 'max(env(safe-area-inset-right, 0px), 14px)',
            paddingBottom: '9px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div
              onClick={() => setActiveTab('bord')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
              title="Tableau de bord"
            >
              <img
                src="/stack-logo-light.png"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/IMG_6804.png';
                }}
                alt="STACK"
                style={{ height: '22px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  color: 'var(--sp-text-muted, #64748b)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                  border: 'var(--sp-border-pill)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                Partenaires
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={onToggleTheme}
                title={isDarkMode ? 'Passer en mode jour' : 'Passer en mode nuit'}
                className="sp-glass-pill"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'var(--sp-text-main, #18181b)'
                }}
              >
                {isDarkMode ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profil')}
                className="sp-glass-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 11px',
                  borderRadius: '999px',
                  background: activeTab === 'profil' ? 'rgba(16, 185, 129, 0.14)' : undefined,
                  color: activeTab === 'profil' ? '#059669' : 'var(--sp-text-main, #18181b)',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  border: activeTab === 'profil' ? '1px solid rgba(16, 185, 129, 0.4)' : undefined
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: profilData?.autorise_a_vendre ? '#10b981' : '#f59e0b'
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>
                  {agent?.prenom || agent?.nom || 'Profil'}
                </span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Déconnexion"
                className="sp-glass-pill"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  color: 'var(--sp-text-muted, #64748b)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Icon.Logout />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* DOCK LATÉRAL GAUCHE FLOTTANT EN VERRE (DESKTOP) */}
      {!isMobile && (
        <div
          style={{
            width: '248px',
            padding: '16px 0 16px 16px',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            boxSizing: 'border-box',
            zIndex: 10
          }}
        >
          <div
            className="sp-glass-panel"
            style={{
              height: '100%',
              padding: '20px 14px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              borderRadius: '24px'
            }}
          >
            {/* En-tête Logo */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/stack-logo-light.png"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/IMG_6804.png';
                  }}
                  alt="STACK"
                  style={{ height: '24px', width: 'auto', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: isDarkMode ? '#34d399' : '#059669'
              }}>
                Partners
              </span>
            </div>

            {/* Carte Profil Partenaire */}
            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className="sp-glass-pill"
              style={{
                width: '100%',
                textAlign: 'left',
                background: activeTab === 'profil' ? 'rgba(16, 185, 129, 0.14)' : undefined,
                border: activeTab === 'profil' ? '1.5px solid rgba(16, 185, 129, 0.42)' : undefined,
                borderRadius: '15px',
                padding: '10px 12px',
                marginBottom: '14px',
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
                      flexShrink: 0
                    }}
                  />
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color: activeTab === 'profil' ? (isDarkMode ? '#34d399' : '#059669') : 'var(--sp-text-main, #18181b)',
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
                    fontSize: '10.5px',
                    color: 'var(--sp-text-muted, #64748b)',
                    marginTop: '2px',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}
                >
                  {agent?.code || 'STK-PARTNER'}
                </div>
              </div>
              <div style={{ color: activeTab === 'profil' ? '#059669' : 'var(--sp-text-muted, #64748b)', flexShrink: 0 }}>
                <Icon.User />
              </div>
            </button>

            {/* Navigation des modules principaux (Sans barre noire agressive) */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
              {navItems.map((item) => {
                const isActif = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key);
                      window.scrollTo(0, 0);
                    }}
                    className={isActif ? '' : 'sp-sidebar-link'}
                    style={getSoftNavBtnStyle(isActif)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      {item.icon}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    </span>
                    {isActif && (
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                        flexShrink: 0
                      }} />
                    )}
                  </button>
                );
              })}

              {isSuperAdmin && (
                <>
                  <div style={{ margin: '8px 4px', borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(148, 163, 184, 0.18)' }} />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('godmode');
                      window.scrollTo(0, 0);
                    }}
                    className={activeTab === 'godmode' ? '' : 'sp-sidebar-link'}
                    style={getSoftNavBtnStyle(activeTab === 'godmode')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon.Shield /> God Mode
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: '800',
                        padding: '2px 7px',
                        borderRadius: '999px',
                        backgroundColor: activeTab === 'godmode' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.14)',
                        color: activeTab === 'godmode' ? (isDarkMode ? '#34d399' : '#059669') : 'var(--sp-text-muted, #64748b)'
                      }}
                    >
                      ADMIN
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Pied de barre latérale : Mode Jour/Nuit + Déconnexion sobre sur la même ligne */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(148, 163, 184, 0.18)' }}>
              <button
                type="button"
                onClick={onToggleTheme}
                className="sp-glass-pill"
                title={isDarkMode ? 'Passer en mode Jour' : 'Passer en mode Nuit'}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  padding: '9px 10px',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--sp-text-main, #18181b)'
                }}
              >
                {isDarkMode ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                <span>{isDarkMode ? 'Mode Nuit' : 'Mode Jour'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Se déconnecter"
                className="sp-logout-btn"
                style={{
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer',
                  borderRadius: '12px',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon.Logout />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRE DE NAVIGATION MOBILE FLOTTANTE EN BAS */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 'max(10px, env(safe-area-inset-bottom, 8px))',
            left: '12px',
            right: '12px',
            zIndex: 8900,
            background: 'var(--sp-mobile-bottom-bg, rgba(255, 255, 255, 0.90))',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: 'var(--sp-border-card, 1px solid rgba(148, 163, 184, 0.22))',
            borderRadius: '24px',
            display: 'grid',
            gridTemplateColumns: `repeat(${isSuperAdmin ? 7 : 6}, 1fr)`,
            padding: '4px 5px',
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.10)'
          }}
        >
          {[
            { key: 'bord', label: 'Bord', icon: <Icon.Bord /> },
            { key: 'prospects', label: 'Leads', icon: <Icon.Prospects /> },
            { key: 'carte', label: 'Carte', icon: <Icon.MapPin /> },
            { key: 'simulateur', label: 'Simulateur', icon: <Icon.Calculator /> },
            { key: 'stock', label: 'Stock', icon: <Icon.Stock /> },
            { key: 'academie', label: 'Tutos', icon: <Icon.Academie /> },
            ...(isSuperAdmin ? [{ key: 'godmode', label: 'Admin', icon: <Icon.Shield /> }] : [])
          ].map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key);
                  window.scrollTo(0, 0);
                }}
                style={{
                  background: active ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                  borderRadius: '18px',
                  padding: '6px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  color: active ? (isDarkMode ? '#34d399' : '#059669') : (isDarkMode ? '#94a3b8' : '#64748b'),
                  fontWeight: active ? '800' : '600',
                  fontSize: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
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
