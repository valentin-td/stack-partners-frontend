// src/components/common/Navigation.jsx
// Barre de navigation desktop (dock flottant en verre dépoli) et mobile (en-tête + barre flottante)
// Support dynamique des thèmes Jour & Nuit STACK Partner

import { Icon } from './Icons';
import { navBtnStyle } from '../../styles/commonStyles';

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
  return (
    <>
      <style>{`
        /* Calque fixe fluide pour conserver l'ambiance active sur toute la hauteur */
        .sp-aurora-bg, .sp-ambient-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-color: var(--sp-bg-app, #dce5f2);
          background-image: var(--sp-gradient-app);
          transition: background-color 0.25s ease;
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
            borderBottom: 'var(--sp-border-card, 1px solid rgba(255, 255, 255, 0.92))',
            boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.08), inset 0 -1px 0 rgba(148, 163, 184, 0.08)',
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
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(148, 163, 184, 0.2)',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase'
                }}
              >
                Partenaires
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Bouton Thème Jour / Nuit Rapide Mobile */}
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
                  color: 'var(--sp-text-main, #0f172a)'
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
                  background: activeTab === 'profil' ? 'var(--sp-btn-primary, #111827)' : undefined,
                  color: activeTab === 'profil' ? 'var(--sp-btn-primary-text, #ffffff)' : 'var(--sp-text-main, #0f172a)',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  border: activeTab === 'profil' ? '1px solid var(--sp-btn-primary, #111827)' : undefined,
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: profilData?.autorise_a_vendre ? '#10b981' : '#f59e0b',
                    boxShadow: profilData?.autorise_a_vendre ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
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
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.24)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transition: 'background-color 0.15s ease'
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
            width: '256px',
            padding: '18px 0 18px 18px',
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
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              borderRadius: '28px'
            }}
          >
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
              <div style={{ fontSize: '11.5px', fontWeight: '600', color: isDarkMode ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                Partenaires
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className={activeTab === 'profil' ? '' : 'sp-glass-pill'}
              style={{
                width: '100%',
                textAlign: 'left',
                background: activeTab === 'profil' ? 'var(--sp-nav-active-bg, #111827)' : undefined,
                border: activeTab === 'profil' ? '1px solid var(--sp-nav-active-bg, #111827)' : undefined,
                borderRadius: '16px',
                padding: '11px 14px',
                marginBottom: '16px',
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
                      color: activeTab === 'profil' ? 'var(--sp-nav-active-color, #ffffff)' : 'var(--sp-text-main, #0f172a)',
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
                    color: activeTab === 'profil' ? (isDarkMode ? '#0f172a' : '#cbd5e1') : 'var(--sp-text-muted, #64748b)',
                    marginTop: '3px',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}
                >
                  {agent?.code || 'STK-PARTNER'}
                </div>
              </div>
              <div style={{ color: activeTab === 'profil' ? 'var(--sp-nav-active-color, #ffffff)' : 'var(--sp-text-muted, #64748b)', flexShrink: 0 }}>
                <Icon.User />
              </div>
            </button>

            {/* Navigation des modules principaux */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('bord');
                  window.scrollTo(0, 0);
                }}
                style={navBtnStyle(activeTab === 'bord')}
              >
                <Icon.Bord /> Tableau de bord
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('prospects');
                  window.scrollTo(0, 0);
                }}
                style={navBtnStyle(activeTab === 'prospects')}
              >
                <Icon.Prospects /> Mes Prospects
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('carte');
                  window.scrollTo(0, 0);
                }}
                style={navBtnStyle(activeTab === 'carte')}
              >
                <Icon.MapPin /> Carte & Prospection
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('factures');
                  window.scrollTo(0, 0);
                }}
                style={navBtnStyle(activeTab === 'factures')}
              >
                <Icon.Factures /> Factures Onboarding
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('stock');
                  window.scrollTo(0, 0);
                }}
                style={navBtnStyle(activeTab === 'stock')}
              >
                <Icon.Stock /> Stock & TPE
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('academie');
                  window.scrollTo(0, 0);
                }}
                style={navBtnStyle(activeTab === 'academie')}
              >
                <Icon.Academie /> Académie & Tutos
              </button>

              {isSuperAdmin && (
                <>
                  <div style={{ margin: '10px 4px', borderTop: isDarkMode ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(148, 163, 184, 0.22)' }} />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('godmode');
                      window.scrollTo(0, 0);
                    }}
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
                        backgroundColor: activeTab === 'godmode' ? 'rgba(255,255,255,0.2)' : (isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.08)'),
                        color: activeTab === 'godmode' ? '#ffffff' : (isDarkMode ? '#f8fafc' : '#334155')
                      }}
                    >
                      ADMIN
                    </span>
                  </button>
                </>
              )}
            </div>

            {/* Bouton de bascule Mode Jour / Nuit Desktop */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="sp-glass-pill"
              style={{
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 14px',
                cursor: 'pointer',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                color: 'var(--sp-text-main, #0f172a)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <span>{isDarkMode ? 'Mode Nuit actif' : 'Mode Jour actif'}</span>
              </span>
              <span style={{ fontSize: '10px', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                Bascule ›
              </span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'rgba(254, 226, 226, 0.65)',
                color: '#dc2626',
                border: '1px solid rgba(252, 165, 165, 0.5)',
                padding: '10px 14px',
                cursor: 'pointer',
                borderRadius: '14px',
                fontSize: '12.5px',
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
            bottom: 'max(10px, env(safe-area-inset-bottom, 8px))',
            left: '12px',
            right: '12px',
            zIndex: 8900,
            background: 'var(--sp-mobile-bottom-bg, rgba(255, 255, 255, 0.88))',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: 'var(--sp-border-card, 1.5px solid #ffffff)',
            borderRadius: '24px',
            display: 'grid',
            gridTemplateColumns: `repeat(${isSuperAdmin ? 6 : 5}, 1fr)`,
            padding: '4px 5px',
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.12)'
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
                onClick={() => {
                  setActiveTab(item.key);
                  window.scrollTo(0, 0);
                }}
                style={{
                  background: active ? 'var(--sp-btn-primary, #111827)' : 'transparent',
                  border: 'none',
                  borderRadius: '18px',
                  padding: '6px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  color: active ? 'var(--sp-btn-primary-text, #ffffff)' : (isDarkMode ? '#94a3b8' : '#64748b'),
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
