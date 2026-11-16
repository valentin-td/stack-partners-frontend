// src/components/dashboard/TabStock.jsx
// Onglet Stock & TPE : Design Salon Architecte (Zéro surcharge, Confort visuel Jour & Nuit)

import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';
import FastScannerOnboarding from './FastScannerOnboarding';

export default function TabStock({ apiBaseUrl, token, isMobile }) {
  const [data, setData] = useState({
    tpe_stock: 0,
    onboardings_prevus: 0,
    manquant: 0,
    alerte_penurie: false,
    adresse_defaut: '',
    commandes: []
  });
  const [quantite, setQuantite] = useState(2);
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [subTab, setSubTab] = useState('tpe'); // 'tpe' | 'onboarding'
  const [modeleTpe, setModeleTpe] = useState('STRIPE_T600'); // 'STRIPE_T600' | 'STRIPE_S700'
  const [codeAcces, setCodeAcces] = useState('');
  const [onboardingSession, setOnboardingSession] = useState(null);
  const [joiningSession, setJoiningSession] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [afficherProtocoleTpe, setAfficherProtocoleTpe] = useState(false);

  const rejoindreOnboarding = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = codeAcces.trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length < 4) {
      setJoinError('Code invalide (6 chiffres requis).');
      return;
    }
    setJoiningSession(true);
    setJoinError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/onboarding-stock/rejoindre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code_acces: cleanCode })
      });
      const json = await res.json();
      if (res.ok && json.session) {
        setOnboardingSession(json.session);
      } else {
        setJoinError(json.error || 'Code introuvable ou expiré.');
      }
    } catch (err) {
      setJoinError('Erreur réseau.');
    } finally {
      setJoiningSession(false);
    }
  };

  const chargerStock = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/tpe-stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!adresse && json.adresse_defaut) setAdresse(json.adresse_defaut);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    chargerStock();
  }, []);

  const commanderTpe = async (e) => {
    e.preventDefault();
    if (!adresse.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${apiBaseUrl}/tpe-stock/commander`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantite, adresse_livraison: adresse, modele_tpe: modeleTpe })
      });
      const out = await res.json();
      if (res.ok) {
        setFeedback({ type: 'ok', text: out.message || 'Votre commande de terminaux a bien été enregistrée.' });
        chargerStock();
      } else {
        setFeedback({ type: 'err', text: out.error || 'Erreur lors de la demande.' });
      }
    } catch (e) {
      setFeedback({ type: 'err', text: 'Erreur réseau.' });
    }
    setSubmitting(false);
  };

  const ajusterStock = async (delta) => {
    const cible = Math.max(0, (data.tpe_stock || 0) + delta);
    setData((prev) => ({
      ...prev,
      tpe_stock: cible,
      manquant: Math.max(0, prev.onboardings_prevus - cible),
      alerte_penurie: prev.onboardings_prevus > cible
    }));
    await fetch(`${apiBaseUrl}/tpe-stock/ajuster`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tpe_stock: cible })
    }).catch(() => {});
  };

  const { totalTpeCommandes, nbCommandesExpediees } = useMemo(() => {
    const liste = Array.isArray(data.commandes) ? data.commandes : [];
    const total = liste.reduce((acc, c) => acc + (parseInt(c.quantite, 10) || 0), 0);
    const expediees = liste.filter((c) => c.statut === 'EXPEDIEE').length;
    return { totalTpeCommandes: total, nbCommandesExpediees: expediees };
  }, [data.commandes]);

  if (loading) {
    return (
      <div
        className="sp-glass-panel"
        style={{
          padding: '42px 24px',
          textAlign: 'center',
          color: 'var(--sp-text-muted, #64748b)',
          fontSize: '13.5px',
          fontWeight: '600'
        }}
      >
        Chargement de votre inventaire matériel...
      </div>
    );
  }

  const nbStock = parseInt(data.tpe_stock, 10) || 0;
  const nbPrevus = parseInt(data.onboardings_prevus, 10) || 0;
  const nbManquant = parseInt(data.manquant, 10) || Math.max(0, nbPrevus - nbStock);
  const pctCouverture = nbPrevus > 0 ? Math.min(100, Math.round((nbStock / nbPrevus) * 100)) : 100;

  return (
    <div
      style={{
        paddingBottom: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 0px))' : '28px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1
      }}
    >
      <style>{`
        .sp-stock-row {
          background: var(--sp-bg-pill, rgba(255, 255, 255, 0.90));
          border: var(--sp-border-pill, 1px solid rgba(148, 163, 184, 0.22));
          box-shadow: 0 3px 10px -4px rgba(15, 23, 42, 0.04);
          border-radius: 15px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
        }
        .sp-stock-row:hover {
          transform: translateY(-1px);
          border-color: rgba(16, 185, 129, 0.40);
          box-shadow: 0 8px 18px -6px rgba(15, 23, 42, 0.07);
        }
        .sp-stock-input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          height: 42px !important;
          min-height: 42px !important;
          padding: 0 14px;
          background: var(--sp-bg-input, #ffffff);
          border: var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.32));
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--sp-text-main, #18181b);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .sp-stock-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.10);
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE UNIFIÉ AVEC SÉLECTEUR D'ONGLET INTÉGRÉ À DROITE          */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px',
          marginBottom: isMobile ? '12px' : '16px'
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
            {subTab === 'tpe' ? 'Logistique & Stock TPE' : "Saisie d'Inventaire Salon"}
          </h1>
          {!isMobile && (
            <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
              {subTab === 'tpe'
                ? 'Terminaux Stripe Reader T600 / S700 & stock tampon'
                : 'Scan rapide du stock initial en salon par délégation'}
            </span>
          )}
        </div>

        {/* Sélecteur d'outil doux en Émeraude (Fini la grosse barre noire isolée en haut) */}
        <div
          className="sp-glass-pill"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3px',
            padding: '3px',
            borderRadius: '999px',
            width: isMobile ? '100%' : '320px',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
        >
          <button
            type="button"
            onClick={() => setSubTab('tpe')}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: subTab === 'tpe' ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
              background: subTab === 'tpe' ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
              color: subTab === 'tpe' ? '#059669' : 'var(--sp-text-muted, #64748b)',
              fontSize: '12px',
              fontWeight: subTab === 'tpe' ? '800' : '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Mes TPE ({nbStock})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('onboarding')}
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: subTab === 'onboarding' ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
              background: subTab === 'onboarding' ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
              color: subTab === 'onboarding' ? '#059669' : 'var(--sp-text-muted, #64748b)',
              fontSize: '12px',
              fontWeight: subTab === 'onboarding' ? '800' : '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Saisie Stock Salon
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* SOUS-ONGLET 1 : SAISIE D'INVENTAIRE SALON (GRILLE BENTO 2 COLONNES) */}
      {/* =================================================================== */}
      {subTab === 'onboarding' && (
        onboardingSession ? (
          <FastScannerOnboarding
            apiBaseUrl={apiBaseUrl}
            token={token}
            session={onboardingSession}
            onTerminer={() => {
              setOnboardingSession(null);
              setCodeAcces('');
            }}
            isMobile={isMobile}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr',
              gap: isMobile ? '14px' : '20px',
              alignItems: 'stretch'
            }}
          >
            {/* Colonne gauche : Connexion par code à 6 chiffres */}
            <div
              className="sp-glass-panel"
              style={{
                padding: isMobile ? '20px 16px' : '26px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 11px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.13)',
                    border: '1px solid rgba(16, 185, 129, 0.28)',
                    color: '#059669',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  <span>Onboarding Terrain • Scan Mobile</span>
                </div>

                <h2 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '19px' : '22px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', letterSpacing: '-0.02em' }}>
                  Rejoindre l'inventaire d'un salon
                </h2>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.5 }}>
                  Saisissez le code temporaire à 6 chiffres affiché sur l'écran du gérant pour biper directement ses flacons et produits avec votre smartphone.
                </p>

                {joinError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.28)',
                      color: '#dc2626',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      marginBottom: '14px'
                    }}
                  >
                    {joinError}
                  </div>
                )}
              </div>

              <form noValidate onSubmit={rejoindreOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '6px' }}>
                    Code d'accès à 6 chiffres du gérant
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="842 915"
                    value={codeAcces}
                    onChange={(e) => setCodeAcces(e.target.value.replace(/[^0-9 ]/g, ''))}
                    maxLength={12}
                    autoFocus={!isMobile}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      height: '52px',
                      borderRadius: '14px',
                      border: codeAcces.trim().length >= 6 ? '1.5px solid #10b981' : 'var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.35))',
                      fontSize: '23px',
                      fontWeight: '800',
                      textAlign: 'center',
                      letterSpacing: '0.18em',
                      color: 'var(--sp-text-main, #18181b)',
                      outline: 'none',
                      background: 'var(--sp-bg-input, #ffffff)',
                      fontFamily: 'monospace',
                      transition: 'border-color 0.15s ease'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={joiningSession || !codeAcces.trim()}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '999px',
                    border: joiningSession || !codeAcces.trim() ? 'var(--sp-border-pill)' : 'none',
                    background: joiningSession || !codeAcces.trim() ? 'var(--sp-bg-pill)' : 'var(--sp-btn-primary, #18181b)',
                    color: joiningSession || !codeAcces.trim() ? 'var(--sp-text-muted, #64748b)' : 'var(--sp-btn-primary-text, #ffffff)',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: joiningSession || !codeAcces.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: joiningSession || !codeAcces.trim() ? 'none' : '0 6px 16px -4px rgba(15, 23, 42, 0.22)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {joiningSession ? 'Connexion au salon...' : "Rejoindre l'inventaire du salon →"}
                </button>
              </form>
            </div>

            {/* Colonne droite : Guide en 3 étapes pour ne pas laisser la moitié de l'écran vide */}
            <div
              className="sp-glass-panel"
              style={{
                padding: isMobile ? '18px 16px' : '26px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ color: '#059669', display: 'flex' }}>
                    <Icon.Shield />
                  </span>
                  <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                    Comment fonctionne le Scan Délégué ?
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    {
                      num: '1',
                      titre: 'Ouverture côté Salon',
                      desc: "Sur le logiciel du salon, ouvrez l'onglet Stocks → Actions → « Déléguer » pour afficher le code à 6 chiffres."
                    },
                    {
                      num: '2',
                      titre: 'Scan Code-Barres en rafale',
                      desc: 'Votre téléphone reconnaît automatiquement chaque produit (nom, marque, contenance et tarif conseillé).'
                    },
                    {
                      num: '3',
                      titre: 'Synchronisation instantanée',
                      desc: 'Les fiches produits et les quantités s’ajoutent en direct dans le stock du salon sans aucune saisie manuelle.'
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
                        <strong style={{ display: 'block', fontSize: '12.5px', color: 'var(--sp-text-main, #18181b)', marginBottom: '2px' }}>
                          {step.titre}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4, display: 'block' }}>
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sp-glass-pill" style={{ padding: '10px 13px', borderRadius: '12px', fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Base de données Open Beauty & Réseau STACK</span>
                <strong style={{ color: '#059669' }}>Actif ✓</strong>
              </div>
            </div>
          </div>
        )
      )}

      {/* =================================================================== */}
      {/* SOUS-ONGLET 2 : LOGISTIQUE & STOCK TPE                              */}
      {/* =================================================================== */}
      {subTab === 'tpe' && (
        <>
          {/* BANDEAU D'ALERTE PÉNURIE COMPACT (UNIQUEMENT SI MANQUANT) */}
          {data.alerte_penurie && (
            <div
              className="sp-glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: isMobile ? '10px 12px' : '12px 18px',
                marginBottom: isMobile ? '10px' : '16px',
                borderRadius: '16px',
                border: '1.5px solid rgba(245, 158, 11, 0.40)',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon.Zap />
                </div>
                <div style={{ fontSize: isMobile ? '11.5px' : '12.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.35, minWidth: 0 }}>
                  <strong style={{ color: 'var(--sp-text-main, #18181b)', display: 'block', fontSize: isMobile ? '12px' : '13px' }}>
                    Réassort TPE recommandé ({nbManquant} manquant{nbManquant > 1 ? 's' : ''})
                  </strong>
                  <span>
                    {nbPrevus} installation{nbPrevus > 1 ? 's' : ''} prévue{nbPrevus > 1 ? 's' : ''} pour {nbStock} TPE en stock.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const palier = [1, 2, 3, 5, 10].find((n) => n >= nbManquant) || 2;
                  setQuantite(palier);
                  const el = document.getElementById('sp-order-tpe-input');
                  if (el) el.focus();
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '999px',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#b45309',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                Pré-remplir →
              </button>
            </div>
          )}

          {/* 2. LES 4 KPIS LOGISTIQUES HIÉRARCHISÉS (CARTE MAÎTRESSE ÉMERAUDE + 3 KPIS ÉPURÉS) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1.3fr 1fr 1fr 1fr',
              gap: isMobile ? '8px' : '14px',
              marginBottom: isMobile ? '12px' : '18px'
            }}
          >
            {/* KPI 1 (Pièce maîtresse) : TPE en stock + Boutons -/+ intégrés */}
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
                  TPE en stock
                </span>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    type="button"
                    onClick={() => ajusterStock(-1)}
                    title="Retirer 1 TPE du stock"
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => ajusterStock(1)}
                    title="Ajouter 1 TPE en stock"
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      border: '1px solid rgba(52, 211, 153, 0.4)',
                      background: 'rgba(16, 185, 129, 0.25)',
                      color: '#34d399',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '6px 0' }}>
                <div style={{ fontSize: isMobile ? '26px' : '29px', fontWeight: '800', color: '#ffffff', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {nbStock}
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.68)', fontWeight: '600' }}>
                  termina{nbStock > 1 ? 'ux' : 'l'} prêt{nbStock > 1 ? 's' : ''} à installer
                </span>
              </div>

              <div>
                <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(8, pctCouverture)}%`, background: data.alerte_penurie ? '#f59e0b' : '#10b981', borderRadius: '999px' }} />
                </div>
              </div>
            </div>

            {/* KPI 2 : Onboardings prévus */}
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
                  Onboardings prévus
                </span>
                <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
                  Pipeline
                </span>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                  {nbPrevus}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
                  Salons réservés actifs
                </div>
              </div>
            </div>

            {/* KPI 3 : Statut logistique */}
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
                  Couverture
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: '800',
                    background: data.alerte_penurie ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.14)',
                    color: data.alerte_penurie ? '#b45309' : '#059669'
                  }}
                >
                  {data.alerte_penurie ? 'À compléter' : 'Optimale ✓'}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: isMobile ? '16px' : '19px',
                    fontWeight: '800',
                    color: data.alerte_penurie ? '#d97706' : '#059669',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {data.alerte_penurie ? `${nbManquant} TPE manquant${nbManquant > 1 ? 's' : ''}` : 'Stock complet'}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
                  Statut matériel
                </div>
              </div>
            </div>

            {/* KPI 4 : TPE commandés */}
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
                  TPE commandés
                </span>
                <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
                  {nbCommandesExpediees}/{(data.commandes || []).length} exp.
                </span>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '20px' : '27px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                  {totalTpeCommandes}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '500', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
                  Historique d'expéditions
                </div>
              </div>
            </div>
          </div>

          {/* 3. GRILLE BENTO 2 COLONNES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1.15fr) minmax(0, 1fr)',
              gap: isMobile ? '12px' : '18px',
              alignItems: 'start',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* COLONNE GAUCHE : FORMULAIRE DE COMMANDE (SEUL LE BOUTON COMMANDER EST NOIR) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
              <form
                onSubmit={commanderTpe}
                className="sp-glass-panel"
                style={{
                  padding: isMobile ? '16px 14px' : '22px 24px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: isMobile ? '15.5px' : '16.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', whiteSpace: 'nowrap' }}>
                      Commander des TPE
                    </h2>
                    {!isMobile && (
                      <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', display: 'block', marginTop: '2px' }}>
                        Expédition directe par la direction STACK pour vos prochaines installations.
                      </span>
                    )}
                  </div>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    background: 'rgba(16, 185, 129, 0.13)',
                    color: '#059669',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {modeleTpe === 'STRIPE_S700' ? 'Stripe S700' : 'Stripe T600'}
                  </span>
                </div>

                {/* Sélecteur du modèle TPE en Émeraude doux (Fini le gros cadre noir) */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '6px' }}>
                    Modèle de terminal
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '8px' }}>
                    {[
                      {
                        id: 'STRIPE_T600',
                        badge: 'Comptoir',
                        nom: 'Reader T600',
                        desc: 'Écran 8" paysage & pourboires.'
                      },
                      {
                        id: 'STRIPE_S700',
                        badge: 'Mobile',
                        nom: 'Reader S700',
                        desc: 'Sans fil + imprimante ticket.'
                      }
                    ].map((m) => {
                      const actif = modeleTpe === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setModeleTpe(m.id)}
                          className={actif ? '' : 'sp-glass-pill'}
                          style={{
                            padding: '11px 12px',
                            borderRadius: '14px',
                            border: actif ? '1.5px solid #10b981' : undefined,
                            background: actif ? 'rgba(16, 185, 129, 0.11)' : undefined,
                            cursor: 'pointer',
                            textAlign: 'left',
                            boxSizing: 'border-box',
                            minWidth: 0,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '9.5px',
                                fontWeight: '800',
                                padding: '2px 7px',
                                borderRadius: '999px',
                                background: actif ? 'rgba(16, 185, 129, 0.22)' : 'rgba(148, 163, 184, 0.16)',
                                color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)'
                              }}
                            >
                              {m.badge}
                            </span>
                            {actif && <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669' }}>✓</span>}
                          </div>
                          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--sp-text-main, #18181b)', marginBottom: '2px' }}>
                            {m.nom}
                          </strong>
                          <span style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.35, display: 'block' }}>
                            {m.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantité souhaitée : Pilule active Émeraude douce au lieu du bloc noir */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '6px' }}>
                    Quantité souhaitée
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {[1, 2, 3, 5, 10].map((n) => {
                      const actif = Number(quantite) === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setQuantite(n)}
                          className={actif ? '' : 'sp-glass-pill'}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '999px',
                            border: actif ? '1.5px solid #10b981' : undefined,
                            backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : undefined,
                            color: actif ? '#059669' : 'var(--sp-text-main, #18181b)',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {n} TPE
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Adresse de réception & Seul bouton primaire foncé */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '6px' }}>
                    Adresse de réception (Domicile ou Point Relais)
                  </label>
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', alignItems: 'stretch' }}>
                    <input
                      id="sp-order-tpe-input"
                      type="text"
                      value={adresse}
                      onChange={(e) => setAdresse(e.target.value)}
                      placeholder="Numéro, rue, code postal et ville"
                      required
                      className="sp-stock-input"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        height: '42px',
                        padding: '0 20px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: 'var(--sp-btn-primary, #18181b)',
                        color: 'var(--sp-btn-primary-text, #ffffff)',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.20)'
                      }}
                    >
                      <Icon.Check />
                      <span>{submitting ? 'Envoi...' : `Commander (${quantite}x ${modeleTpe === 'STRIPE_S700' ? 'S700' : 'T600'})`}</span>
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      backgroundColor: feedback.type === 'ok' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.12)',
                      color: feedback.type === 'ok' ? '#059669' : '#dc2626',
                      border: feedback.type === 'ok' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.28)'
                    }}
                  >
                    {feedback.text}
                  </div>
                )}
              </form>
            </div>

            {/* COLONNE DROITE : SUIVI DES EXPÉDITIONS + PROTOCOLE LOGISTIQUE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px', minWidth: 0 }}>
              <div
                className="sp-glass-panel"
                style={{
                  padding: isMobile ? '15px 14px' : '20px 22px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ color: '#059669', display: 'flex' }}>
                      <Icon.Stock />
                    </span>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', whiteSpace: 'nowrap' }}>
                      Suivi des expéditions ({(data.commandes || []).length})
                    </h3>
                  </div>
                  <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
                    Colis
                  </span>
                </div>

                {!data.commandes || data.commandes.length === 0 ? (
                  <div
                    className="sp-glass-pill"
                    style={{
                      padding: '20px 14px',
                      borderRadius: '14px',
                      textAlign: 'center',
                      color: 'var(--sp-text-muted, #64748b)',
                      fontSize: '12px'
                    }}
                  >
                    Aucune commande de terminal enregistrée pour le moment.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.commandes.map((cmd) => {
                      const estExpediee = cmd.statut === 'EXPEDIEE';
                      const modeleLabel = cmd.modele_tpe === 'STRIPE_S700' ? 'Stripe Reader S700' : 'Stripe Reader T600';
                      return (
                        <div key={cmd.id_commande} className="sp-stock-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                background: estExpediee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)',
                                border: estExpediee ? '1px solid rgba(16, 185, 129, 0.28)' : '1px solid rgba(245, 158, 11, 0.28)',
                                color: estExpediee ? '#059669' : '#d97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Icon.Stock />
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <strong style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cmd.quantite}x {modeleLabel}
                              </strong>
                              <span
                                style={{
                                  display: 'block',
                                  fontSize: '11px',
                                  color: 'var(--sp-text-muted, #64748b)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {formatDate(cmd.date_commande)} • {cmd.adresse_livraison}
                              </span>
                              {estExpediee && cmd.numero_suivi && (
                                <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>
                                    {cmd.transporteur || 'Colissimo'} : <span style={{ fontFamily: 'monospace' }}>{cmd.numero_suivi}</span>
                                  </span>
                                  {cmd.url_suivi && (
                                    <a
                                      href={cmd.url_suivi}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ fontSize: '11px', color: '#059669', fontWeight: '800', textDecoration: 'underline' }}
                                    >
                                      Suivre ↗
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '10px',
                              fontWeight: '800',
                              backgroundColor: estExpediee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.15)',
                              color: estExpediee ? '#059669' : '#b45309',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            {estExpediee ? 'Expédié ✓' : 'En préparation'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Carte 2 : Protocole logistique TPE (Pastilles Émeraude douces au lieu des ronds noirs) */}
              <div
                className="sp-glass-panel"
                style={{
                  padding: isMobile ? '13px 14px' : '18px 20px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  onClick={() => isMobile && setAfficherProtocoleTpe(!afficherProtocoleTpe)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isMobile ? 'pointer' : 'default',
                    marginBottom: !isMobile || afficherProtocoleTpe ? '12px' : 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#059669', display: 'flex' }}>
                      <Icon.Shield />
                    </span>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                      Protocole Logistique TPE
                    </h3>
                  </div>
                  {isMobile && (
                    <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)' }}>
                      {afficherProtocoleTpe ? 'Masquer ▲' : 'Détails ▼'}
                    </span>
                  )}
                </div>

                {(!isMobile || afficherProtocoleTpe) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      {
                        num: '1',
                        titre: 'Stock tampon recommandé (2 TPE)',
                        desc: "Conservez toujours au moins 2 terminaux d'avance pour pouvoir équiper un salon dès la signature."
                      },
                      {
                        num: '2',
                        titre: 'Appairage Wi-Fi / 4G & Stripe Terminal',
                        desc: "Lors du Go-Live, connectez le TPE au Wi-Fi du salon et saisissez le code d'appairage dans l'onglet Paramètres."
                      },
                      {
                        num: '3',
                        titre: 'Décompte automatique',
                        desc: "Ajustez d'une unité votre stock via les boutons − / + dès que le terminal est remis au gérant."
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
                        <div style={{ minWidth: 0, flex: 1 }}>
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
        </>
      )}
    </div>
  );
}
