// src/components/dashboard/TabGodMode.jsx
// Onglet 7 : God Mode (Super-Admin) — Audit KYC, Trésorerie Commissions, Logistique TPE & Marché (Jour & Nuit)

import { useState, useMemo } from 'react';
import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';

const formatEuroFr = (val, decimals = 2) => {
  const num = parseFloat(val) || 0;
  return `${num.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} €`;
};

const capitalizeWords = (str = '') => {
  const s = String(str || '').trim();
  if (!s) return '';
  return s
    .split(/\s+/)
    .map(w => (w.length > 1 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
};

const formatStatutPiece = (val) => {
  if (val === 'VALIDE') return 'Validée';
  if (val === 'REFUSE') return 'Refusée';
  if (val === 'EN_ATTENTE') return 'En attente';
  if (val === 'NON_REQUIS') return 'Non requis';
  return 'Manquante';
};

export default function TabGodMode({
  adminAgents = [],
  adminCommissions = [],
  adminTpeCommandes = [],
  adminMarketStats = { repartition_concurrents: [], recentes_visites: [] },
  adminSearch = '',
  setAdminSearch = () => {},
  adminStatusFilter = 'TOUS',
  setAdminStatusFilter = () => {},
  expandedAgentIds = {},
  setExpandedAgentIds = () => {},
  filteredAdminAgents = [],
  totalPendingPieces = 0,
  totalCommissionsToPay = '0.00',
  getAgentPiecesList = () => [],
  handleVerifyPieceAdmin = () => {},
  handlePayCommission = () => {},
  handleExpedierTpe = () => {},
  openUploadedDocument = () => {},
  fetchAdminData = () => {},
  isMobile = false,
  isSmall = false
}) {
  const [sectionActive, setSectionActive] = useState('agents'); // 'agents' | 'commissions' | 'tpe' | 'marche'
  const [commandeAExpedier, setCommandeAExpedier] = useState(null);
  const [transporteurChoisi, setTransporteurChoisi] = useState('Colissimo');
  const [numeroSuiviSaisi, setNumeroSuiviSaisi] = useState('');
  const [envoiExpeditionEnCours, setEnvoiExpeditionEnCours] = useState(false);

  const listeAgents = Array.isArray(adminAgents) ? adminAgents : [];
  const listeAgentsFiltres = Array.isArray(filteredAdminAgents) ? filteredAdminAgents : [];
  const listeCommissions = Array.isArray(adminCommissions) ? adminCommissions : [];
  const listeTpe = Array.isArray(adminTpeCommandes) ? adminTpeCommandes : [];
  const repartitionConcurrents = Array.isArray(adminMarketStats?.repartition_concurrents)
    ? adminMarketStats.repartition_concurrents
    : [];
  const recentesVisites = Array.isArray(adminMarketStats?.recentes_visites)
    ? adminMarketStats.recentes_visites
    : [];

  const { nbAgentsActifs, nbAgentsAVerifier, nbAgentsBloques, nbTpeEnAttente, totalQualifsMarche } = useMemo(() => {
    const actifs = listeAgents.filter(a => a.statut_compte === 'ACTIF').length;
    const bloq = listeAgents.filter(a => a.statut_compte === 'BLOQUE_CONFORMITE').length;
    const aVerif = listeAgents.filter(a => a.statut_compte !== 'ACTIF').length;
    const tpeAtt = listeTpe.filter(c => c.statut === 'EN_ATTENTE').length;
    const totalTags = repartitionConcurrents.reduce((acc, item) => acc + Number(item.count || 0), 0);
    return {
      nbAgentsActifs: actifs,
      nbAgentsAVerifier: aVerif,
      nbAgentsBloques: bloq,
      nbTpeEnAttente: tpeAtt,
      totalQualifsMarche: totalTags
    };
  }, [listeAgents, listeTpe, repartitionConcurrents]);

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '14px' : '16px',
        paddingBottom: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 0px))' : '28px',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1
      }}
    >
      <style>{`
        .sp-gm-master-card {
          background:
            radial-gradient(120% 120% at 95% 10%, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 58%),
            linear-gradient(145deg, #162420 0%, #0f1715 100%) !important;
          border: 1px solid rgba(52, 211, 153, 0.28) !important;
          box-shadow: 0 12px 28px -8px rgba(15, 23, 21, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
          border-radius: 20px !important;
          color: #ffffff !important;
          box-sizing: border-box;
        }
        .sp-gm-row {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.16);
          transition: background-color 0.12s ease;
        }
        .sp-gm-row:last-child {
          border-bottom: none;
        }
        .sp-gm-soft-btn {
          background: rgba(16, 185, 129, 0.13);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.36);
          transition: all 0.14s ease;
        }
        .sp-gm-soft-btn:hover {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }
        html.dark-mode .sp-gm-soft-btn {
          background: rgba(16, 185, 129, 0.18);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.42);
        }
        html.dark-mode .sp-gm-soft-btn:hover {
          background: #10b981;
          color: #0b0d10;
        }
        .sp-gm-danger-btn {
          background: transparent;
          color: #dc2626;
          border: 1px solid rgba(220, 38, 38, 0.28);
          transition: all 0.14s ease;
        }
        .sp-gm-danger-btn:hover {
          background: rgba(220, 38, 38, 0.10);
          border-color: rgba(220, 38, 38, 0.48);
        }
        .sp-gm-input {
          width: 100%;
          box-sizing: border-box;
          height: 40px;
          padding: 0 13px;
          background: var(--sp-bg-input, #ffffff);
          border: var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.30));
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--sp-text-main, #18181b);
          outline: none;
        }
        .sp-gm-input:focus {
          border-color: #10b981;
        }
        .sp-gm-table th {
          padding: 11px 16px;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--sp-text-muted, #64748b);
          border-bottom: 1px solid rgba(148, 163, 184, 0.20);
        }
        .sp-gm-table td {
          padding: 13px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.14);
          vertical-align: middle;
        }
        .sp-gm-table tbody tr:last-child td {
          border-bottom: none;
        }
        .sp-gm-tabs::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ================================================================= */}
      {/* 1. EN-TÊTE COMPACT SUR UNE LIGNE                                  */}
      {/* ================================================================= */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
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
            God Mode
          </h1>
          <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
            Conformité KYC, virements & logistique TPE
          </span>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          className="sp-glass-pill"
          style={{
            height: '36px',
            padding: '0 15px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '700',
            color: 'var(--sp-text-main, #18181b)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            alignSelf: isMobile ? 'stretch' : 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span>Actualiser les dossiers</span>
        </button>
      </header>

      {/* ================================================================= */}
      {/* 2. LES 4 KPIS HIÉRARCHISÉS (CARTE MAÎTRESSE + 3 CARTES ÉPURÉES)   */}
      {/* ================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : '1.3fr 1fr 1fr 1fr',
          gap: isMobile ? '8px' : '14px'
        }}
      >
        {/* KPI 1 : Virements à émettre (Carte maîtresse Obsidienne Émeraude) */}
        <div
          onClick={() => setSectionActive('commissions')}
          className="sp-gm-master-card"
          style={{
            gridColumn: isMobile && !isSmall ? '1 / -1' : 'auto',
            padding: isMobile ? '16px 18px' : '18px 22px',
            minHeight: '104px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: 'radial-gradient(120% 120% at 95% 10%, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 58%), linear-gradient(145deg, #162420 0%, #0f1715 100%)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.70)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Virements à émettre
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.22)', color: '#34d399' }}>
              {listeCommissions.length} en attente
            </span>
          </div>
          <div>
            <div style={{ fontSize: isMobile ? '25px' : '28px', fontWeight: '800', color: '#ffffff', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {formatEuroFr(totalCommissionsToPay)} <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.62)' }}>HT</span>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px' }}>
              Commissions acquises prêtes au paiement
            </div>
          </div>
        </div>

        {/* KPI 2 : Agents actifs */}
        <div
          onClick={() => setSectionActive('agents')}
          className="sp-glass-panel"
          style={{ padding: '16px 18px', minHeight: '104px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Agents autorisés
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.14)', color: '#059669' }}>
              Actifs
            </span>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbAgentsActifs}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              sur {listeAgents.length} inscrit{listeAgents.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* KPI 3 : Pièces à auditer */}
        <div
          onClick={() => {
            setSectionActive('agents');
            setAdminStatusFilter('A_VERIFIER');
          }}
          className="sp-glass-panel"
          style={{ padding: '16px 18px', minHeight: '104px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pièces à auditer
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: totalPendingPieces > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.14)', color: totalPendingPieces > 0 ? '#b45309' : '#059669' }}>
              KYC
            </span>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: totalPendingPieces > 0 ? '#d97706' : 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {totalPendingPieces}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              {nbAgentsAVerifier} dossier{nbAgentsAVerifier > 1 ? 's' : ''} en attente
            </div>
          </div>
        </div>

        {/* KPI 4 : Expéditions TPE */}
        <div
          onClick={() => setSectionActive('tpe')}
          className="sp-glass-panel"
          style={{ padding: '16px 18px', minHeight: '104px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TPE à expédier
            </span>
            <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: nbTpeEnAttente > 0 ? '#b45309' : '#059669' }}>
              {nbTpeEnAttente > 0 ? 'En attente' : 'À jour'}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: nbTpeEnAttente > 0 ? '#d97706' : 'var(--sp-text-main, #18181b)', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
              {nbTpeEnAttente}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
              sur {listeTpe.length} commande{listeTpe.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. BARRE D'ONGLETS INTERNE (ÉVITE L'EMPILEMENT VERTICAL)          */}
      {/* ================================================================= */}
      <div
        className="sp-glass-pill sp-gm-tabs"
        style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          maxWidth: '100%',
          overflowX: 'auto',
          padding: '4px',
          borderRadius: '999px',
          gap: '3px'
        }}
      >
        {[
          { id: 'agents', label: `Agents & KYC (${listeAgents.length})` },
          { id: 'commissions', label: `Commissions (${listeCommissions.length})` },
          { id: 'tpe', label: `Logistique TPE (${nbTpeEnAttente > 0 ? `${nbTpeEnAttente} à expédier` : listeTpe.length})` },
          { id: 'marche', label: `Marché (${totalQualifsMarche})` }
        ].map(tab => {
          const actif = sectionActive === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSectionActive(tab.id)}
              style={{
                border: actif ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
                backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: actif ? '800' : '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.14s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* VUE 1 : AGENTS & AUDIT KYC                                        */}
      {/* ================================================================= */}
      {sectionActive === 'agents' && (
        <div className="sp-glass-panel" style={{ overflow: 'hidden' }}>
          {/* Barre de recherche + filtres doux */}
          <div
            style={{
              padding: isMobile ? '12px' : '14px 18px',
              borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: '10px'
            }}
          >
            <div
              className="sp-glass-pill"
              style={{
                display: isMobile ? 'grid' : 'inline-flex',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : undefined,
                padding: '3px',
                borderRadius: '999px',
                gap: '2px'
              }}
            >
              {[
                { key: 'TOUS', label: `Tous (${listeAgents.length})` },
                { key: 'A_VERIFIER', label: `À vérifier (${nbAgentsAVerifier})` },
                { key: 'ACTIFS', label: `Actifs (${nbAgentsActifs})` },
                { key: 'BLOQUES', label: `Bloqués (${nbAgentsBloques})` }
              ].map(f => {
                const actif = adminStatusFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setAdminStatusFilter(f.key)}
                    style={{
                      padding: isMobile ? '5px 4px' : '5px 12px',
                      borderRadius: '999px',
                      fontSize: isMobile ? '10.5px' : '11.5px',
                      fontWeight: actif ? '800' : '700',
                      cursor: 'pointer',
                      border: actif ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                      backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                      color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div
              className="sp-glass-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 12px',
                height: '36px',
                borderRadius: '999px',
                width: isMobile ? '100%' : '280px'
              }}
            >
              <Icon.Search />
              <input
                type="text"
                placeholder="Nom, e-mail, code PARTNER, SIRET..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--sp-text-main, #18181b)'
                }}
              />
              {adminSearch && (
                <button
                  type="button"
                  onClick={() => setAdminSearch('')}
                  style={{ border: 'none', background: 'none', color: 'var(--sp-text-muted, #64748b)', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Liste des agents */}
          {listeAgentsFiltres.length === 0 ? (
            <div style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--sp-text-muted, #64748b)', fontSize: '13px' }}>
              Aucun agent ne correspond à votre filtre.
            </div>
          ) : (
            <div>
              {listeAgentsFiltres.map((a) => {
                const pieces = getAgentPiecesList(a);
                const nbValides = pieces.filter(p => p.val === 'VALIDE').length;
                const pctConforme = pieces.length > 0 ? Math.round((nbValides / pieces.length) * 100) : 0;
                const isExpanded = !!expandedAgentIds[a.id_agent];
                const isActif = a.statut_compte === 'ACTIF';
                const isBloque = a.statut_compte === 'BLOQUE_CONFORMITE';
                const nomComplet = capitalizeWords(`${a.prenom || ''} ${a.nom || ''}`.trim() || 'Agent');
                const initiales = ((a.prenom?.[0] || '') + (a.nom?.[0] || '')).toUpperCase() || 'AG';

                return (
                  <div key={a.id_agent} className="sp-gm-row">
                    {/* Ligne principale de l'agent */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '11px',
                            flexShrink: 0,
                            background: isActif
                              ? 'rgba(16, 185, 129, 0.13)'
                              : isBloque
                                ? 'rgba(220, 38, 38, 0.10)'
                                : 'rgba(148, 163, 184, 0.15)',
                            border: isActif
                              ? '1px solid rgba(16, 185, 129, 0.30)'
                              : isBloque
                                ? '1px solid rgba(220, 38, 38, 0.28)'
                                : '1px solid rgba(148, 163, 184, 0.25)',
                            color: isActif ? '#059669' : isBloque ? '#dc2626' : 'var(--sp-text-main, #18181b)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '12.5px'
                          }}
                        >
                          {initiales}
                        </div>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                              {nomComplet}
                            </strong>
                            <span style={{ fontSize: '10.5px', fontFamily: 'monospace', fontWeight: '700', padding: '2px 7px', borderRadius: '6px', background: 'rgba(148, 163, 184, 0.14)', color: 'var(--sp-text-muted, #64748b)' }}>
                              {a.code_partenaire}
                            </span>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: '800',
                                backgroundColor: isActif
                                  ? 'rgba(16, 185, 129, 0.14)'
                                  : isBloque
                                    ? 'rgba(220, 38, 38, 0.12)'
                                    : 'rgba(245, 158, 11, 0.15)',
                                color: isActif ? '#059669' : isBloque ? '#dc2626' : '#b45309'
                              }}
                            >
                              {isActif ? 'Actif' : isBloque ? 'Bloqué' : 'En attente'}
                            </span>
                          </div>

                          <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            <span>{a.email}</span>
                            {a.telephone && <span>· {a.telephone}</span>}
                            <span>· SIRET {a.siret_agent || 'N/A'} ({a.forme_juridique || 'EI'})</span>
                          </div>
                        </div>
                      </div>

                      {/* Jauge KYC + Actions sobres */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
                        <div style={{ minWidth: '115px', textAlign: isMobile ? 'left' : 'right' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: '800', color: pctConforme === 100 ? '#059669' : 'var(--sp-text-main, #18181b)', fontVariantNumeric: 'tabular-nums' }}>
                            {nbValides} / {pieces.length} pièces
                          </div>
                          <div style={{ height: '4px', width: '115px', background: 'rgba(148, 163, 184, 0.20)', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                            <div
                              style={{
                                width: `${pctConforme}%`,
                                height: '100%',
                                background: pctConforme === 100 ? '#10b981' : '#059669',
                                borderRadius: '999px'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setExpandedAgentIds(prev => ({ ...prev, [a.id_agent]: !prev[a.id_agent] }))}
                            className="sp-glass-pill"
                            style={{
                              height: '32px',
                              padding: '0 12px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              color: 'var(--sp-text-main, #18181b)',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {isExpanded ? 'Masquer ▲' : 'Auditer ▾'}
                          </button>

                          {!isActif ? (
                            <button
                              type="button"
                              onClick={() => handleVerifyPieceAdmin(a.id_agent, 'STATUT_COMPTE_FINAL', 'ACTIF')}
                              className="sp-gm-soft-btn"
                              style={{
                                height: '32px',
                                padding: '0 13px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Icon.Check />
                              <span>Activer</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleVerifyPieceAdmin(a.id_agent, 'STATUT_COMPTE_FINAL', 'BLOQUE_CONFORMITE')}
                              className="sp-gm-danger-btn"
                              style={{
                                height: '32px',
                                padding: '0 12px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Suspendre
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tiroir d'audit des 9 pièces (compact et sans boutons noirs agressifs) */}
                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '14px',
                          paddingTop: '14px',
                          borderTop: '1px dashed rgba(148, 163, 184, 0.24)'
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                          {pieces.map((item) => {
                            const isValide = item.val === 'VALIDE';
                            const isRefuse = item.val === 'REFUSE';

                            return (
                              <div
                                key={item.field}
                                className="sp-glass-pill"
                                style={{
                                  borderRadius: '14px',
                                  padding: '12px 14px',
                                  borderColor: isValide
                                    ? 'rgba(16, 185, 129, 0.30)'
                                    : isRefuse
                                      ? 'rgba(220, 38, 38, 0.35)'
                                      : undefined,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '10px'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                      {item.step}
                                    </span>
                                    <span
                                      style={{
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        backgroundColor: isValide
                                          ? 'rgba(16, 185, 129, 0.14)'
                                          : isRefuse
                                            ? 'rgba(220, 38, 38, 0.12)'
                                            : 'rgba(245, 158, 11, 0.14)',
                                        color: isValide ? '#059669' : isRefuse ? '#dc2626' : '#b45309'
                                      }}
                                    >
                                      {formatStatutPiece(item.val)}
                                    </span>
                                  </div>

                                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', marginBottom: '2px' }}>
                                    {item.label}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                    {item.info}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid rgba(148, 163, 184, 0.14)' }}>
                                  {item.file && typeof item.file === 'string' && (
                                    <button
                                      type="button"
                                      onClick={() => openUploadedDocument(item.file)}
                                      className="sp-glass-pill"
                                      style={{
                                        height: '29px',
                                        padding: '0 10px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: 'var(--sp-text-main, #18181b)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <Icon.Eye /> Voir
                                    </button>
                                  )}

                                  {!isValide ? (
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyPieceAdmin(a.id_agent, item.field, 'VALIDE', item.rgpd)}
                                      className="sp-gm-soft-btn"
                                      style={{
                                        flex: 1,
                                        height: '29px',
                                        padding: '0 10px',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {item.rgpd ? 'Valider + Purge RGPD' : 'Approuver'}
                                    </button>
                                  ) : (
                                    <span
                                      style={{
                                        flex: 1,
                                        height: '29px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        color: '#059669'
                                      }}
                                    >
                                      <Icon.Check /> Pièce conforme
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleVerifyPieceAdmin(a.id_agent, item.field, 'REFUSE')}
                                    className="sp-gm-danger-btn"
                                    style={{
                                      height: '29px',
                                      padding: '0 10px',
                                      borderRadius: '8px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      cursor: 'pointer'
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
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* VUE 2 : VIREMENTS DES COMMISSIONS ACQUISES                        */}
      {/* ================================================================= */}
      {sectionActive === 'commissions' && (
        <div className="sp-glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '15px 18px', borderBottom: '1px solid rgba(148, 163, 184, 0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                Virements de commissions à émettre ({listeCommissions.length})
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
                Commissions de 20 % HT débloquées après le seuil des 3 salons actifs.
              </span>
            </div>
            <strong style={{ fontSize: '15px', fontWeight: '800', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
              Total : {formatEuroFr(totalCommissionsToPay)} HT
            </strong>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="sp-gm-table" style={{ width: '100%', minWidth: '620px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Agent bénéficiaire</th>
                  <th>Mois & Salon</th>
                  <th>Montant</th>
                  <th>IBAN de virement</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {listeCommissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--sp-text-muted, #64748b)' }}>
                      Aucune commission en attente de virement.
                    </td>
                  </tr>
                ) : (
                  listeCommissions.map((c) => (
                    <tr key={c.id_commission}>
                      <td style={{ fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                        {capitalizeWords(`${c.prenom || ''} ${c.nom || ''}`)}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>{c.periode_mois}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)' }}>{capitalizeWords(c.nom_salon)}</div>
                      </td>
                      <td style={{ fontWeight: '800', color: '#059669', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {formatEuroFr(c.montant_commission)} HT
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
                        {c.iban || 'IBAN non renseigné'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handlePayCommission(c.id_commission)}
                          className="sp-gm-soft-btn"
                          style={{
                            height: '32px',
                            padding: '0 13px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer'
                          }}
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
        </div>
      )}

      {/* ================================================================= */}
      {/* VUE 3 : LOGISTIQUE COMMANDES TPE                                  */}
      {/* ================================================================= */}
      {sectionActive === 'tpe' && (
        <div className="sp-glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '15px 18px', borderBottom: '1px solid rgba(148, 163, 184, 0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                Commandes TPE à expédier ({nbTpeEnAttente} en attente)
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
                Valider une expédition crédite automatiquement le stock TPE de l’agent et envoie le lien de suivi.
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="sp-gm-table" style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Date</th>
                  <th>Matériel & Adresse</th>
                  <th>Statut & Suivi</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {listeTpe.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--sp-text-muted, #64748b)' }}>
                      Aucune commande TPE enregistrée.
                    </td>
                  </tr>
                ) : (
                  listeTpe.map((c) => {
                    const estExpediee = c.statut === 'EXPEDIEE';
                    const modeleLabel = c.modele_tpe === 'STRIPE_S700' ? 'Stripe Reader S700' : 'Stripe Reader T600';

                    return (
                      <tr key={c.id_commande}>
                        <td>
                          <strong style={{ color: 'var(--sp-text-main, #18181b)', display: 'block' }}>
                            {capitalizeWords(`${c.prenom || ''} ${c.nom || ''}`)}
                          </strong>
                          <span style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)' }}>{c.email}</span>
                          {c.telephone && <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', opacity: 0.85 }}>{c.telephone}</div>}
                        </td>

                        <td style={{ color: 'var(--sp-text-muted, #64748b)', whiteSpace: 'nowrap' }}>
                          <div>{formatDate(c.date_commande)}</div>
                          {estExpediee && c.date_expedition && (
                            <span style={{ fontSize: '11px', color: '#059669', display: 'block', marginTop: '2px' }}>
                              Expédié le {formatDate(c.date_expedition)}
                            </span>
                          )}
                        </td>

                        <td>
                          <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>
                            {c.quantite}x {modeleLabel}
                          </strong>
                          <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '2px' }}>
                            {c.adresse_livraison}
                          </div>
                          {c.note && (
                            <div style={{ fontSize: '11.5px', color: '#b45309', marginTop: '2px' }}>
                              Note : {c.note}
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span
                              style={{
                                padding: '2px 9px',
                                borderRadius: '999px',
                                fontSize: '10.5px',
                                fontWeight: '800',
                                backgroundColor: estExpediee ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.15)',
                                color: estExpediee ? '#059669' : '#b45309'
                              }}
                            >
                              {estExpediee ? 'Expédiée' : 'En attente'}
                            </span>
                            {estExpediee && (
                              <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)' }}>
                                <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>{c.transporteur || 'Colissimo'}</strong>
                                {c.numero_suivi ? (
                                  <div>
                                    {c.url_suivi ? (
                                      <a
                                        href={c.url_suivi}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#059669', fontWeight: '700', textDecoration: 'underline', fontFamily: 'monospace', fontSize: '11px' }}
                                      >
                                        N° {c.numero_suivi} ↗
                                      </a>
                                    ) : (
                                      <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>N° {c.numero_suivi}</span>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '11px', opacity: 0.75 }}>Sans numéro de suivi</div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {!estExpediee ? (
                            <button
                              type="button"
                              onClick={() => ouvrirModaleExpedition(c)}
                              className="sp-gm-soft-btn"
                              style={{
                                height: '32px',
                                padding: '0 14px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer'
                              }}
                            >
                              <Icon.Check /> Expédier
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => ouvrirModaleExpedition(c)}
                              className="sp-glass-pill"
                              style={{
                                height: '30px',
                                padding: '0 12px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                color: 'var(--sp-text-main, #18181b)',
                                cursor: 'pointer'
                              }}
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
        </div>
      )}

      {/* ================================================================= */}
      {/* VUE 4 : INTELLIGENCE TERRAIN & CONCURRENTS                        */}
      {/* ================================================================= */}
      {sectionActive === 'marche' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: '16px', alignItems: 'start' }}>
          <div className="sp-glass-panel" style={{ padding: '20px 22px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '15.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
              Répartition des logiciels rencontrés
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', display: 'block', marginBottom: '16px' }}>
              Basé sur {totalQualifsMarche} qualification{totalQualifsMarche > 1 ? 's' : ''} terrain enregistrée{totalQualifsMarche > 1 ? 's' : ''}.
            </span>

            {repartitionConcurrents.length === 0 ? (
              <div className="sp-glass-pill" style={{ padding: '18px 14px', borderRadius: '14px', fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)' }}>
                Les parts de marché concurrentielles s’afficheront ici dès les premières qualifications terrain.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {repartitionConcurrents.map((item) => {
                  const pct = totalQualifsMarche > 0 ? Math.round((Number(item.count) / totalQualifsMarche) * 100) : 0;
                  return (
                    <div key={item.tag_concurrent} className="sp-glass-pill" style={{ padding: '12px 14px', borderRadius: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--sp-text-main, #18181b)' }}>{capitalizeWords(String(item.tag_concurrent || '').replace(/_/g, ' '))}</span>
                        <span style={{ color: '#059669', fontVariantNumeric: 'tabular-nums' }}>{pct}% ({item.count})</span>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(148, 163, 184, 0.20)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#10b981', borderRadius: '999px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sp-glass-panel" style={{ padding: '20px 22px' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '15.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
              Dernières visites terrain ({recentesVisites.length})
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', display: 'block', marginBottom: '14px' }}>
              Remontées en direct depuis la carte de prospection des agents.
            </span>

            {recentesVisites.length === 0 ? (
              <div className="sp-glass-pill" style={{ padding: '18px 14px', borderRadius: '14px', fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)' }}>
                Aucune visite terrain récente enregistrée.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                {recentesVisites.map((v) => (
                  <div key={v.id_visite} className="sp-glass-pill" style={{ padding: '10px 13px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: '13px', color: 'var(--sp-text-main, #18181b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {capitalizeWords(v.nom_salon || 'Salon')}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)' }}>
                        {capitalizeWords(`${v.prenom || ''} ${v.nom || ''}`.trim() || 'Agent')}
                        {v.ville ? ` · ${capitalizeWords(v.ville)}` : ''}
                        {v.date_visite ? ` · ${formatDate(v.date_visite)}` : ''}
                      </span>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', flexShrink: 0 }}>
                      {capitalizeWords(String(v.tag_concurrent || 'Non renseigné').replace(/_/g, ' '))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODALE D'EXPÉDITION ET SUIVI DE COLIS TPE (JOUR & NUIT)           */}
      {/* ================================================================= */}
      {commandeAExpedier && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.56)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !envoiExpeditionEnCours) {
              setCommandeAExpedier(null);
            }
          }}
        >
          <div
            className="sp-glass-panel"
            style={{
              backgroundColor: 'var(--sp-bg-app, #f3f1ed)',
              borderRadius: '22px',
              maxWidth: '500px',
              width: '100%',
              padding: isMobile ? '20px' : '24px 26px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.30)',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                  {commandeAExpedier.statut === 'EXPEDIEE' ? 'Modifier le suivi du colis' : 'Expédier la commande TPE'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
                  Commande #{commandeAExpedier.id_commande} · {capitalizeWords(`${commandeAExpedier.prenom || ''} ${commandeAExpedier.nom || ''}`)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => !envoiExpeditionEnCours && setCommandeAExpedier(null)}
                className="sp-glass-pill"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: 'var(--sp-text-muted, #64748b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>

            <div className="sp-glass-pill" style={{ borderRadius: '14px', padding: '13px 15px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sp-text-muted, #64748b)' }}>Matériel</span>
                <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>
                  {commandeAExpedier.quantite}x {commandeAExpedier.modele_tpe === 'STRIPE_S700' ? 'Stripe Reader S700' : 'Stripe Reader T600'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: 'var(--sp-text-muted, #64748b)', flexShrink: 0 }}>Livraison</span>
                <span style={{ color: 'var(--sp-text-main, #18181b)', textAlign: 'right' }}>
                  {commandeAExpedier.adresse_livraison || 'Adresse professionnelle'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--sp-text-muted, #64748b)' }}>Impact stock</span>
                <strong style={{ color: '#059669' }}>+{commandeAExpedier.quantite} TPE crédité(s)</strong>
              </div>
            </div>

            <form onSubmit={validerExpeditionModal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '5px' }}>
                  Transporteur
                </label>
                <select
                  value={transporteurChoisi}
                  onChange={(e) => setTransporteurChoisi(e.target.value)}
                  className="sp-gm-input"
                >
                  <option value="Colissimo">Colissimo (La Poste)</option>
                  <option value="Chronopost">Chronopost</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="UPS">UPS</option>
                  <option value="Mondial Relay">Mondial Relay</option>
                  <option value="Autre">Autre / Coursier</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '5px' }}>
                  Numéro de suivi du colis
                </label>
                <input
                  type="text"
                  placeholder="Ex : 6A12345678901"
                  value={numeroSuiviSaisi}
                  onChange={(e) => setNumeroSuiviSaisi(e.target.value)}
                  className="sp-gm-input"
                  style={{ fontFamily: 'monospace' }}
                />
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
                  Le lien de suivi direct sera généré et envoyé par e-mail à l’agent.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  disabled={envoiExpeditionEnCours}
                  onClick={() => setCommandeAExpedier(null)}
                  className="sp-glass-pill"
                  style={{ height: '38px', padding: '0 16px', borderRadius: '999px', fontSize: '12.5px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={envoiExpeditionEnCours}
                  style={{
                    height: '38px',
                    padding: '0 18px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: 'var(--sp-btn-primary, #18181b)',
                    color: 'var(--sp-btn-primary-text, #ffffff)',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: envoiExpeditionEnCours ? 'not-allowed' : 'pointer',
                    opacity: envoiExpeditionEnCours ? 0.65 : 1
                  }}
                >
                  <Icon.Check />
                  <span>{envoiExpeditionEnCours ? 'Enregistrement...' : "Confirmer l'expédition"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
