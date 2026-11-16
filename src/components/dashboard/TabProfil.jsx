// src/components/dashboard/TabProfil.jsx
// Onglet 6 : Paramètres & Dossier de Conformité KYC en Verre Cristal — Optimisé Desktop & iPhone

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '../common/Icons';
import AmbianceSelectorPartner from './AmbianceSelectorPartner';
import { AMBIANCES_PARTNER_JOUR, AMBIANCES_PARTNER_NUIT } from '../../constants/ambiances';

const isDateExpired = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr.slice(0, 10));
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

export default function TabProfil({
  agent = {},
  stats = {},
  profilData = {},
  setProfilData,
  submitEtapeConformite,
  onOuvrirSignatureContrat,
  onTelechargerContratPdf,
  handleYousignSignature,
  handleCheckYousign,
  isYousignLoading,
  handleFileUpload,
  renderFilePreviewBadge,
  quizAnswers = {},
  setQuizAnswers,
  handleQuizSubmit,
  isMobile,
  isDarkMode = false,
  themeJour = 'AURORA',
  themeNuit = 'CARBONE',
  onToggleTheme = () => {},
  onChoisirThemeJour = () => {},
  onChoisirThemeNuit = () => {}
}) {
  // Évaluation dynamique du statut de chacune des étapes
  const statutsEtapes = useMemo(() => {
    const e1Ok = Boolean(profilData.contrat_signe && profilData.statut_contrat === 'VALIDE');

    const idExp = isDateExpired(profilData.date_expiration_identite);
    const e2Ok = Boolean(
      profilData.siret_agent &&
      profilData.numero_rsac &&
      (profilData.fichier_identite || profilData.statut_identite === 'VALIDE') &&
      profilData.fichier_rsac &&
      !idExp
    );

    const urssafExp = isDateExpired(profilData.date_expiration_urssaf);
    const e3Ok = Boolean(
      profilData.code_verif_urssaf &&
      profilData.fichier_urssaf &&
      profilData.date_expiration_urssaf &&
      !urssafExp
    );

    const rcExp = isDateExpired(profilData.date_expiration_rc_pro);
    const e4Ok = Boolean(
      profilData.assureur_nom &&
      profilData.fichier_rc_pro &&
      profilData.iban &&
      profilData.charte_acceptee &&
      profilData.date_expiration_rc_pro &&
      !rcExp
    );

    const e5Ok = Boolean(
      profilData.telephone &&
      profilData.telephone_confirme &&
      (profilData.quiz_nf525_valide ||
        (quizAnswers.q1 === 'nf525' &&
          quizAnswers.q2 === 'interdit' &&
          quizAnswers.q3 === 'mandataire' &&
          quizAnswers.q4 === '99'))
    );

    return {
      1: { ok: e1Ok, expire: false, label: e1Ok ? 'Signé' : 'À signer' },
      2: { ok: e2Ok, expire: idExp, label: idExp ? 'ID expirée' : e2Ok ? 'Complet' : 'À compléter' },
      3: { ok: e3Ok, expire: urssafExp, label: urssafExp ? 'Expirée' : e3Ok ? 'Valide' : 'À compléter' },
      4: { ok: e4Ok, expire: rcExp, label: rcExp ? 'RC Pro expirée' : e4Ok ? 'Valide' : 'À compléter' },
      5: { ok: e5Ok, expire: false, label: e5Ok ? 'Certifié' : 'À valider' },
      6: { ok: true, expire: false, label: isDarkMode ? 'Nuit' : 'Jour' }
    };
  }, [profilData, quizAnswers, isDarkMode]);

  // Détermination automatique de la première étape nécessitant une action
  const premiereEtapePrioritaire = useMemo(() => {
    for (let i = 1; i <= 5; i++) {
      if (statutsEtapes[i].expire || !statutsEtapes[i].ok) return i;
    }
    return 1;
  }, [statutsEtapes]);

  const [etapeActive, setEtapeActive] = useState(premiereEtapePrioritaire);

  useEffect(() => {
    setEtapeActive(premiereEtapePrioritaire);
  }, [premiereEtapePrioritaire]);

  const nbEtapesValides = Object.values(statutsEtapes).filter((s) => s.ok && !s.expire).length - 1; // 5 étapes légales
  const pctConformite = Math.round((Math.max(0, nbEtapesValides) / 5) * 100);

  const ETAPES_CONFIG = [
    {
      num: 1,
      court: 'Contrat',
      titre: 'Contrat de mandat',
      sousTitre: 'Signature électronique Yousign',
      resume: profilData.contrat_signe ? 'Contrat signé électroniquement' : 'En attente de signature'
    },
    {
      num: 2,
      court: 'RSAC & ID',
      titre: 'Identité, SIRET & RSAC',
      sousTitre: 'Immatriculation légale & Greffe',
      resume: profilData.siret_agent
        ? `SIRET ${profilData.siret_agent} • RSAC ${profilData.numero_rsac || '—'}`
        : "Pièce d'identité et extrait RSAC"
    },
    {
      num: 3,
      court: 'URSSAF',
      titre: 'Vigilance URSSAF',
      sousTitre: 'Attestation de régularité sociale',
      resume: profilData.date_expiration_urssaf
        ? `Valide jusqu'au ${new Date(profilData.date_expiration_urssaf).toLocaleDateString('fr-FR')}`
        : 'Attestation de moins de 6 mois'
    },
    {
      num: 4,
      court: 'RC Pro & IBAN',
      titre: 'RC Pro, IBAN & Charte',
      sousTitre: 'Assurance pro & Coordonnées bancaires',
      resume: profilData.assureur_nom
        ? `${profilData.assureur_nom.toUpperCase()} • IBAN renseigné`
        : 'Police RC Pro et RIB de versement'
    },
    {
      num: 5,
      court: 'Quiz NF525',
      titre: 'Quiz NF525 & Contact',
      sousTitre: 'Certification fiscale & Mobile actif',
      resume: profilData.telephone ? `Mobile : ${profilData.telephone}` : '4 questions réglementaires'
    },
    {
      num: 6,
      court: 'Ambiance',
      titre: 'Ambiance & Thèmes',
      sousTitre: 'Fond d\'écran & Nuances Nuit',
      resume: isDarkMode
        ? `Mode Nuit • ${AMBIANCES_PARTNER_NUIT[themeNuit]?.nom || 'Carbone'}`
        : `Mode Jour • ${AMBIANCES_PARTNER_JOUR[themeJour]?.nom || 'Verre Aurora'}`,
      isAmbiance: true
    }
  ];

  const handleAutoSave = (etape, customPayload = null) => {
    if (typeof submitEtapeConformite === 'function') {
      submitEtapeConformite(etape, customPayload || profilData);
    }
  };

  // Composant d'upload de fichier stylisé en Verre Cristal avec auto-sauvegarde
  const renderCustomFileUploader = (fieldName, labelBtn, currentFile, badgeLabel) => {
    const isRgpdValide = fieldName === 'fichier_identite' && !currentFile && profilData.statut_identite === 'VALIDE';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
        <label
          className="sp-glass-pill"
          style={{
            height: '40px',
            padding: '0 13px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#0f172a',
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.92)',
            boxSizing: 'border-box',
            maxWidth: '100%'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isRgpdValide ? "Pièce d'identité validée (RGPD)" : currentFile ? 'Remplacer le fichier' : labelBtn}
          </span>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => handleFileUpload(e, fieldName)}
            style={{ display: 'none' }}
          />
        </label>
        {renderFilePreviewBadge && renderFilePreviewBadge(currentFile, badgeLabel)}
      </div>
    );
  };

  return (
    <div
      style={{
        paddingBottom: isMobile ? 'calc(125px + env(safe-area-inset-bottom, 0px))' : '28px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <style>{`
        .sp-step-nav-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.48) 100%);
          border: 1px solid rgba(255, 255, 255, 0.92);
          box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 18px;
          padding: 13px 15px;
          cursor: pointer;
          transition: all 0.16s ease;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .sp-step-nav-card:hover {
          background: rgba(255, 255, 255, 0.94);
          transform: translateY(-1px);
        }
        .sp-step-nav-card.active {
          background: #ffffff;
          border: 1.5px solid #0f172a;
          box-shadow: 0 10px 24px -6px rgba(15, 23, 42, 0.1);
        }
        .sp-kyc-input {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          height: 42px;
          padding: 0 12px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(148, 163, 184, 0.34);
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          overflow: hidden;
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }
        input[type="date"].sp-kyc-input {
          display: inline-flex !important;
          align-items: center;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          line-height: 40px;
          -webkit-appearance: none;
          appearance: none;
        }
        .sp-kyc-input:focus {
          border-color: #0f172a;
          background: #ffffff;
        }
        .sp-kyc-label {
          display: block;
          font-size: 11.5px;
          font-weight: 800;
          color: #334155;
          margin-bottom: 5px;
        }
        .sp-steps-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE ÉPURÉ + JAUGE DE PROGRESSION GLOBALE                     */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'flex-end',
          gap: '10px',
          marginBottom: isMobile ? '12px' : '18px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <span
            className="sp-glass-pill"
            style={{
              display: 'inline-block',
              padding: isMobile ? '3px 10px' : '4px 12px',
              borderRadius: '999px',
              fontSize: isMobile ? '9.5px' : '10.5px',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: isMobile ? '4px' : '6px'
            }}
          >
            {isMobile ? 'Conformité KYC' : 'Conformité Légale & KYC Partenaire'}
          </span>
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
            Paramètres & Dossier
          </h1>
          {!isMobile && (
            <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
              Sélectionnez une étape à gauche pour vérifier ou mettre à jour vos pièces justificatives.
            </span>
          )}
        </div>

        {/* Badges de statut global (Compactés sur une seule ligne sur iPhone) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div
            className="sp-glass-pill"
            style={{
              padding: isMobile ? '6px 11px' : '8px 14px',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: isMobile ? '11.5px' : '12px',
              fontWeight: '800',
              color: '#0f172a',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{isMobile ? `${nbEtapesValides}/5 (${pctConformite}%)` : `Dossier : ${nbEtapesValides}/5 validés (${pctConformite}%)`}</span>
          </div>

          <span
            style={{
              padding: isMobile ? '6px 11px' : '8px 15px',
              borderRadius: '999px',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: '800',
              backgroundColor: profilData.autorise_a_vendre
                ? 'rgba(16, 185, 129, 0.16)'
                : 'rgba(245, 158, 11, 0.16)',
              color: profilData.autorise_a_vendre ? '#059669' : '#b45309',
              border: profilData.autorise_a_vendre
                ? '1px solid rgba(16, 185, 129, 0.35)'
                : '1px solid rgba(245, 158, 11, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: profilData.autorise_a_vendre ? '#10b981' : '#f59e0b'
              }}
            />
            <span>
              {profilData.autorise_a_vendre
                ? isMobile
                  ? 'Vente Autorisée'
                  : 'Compte Actif — Vente Autorisée'
                : isMobile
                  ? 'En validation'
                  : 'Dossier en cours de validation'}
            </span>
          </span>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BARRE COMPACTE DES MOTIFS DE BLOCAGE (CLIQUABLE PAR ÉTAPE)       */}
      {/* =================================================================== */}
      {!profilData.autorise_a_vendre && profilData.motifs_blocage?.length > 0 && (
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '10px 12px' : '12px 18px',
            marginBottom: isMobile ? '12px' : '18px',
            borderRadius: '16px',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            boxSizing: 'border-box'
          }}
        >
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.16)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon.Lock />
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                Action requise pour débloquer votre droit de vente :
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1, justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
            {profilData.motifs_blocage.map((motif, i) => {
              const matchStep = String(motif).match(/[ÉE]tape\s*(\d)/i);
              const cibleStep = matchStep ? parseInt(matchStep[1], 10) : premiereEtapePrioritaire;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEtapeActive(cibleStep)}
                  className="sp-glass-pill"
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: isMobile ? '7px 12px' : '6px 13px',
                    borderRadius: '999px',
                    fontSize: isMobile ? '11.5px' : '12px',
                    fontWeight: '700',
                    color: '#b45309',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '7px',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{motif}</span>
                  </span>
                  <span style={{ fontWeight: '800', flexShrink: 0 }}>Corriger →</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2.bis SÉLECTEUR DE VUE : DOSSIER LÉGAL KYC VS AMBIANCE & THÈMES     */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'inline-flex',
          padding: '4px',
          background: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          borderRadius: '999px',
          gap: '6px',
          marginBottom: isMobile ? '12px' : '18px',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(148, 163, 184, 0.22)',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => setEtapeActive((prev) => (prev === 6 ? premiereEtapePrioritaire : prev))}
          style={{
            padding: isMobile ? '6px 14px' : '7px 18px',
            borderRadius: '999px',
            border: 'none',
            background: etapeActive !== 6 ? (isDarkMode ? '#ffffff' : '#0f172a') : 'transparent',
            color: etapeActive !== 6 ? (isDarkMode ? '#0f172a' : '#ffffff') : (isDarkMode ? '#94a3b8' : '#64748b'),
            fontSize: isMobile ? '11.5px' : '12.5px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.16s ease'
          }}
        >
          Dossier de Conformité KYC ({nbEtapesValides}/5)
        </button>

        <button
          type="button"
          onClick={() => setEtapeActive(6)}
          style={{
            padding: isMobile ? '6px 14px' : '7px 18px',
            borderRadius: '999px',
            border: 'none',
            background: etapeActive === 6 ? (isDarkMode ? '#ffffff' : '#0f172a') : 'transparent',
            color: etapeActive === 6 ? (isDarkMode ? '#0f172a' : '#ffffff') : (isDarkMode ? '#94a3b8' : '#64748b'),
            fontSize: isMobile ? '11.5px' : '12.5px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.16s ease'
          }}
        >
          Ambiance & Thèmes d'application
        </button>
      </div>

      {/* =================================================================== */}
      {/* 3. ARCHITECTURE RESPONSIVE : RUBAN D'ONGLETS SUR IPHONE / 2 COL PC  */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : '340px minmax(0, 1fr)',
          gap: isMobile ? '12px' : '20px',
          alignItems: 'start',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* NAVIGATION DES 5 ÉTAPES : RUBAN HORIZONTAL COMPACT SUR IPHONE, CARTES SUR DESKTOP */}
        {isMobile ? (
          <div
            className="sp-glass-panel sp-steps-scroll"
            style={{
              padding: '6px',
              borderRadius: '18px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              boxSizing: 'border-box'
            }}
          >
            {ETAPES_CONFIG.map((item) => {
              const st = statutsEtapes[item.num];
              const isSelected = etapeActive === item.num;

              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => setEtapeActive(item.num)}
                  style={{
                    flex: '1 0 auto',
                    padding: '8px 12px',
                    borderRadius: '13px',
                    border: isSelected
                      ? '1.5px solid #0f172a'
                      : st.expire
                        ? '1px solid rgba(239, 68, 68, 0.35)'
                        : '1px solid rgba(255, 255, 255, 0.9)',
                    background: isSelected
                      ? '#111827'
                      : st.expire
                        ? 'rgba(254, 242, 242, 0.9)'
                        : 'rgba(255, 255, 255, 0.78)',
                    color: isSelected ? '#ffffff' : '#0f172a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 6px 14px -4px rgba(15, 23, 42, 0.25)' : 'none'
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      fontSize: '10px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected
                        ? 'rgba(255, 255, 255, 0.2)'
                        : st.expire
                          ? 'rgba(239, 68, 68, 0.16)'
                          : st.ok
                            ? 'rgba(16, 185, 129, 0.16)'
                            : 'rgba(148, 163, 184, 0.2)',
                      color: isSelected
                        ? '#ffffff'
                        : st.expire
                          ? '#dc2626'
                          : st.ok
                            ? '#059669'
                            : '#475569'
                    }}
                  >
                    {st.ok && !st.expire ? '✓' : st.expire ? '!' : item.num}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '800' }}>{item.court}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div
            className="sp-glass-panel"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 6px 8px 6px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Parcours de validation (5 étapes)
              </span>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#0f172a' }}>
                {nbEtapesValides}/5
              </span>
            </div>

            {ETAPES_CONFIG.map((item) => {
              const st = statutsEtapes[item.num];
              const isSelected = etapeActive === item.num;

              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => setEtapeActive(item.num)}
                  className={`sp-step-nav-card ${isSelected ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isSelected
                          ? '#111827'
                          : st.expire
                            ? 'rgba(239, 68, 68, 0.14)'
                            : st.ok
                              ? 'rgba(16, 185, 129, 0.14)'
                              : 'rgba(148, 163, 184, 0.18)',
                        color: isSelected
                          ? '#ffffff'
                          : st.expire
                            ? '#dc2626'
                            : st.ok
                              ? '#059669'
                              : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        flexShrink: 0
                      }}
                    >
                      {st.ok && !st.expire && !isSelected ? 'OK' : item.num}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: '800',
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.titre}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.resume}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: '800',
                      flexShrink: 0,
                      backgroundColor: st.expire
                        ? 'rgba(239, 68, 68, 0.14)'
                        : st.ok
                          ? 'rgba(16, 185, 129, 0.14)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color: st.expire ? '#dc2626' : st.ok ? '#059669' : '#b45309'
                    }}
                  >
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* COLONNE DROITE : CONTENU DE L'ÉTAPE ACTIVE UNIQUEMENT */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px 14px' : '28px',
            borderRadius: isMobile ? '20px' : '24px',
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* =============================================================== */}
          {/* ÉTAPE 1 : CONTRAT DE MANDAT D'AGENT COMMERCIAL                  */}
          {/* =============================================================== */}
          {etapeActive === 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Étape 1 sur 5
                  </span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: '#0f172a' }}>
                    Contrat de mandat commercial
                  </h2>
                </div>
                <span
                  style={{
                    padding: '4px 11px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: profilData.statut_contrat === 'VALIDE' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                    color: profilData.statut_contrat === 'VALIDE' ? '#059669' : '#b45309',
                    flexShrink: 0
                  }}
                >
                  {profilData.statut_contrat || 'EN ATTENTE'}
                </span>
              </div>

              <div className="sp-glass-pill" style={{ padding: isMobile ? '14px' : '20px', borderRadius: '16px', marginBottom: '16px', boxSizing: 'border-box' }}>
                <p style={{ fontSize: isMobile ? '12.5px' : '13.5px', color: '#334155', lineHeight: 1.55, margin: '0 0 14px 0' }}>
                  Ce contrat de mandat commercial indépendant est conclu sous condition suspensive d'immatriculation RSAC. Il fixe votre commission récurrente de <strong>20 % HT pendant 24 mois</strong> sur chaque abonnement de salon affilié, ainsi que votre forfait de mise en service terrain de <strong>99 € HT</strong>.
                </p>

                {profilData.contrat_signe && profilData.statut_contrat === 'VALIDE' ? (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '14px', padding: isMobile ? '12px' : '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon.Check /> Contrat signé et scellé.
                      </div>
                      <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '999px' }}>
                        eIDAS • Art. 1366 C. Civ.
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#166534', lineHeight: 1.5, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '4px' }}>
                      <div><strong>Réf :</strong> {profilData.certificat_contrat_ref || 'STACK-MANDAT-VALIDE'}</div>
                      <div><strong>Date :</strong> {profilData.date_signature_contrat ? new Date(profilData.date_signature_contrat).toLocaleDateString('fr-FR') : 'Certifiée'}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', paddingTop: '8px', borderTop: '1px solid #bbf7d0' }}>
                      <button
                        type="button"
                        onClick={onTelechargerContratPdf}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '999px',
                          border: 'none',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Icon.FileDownload /> Télécharger mon contrat (PDF)
                      </button>
                      <button
                        type="button"
                        onClick={onOuvrirSignatureContrat || handleYousignSignature}
                        className="sp-glass-pill"
                        style={{ padding: '10px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: '#166534', cursor: 'pointer', backgroundColor: '#ffffff', textAlign: 'center' }}
                      >
                        Revoir les 10 articles
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Signature manuscrite et scellement d'intégrité intégrés.
                    </div>
                    <button
                      type="button"
                      onClick={onOuvrirSignatureContrat || handleYousignSignature}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.25)'
                      }}
                    >
                      <Icon.Check /> Signer mon contrat de mandat
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEtapeActive(2)}
                  className="sp-glass-pill"
                  style={{ width: isMobile ? '100%' : 'auto', padding: '11px 18px', borderRadius: '999px', fontSize: '12.5px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', textAlign: 'center' }}
                >
                  Passer à l'Étape 2 (Identité & RSAC) →
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 2 : IDENTITÉ, SIRET & IMMATRICULATION RSAC                */}
          {/* =============================================================== */}
          {etapeActive === 2 && (
            <div style={{ opacity: profilData.contrat_signe ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Étape 2 sur 5
                  </span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: '#0f172a' }}>
                    Identité, SIRET & RSAC
                  </h2>
                </div>
                <span
                  style={{
                    padding: '4px 11px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: statutsEtapes[2].ok ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                    color: statutsEtapes[2].ok ? '#059669' : '#b45309',
                    flexShrink: 0
                  }}
                >
                  {statutsEtapes[2].label}
                </span>
              </div>

              {/* Sous-bloc A : Pièce d'identité (Grille 2 colonnes sur mobile pour les 2 dates sans débordement) */}
              <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '16px', marginBottom: '12px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  A. Pièce d'identité du mandataire
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr)', gap: '10px', alignItems: 'end' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Date de naissance</label>
                    <input
                      type="date"
                      value={profilData.date_naissance ? profilData.date_naissance.slice(0, 10) : ''}
                      onChange={(e) => setProfilData({ ...profilData, date_naissance: e.target.value })}
                      onBlur={() => handleAutoSave(2)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Expiration CNI</label>
                    <input
                      type="date"
                      value={profilData.date_expiration_identite ? profilData.date_expiration_identite.slice(0, 10) : ''}
                      onChange={(e) => setProfilData({ ...profilData, date_expiration_identite: e.target.value })}
                      onBlur={() => handleAutoSave(2)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0, gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                    <label className="sp-kyc-label">Justificatif d'identité</label>
                    {renderCustomFileUploader('fichier_identite', 'Importer CNI / Passeport', profilData.fichier_identite, 'Identité')}
                  </div>
                </div>
              </div>

              {/* Sous-bloc B : Entreprise & Adresse */}
              <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '16px', marginBottom: '12px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  B. Structure juridique & Siège social
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Numéro SIRET (14 chiffres)</label>
                    <input
                      type="text"
                      placeholder="Ex : 12345678901234"
                      value={profilData.siret_agent || ''}
                      onChange={(e) => setProfilData({ ...profilData, siret_agent: e.target.value })}
                      onBlur={() => handleAutoSave(2)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1.1fr) minmax(0, 0.9fr)' : 'contents', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <label className="sp-kyc-label">Forme juridique</label>
                      <select
                        value={profilData.forme_juridique || 'EI'}
                        onChange={(e) => {
                          const updated = { ...profilData, forme_juridique: e.target.value };
                          setProfilData(updated);
                          handleAutoSave(2, updated);
                        }}
                        className="sp-kyc-input"
                      >
                        <option value="EI">EI / Micro</option>
                        <option value="SOCIETE">Société (SASU, EURL...)</option>
                      </select>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label className="sp-kyc-label">Début d'activité</label>
                      <input
                        type="date"
                        value={profilData.date_debut_activite ? profilData.date_debut_activite.slice(0, 10) : ''}
                        onChange={(e) => setProfilData({ ...profilData, date_debut_activite: e.target.value })}
                        onBlur={() => handleAutoSave(2)}
                        className="sp-kyc-input"
                      />
                    </div>
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <label className="sp-kyc-label">Adresse professionnelle complète</label>
                  <input
                    type="text"
                    placeholder="Numéro, rue, code postal et ville"
                    value={profilData.adresse_pro || ''}
                    onChange={(e) => setProfilData({ ...profilData, adresse_pro: e.target.value })}
                    onBlur={() => handleAutoSave(2)}
                    className="sp-kyc-input"
                  />
                </div>
              </div>

              {/* Sous-bloc C : RSAC */}
              <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '16px', marginBottom: '16px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  C. Immatriculation au RSAC
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.3fr)', gap: '10px', alignItems: 'end' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Numéro RSAC</label>
                    <input
                      type="text"
                      placeholder="Ex : 902 145 789"
                      value={profilData.numero_rsac || ''}
                      onChange={(e) => setProfilData({ ...profilData, numero_rsac: e.target.value })}
                      onBlur={() => handleAutoSave(2)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Greffe / Tribunal</label>
                    <input
                      type="text"
                      placeholder="Ex : Strasbourg"
                      value={profilData.greffe_rsac || ''}
                      onChange={(e) => setProfilData({ ...profilData, greffe_rsac: e.target.value })}
                      onBlur={() => handleAutoSave(2)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0, gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                    <label className="sp-kyc-label">Date extrait RSAC</label>
                    <input
                      type="date"
                      value={profilData.date_emission_rsac ? profilData.date_emission_rsac.slice(0, 10) : ''}
                      onChange={(e) => setProfilData({ ...profilData, date_emission_rsac: e.target.value })}
                      onBlur={() => handleAutoSave(2)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0, gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                    <label className="sp-kyc-label">Extrait RSAC (PDF)</label>
                    {renderCustomFileUploader('fichier_rsac', 'Importer RSAC', profilData.fichier_rsac, 'RSAC')}
                  </div>
                </div>
              </div>

              {/* Barre d'actions avec enregistrement automatique */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  <span>Enregistrement automatique actif</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAutoSave(2);
                    setEtapeActive(3);
                  }}
                  style={{
                    flex: isMobile ? 1 : 'initial',
                    padding: '12px 22px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.22)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Étape 3 (URSSAF) →</span>
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 3 : ATTESTATION DE VIGILANCE URSSAF                       */}
          {/* =============================================================== */}
          {etapeActive === 3 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Étape 3 sur 5
                  </span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: '#0f172a' }}>
                    Attestation de vigilance URSSAF
                  </h2>
                </div>
                <span
                  style={{
                    padding: '4px 11px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: statutsEtapes[3].expire
                      ? 'rgba(239, 68, 68, 0.14)'
                      : statutsEtapes[3].ok
                        ? 'rgba(16, 185, 129, 0.14)'
                        : 'rgba(245, 158, 11, 0.16)',
                    color: statutsEtapes[3].expire ? '#dc2626' : statutsEtapes[3].ok ? '#059669' : '#b45309',
                    flexShrink: 0
                  }}
                >
                  {statutsEtapes[3].label}
                </span>
              </div>

              <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '16px', marginBottom: '16px', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Code de sécurité URSSAF</label>
                    <input
                      type="text"
                      placeholder="Code de vérification..."
                      value={profilData.code_verif_urssaf || ''}
                      onChange={(e) => setProfilData({ ...profilData, code_verif_urssaf: e.target.value })}
                      onBlur={() => handleAutoSave(3)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'contents', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <label className="sp-kyc-label">Date de délivrance</label>
                      <input
                        type="date"
                        value={profilData.date_emission_urssaf ? profilData.date_emission_urssaf.slice(0, 10) : ''}
                        onChange={(e) => setProfilData({ ...profilData, date_emission_urssaf: e.target.value })}
                        onBlur={() => handleAutoSave(3)}
                        className="sp-kyc-input"
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label className="sp-kyc-label">Date d'expiration</label>
                      <input
                        type="date"
                        value={profilData.date_expiration_urssaf ? profilData.date_expiration_urssaf.slice(0, 10) : ''}
                        onChange={(e) => setProfilData({ ...profilData, date_expiration_urssaf: e.target.value })}
                        onBlur={() => handleAutoSave(3)}
                        className="sp-kyc-input"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label className="sp-kyc-label">Document officiel URSSAF (PDF ou Image)</label>
                  {renderCustomFileUploader('fichier_urssaf', 'Importer mon attestation URSSAF', profilData.fichier_urssaf, 'URSSAF')}
                </div>
              </div>

              {/* Barre d'actions avec enregistrement automatique */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  <span>Enregistrement automatique actif</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAutoSave(3);
                    setEtapeActive(4);
                  }}
                  style={{
                    flex: isMobile ? 1 : 'initial',
                    padding: '12px 22px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.22)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Étape 4 (RC Pro) →</span>
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 4 : ASSURANCE RC PRO, IBAN, TVA & CHARTE                  */}
          {/* =============================================================== */}
          {etapeActive === 4 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Étape 4 sur 5
                  </span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: '#0f172a' }}>
                    RC Pro, IBAN, TVA & Charte
                  </h2>
                </div>
                <span
                  style={{
                    padding: '4px 11px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: statutsEtapes[4].expire
                      ? 'rgba(239, 68, 68, 0.14)'
                      : statutsEtapes[4].ok
                        ? 'rgba(16, 185, 129, 0.14)'
                        : 'rgba(245, 158, 11, 0.16)',
                    color: statutsEtapes[4].expire ? '#dc2626' : statutsEtapes[4].ok ? '#059669' : '#b45309',
                    flexShrink: 0
                  }}
                >
                  {statutsEtapes[4].label}
                </span>
              </div>

              {/* Sous-bloc A : Assurance RC Pro */}
              <div
                className="sp-glass-pill"
                style={{
                  padding: isMobile ? '14px 12px' : '16px',
                  borderRadius: '16px',
                  marginBottom: '12px',
                  border: statutsEtapes[4].expire ? '1.5px solid rgba(239, 68, 68, 0.45)' : undefined,
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    A. Assurance RC Professionnelle
                  </span>
                  {statutsEtapes[4].expire && (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626' }}>
                      Date d'expiration dépassée — mettez-la à jour ci-dessous.
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'repeat(3, minmax(0, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Assureur</label>
                    <input
                      type="text"
                      placeholder="Ex : AXA, Hiscox..."
                      value={profilData.assureur_nom || ''}
                      onChange={(e) => setProfilData({ ...profilData, assureur_nom: e.target.value })}
                      onBlur={() => handleAutoSave(4)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">N° de police</label>
                    <input
                      type="text"
                      placeholder="N° contrat..."
                      value={profilData.assureur_contrat || ''}
                      onChange={(e) => setProfilData({ ...profilData, assureur_contrat: e.target.value })}
                      onBlur={() => handleAutoSave(4)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0, gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                    <label className="sp-kyc-label">Plafond de garantie (€)</label>
                    <input
                      type="text"
                      placeholder="Ex : 500 000 €"
                      value={profilData.assureur_plafond || ''}
                      onChange={(e) => setProfilData({ ...profilData, assureur_plafond: e.target.value })}
                      onBlur={() => handleAutoSave(4)}
                      className="sp-kyc-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: '10px', alignItems: 'end' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label" style={{ color: statutsEtapes[4].expire ? '#dc2626' : '#334155' }}>
                      Date d'expiration RC Pro *
                    </label>
                    <input
                      type="date"
                      value={profilData.date_expiration_rc_pro ? profilData.date_expiration_rc_pro.slice(0, 10) : ''}
                      onChange={(e) => setProfilData({ ...profilData, date_expiration_rc_pro: e.target.value })}
                      onBlur={() => handleAutoSave(4)}
                      className="sp-kyc-input"
                      style={statutsEtapes[4].expire ? { borderColor: '#ef4444' } : undefined}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Attestation RC Pro en cours de validité</label>
                    {renderCustomFileUploader('fichier_rc_pro', 'Importer attestation RC Pro', profilData.fichier_rc_pro, 'RC Pro')}
                  </div>
                </div>
              </div>

              {/* Sous-bloc B : Coordonnées bancaires & TVA */}
              <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '16px', marginBottom: '12px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                  B. Versement des commissions (IBAN & TVA)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1fr)', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Titulaire du compte</label>
                    <input
                      type="text"
                      placeholder="Nom ou raison sociale"
                      value={profilData.titulaire_iban || ''}
                      onChange={(e) => setProfilData({ ...profilData, titulaire_iban: e.target.value })}
                      onBlur={() => handleAutoSave(4)}
                      className="sp-kyc-input"
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">IBAN (Zone SEPA)</label>
                    <input
                      type="text"
                      placeholder="FR76 ..."
                      value={profilData.iban || ''}
                      onChange={(e) => setProfilData({ ...profilData, iban: e.target.value })}
                      onBlur={() => handleAutoSave(4)}
                      className="sp-kyc-input"
                      style={{ fontFamily: 'monospace', fontSize: '12.5px' }}
                    />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">Régime de TVA</label>
                    <select
                      value={profilData.regime_tva || 'FRANCHISE_293B'}
                      onChange={(e) => {
                        const next = { ...profilData, regime_tva: e.target.value };
                        setProfilData(next);
                        handleAutoSave(4, next);
                      }}
                      className="sp-kyc-input"
                    >
                      <option value="FRANCHISE_293B">Franchise en base (293B)</option>
                      <option value="ASSUJETTI_TVA">Assujetti à la TVA (20%)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sous-bloc C : Déclarations sur l'honneur & Charte */}
              <div
                className="sp-glass-pill"
                style={{
                  padding: isMobile ? '12px' : '14px 16px',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: '9px',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={!!profilData.honneur_aucune_interdiction}
                    onChange={(e) => {
                      const next = { ...profilData, honneur_aucune_interdiction: e.target.checked };
                      setProfilData(next);
                      handleAutoSave(4, next);
                    }}
                    style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>Aucune interdiction de gérer ou d'exercer.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={!!profilData.honneur_pas_exclusivite_employeur}
                    onChange={(e) => {
                      const next = { ...profilData, honneur_pas_exclusivite_employeur: e.target.checked };
                      setProfilData(next);
                      handleAutoSave(4, next);
                    }}
                    style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>Aucune clause d'exclusivité employeur bloquante.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={!!profilData.honneur_pas_mandat_concurrent}
                    onChange={(e) => {
                      const next = { ...profilData, honneur_pas_mandat_concurrent: e.target.checked };
                      setProfilData(next);
                      handleAutoSave(4, next);
                    }}
                    style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>Aucun mandat concurrent non déclaré.</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0f172a', fontWeight: '800' }}>
                  <input
                    type="checkbox"
                    checked={!!profilData.charte_acceptee}
                    onChange={(e) => {
                      const next = { ...profilData, charte_acceptee: e.target.checked };
                      setProfilData(next);
                      handleAutoSave(4, next);
                    }}
                    style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>J'accepte la Charte Commerciale STACK (v1.0).</span>
                </label>
              </div>

              {/* Barre d'actions avec enregistrement automatique */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  <span>Enregistrement automatique actif</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAutoSave(4);
                    setEtapeActive(5);
                  }}
                  style={{
                    flex: isMobile ? 1 : 'initial',
                    padding: '12px 22px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.22)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>Étape 5 (Quiz) →</span>
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 5 : QUIZ DE CERTIFICATION NF525 & CONTACT                 */}
          {/* =============================================================== */}
          {etapeActive === 5 && (
            <form onSubmit={handleQuizSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Étape 5 sur 5
                  </span>
                  <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: '#0f172a' }}>
                    Quiz de Certification NF525
                  </h2>
                </div>
                <span
                  style={{
                    padding: '4px 11px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: statutsEtapes[5].ok ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                    color: statutsEtapes[5].ok ? '#059669' : '#b45309',
                    flexShrink: 0
                  }}
                >
                  {statutsEtapes[5].label}
                </span>
              </div>

              <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '16px', marginBottom: '12px', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">1. Quelle norme encadre la caisse STACK ?</label>
                    <select
                      required
                      value={quizAnswers.q1 || ''}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, q1: e.target.value })}
                      className="sp-kyc-input"
                    >
                      <option value="">-- Sélectionner la réponse --</option>
                      <option value="nf525">La certification NF525 obligatoire</option>
                      <option value="aucune">Aucune norme spécifique</option>
                    </select>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">2. Un agent peut-il supprimer un ticket de caisse ?</label>
                    <select
                      required
                      value={quizAnswers.q2 || ''}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, q2: e.target.value })}
                      className="sp-kyc-input"
                    >
                      <option value="">-- Sélectionner la réponse --</option>
                      <option value="interdit">Strictement interdit (inaltérabilité NF525)</option>
                      <option value="autorise">Oui sur demande du gérant</option>
                    </select>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">3. Quel est votre statut vis-à-vis de STACK ?</label>
                    <select
                      required
                      value={quizAnswers.q3 || ''}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, q3: e.target.value })}
                      className="sp-kyc-input"
                    >
                      <option value="">-- Sélectionner la réponse --</option>
                      <option value="mandataire">Mandataire indépendant (Agent commercial)</option>
                      <option value="salarie">Salarié de la société STACK</option>
                    </select>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <label className="sp-kyc-label">4. Facturation des 99 € HT de mise en service ?</label>
                    <select
                      required
                      value={quizAnswers.q4 || ''}
                      onChange={(e) => setQuizAnswers({ ...quizAnswers, q4: e.target.value })}
                      className="sp-kyc-input"
                    >
                      <option value="">-- Sélectionner la réponse --</option>
                      <option value="99">Facturés par l'agent au salon (mention RSAC)</option>
                      <option value="stack">Encaissés directement par STACK</option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                className="sp-glass-pill"
                style={{
                  padding: isMobile ? '14px 12px' : '16px 18px',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: '12px',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ flex: 1, maxWidth: isMobile ? '100%' : '280px', minWidth: 0 }}>
                  <label className="sp-kyc-label">Téléphone mobile professionnel actif *</label>
                  <input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    required
                    value={profilData.telephone || ''}
                    onChange={(e) => setProfilData({ ...profilData, telephone: e.target.value })}
                    className="sp-kyc-input"
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', paddingTop: isMobile ? 0 : '18px' }}>
                  <input
                    type="checkbox"
                    required
                    checked={!!profilData.telephone_confirme}
                    onChange={(e) => setProfilData({ ...profilData, telephone_confirme: e.target.checked })}
                    style={{ width: '17px', height: '17px', accentColor: '#111827', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>Je confirme que mes coordonnées téléphoniques sont actives.</span>
                </label>
              </div>

              <button
                type="submit"
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '13px 26px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.22)'
                }}
              >
                <Icon.Check />
                <span>Valider le Quiz NF525 & Terminer</span>
              </button>
            </form>
          )}

          {/* =============================================================== */}
          {/* ÉTAPE 6 : AMBIANCE & THÈMES DE L'APPLICATION                    */}
          {/* =============================================================== */}
          {etapeActive === 6 && (
            <AmbianceSelectorPartner
              agent={agent}
              stats={stats}
              isDarkMode={isDarkMode}
              themeJour={themeJour}
              themeNuit={themeNuit}
              onChoisirThemeJour={onChoisirThemeJour}
              onChoisirThemeNuit={onChoisirThemeNuit}
              onToggleTheme={onToggleTheme}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
