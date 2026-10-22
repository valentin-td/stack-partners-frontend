import { useState, useEffect } from 'react';

export default function Dashboard() {
  const agent = JSON.parse(localStorage.getItem('partner_data') || '{}');
  const token = localStorage.getItem('partner_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/partners';

  const [activeTab, setActiveTab] = useState('bord');
  const [toastMsg, setToastMsg] = useState(null);

  // États Dashboard & Commissions (Briques 5 et 6) 
  const [stats, setStats] = useState({
    kpis: { nb_salons_actifs: 0, nb_salons_essai: 0, seuil_deblocage: 3, commissions_en_attente: '0.00', commissions_acquises: '0.00', commissions_payees: '0.00' },
    salons: [],
    commissions: []
  });

  // États Factures
  const [factures, setFactures] = useState([]);
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [factureData, setFactureData] = useState({ nom_salon: '', adresse_salon: '', siret_salon: '' });

  // États Prospects
  const [prospects, setProspects] = useState([]);
  const [showProspectForm, setShowProspectForm] = useState(false);
  const [prospectData, setProspectData] = useState({ nom_salon: '', ville: '', code_postal: '', siret_prospect: '', telephone_salon: '', email_gerant: '' });
  const [prospectError, setProspectError] = useState('');

  // États Profil
  const [profilData, setProfilData] = useState({ nom: '', prenom: '', email: '', telephone: '', siret_agent: '', numero_rsac: '', iban: '' });

  // États God Mode (Super-Admin)
  const isSuperAdmin = agent.email === 'tardy.valentin04@gmail.com';
  const [adminAgents, setAdminAgents] = useState([]);
  const [adminCommissions, setAdminCommissions] = useState([]);

  useEffect(() => {
    if (activeTab === 'bord') fetchStats();
    if (activeTab === 'factures') fetchFactures();
    if (activeTab === 'prospects') fetchProspects();
    if (activeTab === 'profil') fetchProfil();
    if (activeTab === 'godmode' && isSuperAdmin) fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    const resAgents = await fetch(`${API_URL}/admin/agents`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (resAgents.ok) setAdminAgents(await resAgents.json());
    
    const resCom = await fetch(`${API_URL}/admin/commissions`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (resCom.ok) setAdminCommissions(await resCom.json());
  };

  const handleValidateAgent = async (id) => {
    await fetch(`${API_URL}/admin/agents/${id}/valider`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    fetchAdminData();
    notify("Agent activé avec succès !");
  };

  const handlePayCommission = async (id) => {
    await fetch(`${API_URL}/admin/commissions/${id}/payer`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    fetchAdminData();
    notify("Commission marquée comme payée (virement effectué).");
  };

  const fetchProfil = async () => {
    const res = await fetch(`${API_URL}/profil`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setProfilData(await res.json());
  };

  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/profil`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(profilData)
    });
    if (res.ok) notify("Vos informations ont été mises à jour.");
    else notify("Erreur lors de la mise à jour.", true);
  };

  const notify = (text, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 5000);
  };

  // API Dashboard & Commissions
  const fetchStats = async () => {
    const res = await fetch(`${API_URL}/dashboard-stats`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setStats(await res.json());
  };

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
      notify("Facture générée avec succès.");
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
    notify("Virement validé. L'onboarding est débloqué.");
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
      navigator.clipboard?.writeText(data.lien);
      notify(`Lien copié dans le presse-papier : ${data.lien}`);
      fetchProspects();
    } catch (err) {
      notify(err.message, true);
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
      notify("Prospect protégé pour 45 jours.");
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

  // Bibliothèque d'icônes vectorielles SVG style STACK (zéro emoji)
  const Icon = {
    Bord: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    Prospects: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    Factures: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    FileDownload: () => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    Check: () => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    ArrowUpRight: () => (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
      </svg>
    ),
    Plus: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    ),
    Logout: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
    User: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    Shield: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    )
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '22px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    marginBottom: '24px'
  };

  const inputStyle = {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none'
  };

  const primaryBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#111827',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  const navBtnStyle = (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    backgroundColor: isActive ? '#f3f4f6' : 'transparent',
    color: isActive ? '#111827' : '#6b7280',
    fontWeight: isActive ? '600' : '500',
    fontSize: '14px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease'
  });

  const progressionPourcent = Math.min(100, Math.round((stats.kpis.nb_salons_actifs / stats.kpis.seuil_deblocage) * 100));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f6f6f7', color: '#111827' }}>
      
      {/* BANDEAU LATÉRAL GAUCHE (Disposition conservée, Design STACK) */}
      <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '28px 20px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingLeft: '6px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #863bff 0%, #47bfff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px' }}>
            S
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '0.03em', color: '#111827', lineHeight: 1.1 }}>STACK</div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>Portail Partenaires</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f6f6f7', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '12px 14px', marginBottom: '28px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>{agent.prenom} {agent.nom}</div>
          <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '4px', fontFamily: 'monospace' }}>{agent.code}</div>
        </div>
        
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={() => setActiveTab('bord')} style={navBtnStyle(activeTab === 'bord')}>
            <Icon.Bord /> Tableau de Bord
          </button>
          <button onClick={() => setActiveTab('prospects')} style={navBtnStyle(activeTab === 'prospects')}>
            <Icon.Prospects /> Mes Prospects
          </button>
          <button onClick={() => setActiveTab('factures')} style={navBtnStyle(activeTab === 'factures')}>
            <Icon.Factures /> Factures Onboarding
          </button>
          <button onClick={() => setActiveTab('profil')} style={navBtnStyle(activeTab === 'profil')}>
            <Icon.User /> Profil & Informations
          </button>

          {isSuperAdmin && (
            <>
              <div style={{ margin: '12px 0', borderTop: '1px solid #e5e7eb' }} />
              <button onClick={() => setActiveTab('godmode')} style={{ ...navBtnStyle(activeTab === 'godmode'), color: activeTab === 'godmode' ? '#8b5cf6' : '#6b7280', backgroundColor: activeTab === 'godmode' ? '#f5f3ff' : 'transparent' }}>
                <Icon.Shield /> God Mode
              </button>
            </>
          )}
        </div>
        
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', padding: '11px 14px', cursor: 'pointer', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600' }}>
          <Icon.Logout /> Quitter
        </button>
      </div>

      {/* ZONE DE CONTENU À DROITE */}
      <div style={{ flex: 1, padding: '40px 48px', maxWidth: '1150px', overflowY: 'auto' }}>

        {toastMsg && (
          <div style={{ backgroundColor: toastMsg.isError ? '#fef2f2' : '#111827', color: toastMsg.isError ? '#dc2626' : '#ffffff', border: toastMsg.isError ? '1px solid #fecaca' : 'none', padding: '14px 20px', borderRadius: '14px', marginBottom: '24px', fontSize: '13.5px', fontWeight: '500', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
            {toastMsg.text}
          </div>
        )}

        {/* ONGLET 1 : TABLEAU DE BORD & COMMISSIONS (BRIQUES 5 ET 6) */}
        {activeTab === 'bord' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Tableau de Bord</h1>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Suivi en temps réel de vos salons affiliés et de vos commissions récurrentes (20 % HT pendant 24 mois)</span>
            </div>

            {/* Jauge de déblocage des commissions (Seuil 3 salons) */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Palier de déblocage des commissions récurrentes</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                    {stats.kpis.nb_salons_actifs >= stats.kpis.seuil_deblocage
                      ? "Palier atteint : toutes vos commissions présentes et passées sont débloquées et payables."
                      : `Vos commissions sont provisionnées. Atteignez ${stats.kpis.seuil_deblocage} salons actifs payants pour les débloquer rétroactivement.`}
                  </div>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                  {stats.kpis.nb_salons_actifs} / {stats.kpis.seuil_deblocage} salons actifs
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressionPourcent}%`, height: '100%', backgroundColor: '#111827', borderRadius: '999px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Cartes KPIs Financiers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salons en Essai</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '10px' }}>{stats.kpis.nb_salons_essai}</div>
              </div>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salons Actifs Payants</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '10px', color: '#16a34a' }}>{stats.kpis.nb_salons_actifs}</div>
              </div>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>En attente de seuil</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '10px', color: '#d97706' }}>{stats.kpis.commissions_en_attente} <span style={{ fontSize: '15px', color: '#9ca3af' }}>€ HT</span></div>
              </div>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commissions Acquises</div>
                <div style={{ fontSize: '28px', fontWeight: '700', marginTop: '10px', color: '#111827' }}>{stats.kpis.commissions_acquises} <span style={{ fontSize: '15px', color: '#9ca3af' }}>€ HT</span></div>
              </div>
            </div>

            {/* Liste des Salons apportés */}
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Salons affiliés ({stats.salons.length})
            </div>
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Salon</th>
                    <th style={{ padding: '14px 20px' }}>Forfait</th>
                    <th style={{ padding: '14px 20px' }}>Statut Abonnement</th>
                    <th style={{ padding: '14px 20px' }}>Fin de commission (24 mois)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.salons.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucun salon inscrit avec votre lien partenaire pour le moment.</td></tr>
                  ) : stats.salons.map(s => (
                    <tr key={s.id_salon} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '600' }}>{s.nom_salon}<br/><span style={{ fontWeight: '400', fontSize: '12px', color: '#6b7280' }}>{s.email_gerant}</span></td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151' }}>{s.plan_actuel}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: s.statut_abonnement === 'actif' ? '#dcfce7' : '#fef3c7', color: s.statut_abonnement === 'actif' ? '#166534' : '#92400e' }}>
                          {s.statut_abonnement === 'actif' ? 'Actif payant' : 'Période d\'essai / Inactif'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#6b7280' }}>
                        {s.date_fin_commissionnement ? new Date(s.date_fin_commissionnement).toLocaleDateString('fr-FR') : 'En attente 1er paiement'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Relevé des Lignes de Commissions (20 %) */}
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Détail des commissions mensuelles (20 % HT)
            </div>
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Période</th>
                    <th style={{ padding: '14px 20px' }}>Salon</th>
                    <th style={{ padding: '14px 20px' }}>Base HT</th>
                    <th style={{ padding: '14px 20px' }}>Commission (20 %)</th>
                    <th style={{ padding: '14px 20px' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.commissions.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucune commission générée pour le moment.</td></tr>
                  ) : stats.commissions.map(c => (
                    <tr key={c.id_commission} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '600' }}>{c.periode_mois}</td>
                      <td style={{ padding: '16px 20px' }}>{c.nom_salon}</td>
                      <td style={{ padding: '16px 20px', color: '#6b7280' }}>{c.montant_base_ht} € HT</td>
                      <td style={{ padding: '16px 20px', fontWeight: '700' }}>{c.montant_commission} € HT</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: c.statut_commission === 'PAYEE' ? '#dcfce7' : (c.statut_commission === 'ACQUISE_A_PAYER' ? '#dbeafe' : '#fef3c7'),
                          color: c.statut_commission === 'PAYEE' ? '#166534' : (c.statut_commission === 'ACQUISE_A_PAYER' ? '#1e40af' : '#92400e')
                        }}>
                          {c.statut_commission === 'PAYEE' ? 'Payée' : (c.statut_commission === 'ACQUISE_A_PAYER' ? 'Acquise à payer' : 'En attente seuil (3 salons)')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ONGLET 2 : PROSPECTS */}
        {activeTab === 'prospects' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Mes Prospects</h1>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Réservez vos salons pour bénéficier d'une exclusivité de prospection de 45 jours</span>
              </div>
              <button onClick={() => setShowProspectForm(!showProspectForm)} style={primaryBtn}>
                <Icon.Plus /> Réserver un Lead
              </button>
            </div>

            {showProspectForm && (
              <form onSubmit={handleCreateProspect} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {prospectError && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>{prospectError}</div>}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="Nom du Salon" required value={prospectData.nom_salon} onChange={e => setProspectData({...prospectData, nom_salon: e.target.value})} style={inputStyle}/>
                  <input type="text" placeholder="Numéro SIRET" required value={prospectData.siret_prospect} onChange={e => setProspectData({...prospectData, siret_prospect: e.target.value})} style={inputStyle}/>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="email" placeholder="Adresse e-mail du gérant" required value={prospectData.email_gerant} onChange={e => setProspectData({...prospectData, email_gerant: e.target.value})} style={inputStyle}/>
                  <input type="text" placeholder="Téléphone du salon" value={prospectData.telephone_salon} onChange={e => setProspectData({...prospectData, telephone_salon: e.target.value})} style={inputStyle}/>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="Code Postal" value={prospectData.code_postal} onChange={e => setProspectData({...prospectData, code_postal: e.target.value})} style={inputStyle}/>
                  <input type="text" placeholder="Ville" value={prospectData.ville} onChange={e => setProspectData({...prospectData, ville: e.target.value})} style={inputStyle}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button type="submit" style={primaryBtn}>Verrouiller ce prospect (45 jours)</button>
                </div>
              </form>
            )}

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Date</th>
                    <th style={{ padding: '14px 20px' }}>Salon</th>
                    <th style={{ padding: '14px 20px' }}>Contact</th>
                    <th style={{ padding: '14px 20px' }}>Statut</th>
                    <th style={{ padding: '14px 20px' }}>Protection</th>
                    <th style={{ padding: '14px 20px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.length === 0 ? <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucun prospect enregistré.</td></tr> : prospects.map(p => (
                    <tr key={p.id_prospect} style={{ borderBottom: '1px solid #f3f4f6', opacity: p.est_protege ? 1 : 0.5 }}>
                      <td style={{ padding: '16px 20px', color: '#6b7280' }}>{new Date(p.date_declaration).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '600' }}>{p.nom_salon}<br/><span style={{ fontWeight: '400', fontSize: '12px', color: '#6b7280' }}>{p.ville} ({p.siret_prospect || 'SIRET non renseigné'})</span></td>
                      <td style={{ padding: '16px 20px' }}>{p.email_gerant}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: p.statut_prospect === 'SIGNE' ? '#dcfce7' : (p.est_protege ? '#f3f4f6' : '#fef2f2'), color: p.statut_prospect === 'SIGNE' ? '#166534' : (p.est_protege ? '#111827' : '#dc2626') }}>
                          {p.statut_prospect === 'SIGNE' ? 'Signé' : (p.est_protege ? 'Protégé' : 'Expiré')}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: p.jours_restants <= 7 && p.est_protege ? '#dc2626' : '#6b7280', fontWeight: p.jours_restants <= 7 ? '600' : '400' }}>
                        {p.statut_prospect === 'SIGNE' ? 'Converti' : (p.est_protege ? `${Math.max(0, p.jours_restants)} jours restants` : 'Libre')}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {p.statut_prospect !== 'SIGNE' && p.est_protege && (
                          <button onClick={() => handleOnboarding(p.id_prospect)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', cursor: 'pointer', border: 'none', borderRadius: '10px', backgroundColor: '#111827', color: '#ffffff', fontSize: '12.5px', fontWeight: '600' }}>
                            <Icon.ArrowUpRight /> Lancer l'Onboarding
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

        {/* ONGLET 3 : FACTURES D'INSTALLATION */}
        {activeTab === 'factures' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Factures d'Installation (99 € HT)</h1>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Émettez vos factures de mise en service et validez leur règlement pour débloquer l'onboarding</span>
              </div>
              <button onClick={() => setShowFactureForm(!showFactureForm)} style={primaryBtn}>
                <Icon.Plus /> Nouvelle Facture
              </button>
            </div>

            {showFactureForm && (
              <form onSubmit={handleCreateFacture} style={{ ...cardStyle, display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="text" placeholder="Nom du Salon" required value={factureData.nom_salon} onChange={e => setFactureData({...factureData, nom_salon: e.target.value})} style={inputStyle}/>
                <input type="text" placeholder="SIRET du Salon" required value={factureData.siret_salon} onChange={e => setFactureData({...factureData, siret_salon: e.target.value})} style={inputStyle}/>
                <input type="text" placeholder="Adresse complète" required value={factureData.adresse_salon} onChange={e => setFactureData({...factureData, adresse_salon: e.target.value})} style={{ ...inputStyle, flex: 1.5 }}/>
                <button type="submit" style={primaryBtn}>Générer</button>
              </form>
            )}

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Date</th>
                    <th style={{ padding: '14px 20px' }}>N° Facture</th>
                    <th style={{ padding: '14px 20px' }}>Salon & SIRET</th>
                    <th style={{ padding: '14px 20px' }}>Statut</th>
                    <th style={{ padding: '14px 20px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {factures.length === 0 ? <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucune facture émise.</td></tr> : factures.map(f => (
                    <tr key={f.id_facture} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 20px', color: '#6b7280' }}>{new Date(f.date_emission).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '16px 20px', fontWeight: '600' }}>{f.numero_facture}</td>
                      <td style={{ padding: '16px 20px' }}>{f.nom_salon}<br/><span style={{ fontSize: '12px', color: '#6b7280' }}>SIRET : {f.siret_salon}</span></td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: f.statut === 'PAYEE' ? '#dcfce7' : '#fef3c7', color: f.statut === 'PAYEE' ? '#166534' : '#92400e' }}>
                          {f.statut === 'PAYEE' ? 'Payée' : 'En attente'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleDownload(f.id_facture, f.numero_facture)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#ffffff', color: '#111827', fontSize: '12.5px', fontWeight: '600' }}>
                          <Icon.FileDownload /> Télécharger PDF
                        </button>
                        {f.statut !== 'PAYEE' && (
                          <button onClick={() => handlePay(f.id_facture)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', cursor: 'pointer', border: 'none', borderRadius: '10px', backgroundColor: '#111827', color: '#ffffff', fontSize: '12.5px', fontWeight: '600' }}>
                            <Icon.Check /> Confirmer réception virement
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

        {/* ONGLET 4 : PROFIL & CONFORMITÉ */}
        {activeTab === 'profil' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Profil & Informations Légal</h1>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Gérez vos coordonnées et vos données de facturation (IBAN, SIRET)</span>
            </div>

            <form onSubmit={handleUpdateProfil} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
              
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>Identité (Lecture seule)</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" value={profilData.nom} disabled style={{ ...inputStyle, backgroundColor: '#f9fafb', opacity: 0.8 }} />
                  <input type="text" value={profilData.prenom} disabled style={{ ...inputStyle, backgroundColor: '#f9fafb', opacity: 0.8 }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <input type="email" value={profilData.email} disabled style={{ ...inputStyle, backgroundColor: '#f9fafb', opacity: 0.8 }} />
                  <input type="text" value={`SIRET : ${profilData.siret_agent}`} disabled style={{ ...inputStyle, backgroundColor: '#f9fafb', opacity: 0.8 }} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>Coordonnées & Facturation (Modifiables)</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Téléphone</label>
                    <input type="text" value={profilData.telephone || ''} onChange={e => setProfilData({...profilData, telephone: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Numéro RSAC (Optionnel)</label>
                    <input type="text" value={profilData.numero_rsac || ''} onChange={e => setProfilData({...profilData, numero_rsac: e.target.value})} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>IBAN (Pour le virement de vos commissions STACK)</label>
                  <input type="text" required value={profilData.iban || ''} onChange={e => setProfilData({...profilData, iban: e.target.value})} style={{ ...inputStyle, width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" style={primaryBtn}>
                  <Icon.Check /> Enregistrer les modifications
                </button>
              </div>
            </form>
          </>
        )}

        {/* ONGLET 5 : GOD MODE (SUPER-ADMIN) */}
        {activeTab === 'godmode' && isSuperAdmin && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#8b5cf6' }}>God Mode (Super-Admin)</h1>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Espace strictement réservé au fondateur. Validation des agents et exécution des virements.</span>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              1. Validation des Agents
            </div>
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Identité & Contact</th>
                    <th style={{ padding: '14px 20px' }}>SIRET & Code</th>
                    <th style={{ padding: '14px 20px' }}>Statut</th>
                    <th style={{ padding: '14px 20px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminAgents.length === 0 ? <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucun agent inscrit.</td></tr> : adminAgents.map(a => (
                    <tr key={a.id_agent} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '600' }}>{a.prenom} {a.nom}<br/><span style={{ fontWeight: '400', fontSize: '12px', color: '#6b7280' }}>{a.email}</span></td>
                      <td style={{ padding: '16px 20px' }}>{a.siret_agent}<br/><span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{a.code_partenaire}</span></td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: a.statut_compte === 'ACTIF' ? '#dcfce7' : '#fef3c7', color: a.statut_compte === 'ACTIF' ? '#166534' : '#92400e' }}>
                          {a.statut_compte === 'ACTIF' ? 'Actif' : 'En attente'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {a.statut_compte !== 'ACTIF' && (
                          <button onClick={() => handleValidateAgent(a.id_agent)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', cursor: 'pointer', border: 'none', borderRadius: '10px', backgroundColor: '#8b5cf6', color: '#ffffff', fontSize: '12.5px', fontWeight: '600' }}>
                            <Icon.Check /> Valider le compte
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              2. Paiement des Commissions (Virements à effectuer)
            </div>
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>Agent Bénéficiaire</th>
                    <th style={{ padding: '14px 20px' }}>Mois & Salon</th>
                    <th style={{ padding: '14px 20px' }}>Montant</th>
                    <th style={{ padding: '14px 20px' }}>IBAN Virement</th>
                    <th style={{ padding: '14px 20px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCommissions.length === 0 ? <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucune commission en attente de paiement.</td></tr> : adminCommissions.map(c => (
                    <tr key={c.id_commission} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '600' }}>{c.prenom} {c.nom}</td>
                      <td style={{ padding: '16px 20px' }}>{c.periode_mois}<br/><span style={{ fontSize: '12px', color: '#6b7280' }}>{c.nom_salon}</span></td>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: '#111827' }}>{c.montant_commission} €</td>
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontSize: '13px' }}>{c.iban}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <button onClick={() => handlePayCommission(c.id_commission)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', cursor: 'pointer', border: 'none', borderRadius: '10px', backgroundColor: '#111827', color: '#ffffff', fontSize: '12.5px', fontWeight: '600' }}>
                          <Icon.Check /> Marquer Payée
                        </button>
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
