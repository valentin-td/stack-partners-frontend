// src/components/dashboard/TabBord.jsx
// Onglet 1 : Tableau de bord, progression palier, salons affilies et commissions mensuelles

import { formatDate } from '../../utils/formatters';

export default function TabBord({
  stats,
  isMobile,
  isSmall,
  cardStyle,
  progressionPourcent
}) {
  return (
    <>
      <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
        <h1
          style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: '700',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em'
          }}
        >
          Tableau de Bord
        </h1>
        <span style={{ fontSize: '13.5px', color: '#6b7280' }}></span>
      </div>

      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'baseline',
            gap: '8px',
            marginBottom: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
              Palier de déblocage des commissions récurrentes
            </div>
            <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '2px' }}>
              {stats.kpis.nb_salons_actifs >= stats.kpis.seuil_deblocage
                ? 'Palier atteint : toutes vos commissions présentes et passées sont débloquées et payables.'
                : 'Les salons comptent dans ce palier dès leur 1er abonnement payant.'}
            </div>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap' }}>
            {stats.kpis.nb_salons_actifs} / {stats.kpis.seuil_deblocage} salons actifs
          </span>
        </div>
        <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressionPourcent}%`,
              height: '100%',
              backgroundColor: '#111827',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}
      >
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
            Salons en Essai (30j)
          </div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px' }}>
            {stats.kpis.nb_salons_essai}
          </div>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
            Salons Actifs Payants
          </div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px', color: '#16a34a' }}>
            {stats.kpis.nb_salons_actifs}
          </div>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
            En attente de seuil
          </div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px', color: '#d97706' }}>
            {stats.kpis.commissions_en_attente} <span style={{ fontSize: '14px', color: '#9ca3af' }}>€ HT</span>
          </div>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
            Commissions Acquises
          </div>
          <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px', color: '#111827' }}>
            {stats.kpis.commissions_acquises} <span style={{ fontSize: '14px', color: '#9ca3af' }}>€ HT</span>
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: '12.5px',
          fontWeight: '700',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '10px'
        }}
      >
        Salons clients affiliés ({stats.salons.length})
      </div>
      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11.5px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '14px 18px' }}>Salon</th>
              <th style={{ padding: '14px 18px' }}>Forfait</th>
              <th style={{ padding: '14px 18px' }}>Statut</th>
              <th style={{ padding: '14px 18px' }}>Fin commission (24m)</th>
            </tr>
          </thead>
          <tbody>
            {stats.salons.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Aucun salon client inscrit pour le moment.
                </td>
              </tr>
            ) : (
              stats.salons.map((s) => {
                const estEnEssai = s.plan_actuel === 'PREMIUM_TRIAL' || s.statut_abonnement !== 'actif';
                return (
                  <tr key={s.id_salon} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '600' }}>
                      {s.nom_salon}
                      <br />
                      <span style={{ fontWeight: '400', fontSize: '12px', color: '#6b7280' }}>
                        {s.email_gerant}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151' }}>
                        {s.plan_actuel === 'PREMIUM_TRIAL' ? 'Essai Gratuit 30j' : s.plan_actuel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: !estEnEssai ? '#dcfce7' : '#fef3c7',
                          color: !estEnEssai ? '#166534' : '#92400e'
                        }}
                      >
                        {!estEnEssai ? 'Actif payant' : '1er mois gratuit'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#6b7280' }}>
                      {s.date_fin_commissionnement ? formatDate(s.date_fin_commissionnement) : 'Au 1er paiement'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          fontSize: '12.5px',
          fontWeight: '700',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '10px'
        }}
      >
        Détail des commissions mensuelles (20 % HT)
      </div>
      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11.5px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '14px 18px' }}>Période</th>
              <th style={{ padding: '14px 18px' }}>Salon</th>
              <th style={{ padding: '14px 18px' }}>Base HT</th>
              <th style={{ padding: '14px 18px' }}>Commission</th>
              <th style={{ padding: '14px 18px' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {stats.commissions.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Aucune commission générée pour le moment.
                </td>
              </tr>
            ) : (
              stats.commissions.map((c) => (
                <tr key={c.id_commission} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 18px', fontWeight: '600' }}>{c.periode_mois}</td>
                  <td style={{ padding: '14px 18px' }}>{c.nom_salon}</td>
                  <td style={{ padding: '14px 18px', color: '#6b7280' }}>{c.montant_base_ht} € HT</td>
                  <td style={{ padding: '14px 18px', fontWeight: '700' }}>{c.montant_commission} € HT</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor:
                          c.statut_commission === 'PAYEE'
                            ? '#dcfce7'
                            : c.statut_commission === 'ACQUISE_A_PAYER'
                            ? '#dbeafe'
                            : '#fef3c7',
                        color:
                          c.statut_commission === 'PAYEE'
                            ? '#166534'
                            : c.statut_commission === 'ACQUISE_A_PAYER'
                            ? '#1e40af'
                            : '#92400e'
                      }}
                    >
                      {c.statut_commission === 'PAYEE'
                        ? 'Payée'
                        : c.statut_commission === 'ACQUISE_A_PAYER'
                        ? 'Acquise à payer'
                        : 'En attente seuil'}
                    </span>
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
