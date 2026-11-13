// src/components/dashboard/TabProspects.jsx
// Onglet 2 : Pipeline prospects en Verre Cristal, jauge de protection 45j, filtres CRM et modale 2 colonnes

import React, { useState, useMemo } from 'react';
import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';

const capitalizeWords = (str) => {
  const s = String(str || '').trim();
  if (!s) return '';
  return s
    .split(/\s+/)
    .map(word =>
      word
        .split('-')
        .map(part => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
        .join('-')
    )
    .join(' ');
};

const getInitialesSalon = (nom = '') => {
  const parts = String(nom || 'S').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return String(parts[0] || 'PR').slice(0, 2).toUpperCase();
};

export default function TabProspects({
  prospects = [],
  showProspectForm,
  setShowProspectForm,
  prospectData = {},
  setProspectData,
  prospectError,
  handleCreateProspect,
  handleOnboarding,
  isMobile
}) {
  const [filtreStatut, setFiltreStatut] = useState('TOUS'); // 'TOUS' | 'PROTEGES' | 'SIGNES' | 'EXPIRES'
  const [rechercheLead, setRechercheLead] = useState('');

  const listeProspects = Array.isArray(prospects) ? prospects : [];

  // Calcul des KPIs du pipeline commercial
  const { nbTotal, nbProteges, nbSignes, nbExpires, nbUrgents, tauxConversion, relancesPrioritaires } = useMemo(() => {
    let proteges = 0;
    let signes = 0;
    let expires = 0;
    let urgents = 0;

    listeProspects.forEach(p => {
      const jours = parseInt(p.jours_restants, 10) || 0;
      if (p.statut_prospect === 'SIGNE') {
        signes += 1;
      } else if (p.est_protege) {
        proteges += 1;
        if (jours <= 14) urgents += 1;
      } else {
        expires += 1;
      }
    });

    const total = listeProspects.length;
    const conv = total > 0 ? Math.round((signes / total) * 100) : 0;

    // Tri des prospects protégés par urgence (jours restants croissants)
    const prioritaires = [...listeProspects]
      .filter(p => p.statut_prospect !== 'SIGNE' && p.est_protege)
      .sort((a, b) => (parseInt(a.jours_restants, 10) || 0) - (parseInt(b.jours_restants, 10) || 0))
      .slice(0, 3);

    return {
      nbTotal: total,
      nbProteges: proteges,
      nbSignes: signes,
      nbExpires: expires,
      nbUrgents: urgents,
      tauxConversion: conv,
      relancesPrioritaires: prioritaires
    };
  }, [listeProspects]);

  // Filtrage par onglet et par recherche texte
  const prospectsFiltres = useMemo(() => {
    const q = rechercheLead.trim().toLowerCase();

    return listeProspects.filter(p => {
      if (filtreStatut === 'PROTEGES' && (p.statut_prospect === 'SIGNE' || !p.est_protege)) return false;
      if (filtreStatut === 'SIGNES' && p.statut_prospect !== 'SIGNE') return false;
      if (filtreStatut === 'EXPIRES' && (p.statut_prospect === 'SIGNE' || p.est_protege)) return false;

      if (!q) return true;
      const matchNom = String(p.nom_salon || '').toLowerCase().includes(q);
      const matchVille = String(p.ville || '').toLowerCase().includes(q);
      const matchSiret = String(p.siret_prospect || '').toLowerCase().includes(q);
      const matchEmail = String(p.email_gerant || '').toLowerCase().includes(q);
      return matchNom || matchVille || matchSiret || matchEmail;
    });
  }, [listeProspects, filtreStatut, rechercheLead]);

  const dateExpirationApercu = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  return (
    <div style={{ paddingBottom: isMobile ? '90px' : '24px' }}>
      <style>{`
        .sp-lead-row {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.66) 100%);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 4px 14px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 18px;
          padding: 14px 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sp-lead-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px -6px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff;
        }
        .sp-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100020;
          background: rgba(15, 23, 42, 0.42);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          box-sizing: border-box;
        }
        .sp-modal-box {
          width: 100%;
          max-width: 880px;
          max-height: 90dvh;
          overflow-y: auto;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 249, 253, 0.9) 100%);
          border: 1.5px solid #ffffff;
          box-shadow: 0 28px 68px -12px rgba(15, 23, 42, 0.25), inset 0 1px 0 #ffffff;
          border-radius: 26px;
          color: #0f172a;
          box-sizing: border-box;
        }
        .sp-field-input {
          width: 100%;
          box-sizing: border-box;
          height: 42px;
          padding: 0 13px;
          background: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.32);
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .sp-field-input:focus {
          border-color: #0f172a;
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE MES PROSPECTS + BOUTON RÉSERVER UN LEAD                  */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          gap: '14px',
          marginBottom: isMobile ? '18px' : '22px'
        }}
      >
        <div>
          <span
            className="sp-glass-pill"
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '10.5px',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '6px'
            }}
          >
            Pipeline Commercial & Exclusivité 45 Jours
          </span>
          <h1
            style={{
              fontSize: isMobile ? '24px' : '30px',
              fontWeight: '800',
              margin: '0 0 4px 0',
              letterSpacing: '-0.03em',
              color: '#0f172a',
              lineHeight: 1.1
            }}
          >
            Mes Prospects
          </h1>
          <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
            Réservez vos salons par SIRET pour verrouiller votre priorité commerciale pendant 45 jours.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowProspectForm(true)}
          style={{
            height: '42px',
            padding: '0 20px',
            borderRadius: '999px',
            backgroundColor: '#111827',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 10px 22px -4px rgba(17, 24, 39, 0.24)',
            alignSelf: isMobile ? 'stretch' : 'auto'
          }}
        >
          <Icon.Plus />
          <span>Réserver un Lead</span>
        </button>
      </header>

      {/* =================================================================== */}
      {/* 2. LES 4 KPIS DU PIPELINE (VERRE CRISTAL, SANS FAUX GRAPHIQUES)     */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '22px'
        }}
      >
        {/* KPI 1 : Total Leads déclarés */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px 14px' : '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.08)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon.Prospects />
            </div>
            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '700', color: '#64748b' }}>
              Portefeuille
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbTotal}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Leads déclarés
            </div>
          </div>
        </div>

        {/* KPI 2 : Leads Protégés (45j) */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px 14px' : '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon.Lock />
            </div>
            <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' }}>
              45 jours
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#4f46e5', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbProteges}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Sous protection active
            </div>
          </div>
        </div>

        {/* KPI 3 : Fins de protection proches */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px 14px' : '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(245, 158, 11, 0.15)', color: '#b45309' }}>
              ≤ 14 jours
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: nbUrgents > 0 ? '#d97706' : '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbUrgents}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              À relancer rapidement
            </div>
          </div>
        </div>

        {/* KPI 4 : Salons Signés (Convertis) */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px 14px' : '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon.Check />
            </div>
            <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              {tauxConversion}% conv.
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#059669', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSignes}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Salons signés
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. GRILLE BENTO 2 COLONNES (LISTE DES PROSPECTS | PRIORITÉS)        */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.45fr 1fr',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* COLONNE GAUCHE : PIPELINE DES SALONS PROSPECTÉS */}
        <div className="sp-glass-panel" style={{ padding: isMobile ? '18px 14px' : '22px 24px' }}>
          {/* Barre d'outils : Filtres de statut + Recherche */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            <div className="sp-glass-pill" style={{ display: 'inline-flex', padding: '3px', borderRadius: '999px', gap: '2px', overflowX: 'auto' }}>
              {[
                { id: 'TOUS', label: `Tous (${nbTotal})` },
                { id: 'PROTEGES', label: `Protégés (${nbProteges})` },
                { id: 'SIGNES', label: `Signés (${nbSignes})` },
                { id: 'EXPIRES', label: `Expirés (${nbExpires})` }
              ].map(tab => {
                const actif = filtreStatut === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltreStatut(tab.id)}
                    style={{
                      border: 'none',
                      background: actif ? '#111827' : 'transparent',
                      color: actif ? '#ffffff' : '#64748b',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div
              className="sp-glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 13px',
                borderRadius: '999px',
                width: isMobile ? '100%' : '230px',
                boxSizing: 'border-box'
              }}
            >
              <Icon.Search />
              <input
                type="text"
                placeholder="Salon, ville, SIRET..."
                value={rechercheLead}
                onChange={e => setRechercheLead(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  fontFamily: 'inherit'
                }}
              />
              {rechercheLead && (
                <button
                  type="button"
                  onClick={() => setRechercheLead('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Liste des prospects en cartes structurées */}
          {prospectsFiltres.length === 0 ? (
            <div
              className="sp-glass-pill"
              style={{
                padding: '40px 18px',
                borderRadius: '18px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px'
              }}
            >
              <strong style={{ display: 'block', fontSize: '14.5px', color: '#0f172a', marginBottom: '4px' }}>
                Aucun prospect dans cette vue
              </strong>
              <span style={{ display: 'block', marginBottom: '16px' }}>
                Déclarez un salon pour bloquer son numéro SIRET à votre nom pendant 45 jours.
              </span>
              <button
                type="button"
                onClick={() => setShowProspectForm(true)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '999px',
                  background: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                + Réserver mon premier Lead
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prospectsFiltres.map((p) => {
                const estSigne = p.statut_prospect === 'SIGNE';
                const estProtege = Boolean(p.est_protege);
                const joursRestants = Math.max(0, parseInt(p.jours_restants, 10) || 0);
                const pctRestant = estSigne ? 100 : estProtege ? Math.min(100, Math.round((joursRestants / 45) * 100)) : 0;
                const estUrgent = !estSigne && estProtege && joursRestants <= 7;

                const nomPropre = capitalizeWords(p.nom_salon || 'Salon');
                const villePropre = capitalizeWords(p.ville || '');
                const initiales = getInitialesSalon(nomPropre);

                return (
                  <div
                    key={p.id_prospect}
                    className="sp-lead-row"
                    style={{ opacity: !estProtege && !estSigne ? 0.65 : 1 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      {/* Identité du salon & Coordonnées */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '13px',
                            background: estSigne
                              ? 'rgba(16, 185, 129, 0.14)'
                              : estProtege
                                ? 'rgba(99, 102, 241, 0.12)'
                                : 'rgba(148, 163, 184, 0.16)',
                            color: estSigne ? '#059669' : estProtege ? '#4f46e5' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '13px',
                            flexShrink: 0
                          }}
                        >
                          {initiales}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <strong
                              style={{
                                fontSize: '14.5px',
                                fontWeight: '800',
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {nomPropre}
                            </strong>

                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '10.5px',
                                fontWeight: '800',
                                backgroundColor: estSigne
                                  ? 'rgba(16, 185, 129, 0.14)'
                                  : estProtege
                                    ? 'rgba(99, 102, 241, 0.12)'
                                    : 'rgba(239, 68, 68, 0.12)',
                                color: estSigne ? '#059669' : estProtege ? '#4f46e5' : '#dc2626'
                              }}
                            >
                              {estSigne ? 'Signé' : estProtege ? 'Protégé' : 'Expiré'}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                              marginTop: '3px',
                              fontSize: '12px',
                              color: '#64748b'
                            }}
                          >
                            {villePropre && <span style={{ fontWeight: '600', color: '#334155' }}>{villePropre}</span>}
                            {p.siret_prospect && (
                              <span style={{ fontFamily: 'monospace', fontSize: '11px', background: 'rgba(15,23,42,0.05)', padding: '1px 6px', borderRadius: '6px' }}>
                                SIRET : {p.siret_prospect}
                              </span>
                            )}
                            <span>• Déclaré le {formatDate(p.date_declaration)}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px', fontSize: '11.5px' }}>
                            {p.email_gerant && (
                              <a
                                href={`mailto:${p.email_gerant}`}
                                style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>{p.email_gerant.toLowerCase()}</span>
                              </a>
                            )}
                            {p.telephone_salon && (
                              <a
                                href={`tel:${p.telephone_salon}`}
                                style={{ color: '#059669', textDecoration: 'none', fontWeight: '700' }}
                              >
                                {p.telephone_salon}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Jauge de protection 45j & Bouton Onboarding */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isMobile ? 'space-between' : 'flex-end',
                          gap: '14px',
                          paddingTop: isMobile ? '10px' : 0,
                          borderTop: isMobile ? '1px solid rgba(148, 163, 184, 0.16)' : 'none',
                          flexShrink: 0
                        }}
                      >
                        {/* Indicateur du temps de protection restant */}
                        <div style={{ minWidth: '105px', textAlign: isMobile ? 'left' : 'right' }}>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: '800',
                              color: estSigne ? '#059669' : estUrgent ? '#dc2626' : '#0f172a',
                              marginBottom: '4px',
                              fontVariantNumeric: 'tabular-nums'
                            }}
                          >
                            {estSigne ? 'Converti ✓' : estProtege ? `${joursRestants}j restants` : 'Protection échue'}
                          </div>
                          <div style={{ height: '5px', width: '105px', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pctRestant}%`,
                                background: estSigne ? '#10b981' : estUrgent ? '#ef4444' : '#111827',
                                borderRadius: '999px'
                              }}
                            />
                          </div>
                        </div>

                        {!estSigne && estProtege && (
                          <button
                            type="button"
                            onClick={() => handleOnboarding(p.id_prospect)}
                            style={{
                              padding: '9px 15px',
                              borderRadius: '999px',
                              backgroundColor: '#111827',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              boxShadow: '0 6px 16px -4px rgba(17, 24, 39, 0.22)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Icon.ArrowUpRight />
                            <span>Onboarding</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : PRIORITÉS DE RELANCE & RÈGLES D'EXCLUSIVITÉ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Carte 1 : Relances prioritaires */}
          <div className="sp-glass-panel" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon.Zap />
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                  Priorités d'Onboarding
                </h3>
              </div>
              <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', color: '#64748b' }}>
                Échéances proches
              </span>
            </div>

            {relancesPrioritaires.length === 0 ? (
              <div
                className="sp-glass-pill"
                style={{ padding: '18px 14px', borderRadius: '16px', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}
              >
                Aucun prospect en attente d'onboarding.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {relancesPrioritaires.map((lead) => {
                  const jRest = Math.max(0, parseInt(lead.jours_restants, 10) || 0);
                  return (
                    <div
                      key={`prio-${lead.id_prospect}`}
                      className="sp-glass-pill"
                      style={{
                        padding: '12px 14px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '13.5px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {capitalizeWords(lead.nom_salon)}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: jRest <= 7 ? '#dc2626' : '#64748b', fontWeight: jRest <= 7 ? '700' : '500' }}>
                          {capitalizeWords(lead.ville || 'Salon')} • {jRest}j d'exclusivité
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOnboarding(lead.id_prospect)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '999px',
                          border: 'none',
                          background: '#111827',
                          color: '#ffffff',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        Activer →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carte 2 : Fonctionnement de la protection 45 jours */}
          <div className="sp-glass-panel" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Icon.Shield />
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                Protection SIRET (45 jours)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  num: '1',
                  titre: 'Verrouillage immédiat',
                  desc: "Le SIRET du salon est bloqué à votre nom pendant 45 jours. Aucun autre agent ne peut le démarcher."
                },
                {
                  num: '2',
                  titre: 'Onboarding en 1 clic',
                  desc: "Dès l'accord du gérant, cliquez sur « Onboarding » pour générer automatiquement son espace salon."
                },
                {
                  num: '3',
                  titre: 'Commission 20 % HT (24 mois)',
                  desc: "Le salon est rattaché définitivement à votre portefeuille dès son premier abonnement payant."
                }
              ].map((step) => (
                <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#111827',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}
                  >
                    {step.num}
                  </span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a', marginBottom: '2px' }}>
                      {step.titre}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45, display: 'block' }}>
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MODALE 2 COLONNES : RÉSERVER UN LEAD (VERROUILLAGE 45 JOURS)     */}
      {/* =================================================================== */}
      {showProspectForm && (
        <div className="sp-modal-backdrop" onClick={() => setShowProspectForm(false)}>
          <div
            className="sp-modal-box"
            onClick={e => e.stopPropagation()}
            style={{ padding: isMobile ? '20px 16px 26px 16px' : '28px' }}
          >
            {/* En-tête de la modale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  className="sp-glass-pill"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f172a',
                    flexShrink: 0
                  }}
                >
                  <Icon.Lock />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '19px' : '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Réserver un Lead Salon
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Verrouillez l'exclusivité commerciale d'un établissement pendant 45 jours
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProspectForm(false)}
                className="sp-glass-pill"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>

            {prospectError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.28)',
                  color: '#dc2626',
                  padding: '11px 14px',
                  borderRadius: '13px',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}
              >
                {prospectError}
              </div>
            )}

            <form
              onSubmit={handleCreateProspect}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.38fr 1fr',
                gap: isMobile ? '16px' : '22px',
                alignItems: 'stretch'
              }}
            >
              {/* Colonne gauche : Coordonnées du salon */}
              <div className="sp-glass-panel" style={{ padding: isMobile ? '16px 14px' : '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '13px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                  Identification de l'établissement
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
                    Nom du Salon <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Maison Coiffure & Spa"
                    required
                    value={prospectData.nom_salon || ''}
                    onChange={(e) => setProspectData({ ...prospectData, nom_salon: e.target.value })}
                    className="sp-field-input"
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
                    Numéro SIRET (Clé d'unicité) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 892 345 678 00014"
                    required
                    value={prospectData.siret_prospect || ''}
                    onChange={(e) => setProspectData({ ...prospectData, siret_prospect: e.target.value })}
                    className="sp-field-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
                      E-mail du gérant <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="contact@monsalon.fr"
                      required
                      value={prospectData.email_gerant || ''}
                      onChange={(e) => setProspectData({ ...prospectData, email_gerant: e.target.value })}
                      className="sp-field-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
                      Téléphone du salon
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={prospectData.telephone_salon || ''}
                      onChange={(e) => setProspectData({ ...prospectData, telephone_salon: e.target.value })}
                      className="sp-field-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
                      Code Postal
                    </label>
                    <input
                      type="text"
                      placeholder="67000"
                      value={prospectData.code_postal || ''}
                      onChange={(e) => setProspectData({ ...prospectData, code_postal: e.target.value })}
                      className="sp-field-input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
                      Ville
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Strasbourg"
                      value={prospectData.ville || ''}
                      onChange={(e) => setProspectData({ ...prospectData, ville: e.target.value })}
                      className="sp-field-input"
                    />
                  </div>
                </div>
              </div>

              {/* Colonne droite : Aperçu en direct du certificat d'exclusivité 45 jours */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                <div className="sp-glass-panel" style={{ padding: '20px', borderRadius: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Certificat d'exclusivité
                      </span>
                      <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.14)', color: '#4f46e5' }}>
                        45 jours garantis
                      </span>
                    </div>

                    <div className="sp-glass-pill" style={{ padding: '16px', borderRadius: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: '#111827',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '13px',
                            flexShrink: 0
                          }}
                        >
                          {getInitialesSalon(prospectData.nom_salon || 'Salon')}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block', fontSize: '15px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {capitalizeWords(prospectData.nom_salon || 'Nom du salon')}
                          </strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {capitalizeWords(prospectData.ville || 'Ville')} {prospectData.code_postal ? `(${prospectData.code_postal})` : ''}
                          </span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>SIRET protégé</span>
                          <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
                            {prospectData.siret_prospect || '—'}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Fin de protection</span>
                          <strong style={{ color: '#4f46e5' }}>{dateExpirationApercu}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Commission affiliée</span>
                          <strong style={{ color: '#059669' }}>20 % HT / 24 mois</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45 }}>
                    Dès validation, ce SIRET est réservé sur votre compte partenaire et prêt pour l'onboarding.
                  </div>
                </div>

                {/* Boutons Annuler / Verrouiller */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowProspectForm(false)}
                    className="sp-glass-pill"
                    style={{
                      flex: 1,
                      padding: '13px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1.6,
                      padding: '13px 18px',
                      borderRadius: '999px',
                      border: 'none',
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.24)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px'
                    }}
                  >
                    <Icon.Lock />
                    <span>Verrouiller (45 jours)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
