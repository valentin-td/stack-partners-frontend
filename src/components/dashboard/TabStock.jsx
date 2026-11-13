// src/components/dashboard/TabStock.jsx
// Onglet Stock & TPE : Suivi du materiel, inventaire et commandes de terminaux

import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatters';

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
        body: JSON.stringify({ quantite, adresse_livraison: adresse })
      });
      const out = await res.json();
      if (res.ok) {
        setFeedback({ type: 'ok', text: out.message });
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

  if (loading) {
    return (
      <div style={{ padding: '32px', color: '#6b7280', fontSize: '13.5px' }}>
        Chargement de votre inventaire...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ marginBottom: isMobile ? '4px' : '8px' }}>
        <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>
          Logistique & Stock TPE
        </h1>
        <span style={{ fontSize: '13.5px', color: '#6b7280' }}>
          Gérez vos terminaux de paiement pour vos installations.
        </span>
      </div>

      {data.alerte_penurie && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '14px 18px',
            borderRadius: '14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div style={{ fontSize: '13.5px', lineHeight: '1.4' }}>
              <strong>Stock TPE insuffisant pour vos prochains onboardings</strong> — Vous avez {data.onboardings_prevus} salon(s) en cours pour {data.tpe_stock} terminal disponible. Il vous manque {data.manquant} TPE.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TPE en stock
            </span>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginTop: '6px' }}>
              {data.tpe_stock}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => ajusterStock(-1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#111827', fontWeight: '700', cursor: 'pointer' }}
              title="Retirer 1 TPE installé"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => ajusterStock(1)}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#f9fafb', color: '#111827', fontWeight: '700', cursor: 'pointer' }}
              title="Ajouter 1 TPE reçu"
            >
              +
            </button>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Onboardings prévus
          </span>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginTop: '6px' }}>
            {data.onboardings_prevus}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Statut logistique
          </span>
          <div style={{ fontSize: '15px', fontWeight: '700', color: data.alerte_penurie ? '#dc2626' : '#16a34a', marginTop: '14px' }}>
            {data.alerte_penurie ? `${data.manquant} terminal à commander` : 'Couverture complète'}
          </div>
        </div>
      </div>

      <form onSubmit={commanderTpe} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '22px' }}>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>
          Commander des terminaux TPE
        </div>
        <div style={{ fontSize: '12.5px', color: '#6b7280', marginBottom: '16px' }}>
          Expédition directe par la direction STACK pour vos prochaines installations.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '110px 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
              Quantité
            </label>
            <select
              value={quantite}
              onChange={(e) => setQuantite(Number(e.target.value))}
              style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '13.5px', fontWeight: '700', color: '#111827' }}
            >
              {[1, 2, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} TPE
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
              Adresse de réception
            </label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Numéro, rue, code postal et ville"
              required
              style={{ width: '100%', boxSizing: 'border-box', height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '13.5px', color: '#111827' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ height: '40px', padding: '0 20px', borderRadius: '10px', border: 'none', background: '#111827', color: '#ffffff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
          >
            {submitting ? 'Envoi...' : 'Commander'}
          </button>
        </div>
        {feedback && (
          <div style={{ marginTop: '12px', fontSize: '12.5px', fontWeight: '600', color: feedback.type === 'ok' ? '#16a34a' : '#dc2626' }}>
            {feedback.text}
          </div>
        )}
      </form>

      {data.commandes?.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>
            Suivi des expéditions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.commandes.map((cmd) => (
              <div
                key={cmd.id_commande}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#f9fafb',
                  fontSize: '13px'
                }}
              >
                <div>
                  <strong style={{ color: '#111827' }}>{cmd.quantite} TPE Stripe</strong>
                  <span style={{ color: '#6b7280', marginLeft: '10px' }}>
                    {formatDate(cmd.date_commande)} • {cmd.adresse_livraison}
                  </span>
                </div>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    background: cmd.statut === 'EXPEDIEE' ? '#dcfce7' : '#f3f4f6',
                    color: cmd.statut === 'EXPEDIEE' ? '#166534' : '#4b5563'
                  }}
                >
                  {cmd.statut === 'EXPEDIEE' ? 'Expédié' : 'En préparation'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
