import { useState, useEffect } from 'react';

export default function Dashboard() {
  const agent = JSON.parse(localStorage.getItem('partner_data') || '{}');
  const token = localStorage.getItem('partner_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/partners';

  const [factures, setFactures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nom_salon: '', adresse_salon: '', siret_salon: '' });

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    const res = await fetch(`${API_URL}/factures`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setFactures(await res.json());
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/factures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowForm(false);
      setFormData({ nom_salon: '', adresse_salon: '', siret_salon: '' });
      fetchFactures();
    }
  };

  const handleDownload = async (id, numero) => {
    const res = await fetch(`${API_URL}/factures/${id}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${numero}.pdf`;
      a.click();
    }
  };

  const handlePay = async (id) => {
    await fetch(`${API_URL}/factures/${id}/payee`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchFactures();
  };

  const logout = () => {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_data');
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#111827', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2>STACK Partners</h2>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>{agent.nom} {agent.prenom}</p>
        <span style={{ backgroundColor: '#374151', padding: '5px', borderRadius: '5px', fontSize: '12px' }}>Code: {agent.code}</span>
        
        <div style={{ flexGrow: 1, marginTop: '40px' }}>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Facturation Onboarding</button>
        </div>
        
        <button onClick={logout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px', cursor: 'pointer', borderRadius: '5px' }}>Déconnexion</button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Factures d'Installation (99€ HT)</h1>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            + Nouvelle Facture
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <input type="text" placeholder="Nom du Salon" required value={formData.nom_salon} onChange={e => setFormData({...formData, nom_salon: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
            <input type="text" placeholder="SIRET" required value={formData.siret_salon} onChange={e => setFormData({...formData, siret_salon: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
            <input type="text" placeholder="Adresse complète" required value={formData.adresse_salon} onChange={e => setFormData({...formData, adresse_salon: e.target.value})} style={{flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
            <button type="submit" style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Générer</button>
          </form>
        )}

        <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '15px' }}>Date</th>
                <th style={{ padding: '15px' }}>N° Facture</th>
                <th style={{ padding: '15px' }}>Salon</th>
                <th style={{ padding: '15px' }}>Statut</th>
                <th style={{ padding: '15px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures.length === 0 ? <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#6b7280' }}>Aucune facture émise.</td></tr> : factures.map(f => (
                <tr key={f.id_facture} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px' }}>{new Date(f.date_emission).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{f.numero_facture}</td>
                  <td style={{ padding: '15px' }}>{f.nom_salon}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: f.statut === 'PAYEE' ? '#dcfce7' : '#fef08a', color: f.statut === 'PAYEE' ? '#166534' : '#854d0e' }}>
                      {f.statut === 'PAYEE' ? 'Payée' : 'En attente'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleDownload(f.id_facture, f.numero_facture)} style={{ padding: '6px 12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '5px', backgroundColor: 'white' }}>📄 PDF</button>
                    {f.statut !== 'PAYEE' && (
                      <button onClick={() => handlePay(f.id_facture)} style={{ padding: '6px 12px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#22c55e', color: 'white' }}>✅ Virement reçu</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
