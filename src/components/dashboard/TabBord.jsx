// src/components/dashboard/TabBord.jsx
// Onglet 1 : Tableau de bord partenaire en Verre Cristal, pilule flottante de palier, KPIs épurés et Bento 2 colonnes

import React, { useState, useMemo } from 'react';
import { formatDate } from '../../utils/formatters';

const formatMontant = (val) => {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getInitialesSalon = (nom = '') => {
  const parts = String(nom || 'S').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return String(parts[0] || 'SA').slice(0, 2).toUpperCase();
};

export default function TabBord({
  stats = { kpis: {}, salons: [], commissions: [] },
  isMobile,
  isSmall,
  progressionPourcent = 0
}) {
  const [afficherDetailPalier, setAfficherDetailPalier] = useState(false);
  const [filtreCommissions, setFiltreCommissions] = useState('TOUTES'); // 'TOUTES' | 'PAYEE' | 'ATTENTE'
  const [rechercheSalon, setRechercheSalon] = useState('');

  const kpis = stats?.kpis || {};
  const salonsListe = Array.isArray(stats?.salons) ? stats.salons : [];
  const commissionsListe = Array.isArray(stats?.commissions) ? stats.commissions : [];

  const nbSalonsActifs = parseInt(kpis.nb_salons_actifs, 10) || 0;
  const seuilDeblocage = parseInt(kpis.seuil_deblocage, 10) || 3;
  const nbSalonsEssai = parseInt(kpis.nb_salons_essai, 10) || 0;

  // Le palier disparaît automatiquement dès que l'agent commercial l'a atteint
  const palierAtteint = nbSalonsActifs >= seuilDeblocage;
  const pctPalier = Math.max(0, Math.min(100, Math.round(progressionPourcent || (seuilDeblocage > 0 ? (nbSalonsActifs / seuilDeblocage) * 100 : 0))));

  const salonsFiltres = useMemo(() => {
    const q = rechercheSalon.trim().toLowerCase();
    if (!q) return salonsListe;
    return salonsListe.filter(
      s =>
        String(s.nom_salon || '').toLowerCase().includes(q) ||
        String(s.email_gerant || '').toLowerCase().includes(q)
    );
  }, [salonsListe, rechercheSalon]);

  const commissionsFiltrees = useMemo(() => {
    return commissionsListe.filter(c => {
      if (filtreCommissions === 'PAYEE') {
        return c.statut_commission === 'PAYEE' || c.statut_commission === 'ACQUISE_A_PAYER';
      }
      if (filtreCommissions === 'ATTENTE') {
        return c.statut_commission !== 'PAYEE' && c.statut_commission !== 'ACQUISE_A_PAYER';
      }
      return true;
    });
  }, [commissionsListe, filtreCommissions]);

  const rayonCercle = 11;
  const circonferenceCercle = 2 * Math.PI * rayonCercle;
  const offsetCercle = circonferenceCercle - (pctPalier / 100) * circonferenceCercle;

  return (
    <div style={{ paddingBottom: isMobile ? '90px' : '24px' }}>
      {/* =================================================================== */}
      {/* 1. EN-TÊTE + PILULE FLOTTANTE DU PALIER (DISPARAÎT UNE FOIS ATTEINT)*/}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '14px',
          marginBottom: isMobile ? '18px' : '24px',
          position: 'relative'
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
            Activité Commerciale
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
            Tableau de bord
          </h1>
          <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
            Voici un aperçu de votre portefeuille salons et de vos commissions récurrentes.
          </span>
        </div>

        {/* PILULE FLOTTANTE DU PALIER DE DÉBLOCAGE (Masquée automatiquement dès que nbSalonsActifs >= seuilDeblocage) */}
        {!palierAtteint && (
          <div style={{ position: 'relative', alignSelf: isMobile ? 'stretch' : 'center' }}>
            <button
              type="button"
              onClick={() => setAfficherDetailPalier(!afficherDetailPalier)}
              className="sp-glass-pill"
              style={{
                width: isMobile ? '100%' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '8px 15px 8px 10px',
                borderRadius: '999px',
                cursor: 'pointer',
                color: '#0f172a',
                boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.1), inset 0 1px 0 #ffffff'
              }}
              title="Cliquez pour afficher le détail du palier de déblocage"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Mini anneau de progression SVG */}
                <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="14" cy="14" r={rayonCercle} fill="none" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="3" />
                    <circle
                      cx="14"
                      cy="14"
                      r={rayonCercle}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={circonferenceCercle}
                      strokeDashoffset={offsetCercle}
                      style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                    />
                  </svg>
                  <span style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: '800',
                    color: '#4f46e5'
                  }}>
                    {nbSalonsActifs}/{seuilDeblocage}
                  </span>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
                    Palier récurrent : {nbSalonsActifs} / {seuilDeblocage} salons actifs
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>
                    Encore {Math.max(0, seuilDeblocage - nbSalonsActifs)} salon{seuilDeblocage - nbSalonsActifs > 1 ? 's' : ''} payant{seuilDeblocage - nbSalonsActifs > 1 ? 's' : ''} pour débloquer
                  </div>
                </div>
              </div>

              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.06)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '800',
                color: '#64748b',
                flexShrink: 0
              }}>
                {afficherDetailPalier ? 'X' : 'i'}
              </span>
            </button>

            {/* Popover flottant explicatif au clic sur la pilule */}
            {afficherDetailPalier && (
              <div
                className="sp-glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: isMobile ? '100%' : '320px',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  zIndex: 50,
                  boxSizing: 'border-box',
                  boxShadow: '0 18px 38px -8px rgba(15, 23, 42, 0.16), inset 0 1px 0 #ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                    Déblocage des commissions (20 % HT)
                  </strong>
                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#4f46e5' }}>
                    {pctPalier}%
                  </span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '11.5px', color: '#64748b', lineHeight: 1.45 }}>
                  Les salons comptent dans ce palier dès leur 1er abonnement payant. Une fois les {seuilDeblocage} salons atteints, toutes vos commissions en attente sont automatiquement débloquées.
                </p>
                <div style={{ height: '6px', backgroundColor: 'rgba(148, 163, 184, 0.22)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.max(6, pctPalier)}%`,
                      height: '100%',
                      backgroundColor: '#111827',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* =================================================================== */}
      {/* 2. LES 4 CARTES KPI EN VERRE CRISTAL (SANS FAUX GRAPHIQUES)         */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '22px'
        }}
      >
        {/* KPI 1 : Salons en Essai (30j) */}
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
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '700', color: '#64748b' }}>
              30 jours
            </span>
          </div>

          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSalonsEssai}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Salons en essai gratuit
            </div>
          </div>
        </div>

        {/* KPI 2 : Salons Actifs Payants */}
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
                border: '1px solid rgba(16, 185, 129, 0.28)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
            <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              Abonnés
            </span>
          </div>

          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#059669', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSalonsActifs}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Salons actifs payants
            </div>
          </div>
        </div>

        {/* KPI 3 : En attente de seuil */}
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
              Réserve
            </span>
          </div>

          <div>
            <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#d97706', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {formatMontant(kpis.commissions_en_attente)} <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>€ HT</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              En attente de seuil
            </div>
          </div>
        </div>

        {/* KPI 4 : Commissions Acquises */}
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
                border: '1px solid rgba(15, 23, 42, 0.14)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '16px'
              }}
            >
              €
            </div>
            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', color: '#059669' }}>
              20 % HT
            </span>
          </div>

          <div>
            <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {formatMontant(kpis.commissions_acquises)} <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>€ HT</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Commissions acquises
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. GRILLE BENTO 2 COLONNES (COMMISSIONS MENSUELLES | SALONS AFFILIÉS)*/}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr',
          gap: '20px',
          alignItems: 'start',
          marginBottom: '20px'
        }}
      >
        {/* COLONNE GAUCHE : DÉTAIL DES COMMISSIONS MENSUELLES (20 % HT) */}
        <div className="sp-glass-panel" style={{ padding: isMobile ? '18px 14px' : '22px 24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <h2 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Commissions mensuelles (20 % HT)
              </h2>
            </div>

            <div className="sp-glass-pill" style={{ display: 'inline-flex', padding: '3px', borderRadius: '999px', gap: '2px' }}>
              {[
                { id: 'TOUTES', label: 'Toutes' },
                { id: 'PAYEE', label: 'Acquises' },
                { id: 'ATTENTE', label: 'En attente' }
              ].map(tab => {
                const actif = filtreCommissions === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltreCommissions(tab.id)}
                    style={{
                      border: 'none',
                      background: actif ? '#111827' : 'transparent',
                      color: actif ? '#ffffff' : '#64748b',
                      padding: '5px 11px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {commissionsFiltrees.length === 0 ? (
            <div
              className="sp-glass-pill"
              style={{
                padding: '38px 18px',
                borderRadius: '18px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'rgba(15, 23, 42, 0.05)',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                  fontWeight: '800',
                  fontSize: '17px'
                }}
              >
                €
              </div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                Aucune commission générée pour le moment
              </strong>
              <span>
                Vos commissions récurrentes de 20 % HT apparaîtront ici à chaque échéance mensuelle de vos salons affiliés.
              </span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.22)', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Période</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Salon</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Base HT</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800' }}>Commission</th>
                    <th style={{ padding: '10px 12px', fontWeight: '800', textAlign: 'right' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionsFiltrees.map((c) => {
                    const isPayee = c.statut_commission === 'PAYEE';
                    const isAcquise = c.statut_commission === 'ACQUISE_A_PAYER';
                    return (
                      <tr key={c.id_commission} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.14)' }}>
                        <td style={{ padding: '13px 12px', fontWeight: '700', color: '#0f172a' }}>{c.periode_mois}</td>
                        <td style={{ padding: '13px 12px', fontWeight: '600', color: '#1e293b' }}>{c.nom_salon}</td>
                        <td style={{ padding: '13px 12px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                          {formatMontant(c.montant_base_ht)} € HT
                        </td>
                        <td style={{ padding: '13px 12px', fontWeight: '800', color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                          +{formatMontant(c.montant_commission)} € HT
                        </td>
                        <td style={{ padding: '13px 12px', textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: '800',
                              backgroundColor: isPayee
                                ? 'rgba(16, 185, 129, 0.14)'
                                : isAcquise
                                  ? 'rgba(59, 130, 246, 0.14)'
                                  : 'rgba(245, 158, 11, 0.16)',
                              color: isPayee ? '#059669' : isAcquise ? '#1d4ed8' : '#b45309'
                            }}
                          >
                            {isPayee ? 'Payée' : isAcquise ? 'Acquise à payer' : 'En attente seuil'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : SALONS CLIENTS AFFILIÉS (DESIGN CARTES COMME MAQUETTE) */}
        <div className="sp-glass-panel" style={{ padding: isMobile ? '18px 14px' : '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <h2 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Salons affiliés ({salonsListe.length})
              </h2>
            </div>

            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
              Durée 24 mois
            </span>
          </div>

          {salonsListe.length > 2 && (
            <div
              className="sp-glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 12px',
                borderRadius: '12px',
                marginBottom: '12px'
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un salon affilié..."
                value={rechercheSalon}
                onChange={e => setRechercheSalon(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '12.5px', color: '#0f172a' }}
              />
            </div>
          )}

          {salonsFiltres.length === 0 ? (
            <div
              className="sp-glass-pill"
              style={{
                padding: '32px 16px',
                borderRadius: '18px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px'
              }}
            >
              <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '4px' }}>
                Aucun salon client inscrit
              </strong>
              <span>
                Les salons qui s'inscrivent avec votre code partenaire apparaîtront automatiquement dans cette liste.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px' }}>
              {salonsFiltres.map((s) => {
                const estEnEssai = s.plan_actuel === 'PREMIUM_TRIAL' || s.statut_abonnement !== 'actif';
                const initiales = getInitialesSalon(s.nom_salon);
                const labelForfait = s.plan_actuel === 'PREMIUM_TRIAL' ? 'Essai 30j' : (s.plan_actuel || 'Premium');

                return (
                  <div
                    key={s.id_salon}
                    className="sp-glass-pill"
                    style={{
                      padding: '12px 14px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: !estEnEssai ? 'rgba(16, 185, 129, 0.14)' : 'rgba(99, 102, 241, 0.12)',
                          color: !estEnEssai ? '#059669' : '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '12.5px',
                          flexShrink: 0
                        }}
                      >
                        {initiales}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            display: 'block',
                            fontSize: '13.5px',
                            fontWeight: '800',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {s.nom_salon}
                        </strong>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '11.5px',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {s.email_gerant}
                        </span>
                        <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Fin 24m : {s.date_fin_commissionnement ? formatDate(s.date_fin_commissionnement) : 'Au 1er paiement'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          backgroundColor: !estEnEssai ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                          color: !estEnEssai ? '#059669' : '#b45309'
                        }}
                      >
                        {!estEnEssai ? 'Actif payant' : '1er mois gratuit'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>
                        {labelForfait}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. BANDEAU BAS DE PAGE (COMME SUR LA MAQUETTE)                      */}
      {/* =================================================================== */}
      <div
        className="sp-glass-panel"
        style={{
          padding: isMobile ? '16px' : '18px 24px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.14)',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>
              Développez votre portefeuille partenaires
            </strong>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              Chaque salon affilié vous génère 20 % HT de commission récurrente pendant 24 mois dès son premier abonnement payant.
            </span>
          </div>
        </div>

        <span
          className="sp-glass-pill"
          style={{
            padding: '8px 15px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '800',
            color: '#0f172a',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          Commission 20 % HT • 24 mois
        </span>
      </div>
    </div>
  );
}
