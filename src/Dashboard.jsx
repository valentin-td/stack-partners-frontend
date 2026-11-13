// src/Dashboard.jsx
// Orchestrateur principal du portail STACK Partners

import { useState, useEffect } from 'react';
import { API_URL } from './api/config';
import { getCardStyle, inputStyle, primaryBtn, secondaryBtn } from './styles/commonStyles';
import { Icon } from './components/common/Icons';
import Navigation from './components/common/Navigation';
import Toast from './components/common/Toast';
import TabBord from './components/dashboard/TabBord';
import TabProspects from './components/dashboard/TabProspects';
import TabCarte from './components/dashboard/TabCarte';
import TabFactures from './components/dashboard/TabFactures';
import TabStock from './components/dashboard/TabStock';
import TabAcademie from './components/dashboard/TabAcademie';
import TabProfil from './components/dashboard/TabProfil';
import TabGodMode from './components/dashboard/TabGodMode';
import { DEFAULT_TUTORIALS } from './constants/tutorials';

export default function Dashboard() {
  const agent = JSON.parse(localStorage.getItem('partner_data') || '{}');
  const token = localStorage.getItem('partner_token');

  const [activeTab, setActiveTab] = useState('bord');
  const [toastMsg, setToastMsg] = useState(null);

  // Detection responsive temps reel
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const isMobile = windowWidth < 860;
  const isSmall = windowWidth < 520;

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Etats Dashboard & Commissions
  const [stats, setStats] = useState({
    kpis: {
      nb_salons_actifs: 0,
      nb_salons_essai: 0,
      seuil_deblocage: 3,
      commissions_en_attente: '0.00',
      commissions_acquises: '0.00',
      commissions_payees: '0.00'
    },
    salons: [],
    commissions: []
  });

  // Etats Factures & Prospects
  const [factures, setFactures] = useState([]);
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [factureData, setFactureData] = useState({ nom_salon: '', adresse_salon: '', siret_salon: '' });

  const [prospects, setProspects] = useState([]);
  const [showProspectForm, setShowProspectForm] = useState(false);
  const [prospectData, setProspectData] = useState({
    nom_salon: '',
    ville: '',
    code_postal: '',
    siret_prospect: '',
    telephone_salon: '',
    email_gerant: ''
  });
  const [prospectError, setProspectError] = useState('');

  // Etats Profil & KYC (Etapes 1 a 6)
  const [profilData, setProfilData] = useState({
    nom: '', prenom: '', email: '', telephone: '', siret_agent: '', numero_rsac: '', iban: '',
    statut_compte: 'EN_ATTENTE_VALIDATION', contrat_signe: false, statut_contrat: 'MANQUANT',
    date_naissance: '', date_expiration_identite: '', fichier_identite: '', statut_identite: 'MANQUANT',
    forme_juridique: 'EI', date_debut_activite: '', adresse_pro: '', statut_siret: 'MANQUANT',
    greffe_rsac: '', date_emission_rsac: '', fichier_rsac: '', statut_rsac: 'MANQUANT',
    date_emission_kbis: '', fichier_kbis: '', statut_kbis: 'NON_REQUIS',
    code_verif_urssaf: '', date_emission_urssaf: '', date_expiration_urssaf: '', fichier_urssaf: '',
    statut_urssaf: 'MANQUANT', assureur_nom: '', assureur_contrat: '', assureur_plafond: '',
    date_expiration_rc_pro: '', fichier_rc_pro: '', statut_rc_pro: 'MANQUANT',
    titulaire_iban: '', statut_iban: 'MANQUANT', regime_tva: 'FRANCHISE_293B', numero_tva_intra: '',
    statut_tva: 'MANQUANT', honneur_aucune_interdiction: false, honneur_pas_exclusivite_employeur: false,
    honneur_pas_mandat_concurrent: false, charte_acceptee: false, quiz_score: 0,
    formation_validee: false, telephone_confirme: false, autorise_a_vendre: false,
    motifs_blocage: [], alertes_expiration: [], historique: []
  });
  const [quizAnswers, setQuizAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [isYousignLoading, setIsYousignLoading] = useState(false);

  // Etats Carte Interactive
  const [mapCenter, setMapCenter] = useState({ lat: 48.5734, lng: 7.7521, label: 'Strasbourg' });
  const [mapRadius, setMapRadius] = useState(5);
  const [mapAddressQuery, setMapAddressQuery] = useState('');
  const [mapSalons, setMapSalons] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapProgress, setMapProgress] = useState(null);
  const [mapFilter, setMapFilter] = useState('TOUS');
  const [hideVisitedSalons, setHideVisitedSalons] = useState(false);
  const [mapSortBy, setMapSortBy] = useState('DISTANCE_ASC');
  const [selectedSalonMap, setSelectedSalonMap] = useState(null);
  const [leafletReady, setLeafletReady] = useState(!!(typeof window !== 'undefined' && window.L));

  // Etats CRM Terrain : Visites & Notes
  const [visiteForm, setVisiteForm] = useState({
    tag_concurrent: 'PLANITY',
    statut_visite: 'ABSENT_3MOIS',
    note_texte: ''
  });
  const [isSavingVisite, setIsSavingVisite] = useState(false);

  // Etats Planificateur de Tournee OSRM
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [routeSalons, setRouteSalons] = useState([]);
  const [routeMaxCount, setRouteMaxCount] = useState(8);
  const [routeEndQuery, setRouteEndQuery] = useState('');
  const [routeEndPoint, setRouteEndPoint] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);

  // Etats God Mode (Super-Admin)
  const isSuperAdmin =
    Number(agent?.id) === 1 ||
    Number(agent?.id_agent) === 1 ||
    String(agent?.email || '').toLowerCase().trim() === 'tardy.valentin04@gmail.com' ||
    String(profilData?.email || '').toLowerCase().trim() === 'tardy.valentin04@gmail.com';

  const [adminAgents, setAdminAgents] = useState([]);
  const [adminCommissions, setAdminCommissions] = useState([]);
  const [adminTpeCommandes, setAdminTpeCommandes] = useState([]);
  const [adminMarketStats, setAdminMarketStats] = useState({ repartition_concurrents: [], recentes_visites: [] });
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('TOUS');
  const [expandedAgentIds, setExpandedAgentIds] = useState({});
  const [quickLockForm, setQuickLockForm] = useState({ email_gerant: '', telephone_salon: '' });

  // Etats Academie
  const [academieSubTab, setAcademieSubTab] = useState('playbook');
  const [openPlaybookPhase, setOpenPlaybookPhase] = useState(0);
  const [playbookChecks, setPlaybookChecks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('stack_partner_playbook_checks_v1') || '{}');
    } catch (e) {
      return {};
    }
  });
  const [openObjectionIdx, setOpenObjectionIdx] = useState(0);
  const [sandboxLoading, setSandboxLoading] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [tutorialsList, setTutorialsList] = useState(() => {
    const saved = localStorage.getItem('stack_partner_videos_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_TUTORIALS;
  });

  const notify = (text, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const logout = () => {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_data');
    window.location.href = '/login';
  };

  // Chargement asynchrone de la librairie Leaflet
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

  // Verification de session automatique
  useEffect(() => {
    const verifierSessionPartner = () => {
      const tok = localStorage.getItem('partner_token');
      if (!tok) {
        logout();
        return;
      }
      try {
        const payload = JSON.parse(atob(tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp && payload.exp * 1000 <= Date.now()) {
          logout();
        }
      } catch (e) {
        logout();
      }
    };

    window.addEventListener('focus', verifierSessionPartner);
    document.addEventListener('visibilitychange', verifierSessionPartner);
    const interval = setInterval(verifierSessionPartner, 30000);

    return () => {
      window.removeEventListener('focus', verifierSessionPartner);
      document.removeEventListener('visibilitychange', verifierSessionPartner);
      clearInterval(interval);
    };
  }, []);

  // Synchronisation des donnees selon l onglet actif
  useEffect(() => {
    fetchProfil();
    if (activeTab === 'bord') fetchStats();
    if (activeTab === 'factures') fetchFactures();
    if (activeTab === 'prospects') fetchProspects();
    if (activeTab === 'carte') fetchMapSalons(mapCenter.lat, mapCenter.lng, mapRadius, true);
    if (activeTab === 'godmode' && isSuperAdmin) fetchAdminData();
  }, [activeTab, isSuperAdmin]);

  // Synchronisation du formulaire de visite lors du clic sur un salon de la carte
  useEffect(() => {
    if (selectedSalonMap) {
      const v = selectedSalonMap.visite_info;
      setVisiteForm({
        tag_concurrent: v?.tag_concurrent && v.tag_concurrent !== 'NON_RENSEIGNE' ? v.tag_concurrent : 'PLANITY',
        statut_visite: v?.statut_visite && v.statut_visite !== 'NOTE_SIMPLE' ? v.statut_visite : 'ABSENT_3MOIS',
        note_texte: v?.note_texte || ''
      });
    }
  }, [selectedSalonMap?.siret]);

  // Actions Dashboard & Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const raw = await res.json();
        const vraisSalons = (raw.salons || []).filter(
          (s) =>
            !s.est_bac_a_sable &&
            !(s.email_gerant || '').includes('@stack-sim.fr') &&
            !(s.nom_salon || '').includes('Maison Éclat') &&
            !(s.nom_salon || '').includes('Entraînement') &&
            !(s.nom_salon || '').includes('Salon Vierge') &&
            !(s.nom_salon || '').includes('Onboarding')
        );
        const salonsPayants = vraisSalons.filter(
          (s) => s.statut_abonnement === 'actif' && s.plan_actuel !== 'PREMIUM_TRIAL'
        );
        const salonsEssai = vraisSalons.filter(
          (s) => s.plan_actuel === 'PREMIUM_TRIAL' || s.statut_abonnement !== 'actif'
        );
        const vraiesCom = (raw.commissions || []).filter(
          (c) =>
            !(c.nom_salon || '').includes("Salon Vierge d'Entraînement") &&
            !(c.nom_salon || '').includes('Maison Éclat — Démo') &&
            !(c.nom_salon || '').includes('Salon Test Onboarding')
        );
        setStats({
          kpis: {
            ...raw.kpis,
            nb_salons_actifs: salonsPayants.length,
            nb_salons_essai: salonsEssai.length
          },
          salons: vraisSalons,
          commissions: vraiesCom
        });
      }
    } catch (e) {
      console.error('Erreur chargement stats:', e);
    }
  };

  // Actions Factures
  const fetchFactures = async () => {
    try {
      const res = await fetch(`${API_URL}/factures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setFactures(await res.json());
    } catch (e) {
      console.error('Erreur chargement factures:', e);
    }
  };

  const handleCreateFacture = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/factures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(factureData)
      });
      if (res.ok) {
        setShowFactureForm(false);
        setFactureData({ nom_salon: '', adresse_salon: '', siret_salon: '' });
        fetchFactures();
        notify('Facture générée avec succès.');
      } else {
        const data = await res.json().catch(() => ({}));
        notify(data.error || 'Dossier de conformité incomplet.', true);
      }
    } catch (e) {
      notify('Erreur réseau lors de la création de facture.', true);
    }
  };

  const handleDownload = async (id, numero) => {
    try {
      const res = await fetch(`${API_URL}/factures/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${numero}.pdf`;
        a.click();
      }
    } catch (e) {
      notify('Erreur lors du téléchargement du PDF.', true);
    }
  };

  const handleSendFactureEmail = async (id, nomSalon) => {
    const emailSaisi = prompt(`À quelle adresse e-mail envoyer la facture PDF pour "${nomSalon}" ?`);
    if (!emailSaisi || !emailSaisi.trim()) return;
    try {
      const res = await fetch(`${API_URL}/factures/${id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email_destinataire: emailSaisi.trim() })
      });
      const data = await res.json();
      if (res.ok) notify(data.message || 'Facture envoyée par e-mail !');
      else notify(data.error || "Erreur lors de l'envoi de l'e-mail.", true);
    } catch (e) {
      notify("Erreur réseau lors de l'envoi de l'e-mail.", true);
    }
  };

  const handlePay = async (id) => {
    try {
      await fetch(`${API_URL}/factures/${id}/payee`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFactures();
      notify('Virement validé.');
    } catch (e) {
      notify('Erreur lors de la validation du paiement.', true);
    }
  };

  // Actions Prospects
  const fetchProspects = async () => {
    try {
      const res = await fetch(`${API_URL}/prospects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setProspects(await res.json());
    } catch (e) {
      console.error('Erreur chargement prospects:', e);
    }
  };

  const handleCreateProspect = async (e) => {
    e.preventDefault();
    setProspectError('');
    try {
      const res = await fetch(`${API_URL}/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(prospectData)
      });
      if (res.ok) {
        setShowFactureForm(false);
        setProspectData({
          nom_salon: '',
          ville: '',
          code_postal: '',
          siret_prospect: '',
          telephone_salon: '',
          email_gerant: ''
        });
        fetchProspects();
        notify('Prospect protégé pour 45 jours.');
      } else {
        const err = await res.json();
        setProspectError(err.error || 'Erreur lors de la réservation');
      }
    } catch (e) {
      setProspectError('Erreur réseau lors de la réservation du prospect.');
    }
  };

  const handleOnboarding = async (id_prospect) => {
    try {
      const res = await fetch(`${API_URL}/prospects/${id_prospect}/onboarding`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      navigator.clipboard?.writeText(data.lien);
      notify(`Lien copié : ${data.lien}`);
      fetchProspects();
    } catch (err) {
      notify(err.message, true);
    }
  };

  // Actions Carte de Prospection
  const fetchMapSalons = async (
    lat = mapCenter.lat,
    lng = mapCenter.lng,
    radius = mapRadius,
    isNewCenter = false
  ) => {
    if (window.__mapAbortController) {
      try {
        window.__mapAbortController.abort();
      } catch (e) {}
    }
    const ac = new AbortController();
    window.__mapAbortController = ac;

    setMapLoading(true);
    setMapProgress(0);
    if (isNewCenter) setMapSalons([]);

    let currentStep = 0;
    let keepFetching = true;
    let hasLoadedAtLeastOneStep = false;
    const maxStepAllowed = isMobile ? 2 : 5;

    try {
      while (keepFetching && !ac.signal.aborted) {
        let res = null;
        try {
          res = await fetch(
            `${API_URL}/map-salons?lat=${lat}&lng=${lng}&radius=${radius}&step=${currentStep}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              signal: ac.signal
            }
          );
        } catch (netErr) {
          if (ac.signal.aborted) return;
          if (hasLoadedAtLeastOneStep) break;
          throw netErr;
        }

        if (!res || !res.ok) {
          if (hasLoadedAtLeastOneStep) break;
          throw new Error(`HTTP ${res?.status || 'Network'}`);
        }

        const data = await res.json();
        hasLoadedAtLeastOneStep = true;

        setMapSalons((prev) => {
          const prevSalons = isNewCenter && currentStep === 0 ? [] : prev;
          const merged = new Map(prevSalons.map((s) => [s.siret, s]));
          (data.salons || []).forEach((s) => merged.set(s.siret, s));
          return Array.from(merged.values()).sort(
            (a, b) => parseFloat(a.distance_km) - parseFloat(b.distance_km)
          );
        });

        if (currentStep === 0) setMapLoading(false);

        if (data.nextStep !== null && data.nextStep !== undefined && currentStep < maxStepAllowed) {
          currentStep = data.nextStep;
          setMapProgress(currentStep);
        } else {
          keepFetching = false;
          setMapProgress(6);
          setTimeout(() => setMapProgress(null), 2000);
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError' && !ac.signal.aborted && !hasLoadedAtLeastOneStep) {
        notify('Connexion lente au serveur de carte, nouvel essai...', true);
      }
    } finally {
      if (!ac.signal.aborted) {
        setMapLoading(false);
        setMapProgress(null);
      }
    }
  };

  const handleGeolocateAgent = () => {
    if (!navigator.geolocation) return notify('Géolocalisation non supportée.', true);
    setMapLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCenter = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Ma position GPS'
        };
        setMapCenter(nextCenter);
        fetchMapSalons(nextCenter.lat, nextCenter.lng, mapRadius, true);
      },
      () => {
        setMapLoading(false);
        notify('Autorisez la localisation ou saisissez une adresse.', true);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearchAddressMap = async (e) => {
    e.preventDefault();
    if (!mapAddressQuery.trim()) return;
    setMapLoading(true);
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(mapAddressQuery)}&limit=1`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        const label = data.features[0].properties.label;
        setMapCenter({ lat, lng, label });
        fetchMapSalons(lat, lng, mapRadius, true);
      } else {
        setMapLoading(false);
        notify('Adresse introuvable.', true);
      }
    } catch (err) {
      setMapLoading(false);
      notify("Erreur lors de la recherche d'adresse.", true);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setMapRadius(newRadius);
    fetchMapSalons(mapCenter.lat, mapCenter.lng, newRadius, false);
  };

  const handleQuickLockFromMap = async (e) => {
    e.preventDefault();
    if (!selectedSalonMap) return;
    try {
      const res = await fetch(`${API_URL}/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        setMapSalons((prev) =>
          prev.map((s) =>
            s.siret === selectedSalonMap.siret
              ? { ...s, statut_carte: 'PROSPECTE_MOI', jours_restants: 45, id_prospect: data.id_prospect }
              : s
          )
        );
        setSelectedSalonMap((prev) =>
          prev
            ? { ...prev, statut_carte: 'PROSPECTE_MOI', jours_restants: 45, id_prospect: data.id_prospect }
            : null
        );
      } else {
        notify(data.error || 'Verrouillage impossible.', true);
      }
    } catch (e) {
      notify('Erreur réseau lors du verrouillage.', true);
    }
  };

  const handleSaveVisiteOrNote = async (validerPassagePhysique = false, forceAdmin = false) => {
    if (!selectedSalonMap) return;
    setIsSavingVisite(true);

    const sendRequest = async (latAgent = null, lngAgent = null) => {
      try {
        const res = await fetch(`${API_URL}/visites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            siret_salon: selectedSalonMap.siret,
            nom_salon: selectedSalonMap.nom_salon,
            ville: selectedSalonMap.ville,
            lat_salon: selectedSalonMap.lat,
            lng_salon: selectedSalonMap.lng,
            tag_concurrent: visiteForm.tag_concurrent,
            statut_visite: visiteForm.statut_visite,
            note_texte: visiteForm.note_texte,
            valider_passage_physique: validerPassagePhysique,
            lat_agent: latAgent,
            lng_agent: lngAgent,
            force_super_admin: forceAdmin
          })
        });
        const data = await res.json();
        if (!res.ok) {
          notify(data.error || 'Impossible de valider la visite.', true);
          return;
        }
        notify(data.message);
        const nextStatut = validerPassagePhysique ? 'VISITE_MOI' : selectedSalonMap.statut_carte;
        setMapSalons((prev) =>
          prev.map((s) =>
            s.siret === selectedSalonMap.siret
              ? { ...s, statut_carte: nextStatut, visite_info: data.visite_info }
              : s
          )
        );
        setSelectedSalonMap((prev) =>
          prev ? { ...prev, statut_carte: nextStatut, visite_info: data.visite_info } : null
        );
      } catch (e) {
        notify("Erreur réseau lors de l'enregistrement.", true);
      } finally {
        setIsSavingVisite(false);
      }
    };

    if (validerPassagePhysique && !forceAdmin) {
      if (!navigator.geolocation) {
        setIsSavingVisite(false);
        return notify('Géolocalisation requise pour certifier une visite à moins de 100m.', true);
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => sendRequest(pos.coords.latitude, pos.coords.longitude),
        () => {
          setIsSavingVisite(false);
          notify(
            'Activez votre GPS pour vérifier que vous êtes à moins de 100 mètres du salon.',
            true
          );
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      await sendRequest(mapCenter.lat, mapCenter.lng);
    }
  };

  const toggleSalonInRoute = (salon) => {
    setOptimizedRoute(null);
    setRouteSalons((prev) => {
      const exists = prev.some((s) => s.siret === salon.siret);
      if (exists) return prev.filter((s) => s.siret !== salon.siret);
      if (prev.length >= 15) {
        notify('Maximum 15 salons par tournée pour garantir un guidage GPS fluide.', true);
        return prev;
      }
      return [...prev, salon];
    });
  };

  const handleAutoSelectRouteSalons = () => {
    const candidates = mapSalons
      .filter(
        (s) =>
          parseFloat(s.distance_km) <= mapRadius &&
          s.statut_carte === 'LIBRE' &&
          !s.visite_info?.est_visite_physique
      )
      .slice(0, routeMaxCount);
    if (candidates.length === 0)
      return notify('Aucun salon libre non visité dans ce périmètre.', true);
    setRouteSalons(candidates);
    setOptimizedRoute(null);
    notify(`${candidates.length} salons sélectionnés. Cliquez sur "Optimiser l'itinéraire".`);
  };

  const handleOptimizeTournee = async () => {
    if (routeSalons.length === 0)
      return notify('Ajoutez d abord des salons ou cliquez sur Sélection Auto.', true);
    setIsOptimizingRoute(true);
    try {
      let resolvedEnd = routeEndPoint;
      if (routeEndQuery.trim() && !resolvedEnd) {
        const gRes = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(routeEndQuery)}&limit=1`
        );
        const gData = await gRes.json();
        if (gData.features?.length > 0) {
          const [lng, lat] = gData.features[0].geometry.coordinates;
          resolvedEnd = { lat, lng, label: gData.features[0].properties.label };
          setRouteEndPoint(resolvedEnd);
        }
      }

      const res = await fetch(`${API_URL}/tournee/optimiser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          startPoint: mapCenter,
          endPoint: resolvedEnd || mapCenter,
          salons: routeSalons
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'optimisation");
      setOptimizedRoute(data);
      setRouteSalons(data.orderedSalons || routeSalons);
      notify(`Tournée optimisée : ${data.total_distance_km} km (${data.estimated_minutes} min).`);
    } catch (e) {
      notify(e.message, true);
    } finally {
      setIsOptimizingRoute(false);
    }
  };

  // Actions Profil & KYC
  const fetchProfil = async () => {
    try {
      const res = await fetch(`${API_URL}/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setProfilData(await res.json());
    } catch (e) {
      console.error('Erreur chargement profil:', e);
    }
  };

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024)
      return notify('Fichier trop volumineux (max 8 Mo).', true);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1400;
          let w = img.width,
            h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setProfilData((prev) => ({ ...prev, [fieldName]: compressedDataUrl }));
          notify(`Pièce "${file.name}" optimisée et prête. Cliquez sur Enregistrer l'étape.`);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilData((prev) => ({ ...prev, [fieldName]: reader.result }));
      notify(`Pièce "${file.name}" prête. Cliquez sur Enregistrer l'étape.`);
    };
    reader.readAsDataURL(file);
  };

  const openUploadedDocument = (fileData) => {
    if (!fileData || typeof fileData !== 'string')
      return notify('Aucun document disponible.', true);
    if (fileData.startsWith('http://') || fileData.startsWith('https://')) {
      window.open(fileData, '_blank', 'noopener,noreferrer');
      return;
    }
    if (fileData.startsWith('data:')) {
      try {
        const arr = fileData.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const blobUrl = URL.createObjectURL(new Blob([u8arr], { type: mime }));
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        notify("Impossible d'ouvrir la pièce.", true);
      }
    }
  };

  const handleYousignSignature = async () => {
    setIsYousignLoading(true);
    try {
      const res = await fetch(`${API_URL}/profil/yousign/initiate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        alert(`CRASH DU SERVEUR (HTTP ${res.status}) :\n\n` + text.substring(0, 300));
        return;
      }

      if (res.ok) {
        const targetUrl = data.redirect_url || data.signatureLink;
        if (targetUrl) {
          await fetchProfil();
          window.location.assign(targetUrl);
          return;
        } else {
          alert(
            "ERREUR : Le serveur a répondu OK mais aucun lien Yousign n'a été trouvé dans la réponse :\n\n" +
              JSON.stringify(data)
          );
        }
      } else {
        alert(
          `YOUSIGN A REJETÉ LA DEMANDE (HTTP ${res.status}) :\n\n` +
            (data.error || JSON.stringify(data))
        );
      }
    } catch (e) {
      alert('ERREUR RÉSEAU OU SERVEUR INJOIGNABLE :\n\n' + e.message);
    } finally {
      setIsYousignLoading(false);
    }
  };

  const handleCheckYousign = async () => {
    setIsYousignLoading(true);
    try {
      const res = await fetch(`${API_URL}/profil/yousign/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        alert(`ERREUR SERVEUR CHECK (HTTP ${res.status}) :\n\n` + text.substring(0, 300));
        return;
      }
      if (res.ok && data.status === 'done') {
        notify(data.message || 'Félicitations, contrat validé !');
        fetchProfil();
      } else {
        alert(
          `STATUT ACTUEL SUR YOUSIGN : "${data.status || 'inconnu'}"\n\n` +
            (data.message ||
              data.error ||
              "Vous n'avez pas encore terminé la signature sur la page Yousign.")
        );
      }
    } catch (e) {
      alert('Erreur réseau lors de la vérification : ' + e.message);
    } finally {
      setIsYousignLoading(false);
    }
  };

  const submitEtapeConformite = async (etape, customPayload = null) => {
    try {
      const rawPayload = { ...(customPayload || profilData) };
      const formData = new FormData();
      formData.append('etape', String(etape));

      const fileFields = [
        'fichier_identite',
        'fichier_rsac',
        'fichier_kbis',
        'fichier_urssaf',
        'fichier_rc_pro'
      ];
      for (const field of fileFields) {
        const val = rawPayload[field];
        if (typeof val === 'string' && val.startsWith('data:')) {
          const match = val.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mime = match[1];
            const bstr = atob(match[2]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            const ext = mime.includes('png')
              ? 'png'
              : mime.includes('jpeg') || mime.includes('jpg')
              ? 'jpg'
              : 'pdf';
            formData.append(field, new Blob([u8arr], { type: mime }), `${field}.${ext}`);
            delete rawPayload[field];
          }
        }
      }

      formData.append('payload', JSON.stringify(rawPayload));

      const res = await fetch(`${API_URL}/profil/etape`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: text.substring(0, 200) };
      }

      if (res.ok) {
        notify(data.message || `Étape ${etape} enregistrée avec succès !`);
        await fetchProfil();
      } else {
        notify(data.error || `Erreur (${res.status}) lors de l'enregistrement.`, true);
        alert(
          `Erreur d'enregistrement (Étape ${etape}) :\n\n` +
            (data.error || text.substring(0, 200))
        );
      }
    } catch (err) {
      notify('Erreur réseau : ' + err.message, true);
      alert("Erreur réseau lors de l'enregistrement :\n\n" + err.message);
    }
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const score =
      (quizAnswers.q1 === 'nf525' ? 25 : 0) +
      (quizAnswers.q2 === 'interdit' ? 25 : 0) +
      (quizAnswers.q3 === 'mandataire' ? 25 : 0) +
      (quizAnswers.q4 === '99' ? 25 : 0);
    if (score < 100) return notify(`Score insuffisant (${score}/100). 100% exigé.`, true);
    submitEtapeConformite(5, {
      telephone: profilData.telephone,
      quiz_score: 100,
      telephone_confirme: profilData.telephone_confirme
    });
  };

  const renderFilePreviewBadge = (fileValue, label) => {
    if (!fileValue || typeof fileValue !== 'string') return null;
    return (
      <button
        type="button"
        onClick={() => openUploadedDocument(fileValue)}
        style={{
          marginTop: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 10px',
          borderRadius: '8px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          fontSize: '11.5px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        <Icon.Eye /> Voir ({label})
      </button>
    );
  };

  // Actions Academie & Simulateurs
  const togglePlaybookStep = (stepKey) => {
    setPlaybookChecks((prev) => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      localStorage.setItem('stack_partner_playbook_checks_v1', JSON.stringify(next));
      return next;
    });
  };

  const resetPlaybookChecks = () => {
    setPlaybookChecks({});
    localStorage.removeItem('stack_partner_playbook_checks_v1');
    notify("Checklist d'onboarding réinitialisée pour votre prochain salon client.");
  };

  const handleUpdateVideoUrl = (id) => {
    const current = tutorialsList.find((v) => v.id === id);
    const nextUrl = prompt(
      "Collez l'URL de la vidéo (YouTube, Loom ou lien MP4) :",
      current?.embedUrl || ''
    );
    if (nextUrl && nextUrl.trim()) {
      let formatted = nextUrl.trim();
      if (formatted.includes('youtube.com/watch?v=')) {
        const vidId = new URL(formatted).searchParams.get('v');
        if (vidId) formatted = `https://www.youtube.com/embed/${vidId}`;
      } else if (formatted.includes('loom.com/share/')) {
        formatted = formatted.replace('loom.com/share/', 'loom.com/embed/');
      }
      const updated = tutorialsList.map((v) => (v.id === id ? { ...v, embedUrl: formatted } : v));
      setTutorialsList(updated);
      localStorage.setItem('stack_partner_videos_v1', JSON.stringify(updated));
      notify('Lien vidéo mis à jour.');
    }
  };

  const handleLaunchSandbox = async (type, action = 'LAUNCH') => {
    const loaderKey = `${type}_${action}`;
    setSandboxLoading(loaderKey);
    try {
      const res = await fetch(`${API_URL}/sandbox/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur sur le simulateur');

      if (action === 'SAVE_CUSTOM') {
        notify('Configuration du salon de démo sauvegardée !');
      } else {
        notify(
          action === 'RESET_CUSTOM'
            ? 'Salon restauré selon votre sauvegarde !'
            : action === 'RESET_DEFAULT'
            ? "Salon remis à l'état d'usine STACK !"
            : `Environnement "${data.nom_salon}" ouvert !`
        );
        window.open(data.url_directe, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSandboxLoading(null);
    }
  };

  const handlePurgeAllSandboxes = async () => {
    if (
      !confirm(
        "Purger tous les salons d'entraînement de la base de données (Sécurité Contrôle NF525) ?"
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/sandbox/purge-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) notify('Tous les salons bac à sable ont été purgés.');
      else notify('Erreur lors de la purge.', true);
    } catch (e) {
      notify('Erreur réseau lors de la purge.', true);
    }
  };

  // Actions God Mode (Super-Admin)
  const fetchAdminData = async () => {
    try {
      const resAgents = await fetch(`${API_URL}/admin/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resAgents.ok) {
        const dataAgents = await resAgents.json();
        const list = Array.isArray(dataAgents) ? dataAgents : dataAgents.agents || [];
        setAdminAgents(list);
        if (list.length > 0) {
          setExpandedAgentIds((prev) =>
            Object.keys(prev).length === 0 ? { [list[0].id_agent]: true } : prev
          );
        }
      }
      const resCom = await fetch(`${API_URL}/admin/commissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resCom.ok) {
        const dataCom = await resCom.json();
        setAdminCommissions(Array.isArray(dataCom) ? dataCom : dataCom.commissions || []);
      }
      const resMarket = await fetch(`${API_URL}/admin/market-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resMarket.ok) {
        setAdminMarketStats(await resMarket.json());
      }
      const resTpe = await fetch(`${API_URL}/admin/tpe-commandes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resTpe.ok) {
        const dataTpe = await resTpe.json();
        setAdminTpeCommandes(Array.isArray(dataTpe) ? dataTpe : []);
      }
    } catch (err) {
      console.error('Erreur chargement God Mode:', err);
    }
  };

  const handleVerifyPieceAdmin = async (
    idAgent,
    champ_statut,
    decision,
    purge_identite_rgpd = false
  ) => {
    const commentaire =
      decision === 'REFUSE'
        ? prompt("Motif du refus (affiché à l'agent) :") || 'Pièce non conforme'
        : 'Vérifié et validé par la direction STACK';
    try {
      const res = await fetch(`${API_URL}/admin/agents/${idAgent}/verifier-piece`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ champ_statut, decision, commentaire, purge_identite_rgpd })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        notify(data.message || 'Pièce validée !');
        fetchAdminData();
        fetchProfil();
      } else {
        notify(data.error || 'Action refusée', true);
        alert(
          'Erreur lors de la validation God Mode :\n\n' +
            (data.error || `Statut HTTP ${res.status}`)
        );
      }
    } catch (e) {
      alert('Erreur réseau God Mode : ' + e.message);
    }
  };

  const handlePayCommission = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/commissions/${id}/payer`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        fetchAdminData();
        notify('Commission marquée comme payée.');
      } else {
        notify(data.error || 'Paiement bloqué', true);
      }
    } catch (e) {
      notify('Erreur réseau.', true);
    }
  };

  const handleExpedierTpe = async (id) => {
    try {
      const res = await fetch(`${API_URL}/admin/tpe-commandes/${id}/expedier`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify('Commande expédiée ! Le stock de l agent a été automatiquement crédité.');
        fetchAdminData();
      } else {
        const data = await res.json();
        notify(data.error || "Erreur lors de l'expédition", true);
      }
    } catch (e) {
      notify('Erreur réseau.', true);
    }
  };

  // Calculs derives God Mode
  const getAgentPiecesList = (a) => [
    {
      label: 'Contrat de Mandat',
      step: 'Étape 1',
      field: 'statut_contrat',
      val: a.statut_contrat,
      info: a.contrat_signe ? 'Signé électroniquement' : 'Non signé'
    },
    {
      label: 'Pièce d’Identité',
      step: 'Étape 2a',
      field: 'statut_identite',
      val: a.statut_identite,
      file: a.fichier_identite,
      info: `Né(e): ${a.date_naissance ? a.date_naissance.slice(0, 10) : '—'} • Exp: ${
        a.date_expiration_identite ? a.date_expiration_identite.slice(0, 10) : '—'
      }`,
      rgpd: true
    },
    {
      label: 'SIREN / SIRET (INSEE)',
      step: 'Étape 2b',
      field: 'statut_siret',
      val: a.statut_siret,
      info: `SIRET : ${a.siret_agent || '—'} (${a.forme_juridique || 'EI'})`
    },
    {
      label: 'Extrait RSAC (< 3 mois)',
      step: 'Étape 2c',
      field: 'statut_rsac',
      val: a.statut_rsac,
      file: a.fichier_rsac,
      info: `RSAC : ${a.numero_rsac || '—'} (${a.greffe_rsac || 'Greffe N/A'})`
    },
    {
      label: 'Extrait Kbis (Société)',
      step: 'Étape 2d',
      field: 'statut_kbis',
      val: a.forme_juridique === 'SOCIETE' ? a.statut_kbis : 'VALIDE',
      file: a.fichier_kbis,
      info:
        a.forme_juridique === 'SOCIETE'
          ? `Émis: ${a.date_emission_kbis ? a.date_emission_kbis.slice(0, 10) : '—'}`
          : 'Non requis (Entrepreneur Individuel)'
    },
    {
      label: 'Vigilance URSSAF',
      step: 'Étape 3',
      field: 'statut_urssaf',
      val: a.statut_urssaf,
      file: a.fichier_urssaf,
      info: `Code : ${a.code_verif_urssaf || '—'} • Exp: ${
        a.date_expiration_urssaf ? a.date_expiration_urssaf.slice(0, 10) : '—'
      }`
    },
    {
      label: 'Assurance RC Pro',
      step: 'Étape 4a',
      field: 'statut_rc_pro',
      val: a.statut_rc_pro,
      file: a.fichier_rc_pro,
      info: `${a.assureur_nom || 'Assureur N/A'} (${a.assureur_plafond || '—'})`
    },
    {
      label: 'IBAN & Titulaire',
      step: 'Étape 4b',
      field: 'statut_iban',
      val: a.statut_iban,
      info: `${a.titulaire_iban || 'Titulaire N/A'} • ${a.iban || 'IBAN manquant'}`
    },
    {
      label: 'TVA, Charte & Quiz NF525',
      step: 'Étape 5',
      field: 'statut_tva',
      val: a.statut_tva,
      info: `${a.regime_tva || '293B'} • Quiz NF525 : ${a.quiz_score || 0}%`
    }
  ];

  const filteredAdminAgents = adminAgents.filter((a) => {
    const q = adminSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      (a.nom || '').toLowerCase().includes(q) ||
      (a.prenom || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.code_partenaire || '').toLowerCase().includes(q) ||
      (a.siret_agent || '').includes(q);
    if (!matchSearch) return false;
    if (adminStatusFilter === 'ACTIFS') return a.statut_compte === 'ACTIF';
    if (adminStatusFilter === 'BLOQUES') return a.statut_compte === 'BLOQUE_CONFORMITE';
    if (adminStatusFilter === 'A_VERIFIER') return a.statut_compte !== 'ACTIF';
    return true;
  });

  const totalPendingPieces = adminAgents.reduce((acc, a) => {
    const pieces = getAgentPiecesList(a);
    return acc + pieces.filter((p) => p.val !== 'VALIDE' && p.val !== 'NON_REQUIS').length;
  }, 0);

  const totalCommissionsToPay = adminCommissions
    .reduce((acc, c) => acc + parseFloat(c.montant_commission || 0), 0)
    .toFixed(2);

  const progressionPourcent = Math.min(
    100,
    Math.round((stats.kpis.nb_salons_actifs / stats.kpis.seuil_deblocage) * 100)
  );

  const cardStyle = getCardStyle(isMobile);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#f6f6f7',
        color: '#111827',
        paddingBottom: isMobile ? '84px' : '0'
      }}
    >
      {/* Navigation Desktop & Mobile */}
      <Navigation
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agent={agent}
        profilData={profilData}
        isSuperAdmin={isSuperAdmin}
        onLogout={logout}
      />

      {/* Zone de contenu principale */}
      <div
        style={{
          flex: 1,
          padding: isMobile ? '18px 14px' : '40px 48px',
          maxWidth: '1180px',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Toast Flottant */}
        <Toast toastMsg={toastMsg} isMobile={isMobile} />

        {/* Onglet 1 : Tableau de bord */}
        {activeTab === 'bord' && (
          <TabBord
            stats={stats}
            isMobile={isMobile}
            isSmall={isSmall}
            cardStyle={cardStyle}
            progressionPourcent={progressionPourcent}
          />
        )}

        {/* Onglet 2 : Prospects & Leads */}
        {activeTab === 'prospects' && (
          <TabProspects
            prospects={prospects}
            showProspectForm={showProspectForm}
            setShowProspectForm={setShowProspectForm}
            prospectData={prospectData}
            setProspectData={setProspectData}
            prospectError={prospectError}
            handleCreateProspect={handleCreateProspect}
            handleOnboarding={handleOnboarding}
            isMobile={isMobile}
            primaryBtn={primaryBtn}
            inputStyle={inputStyle}
            cardStyle={cardStyle}
          />
        )}

        {/* Onglet 3 : Carte Interactive de Prospection */}
        {activeTab === 'carte' && (
          <TabCarte
            mapCenter={mapCenter}
            mapRadius={mapRadius}
            handleRadiusChange={handleRadiusChange}
            mapAddressQuery={mapAddressQuery}
            setMapAddressQuery={setMapAddressQuery}
            handleSearchAddressMap={handleSearchAddressMap}
            mapSalons={mapSalons}
            mapLoading={mapLoading}
            mapProgress={mapProgress}
            mapFilter={mapFilter}
            setMapFilter={setMapFilter}
            hideVisitedSalons={hideVisitedSalons}
            setHideVisitedSalons={setHideVisitedSalons}
            mapSortBy={mapSortBy}
            setMapSortBy={setMapSortBy}
            selectedSalonMap={selectedSalonMap}
            setSelectedSalonMap={setSelectedSalonMap}
            visiteForm={visiteForm}
            setVisiteForm={setVisiteForm}
            isSavingVisite={isSavingVisite}
            handleSaveVisiteOrNote={handleSaveVisiteOrNote}
            quickLockForm={quickLockForm}
            setQuickLockForm={setQuickLockForm}
            handleQuickLockFromMap={handleQuickLockFromMap}
            handleGeolocateAgent={handleGeolocateAgent}
            showRoutePlanner={showRoutePlanner}
            setShowRoutePlanner={setShowRoutePlanner}
            routeSalons={routeSalons}
            setRouteSalons={setRouteSalons}
            toggleSalonInRoute={toggleSalonInRoute}
            handleAutoSelectRouteSalons={handleAutoSelectRouteSalons}
            routeMaxCount={routeMaxCount}
            setRouteMaxCount={setRouteMaxCount}
            routeEndQuery={routeEndQuery}
            setRouteEndQuery={setRouteEndQuery}
            routeEndPoint={routeEndPoint}
            setRouteEndPoint={setRouteEndPoint}
            optimizedRoute={optimizedRoute}
            setOptimizedRoute={setOptimizedRoute}
            isOptimizingRoute={isOptimizingRoute}
            handleOptimizeTournee={handleOptimizeTournee}
            setFactureData={setFactureData}
            setShowFactureForm={setShowFactureForm}
            setActiveTab={setActiveTab}
            isSuperAdmin={isSuperAdmin}
            isMobile={isMobile}
            isSmall={isSmall}
            primaryBtn={primaryBtn}
            secondaryBtn={secondaryBtn}
            inputStyle={inputStyle}
            cardStyle={cardStyle}
            leafletReady={leafletReady}
          />
        )}

        {/* Onglet 4 : Factures d'installation */}
        {activeTab === 'factures' && (
          <TabFactures
            factures={factures}
            showFactureForm={showFactureForm}
            setShowFactureForm={setShowFactureForm}
            factureData={factureData}
            setFactureData={setFactureData}
            handleCreateFacture={handleCreateFacture}
            handleDownload={handleDownload}
            handleSendFactureEmail={handleSendFactureEmail}
            handlePay={handlePay}
            isMobile={isMobile}
            primaryBtn={primaryBtn}
            secondaryBtn={secondaryBtn}
            inputStyle={inputStyle}
            cardStyle={cardStyle}
          />
        )}

        {/* Onglet 5 : Stock & TPE */}
        {activeTab === 'stock' && (
          <TabStock apiBaseUrl={API_URL} token={token} isMobile={isMobile} />
        )}

        {/* Onglet 6 : Academie & Tutoriels */}
        {activeTab === 'academie' && (
          <TabAcademie
            agent={agent}
            academieSubTab={academieSubTab}
            setAcademieSubTab={setAcademieSubTab}
            openPlaybookPhase={openPlaybookPhase}
            setOpenPlaybookPhase={setOpenPlaybookPhase}
            playbookChecks={playbookChecks}
            togglePlaybookStep={togglePlaybookStep}
            resetPlaybookChecks={resetPlaybookChecks}
            openObjectionIdx={openObjectionIdx}
            setOpenObjectionIdx={setOpenObjectionIdx}
            sandboxLoading={sandboxLoading}
            handleLaunchSandbox={handleLaunchSandbox}
            tutorialsList={tutorialsList}
            handleUpdateVideoUrl={handleUpdateVideoUrl}
            activeVideoModal={activeVideoModal}
            setActiveVideoModal={setActiveVideoModal}
            handlePurgeAllSandboxes={handlePurgeAllSandboxes}
            isSuperAdmin={isSuperAdmin}
            isMobile={isMobile}
            primaryBtn={primaryBtn}
            secondaryBtn={secondaryBtn}
            cardStyle={cardStyle}
          />
        )}

        {/* Onglet 7 : Profil & Dossier KYC */}
        {activeTab === 'profil' && (
          <TabProfil
            profilData={profilData}
            setProfilData={setProfilData}
            submitEtapeConformite={submitEtapeConformite}
            handleYousignSignature={handleYousignSignature}
            handleCheckYousign={handleCheckYousign}
            isYousignLoading={isYousignLoading}
            handleFileUpload={handleFileUpload}
            renderFilePreviewBadge={renderFilePreviewBadge}
            quizAnswers={quizAnswers}
            setQuizAnswers={setQuizAnswers}
            handleQuizSubmit={handleQuizSubmit}
            isMobile={isMobile}
            primaryBtn={primaryBtn}
            secondaryBtn={secondaryBtn}
            inputStyle={inputStyle}
            cardStyle={cardStyle}
          />
        )}

        {/* Onglet 8 : God Mode (Super-Admin) */}
        {activeTab === 'godmode' && isSuperAdmin && (
          <TabGodMode
            adminAgents={adminAgents}
            adminCommissions={adminCommissions}
            adminTpeCommandes={adminTpeCommandes}
            adminMarketStats={adminMarketStats}
            adminSearch={adminSearch}
            setAdminSearch={setAdminSearch}
            adminStatusFilter={adminStatusFilter}
            setAdminStatusFilter={setAdminStatusFilter}
            expandedAgentIds={expandedAgentIds}
            setExpandedAgentIds={setExpandedAgentIds}
            filteredAdminAgents={filteredAdminAgents}
            totalPendingPieces={totalPendingPieces}
            totalCommissionsToPay={totalCommissionsToPay}
            getAgentPiecesList={getAgentPiecesList}
            handleVerifyPieceAdmin={handleVerifyPieceAdmin}
            handlePayCommission={handlePayCommission}
            handleExpedierTpe={handleExpedierTpe}
            openUploadedDocument={openUploadedDocument}
            fetchAdminData={fetchAdminData}
            isMobile={isMobile}
            isSmall={isSmall}
            primaryBtn={primaryBtn}
            secondaryBtn={secondaryBtn}
            inputStyle={inputStyle}
            cardStyle={cardStyle}
          />
        )}
      </div>
    </div>
  );
}
