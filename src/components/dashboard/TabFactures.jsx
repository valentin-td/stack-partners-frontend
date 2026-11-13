// src/components/dashboard/TabFactures.jsx
// Onglet 4 : Factures d'installation 99 EUR HT, génération, téléchargement PDF et validation en Verre Cristal

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

  const listeFactures = Array.isArray(factures) ? factures : [];

  // Calcul des KPIs de facturation Onboarding (99 € HT par facture)
  const {
    nbTotal,
    nbPayees,
    nbEnAttente,
    montantEncaisseHT,
    montantEnAttenteHT,
    tauxEncaissement,
    facturesEnAttentePrioritaires
  } = useMemo(() => {
    let payees = 0;
    let attente = 0;
    let totalPaye = 0;
    let totalAttente = 0;

    listeFactures.forEach((f) => {
      const montantUnitaire = parseFloat(f.montant_ht) || 99;
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
    const enAttenteListe = listeFactures.filter((f) => f.statut !== 'PAYEE').slice(0, 4);

    return {
      nbTotal: total,
      nbPayees: payees,
      nbEnAttente: attente,
      montantEncaisseHT: totalPaye,
      montantEnAttenteHT: totalAttente,
      tauxEncaissement: taux,
      facturesEnAttentePrioritaires: enAttenteListe
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
    <div style={{ paddingBottom: isMobile ? '90px' : '24px' }}>
      <style>{`
        .sp-invoice-row {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.66) 100%);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 4px 14px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 18px;
          padding: 14px 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sp-invoice-row:hover {
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
          max-width: 860px;
          max-height: 90dvh;
          overflow-y: auto;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 249, 253, 0.9) 100%);
          border: 1.5px solid #ffffff;
          box-shadow: 0 28px 68px -12px rgba(15, 23, 42, 0.25), inset 0 1px 0 #ffffff;
          border-radius: 26px;
          color: #0f172a;
          box-sizing: border-box;
        }
        .sp-fac-input {
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
        .sp-fac-input:focus {
          border-color: #0f172a;
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE FACTURES D'INSTALLATION + BOUTON NOUVELLE FACTURE        */}
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
            Facturation Mandataire • Mise en Service
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
            Factures d'Installation (99 € HT)
          </h1>
          <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
            Générez vos factures d'onboarding, transmettez-les par e-mail au gérant et suivez vos règlements.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowFactureForm(true)}
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
          <span>Nouvelle Facture</span>
        </button>
      </header>

      {/* =================================================================== */}
      {/* 2. LES 4 KPIS DE FACTURATION (VERRE CRISTAL)                        */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '22px'
        }}
      >
        {/* KPI 1 : Factures émises */}
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
              <Icon.Factures />
            </div>
            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '700', color: '#64748b' }}>
              Total
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbTotal}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Factures émises
            </div>
          </div>
        </div>

        {/* KPI 2 : En attente de règlement */}
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
              {nbEnAttente} en attente
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: nbEnAttente > 0 ? '#d97706' : '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {formatMontant(montantEnAttenteHT)} <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>€ HT</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              En attente de paiement
            </div>
          </div>
        </div>

        {/* KPI 3 : Factures Payées */}
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
              <Icon.Check />
            </div>
            <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              {tauxEncaissement}% réglées
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#059669', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbPayees}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Factures encaissées
            </div>
          </div>
        </div>

        {/* KPI 4 : Chiffre d'affaires Onboarding encaissé */}
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
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '16px'
              }}
            >
              €
            </div>
            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', color: '#4f46e5' }}>
              100 % Agent
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {formatMontant(montantEncaisseHT)} <span style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8' }}>€ HT</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Revenu Onboarding acquis
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. GRILLE BENTO 2 COLONNES (REGISTRE FACTURES | SUIVI & RÈGLES)     */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.48fr 1fr',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* COLONNE GAUCHE : REGISTRE DES FACTURES D'INSTALLATION */}
        <div className="sp-glass-panel" style={{ padding: isMobile ? '18px 14px' : '22px 24px' }}>
          {/* Barre de filtres + Recherche */}
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
                      border: 'none',
                      background: actif ? '#111827' : 'transparent',
                      color: actif ? '#ffffff' : '#64748b',
                      padding: '6px 13px',
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
                width: isMobile ? '100%' : '235px',
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
                  fontSize: '12.5px',
                  color: '#0f172a',
                  fontFamily: 'inherit'
                }}
              />
              {rechercheFacture && (
                <button
                  type="button"
                  onClick={() => setRechercheFacture('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                >
                  X
                </button>
              )}
            </div>
          </div>

          {/* Liste des factures */}
          {facturesFiltrees.length === 0 ? (
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
                Aucune facture dans cette vue
              </strong>
              <span style={{ display: 'block', marginBottom: '16px' }}>
                Émettez une facture de mise en service (99 € HT) lors de l'installation d'un nouveau salon.
              </span>
              <button
                type="button"
                onClick={() => setShowFactureForm(true)}
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
                + Émettre une facture
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {facturesFiltrees.map((f) => {
                const estPayee = f.statut === 'PAYEE';
                const nomSalonFormate = formatNomSalonPropre(f.nom_salon || 'Salon');

                return (
                  <div key={f.id_facture} className="sp-invoice-row">
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      {/* Infos Facture & Salon */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '13px',
                            background: estPayee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.15)',
                            color: estPayee ? '#059669' : '#d97706',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon.Factures />
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
                              {nomSalonFormate}
                            </strong>

                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '7px',
                                background: 'rgba(15, 23, 42, 0.06)',
                                color: '#334155'
                              }}
                            >
                              {f.numero_facture}
                            </span>

                            <span
                              style={{
                                padding: '2px 9px',
                                borderRadius: '999px',
                                fontSize: '10.5px',
                                fontWeight: '800',
                                backgroundColor: estPayee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                                color: estPayee ? '#059669' : '#b45309'
                              }}
                            >
                              {estPayee ? 'Payée' : 'En attente'}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                              marginTop: '4px',
                              fontSize: '12px',
                              color: '#64748b'
                            }}
                          >
                            <span>Émise le {formatDate(f.date_emission)}</span>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11.5px' }}>
                              SIRET : {f.siret_salon || 'N/A'}
                            </span>
                            <span>•</span>
                            <strong style={{ color: '#0f172a' }}>99,00 € HT</strong>
                          </div>
                        </div>
                      </div>

                      {/* Boutons d'actions : PDF, E-mail, Valider paiement */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isMobile ? 'flex-end' : 'flex-end',
                          gap: '8px',
                          flexWrap: 'wrap',
                          paddingTop: isMobile ? '10px' : 0,
                          borderTop: isMobile ? '1px solid rgba(148, 163, 184, 0.16)' : 'none',
                          flexShrink: 0
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleDownload(f.id_facture, f.numero_facture)}
                          className="sp-glass-pill"
                          style={{
                            padding: '8px 13px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#0f172a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
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
                            padding: '8px 13px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#0f172a',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
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
                            style={{
                              padding: '8px 15px',
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
                              boxShadow: '0 6px 16px -4px rgba(17, 24, 39, 0.22)'
                            }}
                          >
                            <Icon.Check />
                            <span>Valider paiement</span>
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

        {/* COLONNE DROITE : ENCAISSEMENTS EN ATTENTE & RÈGLES MANDATAIRE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Carte 1 : Factures en attente de règlement */}
          <div className="sp-glass-panel" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon.Zap />
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                  Règlements à pointer
                </h3>
              </div>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  background: nbEnAttente > 0 ? 'rgba(245, 158, 11, 0.16)' : 'rgba(16, 185, 129, 0.14)',
                  color: nbEnAttente > 0 ? '#b45309' : '#059669'
                }}
              >
                {nbEnAttente > 0 ? `${nbEnAttente} en attente` : 'Tout est réglé'}
              </span>
            </div>

            {facturesEnAttentePrioritaires.length === 0 ? (
              <div
                className="sp-glass-pill"
                style={{ padding: '18px 14px', borderRadius: '16px', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}
              >
                Toutes vos factures d'installation ont été réglées.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {facturesEnAttentePrioritaires.map((fac) => (
                  <div
                    key={`wait-${fac.id_facture}`}
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
                        {formatNomSalonPropre(fac.nom_salon)}
                      </strong>
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace' }}>
                        {fac.numero_facture} • 99,00 € HT
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePay(fac.id_facture)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '999px',
                        border: 'none',
                        background: '#111827',
                        color: '#ffffff',
                        fontSize: '11.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icon.Check /> Pointer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carte 2 : Fonctionnement des frais de mise en service (99 € HT) */}
          <div className="sp-glass-panel" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Icon.Shield />
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                Facturation Onboarding (99 € HT)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  num: '1',
                  titre: '100 % acquis à l’agent',
                  desc: "Les 99 € HT de frais d'installation et de paramétrage initial sont facturés directement en votre nom (mention RSAC)."
                },
                {
                  num: '2',
                  titre: 'Envoi PDF & E-mail en 1 clic',
                  desc: "Chaque facture est générée au format PDF conforme avec votre SIRET et votre régime de TVA (Franchise 293B ou TVA 20%)."
                },
                {
                  num: '3',
                  titre: 'Validation Go-Live du salon',
                  desc: "Une fois le règlement reçu, cliquez sur « Valider paiement » pour confirmer la mise en service."
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
      {/* 4. MODALE 2 COLONNES : NOUVELLE FACTURE D'INSTALLATION (99 € HT)    */}
      {/* =================================================================== */}
      {showFactureForm && (
        <div className="sp-modal-backdrop" onClick={() => setShowFactureForm(false)}>
          <div
            className="sp-modal-box"
            onClick={(e) => e.stopPropagation()}
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
                  <Icon.Factures />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '19px' : '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Nouvelle Facture d'Installation
                  </h2>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Édition immédiate de la facture de mise en service et paramétrage (99,00 € HT)
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
                  color: '#64748b',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                X
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
                gap: isMobile ? '16px' : '22px',
                alignItems: 'stretch'
              }}
            >
              {/* Colonne gauche : Coordonnées de facturation du salon */}
              <div className="sp-glass-panel" style={{ padding: isMobile ? '16px 14px' : '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                  Établissement facturé
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
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
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
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
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '5px' }}>
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
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Aperçu de la pièce comptable
                      </span>
                      <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
                        PDF Certifié
                      </span>
                    </div>

                    <div className="sp-glass-pill" style={{ padding: '16px', borderRadius: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '2px' }}>
                        Destinataire :
                      </div>
                      <strong style={{ display: 'block', fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>
                        {formatNomSalonPropre(factureData.nom_salon || 'Nom du salon')}
                      </strong>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '4px' }}>
                        {factureData.adresse_salon || 'Adresse du salon'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', marginBottom: '12px' }}>
                        SIRET : {factureData.siret_salon || '—'}
                      </div>

                      <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.22)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Prestation</span>
                          <strong style={{ color: '#0f172a' }}>Onboarding & Setup STACK</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '6px', borderTop: '1px dashed rgba(148, 163, 184, 0.25)' }}>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>Total HT</strong>
                          <strong style={{ color: '#4f46e5', fontSize: '19px', fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>
                            99,00 € HT
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45 }}>
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
