// src/components/dashboard/TabFactures.jsx
// Onglet 4 : Factures d'installation 99 EUR HT, generation, telechargement PDF et validation

import { Icon } from '../common/Icons';
import { formatDate } from '../../utils/formatters';

export default function TabFactures({
  factures,
  showFactureForm,
  setShowFactureForm,
  factureData,
  setFactureData,
  handleCreateFacture,
  handleDownload,
  handleSendFactureEmail,
  handlePay,
  isMobile,
  primaryBtn,
  secondaryBtn,
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
            Factures d'Installation (99 € HT)
          </h1>
          <span style={{ fontSize: '13.5px', color: '#6b7280' }}></span>
        </div>
        <button type="button" onClick={() => setShowFactureForm(!showFactureForm)} style={primaryBtn}>
          <Icon.Plus /> Nouvelle Facture
        </button>
      </div>

      {showFactureForm && (
        <form
          onSubmit={handleCreateFacture}
          style={{ ...cardStyle, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}
        >
          <input
            type="text"
            placeholder="Nom du Salon"
            required
            value={factureData.nom_salon}
            onChange={(e) => setFactureData({ ...factureData, nom_salon: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="SIRET du Salon"
            required
            value={factureData.siret_salon}
            onChange={(e) => setFactureData({ ...factureData, siret_salon: e.target.value })}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Adresse complète"
            required
            value={factureData.adresse_salon}
            onChange={(e) => setFactureData({ ...factureData, adresse_salon: e.target.value })}
            style={inputStyle}
          />
          <button type="submit" style={primaryBtn}>
            Générer
          </button>
        </form>
      )}

      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11.5px', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '14px 18px' }}>Date</th>
              <th style={{ padding: '14px 18px' }}>N° Facture</th>
              <th style={{ padding: '14px 18px' }}>Salon & SIRET</th>
              <th style={{ padding: '14px 18px' }}>Statut</th>
              <th style={{ padding: '14px 18px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {factures.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  Aucune facture émise.
                </td>
              </tr>
            ) : (
              factures.map((f) => (
                <tr key={f.id_facture} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 18px', color: '#6b7280' }}>
                    {formatDate(f.date_emission)}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: '600' }}>{f.numero_facture}</td>
                  <td style={{ padding: '14px 18px' }}>
                    {f.nom_salon}
                    <br />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>SIRET : {f.siret_salon}</span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: f.statut === 'PAYEE' ? '#dcfce7' : '#fef3c7',
                        color: f.statut === 'PAYEE' ? '#166534' : '#92400e'
                      }}
                    >
                      {f.statut === 'PAYEE' ? 'Payée' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleDownload(f.id_facture, f.numero_facture)}
                      style={secondaryBtn}
                    >
                      <Icon.FileDownload /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendFactureEmail(f.id_facture, f.nom_salon)}
                      style={secondaryBtn}
                    >
                      <Icon.ArrowUpRight /> E-mail
                    </button>
                    {f.statut !== 'PAYEE' && (
                      <button
                        type="button"
                        onClick={() => handlePay(f.id_facture)}
                        style={{ ...primaryBtn, padding: '8px 12px', fontSize: '12px' }}
                      >
                        <Icon.Check /> Valider paiement
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
