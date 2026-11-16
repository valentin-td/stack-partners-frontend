// src/components/dashboard/TabGodMode.jsx
// Onglet 7 : God Mode (Super-Admin) - Audit des pieces KYC, validation commissions, logistique TPE

import { useState } from 'react';
import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';

export default function TabGodMode({
  adminAgents,
  adminCommissions,
  adminTpeCommandes,
  adminMarketStats,
  adminSearch,
  setAdminSearch,
  adminStatusFilter,
  setAdminStatusFilter,
  expandedAgentIds,
  setExpandedAgentIds,
  filteredAdminAgents,
  totalPendingPieces,
  totalCommissionsToPay,
  getAgentPiecesList,
  handleVerifyPieceAdmin,
  handlePayCommission,
  handleExpedierTpe,
  openUploadedDocument,
  fetchAdminData,
  isMobile,
  isSmall,
  primaryBtn,
  secondaryBtn,
  inputStyle,
  cardStyle
}) {
  const [commandeAExpedier, setCommandeAExpedier] = useState(null);
  const [transporteurChoisi, setTransporteurChoisi] = useState('Colissimo');
  const [numeroSuiviSaisi, setNumeroSuiviSaisi] = useState('');
  const [envoiExpeditionEnCours, setEnvoiExpeditionEnCours] = useState(false);

  const ouvrirModaleExpedition = (cmd) => {
    setCommandeAExpedier(cmd);
    setTransporteurChoisi(cmd.transporteur || 'Colissimo');
    setNumeroSuiviSaisi(cmd.numero_suivi || '');
  };

  const validerExpeditionModal = async (e) => {
    if (e) e.preventDefault();
    if (!commandeAExpedier) return;
    setEnvoiExpeditionEnCours(true);
    try {
      const ok = await handleExpedierTpe(commandeAExpedier.id_commande, {
        transporteur: transporteurChoisi,
        numero_suivi: numeroSuiviSaisi
      });
      if (ok !== false) {
        setCommandeAExpedier(null);
      }
    } finally {
      setEnvoiExpeditionEnCours(false);
    }
  };

  return (
    <>
      {/* En-tete Executive Noir & Argent */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          borderRadius: isMobile ? '18px' : '24px',
          padding: isMobile ? '20px 18px' : '28px 32px',
          color: '#ffffff',
          marginBottom: '20px',
          boxShadow: '0 12px 30px rgba(17, 24, 39, 0.14)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '14px'
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255,255,255,0.12)',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}
            >
              <Icon.Shield /> Super-Admin • Contrôle Réglementaire & Trésorerie
            </div>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              God Mode STACK Partners
            </h1>
            <div style={{ fontSize: '13.5px', color: '#9ca3af' }}>
              Auditez les pièces légales de vos agents, débloquez les droits de vente et validez vos virements de commissions.
            </div>
          </div>
          <button
            type="button"
            onClick={fetchAdminData}
            style={{
              ...secondaryBtn,
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              alignSelf: isMobile ? 'stretch' : 'auto'
            }}
          >
            Actualiser les dossiers
          </button>
        </div>

        {/* 4 KPIs Super-Admin */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '12px',
            marginTop: '22px'
          }}
        >
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Agents Inscrits</div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{adminAgents.length}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Agents Autorisés</div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#4ade80' }}>
              {adminAgents.filter((a) => a.statut_compte === 'ACTIF').length}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Pièces à Auditer</div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#fbbf24' }}>{totalPendingPieces}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Virements à Émettre</div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>
              {totalCommissionsToPay} <span style={{ fontSize: '13px', color: '#9ca3af' }}>€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres d'audit */}
      <div
        style={{
          ...cardStyle,
          padding: isMobile ? '14px' : '16px 20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px'
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Rechercher un agent (nom, e-mail, code PARTNER, SIRET)..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'TOUS', label: `Tous (${adminAgents.length})` },
            { key: 'A_VERIFIER', label: `À vérifier (${adminAgents.filter((a) => a.statut_compte !== 'ACTIF').length})` },
            { key: 'ACTIFS', label: `Actifs (${adminAgents.filter((a) => a.statut_compte === 'ACTIF').length})` },
            { key: 'BLOQUES', label: `Bloqués (${adminAgents.filter((a) => a.statut_compte === 'BLOQUE_CONFORMITE').length})` }
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setAdminStatusFilter(f.key)}
              style={{
                padding: '8px 13px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                border: adminStatusFilter === f.key ? '1px solid #111827' : '1px solid #e5e7eb',
                backgroundColor: adminStatusFilter === f.key ? '#111827' : '#ffffff',
                color: adminStatusFilter === f.key ? '#ffffff' : '#374151'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des dossiers Agents */}
      {filteredAdminAgents.map((a) => {
        const pieces = getAgentPiecesList(a);
        const nbValides = pieces.filter((p) => p.val === 'VALIDE').length;
        const pctConforme = Math.round((nbValides / pieces.length) * 100);
        const isExpanded = !!expandedAgentIds[a.id_agent];
        const isActif = a.statut_compte === 'ACTIF';
        const isBloque = a.statut_compte === 'BLOQUE_CONFORMITE';

        return (
          <div key={a.id_agent} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                padding: isMobile ? '16px' : '20px 24px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: '16px',
                borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    flexShrink: 0,
                    backgroundColor: isActif ? '#dcfce7' : isBloque ? '#fef2f2' : '#f3f4f6',
                    color: isActif ? '#166534' : isBloque ? '#dc2626' : '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '16px'
                  }}
                >
                  {(a.prenom?.[0] || a.nom?.[0] || 'A').toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '16.5px', fontWeight: '800', color: '#111827', textTransform: 'capitalize' }}>
                      {a.prenom} {a.nom}
                    </span>
                    <span style={{ fontSize: '11.5px', fontFamily: 'monospace', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#f3f4f6', color: '#374151' }}>
                      {a.code_partenaire}
                    </span>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        backgroundColor: isActif ? '#dcfce7' : isBloque ? '#fef2f2' : '#fef3c7',
                        color: isActif ? '#166534' : isBloque ? '#dc2626' : '#92400e'
                      }}
                    >
                      {isActif ? 'Compte Actif' : isBloque ? 'Bloqué' : 'En attente de validation'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <span>{a.email}</span>
                    <span>• Tél : {a.telephone || 'Non renseigné'}</span>
                    <span>• SIRET : {a.siret_agent || 'N/A'} ({a.forme_juridique || 'EI'})</span>
                  </div>
                </div>
              </div>

              {/* Barre de progression + Boutons */}
              <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center', gap: '10px' }}>
                <div style={{ minWidth: '140px', textAlign: isSmall ? 'left' : 'right', marginRight: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>
                    {nbValides} / {pieces.length} pièces validées
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                    <div
                      style={{
                        width: `${pctConforme}%`,
                        height: '100%',
                        backgroundColor: pctConforme === 100 ? '#16a34a' : '#111827',
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedAgentIds((prev) => ({ ...prev, [a.id_agent]: !prev[a.id_agent] }))}
                  style={secondaryBtn}
                >
                  {isExpanded ? 'Masquer les pièces' : 'Auditer les 9 pièces'}
                </button>

                {!isActif ? (
                  <button
                    type="button"
                    onClick={() => handleVerifyPieceAdmin(a.id_agent, 'STATUT_COMPTE_FINAL', 'ACTIF')}
                    style={{ ...primaryBtn, padding: '9px 14px', fontSize: '12.5px', backgroundColor: '#16a34a' }}
                  >
                    <Icon.Check /> Activer l'agent
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerifyPieceAdmin(a.id_agent, 'STATUT_COMPTE_FINAL', 'BLOQUE_CONFORMITE')}
                    style={{ ...secondaryBtn, color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                  >
                    Suspendre
                  </button>
                )}
              </div>
            </div>

            {/* Grille detaillee des 9 pieces justificatives */}
            {isExpanded && (
              <div style={{ padding: isMobile ? '14px' : '20px 24px', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                  {pieces.map((item) => {
                    const isValide = item.val === 'VALIDE';
                    const isRefuse = item.val === 'REFUSE';
                    return (
                      <div
                        key={item.field}
                        style={{
                          backgroundColor: '#ffffff',
                          border: isValide ? '1px solid #bbf7d0' : isRefuse ? '1px solid #fecaca' : '1px solid #e5e7eb',
                          borderRadius: '16px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
                              {item.step}
                            </span>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                backgroundColor: isValide ? '#dcfce7' : isRefuse ? '#fef2f2' : '#fef3c7',
                                color: isValide ? '#166534' : isRefuse ? '#dc2626' : '#92400e'
                              }}
                            >
                              {item.val || 'MANQUANT'}
                            </span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4, wordBreak: 'break-word' }}>
                            {item.info}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                          {item.file && typeof item.file === 'string' && (
                            <button
                              type="button"
                              onClick={() => openUploadedDocument(item.file)}
                              style={{ ...secondaryBtn, padding: '6px 10px', fontSize: '11.5px', flex: 1 }}
                            >
                              <Icon.Eye /> Voir pièce
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleVerifyPieceAdmin(a.id_agent, item.field, 'VALIDE', item.rgpd)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              flex: 1,
                              backgroundColor: isValide ? '#f0fdf4' : '#111827',
                              color: isValide ? '#166534' : '#ffffff'
                            }}
                          >
                            {item.rgpd ? 'Valider + Purge RGPD' : 'Approuver'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyPieceAdmin(a.id_agent, item.field, 'REFUSE')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              backgroundColor: '#ffffff',
                              color: '#dc2626',
                              border: '1px solid #fecaca'
                            }}
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Intelligence Terrain : Parts de marché des concurrents */}
      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '28px 0 10px 0' }}>
        Intelligence Terrain & Parts de Marché Concurrents
      </div>
      <div style={cardStyle}>
        {adminMarketStats.repartition_concurrents?.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            Les statistiques concurrentielles (Planity, Treatwell, Cahier papier...) s'afficheront ici dès les premières qualifications terrain de vos agents.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
            {(() => {
              const totalTagged = adminMarketStats.repartition_concurrents.reduce((acc, item) => acc + Number(item.count || 0), 0) || 1;
              return adminMarketStats.repartition_concurrents.map((item) => {
                const pct = Math.round((Number(item.count) / totalTagged) * 100);
                return (
                  <div key={item.tag_concurrent} style={{ padding: '14px 16px', borderRadius: '14px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#4b5563' }}>
                      <span>{item.tag_concurrent}</span>
                      <span style={{ color: '#111827' }}>{pct}% ({item.count})</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '999px', overflow: 'hidden', marginTop: '8px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#111827', borderRadius: '999px' }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {/* Tableau des virements de commissions */}
      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '28px 0 10px 0' }}>
        Virements des Commissions Acquises ({adminCommissions.length})
      </div>
      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11.5px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '14px 18px' }}>Agent Bénéficiaire</th>
              <th style={{ padding: '14px 18px' }}>Mois & Salon</th>
              <th style={{ padding: '14px 18px' }}>Montant</th>
              <th style={{ padding: '14px 18px' }}>IBAN de Virement</th>
              <th style={{ padding: '14px 18px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {adminCommissions.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Aucune commission en attente de virement.
                </td>
              </tr>
            ) : (
              adminCommissions.map((c) => (
                <tr key={c.id_commission} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '700' }}>
                    {c.prenom} {c.nom}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {c.periode_mois}
                    <br />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{c.nom_salon}</span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: '800', color: '#111827' }}>
                    {c.montant_commission} € HT
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '12.5px' }}>
                    {c.iban || 'IBAN non renseigné'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <button
                      type="button"
                      onClick={() => handlePayCommission(c.id_commission)}
                      style={{ ...primaryBtn, padding: '8px 14px', fontSize: '12px' }}
                    >
                      <Icon.Check /> Confirmer le virement
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tableau des commandes TPE (Logistique) */}
      <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '28px 0 10px 0' }}>
        Logistique : Commandes TPE à Expédier ({adminTpeCommandes.filter((c) => c.statut === 'EN_ATTENTE').length})
      </div>
      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11.5px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '14px 18px' }}>Agent</th>
              <th style={{ padding: '14px 18px' }}>Date</th>
              <th style={{ padding: '14px 18px' }}>Quantité & Matériel</th>
              <th style={{ padding: '14px 18px' }}>Statut & Suivi</th>
              <th style={{ padding: '14px 18px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {adminTpeCommandes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Aucune commande TPE enregistrée.
                </td>
              </tr>
            ) : (
              adminTpeCommandes.map((c) => {
                const estExpediee = c.statut === 'EXPEDIEE';
                const modeleLabel = c.modele_tpe === 'STRIPE_S700' ? 'Stripe Reader S700' : 'Stripe Reader T600';
                return (
                  <tr key={c.id_commande} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#0f172a', display: 'block' }}>{c.prenom} {c.nom}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{c.email}</span>
                      {c.telephone && <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{c.telephone}</div>}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#6b7280' }}>
                      <div>{formatDate(c.date_commande)}</div>
                      {estExpediee && c.date_expedition && (
                        <span style={{ fontSize: '11.5px', color: '#059669', display: 'block', marginTop: '2px' }}>
                          Expédié le {formatDate(c.date_expedition)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <strong style={{ color: '#111827' }}>{c.quantite}x {modeleLabel}</strong>
                      <br />
                      <span style={{ fontSize: '12px', color: '#4b5563' }}>{c.adresse_livraison}</span>
                      {c.note && (
                        <div style={{ fontSize: '12px', color: '#d97706', marginTop: '2px' }}>
                          Note: {c.note}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            backgroundColor: estExpediee ? '#dcfce7' : '#fef3c7',
                            color: estExpediee ? '#166534' : '#92400e'
                          }}
                        >
                          {estExpediee ? 'Expédiée' : 'En attente'}
                        </span>
                        {estExpediee && (
                          <div style={{ fontSize: '12px', color: '#334155' }}>
                            <span style={{ fontWeight: '600' }}>{c.transporteur || 'Colissimo'}</span>
                            {c.numero_suivi ? (
                              <div style={{ marginTop: '2px' }}>
                                {c.url_suivi ? (
                                  <a
                                    href={c.url_suivi}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: '#059669',
                                      fontWeight: '700',
                                      textDecoration: 'underline',
                                      fontFamily: 'monospace',
                                      fontSize: '11.5px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    N° {c.numero_suivi} ↗
                                  </a>
                                ) : (
                                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#64748b' }}>
                                    N° {c.numero_suivi}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sans numéro de suivi</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {!estExpediee ? (
                        <button
                          type="button"
                          onClick={() => ouvrirModaleExpedition(c)}
                          style={{ ...primaryBtn, padding: '8px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Icon.Check /> Expédier
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => ouvrirModaleExpedition(c)}
                          style={{ ...secondaryBtn, padding: '6px 12px', fontSize: '11.5px' }}
                        >
                          Modifier le suivi
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODALE D'EXPÉDITION ET SUIVI DE COLIS TPE */}
      {commandeAExpedier && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !envoiExpeditionEnCours) {
              setCommandeAExpedier(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: isMobile ? '20px' : '26px 28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  {commandeAExpedier.statut === 'EXPEDIEE' ? 'Modifier le suivi du colis' : 'Expédier la commande TPE'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Commande #{commandeAExpedier.id_commande} • {commandeAExpedier.prenom} {commandeAExpedier.nom}
                </span>
              </div>
              <button
                type="button"
                onClick={() => !envoiExpeditionEnCours && setCommandeAExpedier(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              >
                ✕
              </button>
            </div>

            {/* Récapitulatif de la commande */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Matériel :</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                  {commandeAExpedier.quantite}x {commandeAExpedier.modele_tpe === 'STRIPE_S700' ? 'Stripe Reader S700' : 'Stripe Reader T600'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', flexShrink: 0 }}>Livraison :</span>
                <span style={{ fontSize: '12.5px', color: '#0f172a', textAlign: 'right' }}>
                  {commandeAExpedier.adresse_livraison || "Adresse professionnelle"}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Impact stock :</span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>
                  +{commandeAExpedier.quantite} TPE crédité(s) à l'agent
                </span>
              </div>
            </div>

            <form onSubmit={validerExpeditionModal}>
              {/* Choix du transporteur */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Transporteur
                </label>
                <select
                  value={transporteurChoisi}
                  onChange={(e) => setTransporteurChoisi(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    height: '42px',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Colissimo">Colissimo (La Poste)</option>
                  <option value="Chronopost">Chronopost</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="UPS">UPS</option>
                  <option value="Mondial Relay">Mondial Relay</option>
                  <option value="Autre">Autre / Coursier</option>
                </select>
              </div>

              {/* Numéro de suivi */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Numéro de suivi du colis
                </label>
                <input
                  type="text"
                  placeholder="ex: 6A12345678901 ou 1Z9999999999999999"
                  value={numeroSuiviSaisi}
                  onChange={(e) => setNumeroSuiviSaisi(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    height: '42px',
                    backgroundColor: '#ffffff',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box'
                  }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  L'URL de suivi direct sera automatiquement calculée et envoyée par e-mail à l'agent commercial.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  disabled={envoiExpeditionEnCours}
                  onClick={() => setCommandeAExpedier(null)}
                  style={{ ...secondaryBtn, padding: '10px 18px', fontSize: '13px' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoiExpeditionEnCours}
                  style={{
                    ...primaryBtn,
                    padding: '10px 20px',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon.Check />
                  {envoiExpeditionEnCours ? 'Enregistrement...' : 'Confirmer l\'expédition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
