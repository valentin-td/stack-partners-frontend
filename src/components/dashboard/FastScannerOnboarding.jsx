// src/components/dashboard/FastScannerOnboarding.jsx
// Interface Fast Scanner Onboarding pour l'Agent Commercial STACK Partners

import React, { useState, useEffect, useRef } from 'react';

export default function FastScannerOnboarding({ apiBaseUrl, token, session, onTerminer, isMobile }) {
  const [nbAjoutes, setNbAjoutes] = useState(session?.nb_articles_ajoutes || 0);
  const [codeManuel, setCodeManuel] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [produitDetecte, setProduitDetecte] = useState(null);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [savingProduit, setSavingProduit] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [closing, setClosing] = useState(false);

  const qrInstanceRef = useRef(null);
  const isLookupBusyRef = useRef(false);

  const emettreBip = (type = 'scan') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'valid' ? 1046.5 : 880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  const demarrerCamera = () => {
    const demarrer = () => {
      if (!window.Html5Qrcode) return;
      const elem = document.getElementById('partner-barcode-reader');
      if (!elem) return;

      try {
        if (qrInstanceRef.current) {
          qrInstanceRef.current.stop().catch(() => {}).finally(() => {
            lancerNouveauScan();
          });
        } else {
          lancerNouveauScan();
        }
      } catch (e) {}
    };

    const lancerNouveauScan = () => {
      try {
        const qr = new window.Html5Qrcode('partner-barcode-reader');
        qrInstanceRef.current = qr;
        qr.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 220, height: 110 } },
          (decodedText) => {
            if (!isLookupBusyRef.current) {
              traiterCodeEAN(decodedText);
            }
          },
          () => {}
        ).catch(() => {});
      } catch (e) {}
    };

    if (window.Html5Qrcode) {
      demarrer();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.onload = demarrer;
      document.body.appendChild(script);
    }
  };

  const arreterCamera = () => {
    if (qrInstanceRef.current) {
      try {
        qrInstanceRef.current.stop().catch(() => {}).finally(() => {
          qrInstanceRef.current = null;
        });
      } catch (e) {
        qrInstanceRef.current = null;
      }
    }
  };

  const traiterCodeEAN = async (rawCode) => {
    const code = String(rawCode || '').trim();
    if (!code || code.length < 4 || isLookupBusyRef.current) return;
    isLookupBusyRef.current = true;
    setLoadingLookup(true);
    setFeedback(null);
    emettreBip('scan');

    try {
      const res = await fetch(`${apiBaseUrl}/onboarding-stock/scan-ean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_delegation: session.id_delegation,
          code_barre: code
        })
      });

      const data = await res.json();
      if (res.ok && data?.produit) {
        const p = data.produit;
        const achatHT = p.prix_achat_ht ? parseFloat(p.prix_achat_ht) : 10.00;
        const venteTTC = p.prix_conseille_ttc ? parseFloat(p.prix_conseille_ttc) : Math.round((achatHT * 1.20 * 2.2) * 100) / 100;
        
        setProduitDetecte({
          nom: p.nom || `Produit ${code}`,
          marque: p.marque || '',
          code_barre: code,
          reference: code,
          prix_achat_ht: achatHT,
          prix_vente_ttc: venteTTC,
          stock_actuel: 6, // Quantite standard salon par defaut
          photo_url: p.photo_url || '',
          categorie: p.categorie || 'Soin',
          type_article: 'PRODUIT_REVENTE'
        });
      } else {
        // Produit inconnu, preparation d'une fiche vierge immediate
        setProduitDetecte({
          nom: '',
          marque: '',
          code_barre: code,
          reference: code,
          prix_achat_ht: 10.00,
          prix_vente_ttc: 26.40,
          stock_actuel: 6,
          photo_url: '',
          categorie: 'Soin',
          type_article: 'PRODUIT_REVENTE'
        });
      }
    } catch (e) {
      setFeedback({ type: 'err', msg: "Erreur lors de la recherche du code." });
    } finally {
      setLoadingLookup(false);
      isLookupBusyRef.current = false;
    }
  };

  const validerEtScannerSuivant = async (e) => {
    if (e) e.preventDefault();
    if (!produitDetecte || !produitDetecte.nom.trim()) {
      alert("Veuillez renseigner le nom du produit.");
      return;
    }

    setSavingProduit(true);
    try {
      const res = await fetch(`${apiBaseUrl}/onboarding-stock/ajouter-produit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_delegation: session.id_delegation,
          article: {
            nom: produitDetecte.nom,
            marque: produitDetecte.marque,
            code_barre: produitDetecte.code_barre,
            reference: produitDetecte.code_barre,
            prix: produitDetecte.prix_vente_ttc,
            prix_achat_ht: produitDetecte.prix_achat_ht,
            prix_conseille_ttc: produitDetecte.prix_vente_ttc,
            stock_actuel: produitDetecte.stock_actuel,
            photo_url: produitDetecte.photo_url,
            type_article: 'PRODUIT_REVENTE'
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        emettreBip('valid');
        setNbAjoutes(data.nb_articles_ajoutes || (nbAjoutes + 1));
        setFeedback({ type: 'ok', msg: `x${produitDetecte.stock_actuel} "${produitDetecte.nom}" enregistre !` });
        
        // Reinitialisation immediate pour continuer a scanner sans interruption
        setProduitDetecte(null);
        setCodeManuel('');

        // Remettre directement la camera en ecoute active
        setTimeout(() => {
          demarrerCamera();
        }, 120);
      } else {
        alert(data.error || "Erreur enregistrement.");
      }
    } catch (err) {
      alert("Erreur reseau.");
    } finally {
      setSavingProduit(false);
    }
  };

  const validerEtCloreInterface = async () => {
    if (!window.confirm("Voulez-vous valider et clore definitivement l inventaire de ce salon ?")) return;
    setClosing(true);
    arreterCamera();

    try {
      const res = await fetch(`${apiBaseUrl}/onboarding-stock/terminer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_delegation: session.id_delegation
        })
      });

      if (res.ok) {
        onTerminer?.();
      } else {
        onTerminer?.();
      }
    } catch (e) {
      onTerminer?.();
    } finally {
      setClosing(false);
    }
  };

  // Verification en temps reel que la delegation est toujours active (si le gerant la ferme ou active sa caisse)
  useEffect(() => {
    const verifInterval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/onboarding-stock/session/${session.id_delegation}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && !data.actif) {
          arreterCamera();
          alert("L acces a ce salon a ete cloture par le gerant ou la caisse a ete activee.");
          onTerminer?.();
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(verifInterval);
  }, [session.id_delegation]);

  useEffect(() => {
    demarrerCamera();
    return () => {
      arreterCamera();
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '520px',
      margin: '0 auto',
      paddingBottom: isMobile ? '80px' : '20px'
    }}>
      {/* Header compact sticky avec bouton Valider et clore */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '18px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Inventaire Onboarding
          </div>
          <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.nom_salon}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '800' }}>
            {nbAjoutes} article(s) ajoute(s)
          </div>
        </div>

        <button
          type="button"
          onClick={validerEtCloreInterface}
          disabled={closing}
          style={{
            background: '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '9px 14px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '800',
            cursor: closing ? 'not-allowed' : 'pointer',
            flexShrink: 0
          }}
        >
          {closing ? 'Cloture...' : 'Valider et clore'}
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '8px 12px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: '700',
          background: feedback.type === 'ok' ? '#dcfce7' : '#fee2e2',
          color: feedback.type === 'ok' ? '#15803d' : '#b91c1c'
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Camera Video Viewfinder */}
      <div style={{
        background: '#090d16',
        borderRadius: '18px',
        overflow: 'hidden',
        position: 'relative',
        border: '1.5px solid #1e293b',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
      }}>
        <div
          id="partner-barcode-reader"
          style={{
            width: '100%',
            height: isMobile ? '160px' : '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '12px'
          }}
        >
          Chargement camera...
        </div>

        {loadingLookup && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '800'
          }}>
            Recherche du produit...
          </div>
        )}
      </div>

      {/* Saisie rapide manuelle / douchette EAN */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Saisir ou biper un code EAN..."
          value={codeManuel}
          onChange={e => setCodeManuel(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              traiterCodeEAN(codeManuel);
            }
          }}
          style={{
            flex: 1,
            height: '38px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: '600',
            outline: 'none',
            background: '#ffffff',
            color: '#0f172a'
          }}
        />
        <button
          type="button"
          onClick={() => traiterCodeEAN(codeManuel)}
          style={{
            padding: '0 16px',
            height: '38px',
            borderRadius: '10px',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Biper
        </button>
      </div>

      {/* FICHE PRODUIT SCANNEE — TOUT VISIBLE INSTANTANEMENT SANS AUCUN SCROLL */}
      {produitDetecte && (
        <form
          onSubmit={validerEtScannerSuivant}
          style={{
            background: '#ffffff',
            border: '1.5px solid #2563eb',
            borderRadius: '18px',
            padding: '12px 14px',
            boxShadow: '0 12px 30px -8px rgba(37, 99, 235, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* Ligne 1 : Packshot + Nom + Marque (sans zoom excessif, cadrage contain propre) */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {produitDetecte.photo_url ? (
                <img
                  src={produitDetecte.photo_url}
                  alt={produitDetecte.nom}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-badge');
                    if (fallback) fallback.style.display = 'inline';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }}
                />
              ) : null}
              <span
                className="fallback-badge"
                style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '800', display: produitDetecte.photo_url ? 'none' : 'inline' }}
              >
                PHOTO
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                type="text"
                value={produitDetecte.nom}
                onChange={e => setProduitDetecte({ ...produitDetecte, nom: e.target.value })}
                placeholder="Nom du produit..."
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '5px 8px',
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#0f172a',
                  marginBottom: '4px'
                }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={produitDetecte.marque}
                  onChange={e => setProduitDetecte({ ...produitDetecte, marque: e.target.value })}
                  placeholder="Marque"
                  style={{
                    flex: 1,
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    fontSize: '11px',
                    color: '#64748b'
                  }}
                />
                <span style={{ fontSize: '10px', fontWeight: '800', background: '#f1f5f9', padding: '3px 6px', borderRadius: '6px', color: '#475569' }}>
                  {produitDetecte.code_barre}
                </span>
              </div>
            </div>
          </div>

          {/* Selecteur Type : Revente caisse vs Labo / Technique */}
          <div style={{
            background: '#e2e8f0',
            padding: '2px',
            borderRadius: '999px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setProduitDetecte({ ...produitDetecte, type_article: 'PRODUIT_REVENTE' })}
              style={{
                height: '26px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '10.5px',
                fontWeight: '800',
                cursor: 'pointer',
                background: produitDetecte.type_article !== 'CONSOMMABLE' ? '#0f172a' : 'transparent',
                color: produitDetecte.type_article !== 'CONSOMMABLE' ? '#ffffff' : '#64748b'
              }}
            >
              Revente caisse
            </button>
            <button
              type="button"
              onClick={() => setProduitDetecte({ ...produitDetecte, type_article: 'CONSOMMABLE' })}
              style={{
                height: '26px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '10.5px',
                fontWeight: '800',
                cursor: 'pointer',
                background: produitDetecte.type_article === 'CONSOMMABLE' ? '#0f172a' : 'transparent',
                color: produitDetecte.type_article === 'CONSOMMABLE' ? '#ffffff' : '#64748b'
              }}
            >
              Labo / Technique
            </button>
          </div>

          {/* Ligne 2 : Prix Achat HT, Prix Vente TTC, Quantite sur une seule ligne compacte */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '800', color: '#64748b', marginBottom: '2px' }}>
                Achat HT
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={produitDetecte.prix_achat_ht}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setProduitDetecte({
                    ...produitDetecte,
                    prix_achat_ht: val,
                    prix_vente_ttc: Math.round((val * 1.20 * 2.2) * 100) / 100
                  });
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '34px',
                  padding: '0 6px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '700',
                  textAlign: 'center'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '800', color: '#64748b', marginBottom: '2px' }}>
                Vente TTC (x2.2)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={produitDetecte.prix_vente_ttc}
                onChange={e => setProduitDetecte({ ...produitDetecte, prix_vente_ttc: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  height: '34px',
                  padding: '0 6px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#16a34a',
                  textAlign: 'center'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10.5px', fontWeight: '800', color: '#64748b', marginBottom: '2px' }}>
                Stock Initial
              </label>
              <div style={{ display: 'flex', alignItems: 'center', height: '34px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setProduitDetecte({ ...produitDetecte, stock_actuel: Math.max(0, (parseInt(produitDetecte.stock_actuel, 10) || 0) - 1) })}
                  style={{ width: '28px', height: '100%', border: 'none', background: '#f1f5f9', fontWeight: '800', cursor: 'pointer' }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={produitDetecte.stock_actuel}
                  onChange={e => setProduitDetecte({ ...produitDetecte, stock_actuel: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  style={{ flex: 1, height: '100%', border: 'none', textAlign: 'center', fontWeight: '800', fontSize: '13px', minWidth: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setProduitDetecte({ ...produitDetecte, stock_actuel: (parseInt(produitDetecte.stock_actuel, 10) || 0) + 1 })}
                  style={{ width: '28px', height: '100%', border: 'none', background: '#f1f5f9', fontWeight: '800', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Raccourcis quantite 1-tap */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {[1, 3, 6, 12].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setProduitDetecte({ ...produitDetecte, stock_actuel: preset })}
                style={{
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  border: '1px solid #e2e8f0',
                  background: produitDetecte.stock_actuel === preset ? '#2563eb' : '#f8fafc',
                  color: produitDetecte.stock_actuel === preset ? '#ffffff' : '#334155',
                  cursor: 'pointer'
                }}
              >
                {preset} u.
              </button>
            ))}
          </div>

          {/* Actions : Annuler & Valider / scanner suivant */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setProduitDetecte(null);
                setCodeManuel('');
                demarrerCamera();
              }}
              style={{
                padding: '11px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={savingProduit}
              style={{
                padding: '11px',
                borderRadius: '12px',
                border: 'none',
                background: '#16a34a',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '900',
                cursor: savingProduit ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 16px -4px rgba(22, 163, 74, 0.4)'
              }}
            >
              {savingProduit ? 'Enregistrement...' : 'Valider & suivant'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
