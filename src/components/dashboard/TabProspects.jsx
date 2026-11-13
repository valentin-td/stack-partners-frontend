// src/components/dashboard/TabProspects.jsx
// Onglet 2 : Pipeline prospects, reservation de leads et onboarding

import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';

export default function TabProspects({
  prospects,
  showProspectForm,
  setShowProspectForm,
  prospectData,
  setProspectData,
  prospectError,
  handleCreateProspect,
  handleOnboarding,
  isMobile,
  primaryBtn,
  inputStyle,
  cardStyle
}) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>
            Mes Prospects
          </h1>
          <span style={{ fontSize: '13.5px', color: '#6b7280' }}></span>
        </div>
        <button type="button" onClick={() => setShowProspectForm(!showProspectForm)} style={primaryBtn}>
          <Icon.Plus /> Réserver un Lead
        </button>
      </div>

      {showProspectForm && (
        <form
          onSubmit={handleCreateProspect}
          style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          {prospectError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {prospectError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
            <input
              type="text"
              placeholder="Nom du Salon"
              required
              value={prospectData.nom_salon}
              onChange={(e) => setProspectData({ ...prospectData, nom_salon: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Numéro SIRET"
              required
              value={prospectData.siret_prospect}
              onChange={(e) => setProspectData({ ...prospectData, siret_prospect: e.target.value })}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="E-mail du gérant"
              required
              value={prospectData.email_gerant}
              onChange={(e) => setProspectData({ ...prospectData, email_gerant: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Téléphone du salon"
              value={prospectData.telephone_salon}
              onChange={(e) => setProspectData({ ...prospectData, telephone_salon: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Code Postal"
              value={prospectData.code_postal}
              onChange={(e) => setProspectData({ ...prospectData, code_postal: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Ville"
              value={prospectData.ville}
              onChange={(e) => setProspectData({ ...prospectData, ville: e.target.value })}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={{ ...primaryBtn, alignSelf: isMobile ? 'stretch' : 'flex-end' }}>
            Verrouiller ce prospect (45 jours)
          </button>
        </form>
      )}

      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11.5px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '14px 18px' }}>Date</th>
              <th style={{ padding: '14px 18px' }}>Salon</th>
              <th style={{ padding: '14px 18px' }}>Contact</th>
              <th style={{ padding: '14px 18px' }}>Statut</th>
              <th style={{ padding: '14px 18px' }}>Protection</th>
              <th style={{ padding: '14px 18px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {prospects.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Aucun prospect enregistré.
                </td>
              </tr>
            ) : (
              prospects.map((p) => (
                <tr key={p.id_prospect} style={{ borderBottom: '1px solid #f3f4f6', opacity: p.est_protege ? 1 : 0.5 }}>
                  <td style={{ padding: '14px 18px', color: '#6b7280' }}>
                    {formatDate(p.date_declaration)}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: '600' }}>
                    {p.nom_salon}
                    <br />
                    <span style={{ fontWeight: '400', fontSize: '12px', color: '#6b7280' }}>
                      {p.ville} ({p.siret_prospect || 'SIRET N/A'})
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>{p.email_gerant}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor:
                          p.statut_prospect === 'SIGNE'
                            ? '#dcfce7'
                            : p.est_protege
                            ? '#f3f4f6'
                            : '#fef2f2',
                        color:
                          p.statut_prospect === 'SIGNE'
                            ? '#166534'
                            : p.est_protege
                            ? '#111827'
                            : '#dc2626'
                      }}
                    >
                      {p.statut_prospect === 'SIGNE' ? 'Signé' : p.est_protege ? 'Protégé' : 'Expiré'}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '14px 18px',
                      color: p.jours_restants <= 7 && p.est_protege ? '#dc2626' : '#6b7280',
                      fontWeight: p.jours_restants <= 7 ? '600' : '400'
                    }}
                  >
                    {p.statut_prospect === 'SIGNE'
                      ? 'Converti'
                      : p.est_protege
                      ? `${Math.max(0, p.jours_restants)}j restants`
                      : 'Libre'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {p.statut_prospect !== 'SIGNE' && p.est_protege && (
                      <button
                        type="button"
                        onClick={() => handleOnboarding(p.id_prospect)}
                        style={{ ...primaryBtn, padding: '8px 12px', fontSize: '12px' }}
                      >
                        <Icon.ArrowUpRight /> Onboarding
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
