// src/components/dashboard/TabStock.jsx
// Onglet Stock & TPE : Suivi du matériel, inventaire et commandes de terminaux en Verre Cristal — Optimisé Desktop & iPhone

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
          color: '#64748b',
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
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.72) 100%);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 16px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .sp-stock-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff;
        }
        .sp-stock-input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          height: 44px !important;
          min-height: 44px !important;
          padding: 0 14px;
          background: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 13px;
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .sp-stock-input:focus {
          border-color: #0f172a;
          box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.06);
        }
      `}</style>

      {/* Sélecteur SubTab : Saisie Stock Salon vs Mes TPE */}
      <div
        className="sp-glass-pill"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          padding: '4px',
          borderRadius: '999px',
          maxWidth: '480px',
          margin: isMobile ? '0 auto 12px auto' : '0 auto 20px auto',
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={() => setSubTab('onboarding')}
          style={{
            padding: isMobile ? '8px 10px' : '10px 14px',
            borderRadius: '999px',
            border: 'none',
            background: subTab === 'onboarding' ? '#0f172a' : 'transparent',
            color: subTab === 'onboarding' ? '#ffffff' : '#64748b',
            fontSize: isMobile ? '12px' : '12.5px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Saisie Stock Salon
        </button>

        <button
          type="button"
          onClick={() => setSubTab('tpe')}
          style={{
            padding: isMobile ? '8px 10px' : '10px 14px',
            borderRadius: '999px',
            border: 'none',
            background: subTab === 'tpe' ? '#0f172a' : 'transparent',
            color: subTab === 'tpe' ? '#ffffff' : '#64748b',
            fontSize: isMobile ? '12px' : '12.5px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Mes TPE ({nbStock})
        </button>
      </div>

      {/* SOUS-ONGLET 1 : SAISIE D'INVENTAIRE SALON */}
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
            className="sp-glass-panel"
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              borderRadius: isMobile ? '22px' : '26px',
              padding: isMobile ? '20px 16px' : '30px 28px',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: '4px 11px',
                borderRadius: '999px',
                background: 'rgba(79, 70, 229, 0.12)',
                color: '#4f46e5',
                fontSize: '10.5px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px'
              }}
            >
              Onboarding Terrain
            </div>

            <h2 style={{ margin: '0 0 6px 0', fontSize: isMobile ? '19px' : '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Saisie d'Inventaire Salon
            </h2>
            <p style={{ margin: '0 0 18px 0', fontSize: isMobile ? '12.5px' : '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Demandez au gérant du salon d'ouvrir l'onglet Stock et de cliquer sur{' '}
              <strong style={{ color: '#0f172a' }}>« Déléguer Onboarding (Code Agent) »</strong> pour obtenir son code d'accès à 6 chiffres.
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

            <form noValidate onSubmit={rejoindreOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Code à 6 chiffres du gérant
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex : 842 915"
                  value={codeAcces}
                  onChange={(e) => setCodeAcces(e.target.value.replace(/[^0-9 ]/g, ''))}
                  maxLength={12}
                  autoFocus={!isMobile}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: isMobile ? '48px' : '52px',
                    borderRadius: '14px',
                    border: '1.5px solid rgba(148, 163, 184, 0.4)',
                    fontSize: isMobile ? '22px' : '25px',
                    fontWeight: '800',
                    textAlign: 'center',
                    letterSpacing: '0.15em',
                    color: '#0f172a',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.94)',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={joiningSession || !codeAcces.trim()}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#111827',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  cursor: joiningSession || !codeAcces.trim() ? 'not-allowed' : 'pointer',
                  opacity: joiningSession || !codeAcces.trim() ? 0.5 : 1,
                  boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.22)'
                }}
              >
                {joiningSession ? 'Connexion au salon...' : "Rejoindre l'inventaire du salon"}
              </button>
            </form>
          </div>
        )
      )}

      {/* SOUS-ONGLET 2 : LOGISTIQUE & STOCK TPE */}
      {subTab === 'tpe' && (
        <>
          <header
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'center' : 'flex-end',
              gap: '10px',
              marginBottom: isMobile ? '10px' : '20px'
            }}
          >
            <div style={{ minWidth: 0 }}>
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
                  Matériel d'Encaissement • Stripe Terminal
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
                Logistique & Stock TPE
              </h1>
              {!isMobile && (
                <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
                  Gérez votre inventaire de terminaux de paiement et commandez votre stock tampon pour vos installations.
                </span>
              )}
            </div>

            {(!isMobile || !data.alerte_penurie) && (
              <span
                className="sp-glass-pill"
                style={{
                  padding: isMobile ? '6px 11px' : '8px 15px',
                  borderRadius: '999px',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: '800',
                  color: data.alerte_penurie ? '#b45309' : '#059669',
                  border: data.alerte_penurie ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                  background: data.alerte_penurie ? 'rgba(245, 158, 11, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: data.alerte_penurie ? '#f59e0b' : '#10b981'
                  }}
                />
                <span>
                  {data.alerte_penurie ? `Réassort requis (${nbManquant} TPE)` : isMobile ? 'Stock OK' : 'Couverture matérielle optimale'}
                </span>
              </span>
            )}
          </header>

          {/* BANDEAU D'ALERTE PÉNURIE COMPACT */}
          {data.alerte_penurie && (
            <div
              className="sp-glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                padding: isMobile ? '10px 12px' : '14px 18px',
                marginBottom: isMobile ? '10px' : '20px',
                borderRadius: '18px',
                border: '1.5px solid rgba(239, 68, 68, 0.38)',
                background: 'linear-gradient(145deg, rgba(254, 242, 242, 0.94) 0%, rgba(255, 255, 255, 0.78) 100%)',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.14)',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div style={{ fontSize: isMobile ? '11.5px' : '13px', color: '#7f1d1d', lineHeight: 1.35, minWidth: 0 }}>
                  <strong style={{ color: '#991b1b', display: 'block', fontSize: isMobile ? '12px' : '13.5px' }}>
                    Réassort TPE requis ({nbManquant} manquant{nbManquant > 1 ? 's' : ''})
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
                  padding: isMobile ? '8px 12px' : '9px 16px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.35)'
                }}
              >
                Commander →
              </button>
            </div>
          )}

          {/* LES 4 KPIS LOGISTIQUES */}
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
                    background: 'rgba(15, 23, 42, 0.08)',
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon.Stock />
                </div>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    type="button"
                    onClick={() => ajusterStock(-1)}
                    className="sp-glass-pill"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '9px',
                      color: '#0f172a',
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
                    className="sp-glass-pill"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '9px',
                      color: '#0f172a',
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

              <div>
                <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                  {nbStock}
                </div>
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
                  TPE en stock
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
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    color: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon.Prospects />
                </div>
                <span style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9.5px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' }}>
                  Pipeline
                </span>
              </div>

              <div>
                <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                  {nbPrevus}
                </div>
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
                  Onboardings prévus
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
                    background: data.alerte_penurie ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                    border: data.alerte_penurie ? '1px solid rgba(239, 68, 68, 0.28)' : '1px solid rgba(16, 185, 129, 0.28)',
                    color: data.alerte_penurie ? '#dc2626' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {data.alerte_penurie ? <Icon.Zap /> : <Icon.Check />}
                </div>
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    background: data.alerte_penurie ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                    color: data.alerte_penurie ? '#dc2626' : '#059669'
                  }}
                >
                  {data.alerte_penurie ? 'À commander' : 'Complet'}
                </span>
              </div>

              <div>
                <div
                  style={{
                    fontSize: isMobile ? '16.5px' : '18px',
                    fontWeight: '800',
                    color: data.alerte_penurie ? '#dc2626' : '#059669',
                    lineHeight: 1.05,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {data.alerte_penurie ? `${nbManquant} TPE manquant${nbManquant > 1 ? 's' : ''}` : 'Stock complet'}
                </div>
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
                  Statut logistique
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
                    background: 'rgba(14, 165, 233, 0.14)',
                    border: '1px solid rgba(14, 165, 233, 0.28)',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon.Car />
                </div>
                <span className="sp-glass-pill" style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '9.5px', fontWeight: '700', color: '#64748b' }}>
                  {nbCommandesExpediees}/{(data.commandes || []).length} exp.
                </span>
              </div>

              <div>
                <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                  {totalTpeCommandes}
                </div>
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
                  TPE commandés
                </div>
              </div>
            </div>
          </div>

          {/* 4. GRILLE BENTO 2 COLONNES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1.15fr) minmax(0, 1fr)',
              gap: isMobile ? '12px' : '20px',
              alignItems: 'start',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* COLONNE GAUCHE : FORMULAIRE DE COMMANDE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
              <form
                onSubmit={commanderTpe}
                className="sp-glass-panel"
                style={{
                  padding: isMobile ? '15px 14px' : '24px',
                  borderRadius: isMobile ? '20px' : '24px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: isMobile ? '15.5px' : '17px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      Commander des TPE
                    </h2>
                    {!isMobile && (
                      <span style={{ fontSize: '12.5px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                        Expédition directe par la direction STACK pour vos prochaines installations.
                      </span>
                    )}
                  </div>
                  <span className="sp-glass-pill" style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {modeleTpe === 'STRIPE_S700' ? 'Stripe S700' : 'Stripe T600'}
                  </span>
                </div>

                {/* Sélecteur du modèle TPE (Sans écrasement du badge Comptoir/Mobile) */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                    Modèle de terminal
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setModeleTpe('STRIPE_T600')}
                      style={{
                        padding: '10px 11px',
                        borderRadius: '14px',
                        border: modeleTpe === 'STRIPE_T600' ? '2px solid #0f172a' : '1px solid rgba(148, 163, 184, 0.35)',
                        background: modeleTpe === 'STRIPE_T600' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '9.5px',
                          fontWeight: '800',
                          padding: '2px 7px',
                          borderRadius: '999px',
                          background: modeleTpe === 'STRIPE_T600' ? '#0f172a' : 'rgba(15, 23, 42, 0.08)',
                          color: modeleTpe === 'STRIPE_T600' ? '#ffffff' : '#475569',
                          marginBottom: '5px'
                        }}
                      >
                        Comptoir
                      </span>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>
                        Reader T600
                      </strong>
                      <span style={{ fontSize: '10.5px', color: '#64748b', lineHeight: 1.35, display: 'block' }}>
                        Écran 8" paysage & pourboires.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModeleTpe('STRIPE_S700')}
                      style={{
                        padding: '10px 11px',
                        borderRadius: '14px',
                        border: modeleTpe === 'STRIPE_S700' ? '2px solid #0f172a' : '1px solid rgba(148, 163, 184, 0.35)',
                        background: modeleTpe === 'STRIPE_S700' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '9.5px',
                          fontWeight: '800',
                          padding: '2px 7px',
                          borderRadius: '999px',
                          background: modeleTpe === 'STRIPE_S700' ? '#0f172a' : 'rgba(15, 23, 42, 0.08)',
                          color: modeleTpe === 'STRIPE_S700' ? '#ffffff' : '#475569',
                          marginBottom: '5px'
                        }}
                      >
                        Mobile
                      </span>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>
                        Reader S700
                      </strong>
                      <span style={{ fontSize: '10.5px', color: '#64748b', lineHeight: 1.35, display: 'block' }}>
                        Sans fil + imprimante ticket.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Quantité souhaitée : 5 colonnes sur 1 seule ligne */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
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
                            border: actif ? '1px solid #111827' : undefined,
                            backgroundColor: actif ? '#111827' : undefined,
                            color: actif ? '#ffffff' : '#0f172a',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {n} TPE
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Adresse de réception & Bouton Commander (Sans flex: 1 qui écrasait la hauteur sur iPhone) */}
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
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
                        height: '44px',
                        padding: '0 22px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#111827',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.22)'
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '20px', minWidth: 0 }}>
              <div
                className="sp-glass-panel"
                style={{
                  padding: isMobile ? '15px 14px' : '22px 24px',
                  borderRadius: isMobile ? '20px' : '24px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Icon.Stock />
                    <h3 style={{ margin: 0, fontSize: isMobile ? '15px' : '16px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      Suivi des expéditions ({(data.commandes || []).length})
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Envois
                  </span>
                </div>

                {!data.commandes || data.commandes.length === 0 ? (
                  <div
                    className="sp-glass-pill"
                    style={{
                      padding: '20px 14px',
                      borderRadius: '14px',
                      textAlign: 'center',
                      color: '#64748b',
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
                                borderRadius: '11px',
                                background: estExpediee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(99, 102, 241, 0.12)',
                                color: estExpediee ? '#059669' : '#4f46e5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Icon.Stock />
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <strong style={{ display: 'block', fontSize: '13.5px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cmd.quantite}x {modeleLabel}
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
                                {formatDate(cmd.date_commande)} • {cmd.adresse_livraison}
                              </span>
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              backgroundColor: estExpediee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                              color: estExpediee ? '#059669' : '#b45309',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            {estExpediee ? 'Expédié' : 'En préparation'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Carte 2 : Protocole logistique TPE (Repliable sur iPhone) */}
              <div
                className="sp-glass-panel"
                style={{
                  padding: isMobile ? '13px 14px' : '20px 22px',
                  borderRadius: isMobile ? '18px' : '24px',
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
                    <Icon.Shield />
                    <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '15.5px', fontWeight: '800', color: '#0f172a' }}>
                      Protocole Logistique TPE
                    </h3>
                  </div>
                  {isMobile && (
                    <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748b' }}>
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
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong style={{ display: 'block', fontSize: '12.5px', color: '#0f172a', marginBottom: '2px' }}>
                            {step.titre}
                          </strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
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
