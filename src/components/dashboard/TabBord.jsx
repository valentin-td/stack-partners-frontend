// src/components/dashboard/TabBord.jsx
// Onglet 1 : Tableau de bord partenaire en Verre Cristal — Optimisé Desktop & iPhone

import React, { useState, useMemo } from 'react';
import { formatDate } from '../../utils/formatters';
import { Icon } from '../common/Icons';

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
  progressionPourcent = 0,
  interventionsData = { missions_prioritaires: [], missions_secteur: [], missions_en_cours: [], missions_resolues: [] },
  leadsAmbassadeurs = { leads_disponibles: [], leads_reserves_en_cours: [], leads_confirmes: [] },
  fetchInterventions,
  fetchLeadsAmbassadeurs,
  handleAccepterIntervention,
  handleResoudreIntervention,
  handleReserverLeadAmbassadeur,
  handleConfirmerRdvLeadAmbassadeur,
  setActiveTab
}) {
  const [afficherDetailPalier, setAfficherDetailPalier] = useState(false);
  const [filtreCommissions, setFiltreCommissions] = useState('TOUTES'); // 'TOUTES' | 'PAYEE' | 'ATTENTE'
  const [rechercheSalon, setRechercheSalon] = useState('');

  // Gestion des actions d alertes
  const [creneauxPassage, setCreneauxPassage] = useState({});
  const [acceptationEnCours, setAcceptationEnCours] = useState({});
  const [formRdvLead, setFormRdvLead] = useState({});
  const [reservationEnCours, setReservationEnCours] = useState({});
  const [confirmationRdvEnCours, setConfirmationRdvEnCours] = useState({});
  const [modalResolution, setModalResolution] = useState({ ouverte: false, intervention: null, rapport: '', enCours: false });
  const [pitchCopieId, setPitchCopieId] = useState(null);

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
      {/* CHARTE SALON ARCHITECTE (LIN CHAUD & ÉMERAUDE — ZÉRO LUMIÈRE BLEUE AGRESSIVE) */}
      <style>{`
        html:not(.dark-mode), body:not(.dark-mode) {
          --sp-bg: #f3f1ed;
          --sp-card: rgba(255, 255, 255, 0.84);
          --sp-pill: rgba(255, 255, 255, 0.92);
          --sp-text: #18181b;
          --sp-muted: #64748b;
          --sp-border: rgba(226, 232, 240, 0.9);
          background-color: #f3f1ed !important;
          background-image:
            radial-gradient(at 0% 0%, rgba(214, 203, 187, 0.36) 0px, transparent 55%),
            radial-gradient(at 100% 0%, rgba(16, 185, 129, 0.06) 0px, transparent 55%),
            radial-gradient(at 100% 100%, rgba(217, 199, 178, 0.28) 0px, transparent 55%),
            radial-gradient(at 0% 100%, rgba(231, 229, 228, 0.6) 0px, transparent 55%) !important;
          background-attachment: fixed !important;
        }
        html.dark-mode, body.dark-mode {
          --sp-bg: #0c0e12;
          --sp-card: rgba(22, 25, 31, 0.90);
          --sp-pill: rgba(30, 34, 42, 0.88);
          --sp-text: #f4f4f5;
          --sp-muted: #94a3b8;
          --sp-border: rgba(255, 255, 255, 0.09);
          background-color: #0c0e12 !important;
          background-image:
            radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.07) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(148, 163, 184, 0.05) 0px, transparent 50%) !important;
          background-attachment: fixed !important;
        }
        .sp-glass-panel {
          background: var(--sp-card) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--sp-border) !important;
          box-shadow: 0 8px 24px -8px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
          border-radius: 20px !important;
        }
        .sp-glass-panel-dark {
          background:
            radial-gradient(120% 120% at 95% 10%, rgba(16, 185, 129, 0.26) 0%, rgba(16, 185, 129, 0) 58%),
            linear-gradient(145deg, #162420 0%, #0f1715 100%) !important;
          border: 1px solid rgba(52, 211, 153, 0.28) !important;
          box-shadow: 0 12px 28px -8px rgba(15, 23, 21, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
          border-radius: 20px !important;
          color: #ffffff !important;
        }
        .sp-glass-pill {
          background: var(--sp-pill) !important;
          border: 1px solid var(--sp-border) !important;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03) !important;
        }
      `}</style>

      {/* 1. EN-TÊTE COMPACT SUR UNE SEULE LIGNE */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px',
          marginBottom: isMobile ? '12px' : '16px',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: isMobile ? '22px' : '27px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.03em',
              color: 'var(--sp-text, #18181b)',
              lineHeight: 1.1
            }}
          >
            Tableau de bord
          </h1>
          <span style={{ fontSize: '12.5px', color: 'var(--sp-muted, #64748b)', fontWeight: '600' }}>
            Portefeuille salons & commissions récurrentes (20 % HT)
          </span>
        </div>

        {/* Pilule compacte d'explication du palier */}
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
              padding: '7px 13px',
              borderRadius: '999px',
              cursor: 'pointer',
              color: 'var(--sp-text, #18181b)',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: '700' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: palierAtteint ? '#10b981' : '#f59e0b'
              }} />
              <span>
                Palier récurrent : <strong style={{ fontWeight: '800' }}>{nbSalonsActifs}/{seuilDeblocage} salons actifs</strong>
              </span>
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              color: '#059669',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              {afficherDetailPalier ? 'Fermer' : 'Règle 20% ›'}
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
                width: isMobile ? '100%' : '330px',
                padding: '14px 16px',
                borderRadius: '18px',
                zIndex: 50,
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--sp-text, #18181b)' }}>
                  Déblocage des commissions (20 % HT)
                </strong>
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#059669' }}>{pctPalier}%</span>
              </div>
              <p style={{ margin: '0 0 10px 0', fontSize: '11.5px', color: 'var(--sp-muted, #64748b)', lineHeight: 1.45 }}>
                Dès que {seuilDeblocage} salons passent sur un abonnement payant, toutes vos commissions en réserve sont automatiquement débloquées et versées chaque mois pendant 24 mois.
              </p>
              <div style={{ height: '5px', backgroundColor: 'rgba(148, 163, 184, 0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(6, pctPalier)}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    borderRadius: '999px'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. LES 4 CARTES KPI HIÉRARCHISÉES (CARTE MAÎTRESSE ÉMERAUDE + 3 KPIS ÉPURÉS) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1.3fr 1fr 1fr 1fr',
          gap: isMobile ? '8px' : '14px',
          marginBottom: isMobile ? '12px' : '18px'
        }}
      >
        {/* KPI 1 (Pièce maîtresse) : Commissions acquises + Progression du palier intégrée */}
        <div
          className="sp-glass-panel-dark"
          style={{
            gridColumn: isMobile ? '1 / -1' : 'auto',
            padding: isMobile ? '16px 18px' : '18px 22px',
            minHeight: isMobile ? '98px' : '110px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Commissions acquises
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.22)', color: '#34d399' }}>
              20 % HT récurrent
            </span>
          </div>

          <div style={{ fontSize: isMobile ? '26px' : '29px', fontWeight: '800', color: '#ffffff', lineHeight: 1, fontVariantNumeric: 'tabular-nums', margin: '8px 0' }}>
            {formatMontant(kpis.commissions_acquises)} <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.65)' }}>€ HT</span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: '4px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>
                  {palierAtteint
                    ? 'Seuil de déblocage validé'
                    : `Déblocage : ${nbSalonsActifs}/${seuilDeblocage} salons actifs`}
                </span>
                {palierAtteint && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              <span style={{ color: '#34d399', fontWeight: '800' }}>{pctPalier}%</span>
            </div>
            <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(5, pctPalier)}%`, background: '#10b981', borderRadius: '999px' }} />
            </div>
          </div>
        </div>

        {/* KPI 2 : En attente de seuil (Réserve) */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '13px 14px' : '18px 20px',
            minHeight: isMobile ? '84px' : '110px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              En réserve
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(245, 158, 11, 0.14)', color: '#b45309' }}>
              Seuil {seuilDeblocage} salons
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: 'var(--sp-text, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {formatMontant(kpis.commissions_en_attente)} <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--sp-muted, #64748b)' }}>€ HT</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-muted, #64748b)', marginTop: '4px' }}>
              Débloqué au {seuilDeblocage}e salon payant
            </div>
          </div>
        </div>

        {/* KPI 3 : Salons payants (Abonnés) */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '13px 14px' : '18px 20px',
            minHeight: isMobile ? '84px' : '110px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Salons payants
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              Abonnés
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: nbSalonsActifs > 0 ? '#059669' : 'var(--sp-text, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSalonsActifs}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-muted, #64748b)', marginTop: '4px' }}>
              Commissionnés sur 24 mois
            </div>
          </div>
        </div>

        {/* KPI 4 : Salons en essai (30 jours) */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '13px 14px' : '18px 20px',
            minHeight: isMobile ? '84px' : '110px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Salons en essai
            </span>
            <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-muted, #64748b)' }}>
              30 jours
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: 'var(--sp-text, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSalonsEssai}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-muted, #64748b)', marginTop: '4px' }}>
              Période d'essai gratuite
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 CENTRE D'ALERTES OPERATIONNELLES (INTERVENTIONS TECHNIQUES & SALONS PARRAINES) */}
      {(() => {
        const missionsPrioritaires = interventionsData?.missions_prioritaires || [];
        const missionsSecteur = interventionsData?.missions_secteur || [];
        const missionsEnCours = interventionsData?.missions_en_cours || [];
        const leadsDispo = leadsAmbassadeurs?.leads_disponibles || [];
        const leadsReserves = leadsAmbassadeurs?.leads_reserves_en_cours || [];

        const totalInterventions = missionsPrioritaires.length + missionsSecteur.length + missionsEnCours.length;
        const totalLeads = leadsDispo.length + leadsReserves.length;
        const totalAlertes = totalInterventions + totalLeads;

        return (
          <section
            style={{
              marginBottom: isMobile ? '16px' : '22px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.94) 0%, rgba(9, 9, 11, 0.98) 100%)',
              border: totalAlertes > 0 ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 14px 34px -10px rgba(0, 0, 0, 0.5)',
              padding: isMobile ? '16px 14px' : '22px 26px',
              color: '#f8fafc',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Barre de titre et badges de statut */}
            <div
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '12px',
                marginBottom: totalAlertes > 0 ? '18px' : '0',
                paddingBottom: totalAlertes > 0 ? '14px' : '0',
                borderBottom: totalAlertes > 0 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: totalAlertes > 0 ? '#10b981' : '#64748b',
                    boxShadow: totalAlertes > 0 ? '0 0 12px #10b981' : 'none'
                  }}
                />
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: isMobile ? '15px' : '17px',
                      fontWeight: '800',
                      letterSpacing: '-0.02em',
                      color: '#ffffff'
                    }}
                  >
                    Alertes Opérationnelles & Terrain
                  </h2>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    Dépannages techniques prioritaires (39 € Net) & leads chauds parrainés
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {missionsPrioritaires.length > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'rgba(245, 158, 11, 0.20)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.40)'
                    }}
                  >
                    {missionsPrioritaires.length} intervention(s) exclusive(s)
                  </span>
                )}
                {totalAlertes > 0 ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.20)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.40)'
                    }}
                  >
                    {totalAlertes} alerte(s) active(s)
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#94a3b8'
                    }}
                  >
                    À jour
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof fetchInterventions === 'function') fetchInterventions();
                    if (typeof fetchLeadsAmbassadeurs === 'function') fetchLeadsAmbassadeurs();
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    padding: '5px 11px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Actualiser
                </button>
              </div>
            </div>

            {/* ÉTAT VIDE : AUCUNE ALERTE */}
            {totalAlertes === 0 && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed rgba(255, 255, 255, 0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ color: '#34d399', flexShrink: 0 }}>
                  <Icon.Shield />
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                  Aucune intervention technique urgente ni demande de salon parrainé en attente sur votre secteur. Vous serez notifié dès qu'un ticket ou qu'un lead confrère est émis.
                </div>
              </div>
            )}

            {/* SECTION 1 : DEMANDES D'INTERVENTION TECHNIQUE (39 € NET) */}
            {totalInterventions > 0 && (
              <div style={{ marginBottom: totalLeads > 0 ? '22px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Icon.Wrench />
                  <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fbbf24' }}>
                    Demandes d'Intervention Technique & Dépannage (Forfait 39,00 € Net)
                  </span>
                </div>

                {/* A. Missions Prioritaires exclusives 45 min (pour l'agent d'onboarding) */}
                {missionsPrioritaires.map((m) => {
                  const enCoursAcceptation = Boolean(acceptationEnCours[m.id_intervention]);
                  const minutesRestantes = m.minutes_restantes || 45;

                  return (
                    <div
                      key={`m-prio-${m.id_intervention}`}
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        border: '1.5px solid rgba(245, 158, 11, 0.45)',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              letterSpacing: '0.05em',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              backgroundColor: '#fbbf24',
                              color: '#000000',
                              textTransform: 'uppercase'
                            }}
                          >
                            Priorité Onboarding (Exclusivité 45 min)
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>
                            {m.nom_salon}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Ticket : {m.numero_ticket}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#fbbf24', fontWeight: '800' }}>
                          <Icon.Clock />
                          <span>Reste {minutesRestantes} min pour réserver</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', lineHeight: 1.45 }}>
                        <strong>Panne signalée :</strong> {m.description_panne}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '11.5px', color: '#94a3b8' }}>
                        <div>
                          <span>Adresse : {m.adresse_salon || 'Non renseignée'}</span>
                          <span style={{ marginLeft: '12px' }}>
                            Imputabilité : <strong style={{ color: m.payeur === 'STACK' ? '#34d399' : '#f8fafc' }}>
                              {m.payeur === 'STACK' ? 'Prise en charge STACK (0 € salon)' : 'À la charge du salon (39 €)'}
                            </strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                          <input
                            type="text"
                            placeholder="Créneau de passage (ex: Aujourd'hui 16h)"
                            value={creneauxPassage[m.id_intervention] || ''}
                            onChange={(e) => setCreneauxPassage(prev => ({ ...prev, [m.id_intervention]: e.target.value }))}
                            style={{
                              flex: isMobile ? 1 : 'none',
                              width: isMobile ? 'auto' : '230px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '11.5px',
                              color: '#ffffff',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            disabled={enCoursAcceptation}
                            onClick={async () => {
                              const creneau = (creneauxPassage[m.id_intervention] || '').trim();
                              if (!creneau || creneau.length < 3) {
                                alert("Veuillez indiquer votre heure ou date de passage estimée.");
                                return;
                              }
                              setAcceptationEnCours(prev => ({ ...prev, [m.id_intervention]: true }));
                              if (typeof handleAccepterIntervention === 'function') {
                                await handleAccepterIntervention(m.id_intervention, creneau);
                              }
                              setAcceptationEnCours(prev => ({ ...prev, [m.id_intervention]: false }));
                            }}
                            style={{
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              fontSize: '11.5px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {enCoursAcceptation ? 'Validation...' : 'Accepter & Caler passage'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* B. Missions Ouvertes sur le Secteur (Premier arrivé, premier servi) */}
                {missionsSecteur.map((m) => {
                  const enCoursAcceptation = Boolean(acceptationEnCours[m.id_intervention]);

                  return (
                    <div
                      key={`m-sec-${m.id_intervention}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              letterSpacing: '0.05em',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(16, 185, 129, 0.20)',
                              color: '#34d399',
                              textTransform: 'uppercase'
                            }}
                          >
                            Ouvert Secteur (39,00 € Net)
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>
                            {m.nom_salon}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Ticket : {m.numero_ticket}
                          </span>
                        </div>

                        <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>
                          Premier arrivé, premier servi
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                        <strong>Panne :</strong> {m.description_panne}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '11.5px', color: '#94a3b8' }}>
                        <div>
                          <span>Adresse : {m.adresse_salon || 'Non renseignée'}</span>
                          <span style={{ marginLeft: '12px' }}>
                            Payeur : <strong>{m.payeur === 'STACK' ? 'Garantie STACK (0 € salon)' : 'Facturé au salon'}</strong>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                          <input
                            type="text"
                            placeholder="Créneau de passage (ex: Demain 11h)"
                            value={creneauxPassage[m.id_intervention] || ''}
                            onChange={(e) => setCreneauxPassage(prev => ({ ...prev, [m.id_intervention]: e.target.value }))}
                            style={{
                              flex: isMobile ? 1 : 'none',
                              width: isMobile ? 'auto' : '230px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '11.5px',
                              color: '#ffffff',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            disabled={enCoursAcceptation}
                            onClick={async () => {
                              const creneau = (creneauxPassage[m.id_intervention] || '').trim();
                              if (!creneau || creneau.length < 3) {
                                alert("Veuillez indiquer votre heure ou date de passage estimée.");
                                return;
                              }
                              setAcceptationEnCours(prev => ({ ...prev, [m.id_intervention]: true }));
                              if (typeof handleAccepterIntervention === 'function') {
                                await handleAccepterIntervention(m.id_intervention, creneau);
                              }
                              setAcceptationEnCours(prev => ({ ...prev, [m.id_intervention]: false }));
                            }}
                            style={{
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '7px 14px',
                              fontSize: '11.5px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {enCoursAcceptation ? 'Validation...' : 'Prendre cette mission'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* C. Missions En Cours Planifiées (À clôturer et facturer 39 €) */}
                {missionsEnCours.map((m) => (
                  <div
                    key={`m-encours-${m.id_intervention}`}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(59, 130, 246, 0.25)',
                            color: '#93c5fd',
                            textTransform: 'uppercase'
                          }}
                        >
                          Mission Planifiée pour vous
                        </span>
                        <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>
                          {m.nom_salon}
                        </span>
                      </div>

                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#93c5fd' }}>
                        Passage calé : {m.creneau_passage || 'À convenir'}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                      <strong>Panne :</strong> {m.description_panne}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        Facture à émettre : <strong>39,00 € Net ({m.payeur === 'STACK' ? 'STACK Software' : 'Salon'})</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => setModalResolution({ ouverte: true, intervention: m, rapport: '', enCours: false })}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        Clôturer & Émettre la facture 39 €
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECTION 2 : DEMANDES DE CRÉATION DE SALON VIA PARRAINAGE (50 € + 20% HT) */}
            {totalLeads > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Icon.Zap />
                  <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#34d399' }}>
                    Salons Parrainés — Nouveaux Leads Chauds (Commission 50,00 € + 20 % HT dès le 4e mois)
                  </span>
                </div>

                {/* A. Leads Réservés en cours (Compte à rebours 45 min) */}
                {leadsReserves.map((lead) => {
                  const minutesRestantes = Math.max(0, Math.ceil(Number(lead.secondes_restantes || 0) / 60));
                  const nomParrain = lead.nom_parrain_verifie || lead.nom_salon_parrain || 'Salon Confrère';
                  const accroche = `Bonjour, j'ai été mandaté par votre confrère ${nomParrain} pour vous activer vos 3 mois offerts sur STACK et vous déposer votre terminal TPE.`;
                  const enCoursValidationRdv = Boolean(confirmationRdvEnCours[lead.id_prospect]);

                  return (
                    <div
                      key={`lead-res-${lead.id_prospect}`}
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.08)',
                        border: '1.5px solid rgba(16, 185, 129, 0.45)',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              letterSpacing: '0.05em',
                              padding: '2px 8px',
                              borderRadius: '8px',
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              textTransform: 'uppercase'
                            }}
                          >
                            Lead Réservé (45 min)
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>
                            {lead.nom_salon}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {lead.ville ? `${lead.code_postal || ''} ${lead.ville}` : `Dép. ${lead.departement || ''}`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#34d399', fontWeight: '800' }}>
                          <Icon.Clock />
                          <span>Reste {minutesRestantes} min pour caler le RDV</span>
                        </div>
                      </div>

                      {/* Coordonnées & Accroche en or */}
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
                        Contact : <strong>{lead.prenom_contact || lead.nom_contact ? `${lead.prenom_contact || ''} ${lead.nom_contact || ''}`.trim() : 'Gérant'}</strong>
                        {lead.telephone_salon && (
                          <span style={{ marginLeft: '10px' }}>
                            Tél : <a href={`tel:${lead.telephone_salon}`} style={{ color: '#34d399', fontWeight: '700', textDecoration: 'underline' }}>{lead.telephone_salon}</a>
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          marginBottom: '10px',
                          fontSize: '11.5px',
                          color: '#e2e8f0',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <strong style={{ color: '#fbbf24' }}>Accroche téléphonique : </strong>
                          "{accroche}"
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(accroche);
                            setPitchCopieId(lead.id_prospect);
                            setTimeout(() => setPitchCopieId(null), 3000);
                          }}
                          style={{
                            background: pitchCopieId === lead.id_prospect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: pitchCopieId === lead.id_prospect ? '#34d399' : '#cbd5e1',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '10.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {pitchCopieId === lead.id_prospect ? 'Copié !' : 'Copier'}
                        </button>
                      </div>

                      {/* Confirmation de RDV en 1 clic */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          placeholder="Date & heure du RDV convenu (ex: Demain 14h30)"
                          value={formRdvLead[lead.id_prospect]?.date || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormRdvLead(prev => ({
                              ...prev,
                              [lead.id_prospect]: { ...(prev[lead.id_prospect] || {}), date: val }
                            }));
                          }}
                          style={{
                            flex: isMobile ? 1 : 'none',
                            width: isMobile ? 'auto' : '280px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '11.5px',
                            color: '#ffffff',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          disabled={enCoursValidationRdv}
                          onClick={async () => {
                            const dateRdv = (formRdvLead[lead.id_prospect]?.date || '').trim();
                            if (!dateRdv) {
                              alert("Veuillez indiquer la date et l'heure convenues avec le salon.");
                              return;
                            }
                            setConfirmationRdvEnCours(prev => ({ ...prev, [lead.id_prospect]: true }));
                            if (typeof handleConfirmerRdvLeadAmbassadeur === 'function') {
                              await handleConfirmerRdvLeadAmbassadeur(lead.id_prospect, dateRdv, 'RDV confirmé depuis le tableau de bord');
                            }
                            setConfirmationRdvEnCours(prev => ({ ...prev, [lead.id_prospect]: false }));
                          }}
                          style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 14px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {enCoursValidationRdv ? 'Validation...' : 'Confirmer le RDV'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* B. Leads Disponibles sur le Secteur */}
                {leadsDispo.map((lead) => {
                  const nomParrain = lead.nom_parrain_verifie || lead.nom_salon_parrain || 'Salon Confrère';
                  const enCoursResa = Boolean(reservationEnCours[lead.id_prospect]);

                  return (
                    <div
                      key={`lead-dispo-${lead.id_prospect}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>
                            {lead.nom_salon}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {lead.ville ? `${lead.code_postal || ''} ${lead.ville}` : `Dép. ${lead.departement || ''}`}
                          </span>
                          <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontWeight: '700' }}>
                            Parrainé par {nomParrain}
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                          Contact : {lead.prenom_contact || lead.nom_contact ? `${lead.prenom_contact || ''} ${lead.nom_contact || ''}`.trim() : 'Gérant'} — Tél : {lead.telephone_salon}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11.5px', color: '#34d399', fontWeight: '700' }}>
                          50,00 € + 20% HT
                        </span>
                        <button
                          type="button"
                          disabled={enCoursResa}
                          onClick={async () => {
                            setReservationEnCours(prev => ({ ...prev, [lead.id_prospect]: true }));
                            if (typeof handleReserverLeadAmbassadeur === 'function') {
                              await handleReserverLeadAmbassadeur(lead.id_prospect);
                            }
                            setReservationEnCours(prev => ({ ...prev, [lead.id_prospect]: false }));
                          }}
                          style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 14px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {enCoursResa ? 'Réservation...' : 'Réserver ce lead (45 min)'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODALE DE CLÔTURE ET DE FACTURATION INTERVENTION (39 € NET) */}
            {modalResolution.ouverte && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '16px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '20px',
                    padding: '24px',
                    width: '100%',
                    maxWidth: '520px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                    Clôturer l'intervention & Émettre la facture
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                    Salon : <strong>{modalResolution.intervention?.nom_salon}</strong><br />
                    Montant de l'intervention : <strong>39,00 € Net</strong><br />
                    Destinataire : <strong>{modalResolution.intervention?.payeur === 'STACK' ? 'STACK Software (Pris en charge à 100%)' : 'Salon (Facture émise au salon)'}</strong>
                  </p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                      Rapport d'intervention (obligatoire, min. 8 caractères) *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Décrivez les réparations effectuées (ex: Échange bloc d'alimentation TPE réalisé avec succès, test d'impression et encaissement validés)."
                      value={modalResolution.rapport}
                      onChange={(e) => setModalResolution(prev => ({ ...prev, rapport: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: '12px',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      disabled={modalResolution.enCours}
                      onClick={() => setModalResolution({ ouverte: false, intervention: null, rapport: '', enCours: false })}
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#cbd5e1',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={modalResolution.enCours}
                      onClick={async () => {
                        const rap = (modalResolution.rapport || '').trim();
                        if (rap.length < 8) {
                          alert("Veuillez saisir un rapport d'intervention d'au moins 8 caractères.");
                          return;
                        }
                        setModalResolution(prev => ({ ...prev, enCours: true }));
                        if (typeof handleResoudreIntervention === 'function') {
                          await handleResoudreIntervention(modalResolution.intervention.id_intervention, rap);
                        }
                        setModalResolution({ ouverte: false, intervention: null, rapport: '', enCours: false });
                      }}
                      style={{
                        backgroundColor: '#10b981',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      {modalResolution.enCours ? 'Validation...' : 'Valider & Émettre la facture 39 €'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })()}

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
              <h2 style={{ margin: 0, fontSize: isMobile ? '15px' : '16px', fontWeight: '800', color: 'var(--sp-text, #18181b)', letterSpacing: '-0.02em' }}>
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
                      border: actif ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                      background: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                      color: actif ? '#059669' : 'var(--sp-muted, #64748b)',
                      padding: '5px 11px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: actif ? '800' : '700',
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

            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-muted, #64748b)', whiteSpace: 'nowrap' }}>
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
                borderRadius: '999px',
                marginBottom: '10px'
              }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--sp-muted, #64748b)" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher un salon affilié..."
                value={rechercheSalon}
                onChange={(e) => setRechercheSalon(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--sp-text, #18181b)'
                }}
              />
            </div>
          )}

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
