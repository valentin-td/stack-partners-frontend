// src/components/dashboard/AmbianceSelectorPartner.jsx
// Sélecteur d'ambiance et de confort visuel pour les agents commerciaux STACK Partner
// Permet de choisir parmi les 5 ambiances Jour et 5 nuances Nuit avec démonstrateur interactif en direct

import React, { useState, useMemo } from 'react';
import { AMBIANCES_PARTNER_JOUR, AMBIANCES_PARTNER_NUIT } from '../../constants/ambiances';

const formatEuro = (montant) => {
  const num = parseFloat(montant) || 0;
  return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
};

const DynamicSparkline = ({ color = '#10b981', width = 96, height = 28 }) => (
  <svg width={width} height={height} viewBox="0 0 96 28" fill="none" style={{ flexShrink: 0 }}>
    <path
      d="M2 22 C 20 20, 32 16, 48 18 C 64 20, 74 6, 94 3"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="94" cy="3" r="3" fill={color} />
  </svg>
);

export default function AmbianceSelectorPartner({
  agent = {},
  stats = {},
  isDarkMode = false,
  themeJour = 'AURORA',
  themeNuit = 'CARBONE',
  onChoisirThemeJour = () => {},
  onChoisirThemeNuit = () => {},
  isMobile = false
}) {
  const [modePreview, setModePreview] = useState(() => (isDarkMode ? 'NUIT' : 'JOUR'));

  const isDarkPreview = modePreview === 'NUIT';
  const activeThemeObj = isDarkPreview
    ? (AMBIANCES_PARTNER_NUIT[themeNuit] || AMBIANCES_PARTNER_NUIT.CARBONE)
    : (AMBIANCES_PARTNER_JOUR[themeJour] || AMBIANCES_PARTNER_JOUR.AURORA);

  // Données de l'agent commercial
  const agentPrenom = agent?.prenom || 'Valentin';
  const agentNom = agent?.nom || 'Samba';
  const agentCode = agent?.code || 'STK-AGENT-75';
  const autoriseAVendre = Boolean(agent?.autorise_a_vendre ?? true);

  // KPIs financiers & opérationnels
  const kpis = stats?.kpis || {};
  const commissionsAcquisesVal = parseFloat(kpis.commissions_acquises) || 1250.00;
  const commissionsAttenteVal = parseFloat(kpis.commissions_en_attente) || 450.00;
  const nbSalonsActifsVal = parseInt(kpis.nb_salons_actifs, 10) || 4;
  const seuilDeblocageVal = parseInt(kpis.seuil_deblocage, 10) || 3;
  const nbSalonsEssaiVal = parseInt(kpis.nb_salons_essai, 10) || 2;

  const dateDuJour = useMemo(() => {
    try {
      const d = new Date();
      const str = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return str.charAt(0).toUpperCase() + str.slice(1);
    } catch (e) {
      return 'Lundi 16 Novembre 2026';
    }
  }, []);

  // Teintes contextuelles du démonstrateur
  const cardBg = isDarkPreview
    ? (activeThemeObj.card || 'rgba(24, 26, 31, 0.92)')
    : `color-mix(in srgb, #ffffff 88%, ${activeThemeObj.bg} 12%)`;

  const pillBg = isDarkPreview
    ? (activeThemeObj.pill || 'rgba(34, 37, 44, 0.92)')
    : `color-mix(in srgb, #ffffff 92%, ${activeThemeObj.bg} 8%)`;

  const cardBorder = isDarkPreview
    ? '1px solid rgba(255, 255, 255, 0.10)'
    : '1px solid rgba(148, 163, 184, 0.28)';

  const textMain = isDarkPreview ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkPreview ? '#94a3b8' : '#64748b';

  return (
    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* 1. SÉLECTEUR DE MODE & PALETTE AU-DESSUS DU DÉMONSTRATEUR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '18px',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '5px',
            background: isDarkPreview ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            borderRadius: '999px',
            gap: '6px'
          }}
        >
          <button
            type="button"
            onClick={() => setModePreview('JOUR')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 22px',
              borderRadius: '999px',
              border: 'none',
              background: modePreview === 'JOUR' ? '#ffffff' : 'transparent',
              color: modePreview === 'JOUR' ? '#0f172a' : (isDarkPreview ? '#94a3b8' : '#64748b'),
              fontWeight: '800',
              fontSize: '13px',
              boxShadow: modePreview === 'JOUR' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px rgba(245, 158, 11, 0.6)' }} />
            <span>Mode Jour (Clair)</span>
          </button>

          <button
            type="button"
            onClick={() => setModePreview('NUIT')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 22px',
              borderRadius: '999px',
              border: 'none',
              background: modePreview === 'NUIT' ? '#0f172a' : 'transparent',
              color: modePreview === 'NUIT' ? '#ffffff' : (isDarkPreview ? '#94a3b8' : '#64748b'),
              fontWeight: '800',
              fontSize: '13px',
              boxShadow: modePreview === 'NUIT' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px rgba(99, 102, 241, 0.6)' }} />
            <span>Mode Nuit (Sombre)</span>
          </button>
        </div>

        <div style={{ fontSize: '12.5px', fontWeight: '700', color: isDarkPreview ? '#94a3b8' : '#64748b' }}>
          {modePreview === 'JOUR'
            ? `Ambiance Jour active : ${AMBIANCES_PARTNER_JOUR[themeJour]?.nom || 'Verre Aurora'}`
            : `Nuance Nuit active : ${AMBIANCES_PARTNER_NUIT[themeNuit]?.nom || 'Carbone & Obsidienne'}`}
        </div>
      </div>

      {/* 2. LE DÉMONSTRATEUR COCKPIT STACK PARTNER */}
      <div
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: isDarkPreview ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(148, 163, 184, 0.28)',
          boxShadow: isDarkPreview
            ? '0 24px 60px -12px rgba(0, 0, 0, 0.65)'
            : '0 20px 48px -10px rgba(15, 23, 42, 0.10)',
          backgroundColor: activeThemeObj.bg,
          backgroundImage: activeThemeObj.gradient,
          padding: isMobile ? '16px' : '22px',
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
          boxSizing: 'border-box',
          width: '100%',
          position: 'relative'
        }}
      >
        {/* SÉLECTEUR DE PALETTES EN BANDEAU SUPÉRIEUR */}
        <div
          style={{
            background: isDarkPreview ? 'rgba(24, 26, 32, 0.88)' : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isDarkPreview ? '1px solid rgba(255, 255, 255, 0.10)' : '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: '18px',
            padding: '12px 14px',
            marginBottom: '20px',
            boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: isDarkPreview ? '#94a3b8' : '#64748b',
              marginBottom: '8px'
            }}
          >
            {modePreview === 'JOUR'
              ? 'Choisir votre palette Jour (5 ambiances inspirées du salon)'
              : 'Choisir votre nuance Nuit (5 ambiances reposantes anti-fatigue)'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
            {Object.entries(modePreview === 'JOUR' ? AMBIANCES_PARTNER_JOUR : AMBIANCES_PARTNER_NUIT).map(([cle, item]) => {
              const estSelectionne = modePreview === 'JOUR' ? themeJour === cle : themeNuit === cle;
              return (
                <button
                  key={cle}
                  type="button"
                  onClick={() => (modePreview === 'JOUR' ? onChoisirThemeJour(cle) : onChoisirThemeNuit(cle))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '12px',
                    border: estSelectionne
                      ? (isDarkPreview ? '1.5px solid #ffffff' : '1.5px solid #0f172a')
                      : (isDarkPreview ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(148, 163, 184, 0.22)'),
                    background: estSelectionne
                      ? (isDarkPreview ? 'rgba(255, 255, 255, 0.12)' : '#ffffff')
                      : (isDarkPreview ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.45)'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: estSelectionne ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: item.dot,
                      boxShadow: `0 0 8px ${item.dot}`,
                      flexShrink: 0
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: isDarkPreview ? '#ffffff' : '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.nom}
                    </div>
                    {item.sousTitre && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: isDarkPreview ? '#94a3b8' : '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '1px'
                        }}
                      >
                        {item.sousTitre}
                      </div>
                    )}
                  </div>
                  {estSelectionne && (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: isDarkPreview ? '#34d399' : '#059669', flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENEUR DU PORTAIL STACK PARTNER : MINI-DOCK + COCKPIT */}
        <div style={{ display: 'flex', gap: isMobile ? '10px' : '18px', alignItems: 'flex-start' }}>
          {/* APERÇU DU DOCK GAUCHE STACK PARTNER */}
          {!isMobile && (
            <div
              style={{
                width: '58px',
                borderRadius: '20px',
                background: activeThemeObj.sidebarDock,
                border: `1px solid ${activeThemeObj.sidebarBorder}`,
                borderTop: `1.5px solid ${activeThemeObj.sidebarBorderTop}`,
                boxShadow: isDarkPreview ? '0 16px 36px -8px rgba(0,0,0,0.5)' : '0 14px 32px -8px rgba(15,23,42,0.08)',
                padding: '12px 5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'all 0.25s ease'
              }}
            >
              {/* Logo STACK Partner */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: activeThemeObj.sidebarLogoBg,
                  border: `1px solid ${activeThemeObj.sidebarBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  color: isDarkPreview ? '#ffffff' : '#0f172a',
                  fontSize: '11px',
                  fontWeight: '900',
                  overflow: 'hidden'
                }}
              >
                ST
              </div>

              <div style={{ width: '24px', height: '1px', background: activeThemeObj.sidebarBorder, margin: '2px 0 4px 0' }} />

              {/* Onglet actif : Bord */}
              <div
                style={{
                  width: '46px',
                  height: '40px',
                  borderRadius: '10px',
                  background: activeThemeObj.sidebarActive,
                  border: `1px solid ${activeThemeObj.sidebarActiveBorder}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.18)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span style={{ fontSize: '8.5px', fontWeight: '800' }}>Bord</span>
              </div>

              {/* Autres modules partenaires */}
              {[
                { id: 'prospects', label: 'Leads', icon: <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /> },
                { id: 'carte', label: 'Carte', icon: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /> },
                { id: 'factures', label: 'Factures', icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
                { id: 'stock', label: 'Stock', icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /> },
                { id: 'academie', label: 'Tutos', icon: <polygon points="12 2 2 7 12 12 22 7 12 2" /> }
              ].map((item) => (
                <div
                  key={item.id}
                  style={{
                    width: '46px',
                    height: '36px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    color: isDarkPreview ? '#94a3b8' : '#64748b',
                    opacity: 0.85
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                  <span style={{ fontSize: '8px', fontWeight: '600' }}>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* CONTENU PRINCIPAL DU COCKPIT STACK PARTNER */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* EN-TÊTE DU COCKPIT */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '800',
                      color: textMain,
                      letterSpacing: '-0.025em'
                    }}
                  >
                    Tableau de bord
                  </h2>

                  {/* Capsule Identité Agent */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: pillBg,
                      border: cardBorder,
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: textMain
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                    <span>{agentPrenom} {agentNom}</span>
                    <span style={{ fontSize: '10px', color: textSecondary, fontFamily: 'monospace' }}>({agentCode})</span>
                  </div>

                  {/* Badge Statut de Vente */}
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      background: autoriseAVendre ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)',
                      border: autoriseAVendre ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                      color: autoriseAVendre ? '#059669' : '#b45309'
                    }}
                  >
                    {autoriseAVendre ? 'Vente Autorisée' : 'Dossier en validation'}
                  </span>
                </div>

                <span style={{ fontSize: '11.5px', color: textSecondary, marginTop: '3px', display: 'block', fontWeight: '500' }}>
                  {dateDuJour} • Portefeuille Partenaire STACK
                </span>
              </div>

              {/* Bouton Clic & Go */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div
                  style={{
                    padding: '7px 13px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: textMain,
                    background: pillBg,
                    border: cardBorder
                  }}
                >
                  Objectif Palier : {nbSalonsActifsVal}/{seuilDeblocageVal} salons
                </div>
              </div>
            </div>

            {/* 3. LES 4 CARTES KPIS DU COCKPIT COMMERCIAL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr 1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              {/* KPI 1 : COMMISSIONS ACQUISES (Carte Exécutive) */}
              <div
                style={{
                  background: isDarkPreview ? 'rgba(20, 24, 33, 0.95)' : '#0f172a',
                  border: isDarkPreview ? '1px solid rgba(255, 255, 255, 0.10)' : 'none',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.14)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255, 255, 255, 0.68)' }}>
                    Commissions acquises
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                    Factures ›
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontSize: '25px', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>
                    {formatEuro(commissionsAcquisesVal)}
                  </div>
                  <DynamicSparkline color="#10b981" width={80} height={24} />
                </div>
              </div>

              {/* KPI 2 : SALONS ACTIFS */}
              <div
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: textSecondary }}>
                  Salons actifs
                </span>
                <div style={{ fontSize: '25px', fontWeight: '800', color: textMain, letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {nbSalonsActifsVal} salons
                </div>
              </div>

              {/* KPI 3 : COMMISSIONS EN ATTENTE */}
              <div
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: textSecondary }}>
                    En attente
                  </span>
                  <span style={{ fontSize: '11px', color: textSecondary }}>›</span>
                </div>
                <div style={{ fontSize: '25px', fontWeight: '800', color: textMain, letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {formatEuro(commissionsAttenteVal)}
                </div>
              </div>

              {/* KPI 4 : SALONS À L'ESSAI */}
              <div
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: textSecondary }}>
                  En période d'essai
                </span>
                <div style={{ fontSize: '25px', fontWeight: '800', color: textMain, letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {nbSalonsEssaiVal} en cours
                </div>
              </div>
            </div>

            {/* 4. GRILLE BENTO : PROSPECTS RÉCENTS & PROGRESSION */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '12px' }}>
              {/* Carte Prospects Récents */}
              <div
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: textMain }}>
                    Derniers prospects terrain
                  </h4>
                  <span style={{ fontSize: '11px', color: textSecondary, fontWeight: '700' }}>
                    Voir tout ›
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { nom: 'L’Atelier Coiffure Paris 11', ville: 'Paris (75011)', statut: 'Protégé 45j', color: '#10b981' },
                    { nom: 'Barber Studio République', ville: 'Paris (75003)', statut: 'Essai Pro', color: '#0284c7' },
                    { nom: 'Maison Éclat & Spa', ville: 'Boulogne (92100)', statut: 'Installé', color: '#b45309' }
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '11px',
                        background: pillBg,
                        border: cardBorder
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.nom}
                        </div>
                        <div style={{ fontSize: '10.5px', color: textSecondary }}>
                          {p.ville}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '2px 7px',
                          borderRadius: '999px',
                          background: `${p.color}18`,
                          color: p.color,
                          flexShrink: 0
                        }}
                      >
                        • {p.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carte Déblocage Palier */}
              <div
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: '16px',
                  padding: '16px 18px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13.5px', fontWeight: '800', color: textMain }}>
                    Palier de déblocage commissions
                  </h4>
                  <p style={{ margin: 0, fontSize: '11.5px', color: textSecondary, lineHeight: 1.4 }}>
                    Dès 3 salons actifs abonnés à STACK, l'intégralité de vos virements mensuels de commissions est débloquée.
                  </p>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: '700', color: textMain, marginBottom: '5px' }}>
                    <span>Progression du palier</span>
                    <span style={{ color: '#059669' }}>100% (Atteint)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(148, 163, 184, 0.22)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: '#10b981', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: isDarkPreview ? '#94a3b8' : '#64748b' }}>
        L'ambiance choisie est automatiquement enregistrée et appliquée à l'ensemble de votre interface STACK Partner sur ordinateur, tablette et smartphone.
      </div>
    </div>
  );
}
