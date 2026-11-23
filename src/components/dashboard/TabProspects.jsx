// src/components/dashboard/TabProspects.jsx
// Onglet 2 : Pipeline prospects — Design Salon Architecte (Zéro surcharge & Confort visuel Jour/Nuit)

import React, { useState, useMemo } from 'react';
import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';

const capitalizeWords = (str) => {
  const s = String(str || '').trim();
  if (!s) return '';
  return s
    .split(/\s+/)
    .map((word) =>
      word
        .split('-')
        .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''))
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
  leadsAmbassadeurs = { leads_disponibles: [], leads_reserves_en_cours: [], leads_confirmes: [] },
  fetchLeadsAmbassadeurs,
  handleReserverLeadAmbassadeur,
  handleConfirmerRdvLeadAmbassadeur,
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
  const [afficherInfosSiret, setAfficherInfosSiret] = useState(false);
  const [formRdv, setFormRdv] = useState({});
  const [pitchCopieId, setPitchCopieId] = useState(null);

  const listeProspects = Array.isArray(prospects) ? prospects : [];

  // Agrégation robuste des leads parrainés (combiner leadsAmbassadeurs + listeProspects)
  const leadsParrainageReserves = useMemo(() => {
    const map = new Map();
    (leadsAmbassadeurs?.leads_reserves_en_cours || []).forEach((l) => {
      if (l.id_prospect) map.set(l.id_prospect, l);
    });
    listeProspects.forEach((p) => {
      if (
        p.id_prospect &&
        (p.statut_prospect === 'RESERVE_CONTACT' || p.statut_prospect === 'LEAD_CHAUD_PARRAINAGE')
      ) {
        if (!map.has(p.id_prospect)) map.set(p.id_prospect, p);
      }
    });
    return Array.from(map.values());
  }, [leadsAmbassadeurs, listeProspects]);

  const leadsParrainageDisponibles = useMemo(() => {
    const map = new Map();
    (leadsAmbassadeurs?.leads_disponibles || []).forEach((l) => {
      if (l.id_prospect) map.set(l.id_prospect, l);
    });
    listeProspects.forEach((p) => {
      if (p.id_prospect && p.statut_prospect === 'DISPONIBLE_SECTEUR') {
        if (!map.has(p.id_prospect)) map.set(p.id_prospect, p);
      }
    });
    return Array.from(map.values());
  }, [leadsAmbassadeurs, listeProspects]);

  const leadsParrainageConfirmes = useMemo(() => {
    const map = new Map();
    (leadsAmbassadeurs?.leads_confirmes || []).forEach((l) => {
      if (l.id_prospect) map.set(l.id_prospect, l);
    });
    listeProspects.forEach((p) => {
      if (
        p.id_prospect &&
        (p.statut_prospect === 'RDV_CONFIRME' || p.statut_prospect === 'ASSIGNE_RDV_PLANIFIE' || p.statut_prospect === 'ONBOARDING_EN_COURS')
      ) {
        if (!map.has(p.id_prospect)) map.set(p.id_prospect, p);
      }
    });
    return Array.from(map.values());
  }, [leadsAmbassadeurs, listeProspects]);

  const estLeadParraine = (p) => {
    return Boolean(
      p?.id_salon_parrain ||
      p?.nom_salon_parrain ||
      p?.nom_parrain_verifie ||
      p?.source_lead === 'MISE_EN_RELATION_ASSISTEE' ||
      p?.source_lead === 'PARRAINAGE_SALON' ||
      p?.source_lead === 'LIEN_PARRAINAGE_AMBASSADEUR'
    );
  };

  const { nbTotal, nbProteges, nbSignes, nbExpires, nbUrgents, tauxConversion, relancesPrioritaires } = useMemo(() => {
    let proteges = 0;
    let signes = 0;
    let expires = 0;
    let urgents = 0;

    listeProspects.forEach((p) => {
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

    // Ne cible que les vraies urgences (<= 14 jours restants) pour éviter tout doublon avec la liste de gauche
    const prioritaires = [...listeProspects]
      .filter((p) => p.statut_prospect !== 'SIGNE' && p.est_protege && (parseInt(p.jours_restants, 10) || 0) <= 14)
      .sort((a, b) => (parseInt(a.jours_restants, 10) || 0) - (parseInt(b.jours_restants, 10) || 0))
      .slice(0, 4);

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

  const prospectsFiltres = useMemo(() => {
    const q = rechercheLead.trim().toLowerCase();

    return listeProspects.filter((p) => {
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

  const pctProtectionPortefeuille = nbTotal > 0 ? Math.min(100, Math.round(((nbProteges + nbSignes) / nbTotal) * 100)) : 100;

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
        .sp-lead-row {
          background: var(--sp-bg-pill, rgba(255, 255, 255, 0.90));
          border: var(--sp-border-pill, 1px solid rgba(148, 163, 184, 0.22));
          box-shadow: 0 3px 10px -4px rgba(15, 23, 42, 0.04);
          border-radius: 16px;
          padding: 13px 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .sp-lead-row:hover {
          transform: translateY(-1px);
          border-color: rgba(16, 185, 129, 0.40);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.07);
        }
        .sp-onboarding-btn {
          background: rgba(16, 185, 129, 0.14);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.35);
          transition: all 0.15s ease;
        }
        .sp-onboarding-btn:hover {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }
        html.dark-mode .sp-onboarding-btn {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.40);
        }
        html.dark-mode .sp-onboarding-btn:hover {
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
          padding: 16px;
          box-sizing: border-box;
          overscroll-behavior: contain;
        }
        .sp-modal-box {
          width: 100%;
          max-width: 860px;
          max-height: 88dvh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          background: var(--sp-bg-app, #f3f1ed);
          border: var(--sp-border-card, 1px solid rgba(148, 163, 184, 0.28));
          box-shadow: 0 28px 68px -12px rgba(15, 23, 42, 0.28);
          border-radius: 24px;
          color: var(--sp-text-main, #18181b);
          box-sizing: border-box;
        }
        .sp-field-input {
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
        .sp-field-input:focus {
          border-color: #10b981;
        }
      `}</style>

      {/* 1. EN-TÊTE MES PROSPECTS COMPACT SUR UNE SEULE LIGNE */}
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
            Mes Prospects
          </h1>
          {!isMobile && (
            <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
              Exclusivité SIRET garantie 45 jours • Commission 20 % HT (24 mois)
            </span>
          )}
        </div>

        {/* Seul bouton plein de la page */}
        <button
          type="button"
          onClick={() => setShowProspectForm(true)}
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
          <span>{isMobile ? 'Réserver' : 'Réserver un Lead'}</span>
        </button>
      </header>

      {/* 1.5. SECTION LEADS CHAUDS PARRAINÉS PAR CONFRÈRE (SECTEUR & RÉSERVATION 45 MIN) */}
      {(leadsParrainageReserves.length > 0 || leadsParrainageDisponibles.length > 0 || leadsParrainageConfirmes.length > 0) && (
        <div
          style={{
            marginBottom: '20px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.96) 0%, rgba(9, 9, 11, 0.98) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.40)',
            boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.45)',
            padding: isMobile ? '16px' : '20px 24px',
            color: '#f8fafc'
          }}
        >
          {/* En-tête de section avec alerte visuelle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 12px #10b981'
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#34d399' }}>
                Alerte Salons Parrainés — Nouveaux Leads Chauds à Contacter
              </span>
            </div>

            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
              Commission : <strong style={{ color: '#f8fafc' }}>50,00 €</strong> installation + <strong style={{ color: '#34d399' }}>20% HT</strong> dès le 4e mois (24 mois)
            </div>
          </div>

          {/* LEADS ACTUELLEMENT RÉSERVÉS PAR CET AGENT (COMPTE À REBOURS 45 MIN) */}
          {leadsParrainageReserves.map((lead) => {
            const nomParrain = lead.nom_parrain_verifie || lead.nom_salon_parrain || 'Salon Confrère';
            const accrocheTexte = lead.accroche_commerciale || `Bonjour, j'ai été mandaté par votre confrère ${nomParrain} pour vous activer vos 3 mois offerts sur STACK et vous déposer votre terminal TPE.`;
            const estCopie = pitchCopieId === lead.id_prospect;

            return (
              <div
                key={`reserve-${lead.id_prospect}`}
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#fef3c7' }}>
                      {lead.nom_salon}
                    </span>
                    <span style={{ fontSize: '12px', color: '#d97706' }}>
                      ({lead.code_postal || lead.departement || ''} {lead.ville || ''})
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.16)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      fontWeight: '700'
                    }}>
                      Parrainé par {nomParrain}
                    </span>
                  </div>

                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    border: '1px solid #f59e0b',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: '#fbbf24'
                  }}>
                    Compte à rebours : {lead.minutes_restantes || 45} min restantes pour caler le passage
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12.5px', color: '#e2e8f0', marginBottom: '10px', lineHeight: 1.4 }}>
                  <div>
                    Contact : <strong>{lead.prenom_contact || lead.nom_contact ? `${lead.prenom_contact || ''} ${lead.nom_contact || ''}`.trim() : 'Gérant du salon'}</strong>
                    {lead.telephone_salon && (
                      <span> — Tél : <a href={`tel:${lead.telephone_salon}`} style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: '700' }}>{lead.telephone_salon}</a></span>
                    )}
                    {lead.email_gerant && (
                      <span style={{ opacity: 0.85 }}> — Email : {lead.email_gerant}</span>
                    )}
                  </div>

                  {lead.telephone_salon && (
                    <a
                      href={`tel:${lead.telephone_salon}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        textDecoration: 'none',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '11.5px'
                      }}
                    >
                      Appeler le gérant
                    </a>
                  )}
                </div>

                {/* Accroche Commerciale en or avec bouton de copie */}
                <div style={{
                  fontSize: '11.5px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  marginBottom: '12px',
                  borderLeft: '3px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontStyle: 'italic', flex: 1, minWidth: '220px' }}>
                    Accroche en or : "{accrocheTexte}"
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator?.clipboard) {
                        navigator.clipboard.writeText(accrocheTexte);
                        setPitchCopieId(lead.id_prospect);
                        setTimeout(() => setPitchCopieId(null), 2500);
                      }
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {estCopie ? 'Accroche copiée !' : 'Copier l\'accroche'}
                  </button>
                </div>

                {/* Formulaire de calage du rendez-vous */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                      Date et heure du rendez-vous d'installation *
                    </label>
                    <input
                      type="datetime-local"
                      value={formRdv[lead.id_prospect]?.date || ''}
                      onChange={(e) => setFormRdv(prev => ({
                        ...prev,
                        [lead.id_prospect]: { ...prev[lead.id_prospect], date: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                  </div>

                  <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                      Notes / Précisions
                    </label>
                    <input
                      type="text"
                      placeholder="ex. Passage en matinée, gérant sur place"
                      value={formRdv[lead.id_prospect]?.notes || ''}
                      onChange={(e) => setFormRdv(prev => ({
                        ...prev,
                        [lead.id_prospect]: { ...prev[lead.id_prospect], notes: e.target.value }
                      }))}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const data = formRdv[lead.id_prospect];
                      if (!data?.date) {
                        alert("Veuillez sélectionner la date et l'heure convenues pour le rendez-vous d'installation.");
                        return;
                      }
                      handleConfirmerRdvLeadAmbassadeur(lead.id_prospect, data.date, data.notes || '');
                    }}
                    style={{
                      alignSelf: 'flex-end',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Confirmer le RDV & Verrouiller la commission
                  </button>
                </div>
              </div>
            );
          })}

          {/* LEADS PARRAINÉS AVEC RDV CONFIRMÉ — PRÊTS POUR L'ONBOARDING */}
          {leadsParrainageConfirmes.map((lead) => {
            const nomParrain = lead.nom_parrain_verifie || lead.nom_salon_parrain || 'Salon Confrère';
            let dateRdvFormatee = 'À planifier';
            if (lead.date_rdv_installation) {
              try {
                dateRdvFormatee = new Date(lead.date_rdv_installation).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
              } catch (e) {
                dateRdvFormatee = String(lead.date_rdv_installation);
              }
            }

            return (
              <div
                key={`confirme-${lead.id_prospect}`}
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#ecfdf5' }}>
                      {lead.nom_salon}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6ee7b7' }}>
                      ({lead.code_postal || lead.departement || ''} {lead.ville || ''})
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      fontWeight: '700'
                    }}>
                      Parrainé par {nomParrain}
                    </span>
                    <span style={{
                      fontSize: '10.5px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      fontWeight: '700'
                    }}>
                      RDV : {dateRdvFormatee}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOnboarding(lead.id_prospect)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Icon.ArrowUpRight />
                    <span>Lancer l'onboarding du salon parrainé</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                  <div>
                    Contact : <strong>{lead.prenom_contact || lead.nom_contact ? `${lead.prenom_contact || ''} ${lead.nom_contact || ''}`.trim() : 'Gérant du salon'}</strong>
                    {lead.telephone_salon && (
                      <span> — Tél : <a href={`tel:${lead.telephone_salon}`} style={{ color: '#6ee7b7', textDecoration: 'none', fontWeight: '700' }}>{lead.telephone_salon}</a></span>
                    )}
                    {lead.email_gerant && (
                      <span style={{ opacity: 0.85 }}> — Email : {lead.email_gerant}</span>
                    )}
                  </div>
                  {lead.adresse_rue && (
                    <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                      Adresse : {lead.adresse_rue}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* LEADS DISPONIBLES SUR LE SECTEUR À RÉSERVER */}
          {leadsParrainageDisponibles.map((lead) => {
            const nomParrain = lead.nom_parrain_verifie || lead.nom_salon_parrain || 'Salon Confrère';

            return (
              <div
                key={`dispo-${lead.id_prospect}`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
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
                    Contact : {lead.prenom_contact || lead.nom_contact ? `${lead.prenom_contact || ''} ${lead.nom_contact || ''}`.trim() : 'Gérant du salon'} — Tél : {lead.telephone_salon}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleReserverLeadAmbassadeur(lead.id_prospect)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Réserver ce lead (45 min pour caler le RDV)
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LES 4 KPIS HIÉRARCHISÉS (CARTE MAÎTRESSE ÉMERAUDE + 3 CARTES ÉPURÉES) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1.3fr 1fr 1fr 1fr',
          gap: isMobile ? '8px' : '14px',
          marginBottom: isMobile ? '12px' : '18px'
        }}
      >
        {/* KPI 1 (Pièce maîtresse) : Sous protection active 45 jours */}
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
              Sous protection active
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.22)', color: '#34d399' }}>
              Exclusivité 45j
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
            <div style={{ fontSize: isMobile ? '26px' : '29px', fontWeight: '800', color: '#ffffff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {nbProteges}
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)', fontWeight: '600' }}>
              salon{nbProteges > 1 ? 's' : ''} verrouillé{nbProteges > 1 ? 's' : ''}
            </span>
          </div>

          <div>
            <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.max(8, pctProtectionPortefeuille)}%`, background: '#10b981', borderRadius: '999px' }} />
            </div>
          </div>
        </div>

        {/* KPI 2 : Portefeuille total */}
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
              Leads déclarés
            </span>
            <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
              Portefeuille
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbTotal}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              Salons enregistrés par SIRET
            </div>
          </div>
        </div>

        {/* KPI 3 : À relancer rapidement (≤ 14 jours) */}
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
              À relancer
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(245, 158, 11, 0.14)', color: '#b45309' }}>
              ≤ 14 jours
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: nbUrgents > 0 ? '#d97706' : 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbUrgents}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              {nbUrgents > 0 ? 'Fin de protection proche' : 'Aucune échéance critique'}
            </div>
          </div>
        </div>

        {/* KPI 4 : Salons signés */}
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
              Salons signés
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              {tauxConversion}% conv.
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: nbSignes > 0 ? '#059669' : 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbSignes}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              Convertis en clients actifs
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRILLE BENTO 2 COLONNES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.48fr 1fr',
          gap: isMobile ? '12px' : '18px',
          alignItems: 'start'
        }}
      >
        {/* COLONNE GAUCHE : PIPELINE DES SALONS PROSPECTÉS */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '14px 12px' : '20px 22px',
            minWidth: 0
          }}
        >
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
            {/* Onglets de filtre doux en Émeraude (Fini le bloc noir) */}
            <div
              className="sp-glass-pill"
              style={{
                display: isMobile ? 'grid' : 'inline-flex',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : undefined,
                padding: '3px',
                borderRadius: '999px',
                gap: '2px'
              }}
            >
              {[
                { id: 'TOUS', label: `Tous (${nbTotal})` },
                { id: 'PROTEGES', label: `Protégés (${nbProteges})` },
                { id: 'SIGNES', label: `Signés (${nbSignes})` },
                { id: 'EXPIRES', label: `Expirés (${nbExpires})` }
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
                      padding: isMobile ? '6px 4px' : '5px 12px',
                      borderRadius: '999px',
                      fontSize: isMobile ? '10.5px' : '11.5px',
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

            {/* Barre de recherche bien délimitée */}
            <div
              className="sp-glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 13px',
                borderRadius: '999px',
                width: isMobile ? '100%' : '235px',
                boxSizing: 'border-box'
              }}
            >
              <Icon.Search />
              <input
                type="text"
                placeholder="Salon, ville, SIRET..."
                value={rechercheLead}
                onChange={(e) => setRechercheLead(e.target.value)}
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
              {rechercheLead && (
                <button
                  type="button"
                  onClick={() => setRechercheLead('')}
                  style={{ background: 'none', border: 'none', color: 'var(--sp-text-muted, #64748b)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>

          {prospectsFiltres.length === 0 ? (
            <div
              className="sp-glass-pill"
              style={{
                padding: isMobile ? '22px 14px' : '36px 18px',
                borderRadius: '16px',
                textAlign: 'center',
                color: 'var(--sp-text-muted, #64748b)',
                fontSize: '12.5px'
              }}
            >
              <strong style={{ display: 'block', fontSize: '14px', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
                Aucun prospect dans cette vue
              </strong>
              <span style={{ display: 'block', marginBottom: '14px' }}>
                Déclarez un salon pour bloquer son numéro SIRET à votre nom pendant 45 jours.
              </span>
              <button
                type="button"
                onClick={() => setShowProspectForm(true)}
                className="sp-onboarding-btn"
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                + Réserver un Lead
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {prospectsFiltres.map((p) => {
                const estSigne = p.statut_prospect === 'SIGNE';
                const estProtege = Boolean(p.est_protege);
                const joursRestants = Math.max(0, parseInt(p.jours_restants, 10) || 0);
                const pctRestant = estSigne ? 100 : estProtege ? Math.min(100, Math.round((joursRestants / 45) * 100)) : 0;
                const estUrgent = !estSigne && estProtege && joursRestants <= 7;
                const estAlerte = !estSigne && estProtege && joursRestants <= 14;

                const nomPropre = capitalizeWords(p.nom_salon || 'Salon');
                const villePropre = capitalizeWords(p.ville || '');
                const initiales = getInitialesSalon(nomPropre);

                const barColor = estSigne
                  ? '#10b981'
                  : estUrgent
                    ? '#ef4444'
                    : estAlerte
                      ? '#f59e0b'
                      : '#059669';

                return (
                  <div
                    key={p.id_prospect}
                    className="sp-lead-row"
                    style={{
                      padding: isMobile ? '12px' : '13px 16px',
                      opacity: !estProtege && !estSigne ? 0.65 : 1
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        justifyContent: 'space-between',
                        gap: isMobile ? '10px' : '14px'
                      }}
                    >
                      {/* Partie Gauche : Identité + Métadonnées + Contacts alignés proprement */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: isMobile ? '38px' : '40px',
                            height: isMobile ? '38px' : '40px',
                            borderRadius: '11px',
                            background: estSigne || estProtege
                              ? 'rgba(16, 185, 129, 0.13)'
                              : 'rgba(148, 163, 184, 0.15)',
                            border: estSigne || estProtege
                              ? '1px solid rgba(16, 185, 129, 0.28)'
                              : '1px solid rgba(148, 163, 184, 0.25)',
                            color: estSigne || estProtege ? '#059669' : 'var(--sp-text-muted, #64748b)',
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                              {nomPropre}
                            </strong>

                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: '800',
                                flexShrink: 0,
                                backgroundColor: estSigne
                                  ? 'rgba(16, 185, 129, 0.16)'
                                  : estProtege
                                    ? 'rgba(16, 185, 129, 0.12)'
                                    : 'rgba(239, 68, 68, 0.12)',
                                color: estSigne || estProtege ? '#059669' : '#dc2626'
                              }}
                            >
                              {estSigne ? 'Signé' : estProtege ? 'Protégé' : 'Expiré'}
                            </span>

                            {estLeadParraine(p) && (
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  flexShrink: 0,
                                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                                  color: '#059669',
                                  border: '1px solid rgba(52, 211, 153, 0.35)'
                                }}
                              >
                                Parrainé par {p.nom_parrain_verifie || p.nom_salon_parrain || 'Confrère'} • Offre 3 mois (50 € + 20%)
                              </span>
                            )}

                            {villePropre && (
                              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
                                • {villePropre}
                              </span>
                            )}
                            {p.siret_prospect && (
                              <span
                                style={{
                                  fontWeight: '600',
                                  fontSize: '10.5px',
                                  background: 'rgba(148, 163, 184, 0.14)',
                                  color: 'var(--sp-text-muted, #64748b)',
                                  padding: '1px 7px',
                                  borderRadius: '6px'
                                }}
                              >
                                SIRET {p.siret_prospect}
                              </span>
                            )}
                          </div>

                          {/* Ligne compacte Contacts + Date */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexWrap: 'wrap',
                              marginTop: '5px',
                              fontSize: '11.5px',
                              color: 'var(--sp-text-muted, #64748b)'
                            }}
                          >
                            {p.email_gerant && (
                              <a
                                href={`mailto:${p.email_gerant}`}
                                style={{
                                  color: 'var(--sp-text-muted, #64748b)',
                                  textDecoration: 'none',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>{p.email_gerant.toLowerCase()}</span>
                              </a>
                            )}
                            {p.telephone_salon && (
                              <a
                                href={`tel:${p.telephone_salon}`}
                                style={{
                                  color: '#059669',
                                  background: 'rgba(16, 185, 129, 0.11)',
                                  padding: '1px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  textDecoration: 'none',
                                  fontWeight: '700'
                                }}
                              >
                                {p.telephone_salon}
                              </a>
                            )}
                            <span style={{ fontSize: '11px', opacity: 0.8 }}>
                              • Déclaré le {formatDate(p.date_declaration)}
                            </span>
                          </div>

                          {estLeadParraine(p) && p.accroche_commerciale && (
                            <div
                              style={{
                                marginTop: '6px',
                                fontSize: '11px',
                                fontStyle: 'italic',
                                color: '#059669',
                                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                borderLeft: '3px solid #10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px'
                              }}
                            >
                              <span>Accroche : "{p.accroche_commerciale}"</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator?.clipboard) {
                                    navigator.clipboard.writeText(p.accroche_commerciale);
                                    setPitchCopieId(p.id_prospect);
                                    setTimeout(() => setPitchCopieId(null), 2500);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#059669',
                                  fontWeight: '700',
                                  fontSize: '10.5px',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {pitchCopieId === p.id_prospect ? 'Copié !' : 'Copier'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Partie Droite : Jauge Émeraude/Ambre + Bouton Onboarding Soft */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          paddingTop: isMobile ? '8px' : 0,
                          borderTop: isMobile ? '1px solid rgba(148, 163, 184, 0.16)' : 'none',
                          flexShrink: 0
                        }}
                      >
                        <div style={{ flex: isMobile ? 1 : 'initial', minWidth: '105px', textAlign: isMobile ? 'left' : 'right' }}>
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              color: estSigne ? '#059669' : estUrgent ? '#dc2626' : 'var(--sp-text-main, #18181b)',
                              marginBottom: '4px',
                              fontVariantNumeric: 'tabular-nums'
                            }}
                          >
                            {estSigne ? 'Converti OK' : estProtege ? `${joursRestants}j d'exclusivité` : 'Protection échue'}
                          </div>
                          <div style={{ height: '4px', width: isMobile ? '100%' : '105px', maxWidth: '140px', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${pctRestant}%`,
                                background: barColor,
                                borderRadius: '999px'
                              }}
                            />
                          </div>
                        </div>

                        {!estSigne && estProtege && (
                          <button
                            type="button"
                            onClick={() => handleOnboarding(p.id_prospect)}
                            className="sp-onboarding-btn"
                            style={{
                              padding: '7px 13px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '800',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
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

        {/* COLONNE DROITE : ÉCHÉANCES CRITIQUES (<= 14J SANS DOUBLON) & RÈGLES SIRET */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
          {(!isMobile || nbUrgents > 0) && (
            <div className="sp-glass-panel" style={{ padding: isMobile ? '16px 14px' : '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: nbUrgents > 0 ? '#d97706' : '#059669', display: 'flex' }}>
                    <Icon.Zap />
                  </span>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                    Relances prioritaires
                  </h3>
                </div>
                <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', color: nbUrgents > 0 ? '#b45309' : '#059669' }}>
                  {nbUrgents > 0 ? `${nbUrgents} urgente${nbUrgents > 1 ? 's' : ''}` : 'À jour'}
                </span>
              </div>

              {relancesPrioritaires.length === 0 ? (
                <div
                  className="sp-glass-pill"
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    fontSize: '12px',
                    color: 'var(--sp-text-muted, #64748b)',
                    lineHeight: 1.45
                  }}
                >
                  <strong style={{ display: 'block', color: '#059669', fontSize: '12.5px', marginBottom: '2px' }}>
                    Aucune protection proche d'expiration
                  </strong>
                  <span>
                    {nbProteges > 0
                      ? `Vos ${nbProteges} salons protégés disposent encore de plus de 14 jours d'exclusivité.`
                      : 'Vos alertes de fin de protection (≤ 14 jours) s’afficheront automatiquement ici.'}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {relancesPrioritaires.map((lead) => {
                    const jRest = Math.max(0, parseInt(lead.jours_restants, 10) || 0);
                    return (
                      <div
                        key={`prio-${lead.id_prospect}`}
                        className="sp-glass-pill"
                        style={{
                          padding: '10px 12px',
                          borderRadius: '13px',
                          borderLeft: '3px solid #f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--sp-text-main, #18181b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {capitalizeWords(lead.nom_salon)}
                          </strong>
                          <span style={{ fontSize: '11px', color: jRest <= 7 ? '#dc2626' : '#b45309', fontWeight: '700' }}>
                            {capitalizeWords(lead.ville || 'Salon')} • Plus que {jRest}j
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOnboarding(lead.id_prospect)}
                          className="sp-onboarding-btn"
                          style={{
                            padding: '6px 11px',
                            borderRadius: '999px',
                            fontSize: '11px',
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
          )}

          {/* Carte Protection SIRET (Pastilles Émeraude douces au lieu des ronds noirs) */}
          <div className="sp-glass-panel" style={{ padding: isMobile ? '13px 14px' : '18px 20px' }}>
            <div
              onClick={() => isMobile && setAfficherInfosSiret(!afficherInfosSiret)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: isMobile ? 'pointer' : 'default',
                marginBottom: !isMobile || afficherInfosSiret ? '12px' : 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#059669', display: 'flex' }}>
                  <Icon.Shield />
                </span>
                <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                  Protection SIRET (45 jours) • 20 % HT
                </h3>
              </div>
              {isMobile && (
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)' }}>
                  {afficherInfosSiret ? 'Masquer ▲' : 'Règles ▼'}
                </span>
              )}
            </div>

            {(!isMobile || afficherInfosSiret) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    num: '1',
                    titre: 'Verrouillage immédiat',
                    desc: 'Le SIRET du salon est bloqué à votre nom pendant 45 jours. Aucun autre agent ne peut le démarcher.'
                  },
                  {
                    num: '2',
                    titre: 'Onboarding en 1 clic',
                    desc: "Dès l'accord du gérant, cliquez sur « Onboarding » pour générer automatiquement son espace salon."
                  },
                  {
                    num: '3',
                    titre: 'Commission 20 % HT (24 mois)',
                    desc: 'Le salon est rattaché définitivement à votre portefeuille dès son premier abonnement payant.'
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

      {/* 4. MODALE : RÉSERVER UN LEAD (HARMONISÉE JOUR & NUIT) */}
      {showProspectForm && (
        <div className="sp-modal-backdrop" onClick={() => setShowProspectForm(false)}>
          <div
            className="sp-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: isMobile ? '18px 15px 22px 15px' : '26px 28px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '14px' : '18px', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                <div
                  style={{
                    width: isMobile ? '40px' : '44px',
                    height: isMobile ? '40px' : '44px',
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
                  <Icon.Lock />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '21px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', letterSpacing: '-0.02em' }}>
                    Réserver un Lead Salon
                  </h2>
                  <span style={{ fontSize: isMobile ? '11.5px' : '12px', color: 'var(--sp-text-muted, #64748b)', display: 'block' }}>
                    Exclusivité commerciale garantie 45 jours
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProspectForm(false)}
                className="sp-glass-pill"
                style={{
                  width: '32px',
                  height: '32px',
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {prospectError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.28)',
                  color: '#dc2626',
                  padding: '10px 13px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  marginBottom: '12px'
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
                gap: isMobile ? '12px' : '20px',
                alignItems: 'stretch'
              }}
            >
              <div className="sp-glass-panel" style={{ padding: isMobile ? '14px' : '20px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '13px' }}>
                {!isMobile && (
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                    Identification de l'établissement
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
                    Nom du Salon <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex : Maison Coiffure & Spa"
                    required
                    value={prospectData.nom_salon || ''}
                    onChange={(e) => setProspectData({ ...prospectData, nom_salon: e.target.value })}
                    className="sp-field-input"
                    autoFocus={!isMobile}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '105px 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
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
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '4px' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                {isMobile ? (
                  <div
                    className="sp-glass-pill"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11.5px',
                      fontWeight: '700'
                    }}
                  >
                    <span style={{ color: 'var(--sp-text-muted, #64748b)' }}>
                      Fin protection : <strong style={{ color: '#059669' }}>{dateExpirationApercu}</strong>
                    </span>
                    <span style={{ color: '#059669', fontWeight: '800' }}>20 % HT / 24 mois</span>
                  </div>
                ) : (
                  <div className="sp-glass-panel" style={{ padding: '20px', borderRadius: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Certificat d'exclusivité
                        </span>
                        <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
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
                              background: 'rgba(16, 185, 129, 0.14)',
                              border: '1px solid rgba(16, 185, 129, 0.32)',
                              color: '#059669',
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
                            <strong style={{ display: 'block', fontSize: '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {capitalizeWords(prospectData.nom_salon || 'Nom du salon')}
                            </strong>
                            <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
                              {capitalizeWords(prospectData.ville || 'Ville')} {prospectData.code_postal ? `(${prospectData.code_postal})` : ''}
                            </span>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--sp-text-muted, #64748b)' }}>SIRET protégé</span>
                            <strong style={{ color: 'var(--sp-text-main, #18181b)', fontFamily: 'monospace' }}>
                              {prospectData.siret_prospect || '—'}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--sp-text-muted, #64748b)' }}>Fin de protection</span>
                            <strong style={{ color: '#059669' }}>{dateExpirationApercu}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--sp-text-muted, #64748b)' }}>Commission affiliée</span>
                            <strong style={{ color: '#059669' }}>20 % HT / 24 mois</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.45 }}>
                      Dès validation, ce SIRET est réservé sur votre compte partenaire et prêt pour l'onboarding.
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowProspectForm(false)}
                    className="sp-glass-pill"
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--sp-text-main, #18181b)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1.85,
                      padding: '12px 16px',
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
                      gap: '7px',
                      whiteSpace: 'nowrap'
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
