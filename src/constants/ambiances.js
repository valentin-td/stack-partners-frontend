// src/constants/ambiances.js
// Palettes et ambiances STACK Partner haute lisibilité (Jour & Nuit)
// Identiques aux ambiances du salon, adaptées au confort visuel des agents commerciaux

export const AMBIANCES_PARTNER_JOUR = {
  AURORA: {
    nom: 'Verre Aurora',
    sousTitre: 'STACK Partenaires Pastel (Signature)',
    bg: '#dce5f2',
    dot: '#6366f1',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(232, 240, 249, 0.74) 100%)',
    sidebarBorder: 'rgba(99, 102, 241, 0.22)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
    sidebarActiveBorder: 'rgba(99, 102, 241, 0.38)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.24) 0px, transparent 52%),
      radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.20) 0px, transparent 52%),
      radial-gradient(at 100% 100%, rgba(245, 158, 11, 0.16) 0px, transparent 52%),
      radial-gradient(at 0% 100%, rgba(14, 165, 233, 0.20) 0px, transparent 52%)
    `
  },
  SAUGE: {
    nom: 'Brume de Sauge',
    sousTitre: 'Spa Botanique & Naturel',
    bg: '#edf2f0',
    dot: '#10b981',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(236, 243, 239, 0.74) 100%)',
    sidebarBorder: 'rgba(16, 185, 129, 0.20)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'linear-gradient(145deg, #13271f 0%, #0c1a14 100%)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.35)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(148, 163, 184, 0.16) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.10) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(203, 213, 225, 0.45) 0px, transparent 55%)
    `
  },
  LIN: {
    nom: 'Lin & Travertin',
    sousTitre: 'Cabinet Élégant & Architecte',
    bg: '#f3f1ed',
    dot: '#a89f91',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(243, 239, 233, 0.74) 100%)',
    sidebarBorder: 'rgba(168, 159, 145, 0.24)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'linear-gradient(145deg, #25211c 0%, #171410 100%)',
    sidebarActiveBorder: 'rgba(168, 159, 145, 0.40)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(214, 203, 187, 0.36) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.05) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(217, 199, 178, 0.30) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(231, 229, 228, 0.6) 0px, transparent 55%)
    `
  },
  ARDOISE: {
    nom: 'Cristal d’Ardoise',
    sousTitre: 'Studio Moderne & Linear',
    bg: '#eef2f6',
    dot: '#64748b',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(235, 241, 248, 0.74) 100%)',
    sidebarBorder: 'rgba(148, 163, 184, 0.24)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'linear-gradient(145deg, #182232 0%, #0f1722 100%)',
    sidebarActiveBorder: 'rgba(148, 163, 184, 0.38)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(148, 163, 184, 0.20) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.08) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.06) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(203, 213, 225, 0.5) 0px, transparent 55%)
    `
  },
  CACHEMIRE: {
    nom: 'Cachemire Doux',
    sousTitre: 'Nuance Chaude & Chaleureuse',
    bg: '#f4f0ee',
    dot: '#d4b8ab',
    sidebarDock: 'linear-gradient(160deg, rgba(255, 255, 255, 0.88) 0%, rgba(246, 239, 235, 0.74) 100%)',
    sidebarBorder: 'rgba(212, 184, 171, 0.28)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.98)',
    sidebarActive: 'linear-gradient(145deg, #2d2220 0%, #1b1311 100%)',
    sidebarActiveBorder: 'rgba(212, 184, 171, 0.42)',
    sidebarLogoBg: 'rgba(255, 255, 255, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(224, 205, 196, 0.34) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(235, 225, 218, 0.48) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(214, 195, 185, 0.26) 0px, transparent 55%),
      radial-gradient(at 0% 100%, rgba(245, 240, 236, 0.65) 0px, transparent 55%)
    `
  }
};

export const AMBIANCES_PARTNER_NUIT = {
  CARBONE: {
    nom: '1. Carbone & Obsidienne',
    sousTitre: 'Noir Pur Oled & Émeraude (Recommandé)',
    bg: '#0b0d10',
    card: 'linear-gradient(145deg, rgba(24, 26, 31, 0.92) 0%, rgba(17, 19, 23, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(34, 37, 44, 0.92) 0%, rgba(26, 29, 36, 0.86) 100%)',
    dot: '#10b981',
    sidebarDock: 'linear-gradient(160deg, rgba(22, 24, 29, 0.96) 0%, rgba(14, 16, 20, 0.92) 100%)',
    sidebarBorder: 'rgba(255, 255, 255, 0.10)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.20)',
    sidebarActive: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.60)',
    sidebarLogoBg: 'rgba(30, 34, 42, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.12) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.10) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(148, 163, 184, 0.05) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(15, 23, 42, 0.9) 0px, transparent 65%)
    `
  },
  ESPRESSO: {
    nom: '2. Espresso & Bronze',
    sousTitre: 'Café Lounge & Ambre Chaud',
    bg: '#100c0a',
    card: 'linear-gradient(145deg, rgba(32, 26, 23, 0.92) 0%, rgba(23, 18, 16, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(46, 37, 33, 0.92) 0%, rgba(33, 26, 23, 0.86) 100%)',
    dot: '#d97706',
    sidebarDock: 'linear-gradient(160deg, rgba(28, 22, 19, 0.96) 0%, rgba(19, 15, 13, 0.92) 100%)',
    sidebarBorder: 'rgba(217, 119, 6, 0.20)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.18)',
    sidebarActive: 'linear-gradient(145deg, #d97706 0%, #b45309 100%)',
    sidebarActiveBorder: 'rgba(217, 119, 6, 0.60)',
    sidebarLogoBg: 'rgba(40, 31, 27, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(217, 119, 6, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(180, 83, 9, 0.10) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(120, 53, 15, 0.12) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(20, 15, 12, 0.9) 0px, transparent 65%)
    `
  },
  MINUIT: {
    nom: '3. Minuit & Saphir',
    sousTitre: 'Nuit Bleue Profonde & Étoilée',
    bg: '#0a0d14',
    card: 'linear-gradient(145deg, rgba(20, 26, 38, 0.92) 0%, rgba(14, 19, 29, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(30, 38, 54, 0.92) 0%, rgba(21, 28, 41, 0.86) 100%)',
    dot: '#38bdf8',
    sidebarDock: 'linear-gradient(160deg, rgba(17, 23, 35, 0.96) 0%, rgba(11, 15, 24, 0.92) 100%)',
    sidebarBorder: 'rgba(56, 189, 248, 0.20)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.18)',
    sidebarActive: 'linear-gradient(145deg, #0284c7 0%, #0369a1 100%)',
    sidebarActiveBorder: 'rgba(56, 189, 248, 0.60)',
    sidebarLogoBg: 'rgba(25, 34, 50, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.10) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(10, 13, 20, 0.9) 0px, transparent 65%)
    `
  },
  MONOCHROME: {
    nom: '4. Monochrome Titane',
    sousTitre: 'Gris Neutre Spatial & Minimaliste',
    bg: '#121214',
    card: 'linear-gradient(145deg, rgba(28, 28, 32, 0.92) 0%, rgba(20, 20, 24, 0.86) 100%)',
    pill: 'linear-gradient(145deg, rgba(40, 40, 46, 0.92) 0%, rgba(30, 30, 35, 0.86) 100%)',
    dot: '#94a3b8',
    sidebarDock: 'linear-gradient(160deg, rgba(25, 25, 29, 0.96) 0%, rgba(16, 16, 19, 0.92) 100%)',
    sidebarBorder: 'rgba(255, 255, 255, 0.10)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.18)',
    sidebarActive: 'linear-gradient(145deg, #475569 0%, #334155 100%)',
    sidebarActiveBorder: 'rgba(148, 163, 184, 0.60)',
    sidebarLogoBg: 'rgba(35, 35, 41, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(148, 163, 184, 0.12) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(255, 255, 255, 0.05) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(100, 116, 139, 0.08) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(18, 18, 20, 0.9) 0px, transparent 65%)
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
    sidebarBorder: 'rgba(16, 185, 129, 0.20)',
    sidebarBorderTop: 'rgba(255, 255, 255, 0.18)',
    sidebarActive: 'linear-gradient(145deg, #059669 0%, #047857 100%)',
    sidebarActiveBorder: 'rgba(16, 185, 129, 0.60)',
    sidebarLogoBg: 'rgba(24, 37, 30, 0.95)',
    gradient: `
      radial-gradient(at 0% 0%, rgba(5, 150, 105, 0.15) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.10) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(6, 95, 70, 0.12) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(10, 15, 13, 0.9) 0px, transparent 65%)
    `
  }
};

/**
 * Charge les préférences d'ambiance sauvegardées dans le localStorage.
 */
export const chargerAmbiancePartner = () => {
  if (typeof window === 'undefined') {
    return { isDarkMode: false, themeJour: 'AURORA', themeNuit: 'CARBONE' };
  }
  try {
    const rawDark = localStorage.getItem('stack_partner_is_dark');
    const isDarkMode = rawDark !== null ? rawDark === 'true' : false;
    const themeJour = localStorage.getItem('stack_partner_theme_jour') || 'AURORA';
    const themeNuit = localStorage.getItem('stack_partner_theme_nuit') || 'CARBONE';
    return { isDarkMode, themeJour, themeNuit };
  } catch (e) {
    return { isDarkMode: false, themeJour: 'AURORA', themeNuit: 'CARBONE' };
  }
};

/**
 * Applique l'ambiance globale à STACK Partner en temps réel.
 * Met à jour le DOM, injecte les variables CSS, active la classe .dark-mode et diffuse un événement.
 */
export const appliquerAmbiancePartner = ({
  isDarkMode = false,
  themeJourCle = 'AURORA',
  themeNuitCle = 'CARBONE',
  broadcast = true
} = {}) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const cleJour = AMBIANCES_PARTNER_JOUR[themeJourCle] ? themeJourCle : 'AURORA';
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

    // Bascule de la classe .dark-mode sur <html> et <body>
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }

    // Injection ou mise à jour de la feuille de style dynamique dédiée
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
        --sp-bg-card: color-mix(in srgb, #ffffff 88%, ${ambianceJour.bg} 12%) !important;
        --sp-border-card: 1px solid rgba(148, 163, 184, 0.28) !important;
        --sp-border-card-top: 1.5px solid rgba(255, 255, 255, 0.98) !important;
        --sp-border-card-left: 1.5px solid rgba(255, 255, 255, 0.92) !important;
        --sp-border-card-right: 1px solid rgba(148, 163, 184, 0.20) !important;
        --sp-border-card-bottom: 1px solid rgba(148, 163, 184, 0.20) !important;
        --sp-shadow-card: 0 10px 28px -6px rgba(15, 23, 42, 0.05), inset 0 1px 0 0 #ffffff !important;
        --sp-bg-pill: color-mix(in srgb, #ffffff 92%, ${ambianceJour.bg} 8%) !important;
        --sp-border-pill: 1px solid rgba(148, 163, 184, 0.24) !important;
        --sp-text-main: #0f172a !important;
        --sp-text-muted: #64748b !important;
        --sp-bg-input: rgba(255, 255, 255, 0.92) !important;
        --sp-border-input: 1px solid rgba(148, 163, 184, 0.32) !important;
        --sp-shadow-input: 0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 0 #ffffff !important;
        --sp-btn-primary: #111827 !important;
        --sp-btn-primary-text: #ffffff !important;
        --sp-sidebar-dock: ${ambianceJour.sidebarDock} !important;
        --sp-sidebar-border: ${ambianceJour.sidebarBorder} !important;
        --sp-sidebar-border-top: ${ambianceJour.sidebarBorderTop} !important;
        --sp-sidebar-active: ${ambianceJour.sidebarActive} !important;
        --sp-sidebar-active-border: ${ambianceJour.sidebarActiveBorder} !important;
        --sp-nav-active-bg: #111827 !important;
        --sp-nav-active-color: #ffffff !important;
        --sp-mobile-header-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.82) 100%) !important;
        --sp-mobile-bottom-bg: rgba(255, 255, 255, 0.90) !important;
        background-color: ${ambianceJour.bg} !important;
      }

      /* AMBIANCE SOMBRE (NUIT) */
      html.dark-mode, body.dark-mode {
        --sp-bg-app: ${ambianceNuit.bg} !important;
        --sp-gradient-app: ${ambianceNuit.gradient} !important;
        --sp-bg-card: ${ambianceNuit.card || 'rgba(24, 26, 31, 0.92)'} !important;
        --sp-border-card: 1px solid rgba(255, 255, 255, 0.10) !important;
        --sp-border-card-top: 1.5px solid rgba(255, 255, 255, 0.16) !important;
        --sp-border-card-left: 1.5px solid rgba(255, 255, 255, 0.12) !important;
        --sp-border-card-right: 1px solid rgba(255, 255, 255, 0.08) !important;
        --sp-border-card-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
        --sp-shadow-card: 0 16px 40px -8px rgba(0, 0, 0, 0.60) !important;
        --sp-bg-pill: ${ambianceNuit.pill || 'rgba(34, 37, 44, 0.92)'} !important;
        --sp-border-pill: 1px solid rgba(255, 255, 255, 0.12) !important;
        --sp-text-main: #f8fafc !important;
        --sp-text-muted: #94a3b8 !important;
        --sp-bg-input: rgba(30, 34, 42, 0.95) !important;
        --sp-border-input: 1px solid rgba(255, 255, 255, 0.14) !important;
        --sp-shadow-input: 0 2px 8px rgba(0, 0, 0, 0.35) !important;
        --sp-btn-primary: #ffffff !important;
        --sp-btn-primary-text: #0f172a !important;
        --sp-sidebar-dock: ${ambianceNuit.sidebarDock} !important;
        --sp-sidebar-border: ${ambianceNuit.sidebarBorder} !important;
        --sp-sidebar-border-top: ${ambianceNuit.sidebarBorderTop} !important;
        --sp-sidebar-active: ${ambianceNuit.sidebarActive} !important;
        --sp-sidebar-active-border: ${ambianceNuit.sidebarActiveBorder} !important;
        --sp-nav-active-bg: #ffffff !important;
        --sp-nav-active-color: #0f172a !important;
        --sp-mobile-header-bg: linear-gradient(180deg, rgba(17, 20, 26, 0.94) 0%, rgba(12, 14, 18, 0.88) 100%) !important;
        --sp-mobile-bottom-bg: rgba(20, 24, 32, 0.94) !important;
        background-color: ${ambianceNuit.bg} !important;
        color: #f8fafc !important;
      }

      /* Synchronisation dynamique des fonds d'ambiance */
      .sp-ambient-bg, .sp-aurora-bg {
        background-color: ${activeAmbiance.bg} !important;
        background-image: ${activeAmbiance.gradient} !important;
        transition: background-color 0.25s ease;
      }

      /* Synchronisation des cartes et pilules */
      html:not(.dark-mode) .sp-glass-panel, body:not(.dark-mode) .sp-glass-panel {
        background: color-mix(in srgb, #ffffff 88%, ${ambianceJour.bg} 12%) !important;
        border: 1px solid rgba(148, 163, 184, 0.28) !important;
      }
      html:not(.dark-mode) .sp-glass-pill, body:not(.dark-mode) .sp-glass-pill {
        background: color-mix(in srgb, #ffffff 92%, ${ambianceJour.bg} 8%) !important;
        border: 1px solid rgba(148, 163, 184, 0.22) !important;
      }

      html.dark-mode .sp-glass-panel, body.dark-mode .sp-glass-panel {
        background: ${ambianceNuit.card} !important;
        border: 1px solid rgba(255, 255, 255, 0.10) !important;
        border-top: 1.5px solid rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.60) !important;
        color: #f8fafc !important;
      }
      html.dark-mode .sp-glass-pill, body.dark-mode .sp-glass-pill {
        background: ${ambianceNuit.pill} !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        color: #f8fafc !important;
      }

      /* Textes et titres en mode Nuit */
      html.dark-mode h1, html.dark-mode h2, html.dark-mode h3, html.dark-mode h4 {
        color: #f8fafc !important;
      }
      html.dark-mode .sp-step-nav-card {
        background: ${ambianceNuit.pill} !important;
        border: 1px solid rgba(255, 255, 255, 0.10) !important;
        color: #f8fafc !important;
      }
      html.dark-mode .sp-step-nav-card.active {
        background: rgba(255, 255, 255, 0.15) !important;
        border: 1.5px solid #ffffff !important;
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
        border: 1px solid rgba(255, 255, 255, 0.10) !important;
        color: #f8fafc !important;
      }
    `;

    // Métadonnées système pour PWA et barre d'état
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
