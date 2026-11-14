// src/components/dashboard/ModalSignatureContrat.jsx
// Modal de consultation et de signature electronique native du contrat de mandat commercial
// Conforme Code de commerce (L.134-1 a L.134-17), Code civil (art. 1366 & 1367) et eIDAS

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../common/Icons';

export default function ModalSignatureContrat({
  isOpen,
  onClose,
  profilData = {},
  contratData = null,
  onSignerContrat,
  onTelechargerPdf,
  isSigning = false,
  isMobile = false
}) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [consentementLu, setConsentementLu] = useState(false);
  const [hasSignedCanvas, setHasSignedCanvas] = useState(false);

  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const readerRef = useRef(null);

  const isContratDejaSigne = Boolean(profilData.contrat_signe && profilData.statut_contrat === 'VALIDE');

  // Coordonnees relatives sur le canvas
  const getCanvasCoords = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (isContratDejaSigne) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.cancelable) e.preventDefault();
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
    setHasSignedCanvas(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current || isContratDejaSigne) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.cancelable) e.preventDefault();
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const effacerSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignedCanvas(false);
  };

  const handleScrollReader = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
      setHasScrolledToBottom(true);
    }
  };

  const validerEtSoumettre = async () => {
    if (isContratDejaSigne) {
      onClose();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || !hasSignedCanvas) {
      alert("Veuillez apposer votre signature manuscrite dans le cadre prévu.");
      return;
    }
    if (!consentementLu) {
      alert("Veuillez cocher la case attestant de la lecture et de l'acceptation sans réserve des clauses du mandat.");
      return;
    }

    const signatureBase64 = canvas.toDataURL('image/png');
    await onSignerContrat({
      signature_base64: signatureBase64,
      consentement_lu: true
    });
  };

  // Reinitialiser l'etat a l'ouverture
  useEffect(() => {
    if (isOpen) {
      setConsentementLu(false);
      setHasSignedCanvas(false);
      setHasScrolledToBottom(false);
      setTimeout(() => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nomAgent = `${profilData.prenom || ''} ${profilData.nom || ''}`.trim() || 'Agent commercial';
  const codeAgent = profilData.code_partenaire || 'En attribution';
  const articles = contratData?.articles || [
    { num: 1, titre: "OBJET DU MANDAT ET MISSION", texte: "Le Mandant confie au Mandataire, qui l'accepte, le mandat d'intérêt commun de négocier, promouvoir et conclure des contrats d'abonnement et de prestation de services relatifs à la suite logicielle « STACK » auprès des salons de coiffure et instituts de beauté." },
    { num: 2, titre: "STATUT JURIDIQUE ET INDÉPENDANCE", texte: "Le Mandataire exerce son activité sous le statut d'agent commercial indépendant (art. L.134-1 et suivants du Code de commerce), sans aucun lien de subordination ni horaires imposés." },
    { num: 3, titre: "CONDITION SUSPENSIVE D'IMMATRICULATION AU RSAC", texte: "Le présent contrat est conclu sous la condition suspensive expresse de l'immatriculation du Mandataire au Registre Spécial des Agents Commerciaux (RSAC) conformément à l'article L.134-6 du Code de commerce." },
    { num: 4, titre: "RÉMUNÉRATION, COMMISSIONS ET FORFAIT ONBOARDING", texte: "Commission récurrente de 20 % HT assise sur les abonnements logiciels payants des salons affiliés pendant 24 mois continus dès encaissement effectif. Forfait d'installation et d'onboarding terrain de 99,00 € HT par salon équipé sur facture. Seuil d'activation du récurrent fixé à 3 salons affiliés actifs." },
    { num: 5, titre: "MODALITÉS DE FACTURATION ET PAIEMENT", texte: "Facturation mensuelle via le portail STACK Partners avec mentions légales (SIRET, RSAC, TVA, IBAN). Règlement sous 30 jours." },
    { num: 6, titre: "LOYAUTÉ, NON-CONCURRENCE ET DÉONTOLOGIE", texte: "Obligation de loyauté. Interdiction de promouvoir des logiciels de caisse concurrents pendant l'exécution du mandat sans accord écrit du Mandant." },
    { num: 7, titre: "CONFIDENTIALITÉ ET SECRET DES AFFAIRES", texte: "Secret professionnel absolu pendant le contrat et cinq (5) ans après son terme sur les tarifs, fichiers clients et procédés techniques." },
    { num: 8, titre: "DURÉE DU MANDAT, PRÉAVIS ET RÉSILIATION", texte: "Mandat à durée indéterminée. Préavis de résiliation conforme à l'article L.134-11 du Code de commerce. Résiliation immédiate de plein droit en cas de faute grave." },
    { num: 9, titre: "CONVENTION DE PREUVE ÉLECTRONIQUE (ART. 1366 & 1367 CODE CIVIL)", texte: "Validité de la signature électronique et opposabilité du dossier de preuve horodaté, adresse IP, User-Agent et empreinte cryptographique SHA-256." },
    { num: 10, titre: "DROIT APPLICABLE ET ATTRIBUTION DE JURIDICTION", texte: "Droit français. Compétence expresse attribuée aux tribunaux compétents dans le ressort du siège social du Mandant." }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '12px' : '24px',
        overflowY: 'auto'
      }}
    >
      <div
        className="sp-glass-panel"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.9)'
        }}
      >
        {/* EN-TETE MODAL */}
        <div
          style={{
            padding: isMobile ? '16px 20px' : '22px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '999px'
                }}
              >
                Cadre Légal • Code de commerce L.134-1+
              </span>
              {isContratDejaSigne && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: '#059669',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon.Check /> Scellé et Archivé
                </span>
              )}
            </div>
            <h2 style={{ margin: 0, fontSize: isMobile ? '17px' : '20px', fontWeight: '800', color: '#0f172a' }}>
              Contrat de Mandat Commercial Indépendant
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la modal"
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: '700',
              fontSize: '14px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* CORPS DE DEFILEMENT DU CONTRAT */}
        <div
          ref={readerRef}
          onScroll={handleScrollReader}
          style={{
            padding: isMobile ? '18px 16px' : '24px 28px',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#ffffff'
          }}
        >
          {/* CARTOUCHES DES PARTIES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            {/* MANDANT */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>
                Le Mandant
              </span>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', marginTop: '3px' }}>
                STACK SAS
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.5, marginTop: '4px' }}>
                RCS Strasbourg B 912 458 921<br />
                SIRET : 912 458 921 00014<br />
                14 Place Kléber, 67000 Strasbourg<br />
                Représentée par M. Valentin TARDY, Président
              </div>
            </div>

            {/* MANDATAIRE */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>
                Le Mandataire (Agent Commercial)
              </span>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', marginTop: '3px' }}>
                {nomAgent}
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.5, marginTop: '4px' }}>
                Code Partenaire : {codeAgent}<br />
                RSAC : {profilData.numero_rsac || 'Condition suspensive (Étape 2)'}<br />
                SIRET : {profilData.siret_agent || 'En cours d\'attribution'}<br />
                Email : {profilData.email || 'Adresse de compte'}
              </div>
            </div>
          </div>

          {/* PREAMBULE */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px 14px', borderRadius: '12px', marginBottom: '18px', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
              PRÉAMBULE & FONDEMENT LÉGAL
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.55 }}>
              Le Mandant développe et édite la solution logicielle intégrée STACK, certifiée pour l'organisation et l'encaissement des salons de coiffure et barbiers. Le Mandataire agit en qualité d'agent commercial indépendant chargé de développer le portefeuille de salons souscrits, dans le respect des articles L.134-1 et suivants du Code de commerce.
            </p>
          </div>

          {/* LISTE DES 10 ARTICLES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {articles.map((art) => (
              <div key={art.num} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                  ARTICLE {art.num} — {art.titre}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {art.texte}
                </div>
              </div>
            ))}
          </div>

          {/* SECTION SIGNATURE OU RECAPITULATIF DE PREUVE */}
          {isContratDejaSigne ? (
            <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: '800', fontSize: '14px', marginBottom: '10px' }}>
                <Icon.Check /> Contrat de mandat officiellement signé et scellé
              </div>
              <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                <div><strong>Référence de scellement :</strong> {profilData.certificat_contrat_ref || 'STACK-MANDAT-VALIDE'}</div>
                <div><strong>Horodatage certifié :</strong> {profilData.date_signature_contrat ? new Date(profilData.date_signature_contrat).toLocaleString('fr-FR') : 'Date enregistrée'}</div>
                <div><strong>Empreinte SHA-256 :</strong> <code style={{ fontSize: '11px' }}>{profilData.hash_contrat || 'Hash scellé'}</code></div>
              </div>
              {profilData.signature_contrat_base64 && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '6px' }}>
                    Signature manuscrite apposée :
                  </div>
                  <img
                    src={profilData.signature_contrat_base64}
                    alt="Signature de l'agent"
                    style={{ maxHeight: '60px', border: '1px solid #bbf7d0', borderRadius: '8px', backgroundColor: '#ffffff', padding: '4px' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* ATTESTATION SUR L'HONNEUR & CONSENTEMENT */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  border: `1.5px solid ${consentementLu ? '#2563eb' : '#cbd5e1'}`,
                  cursor: 'pointer',
                  marginBottom: '16px'
                }}
              >
                <input
                  type="checkbox"
                  checked={consentementLu}
                  onChange={(e) => setConsentementLu(e.target.checked)}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#1e293b', lineHeight: 1.5, fontWeight: '600' }}>
                  Je reconnais avoir pris connaissance de l'intégralité du présent contrat de mandat d'intérêt commun (Articles 1 à 10), en accepter sans réserve les clauses (notamment la commission récurrente de 20 % HT pendant 24 mois et le forfait onboarding de 99 € HT), et atteste agir sous le statut d'agent commercial indépendant soumis aux articles 1366 et 1367 du Code civil.
                </span>
              </label>

              {/* PAVE DE SIGNATURE CANVAS */}
              <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a' }}>
                    Apposez votre signature manuscrite :
                  </span>
                  {hasSignedCanvas && (
                    <button
                      type="button"
                      onClick={effacerSignature}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Effacer / Recommencer
                    </button>
                  )}
                </div>

                <div
                  style={{
                    position: 'relative',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: `1.5px dashed ${hasSignedCanvas ? '#10b981' : '#94a3b8'}`,
                    height: '130px',
                    overflow: 'hidden',
                    touchAction: 'none'
                  }}
                >
                  {!hasSignedCanvas && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                        color: '#94a3b8',
                        fontSize: '12.5px',
                        fontWeight: '600'
                      }}
                    >
                      Signez ici avec votre souris ou votre doigt
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={130}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    style={{ width: '100%', height: '130px', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
                  />
                </div>
              </div>

              {/* BANDEAU DE CONFORMITE TECHNIQUE & PREUVE */}
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5, padding: '0 4px' }}>
                En validant, un certificat de scellement électronique eIDAS est généré contenant votre horodatage certifié UTC, votre adresse IP source, l'empreinte cryptographique SHA-256 du contrat et votre signature numérisée.
              </div>
            </div>
          )}
        </div>

        {/* PIED DE MODAL & ACTIONS */}
        <div
          style={{
            padding: isMobile ? '14px 16px' : '18px 28px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="sp-glass-pill"
            style={{ padding: '10px 18px', borderRadius: '999px', fontSize: '12.5px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
          >
            Fermer
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isContratDejaSigne ? (
              <button
                type="button"
                onClick={onTelechargerPdf}
                style={{
                  padding: '11px 22px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Icon.FileDownload /> Télécharger mon contrat signé (PDF)
              </button>
            ) : (
              <button
                type="button"
                onClick={validerEtSoumettre}
                disabled={isSigning || !consentementLu || !hasSignedCanvas}
                style={{
                  padding: '12px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: !consentementLu || !hasSignedCanvas ? '#94a3b8' : '#059669',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: !consentementLu || !hasSignedCanvas || isSigning ? 'not-allowed' : 'pointer',
                  boxShadow: !consentementLu || !hasSignedCanvas ? 'none' : '0 8px 20px -4px rgba(5, 150, 105, 0.4)'
                }}
              >
                <Icon.Check /> {isSigning ? 'Scellement cryptographique...' : 'Valider et sceller mon contrat'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
