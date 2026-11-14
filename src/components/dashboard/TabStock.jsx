// src/components/dashboard/TabStock.jsx
// Onglet Stock & TPE : Suivi du matériel, inventaire et commandes de terminaux en Verre Cristal

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

  const [subTab, setSubTab] = useState('tpe'); // 'tpe' | 'onboarding' (arrivee sur TPE par defaut)
  const [modeleTpe, setModeleTpe] = useState('STRIPE_T600'); // 'STRIPE_T600' | 'STRIPE_S700'
  const [codeAcces, setCodeAcces] = useState('');
  const [onboardingSession, setOnboardingSession] = useState(null);
  const [joiningSession, setJoiningSession] = useState(false);
  const [joinError, setJoinError] = useState(null);

  const rejoindreOnboarding = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = codeAcces.trim().replace(/\s+/g, '');
    if (!cleanCode || cleanCode.length < 4) {
      setJoinError("Code invalide (6 chiffres requis).");
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
      const data = await res.json();
      if (res.ok && data.session) {
        setOnboardingSession(data.session);
      } else {
        setJoinError(data.error || "Code introuvable ou expire.");
      }
    } catch (err) {
      setJoinError("Erreur reseau.");
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
    <div style={{ paddingBottom: isMobile ? '90px' : '28px' }}>
      <style>{`
        .sp-stock-row {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.68) 100%);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 16px;
          padding: 13px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }
        .sp-stock-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.08), inset 0 1px 0 #ffffff;
        }
        .sp-stock-input {
          width: 100%;
          box-sizing: border-box;
          height: 42px;
          padding: 0 14px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.32);
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }
        .sp-stock-input:focus {
          border-color: #0f172a;
          background: #ffffff;
        }
      `}</style>

      {/* Selecteur SubTab : Saisie Stock Salon (Onboarding) vs Suivi TPE */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '5px',
        background: 'rgba(15, 23, 42, 0.06)',
        borderRadius: '16px',
        marginBottom: '20px',
        maxWidth: '520px',
        margin: '0 auto 20px auto'
      }}>
        <button
          type="button"
          onClick={() => setSubTab('onboarding')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'onboarding' ? '#0f172a' : 'transparent',
            color: subTab === 'onboarding' ? '#ffffff' : '#64748b',
            fontSize: '12.5px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Saisie Stock Salon
        </button>

        <button
          type="button"
          onClick={() => setSubTab('tpe')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '12px',
            border: 'none',
            background: subTab === 'tpe' ? '#0f172a' : 'transparent',
            color: subTab === 'tpe' ? '#ffffff' : '#64748b',
            fontSize: '12.5px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          Mes TPE ({nbStock})
        </button>
      </div>

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
          <div style={{
            maxWidth: '520px',
            margin: '0 auto',
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '22px',
            padding: isMobile ? '22px 18px' : '32px 28px',
            boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '10px'
            }}>
              Onboarding Terrain
            </div>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>
              Saisie d Inventaire Salon
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              Demandez au gerant du salon d ouvrir l onglet Stock et de cliquer sur <strong>« Deleguer Onboarding (Code Agent) »</strong> pour obtenir son code d acces a 6 chiffres.
            </p>

            {joinError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: '#fee2e2',
                color: '#b91c1c',
                fontSize: '12.5px',
                fontWeight: '700',
                marginBottom: '16px'
              }}>
                {joinError}
              </div>
            )}

            <form noValidate onSubmit={rejoindreOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                  Code a 6 chiffres du gerant
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 842 915 ou 842915"
                  value={codeAcces}
                  onChange={e => setCodeAcces(e.target.value.replace(/[^0-9 ]/g, ''))}
                  maxLength={12}
                  autoFocus
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: '52px',
                    borderRadius: '14px',
                    border: '2px solid #cbd5e1',
                    fontSize: '26px',
                    fontWeight: '900',
                    textAlign: 'center',
                    letterSpacing: '0.15em',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#f8fafc',
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
                  borderRadius: '14px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: (joiningSession || !codeAcces.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.2)'
                }}
              >
                {joiningSession ? 'Connexion au salon...' : 'Rejoindre l inventaire du salon'}
              </button>
            </form>
          </div>
        )
      )}

      {subTab === 'tpe' && (
        <>
        {/* =================================================================== */}
        {/* 1. EN-TÊTE LOGISTIQUE & STOCK TPE                                   */}
        {/* =================================================================== */}
        <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
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
            Matériel d'Encaissement • Stripe Terminal
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
            Logistique & Stock TPE
          </h1>
          <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
            Gérez votre inventaire de terminaux de paiement et commandez votre stock tampon pour vos installations.
          </span>
        </div>

        <span
          className="sp-glass-pill"
          style={{
            padding: '8px 15px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '800',
            color: data.alerte_penurie ? '#b45309' : '#059669',
            border: data.alerte_penurie ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
            background: data.alerte_penurie ? 'rgba(245, 158, 11, 0.14)' : 'rgba(16, 185, 129, 0.14)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px'
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
            {data.alerte_penurie
              ? `Réassort requis (${nbManquant} TPE)`
              : 'Couverture matérielle optimale'}
          </span>
        </span>
      </header>

      {/* =================================================================== */}
      {/* 2. BANDEAU D'ALERTE PÉNURIE EN VERRE CRISTAL                        */}
      {/* =================================================================== */}
      {data.alerte_penurie && (
        <div
          className="sp-glass-panel"
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: '14px',
            padding: '14px 18px',
            marginBottom: '20px',
            borderRadius: '18px',
            border: '1.5px solid rgba(239, 68, 68, 0.38)',
            background: 'linear-gradient(145deg, rgba(254, 242, 242, 0.9) 0%, rgba(255, 255, 255, 0.72) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '11px',
                background: 'rgba(239, 68, 68, 0.14)',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: 1.45 }}>
              <strong style={{ color: '#991b1b', display: 'block', fontSize: '13.5px' }}>
                Réassort TPE requis
              </strong>
              <span>
                {nbManquant} terminal{nbManquant > 1 ? 'aux' : ''} manquant{nbManquant > 1 ? 's' : ''} pour couvrir vos {nbPrevus} installations en cours (Stock disponible : {nbStock} TPE).
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
              padding: '9px 16px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 6px 16px -4px rgba(220, 38, 38, 0.35)'
            }}
          >
            Commander {nbManquant} TPE →
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. LES 4 KPIS LOGISTIQUES EN VERRE CRISTAL                          */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '22px'
        }}
      >
        {/* KPI 1 : TPE en stock avec boutons - / + */}
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
              <Icon.Stock />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => ajusterStock(-1)}
                className="sp-glass-pill"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                title="Retirer 1 TPE installé en salon"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => ajusterStock(1)}
                className="sp-glass-pill"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  color: '#0f172a',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                title="Ajouter 1 TPE reçu"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbStock}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              TPE en stock
            </div>
          </div>
        </div>

        {/* KPI 2 : Onboardings prévus */}
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
              <Icon.Prospects />
            </div>
            <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800', background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' }}>
              Pipeline
            </span>
          </div>

          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbPrevus}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Onboardings prévus
            </div>
          </div>
        </div>

        {/* KPI 3 : Statut logistique */}
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
                background: data.alerte_penurie ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                border: data.alerte_penurie ? '1px solid rgba(239, 68, 68, 0.28)' : '1px solid rgba(16, 185, 129, 0.28)',
                color: data.alerte_penurie ? '#dc2626' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {data.alerte_penurie ? <Icon.Zap /> : <Icon.Check />}
            </div>
            <span
              style={{
                padding: '3px 9px',
                borderRadius: '999px',
                fontSize: '10.5px',
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
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '800',
                color: data.alerte_penurie ? '#dc2626' : '#059669',
                lineHeight: 1.2
              }}
            >
              {data.alerte_penurie
                ? `${nbManquant} ${nbManquant > 1 ? 'terminaux à commander' : 'terminal à commander'}`
                : 'Couverture complète'}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              Statut logistique
            </div>
          </div>
        </div>

        {/* KPI 4 : Expéditions suivies */}
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
                background: 'rgba(14, 165, 233, 0.14)',
                border: '1px solid rgba(14, 165, 233, 0.28)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon.Car />
            </div>
            <span className="sp-glass-pill" style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '700', color: '#64748b' }}>
              {nbCommandesExpediees}/{(data.commandes || []).length} exp.
            </span>
          </div>

          <div>
            <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {totalTpeCommandes}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>
              TPE commandés au total
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. GRILLE BENTO 2 COLONNES (COMMANDE & PROTOCOLE | SUIVI LOGISTIQUE)*/}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {/* COLONNE GAUCHE : FORMULAIRE DE COMMANDE + PROTOCOLE LOGISTIQUE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Carte 1 : Commander des terminaux TPE */}
          <form
            onSubmit={commanderTpe}
            className="sp-glass-panel"
            style={{ padding: isMobile ? '18px 16px' : '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  Commander des terminaux TPE
                </h2>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Expédition directe par la direction STACK pour vos prochaines installations.
                </span>
              </div>
              <span className="sp-glass-pill" style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>
                {modeleTpe === 'STRIPE_S700' ? 'Stripe Reader S700' : 'Stripe Reader T600'}
              </span>
            </div>

            {/* Sélecteur du modèle TPE : Stripe T600 vs Stripe S700 */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                Modèle de terminal
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModeleTpe('STRIPE_T600')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: modeleTpe === 'STRIPE_T600' ? '2px solid #0f172a' : '1px solid rgba(148, 163, 184, 0.35)',
                    background: modeleTpe === 'STRIPE_T600' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Stripe Reader T600</strong>
                    {modeleTpe === 'STRIPE_T600' && (
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 7px', borderRadius: '999px', background: '#0f172a', color: '#ffffff' }}>Comptoir</span>
                    )}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
                    Grand écran tactile 8" paysage avec pourboires dynamiques.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setModeleTpe('STRIPE_S700')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: modeleTpe === 'STRIPE_S700' ? '2px solid #0f172a' : '1px solid rgba(148, 163, 184, 0.35)',
                    background: modeleTpe === 'STRIPE_S700' ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>Stripe Reader S700</strong>
                    {modeleTpe === 'STRIPE_S700' && (
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 7px', borderRadius: '999px', background: '#0f172a', color: '#ffffff' }}>Mobile</span>
                    )}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
                    Terminal sans fil tout-en-un avec imprimante ticket thermique intégrée.
                  </span>
                </button>
              </div>
            </div>

            {/* Sélection rapide de la quantité en pilules */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                Quantité souhaitée
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 5, 10].map((n) => {
                  const actif = Number(quantite) === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantite(n)}
                      className={actif ? '' : 'sp-glass-pill'}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '999px',
                        border: actif ? '1px solid #111827' : undefined,
                        backgroundColor: actif ? '#111827' : undefined,
                        color: actif ? '#ffffff' : '#0f172a',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        transition: 'all 0.14s ease'
                      }}
                    >
                      {n} TPE
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Adresse de réception & Bouton Commander */}
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
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    height: '42px',
                    padding: '0 24px',
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
                  marginTop: '14px',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="sp-glass-panel" style={{ padding: isMobile ? '18px 16px' : '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon.Stock />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                Suivi des expéditions ({(data.commandes || []).length})
              </h3>
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b' }}>
              Historique des envois
            </span>
          </div>

          {!data.commandes || data.commandes.length === 0 ? (
            <div
              className="sp-glass-pill"
              style={{
                padding: '36px 16px',
                borderRadius: '16px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px'
              }}
            >
              Aucune commande de terminal enregistrée pour le moment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.commandes.map((cmd) => {
                const estExpediee = cmd.statut === 'EXPEDIEE';
                const modeleLabel = cmd.modele_tpe === 'STRIPE_S700' ? 'Stripe Reader S700' : 'Stripe Reader T600';
                return (
                  <div key={cmd.id_commande} className="sp-stock-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
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

                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                          {cmd.quantite}x {modeleLabel}
                        </strong>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '12px',
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
                        padding: '5px 11px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: estExpediee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.16)',
                        color: estExpediee ? '#059669' : '#b45309',
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

        {/* Carte 2 : Protocole logistique TPE */}
        <div className="sp-glass-panel" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Icon.Shield />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
              Protocole Logistique TPE
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
        </>
      )}
    </div>
  );
}
