// src/components/dashboard/TabFactures.jsx
// Onglet 4 : Facturation Onboarding — Design Salon Architecte (Zéro doublon, Zéro fatigue visuelle, Jour & Nuit)

import React, { useState, useMemo } from 'react';
import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';

const ACRONYMES_SALON = new Set(['SARL', 'SAS', 'SASU', 'EURL', 'SPA', 'VIP', 'CO', 'HT', 'TTC']);

const formatNomSalonPropre = (str) => {
  const s = String(str || '').trim();
  if (!s) return '';
  return s
    .split(/\s+/)
    .map((word) => {
      const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, '').toUpperCase();
      if (ACRONYMES_SALON.has(clean)) return word.toUpperCase();
      return word
        .split(/(['’-])/)
        .map((part) =>
          part === "'" || part === '’' || part === '-'
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join('');
    })
    .join(' ');
};

const formatMontant = (val) => {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function TabFactures({
  factures = [],
  showFactureForm,
  setShowFactureForm,
  factureData = {},
  setFactureData,
  handleCreateFacture,
  handleDownload,
  handleSendFactureEmail,
  handlePay,
  isMobile
}) {
  const [filtreStatut, setFiltreStatut] = useState('TOUTES'); // 'TOUTES' | 'ATTENTE' | 'PAYEE'
  const [rechercheFacture, setRechercheFacture] = useState('');
  const [afficherReglesFacturation, setAfficherReglesFacturation] = useState(false);

  const listeFactures = Array.isArray(factures) ? factures : [];

  // Calcul des KPIs de facturation et ventilation Agent (99 €) vs STACK Cloud (100 €)
  const {
    nbTotal,
    nbPayees,
    nbEnAttente,
    montantEncaisseHT,
    montantEnAttenteHT,
    montantAgentTotalHT,
    montantStackTotalHT,
    nbAgentTotal,
    nbStackTotal,
    tauxEncaissement
  } = useMemo(() => {
    let payees = 0;
    let attente = 0;
    let totalPaye = 0;
    let totalAttente = 0;
    let agentHT = 0;
    let stackHT = 0;
    let countAgent = 0;
    let countStack = 0;

    listeFactures.forEach((f) => {
      const estStack = f.type_facture === 'STACK' || String(f.numero_facture || '').startsWith('FAC-ST');
      const montantUnitaire = parseFloat(f.montant_ht) || (estStack ? 100 : 99);

      if (estStack) {
        stackHT += montantUnitaire;
        countStack += 1;
      } else {
        agentHT += montantUnitaire;
        countAgent += 1;
      }

      if (f.statut === 'PAYEE') {
        payees += 1;
        totalPaye += montantUnitaire;
      } else {
        attente += 1;
        totalAttente += montantUnitaire;
      }
    });

    const total = listeFactures.length;
    const taux = total > 0 ? Math.round((payees / total) * 100) : 0;

    return {
      nbTotal: total,
      nbPayees: payees,
      nbEnAttente: attente,
      montantEncaisseHT: totalPaye,
      montantEnAttenteHT: totalAttente,
      montantAgentTotalHT: agentHT,
      montantStackTotalHT: stackHT,
      nbAgentTotal: countAgent,
      nbStackTotal: countStack,
      tauxEncaissement: taux
    };
  }, [listeFactures]);

  // Filtrage par statut et recherche texte
  const facturesFiltrees = useMemo(() => {
    const q = rechercheFacture.trim().toLowerCase();

    return listeFactures.filter((f) => {
      if (filtreStatut === 'PAYEE' && f.statut !== 'PAYEE') return false;
      if (filtreStatut === 'ATTENTE' && f.statut === 'PAYEE') return false;

      if (!q) return true;
      const matchNum = String(f.numero_facture || '').toLowerCase().includes(q);
      const matchSalon = String(f.nom_salon || '').toLowerCase().includes(q);
      const matchSiret = String(f.siret_salon || '').toLowerCase().includes(q);
      return matchNum || matchSalon || matchSiret;
    });
  }, [listeFactures, filtreStatut, rechercheFacture]);

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
      <style>{`
        .sp-invoice-row {
          background: var(--sp-bg-pill, rgba(255, 255, 255, 0.90));
          border: var(--sp-border-pill, 1px solid rgba(148, 163, 184, 0.22));
          box-shadow: 0 3px 10px -4px rgba(15, 23, 42, 0.04);
          border-radius: 16px;
          padding: 13px 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .sp-invoice-row:hover {
          transform: translateY(-1px);
          border-color: rgba(16, 185, 129, 0.40);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.07);
        }
        .sp-pay-soft-btn {
          background: rgba(16, 185, 129, 0.14);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.35);
          transition: all 0.15s ease;
        }
        .sp-pay-soft-btn:hover {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }
        html.dark-mode .sp-pay-soft-btn {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.40);
        }
        html.dark-mode .sp-pay-soft-btn:hover {
          background: #10b981;
          color: #0b0d10;
        }
        .sp-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100020;
          background: rgba(15, 23, 42, 0.48);
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
          max-width: 860px;
          max-height: 90dvh;
          overflow-y: auto;
          background: var(--sp-bg-app, #f3f1ed);
          border: var(--sp-border-card, 1px solid rgba(148, 163, 184, 0.28));
          box-shadow: 0 28px 68px -12px rgba(15, 23, 42, 0.28);
          border-radius: 24px;
          color: var(--sp-text-main, #18181b);
          box-sizing: border-box;
        }
        .sp-fac-input {
          width: 100%;
          box-sizing: border-box;
          height: 42px;
          padding: 0 13px;
          background: var(--sp-bg-input, #ffffff);
          border: var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.32));
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--sp-text-main, #18181b);
          outline: none;
          transition: border-color 0.15s ease;
        }
        .sp-fac-input:focus {
          border-color: #10b981;
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE COMPACT SUR UNE SEULE LIGNE (UN SEUL BOUTON D'ACTION)    */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: isMobile ? '12px' : '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', minWidth: 0 }}>
          <h1
            style={{
              fontSize: isMobile ? '22px' : '27px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.03em',
              color: 'var(--sp-text-main, #18181b)',
              lineHeight: 1.1
            }}
          >
            Facturation
          </h1>
          {!isMobile && (
            <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
              Factures d'onboarding (99 € HT Agent) • Envoi PDF & suivi des règlements
            </span>
          )}
        </div>

        {/* Seul bouton plein de toute la page */}
        <button
          type="button"
          onClick={() => setShowFactureForm(true)}
          style={{
            height: isMobile ? '36px' : '38px',
            padding: isMobile ? '0 14px' : '0 18px',
            borderRadius: '999px',
            backgroundColor: 'var(--sp-btn-primary, #18181b)',
            color: 'var(--sp-btn-primary-text, #ffffff)',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.18)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Icon.Plus />
          <span>Nouvelle Facture</span>
        </button>
      </header>

      {/* =================================================================== */}
      {/* 2. LES 4 KPIS HIÉRARCHISÉS (CARTE MAÎTRESSE ÉMERAUDE + 3 KPIS)      */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1.3fr 1fr 1fr 1fr',
          gap: isMobile ? '8px' : '14px',
          marginBottom: isMobile ? '12px' : '18px'
        }}
      >
        {/* KPI 1 (Pièce maîtresse) : Revenu Onboarding encaissé + Jauge de recouvrement */}
        <div
          className="sp-glass-panel-dark"
          style={{
            gridColumn: isMobile ? '1 / -1' : 'auto',
            padding: isMobile ? '16px 18px' : '18px 22px',
            minHeight: isMobile ? '96px' : '108px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Revenu Onboarding acquis
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.22)', color: '#34d399' }}>
              100 % Agent
            </span>
          </div>

          <div style={{ fontSize: isMobile ? '26px' : '29px', fontWeight: '800', color: '#ffffff', lineHeight: 1, fontVariantNumeric: 'tabular-nums', margin: '6px 0' }}>
            {formatMontant(montantEncaisseHT)} <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.65)' }}>€ HT</span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: '4px' }}>
              <span>{nbPayees} sur {nbTotal} réglée{nbPayees > 1 ? 's' : ''}</span>
              <span style={{ color: '#34d399', fontWeight: '800' }}>{tauxEncaissement}%</span>
            </div>
            <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(5, tauxEncaissement)}%`, background: '#10b981', borderRadius: '999px' }} />
            </div>
          </div>
        </div>

        {/* KPI 2 : En attente de paiement */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '13px 14px' : '18px 20px',
            minHeight: isMobile ? '82px' : '108px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              À encaisser
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(245, 158, 11, 0.14)', color: '#b45309' }}>
              {nbEnAttente} en attente
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '800', color: nbEnAttente > 0 ? '#d97706' : 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {formatMontant(montantEnAttenteHT)} <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>€ HT</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              En attente de règlement
            </div>
          </div>
        </div>

        {/* KPI 3 : Factures encaissées */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '13px 14px' : '18px 20px',
            minHeight: isMobile ? '82px' : '108px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Encaissées
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              {tauxEncaissement}% réglées
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: nbPayees > 0 ? '#059669' : 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbPayees}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              Paiements validés
            </div>
          </div>
        </div>

        {/* KPI 4 : Total Factures émises */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '13px 14px' : '18px 20px',
            minHeight: isMobile ? '82px' : '108px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Factures émises
            </span>
            <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
              Registre
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbTotal}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              {nbAgentTotal} Agent • {nbStackTotal} Cloud
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. GRILLE BENTO 2 COLONNES (REGISTRE FACTURES | VENTILATION & RÈGLES)*/}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.52fr 1fr',
          gap: isMobile ? '12px' : '18px',
          alignItems: 'start'
        }}
      >
        {/* COLONNE GAUCHE : REGISTRE DES FACTURES D'INSTALLATION (SANS BOUTON DOUBLON) */}
        <div className="sp-glass-panel" style={{ padding: isMobile ? '16px 12px' : '20px 22px', minWidth: 0 }}>
          {/* Barre de filtres doux + Recherche */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '10px',
              marginBottom: '14px'
            }}
          >
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
                { id: 'TOUTES', label: `Toutes (${nbTotal})` },
                { id: 'ATTENTE', label: `En attente (${nbEnAttente})` },
                { id: 'PAYEE', label: `Payées (${nbPayees})` }
              ].map((tab) => {
                const actif = filtreStatut === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltreStatut(tab.id)}
                    style={{
                      border: actif ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                      background: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                      color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                      padding: '5px 13px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: actif ? '800' : '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
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
                padding: '6px 13px',
                borderRadius: '999px',
                width: isMobile ? '100%' : '245px',
                boxSizing: 'border-box'
              }}
            >
              <Icon.Search />
              <input
                type="text"
                placeholder="N° facture, salon, SIRET..."
                value={rechercheFacture}
                onChange={(e) => setRechercheFacture(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--sp-text-main, #18181b)',
                  fontFamily: 'inherit'
                }}
              />
              {rechercheFacture && (
                <button
                  type="button"
                  onClick={() => setRechercheFacture('')}
                  style={{ background: 'none', border: 'none', color: 'var(--sp-text-muted, #64748b)', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Liste des factures */}
          {facturesFiltrees.length === 0 ? (
            <div
              className="sp-glass-pill"
              style={{
                padding: '36px 18px',
                borderRadius: '16px',
                textAlign: 'center',
                color: 'var(--sp-text-muted, #64748b)',
                fontSize: '12.5px'
              }}
            >
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
                Aucune facture dans cette vue
              </strong>
              <span style={{ display: 'block', marginBottom: '14px' }}>
                Émettez une facture de mise en service (99 € HT) lors de l'installation d'un nouveau salon.
              </span>
              <button
                type="button"
                onClick={() => setShowFactureForm(true)}
                className="sp-pay-soft-btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                + Émettre une facture
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {facturesFiltrees.map((f) => {
                const estPayee = f.statut === 'PAYEE';
                const estStack = f.type_facture === 'STACK' || String(f.numero_facture || '').startsWith('FAC-ST');
                const nomSalonFormate = formatNomSalonPropre(f.nom_salon || 'Salon');
                const montantHT = parseFloat(f.montant_ht) || (estStack ? 100 : 99);

                return (
                  <div key={f.id_facture} className="sp-invoice-row">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      {/* Gauche : Icône + Salon + Badges + Métadonnées */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '11px',
                            background: estPayee
                              ? 'rgba(16, 185, 129, 0.14)'
                              : estStack
                                ? 'rgba(14, 165, 233, 0.12)'
                                : 'rgba(245, 158, 11, 0.14)',
                            border: estPayee
                              ? '1px solid rgba(16, 185, 129, 0.28)'
                              : estStack
                                ? '1px solid rgba(14, 165, 233, 0.25)'
                                : '1px solid rgba(245, 158, 11, 0.28)',
                            color: estPayee ? '#059669' : estStack ? '#0284c7' : '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon.Factures />
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                            <strong
                              style={{
                                fontSize: '14.5px',
                                fontWeight: '800',
                                color: 'var(--sp-text-main, #18181b)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {nomSalonFormate}
                            </strong>

                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                background: estStack ? 'rgba(14, 165, 233, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                color: estStack ? '#0284c7' : '#059669'
                              }}
                            >
                              {estStack ? 'STACK Cloud' : 'Agent Installation'}
                            </span>

                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: '800',
                                backgroundColor: estPayee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.15)',
                                color: estPayee ? '#059669' : '#b45309'
                              }}
                            >
                              {estPayee ? (f.mode_reglement === 'STRIPE' ? 'Payée Stripe ✓' : 'Payée ✓') : 'En attente'}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '7px',
                              flexWrap: 'wrap',
                              marginTop: '4px',
                              fontSize: '11.5px',
                              color: 'var(--sp-text-muted, #64748b)'
                            }}
                          >
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>
                              {f.numero_facture}
                            </span>
                            <span>•</span>
                            <span>Émise le {formatDate(f.date_emission)}</span>
                            {f.siret_salon && (
                              <>
                                <span>•</span>
                                <span>SIRET {f.siret_salon}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Droite : Montant mis en valeur + Boutons PDF, E-mail et Encaisser Soft */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap',
                          paddingTop: isMobile ? '9px' : 0,
                          borderTop: isMobile ? '1px solid rgba(148, 163, 184, 0.16)' : 'none',
                          flexShrink: 0
                        }}
                      >
                        <div style={{ textAlign: isMobile ? 'left' : 'right', marginRight: '4px' }}>
                          <strong
                            style={{
                              fontSize: '15px',
                              fontWeight: '800',
                              color: estPayee ? '#059669' : 'var(--sp-text-main, #18181b)',
                              fontVariantNumeric: 'tabular-nums',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {formatMontant(montantHT)} € <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>HT</span>
                          </strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleDownload(f.id_facture, f.numero_facture)}
                            className="sp-glass-pill"
                            style={{
                              padding: '6px 11px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              color: 'var(--sp-text-main, #18181b)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer'
                            }}
                            title="Télécharger la facture PDF"
                          >
                            <Icon.FileDownload />
                            <span>PDF</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendFactureEmail(f.id_facture, f.nom_salon)}
                            className="sp-glass-pill"
                            style={{
                              padding: '6px 11px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              color: 'var(--sp-text-main, #18181b)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer'
                            }}
                            title="Envoyer la facture par e-mail au salon"
                          >
                            <Icon.ArrowUpRight />
                            <span>E-mail</span>
                          </button>

                          {!estPayee && (
                            <button
                              type="button"
                              onClick={() => handlePay(f.id_facture)}
                              className="sp-pay-soft-btn"
                              style={{
                                padding: '6px 13px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Icon.Check />
                              <span>Valider paiement</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLONNE DROITE : SYNTHÈSE DE FACTURATION (ZÉRO DOUBLON DE LISTE) & RÈGLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
          {/* Carte 1 : Synthèse & Ventilation des factures (Remplace la liste en doublon "Règlements à pointer") */}
          <div className="sp-glass-panel" style={{ padding: isMobile ? '16px 14px' : '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#059669', display: 'flex' }}>
                  <Icon.Check />
                </span>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                  Ventilation des factures
                </h3>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '10px',
                  fontWeight: '800',
                  background: nbEnAttente > 0 ? 'rgba(245, 158, 11, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                  color: nbEnAttente > 0 ? '#b45309' : '#059669'
                }}
              >
                {nbEnAttente > 0 ? `${nbEnAttente} à encaisser` : '100% encaissé ✓'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div className="sp-glass-pill" style={{ padding: '11px 13px', borderRadius: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--sp-text-main, #18181b)' }}>
                    Prestations Agent (99 € HT)
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)' }}>
                    {nbAgentTotal} facture{nbAgentTotal > 1 ? 's' : ''} • 100 % reversé à l'agent
                  </span>
                </div>
                <strong style={{ fontSize: '14.5px', fontWeight: '800', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                  {formatMontant(montantAgentTotalHT)} € HT
                </strong>
              </div>

              <div className="sp-glass-pill" style={{ padding: '11px 13px', borderRadius: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--sp-text-main, #18181b)' }}>
                    Mise en service STACK Cloud
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)' }}>
                    {nbStackTotal} facture{nbStackTotal > 1 ? 's' : ''} • Déploiement infrastructure
                  </span>
                </div>
                <strong style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatMontant(montantStackTotalHT)} € HT
                </strong>
              </div>

              {nbEnAttente > 0 && filtreStatut !== 'ATTENTE' && (
                <button
                  type="button"
                  onClick={() => setFiltreStatut('ATTENTE')}
                  className="sp-glass-pill"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '11px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#b45309',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '2px'
                  }}
                >
                  Filtrer les {nbEnAttente} facture{nbEnAttente > 1 ? 's' : ''} en attente ({formatMontant(montantEnAttenteHT)} € HT) →
                </button>
              )}
            </div>
          </div>

          {/* Carte 2 : Fonctionnement des frais de mise en service (Sans le 3e bouton noir redondant) */}
          <div className="sp-glass-panel" style={{ padding: isMobile ? '13px 14px' : '18px 20px' }}>
            <div
              onClick={() => isMobile && setAfficherReglesFacturation(!afficherReglesFacturation)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                marginBottom: !isMobile || afficherReglesFacturation ? '12px' : 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#059669', display: 'flex' }}>
                  <Icon.Shield />
                </span>
                <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                  Facturation Onboarding (99 € HT)
                </h3>
              </div>
              {isMobile && (
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)' }}>
                  {afficherReglesFacturation ? 'Masquer ▲' : 'Règles ▼'}
                </span>
              )}
            </div>

            {(!isMobile || afficherReglesFacturation) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    num: '1',
                    titre: '100 % acquis à l’agent',
                    desc: "Les 99 € HT de frais d'installation et de paramétrage initial sont facturés directement en votre nom (mention RSAC)."
                  },
                  {
                    num: '2',
                    titre: 'Envoi PDF & E-mail en 1 clic',
                    desc: 'Chaque facture est générée au format PDF conforme avec votre SIRET et votre régime de TVA (Franchise 293B ou TVA 20%).'
                  },
                  {
                    num: '3',
                    titre: 'Validation Go-Live du salon',
                    desc: 'Une fois le règlement reçu, cliquez sur « Valider paiement » pour confirmer la mise en service.'
                  }
                ].map((step) => (
                  <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'rgba(16, 185, 129, 0.14)',
                        border: '1px solid rgba(16, 185, 129, 0.32)',
                        color: '#059669',
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
                      <strong style={{ display: 'block', fontSize: '12.5px', color: 'var(--sp-text-main, #18181b)', marginBottom: '1px' }}>
                        {step.titre}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4, display: 'block' }}>
                        {step.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MODALE 2 COLONNES : NOUVELLE FACTURE D'INSTALLATION (99 € HT)    */}
      {/* =================================================================== */}
      {showFactureForm && (
        <div className="sp-modal-backdrop" onClick={() => setShowFactureForm(false)}>
          <div
            className="sp-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: isMobile ? '20px 16px 26px 16px' : '26px 28px' }}
          >
            {/* En-tête de la modale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '13px',
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.32)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669',
                    flexShrink: 0
                  }}
                >
                  <Icon.Factures />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '18.5px' : '21px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', letterSpacing: '-0.02em' }}>
                    Nouvelle Facture d'Installation
                  </h2>
                  <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
                    Génération du lot double facture : Prestation Agent (99,00 € HT) & Frais Cloud STACK (100,00 € HT)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFactureForm(false)}
                className="sp-glass-pill"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: 'var(--sp-text-muted, #64748b)',
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

            <form
              onSubmit={async (e) => {
                await Promise.resolve(handleCreateFacture(e));
                setShowFactureForm(false);
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr',
                gap: isMobile ? '16px' : '20px',
                alignItems: 'stretch'
              }}
            >
              {/* Colonne gauche : Coordonnées de facturation du salon */}
              <div className="sp-glass-panel" style={{ padding: isMobile ? '16px 14px' : '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                  Établissement facturé
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '5px' }}>
                    Nom du Salon / Raison sociale <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Salon Élégance Coiffure"
                    required
                    value={factureData.nom_salon || ''}
                    onChange={(e) => setFactureData({ ...factureData, nom_salon: e.target.value })}
                    className="sp-fac-input"
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '5px' }}>
                    SIRET du Salon <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 892 345 678 00014"
                    required
                    value={factureData.siret_salon || ''}
                    onChange={(e) => setFactureData({ ...factureData, siret_salon: e.target.value })}
                    className="sp-fac-input"
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '5px' }}>
                    Adresse complète de facturation <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : 12 rue des Hallebardes, 67000 Strasbourg"
                    required
                    value={factureData.adresse_salon || ''}
                    onChange={(e) => setFactureData({ ...factureData, adresse_salon: e.target.value })}
                    className="sp-fac-input"
                  />
                </div>
              </div>

              {/* Colonne droite : Aperçu de la facture en direct */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                <div className="sp-glass-panel" style={{ padding: '20px', borderRadius: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Aperçu de la pièce comptable
                      </span>
                      <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
                        PDF Certifié
                      </span>
                    </div>

                    <div className="sp-glass-pill" style={{ padding: '16px', borderRadius: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '2px' }}>
                        Destinataire :
                      </div>
                      <strong style={{ display: 'block', fontSize: '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '2px' }}>
                        {formatNomSalonPropre(factureData.nom_salon || 'Nom du salon')}
                      </strong>
                      <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', marginBottom: '4px' }}>
                        {factureData.adresse_salon || 'Adresse du salon'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', fontFamily: 'monospace', marginBottom: '12px' }}>
                        SIRET : {factureData.siret_salon || '—'}
                      </div>

                      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.22)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--sp-text-muted, #64748b)' }}>Prestation Agent</span>
                          <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>Onboarding & Setup STACK</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '6px', borderTop: '1px dashed rgba(148, 163, 184, 0.25)' }}>
                          <strong style={{ color: 'var(--sp-text-main, #18181b)', fontSize: '13px' }}>Total Agent HT</strong>
                          <strong style={{ color: '#059669', fontSize: '19px', fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>
                            99,00 € HT
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.45 }}>
                    La facture sera immédiatement disponible en téléchargement PDF et prête à être envoyée par e-mail.
                  </div>
                </div>

                {/* Boutons Annuler / Générer */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowFactureForm(false)}
                    className="sp-glass-pill"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--sp-text-main, #18181b)',
                      cursor: 'pointer'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1.6,
                      padding: '12px 18px',
                      borderRadius: '999px',
                      border: 'none',
                      backgroundColor: 'var(--sp-btn-primary, #18181b)',
                      color: 'var(--sp-btn-primary-text, #ffffff)',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.22)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px'
                    }}
                  >
                    <Icon.Check />
                    <span>Générer la facture</span>
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
