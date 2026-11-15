// src/components/dashboard/TabBord.jsx
// Onglet 1 : Tableau de bord partenaire en Verre Cristal — Optimisé Desktop & iPhone

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

  const palierAtteint = nbSalonsActifs >= seuilDeblocage;
  const pctPalier = Math.max(
    0,
    Math.min(100, Math.round(progressionPourcent || (seuilDeblocage > 0 ? (nbSalonsActifs / seuilDeblocage) * 100 : 0)))
  );

  const salonsFiltres = useMemo(() => {
    const q = rechercheSalon.trim().toLowerCase();
    if (!q) return salonsListe;
    return salonsListe.filter(
      (s) =>
        String(s.nom_salon || '').toLowerCase().includes(q) ||
        String(s.email_gerant || '').toLowerCase().includes(q)
    );
  }, [salonsListe, rechercheSalon]);

  const commissionsFiltrees = useMemo(() => {
    return commissionsListe.filter((c) => {
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
    <div
      style={{
        paddingBottom: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 0px))' : '24px',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* 1. EN-TÊTE + PILULE FLOTTANTE DU PALIER */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '8px' : '14px',
          marginBottom: isMobile ? '12px' : '22px',
          position: 'relative'
        }}
      >
        <div>
          {!isMobile && (
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
          )}
          <h1
            style={{
              fontSize: isMobile ? '22px' : '30px',
              fontWeight: '800',
              margin: isMobile ? '0' : '0 0 4px 0',
              letterSpacing: '-0.03em',
              color: '#0f172a',
              lineHeight: 1.1
            }}
          >
            Tableau de bord
          </h1>
          {!isMobile && (
            <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
              Voici un aperçu de votre portefeuille salons et de vos commissions récurrentes.
            </span>
          )}
        </div>

        {!palierAtteint && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setAfficherDetailPalier(!afficherDetailPalier)}
              className="sp-glass-pill"
              style={{
                width: isMobile ? '100%' : 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: isMobile ? '7px 12px 7px 9px' : '8px 15px 8px 10px',
                borderRadius: '999px',
                cursor: 'pointer',
                color: '#0f172a',
                boxShadow: '0 6px 20px -6px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                <div style={{ position: 'relative', width: '26px', height: '26px', flexShrink: 0 }}>
                  <svg width="26" height="26" viewBox="0 0 28 28" style={{ transform: 'rotate(-90deg)' }}>
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
                    />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8.5px',
                      fontWeight: '800',
                      color: '#4f46e5'
                    }}
                  >
                    {nbSalonsActifs}/{seuilDeblocage}
                  </span>
                </div>

                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: '800',
                      color: '#0f172a',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Palier récurrent : {nbSalonsActifs} / {seuilDeblocage} salons actifs
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                    Encore {Math.max(0, seuilDeblocage - nbSalonsActifs)} salon{seuilDeblocage - nbSalonsActifs > 1 ? 's' : ''} payant{seuilDeblocage - nbSalonsActifs > 1 ? 's' : ''} pour débloquer
                  </div>
                </div>
              </div>

              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(15, 23, 42, 0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#64748b',
                  flexShrink: 0
                }}
              >
                {afficherDetailPalier ? 'X' : 'i'}
              </span>
            </button>

            {afficherDetailPalier && (
              <div
                className="sp-glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  left: isMobile ? 0 : 'auto',
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
                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#4f46e5' }}>{pctPalier}%</span>
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
                      borderRadius: '999px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 2. LES 4 CARTES KPI (GRILLE 2x2 ULTRA-NETTE SUR IPHONE) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '8px' : '16px',
          marginBottom: isMobile ? '12px' : '22px'
        }}
      >
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '11px 12px' : '20px 22px',
            borderRadius: isMobile ? '18px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: isMobile ? '6px' : '12px',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: isMobile ? '30px' : '40px',
                height: isMobile ? '30px' : '40px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg viewBox="0 0 24 24" width={isMobile ? '14' : '18'} height={isMobile ? '14' : '18'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="sp-glass-pill" style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9.5px', fontWeight: '700', color: '#64748b' }}>
              30 jours
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSalonsEssai}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
              Salons en essai
            </div>
          </div>
        </div>

        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '11px 12px' : '20px 22px',
            borderRadius: isMobile ? '18px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: isMobile ? '6px' : '12px',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: isMobile ? '30px' : '40px',
                height: isMobile ? '30px' : '40px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.28)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg viewBox="0 0 24 24" width={isMobile ? '14' : '18'} height={isMobile ? '14' : '18'} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
            <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              Abonnés
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '800', color: '#059669', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSalonsActifs}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
              Salons payants
            </div>
          </div>
        </div>

        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '11px 12px' : '20px 22px',
            borderRadius: isMobile ? '18px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: isMobile ? '6px' : '12px',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: isMobile ? '30px' : '40px',
                height: isMobile ? '30px' : '40px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg viewBox="0 0 24 24" width={isMobile ? '14' : '18'} height={isMobile ? '14' : '18'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9.5px', fontWeight: '800', background: 'rgba(245, 158, 11, 0.15)', color: '#b45309' }}>
              Réserve
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '18px' : '26px', fontWeight: '800', color: '#d97706', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {formatMontant(kpis.commissions_en_attente)} <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8' }}>€ HT</span>
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
              En attente de seuil
            </div>
          </div>
        </div>

        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '11px 12px' : '20px 22px',
            borderRadius: isMobile ? '18px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: isMobile ? '6px' : '12px',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: isMobile ? '30px' : '40px',
                height: isMobile ? '30px' : '40px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 0.08)',
                border: '1px solid rgba(15, 23, 42, 0.14)',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: isMobile ? '13.5px' : '16px',
                flexShrink: 0
              }}
            >
              €
            </div>
            <span className="sp-glass-pill" style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9.5px', fontWeight: '800', color: '#059669' }}>
              20 % HT
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '18px' : '26px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {formatMontant(kpis.commissions_acquises)} <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#94a3b8' }}>€ HT</span>
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
              Commissions acquises
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRILLE BENTO 2 COLONNES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr',
          gap: isMobile ? '12px' : '20px',
          alignItems: 'start'
        }}
      >
        {/* COLONNE GAUCHE : COMMISSIONS MENSUELLES */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '14px 13px' : '22px 24px',
            borderRadius: isMobile ? '20px' : '24px',
            minWidth: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <h2 style={{ margin: 0, fontSize: isMobile ? '15px' : '16.5px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Commissions mensuelles (20 % HT)
              </h2>
            </div>

            <div
              className="sp-glass-pill"
              style={{
                display: isMobile ? 'grid' : 'inline-flex',
                gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : undefined,
                padding: '3px',
                borderRadius: '999px',
                gap: '2px'
              }}
            >
              {[
                { id: 'TOUTES', label: 'Toutes' },
                { id: 'PAYEE', label: 'Acquises' },
                { id: 'ATTENTE', label: 'En attente' }
              ].map((tab) => {
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
                      padding: '5px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'center'
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
                padding: isMobile ? '14px 12px' : '32px 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                color: '#64748b',
                fontSize: '12px'
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: 'rgba(15, 23, 42, 0.06)',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '15px',
                  flexShrink: 0
                }}
              >
                €
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>
                  Aucune commission générée pour le moment
                </strong>
                <span style={{ lineHeight: 1.35, display: 'block', fontSize: '11.5px' }}>
                  Vos commissions récurrentes de 20 % HT apparaîtront ici à chaque échéance mensuelle.
                </span>
              </div>
            </div>
          ) : isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {commissionsFiltrees.map((c) => {
                const isPayee = c.statut_commission === 'PAYEE';
                const isAcquise = c.statut_commission === 'ACQUISE_A_PAYER';
                return (
                  <div
                    key={c.id_commission}
                    className="sp-glass-pill"
                    style={{
                      padding: '11px 13px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.nom_salon}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                        {c.periode_mois} • Base {formatMontant(c.montant_base_ht)} € HT
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <strong style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                        +{formatMontant(c.montant_commission)} € HT
                      </strong>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: '800',
                          backgroundColor: isPayee
                            ? 'rgba(16, 185, 129, 0.14)'
                            : isAcquise
                              ? 'rgba(59, 130, 246, 0.14)'
                              : 'rgba(245, 158, 11, 0.16)',
                          color: isPayee ? '#059669' : isAcquise ? '#1d4ed8' : '#b45309'
                        }}
                      >
                        {isPayee ? 'Payée' : isAcquise ? 'Acquise' : 'En attente'}
                      </span>
                    </div>
                  </div>
                );
              })}
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

        {/* COLONNE DROITE : SALONS CLIENTS AFFILIÉS */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '14px 13px' : '22px 24px',
            borderRadius: isMobile ? '20px' : '24px',
            minWidth: 0
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <h2 style={{ margin: 0, fontSize: isMobile ? '15px' : '16.5px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Salons affiliés ({salonsListe.length})
              </h2>
            </div>

            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: '#64748b', whiteSpace: 'nowrap' }}>
              Durée 24 mois
            </span>
          </div>

          {salonsFiltres.length === 0 ? (
            <div
              className="sp-glass-pill"
              style={{
                padding: isMobile ? '14px 12px' : '28px 16px',
                borderRadius: '14px',
                textAlign: 'left',
                color: '#64748b',
                fontSize: '12px'
              }}
            >
              <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>
                Aucun salon client inscrit
              </strong>
              <span style={{ lineHeight: 1.35, display: 'block', fontSize: '11.5px' }}>
                Les salons inscrits avec votre code partenaire apparaîtront automatiquement ici.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px' }}>
              {salonsFiltres.map((s) => {
                const estEnEssai = s.plan_actuel === 'PREMIUM_TRIAL' || s.statut_abonnement !== 'actif';
                const initiales = getInitialesSalon(s.nom_salon);
                const labelForfait = s.plan_actuel === 'PREMIUM_TRIAL' ? 'Essai 30j' : (s.plan_actuel || 'Premium');

                return (
                  <div
                    key={s.id_salon}
                    className="sp-glass-pill"
                    style={{
                      padding: '11px 12px',
                      borderRadius: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      minWidth: 0
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: !estEnEssai ? 'rgba(16, 185, 129, 0.14)' : 'rgba(99, 102, 241, 0.12)',
                          color: !estEnEssai ? '#059669' : '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '12px',
                          flexShrink: 0
                        }}
                      >
                        {initiales}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.nom_salon}
                        </strong>
                        <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.email_gerant}
                        </span>
                        <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Fin 24m : {s.date_fin_commissionnement ? formatDate(s.date_fin_commissionnement) : 'Au 1er paiement'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: '800',
                          backgroundColor: !estEnEssai ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                          color: !estEnEssai ? '#059669' : '#b45309',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {!estEnEssai ? 'Actif payant' : '1er mois gratuit'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>{labelForfait}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
