import { useState, useEffect } from 'react';

export default function Dashboard() {
  const agent = JSON.parse(localStorage.getItem('partner_data') || '{}');
  const token = localStorage.getItem('partner_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/partners';

  const [activeTab, setActiveTab] = useState('prospects');
  
  // États Factures
  const [factures, setFactures] = useState([]);
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [factureData, setFactureData] = useState({ nom_salon: '', adresse_salon: '', siret_salon: '' });

  // États Prospects
  const [prospects, setProspects] = useState([]);
  const [showProspectForm, setShowProspectForm] = useState(false);
  const [prospectData, setProspectData] = useState({ nom_salon: '', ville: '', code_postal: '', siret_prospect: '', telephone_salon: '', email_gerant: '' });
  const [prospectError, setProspectError] = useState('');

  useEffect(() => {
    if (activeTab === 'factures') fetchFactures();
    if (activeTab === 'prospects') fetchProspects();
  }, [activeTab]);

  // API Factures
  const fetchFactures = async () => {
    const res = await fetch(`${API_URL}/factures`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setFactures(await res.json());
  };

  const handleCreateFacture = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/factures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(factureData)
    });
    if (res.ok) {
      setShowFactureForm(false);
      setFactureData({ nom_salon: '', adresse_salon: '', siret_salon: '' });
      fetchFactures();
    }
  };

  const handleDownload = async (id, numero) => {
    const res = await fetch(`${API_URL}/factures/${id}/pdf`, { headers: { 'Authorization': `Bearer ${token}` } });
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
    await fetch(`${API_URL}/factures/${id}/payee`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    fetchFactures();
  };

  // API Prospects
  const fetchProspects = async () => {
    const res = await fetch(`${API_URL}/prospects`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setProspects(await res.json());
  };

  const handleOnboarding = async (id_prospect) => {
    try {
      const res = await fetch(`${API_URL}/prospects/${id_prospect}/onboarding`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(` Succès ! Envoyez ce lien d'inscription au gérant du salon :\n\n${data.lien}`);
      fetchProspects();
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    }
  };

  const handleCreateProspect = async (e) => {
    e.preventDefault();
    setProspectError('');
    const res = await fetch(`${API_URL}/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(prospectData)
    });
    
    if (res.ok) {
      setShowProspectForm(false);
      setProspectData({ nom_salon: '', ville: '', code_postal: '', siret_prospect: '', telephone_salon: '', email_gerant: '' });
      fetchProspects();
    } else {
      const err = await res.json();
      setProspectError(err.error || 'Erreur lors de la réservation');
    }
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
        
        <div style={{ flexGrow: 1, marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setActiveTab('prospects')} style={{ width: '100%', padding: '10px', backgroundColor: activeTab === 'prospects' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', textAlign: 'left' }}>
            Mes Prospects
          </button>
          <button onClick={() => setActiveTab('factures')} style={{ width: '100%', padding: '10px', backgroundColor: activeTab === 'factures' ? '#3b82f6' : 'transparent', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', textAlign: 'left' }}>
            Factures Onboarding
          </button>
        </div>
        
        <button onClick={logout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px', cursor: 'pointer', borderRadius: '5px' }}>Déconnexion</button>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '40px' }}>
        
        {/* VUE PROSPECTS */}
        {activeTab === 'prospects' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1>Mes Prospects (Lead Locking)</h1>
              <button onClick={() => setShowProspectForm(!showProspectForm)} style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                + Réserver un Lead
              </button>
            </div>

            {showProspectForm && (
              <form onSubmit={handleCreateProspect} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {prospectError && <p style={{ color: 'red', margin: 0, fontWeight: 'bold' }}>{prospectError}</p>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Nom du Salon" required value={prospectData.nom_salon} onChange={e => setProspectData({...prospectData, nom_salon: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                  <input type="text" placeholder="SIRET" value={prospectData.siret_prospect} onChange={e => setProspectData({...prospectData, siret_prospect: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="email" placeholder="Email Gérant (Obligatoire)" required value={prospectData.email_gerant} onChange={e => setProspectData({...prospectData, email_gerant: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                  <input type="text" placeholder="Téléphone" value={prospectData.telephone_salon} onChange={e => setProspectData({...prospectData, telephone_salon: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Code Postal" value={prospectData.code_postal} onChange={e => setProspectData({...prospectData, code_postal: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                  <input type="text" placeholder="Ville" value={prospectData.ville} onChange={e => setProspectData({...prospectData, ville: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                </div>
                <button type="submit" style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>Bloquer ce Prospect (45 Jours)</button>
              </form>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <tr>
                    <th style={{ padding: '15px' }}>Date</th>
                    <th style={{ padding: '15px' }}>Salon</th>
                    <th style={{ padding: '15px' }}>Contact</th>
                    <th style={{ padding: '15px' }}>Statut</th>
                    <th style={{ padding: '15px' }}>Expiration</th>
                    <th style={{ padding: '15px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.length === 0 ? <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#6b7280' }}>Aucun prospect en cours.</td></tr> : prospects.map(p => (
                    <tr key={p.id_prospect} style={{ borderBottom: '1px solid #e5e7eb', opacity: p.est_protege ? 1 : 0.5 }}>
                      <td style={{ padding: '15px' }}>{new Date(p.date_declaration).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.nom_salon} <br/><span style={{fontWeight: 'normal', fontSize:'12px', color:'#6b7280'}}>{p.ville}</span></td>
                      <td style={{ padding: '15px' }}>{p.email_gerant}</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: p.est_protege ? '#dbeafe' : '#f3f4f6', color: p.est_protege ? '#1e40af' : '#4b5563' }}>
                          {p.est_protege ? 'Protégé' : 'Expiré'}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: p.jours_restants <= 7 && p.est_protege ? '#ef4444' : 'inherit', fontWeight: p.jours_restants <= 7 ? 'bold' : 'normal' }}>
                        {p.statut_prospect === 'SIGNE' ? 'Converti' : (p.est_protege ? `Dans ${Math.max(0, p.jours_restants)} jours` : 'Libre')}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {p.statut_prospect !== 'SIGNE' && p.est_protege && (
                          <button onClick={() => handleOnboarding(p.id_prospect)} style={{ padding: '6px 12px', cursor: 'pointer', border: 'none', borderRadius: '5px', backgroundColor: '#8b5cf6', color: 'white', fontWeight: 'bold' }}>
                            Lancer l'Onboarding
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* VUE FACTURES */}
        {activeTab === 'factures' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1>Factures d'Installation (99€ HT)</h1>
              <button onClick={() => setShowFactureForm(!showFactureForm)} style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                + Nouvelle Facture
              </button>
            </div>

            {showFactureForm && (
              <form onSubmit={handleCreateFacture} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <input type="text" placeholder="Nom du Salon" required value={factureData.nom_salon} onChange={e => setFactureData({...factureData, nom_salon: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                <input type="text" placeholder="SIRET" required value={factureData.siret_salon} onChange={e => setFactureData({...factureData, siret_salon: e.target.value})} style={{flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
                <input type="text" placeholder="Adresse complète" required value={factureData.adresse_salon} onChange={e => setFactureData({...factureData, adresse_salon: e.target.value})} style={{flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '5px'}}/>
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
          </>
        )}
      </div>
    </div>
  );
}
