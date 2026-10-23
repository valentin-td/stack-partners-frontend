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

  // États Paramètres & Conformité (Ordre de déblocage 1 à 6)
  const [profilData, setProfilData] = useState({
    nom: '', prenom: '', email: '', telephone: '', siret_agent: '', numero_rsac: '', iban: '', statut_compte: 'EN_ATTENTE_VALIDATION',
    contrat_signe: false, statut_contrat: 'MANQUANT',
    date_naissance: '', date_expiration_identite: '', fichier_identite: '', statut_identite: 'MANQUANT',
    forme_juridique: 'EI', date_debut_activite: '', adresse_pro: '', statut_siret: 'MANQUANT',
    greffe_rsac: '', date_emission_rsac: '', fichier_rsac: '', statut_rsac: 'MANQUANT',
    date_emission_kbis: '', fichier_kbis: '', statut_kbis: 'NON_REQUIS',
    code_verif_urssaf: '', date_emission_urssaf: '', date_expiration_urssaf: '', fichier_urssaf: '', statut_urssaf: 'MANQUANT',
    assureur_nom: '', assureur_contrat: '', assureur_plafond: '', date_expiration_rc_pro: '', fichier_rc_pro: '', statut_rc_pro: 'MANQUANT',
    titulaire_iban: '', statut_iban: 'MANQUANT', regime_tva: 'FRANCHISE_293B', numero_tva_intra: '', statut_tva: 'MANQUANT',
    honneur_aucune_interdiction: false, honneur_pas_exclusivite_employeur: false, honneur_pas_mandat_concurrent: false,
    charte_acceptee: false, quiz_score: 0, formation_validee: false, telephone_confirme: false,
    autorise_a_vendre: false, motifs_blocage: [], alertes_expiration: [], historique: []
  });
  const [quizAnswers, setQuizAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [changementMotif, setChangementMotif] = useState('');

  // États Carte Interactive de Prospection
  const [mapCenter, setMapCenter] = useState({ lat: 48.5734, lng: 7.7521, label: 'Strasbourg' });
  const [mapRadius, setMapRadius] = useState(5);
  const [mapAddressQuery, setMapAddressQuery] = useState('');
  const [mapSalons, setMapSalons] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapFilter, setMapFilter] = useState('TOUS');
  const [selectedSalonMap, setSelectedSalonMap] = useState(null);
  const [quickLockForm, setQuickLockForm] = useState({ email_gerant: '', telephone_salon: '' });
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  // États God Mode (Super-Admin)
  const isSuperAdmin = agent.email === 'tardy.valentin04@gmail.com';
  const [adminAgents, setAdminAgents] = useState([]);
  const [adminCommissions, setAdminCommissions] = useState([]);
  const [selectedAgentAdmin, setSelectedAgentAdmin] = useState(null);

  // Chargement dynamique de Leaflet (CSS + JS) sans dépendance npm supplémentaire
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    fetchProfil(); // Toujours charger l'état de conformité et les alertes à 30 jours
    if (activeTab === 'bord') fetchStats();
    if (activeTab === 'factures') fetchFactures();
    if (activeTab === 'prospects') fetchProspects();
    if (activeTab === 'carte') fetchMapSalons(mapCenter.lat, mapCenter.lng, mapRadius);
    if (activeTab === 'godmode' && isSuperAdmin) fetchAdminData();
  }, [activeTab]);

  const fetchMapSalons = async (lat = mapCenter.lat, lng = mapCenter.lng, radius = mapRadius) => {
    setMapLoading(true);
    try {
      const res = await fetch(`${API_URL}/map-salons?lat=${lat}&lng=${lng}&radius=${radius}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMapSalons(data.salons || []);
      }
    } catch (e) {
      notify("Impossible de charger les salons du secteur.", true);
    } finally {
      setMapLoading(false);
    }
  };

  const handleGeolocateAgent = () => {
    if (!navigator.geolocation) {
      notify("La géolocalisation n'est pas supportée par votre navigateur.", true);
      return;
    }
    setMapLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Ma position actuelle' };
        setMapCenter(nextCenter);
        fetchMapSalons(nextCenter.lat, nextCenter.lng, mapRadius);
      },
      () => {
        setMapLoading(false);
        notify("Autorisez la localisation dans votre navigateur ou saisissez une adresse.", true);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearchAddressMap = async (e) => {
    e.preventDefault();
    if (!mapAddressQuery.trim()) return;
    setMapLoading(true);
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(mapAddressQuery)}&limit=1`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        const label = data.features[0].properties.label;
        setMapCenter({ lat, lng, label });
        fetchMapSalons(lat, lng, mapRadius);
      } else {
        setMapLoading(false);
        notify("Adresse introuvable.", true);
      }
    } catch (err) {
      setMapLoading(false);
      notify("Erreur lors de la recherche d'adresse.", true);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setMapRadius(newRadius);
    fetchMapSalons(mapCenter.lat, mapCenter.lng, newRadius);
  };

  const handleQuickLockFromMap = async (e) => {
    e.preventDefault();
    if (!selectedSalonMap) return;
    const res = await fetch(`${API_URL}/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        nom_salon: selectedSalonMap.nom_salon,
        ville: selectedSalonMap.ville,
        code_postal: selectedSalonMap.code_postal,
        siret_prospect: selectedSalonMap.siret,
        telephone_salon: quickLockForm.telephone_salon,
        email_gerant: quickLockForm.email_gerant
      })
    });
    const data = await res.json();
    if (res.ok) {
      notify(`Salon "${selectedSalonMap.nom_salon}" verrouillé pour 45 jours.`);
      setQuickLockForm({ email_gerant: '', telephone_salon: '' });
      // Mise à jour évolutive immédiate sur la carte sans rechargement
      setMapSalons(prev => prev.map(s => s.siret === selectedSalonMap.siret ? { ...s, statut_carte: 'PROSPECTE_MOI', jours_restants: 45, id_prospect: data.id_prospect } : s));
      setSelectedSalonMap(prev => prev ? { ...prev, statut_carte: 'PROSPECTE_MOI', jours_restants: 45, id_prospect: data.id_prospect } : null);
    } else {
      notify(data.error || "Verrouillage impossible.", true);
    }
  };

  // Rendu et mise à jour évolutive de la carte Leaflet
  useEffect(() => {
    if (activeTab !== 'carte' || !leafletReady || !window.L) return;
    const L = window.L;
    const container = document.getElementById('stack-partners-map');
    if (!container) return;

    if (!window.__stackMap) {
      const map = L.map(container, { zoomControl: false }).setView([mapCenter.lat, mapCenter.lng], 13);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO',
        maxZoom: 19
      }).addTo(map);
      window.__stackMap = map;
      window.__stackLayerGroup = L.layerGroup().addTo(map);
    }

    const map = window.__stackMap;
    const layerGroup = window.__stackLayerGroup;
    layerGroup.clearLayers();

    const zoomByRadius = mapRadius <= 2 ? 14 : mapRadius <= 5 ? 13 : mapRadius <= 15 ? 11 : 10;
    map.setView([mapCenter.lat, mapCenter.lng], zoomByRadius);

    // Cercle du rayon X km
    L.circle([mapCenter.lat, mapCenter.lng], {
      radius: mapRadius * 1000,
      color: '#111827',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#111827',
      fillOpacity: 0.04
    }).addTo(layerGroup);

    // Marqueur position centrale de l'agent
    const agentIcon = L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#863bff 0%,#47bfff 100%);border:3px solid #ffffff;box-shadow:0 0 0 4px rgba(134,59,255,0.22),0 4px 10px rgba(0,0,0,0.25);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker([mapCenter.lat, mapCenter.lng], { icon: agentIcon })
      .bindTooltip(`Centre : ${mapCenter.label} (Rayon ${mapRadius} km)`, { direction: 'top' })
      .addTo(layerGroup);

    // Couleurs par statut
    const colorMap = {
      LIBRE: '#10b981',           // Vert : Jamais prospecté
      PROSPECTE_MOI: '#2563eb',   // Bleu : Verrouillé par moi
      PROSPECTE_AUTRE: '#f59e0b', // Ambre : Déjà prospecté par un autre agent
      CLIENT_STACK: '#111827'     // Noir : Déjà équipé par STACK
    };

    const filtered = mapSalons.filter(s => mapFilter === 'TOUS' || s.statut_carte === mapFilter);

    filtered.forEach(salon => {
      const bg = colorMap[salon.statut_carte] || '#10b981';
      const isSelected = selectedSalonMap?.siret === salon.siret;
      const size = isSelected ? 22 : 16;

      const markerIcon = L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2.5px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.22);cursor:pointer;transition:transform 0.15s ease;"></div>`,
        iconSize: [size + 4, size + 4],
        iconAnchor: [(size + 4) / 2, (size + 4) / 2]
      });

      const marker = L.marker([salon.lat, salon.lng], { icon: markerIcon }).addTo(layerGroup);
      marker.on('click', () => setSelectedSalonMap(salon));
    });

    return () => {
      if (activeTab !== 'carte' && window.__stackMap) {
        window.__stackMap.remove();
        window.__stackMap = null;
        window.__stackLayerGroup = null;
      }
    };
  }, [activeTab, leafletReady, mapCenter, mapRadius, mapSalons, mapFilter, selectedSalonMap]);

  const fetchAdminData = async () => {
    const resAgents = await fetch(`${API_URL}/admin/agents`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (resAgents.ok) setAdminAgents(await resAgents.json());
    
    const resCom = await fetch(`${API_URL}/admin/commissions`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (resCom.ok) setAdminCommissions(await resCom.json());
  };

  const handleVerifyPieceAdmin = async (idAgent, champ_statut, decision, purge_identite_rgpd = false) => {
    const commentaire = decision === 'REFUSE' ? prompt("Motif du refus (affiché à l'agent) :") || 'Pièce non conforme' : 'Vérifié et validé par le fondateur';
    const res = await fetch(`${API_URL}/admin/agents/${idAgent}/verifier-piece`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ champ_statut, decision, commentaire, purge_identite_rgpd })
    });
    const data = await res.json();
    if (res.ok) {
      notify(data.message);
      fetchAdminData();
    } else {
      notify(data.error || "Action refusée", true);
    }
  };

  const handlePayCommission = async (id) => {
    const res = await fetch(`${API_URL}/admin/commissions/${id}/payer`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
      fetchAdminData();
      notify("Commission marquée comme payée (virement effectué).");
    } else {
      notify(data.error || "Paiement bloqué", true);
    }
  };

  const fetchProfil = async () => {
    const res = await fetch(`${API_URL}/profil`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setProfilData(await res.json());
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      notify("Fichier trop volumineux (max 2,5 Mo).", true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfilData(prev => ({ ...prev, [fieldName]: reader.result }));
    reader.readAsDataURL(file);
  };

  const submitEtapeConformite = async (etape, customPayload = null) => {
    const res = await fetch(`${API_URL}/profil/etape`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ etape, payload: customPayload || profilData })
    });
    const data = await res.json();
    if (res.ok) {
      notify(data.message);
      fetchProfil();
    } else {
      notify(data.error || "Erreur lors de l'enregistrement.", true);
    }
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const score = (quizAnswers.q1 === 'nf525' ? 25 : 0) + (quizAnswers.q2 === 'interdit' ? 25 : 0) + (quizAnswers.q3 === 'mandataire' ? 25 : 0) + (quizAnswers.q4 === '99' ? 25 : 0);
    if (score < 100) {
      notify(`Score insuffisant (${score}/100). Un score de 100% est exigé sur les règles NF525 et le mandat.`, true);
      return;
    }
    submitEtapeConformite(5, { telephone: profilData.telephone, quiz_score: 100, telephone_confirme: profilData.telephone_confirme });
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
    ),
    MapPin: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    Compass: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
      </svg>
    ),
    Search: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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

        {/* CARTE AGENT CLIQUABLE -> OUVRE LES PARAMÈTRES & CONFORMITÉ */}
        <button
          onClick={() => setActiveTab('profil')}
          style={{
            width: '100%',
            textAlign: 'left',
            backgroundColor: activeTab === 'profil' ? '#111827' : '#f6f6f7',
            border: activeTab === 'profil' ? '1px solid #111827' : '1px solid #e5e7eb',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.15s ease'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: profilData.autorise_a_vendre ? '#22c55e' : '#f59e0b' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: activeTab === 'profil' ? '#ffffff' : '#111827', textTransform: 'capitalize' }}>
                {agent.prenom} {agent.nom}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: activeTab === 'profil' ? '#9ca3af' : '#6b7280', marginTop: '4px', fontFamily: 'monospace' }}>
              {agent.code}
            </div>
          </div>
          <div style={{ color: activeTab === 'profil' ? '#ffffff' : '#6b7280', display: 'flex', alignItems: 'center' }}>
            <Icon.User />
          </div>
        </button>
        
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={() => setActiveTab('bord')} style={navBtnStyle(activeTab === 'bord')}>
            <Icon.Bord /> Tableau de Bord
          </button>
          <button onClick={() => setActiveTab('prospects')} style={navBtnStyle(activeTab === 'prospects')}>
            <Icon.Prospects /> Mes Prospects
          </button>
          <button onClick={() => setActiveTab('carte')} style={navBtnStyle(activeTab === 'carte')}>
            <Icon.MapPin /> Carte Prospection
          </button>
          <button onClick={() => setActiveTab('factures')} style={navBtnStyle(activeTab === 'factures')}>
            <Icon.Factures /> Factures Onboarding
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

        {/* ONGLET CARTE INTERACTIVE DE PROSPECTION */}
        {activeTab === 'carte' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Carte de Prospection</h1>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Visualisez les salons de coiffure autour de vous, identifiez leur statut en temps réel et verrouillez vos prospects en un clic.
                </span>
              </div>
              <button type="button" onClick={handleGeolocateAgent} style={{ ...primaryBtn, backgroundColor: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' }}>
                <Icon.Compass /> Autour de ma position GPS
              </button>
            </div>

            {/* Barre de contrôle : Recherche d'adresse + Sélecteur de rayon X km */}
            <div style={{ ...cardStyle, padding: '18px 22px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <form onSubmit={handleSearchAddressMap} style={{ display: 'flex', flex: 1, gap: '10px', minWidth: '280px' }}>
                  <input
                    type="text"
                    placeholder="Saisir une adresse, un code postal ou une ville (ex: 15 rue des Francs-Bourgeois, Strasbourg)..."
                    value={mapAddressQuery}
                    onChange={e => setMapAddressQuery(e.target.value)}
                    style={inputStyle}
                  />
                  <button type="submit" style={primaryBtn}>
                    <Icon.Search /> Centrer ici
                  </button>
                </form>

                {/* Sélecteur de rayon en kilomètres */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f6f6f7', padding: '6px 10px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: '#6b7280', paddingLeft: '4px' }}>Rayon :</span>
                  {[1, 3, 5, 10, 25, 50].map(km => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => handleRadiusChange(km)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        backgroundColor: mapRadius === km ? '#111827' : 'transparent',
                        color: mapRadius === km ? '#ffffff' : '#4b5563'
                      }}
                    >
                      {km} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Légende interactive & Filtres évolutifs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f3f4f6', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'TOUS', label: `Tous (${mapSalons.length})`, dot: null },
                    { key: 'LIBRE', label: `Jamais prospectés (${mapSalons.filter(s => s.statut_carte === 'LIBRE').length})`, dot: '#10b981' },
                    { key: 'PROSPECTE_MOI', label: `Mes prospects (${mapSalons.filter(s => s.statut_carte === 'PROSPECTE_MOI').length})`, dot: '#2563eb' },
                    { key: 'PROSPECTE_AUTRE', label: `Déjà prospectés (${mapSalons.filter(s => s.statut_carte === 'PROSPECTE_AUTRE').length})`, dot: '#f59e0b' },
                    { key: 'CLIENT_STACK', label: `Équipés STACK (${mapSalons.filter(s => s.statut_carte === 'CLIENT_STACK').length})`, dot: '#111827' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setMapFilter(tab.key)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '7px 12px',
                        borderRadius: '10px',
                        border: mapFilter === tab.key ? '1px solid #111827' : '1px solid #e5e7eb',
                        backgroundColor: mapFilter === tab.key ? '#111827' : '#ffffff',
                        color: mapFilter === tab.key ? '#ffffff' : '#374151',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {tab.dot && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: tab.dot }} />}
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '12.5px', color: '#6b7280', fontWeight: '500' }}>
                  {mapLoading ? 'Exploration du secteur en cours...' : `Centre : ${mapCenter.label} (${mapRadius} km)`}
                </div>
              </div>
            </div>

            {/* Grille : Carte Leaflet à gauche + Fiche d'action du salon sélectionné à droite */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'stretch' }}>
              
              {/* Conteneur Carte */}
              <div style={{ ...cardStyle, padding: '0', overflow: 'hidden', height: '560px', position: 'relative', marginBottom: 0 }}>
                <div id="stack-partners-map" style={{ width: '100%', height: '100%' }} />
              </div>

              {/* Panneau latéral droit : Détails du salon cliqué ou Liste rapide */}
              <div style={{ ...cardStyle, height: '560px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', marginBottom: 0, overflowY: 'auto' }}>
                {selectedSalonMap ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{
                        padding: '5px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700',
                        backgroundColor: selectedSalonMap.statut_carte === 'LIBRE' ? '#dcfce7' : selectedSalonMap.statut_carte === 'PROSPECTE_MOI' ? '#dbeafe' : selectedSalonMap.statut_carte === 'PROSPECTE_AUTRE' ? '#fef3c7' : '#f3f4f6',
                        color: selectedSalonMap.statut_carte === 'LIBRE' ? '#166534' : selectedSalonMap.statut_carte === 'PROSPECTE_MOI' ? '#1e40af' : selectedSalonMap.statut_carte === 'PROSPECTE_AUTRE' ? '#92400e' : '#111827'
                      }}>
                        {selectedSalonMap.statut_carte === 'LIBRE' && 'Jamais prospecté — Libre'}
                        {selectedSalonMap.statut_carte === 'PROSPECTE_MOI' && `Mon prospect (${selectedSalonMap.jours_restants}j restants)`}
                        {selectedSalonMap.statut_carte === 'PROSPECTE_AUTRE' && `Déjà prospecté (${selectedSalonMap.jours_restants}j restants)`}
                        {selectedSalonMap.statut_carte === 'CLIENT_STACK' && 'Déjà équipé par STACK'}
                      </span>
                      <button type="button" onClick={() => setSelectedSalonMap(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                        Fermer
                      </button>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px 0' }}>{selectedSalonMap.nom_salon}</h3>
                    <div style={{ fontSize: '13.5px', color: '#4b5563', marginBottom: '4px' }}>{selectedSalonMap.adresse}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                      {selectedSalonMap.code_postal} {selectedSalonMap.ville} • À {selectedSalonMap.distance_km} km
                    </div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', backgroundColor: '#f6f6f7', padding: '8px 12px', borderRadius: '10px', color: '#374151', marginBottom: '20px' }}>
                      SIRET : {selectedSalonMap.siret}
                    </div>

                    {selectedSalonMap.statut_carte === 'LIBRE' && (
                      <form onSubmit={handleQuickLockFromMap} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Réserver ce salon (Protection 45 jours)</div>
                        <input
                          type="email"
                          required
                          placeholder="E-mail du gérant (Obligatoire)"
                          value={quickLockForm.email_gerant}
                          onChange={e => setQuickLockForm({ ...quickLockForm, email_gerant: e.target.value })}
                          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', flex: 'none' }}
                        />
                        <input
                          type="text"
                          placeholder="Téléphone du salon (Optionnel)"
                          value={quickLockForm.telephone_salon}
                          onChange={e => setQuickLockForm({ ...quickLockForm, telephone_salon: e.target.value })}
                          style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', flex: 'none' }}
                        />
                        <button type="submit" style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}>
                          <Icon.Check /> Verrouiller ce prospect
                        </button>
                      </form>
                    )}

                    {selectedSalonMap.statut_carte === 'PROSPECTE_MOI' && (
                      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '500' }}>
                          Ce salon vous est réservé. Vous pouvez émettre sa facture d'installation de 99 € HT ou lancer son onboarding.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFactureData({ nom_salon: selectedSalonMap.nom_salon, siret_salon: selectedSalonMap.siret, adresse_salon: `${selectedSalonMap.adresse}, ${selectedSalonMap.code_postal} ${selectedSalonMap.ville}` });
                            setShowFactureForm(true);
                            setActiveTab('factures');
                          }}
                          style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}
                        >
                          <Icon.Factures /> Créer la facture 99 € HT
                        </button>
                      </div>
                    )}

                    {selectedSalonMap.statut_carte === 'PROSPECTE_AUTRE' && (
                      <div style={{ marginTop: 'auto', padding: '14px', backgroundColor: '#fffbeb', borderRadius: '12px', color: '#92400e', fontSize: '13px' }}>
                        Ce salon fait déjà l'objet d'une réservation active par un autre agent partenaire. Il redeviendra libre à l'expiration du délai de 45 jours s'il n'est pas converti.
                      </div>
                    )}

                    {selectedSalonMap.statut_carte === 'CLIENT_STACK' && (
                      <div style={{ marginTop: 'auto', padding: '14px', backgroundColor: '#f3f4f6', borderRadius: '12px', color: '#111827', fontSize: '13px', fontWeight: '500' }}>
                        Ce salon est déjà équipé de la caisse certifiée STACK.
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                      Salons dans le rayon ({mapSalons.filter(s => mapFilter === 'TOUS' || s.statut_carte === mapFilter).length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                      {mapSalons.filter(s => mapFilter === 'TOUS' || s.statut_carte === mapFilter).length === 0 ? (
                        <div style={{ fontSize: '13.5px', color: '#6b7280', textAlign: 'center', marginTop: '40px' }}>
                          Aucun salon trouvé dans ce périmètre. Augmentez le rayon en kilomètres ou changez d'adresse.
                        </div>
                      ) : (
                        mapSalons
                          .filter(s => mapFilter === 'TOUS' || s.statut_carte === mapFilter)
                          .map(s => (
                            <div
                              key={s.siret}
                              onClick={() => setSelectedSalonMap(s)}
                              style={{
                                padding: '12px 14px',
                                borderRadius: '14px',
                                border: '1px solid #f3f4f6',
                                backgroundColor: '#f9fafb',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111827' }}>{s.nom_salon}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{s.ville} • {s.distance_km} km</div>
                              </div>
                              <span style={{
                                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                                backgroundColor: s.statut_carte === 'LIBRE' ? '#10b981' : s.statut_carte === 'PROSPECTE_MOI' ? '#2563eb' : s.statut_carte === 'PROSPECTE_AUTRE' ? '#f59e0b' : '#111827'
                              }} />
                            </div>
                          ))
                      )}
                    </div>
                  </>
                )}
              </div>

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

        {/* ONGLET PARAMÈTRES & CONFORMITÉ LÉGALE (ORDRE DE DÉBLOCAGE 1 À 6) */}
        {activeTab === 'profil' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Paramètres & Dossier de Conformité</h1>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  La prospection, la facturation et l'onboarding sont verrouillés tant que les 6 étapes ci-dessous ne sont pas intégralement vérifiées.
                </span>
              </div>
              <span style={{
                padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '700',
                backgroundColor: profilData.autorise_a_vendre ? '#dcfce7' : '#fef2f2',
                color: profilData.autorise_a_vendre ? '#166534' : '#dc2626'
              }}>
                {profilData.autorise_a_vendre ? 'Compte Actif — Vente Autorisée' : 'Vente Verrouillée'}
              </span>
            </div>

            {/* Alertes d'expiration à 30 jours */}
            {profilData.alertes_expiration?.length > 0 && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '16px 20px', borderRadius: '16px', marginBottom: '20px', fontSize: '13.5px' }}>
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>Rappel d'échéance réglementaire (Alerte à 30 jours) :</div>
                {profilData.alertes_expiration.map((al, idx) => <div key={idx}>• {al}</div>)}
              </div>
            )}

            {/* Liste des verrous actifs */}
            {!profilData.autorise_a_vendre && profilData.motifs_blocage?.length > 0 && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #fecaca', padding: '18px 22px', borderRadius: '18px', marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Éléments requis pour débloquer votre droit de vente :
                </div>
                {profilData.motifs_blocage.map((m, i) => (
                  <div key={i} style={{ fontSize: '13.5px', color: '#374151', padding: '3px 0' }}>• {m}</div>
                ))}
              </div>
            )}

            {/* ÉTAPE 1 : CONTRAT D'AGENT COMMERCIAL À EFFET CONDITIONNEL */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>1. Contrat de mandat d'agent commercial (à prise d'effet conditionnelle)</div>
                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: profilData.statut_contrat === 'VALIDE' ? '#dcfce7' : '#fef3c7', color: profilData.statut_contrat === 'VALIDE' ? '#166534' : '#92400e' }}>
                  {profilData.statut_contrat}
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Conformément au Code de commerce, la conclusion du contrat de mandat précède votre immatriculation au Registre Spécial des Agents Commerciaux (RSAC). Ce contrat est conclu sous condition suspensive : vous pouvez utiliser cette copie pour votre inscription au greffe, mais toute prospection ou vente demeure interdite tant que les étapes 2 à 6 ne sont pas validées.
              </p>
              {profilData.contrat_signe ? (
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>
                  Contrat signé électroniquement le {profilData.date_signature_contrat ? new Date(profilData.date_signature_contrat).toLocaleString('fr-FR') : 'ce jour'}.
                </div>
              ) : (
                <button type="button" onClick={() => submitEtapeConformite(1)} style={primaryBtn}>
                  <Icon.Check /> Signer le contrat de mandat à effet conditionnel
                </button>
              )}
            </div>

            {/* ÉTAPE 2 : IDENTITÉ, SIREN/SIRET, RSAC & KBIS */}
            <div style={{ ...cardStyle, opacity: profilData.contrat_signe ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>2. Immatriculation RSAC, Identité & Statut Juridique (INSEE / Kbis)</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600', backgroundColor: '#f3f4f6' }}>Identité : {profilData.statut_identite}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600', backgroundColor: '#f3f4f6' }}>SIRET : {profilData.statut_siret}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600', backgroundColor: '#f3f4f6' }}>RSAC : {profilData.statut_rsac}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date de naissance (Majeur requis)</label>
                  <input type="date" value={profilData.date_naissance ? profilData.date_naissance.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_naissance: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expiration Pièce d'identité</label>
                  <input type="date" value={profilData.date_expiration_identite ? profilData.date_expiration_identite.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_expiration_identite: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pièce d'identité (PDF / Image)</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_identite')} style={{ fontSize: '12px', marginTop: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Numéro SIRET (14 chiffres)</label>
                  <input type="text" value={profilData.siret_agent || ''} onChange={e => setProfilData({...profilData, siret_agent: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Forme juridique</label>
                  <select value={profilData.forme_juridique || 'EI'} onChange={e => setProfilData({...profilData, forme_juridique: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                    <option value="EI">Entrepreneur Individuel / Micro-entreprise</option>
                    <option value="SOCIETE">Société (SASU, EURL, SAS, SARL...)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date de début d'activité</label>
                  <input type="date" value={profilData.date_debut_activite ? profilData.date_debut_activite.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_debut_activite: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Adresse professionnelle complète (figurant sur vos factures)</label>
                <input type="text" placeholder="Ex: 12 rue de la Paix, 67000 Strasbourg" value={profilData.adresse_pro || ''} onChange={e => setProfilData({...profilData, adresse_pro: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Numéro RSAC (Obligatoire)</label>
                  <input type="text" placeholder="Ex: 902 123 456" value={profilData.numero_rsac || ''} onChange={e => setProfilData({...profilData, numero_rsac: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Greffe / Tribunal Judiciaire</label>
                  <input type="text" placeholder="Ex: TJ de Strasbourg" value={profilData.greffe_rsac || ''} onChange={e => setProfilData({...profilData, greffe_rsac: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date extrait RSAC (&lt; 3 mois)</label>
                  <input type="date" value={profilData.date_emission_rsac ? profilData.date_emission_rsac.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_emission_rsac: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Extrait RSAC (PDF)</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_rsac')} style={{ fontSize: '12px', marginTop: '6px' }} />
                </div>
              </div>

              {profilData.forme_juridique === 'SOCIETE' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#f9fafb', padding: '14px', borderRadius: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date d'émission de l'extrait Kbis (&lt; 3 mois)</label>
                    <input type="date" value={profilData.date_emission_kbis ? profilData.date_emission_kbis.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_emission_kbis: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Extrait Kbis mentionnant l'activité d'agent commercial ({profilData.statut_kbis})</label>
                    <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_kbis')} style={{ fontSize: '12px', marginTop: '6px' }} />
                  </div>
                </div>
              )}

              <button type="button" disabled={!profilData.contrat_signe} onClick={() => submitEtapeConformite(2)} style={primaryBtn}>
                <Icon.Check /> Soumettre l'Étape 2 (Identité, SIRET & RSAC)
              </button>
            </div>

            {/* ÉTAPE 3 : ATTESTATION DE VIGILANCE URSSAF */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>3. Attestation de vigilance URSSAF (Renouvellement tous les 6 mois)</div>
                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: profilData.statut_urssaf === 'VALIDE' ? '#dcfce7' : '#fef3c7', color: profilData.statut_urssaf === 'VALIDE' ? '#166534' : '#92400e' }}>
                  {profilData.statut_urssaf}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Code de sécurité / vérification</label>
                  <input type="text" placeholder="Code de vérification URSSAF" value={profilData.code_verif_urssaf || ''} onChange={e => setProfilData({...profilData, code_verif_urssaf: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date de délivrance</label>
                  <input type="date" value={profilData.date_emission_urssaf ? profilData.date_emission_urssaf.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_emission_urssaf: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date d'expiration (6 mois)</label>
                  <input type="date" value={profilData.date_expiration_urssaf ? profilData.date_expiration_urssaf.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_expiration_urssaf: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Fichier PDF URSSAF</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_urssaf')} style={{ fontSize: '12px', marginTop: '6px' }} />
                </div>
              </div>
              <button type="button" onClick={() => submitEtapeConformite(3)} style={primaryBtn}>
                <Icon.Check /> Soumettre l'Étape 3 (Vigilance URSSAF)
              </button>
            </div>

            {/* ÉTAPE 4 : ASSURANCE RC PRO, IBAN, TVA, DÉCLARATIONS SUR L'HONNEUR & CHARTE */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>4. Assurance RC Pro, IBAN, TVA, Déclarations sur l'honneur & Charte</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600', backgroundColor: '#f3f4f6' }}>RC Pro : {profilData.statut_rc_pro}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600', backgroundColor: '#f3f4f6' }}>IBAN : {profilData.statut_iban}</span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '600', backgroundColor: '#f3f4f6' }}>TVA : {profilData.statut_tva}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Compagnie d'assurance</label>
                  <input type="text" placeholder="Ex: Hiscox, AXA..." value={profilData.assureur_nom || ''} onChange={e => setProfilData({...profilData, assureur_nom: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>N° de police / contrat</label>
                  <input type="text" value={profilData.assureur_contrat || ''} onChange={e => setProfilData({...profilData, assureur_contrat: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Plafond de garantie</label>
                  <input type="text" placeholder="Ex: 500 000 € / an" value={profilData.assureur_plafond || ''} onChange={e => setProfilData({...profilData, assureur_plafond: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expiration RC Pro</label>
                  <input type="date" value={profilData.date_expiration_rc_pro ? profilData.date_expiration_rc_pro.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_expiration_rc_pro: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Attestation RC Pro</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_rc_pro')} style={{ fontSize: '12px', marginTop: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Nom du titulaire de l'IBAN (Jamais un tiers)</label>
                  <input type="text" placeholder="Votre nom ou raison sociale" value={profilData.titulaire_iban || ''} onChange={e => setProfilData({...profilData, titulaire_iban: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>IBAN</label>
                  <input type="text" value={profilData.iban || ''} onChange={e => setProfilData({...profilData, iban: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Régime de TVA</label>
                  <select value={profilData.regime_tva || 'FRANCHISE_293B'} onChange={e => setProfilData({...profilData, regime_tva: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                    <option value="FRANCHISE_293B">Franchise en base de TVA (art. 293 B CGI)</option>
                    <option value="ASSUJETTI_TVA">Assujetti à la TVA</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>N° TVA Intracommunautaire (si assujetti)</label>
                  <input type="text" placeholder="FR..." value={profilData.numero_tva_intra || ''} onChange={e => setProfilData({...profilData, numero_tva_intra: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '14px 16px', borderRadius: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!profilData.honneur_aucune_interdiction} onChange={e => setProfilData({...profilData, honneur_aucune_interdiction: e.target.checked})} />
                  <span>Je déclare sur l'honneur ne faire l'objet d'aucune interdiction ni incapacité d'exercer une activité commerciale ou de gérer.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!profilData.honneur_pas_exclusivite_employeur} onChange={e => setProfilData({...profilData, honneur_pas_exclusivite_employeur: e.target.checked})} />
                  <span>Je déclare sur l'honneur n'être lié par aucune clause d'exclusivité ou de non-concurrence avec un employeur m'empêchant d'agir.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!profilData.honneur_pas_mandat_concurrent} onChange={e => setProfilData({...profilData, honneur_pas_mandat_concurrent: e.target.checked})} />
                  <span>Je déclare sur l'honneur ne détenir aucun mandat concurrent non déclaré (logiciels d'encaissement / gestion de salons).</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', marginTop: '4px' }}>
                  <input type="checkbox" checked={!!profilData.charte_acceptee} onChange={e => setProfilData({...profilData, charte_acceptee: e.target.checked})} />
                  <span>J'accepte la Charte Commerciale STACK (v1.0) : je m'engage à ne tenir que des promesses validées par STACK, à ne jamais signer au nom de STACK et à respecter les règles de démarchage B2B et RGPD.</span>
                </label>
              </div>

              <button type="button" onClick={() => submitEtapeConformite(4)} style={primaryBtn}>
                <Icon.Check /> Soumettre l'Étape 4 (Assurance, IBAN, TVA & Déclarations)
              </button>
            </div>

            {/* ÉTAPE 5 : FORMATION & QUIZ NF525 + CONTACT VÉRIFIÉ */}
            <form onSubmit={handleQuizSubmit} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>5. Examen de Certification STACK & Conformité Fiscale NF525</div>
                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: profilData.formation_validee ? '#dcfce7' : '#fef3c7', color: profilData.formation_validee ? '#166534' : '#92400e' }}>
                  {profilData.formation_validee ? `Validé (${profilData.quiz_score}%)` : 'Quiz requis (100% exigé)'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Q1. Quelle norme fiscale encadre obligatoirement le logiciel de caisse STACK ?</label>
                  <select required value={quizAnswers.q1} onChange={e => setQuizAnswers({...quizAnswers, q1: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Sélectionner...</option>
                    <option value="nf525">La certification NF525 (inaltérabilité, sécurisation, conservation, archivage)</option>
                    <option value="aucune">Aucune norme obligatoire</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Q2. Un agent peut-il modifier ou supprimer une transaction d'encaissement d'un salon ?</label>
                  <select required value={quizAnswers.q2} onChange={e => setQuizAnswers({...quizAnswers, q2: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Sélectionner...</option>
                    <option value="interdit">Strictement interdit (séparation étanche et zéro accès aux tables NF525)</option>
                    <option value="autorise">Autorisé sur demande du gérant</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Q3. Quel est votre statut juridique vis-à-vis de STACK ?</label>
                  <select required value={quizAnswers.q3} onChange={e => setQuizAnswers({...quizAnswers, q3: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Sélectionner...</option>
                    <option value="mandataire">Mandataire indépendant sans lien de subordination, qui ne signe jamais au nom de STACK</option>
                    <option value="salarie">Salarié habilité à engager l'entreprise</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Q4. Comment sont facturés les 99 € HT de mise en service et formation ?</label>
                  <select required value={quizAnswers.q4} onChange={e => setQuizAnswers({...quizAnswers, q4: e.target.value})} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                    <option value="">Sélectionner...</option>
                    <option value="99">Facturés directement par l'agent au salon (avec mention obligatoire du numéro RSAC)</option>
                    <option value="stack">Encaissés par STACK</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
                <input type="text" placeholder="Téléphone mobile actif" required value={profilData.telephone || ''} onChange={e => setProfilData({...profilData, telephone: e.target.value})} style={{ ...inputStyle, maxWidth: '260px' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="checkbox" required checked={!!profilData.telephone_confirme} onChange={e => setProfilData({...profilData, telephone_confirme: e.target.checked})} />
                  <span>Je confirme que mon e-mail ({profilData.email}) et mon numéro de téléphone sont actifs et vérifiés.</span>
                </label>
              </div>

              <button type="submit" style={primaryBtn}>
                <Icon.Check /> Valider le Quiz NF525 & mon contact (Étape 5)
              </button>
            </form>

            {/* ÉTAPE 6 : CHANGEMENT DE SITUATION & HISTORIQUE D'AUDIT */}
            <div style={cardStyle}>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>6. Signalement de changement de situation & Historique des vérifications</div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0' }}>
                Vous avez l'obligation de signaler tout changement de statut, d'adresse ou de forme juridique, et d'informer le greffe du RSAC de tout événement modifiant votre extrait.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <input type="text" placeholder="Décrivez votre changement de situation (nouvelle adresse, passage en société, greffe...)" value={changementMotif} onChange={e => setChangementMotif(e.target.value)} style={inputStyle} />
                <button type="button" onClick={() => { submitEtapeConformite('CHANGEMENT_SITUATION', { motif_changement: changementMotif }); setChangementMotif(''); }} style={{ ...primaryBtn, backgroundColor: '#374151' }}>
                  Déclarer un changement
                </button>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Journal d'audit des pièces</div>
              {profilData.historique?.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>Aucun événement enregistré.</div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #f3f4f6', borderRadius: '12px' }}>
                  {profilData.historique?.map(h => (
                    <div key={h.id_historique} style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', fontSize: '12.5px', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>{h.type_piece}</strong> — {h.commentaire} ({h.verifie_par})</span>
                      <span style={{ color: '#6b7280' }}>{new Date(h.date_evenement).toLocaleString('fr-FR')} [{h.statut_resultat}]</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ONGLET 5 : GOD MODE (SUPER-ADMIN) */}
        {activeTab === 'godmode' && isSuperAdmin && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em', color: '#8b5cf6' }}>God Mode (Contrôle Légal & Paiements)</h1>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Vérifiez chaque pièce dans l'ordre (Contrat, Identité, SIRET/INSEE, RSAC, Kbis, URSSAF, RC Pro, IBAN, TVA) avant d'activer un agent.</span>
            </div>

            {adminAgents.map(a => (
              <div key={a.id_agent} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: '700' }}>{a.prenom} {a.nom} ({a.code_partenaire})</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {a.email} • Tél : {a.telephone || 'N/A'} • SIRET : {a.siret_agent} ({a.forme_juridique || 'EI'}) • RSAC : {a.numero_rsac || 'Manquant'} ({a.greffe_rsac || 'Greffe N/A'})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: a.statut_compte === 'ACTIF' ? '#dcfce7' : '#fef3c7', color: a.statut_compte === 'ACTIF' ? '#166534' : '#92400e' }}>
                      Compte : {a.statut_compte}
                    </span>
                    <button onClick={() => handleVerifyPieceAdmin(a.id_agent, 'STATUT_COMPTE_FINAL', 'ACTIF')} style={{ ...primaryBtn, backgroundColor: '#8b5cf6', padding: '8px 14px', fontSize: '12.5px' }}>
                      Activer le compte (Étape 6)
                    </button>
                    <button onClick={() => handleVerifyPieceAdmin(a.id_agent, 'STATUT_COMPTE_FINAL', 'BLOQUE_CONFORMITE')} style={{ ...primaryBtn, backgroundColor: '#dc2626', padding: '8px 14px', fontSize: '12.5px' }}>
                      Bloquer
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12.5px' }}>
                  {[
                    { label: '1. Contrat signé', field: 'statut_contrat', val: a.statut_contrat, info: a.contrat_signe ? 'Signé' : 'Non signé' },
                    { label: '2a. Pièce Identité', field: 'statut_identite', val: a.statut_identite, file: a.fichier_identite, info: `Né(e): ${a.date_naissance ? a.date_naissance.slice(0,10) : '?'} | Exp: ${a.date_expiration_identite ? a.date_expiration_identite.slice(0,10) : '?'}`, rgpd: true },
                    { label: '2b. SIREN/SIRET (INSEE)', field: 'statut_siret', val: a.statut_siret, info: `${a.siret_agent} (${a.forme_juridique || 'EI'})` },
                    { label: '2c. Extrait RSAC (<3m)', field: 'statut_rsac', val: a.statut_rsac, file: a.fichier_rsac, info: `N° ${a.numero_rsac || 'Aucun'} | Émis: ${a.date_emission_rsac ? a.date_emission_rsac.slice(0,10) : '?'}` },
                    { label: '2d. Extrait Kbis (Société)', field: 'statut_kbis', val: a.statut_kbis, file: a.fichier_kbis, info: a.forme_juridique === 'SOCIETE' ? `Émis: ${a.date_emission_kbis ? a.date_emission_kbis.slice(0,10) : '?'}` : 'Non requis (EI)' },
                    { label: '3. Vigilance URSSAF', field: 'statut_urssaf', val: a.statut_urssaf, file: a.fichier_urssaf, info: `Code: ${a.code_verif_urssaf || '?'} | Exp: ${a.date_expiration_urssaf ? a.date_expiration_urssaf.slice(0,10) : '?'}` },
                    { label: '4a. Assurance RC Pro', field: 'statut_rc_pro', val: a.statut_rc_pro, file: a.fichier_rc_pro, info: `${a.assureur_nom || '?'} (${a.assureur_plafond || '?'}) | Exp: ${a.date_expiration_rc_pro ? a.date_expiration_rc_pro.slice(0,10) : '?'}` },
                    { label: '4b. IBAN & Titulaire', field: 'statut_iban', val: a.statut_iban, info: `Titulaire: ${a.titulaire_iban || '?'} | ${a.iban || ''}` },
                    { label: '4c. TVA & Déclarations', field: 'statut_tva', val: a.statut_tva, info: `${a.regime_tva || '293B'} ${a.numero_tva_intra || ''} | Quiz: ${a.quiz_score || 0}%` }
                  ].map(item => (
                    <div key={item.field} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 12px', backgroundColor: '#f9fafb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginBottom: '4px' }}>
                        <span>{item.label}</span>
                        <span style={{ color: item.val === 'VALIDE' ? '#16a34a' : (item.val === 'REFUSE' ? '#dc2626' : '#d97706') }}>{item.val || 'MANQUANT'}</span>
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '11.5px', marginBottom: '8px' }}>{item.info}</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.file && item.file.startsWith('data:') && (
                          <a href={item.file} download={`${a.nom}_${item.field}`} style={{ padding: '4px 8px', backgroundColor: '#ffffff', border: '1px solid #d1d5db', borderRadius: '6px', textDecoration: 'none', color: '#111827', fontWeight: '600' }}>Voir pièce</a>
                        )}
                        <button onClick={() => handleVerifyPieceAdmin(a.id_agent, item.field, 'VALIDE', item.rgpd)} style={{ padding: '4px 8px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                          {item.rgpd ? 'Valider + Purger RGPD' : 'Valider'}
                        </button>
                        <button onClick={() => handleVerifyPieceAdmin(a.id_agent, item.field, 'REFUSE')} style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Refuser</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '28px 0 12px 0' }}>
              Paiement des Commissions (Suspendu automatiquement si URSSAF ou RC Pro expirée)
            </div>
            <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
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
