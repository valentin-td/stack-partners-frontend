// src/constants/ambiances.js
// Palettes et ambiances STACK Partner haute lisibilité (Jour & Nuit)
// Calibrées pour travailler 10h/jour sans fatigue oculaire

export const AMBIANCES_PARTNER_JOUR = {
  LIN: {
    nom: 'Lin & Travertin',
    sousTitre: 'Cabinet Élégant & Architecte (Recommandé)',
    bg: '#f3f1ed',
    dot: '#a89f91',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(243, 239, 233, 0.76) 100%)',
    sidebarBorder: 'rgba(168, 159, 145, 0.24)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'rgba(16, 185, 129, 0.13)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.38)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(214, 203, 187, 0.34) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.05) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(217, 199, 178, 0.28) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(231, 229, 228, 0.55) 0px, transparent 55%)
    `
  },
  SAUGE: {
    nom: 'Brume de Sauge',
    sousTitre: 'Spa Botanique & Naturel',
    bg: '#edf2f0',
    dot: '#10b981',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(236, 243, 239, 0.76) 100%)',
    sidebarBorder: 'rgba(16, 185, 129, 0.20)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'rgba(16, 185, 129, 0.14)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.40)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.10) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(148, 163, 184, 0.14) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.08) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(203, 213, 225, 0.42) 0px, transparent 55%)
    `
  },
  ARDOISE: {
    nom: 'Cristal d’Ardoise',
    sousTitre: 'Studio Moderne & Linear',
    bg: '#eef2f6',
    dot: '#64748b',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(235, 241, 248, 0.76) 100%)',
    sidebarBorder: 'rgba(148, 163, 184, 0.24)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'rgba(16, 185, 129, 0.13)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.38)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(148, 163, 184, 0.16) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.06) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(203, 213, 225, 0.45) 0px, transparent 55%)
    `
  },
  CACHEMIRE: {
    nom: 'Cachemire Doux',
    sousTitre: 'Nuance Chaude & Chaleureuse',
    bg: '#f4f0ee',
    dot: '#d4b8ab',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(246, 239, 235, 0.76) 100%)',
    sidebarBorder: 'rgba(212, 184, 171, 0.28)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'rgba(16, 185, 129, 0.13)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.38)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(224, 205, 196, 0.32) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(235, 225, 218, 0.45) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(214, 195, 185, 0.24) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(245, 240, 236, 0.60) 0px, transparent 55%)
    `
  },
  AURORA: {
    nom: 'Verre Aurora (Adouci)',
    sousTitre: 'Pastel Soyeux Anti-Éblouissement',
    bg: '#eaeff7',
    dot: '#6366f1',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(238, 243, 250, 0.76) 100%)',
    sidebarBorder: 'rgba(99, 102, 241, 0.18)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'rgba(16, 185, 129, 0.13)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.38)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.11) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.09) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.07) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(14, 165, 233, 0.09) 0px, transparent 55%)
    `
  }
};

export const AMBIANCES_PARTNER_NUIT = {
  CARBONE: {
    nom: '1. Carbone & Obsidienne',
    sousTitre: 'Noir Mat & Émeraude (Recommandé)',
    bg: '#0b0d10',
    card: 'linear-gradient(145deg, rgba(24, 26, 31, 0.92) 0%, rgba(17, 19, 23, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(34, 37, 44, 0.92) 0%, rgba(26, 29, 36, 0.86) 100%)',
    dot: '#10b981',
    sidebarDock: 'linear-gradient(160deg, rgba(22, 24, 29, 0.96) 0%, rgba(14, 16, 20, 0.92) 100%)',
    sidebarBorder: 'rgba(255, 255, 255, 0.09)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.16)',
    sidebarActive: 'rgba(16, 185, 129, 0.16)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.45)',
    sidebarLogoBg: 'rgba(30, 34, 42, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(148, 163, 184, 0.05) 0px, transparent 50%)
    `
  },
  ESPRESSO: {
    nom: '2. Espresso & Bronze',
    sousTitre: 'Café Lounge & Zéro Lumière Bleue',
    bg: '#100c0a',
    card: 'linear-gradient(145deg, rgba(32, 26, 23, 0.92) 0%, rgba(23, 18, 16, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(46, 37, 33, 0.92) 0%, rgba(33, 26, 23, 0.86) 100%)',
    dot: '#d97706',
    sidebarDock: 'linear-gradient(160deg, rgba(28, 22, 19, 0.96) 0%, rgba(19, 15, 13, 0.92) 100%)',
    sidebarBorder: 'rgba(217, 119, 6, 0.18)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.15)',
    sidebarActive: 'rgba(217, 119, 6, 0.18)',
    sidebarActiveBorder: 'rgba(217, 119, 6, 0.45)',
    sidebarLogoBg: 'rgba(40, 31, 27, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(217, 119, 6, 0.09) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(120, 53, 15, 0.08) 0px, transparent 50%)
    `
  },
  MINUIT: {
    nom: '3. Minuit & Saphir',
    sousTitre: 'Nuit Bleue Profonde & Feutrée',
    bg: '#0a0d14',
    card: 'linear-gradient(145deg, rgba(20, 26, 38, 0.92) 0%, rgba(14, 19, 29, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(30, 38, 54, 0.92) 0%, rgba(21, 28, 41, 0.86) 100%)',
    dot: '#38bdf8',
    sidebarDock: 'linear-gradient(160deg, rgba(17, 23, 35, 0.96) 0%, rgba(11, 15, 24, 0.92) 100%)',
    sidebarBorder: 'rgba(56, 189, 248, 0.16)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.15)',
    sidebarActive: 'rgba(56, 189, 248, 0.16)',
    sidebarActiveBorder: 'rgba(56, 189, 248, 0.45)',
    sidebarLogoBg: 'rgba(25, 34, 50, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.09) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%)
    `
  },
  MONOCHROME: {
    nom: '4. Monochrome Titane',
    sousTitre: 'Gris Neutre Anti-Fatigue',
    bg: '#141619',
    card: 'linear-gradient(145deg, rgba(31, 34, 39, 0.92) 0%, rgba(24, 26, 30, 0.88) 100%)',
    pill: 'linear-gradient(145deg, rgba(43, 47, 54, 0.92) 0%, rgba(32, 35, 41, 0.86) 100%)',
    dot: '#94a3b8',
    sidebarDock: 'linear-gradient(160deg, rgba(25, 27, 31, 0.96) 0%, rgba(18, 20, 23, 0.92) 100%)',
    sidebarBorder: 'rgba(255, 255, 255, 0.09)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.15)',
    sidebarActive: 'rgba(148, 163, 184, 0.16)',
    sidebarActiveBorder: 'rgba(148, 163, 184, 0.45)',
    sidebarLogoBg: 'rgba(35, 35, 41, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(148, 163, 184, 0.07) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(255, 255, 255, 0.04) 0px, transparent 50%)
    `
  },
  OBSIDIENNE_FOREST: {
    nom: '5. Obsidienne & Forêt',
    sousTitre: 'Forêt Nocturne Profonde & Cyprès',
    bg: '#0a0f0d',
    card: 'linear-gradient(145deg, rgba(20, 30, 25, 0.92) 0%, rgba(14, 22, 18, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(29, 44, 37, 0.92) 0%, rgba(20, 32, 26, 0.86) 100%)',
    dot: '#059669',
    sidebarDock: 'linear-gradient(160deg, rgba(18, 27, 22, 0.96) 0%, rgba(12, 18, 15, 0.92) 100%)',
    sidebarBorder: 'rgba(16, 185, 129, 0.18)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.15)',
    sidebarActive: 'rgba(16, 185, 129, 0.16)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.45)',
    sidebarLogoBg: 'rgba(24, 37, 30, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(5, 150, 105, 0.10) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(6, 95, 70, 0.08) 0px, transparent 50%)
    `
  }
};

/**
 * Charge les préférences d'ambiance sauvegardées dans le localStorage.
 * Utilise 'LIN' (Lin & Travertin) par défaut pour un confort visuel optimal.
 */
export const chargerAmbiancePartner = () => {
  if (typeof window === 'undefined') {
    return { isDarkMode: false, themeJour: 'LIN', themeNuit: 'CARBONE' };
  }
  try {
    const rawDark = localStorage.getItem('stack_partner_is_dark');
    const isDarkMode = rawDark !== null ? rawDark === 'true' : false;
    const savedJour = localStorage.getItem('stack_partner_theme_jour');
    const themeJour = savedJour && AMBIANCES_PARTNER_JOUR[savedJour] ? savedJour : 'LIN';
    const savedNuit = localStorage.getItem('stack_partner_theme_nuit');
    const themeNuit = savedNuit && AMBIANCES_PARTNER_NUIT[savedNuit] ? savedNuit : 'CARBONE';
    return { isDarkMode, themeJour, themeNuit };
  } catch (e) {
    return { isDarkMode: false, themeJour: 'LIN', themeNuit: 'CARBONE' };
  }
};

/**
 * Applique l'ambiance globale à STACK Partner en temps réel.
 */
export const appliquerAmbiancePartner = ({
  isDarkMode = false,
  themeJourCle = 'LIN',
  themeNuitCle = 'CARBONE',
  broadcast = true
} = {}) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const cleJour = AMBIANCES_PARTNER_JOUR[themeJourCle] ? themeJourCle : 'LIN';
    const cleNuit = AMBIANCES_PARTNER_NUIT[themeNuitCle] ? themeNuitCle : 'CARBONE';
    const isDark = Boolean(isDarkMode);

    try {
      localStorage.setItem('stack_partner_is_dark', isDark ? 'true' : 'false');
      localStorage.setItem('stack_partner_theme_jour', cleJour);
      localStorage.setItem('stack_partner_theme_nuit', cleNuit);
    } catch (e) {}

    const ambianceJour = AMBIANCES_PARTNER_JOUR[cleJour];
    const ambianceNuit = AMBIANCES_PARTNER_NUIT[cleNuit];
    const activeAmbiance = isDark ? ambianceNuit : ambianceJour;

    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }

    let styleTag = document.getElementById('stack-partner-dynamic-ambiance-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'stack-partner-dynamic-ambiance-styles';
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --sp-theme-jour-cle: "${cleJour}";
        --sp-theme-nuit-cle: "${cleNuit}";
        --sp-is-dark: ${isDark ? '1' : '0'};
      }

      /* AMBIANCE CLAIRE (JOUR) */
      html:not(.dark-mode), body:not(.dark-mode) {
        --sp-bg-app: ${ambianceJour.bg} !important;
        --sp-gradient-app: ${ambianceJour.gradient} !important;
        --sp-bg-card: color-mix(in srgb, #ffffff 86%, ${ambianceJour.bg} 14%) !important;
        --sp-border-card: 1px solid rgba(148, 163, 184, 0.24) !important;
        --sp-border-card-top: 1.5px solid rgba(255, 255, 255, 0.96) !important;
        --sp-border-card-left: 1.5px solid rgba(255, 255, 255, 0.90) !important;
        --sp-border-card-right: 1px solid rgba(148, 163, 184, 0.18) !important;
        --sp-border-card-bottom: 1px solid rgba(148, 163, 184, 0.18) !important;
        --sp-shadow-card: 0 8px 24px -8px rgba(15, 23, 42, 0.05), inset 0 1px 0 0 #ffffff !important;
        --sp-bg-pill: color-mix(in srgb, #ffffff 92%, ${ambianceJour.bg} 8%) !important;
        --sp-border-pill: 1px solid rgba(148, 163, 184, 0.24) !important;
        --sp-text-main: #18181b !important;
        --sp-text-muted: #64748b !important;
        --sp-bg-input: rgba(255, 255, 255, 0.94) !important;
        --sp-border-input: 1px solid rgba(148, 163, 184, 0.30) !important;
        --sp-shadow-input: 0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 0 #ffffff !important;
        --sp-btn-primary: #18181b !important;
        --sp-btn-primary-text: #ffffff !important;
        --sp-sidebar-dock: ${ambianceJour.sidebarDock} !important;
        --sp-sidebar-border: ${ambianceJour.sidebarBorder} !important;
        --sp-sidebar-border-top: ${ambianceJour.sidebarBorderTop} !important;
        --sp-sidebar-active: ${ambianceJour.sidebarActive} !important;
        --sp-sidebar-active-border: ${ambianceJour.sidebarActiveBorder} !important;
        --sp-nav-active-bg: rgba(16, 185, 129, 0.13) !important;
        --sp-nav-active-color: #059669 !important;
        --sp-mobile-header-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.82) 100%) !important;
        --sp-mobile-bottom-bg: rgba(255, 255, 255, 0.92) !important;
        background-color: ${ambianceJour.bg} !important;
      }

      /* AMBIANCE SOMBRE (NUIT) */
      html.dark-mode, body.dark-mode {
        --sp-bg-app: ${ambianceNuit.bg} !important;
        --sp-gradient-app: ${ambianceNuit.gradient} !important;
        --sp-bg-card: ${ambianceNuit.card || 'rgba(24, 26, 31, 0.92)'} !important;
        --sp-border-card: 1px solid rgba(255, 255, 255, 0.09) !important;
        --sp-border-card-top: 1px solid rgba(255, 255, 255, 0.14) !important;
        --sp-border-card-left: 1px solid rgba(255, 255, 255, 0.10) !important;
        --sp-border-card-right: 1px solid rgba(255, 255, 255, 0.06) !important;
        --sp-border-card-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        --sp-shadow-card: 0 14px 34px -8px rgba(0, 0, 0, 0.55) !important;
        --sp-bg-pill: ${ambianceNuit.pill || 'rgba(34, 37, 44, 0.92)'} !important;
        --sp-border-pill: 1px solid rgba(255, 255, 255, 0.11) !important;
        --sp-text-main: #f4f4f5 !important;
        --sp-text-muted: #94a3b8 !important;
        --sp-bg-input: rgba(30, 34, 42, 0.95) !important;
        --sp-border-input: 1px solid rgba(255, 255, 255, 0.14) !important;
        --sp-shadow-input: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
        --sp-btn-primary: #f4f4f5 !important;
        --sp-btn-primary-text: #0b0d10 !important;
        --sp-sidebar-dock: ${ambianceNuit.sidebarDock} !important;
        --sp-sidebar-border: ${ambianceNuit.sidebarBorder} !important;
        --sp-sidebar-border-top: ${ambianceNuit.sidebarBorderTop} !important;
        --sp-sidebar-active: ${ambianceNuit.sidebarActive} !important;
        --sp-sidebar-active-border: ${ambianceNuit.sidebarActiveBorder} !important;
        --sp-nav-active-bg: rgba(16, 185, 129, 0.16) !important;
        --sp-nav-active-color: #34d399 !important;
        --sp-mobile-header-bg: linear-gradient(180deg, rgba(17, 20, 26, 0.94) 0%, rgba(12, 14, 18, 0.88) 100%) !important;
        --sp-mobile-bottom-bg: rgba(20, 24, 32, 0.94) !important;
        background-color: ${ambianceNuit.bg} !important;
        color: #f4f4f5 !important;
      }

      /* Synchronisation dynamique des fonds d'ambiance */
      .sp-ambient-bg, .sp-aurora-bg {
        background-color: ${activeAmbiance.bg} !important;
        background-image: ${activeAmbiance.gradient} !important;
        transition: background-color 0.25s ease;
      }

      /* Synchronisation des cartes et pilules */
      html:not(.dark-mode) .sp-glass-panel, body:not(.dark-mode) .sp-glass-panel {
        background: color-mix(in srgb, #ffffff 86%, ${ambianceJour.bg} 14%) !important;
        border: 1px solid rgba(148, 163, 184, 0.22) !important;
      }
      html:not(.dark-mode) .sp-glass-pill, body:not(.dark-mode) .sp-glass-pill {
        background: color-mix(in srgb, #ffffff 92%, ${ambianceJour.bg} 8%) !important;
        border: 1px solid rgba(148, 163, 184, 0.22) !important;
      }

      html.dark-mode .sp-glass-panel, body.dark-mode .sp-glass-panel {
        background: ${ambianceNuit.card} !important;
        border: 1px solid rgba(255, 255, 255, 0.09) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.14) !important;
        box-shadow: 0 14px 34px -8px rgba(0, 0, 0, 0.55) !important;
        color: #f4f4f5 !important;
      }
      html.dark-mode .sp-glass-pill, body.dark-mode .sp-glass-pill {
        background: ${ambianceNuit.pill} !important;
        border: 1px solid rgba(255, 255, 255, 0.11) !important;
        color: #f4f4f5 !important;
      }

      /* Carte maîtresse Obsidienne Émeraude */
      .sp-glass-panel-dark {
        background:
          radial-gradient(120% 120% at 95% 10%, rgba(16, 185, 129, 0.26) 0%, rgba(16, 185, 129, 0) 58%),
          linear-gradient(145deg, #162420 0%, #0f1715 100%) !important;
        border: 1px solid rgba(52, 211, 153, 0.28) !important;
        box-shadow: 0 12px 28px -8px rgba(15, 23, 21, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
        border-radius: 20px !important;
        color: #ffffff !important;
      }

      /* Textes et titres en mode Nuit */
      html.dark-mode h1, html.dark-mode h2, html.dark-mode h3, html.dark-mode h4 {
        color: #f4f4f5 !important;
      }
      html.dark-mode .sp-step-nav-card {
        background: ${ambianceNuit.pill} !important;
        border: 1px solid rgba(255, 255, 255, 0.10) !important;
        color: #f4f4f5 !important;
      }
      html.dark-mode .sp-step-nav-card.active {
        background: rgba(16, 185, 129, 0.16) !important;
        border: 1.5px solid #10b981 !important;
      }
      html.dark-mode .sp-kyc-input, html.dark-mode .sp-map-input, html.dark-mode input, html.dark-mode select {
        background: rgba(30, 34, 42, 0.95) !important;
        color: #ffffff !important;
        border-color: rgba(255, 255, 255, 0.14) !important;
      }
      html.dark-mode .sp-kyc-label {
        color: #cbd5e1 !important;
      }
      html.dark-mode .sp-salon-card {
        background: ${ambianceNuit.card} !important;
        border: 1px solid rgba(255, 255, 255, 0.09) !important;
        color: #f4f4f5 !important;
      }
    `;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', activeAmbiance.bg);

    let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaStatusBar) {
      metaStatusBar = document.createElement('meta');
      metaStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(metaStatusBar);
    }
    metaStatusBar.setAttribute('content', isDark ? 'black-translucent' : 'default');

    if (broadcast) {
      window.dispatchEvent(
        new CustomEvent('stack-partner-ambiance-change', {
          detail: {
            isDarkMode: isDark,
            themeJourCle: cleJour,
            themeNuitCle: cleNuit,
            ambianceJour,
            ambianceNuit
          }
        })
      );
    }
  } catch (err) {
    console.error('Erreur lors de l’application de l’ambiance STACK Partner :', err);
  }
};
