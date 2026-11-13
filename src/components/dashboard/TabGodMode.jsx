// src/components/dashboard/TabGodMode.jsx
// Onglet 7 : God Mode (Super-Admin) - Audit des pieces KYC, validation commissions, logistique TPE

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
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11.5px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '14px 18px' }}>Agent</th>
              <th style={{ padding: '14px 18px' }}>Date</th>
              <th style={{ padding: '14px 18px' }}>Quantité & Adresse</th>
              <th style={{ padding: '14px 18px' }}>Statut</th>
              <th style={{ padding: '14px 18px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {adminTpeCommandes.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Aucune commande TPE en attente.
                </td>
              </tr>
            ) : (
              adminTpeCommandes.map((c) => (
                <tr key={c.id_commande} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '700' }}>
                    {c.prenom} {c.nom}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#6b7280' }}>
                    {formatDate(c.date_commande)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <strong style={{ color: '#111827' }}>{c.quantite} TPE Stripe</strong>
                    <br />
                    <span style={{ fontSize: '12.5px', color: '#4b5563' }}>{c.adresse_livraison}</span>
                    {c.note && (
                      <div style={{ fontSize: '12px', color: '#d97706', marginTop: '2px' }}>
                        Note: {c.note}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: c.statut === 'EXPEDIEE' ? '#dcfce7' : '#fef3c7',
                        color: c.statut === 'EXPEDIEE' ? '#166534' : '#92400e'
                      }}
                    >
                      {c.statut === 'EXPEDIEE' ? 'Expédiée' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {c.statut !== 'EXPEDIEE' && (
                      <button
                        type="button"
                        onClick={() => handleExpedierTpe(c.id_commande)}
                        style={{ ...primaryBtn, padding: '8px 14px', fontSize: '12px' }}
                      >
                        <Icon.Check /> Expédier
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
