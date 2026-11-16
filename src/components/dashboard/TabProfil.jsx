// src/components/dashboard/TabProfil.jsx
// Onglet 6 : Paramètres & Dossier de Conformité KYC — Design Salon Architecte (Zéro surcharge, Jour & Nuit)

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
  themeJour = 'LIN',
  themeNuit = 'CARBONE',
  onToggleTheme = () => {},
  onChoisirThemeJour = () => {},
  onChoisirThemeNuit = () => {}
}) {
  // Évaluation dynamique du statut de chacune des 5 étapes légales
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
        profilData.quiz_score === 100 ||
        (quizAnswers.q1 === 'nf525' &&
          quizAnswers.q2 === 'interdit' &&
          quizAnswers.q3 === 'mandataire' &&
          quizAnswers.q4 === '99'))
    );

    return {
      1: { ok: e1Ok, expire: false, label: e1Ok ? 'Signé ✓' : 'À signer' },
      2: { ok: e2Ok, expire: idExp, label: idExp ? 'ID expirée' : e2Ok ? 'Complet ✓' : 'À compléter' },
      3: { ok: e3Ok, expire: urssafExp, label: urssafExp ? 'Expirée' : e3Ok ? 'Valide ✓' : 'À compléter' },
      4: { ok: e4Ok, expire: rcExp, label: rcExp ? 'RC Pro expirée' : e4Ok ? 'Valide ✓' : 'À compléter' },
      5: { ok: e5Ok, expire: false, label: e5Ok ? 'Certifié ✓' : 'À valider' }
    };
  }, [profilData, quizAnswers]);

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

  const nbEtapesValides = Object.values(statutsEtapes).filter((s) => s.ok && !s.expire).length;
  const pctConformite = Math.round((Math.max(0, nbEtapesValides) / 5) * 100);

  // Uniquement les 5 vraies étapes légales dans le parcours de gauche (l'Ambiance est pilotée par l'onglet en haut)
  const ETAPES_KYC_CONFIG = [
    {
      num: 1,
      court: 'Contrat',
      titre: 'Contrat de mandat',
      sousTitre: 'Signature électronique eIDAS',
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
    }
  ];

  const handleAutoSave = (etape, customPayload = null) => {
    if (typeof submitEtapeConformite === 'function') {
      submitEtapeConformite(etape, customPayload || profilData);
    }
  };

  // Composant d'upload de fichier stylisé et compatible Jour & Nuit
  const renderCustomFileUploader = (fieldName, labelBtn, currentFile, badgeLabel) => {
    const isRgpdValide = fieldName === 'fichier_identite' && !currentFile && profilData.statut_identite === 'VALIDE';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', minWidth: 0 }}>
        <label
          className="sp-glass-pill"
          style={{
            height: '40px',
            padding: '0 13px',
            borderRadius: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '12px',
            fontWeight: '700',
            color: 'var(--sp-text-main, #18181b)',
            cursor: 'pointer',
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

  const renderCheckSvg = (size = 13) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <div
      style={{
        paddingBottom: isMobile ? 'calc(115px + env(safe-area-inset-bottom, 0px))' : '24px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <style>{`
        .sp-step-nav-card {
          background: var(--sp-bg-pill, rgba(255, 255, 255, 0.88));
          border: var(--sp-border-pill, 1px solid rgba(148, 163, 184, 0.22));
          box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.03);
          border-radius: 15px;
          padding: 11px 13px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          outline: none !important;
        }
        .sp-step-nav-card:focus,
        .sp-step-nav-card:focus-visible {
          outline: none !important;
        }
        .sp-step-nav-card:hover {
          transform: translateY(-1px);
          border-color: rgba(16, 185, 129, 0.38) !important;
        }
        .sp-step-nav-card.active {
          background: rgba(16, 185, 129, 0.12) !important;
          border: 1.5px solid rgba(16, 185, 129, 0.48) !important;
          box-shadow: 0 6px 16px -6px rgba(16, 185, 129, 0.16) !important;
        }
        html.dark-mode .sp-step-nav-card.active {
          background: rgba(16, 185, 129, 0.16) !important;
          border: 1.5px solid rgba(16, 185, 129, 0.50) !important;
        }
        .sp-kyc-input {
          display: block;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          height: 41px;
          padding: 0 12px;
          background: var(--sp-bg-input, #ffffff);
          border: var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.32));
          border-radius: 11px;
          font-size: 13px;
          font-weight: 600;
          color: var(--sp-text-main, #18181b);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          overflow: hidden;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="date"].sp-kyc-input {
          display: inline-flex !important;
          align-items: center;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          line-height: 39px;
        }
        .sp-kyc-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.10);
        }
        .sp-kyc-label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--sp-text-muted, #64748b);
          margin-bottom: 5px;
        }
        .sp-next-step-btn {
          background: rgba(16, 185, 129, 0.14);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.35);
          transition: all 0.15s ease;
        }
        .sp-next-step-btn:hover {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }
        html.dark-mode .sp-next-step-btn {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.40);
        }
        .sp-steps-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE COMPACT SUR UNE SEULE LIGNE + SÉLECTEUR KYC / AMBIANCE   */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px',
          marginBottom: isMobile ? '12px' : '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', minWidth: 0 }}>
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
            Profil & Dossier
          </h1>

          <span
            style={{
              padding: '4px 11px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: '800',
              backgroundColor: profilData.autorise_a_vendre
                ? 'rgba(16, 185, 129, 0.14)'
                : 'rgba(245, 158, 11, 0.15)',
              color: profilData.autorise_a_vendre ? '#059669' : '#b45309',
              border: profilData.autorise_a_vendre
                ? '1px solid rgba(16, 185, 129, 0.32)'
                : '1px solid rgba(245, 158, 11, 0.32)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: profilData.autorise_a_vendre ? '#10b981' : '#f59e0b'
              }}
            />
            <span>
              {profilData.autorise_a_vendre ? 'Vente Autorisée ✓' : `Dossier KYC : ${nbEtapesValides}/5 (${pctConformite}%)`}
            </span>
          </span>
        </div>

        {/* Sélecteur doux : Dossier KYC vs Ambiance & Thèmes */}
        <div
          className="sp-glass-pill"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3px',
            padding: '3px',
            borderRadius: '999px',
            width: isMobile ? '100%' : '350px',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
        >
          <button
            type="button"
            onClick={() => setEtapeActive((prev) => (prev === 6 ? premiereEtapePrioritaire : prev))}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: etapeActive !== 6 ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
              background: etapeActive !== 6 ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
              color: etapeActive !== 6 ? '#059669' : 'var(--sp-text-muted, #64748b)',
              fontSize: '12px',
              fontWeight: etapeActive !== 6 ? '800' : '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Dossier KYC ({nbEtapesValides}/5)
          </button>

          <button
            type="button"
            onClick={() => setEtapeActive(6)}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: etapeActive === 6 ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
              background: etapeActive === 6 ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
              color: etapeActive === 6 ? '#059669' : 'var(--sp-text-muted, #64748b)',
              fontSize: '12px',
              fontWeight: etapeActive === 6 ? '800' : '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Ambiance & Thèmes
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BARRE COMPACTE DES MOTIFS DE BLOCAGE (SI DOSSIER INCOMPLET)      */}
      {/* =================================================================== */}
      {!profilData.autorise_a_vendre && profilData.motifs_blocage?.length > 0 && etapeActive !== 6 && (
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '10px 12px' : '11px 16px',
            marginBottom: isMobile ? '12px' : '16px',
            borderRadius: '15px',
            border: '1px solid rgba(245, 158, 11, 0.38)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            boxSizing: 'border-box'
          }}
        >
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#d97706', display: 'flex' }}>
                <Icon.Lock />
              </span>
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                Étape à finaliser pour débloquer votre droit de vente :
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
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
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
                  <span style={{ fontWeight: '800', flexShrink: 0 }}>Ouvrir →</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. VUE AMBIANCE & THÈMES OU GRILLE 2 COLONNES DU DOSSIER KYC        */}
      {/* =================================================================== */}
      {etapeActive === 6 ? (
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px 14px' : '24px 26px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
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
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : '325px minmax(0, 1fr)',
            gap: isMobile ? '12px' : '18px',
            alignItems: 'start',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* NAVIGATION DES 5 ÉTAPES KYC */}
          {isMobile ? (
            <div
              className="sp-glass-panel sp-steps-scroll"
              style={{
                padding: '6px',
                borderRadius: '16px',
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                boxSizing: 'border-box'
              }}
            >
              {ETAPES_KYC_CONFIG.map((item) => {
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
                      borderRadius: '12px',
                      border: isSelected
                        ? '1.5px solid #10b981'
                        : st.expire
                          ? '1px solid rgba(239, 68, 68, 0.35)'
                          : 'var(--sp-border-pill)',
                      background: isSelected
                        ? 'rgba(16, 185, 129, 0.14)'
                        : st.expire
                          ? 'rgba(239, 68, 68, 0.10)'
                          : 'var(--sp-bg-pill)',
                      color: isSelected ? '#059669' : 'var(--sp-text-main, #18181b)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      outline: 'none'
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
                        background: st.expire
                          ? 'rgba(239, 68, 68, 0.16)'
                          : st.ok
                            ? 'rgba(16, 185, 129, 0.18)'
                            : 'rgba(148, 163, 184, 0.2)',
                        color: st.expire ? '#dc2626' : st.ok ? '#059669' : 'var(--sp-text-muted, #64748b)'
                      }}
                    >
                      {st.ok && !st.expire ? renderCheckSvg(10) : st.expire ? '!' : item.num}
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
              {/* En-tête de la colonne de gauche avec mini jauge de progression */}
              <div style={{ padding: '2px 4px 8px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Parcours de validation (5 étapes)
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#059669' }}>
                    {nbEtapesValides}/5
                  </span>
                </div>
                <div style={{ height: '4px', width: '100%', background: 'rgba(148, 163, 184, 0.18)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(6, pctConformite)}%`, background: '#10b981', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {ETAPES_KYC_CONFIG.map((item) => {
                const st = statutsEtapes[item.num];
                const isSelected = etapeActive === item.num;

                return (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => setEtapeActive(item.num)}
                    className={`sp-step-nav-card ${isSelected ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: st.expire
                            ? 'rgba(239, 68, 68, 0.14)'
                            : st.ok
                              ? 'rgba(16, 185, 129, 0.16)'
                              : isSelected
                                ? 'rgba(16, 185, 129, 0.18)'
                                : 'rgba(148, 163, 184, 0.16)',
                          border: st.ok && !st.expire
                            ? '1px solid rgba(16, 185, 129, 0.35)'
                            : isSelected
                              ? '1px solid rgba(16, 185, 129, 0.45)'
                              : '1px solid transparent',
                          color: st.expire
                            ? '#dc2626'
                            : st.ok || isSelected
                              ? '#059669'
                              : 'var(--sp-text-muted, #64748b)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '800',
                          flexShrink: 0
                        }}
                      >
                        {st.ok && !st.expire ? renderCheckSvg(13) : st.expire ? '!' : item.num}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            color: 'var(--sp-text-main, #18181b)',
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
                            color: 'var(--sp-text-muted, #64748b)',
                            marginTop: '1px',
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
                        padding: '2px 8px',
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

              {/* Accès rapide vers la personnalisation du thème en bas de la colonne */}
              <button
                type="button"
                onClick={() => setEtapeActive(6)}
                className="sp-glass-pill"
                style={{
                  marginTop: '4px',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  color: 'var(--sp-text-muted, #64748b)'
                }}
              >
                <span>Thème : <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>{isDarkMode ? (AMBIANCES_PARTNER_NUIT[themeNuit]?.nom || 'Carbone') : (AMBIANCES_PARTNER_JOUR[themeJour]?.nom || 'Lin & Travertin')}</strong></span>
                <span style={{ color: '#059669', fontWeight: '800' }}>Modifier ›</span>
              </button>
            </div>
          )}

          {/* COLONNE DROITE : CONTENU DE L'ÉTAPE ACTIVE */}
          <div
            className="sp-glass-panel"
            style={{
              padding: isMobile ? '16px 14px' : '24px 26px',
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
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Étape 1 sur 5
                    </span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
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
                    {profilData.statut_contrat === 'VALIDE' ? 'Signé ✓' : (profilData.statut_contrat || 'En attente')}
                  </span>
                </div>

                <div className="sp-glass-pill" style={{ padding: isMobile ? '14px' : '18px 20px', borderRadius: '16px', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <p style={{ fontSize: isMobile ? '12.5px' : '13.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.55, margin: '0 0 14px 0' }}>
                    Ce contrat de mandat commercial indépendant est conclu sous condition suspensive d'immatriculation RSAC. Il fixe votre commission récurrente de <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>20 % HT pendant 24 mois</strong> sur chaque abonnement de salon affilié, ainsi que votre forfait de mise en service terrain de <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>99 € HT</strong>.
                  </p>

                  {profilData.contrat_signe && profilData.statut_contrat === 'VALIDE' ? (
                    <div
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.28)',
                        borderRadius: '14px',
                        padding: isMobile ? '12px' : '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon.Check /> Contrat signé et scellé électroniquement
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.14)', padding: '3px 9px', borderRadius: '999px' }}>
                          eIDAS • Art. 1366 C. Civ.
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.5, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '6px' }}>
                        <div><strong style={{ color: 'var(--sp-text-main, #18181b)' }}>Référence :</strong> {profilData.certificat_contrat_ref || 'STACK-MANDAT-VALIDE'}</div>
                        <div><strong style={{ color: 'var(--sp-text-main, #18181b)' }}>Date de scellement :</strong> {profilData.date_signature_contrat ? new Date(profilData.date_signature_contrat).toLocaleDateString('fr-FR') : 'Certifiée'}</div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(16, 185, 129, 0.20)' }}>
                        <button
                          type="button"
                          onClick={onTelechargerContratPdf}
                          className="sp-next-step-btn"
                          style={{
                            padding: '9px 16px',
                            borderRadius: '999px',
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
                          style={{ padding: '9px 15px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)', cursor: 'pointer', textAlign: 'center' }}
                        >
                          Consulter les 10 articles
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
                        Signature manuscrite et scellement d'intégrité intégrés.
                      </div>
                      <button
                        type="button"
                        onClick={onOuvrirSignatureContrat || handleYousignSignature}
                        style={{
                          padding: '11px 20px',
                          borderRadius: '999px',
                          border: 'none',
                          backgroundColor: 'var(--sp-btn-primary, #18181b)',
                          color: 'var(--sp-btn-primary-text, #ffffff)',
                          fontSize: '13px',
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.22)'
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
                    style={{ width: isMobile ? '100%' : 'auto', padding: '10px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', cursor: 'pointer', textAlign: 'center' }}
                  >
                    Étape 2 (Identité & RSAC) →
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* ÉTAPE 2 : IDENTITÉ, SIRET & IMMATRICULATION RSAC                */}
            {/* =============================================================== */}
            {etapeActive === 2 && (
              <div style={{ opacity: profilData.contrat_signe ? 1 : 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Étape 2 sur 5
                    </span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
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

                {/* Sous-bloc A : Pièce d'identité */}
                <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '15px', marginBottom: '12px', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '10px' }}>
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
                <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '15px', marginBottom: '12px', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '10px' }}>
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
                <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '15px', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '10px' }}>
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
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                    <span>Enregistrement automatique actif</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAutoSave(2);
                      setEtapeActive(3);
                    }}
                    className="sp-next-step-btn"
                    style={{
                      flex: isMobile ? 1 : 'initial',
                      padding: '10px 20px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Enregistrer & Étape 3 (URSSAF) →</span>
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
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Étape 3 sur 5
                    </span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
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

                <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '15px', marginBottom: '16px', boxSizing: 'border-box' }}>
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
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                    <span>Enregistrement automatique actif</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAutoSave(3);
                      setEtapeActive(4);
                    }}
                    className="sp-next-step-btn"
                    style={{
                      flex: isMobile ? 1 : 'initial',
                      padding: '10px 20px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Enregistrer & Étape 4 (RC Pro) →</span>
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
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Étape 4 sur 5
                    </span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
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
                    borderRadius: '15px',
                    marginBottom: '12px',
                    border: statutsEtapes[4].expire ? '1.5px solid rgba(239, 68, 68, 0.45)' : undefined,
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
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
                      <label className="sp-kyc-label" style={{ color: statutsEtapes[4].expire ? '#dc2626' : undefined }}>
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
                <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '16px', borderRadius: '15px', marginBottom: '12px', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '10px' }}>
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
                    borderRadius: '15px',
                    marginBottom: '16px',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '9px',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={!!profilData.honneur_aucune_interdiction}
                      onChange={(e) => {
                        const next = { ...profilData, honneur_aucune_interdiction: e.target.checked };
                        setProfilData(next);
                        handleAutoSave(4, next);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span>Aucune interdiction de gérer ou d'exercer.</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={!!profilData.honneur_pas_exclusivite_employeur}
                      onChange={(e) => {
                        const next = { ...profilData, honneur_pas_exclusivite_employeur: e.target.checked };
                        setProfilData(next);
                        handleAutoSave(4, next);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span>Aucune clause d'exclusivité employeur bloquante.</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
                    <input
                      type="checkbox"
                      checked={!!profilData.honneur_pas_mandat_concurrent}
                      onChange={(e) => {
                        const next = { ...profilData, honneur_pas_mandat_concurrent: e.target.checked };
                        setProfilData(next);
                        handleAutoSave(4, next);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span>Aucun mandat concurrent non déclaré.</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--sp-text-main, #18181b)', fontWeight: '800' }}>
                    <input
                      type="checkbox"
                      checked={!!profilData.charte_acceptee}
                      onChange={(e) => {
                        const next = { ...profilData, charte_acceptee: e.target.checked };
                        setProfilData(next);
                        handleAutoSave(4, next);
                      }}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span>J'accepte la Charte Commerciale STACK (v1.0).</span>
                  </label>
                </div>

                {/* Barre d'actions avec enregistrement automatique */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                    <span>Enregistrement automatique actif</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAutoSave(4);
                      setEtapeActive(5);
                    }}
                    className="sp-next-step-btn"
                    style={{
                      flex: isMobile ? 1 : 'initial',
                      padding: '10px 20px',
                      borderRadius: '999px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>Enregistrer & Étape 5 (Quiz) →</span>
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
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Étape 5 sur 5
                    </span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '17.5px' : '20px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
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

                <div className="sp-glass-pill" style={{ padding: isMobile ? '14px 12px' : '18px', borderRadius: '15px', marginBottom: '12px', boxSizing: 'border-box' }}>
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
                    borderRadius: '15px',
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

                  <label style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12.5px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)', cursor: 'pointer', paddingTop: isMobile ? 0 : '18px' }}>
                    <input
                      type="checkbox"
                      required
                      checked={!!profilData.telephone_confirme}
                      onChange={(e) => setProfilData({ ...profilData, telephone_confirme: e.target.checked })}
                      style={{ width: '17px', height: '17px', accentColor: '#10b981', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span>Je confirme que mes coordonnées téléphoniques sont actives.</span>
                  </label>
                </div>

                {/* Seul bouton primaire foncé sur l'étape finale */}
                <button
                  type="submit"
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: '12px 24px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: 'var(--sp-btn-primary, #18181b)',
                    color: 'var(--sp-btn-primary-text, #ffffff)',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.22)'
                  }}
                >
                  <Icon.Check />
                  <span>Valider le Quiz NF525 & Terminer</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
