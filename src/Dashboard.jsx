import { useState, useEffect } from 'react';

export default function Dashboard() {
  const agent = JSON.parse(localStorage.getItem('partner_data') || '{}');
  const token = localStorage.getItem('partner_token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/partners';

  const [activeTab, setActiveTab] = useState('bord');
  const [toastMsg, setToastMsg] = useState(null);

  // Détection responsive temps réel (Mobile / Tablette / Desktop)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth < 860;
  const isSmall = windowWidth < 520;

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // États Dashboard & Commissions
  const [stats, setStats] = useState({
    kpis: { nb_salons_actifs: 0, nb_salons_essai: 0, seuil_deblocage: 3, commissions_en_attente: '0.00', commissions_acquises: '0.00', commissions_payees: '0.00' },
    salons: [],
    commissions: []
  });

  // États Factures & Prospects
  const [factures, setFactures] = useState([]);
  const [showFactureForm, setShowFactureForm] = useState(false);
  const [factureData, setFactureData] = useState({ nom_salon: '', adresse_salon: '', siret_salon: '' });

  const [prospects, setProspects] = useState([]);
  const [showProspectForm, setShowProspectForm] = useState(false);
  const [prospectData, setProspectData] = useState({ nom_salon: '', ville: '', code_postal: '', siret_prospect: '', telephone_salon: '', email_gerant: '' });
  const [prospectError, setProspectError] = useState('');

  // États Paramètres & Conformité (Étapes 1 à 6)
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
  const [isYousignLoading, setIsYousignLoading] = useState(false);

  // États Carte Interactive de Prospection
  const [mapCenter, setMapCenter] = useState({ lat: 48.5734, lng: 7.7521, label: 'Strasbourg' });
  const [mapRadius, setMapRadius] = useState(5);
  const [mapAddressQuery, setMapAddressQuery] = useState('');
  const [mapSalons, setMapSalons] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapProgress, setMapProgress] = useState(null); // Gère la barre de chargement en arrière-plan
  const [mapFilter, setMapFilter] = useState('TOUS');
  const [hideVisitedSalons, setHideVisitedSalons] = useState(false);
  const [mapSortBy, setMapSortBy] = useState('DISTANCE_ASC');
  const [selectedSalonMap, setSelectedSalonMap] = useState(null);

  // États CRM Terrain : Qualification, Tags, Notes & Géo-fencing 100m
  const [visiteForm, setVisiteForm] = useState({ tag_concurrent: 'PLANITY', statut_visite: 'ABSENT_3MOIS', note_texte: '' });
  const [isSavingVisite, setIsSavingVisite] = useState(false);

  // États Planificateur de Tournée OSRM
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [routeSalons, setRouteSalons] = useState([]);
  const [routeMaxCount, setRouteMaxCount] = useState(8);
  const [routeEndQuery, setRouteEndQuery] = useState('');
  const [routeEndPoint, setRouteEndPoint] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);

  // État Analytique Marché (God Mode)
  const [adminMarketStats, setAdminMarketStats] = useState({ repartition_concurrents: [], recentes_visites: [] });
  const [quickLockForm, setQuickLockForm] = useState({ email_gerant: '', telephone_salon: '' });
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  // États God Mode (Super-Admin) — Restreint STRICTEMENT à ton compte
  const isSuperAdmin =
    Number(agent?.id) === 1 ||
    Number(agent?.id_agent) === 1 ||
    String(agent?.email || '').toLowerCase().trim() === 'tardy.valentin04@gmail.com' ||
    String(profilData?.email || '').toLowerCase().trim() === 'tardy.valentin04@gmail.com';

  const [adminAgents, setAdminAgents] = useState([]);
  const [adminCommissions, setAdminCommissions] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('TOUS');
  const [expandedAgentIds, setExpandedAgentIds] = useState({});

  // États Académie, Objections, Vidéos & Simulateurs
  const [openObjectionIdx, setOpenObjectionIdx] = useState(0);
  const [sandboxLoading, setSandboxLoading] = useState(null);
  const [activeSandboxInfo, setActiveSandboxInfo] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const [tutorialsList, setTutorialsList] = useState(() => {
    const saved = localStorage.getItem('stack_partner_videos_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'vid-1', duree: '4 min', cat: 'Démonstration Terrain',
        titre: 'Réussir sa démo Caisse & Pointeuse en 5 minutes chrono',
        desc: 'Le parcours exact à montrer au gérant : encaissement 3 clics, pointage PIN et reçu NF525.',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        pointsCles: ['Pointeuse PIN (0000)', 'Ticket mixte Prestation + Produit', 'Remise fidélité & Winback']
      },
      {
        id: 'vid-2', duree: '6 min', cat: 'Procédure Go-Live',
        titre: 'Réaliser un Onboarding parfait & débloquer la Checklist',
        desc: 'Accompagner le client sur le Popup Légal, saisir votre code partenaire et valider les 5 étapes.',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        pointsCles: ['Signature CGV / NF525', 'Saisie code partenaire', 'Déblocage des 5 verrous Go-Live']
      },
      {
        id: 'vid-3', duree: '5 min', cat: 'Argumentaire Financier',
        titre: 'Présenter l’IA Comptable & la conformité fiscale NF525',
        desc: 'Les arguments clés pour convaincre un gérant après ses 30 jours d’essai gratuit.',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        pointsCles: ['Scan IA de factures en 10s', 'Clôture Blind Close (Z de caisse)', 'Export FEC mensuel en 1 clic']
      }
    ];
  });

  const handleUpdateVideoUrl = (id) => {
    const current = tutorialsList.find(v => v.id === id);
    const nextUrl = prompt("Collez l'URL de la vidéo (YouTube, Loom ou lien MP4) :", current?.embedUrl || '');
    if (nextUrl && nextUrl.trim()) {
      let formatted = nextUrl.trim();
      if (formatted.includes('youtube.com/watch?v=')) {
        const vidId = new URL(formatted).searchParams.get('v');
        if (vidId) formatted = `https://www.youtube.com/embed/${vidId}`;
      } else if (formatted.includes('loom.com/share/')) {
        formatted = formatted.replace('loom.com/share/', 'loom.com/embed/');
      }
      const updated = tutorialsList.map(v => v.id === id ? { ...v, embedUrl: formatted } : v);
      setTutorialsList(updated);
      localStorage.setItem('stack_partner_videos_v1', JSON.stringify(updated));
      notify("Lien vidéo mis à jour.");
    }
  };

  const handleLaunchSandbox = async (type, action = 'LAUNCH') => {
    const loaderKey = `${type}_${action}`;
    setSandboxLoading(loaderKey);
    try {
      const res = await fetch(`${API_URL}/sandbox/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur sur le simulateur");

      if (action === 'SAVE_CUSTOM') {
        notify("Configuration du salon de démo sauvegardée !");
      } else {
        setActiveSandboxInfo(data);
        notify(
          action === 'RESET_CUSTOM' ? "Salon restauré selon votre sauvegarde !" :
          action === 'RESET_DEFAULT' ? "Salon remis à l'état d'usine STACK !" :
          `Environnement "${data.nom_salon}" ouvert !`
        );
        window.open(data.url_directe, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSandboxLoading(null);
    }
  };

  // Chargement Leaflet
  useEffect(() => {
    if (window.L) { setLeafletReady(true); return; }
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
    fetchProfil();
    if (activeTab === 'bord') fetchStats();
    if (activeTab === 'factures') fetchFactures();
    if (activeTab === 'prospects') fetchProspects();
    if (activeTab === 'carte') fetchMapSalons(mapCenter.lat, mapCenter.lng, mapRadius, true);
    if (activeTab === 'godmode' && isSuperAdmin) fetchAdminData();
  }, [activeTab, isSuperAdmin]);

  // Chargement par paquets (Chunks) : Affiche la carte instantanément, puis charge le reste en arrière-plan
  const fetchMapSalons = async (lat = mapCenter.lat, lng = mapCenter.lng, radius = mapRadius, isNewCenter = false) => {
    if (window.__mapAbortController) window.__mapAbortController.abort();
    const ac = new AbortController();
    window.__mapAbortController = ac;

    setMapLoading(true);
    setMapProgress(0);
    if (isNewCenter) setMapSalons([]);
    
    let currentStep = 0;
    let keepFetching = true;

    try {
      while (keepFetching && !ac.signal.aborted) {
        const res = await fetch(`${API_URL}/map-salons?lat=${lat}&lng=${lng}&radius=${radius}&step=${currentStep}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: ac.signal
        });
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        
        setMapSalons(prev => {
          const prevSalons = (isNewCenter && currentStep === 0) ? [] : prev;
          const merged = new Map(prevSalons.map(s => [s.siret, s]));
          (data.salons || []).forEach(s => merged.set(s.siret, s));
          // CRUCIAL : On ne supprime plus rien de la mémoire !
          // On garde tous les salons trouvés, et c'est l'affichage visuel qui les masquera au besoin.
          return Array.from(merged.values()).sort((a, b) => parseFloat(a.distance_km) - parseFloat(b.distance_km));
        });

        if (currentStep === 0) setMapLoading(false); // Affiche la carte dès que l'étape 0 (la plus grosse) est prête
        
        if (data.nextStep !== null && data.nextStep !== undefined) {
          currentStep = data.nextStep;
          setMapProgress(currentStep); // Barre de progression : 1, 2, 3, 4, 5...
        } else {
          keepFetching = false;
          setMapProgress(6); // Fin du scan à 100%
          setTimeout(() => setMapProgress(null), 2500);
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') notify("Erreur réseau (carte).", true);
      setMapLoading(false);
      setMapProgress(null);
    }
  };

  const handleGeolocateAgent = () => {
    if (!navigator.geolocation) return notify("Géolocalisation non supportée.", true);
    setMapLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Ma position GPS' };
        setMapCenter(nextCenter);
        fetchMapSalons(nextCenter.lat, nextCenter.lng, mapRadius, true);
      },
      () => {
        setMapLoading(false);
        notify("Autorisez la localisation ou saisissez une adresse.", true);
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
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        const label = data.features[0].properties.label;
        setMapCenter({ lat, lng, label });
        fetchMapSalons(lat, lng, mapRadius, true);
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
    // On passe isNewCenter = false : l'UI garde les anciens points instantanément en attendant les nouveaux !
    fetchMapSalons(mapCenter.lat, mapCenter.lng, newRadius, false);
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
      setMapSalons(prev => prev.map(s => s.siret === selectedSalonMap.siret ? { ...s, statut_carte: 'PROSPECTE_MOI', jours_restants: 45, id_prospect: data.id_prospect } : s));
      setSelectedSalonMap(prev => prev ? { ...prev, statut_carte: 'PROSPECTE_MOI', jours_restants: 45, id_prospect: data.id_prospect } : null);
    } else {
      notify(data.error || "Verrouillage impossible.", true);
    }
  };

  useEffect(() => {
    if (activeTab !== 'carte' || !leafletReady || !window.L) return;
    const L = window.L;
    const container = document.getElementById('stack-partners-map');
    if (!container) return;

    if (!window.__stackMap) {
      const map = L.map(container, { zoomControl: false, preferCanvas: true }).setView([mapCenter.lat, mapCenter.lng], 13);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', maxZoom: 19
      }).addTo(map);
      window.__stackMap = map;
      window.__stackLayerGroup = L.layerGroup().addTo(map);
    }

    const map = window.__stackMap;
    const layerGroup = window.__stackLayerGroup;

    // BUG CARTE BLANCHE RÉSOLU : Force le moteur Leaflet à recalculer sa taille exacte à l'ouverture de l'onglet
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 400);

    // Recentre uniquement quand le centre ou le rayon change
    const centerKey = `${mapCenter.lat}_${mapCenter.lng}_${mapRadius}`;
    if (window.__lastCenterKey !== centerKey) {
      const zoomByRadius = mapRadius <= 2 ? 14 : mapRadius <= 5 ? 13 : mapRadius <= 15 ? 11 : 10;
      map.setView([mapCenter.lat, mapCenter.lng], zoomByRadius);
      window.__lastCenterKey = centerKey;
    }

    const colorMap = {
      LIBRE: '#10b981',
      PROSPECTE_MOI: '#2563eb',
      PROSPECTE_AUTRE: '#f59e0b',
      CLIENT_STACK: '#111827',
      VISITE_MOI: '#6b7280',
      VISITE_AUTRE: '#9ca3af'
    };
    
    const filtered = mapSalons.filter(s => {
      if (parseFloat(s.distance_km) > mapRadius) return false;
      if (hideVisitedSalons && (s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE' || s.visite_info?.est_visite_physique)) return false;
      if (mapFilter === 'TOUS') return true;
      if (mapFilter === 'VISITES') return s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE';
      return s.statut_carte === mapFilter;
    });

    // Fonction de rendu ultra-rapide avec regroupement automatique (Clustering) selon l'échelle de zoom
    const renderMarkersAndClusters = () => {
      layerGroup.clearLayers();

      L.circle([mapCenter.lat, mapCenter.lng], {
        radius: mapRadius * 1000, color: '#111827', weight: 1.5, dashArray: '6, 6', fillColor: '#111827', fillOpacity: 0.03
      }).addTo(layerGroup);

      const agentIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#863bff 0%,#47bfff 100%);border:3px solid #fff;box-shadow:0 0 0 4px rgba(134,59,255,0.22);"></div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
      });
      L.marker([mapCenter.lat, mapCenter.lng], { icon: agentIcon }).addTo(layerGroup);

      const currentZoom = map.getZoom();
      const bounds = map.getBounds().pad(0.15);
      const visibleSalons = filtered.filter(s => bounds.contains([s.lat, s.lng]));

      // À partir du zoom 16 (échelle rue) ou s'il y a moins de 90 points visibles, on dissocie tous les points
      if (currentZoom >= 16 || visibleSalons.length <= 90) {
        visibleSalons.forEach(salon => {
          const isSelected = selectedSalonMap?.siret === salon.siret;
          const marker = L.circleMarker([salon.lat, salon.lng], {
            radius: isSelected ? 10 : 7,
            fillColor: colorMap[salon.statut_carte] || '#10b981',
            color: '#ffffff',
            weight: isSelected ? 3 : 2,
            fillOpacity: 0.95
          }).addTo(layerGroup);

          const starsLabel = salon.etoiles ? `★ ${salon.etoiles}` : '★ N/A';
          marker.bindTooltip(`<strong>${salon.nom_salon}</strong><br/>${starsLabel} • ${salon.distance_km} km`, { direction: 'top', offset: [0, -6] });
          marker.on('click', () => setSelectedSalonMap(salon));
        });
        return;
      }

      // Sinon : Regroupement spatial (Grid Clustering) en bulles de comptage
      const cellSizePx = currentZoom <= 11 ? 75 : currentZoom <= 13 ? 60 : 46;
      const clusters = new Map();

      visibleSalons.forEach(salon => {
        const pt = map.latLngToContainerPoint([salon.lat, salon.lng]);
        const key = `${Math.floor(pt.x / cellSizePx)}_${Math.floor(pt.y / cellSizePx)}`;
        if (!clusters.has(key)) {
          clusters.set(key, { salons: [], sumLat: 0, sumLng: 0 });
        }
        const c = clusters.get(key);
        c.salons.push(salon);
        c.sumLat += salon.lat;
        c.sumLng += salon.lng;
      });

      clusters.forEach(group => {
        const count = group.salons.length;
        if (count === 1) {
          const salon = group.salons[0];
          const isSelected = selectedSalonMap?.siret === salon.siret;
          const marker = L.circleMarker([salon.lat, salon.lng], {
            radius: isSelected ? 10 : 7,
            fillColor: colorMap[salon.statut_carte] || '#10b981',
            color: '#ffffff',
            weight: isSelected ? 3 : 2,
            fillOpacity: 0.95
          }).addTo(layerGroup);
          const starsLabel = salon.etoiles ? `★ ${salon.etoiles}` : '★ N/A';
          marker.bindTooltip(`<strong>${salon.nom_salon}</strong><br/>${starsLabel} • ${salon.distance_km} km`, { direction: 'top', offset: [0, -6] });
          marker.on('click', () => setSelectedSalonMap(salon));
        } else {
          const avgLat = group.sumLat / count;
          const avgLng = group.sumLng / count;
          const size = count >= 100 ? 44 : count >= 25 ? 38 : 32;
          const bgCluster = count >= 100 ? '#111827' : count >= 25 ? '#059669' : '#10b981';

          const clusterIcon = L.divIcon({
            className: '',
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bgCluster};color:#ffffff;border:3px solid rgba(255,255,255,0.92);box-shadow:0 6px 16px rgba(0,0,0,0.22);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${count >= 100 ? 12 : 13}px;cursor:pointer;">${count}</div>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const cMarker = L.marker([avgLat, avgLng], { icon: clusterIcon }).addTo(layerGroup);
          cMarker.bindTooltip(`${count} salons dans cette zone — Cliquez pour zoomer`, { direction: 'top' });
          cMarker.on('click', () => {
            map.setView([avgLat, avgLng], Math.min(18, currentZoom + 2));
          });
        }
      });
    };

    const renderFullMap = () => {
      renderMarkersAndClusters();

      // Tracé visuel de la tournée optimisée OSRM + Pastilles numérotées (1, 2, 3...)
      if (optimizedRoute?.polyline?.length > 1) {
        L.polyline(optimizedRoute.polyline, {
          color: '#111827', weight: 4, opacity: 0.85, dashArray: '8, 8'
        }).addTo(layerGroup);

        (optimizedRoute.orderedSalons || []).forEach((stopSalon, idx) => {
          const stepBadge = L.divIcon({
            className: '',
            html: `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#863bff 0%,#111827 100%);color:#fff;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;cursor:pointer;">${idx + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          L.marker([stopSalon.lat, stopSalon.lng], { icon: stepBadge, zIndexOffset: 1000 })
            .addTo(layerGroup)
            .bindTooltip(`<strong>Étape #${idx + 1} : ${stopSalon.nom_salon}</strong>`, { direction: 'top' })
            .on('click', () => setSelectedSalonMap(stopSalon));
        });
      }
    };

    renderFullMap();
    map.on('zoomend moveend', renderFullMap);

    return () => {
      map.off('zoomend moveend', renderFullMap);
      if (activeTab !== 'carte' && window.__stackMap) {
        window.__stackMap.remove();
        window.__stackMap = null;
        window.__stackLayerGroup = null;
        window.__lastCenterKey = null;
      }
    };
  }, [activeTab, leafletReady, mapCenter, mapRadius, mapSalons, mapFilter, hideVisitedSalons, selectedSalonMap, optimizedRoute]);

  const fetchAdminData = async () => {
    try {
      const resAgents = await fetch(`${API_URL}/admin/agents`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resAgents.ok) {
        const dataAgents = await resAgents.json();
        const list = Array.isArray(dataAgents) ? dataAgents : (dataAgents.agents || []);
        setAdminAgents(list);
        if (list.length > 0) {
          setExpandedAgentIds(prev => Object.keys(prev).length === 0 ? { [list[0].id_agent]: true } : prev);
        }
      }
      const resCom = await fetch(`${API_URL}/admin/commissions`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resCom.ok) {
        const dataCom = await resCom.json();
        setAdminCommissions(Array.isArray(dataCom) ? dataCom : (dataCom.commissions || []));
      }
      const resMarket = await fetch(`${API_URL}/admin/market-stats`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (resMarket.ok) {
        setAdminMarketStats(await resMarket.json());
      }
    } catch (err) {
      console.error("Erreur chargement God Mode:", err);
    }
  };

  // Synchronise le formulaire de note/tag quand on clique sur un salon
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

  // Validation de visite avec contrôle GPS Anti-Triche (< 100m) ou sauvegarde de note
  const handleSaveVisiteOrNote = async (validerPassagePhysique = false, forceAdmin = false) => {
    if (!selectedSalonMap) return;
    setIsSavingVisite(true);

    const sendRequest = async (latAgent = null, lngAgent = null) => {
      try {
        const res = await fetch(`${API_URL}/visites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
          notify(data.error || "Impossible de valider la visite.", true);
          return;
        }
        notify(data.message);
        const nextStatut = validerPassagePhysique ? 'VISITE_MOI' : selectedSalonMap.statut_carte;
        setMapSalons(prev => prev.map(s => s.siret === selectedSalonMap.siret ? { ...s, statut_carte: nextStatut, visite_info: data.visite_info } : s));
        setSelectedSalonMap(prev => prev ? { ...prev, statut_carte: nextStatut, visite_info: data.visite_info } : null);
      } catch (e) {
        notify("Erreur réseau lors de l'enregistrement.", true);
      } finally {
        setIsSavingVisite(false);
      }
    };

    if (validerPassagePhysique && !forceAdmin) {
      if (!navigator.geolocation) {
        setIsSavingVisite(false);
        return notify("Géolocalisation requise pour certifier une visite à moins de 100m.", true);
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => sendRequest(pos.coords.latitude, pos.coords.longitude),
        () => {
          setIsSavingVisite(false);
          notify("Activez votre GPS pour vérifier que vous êtes à moins de 100 mètres du salon.", true);
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    } else {
      await sendRequest(mapCenter.lat, mapCenter.lng);
    }
  };

  // Ajouter / Retirer un salon de la tournée
  const toggleSalonInRoute = (salon) => {
    setOptimizedRoute(null);
    setRouteSalons(prev => {
      const exists = prev.some(s => s.siret === salon.siret);
      if (exists) return prev.filter(s => s.siret !== salon.siret);
      if (prev.length >= 15) {
        notify("Maximum 15 salons par tournée pour garantir un guidage GPS fluide.", true);
        return prev;
      }
      return [...prev, salon];
    });
  };

  // Remplissage intelligent automatique des N meilleurs salons libres jamais visités dans le rayon
  const handleAutoSelectRouteSalons = () => {
    const candidates = mapSalons
      .filter(s => parseFloat(s.distance_km) <= mapRadius && s.statut_carte === 'LIBRE' && !s.visite_info?.est_visite_physique)
      .slice(0, routeMaxCount);
    if (candidates.length === 0) return notify("Aucun salon libre non visité dans ce périmètre.", true);
    setRouteSalons(candidates);
    setOptimizedRoute(null);
    notify(`${candidates.length} salons sélectionnés. Cliquez sur "Optimiser l'itinéraire".`);
  };

  // Calcul de la tournée optimale via le backend OSRM
  const handleOptimizeTournee = async () => {
    if (routeSalons.length === 0) return notify("Ajoutez d'abord des salons ou cliquez sur Sélection Auto.", true);
    setIsOptimizingRoute(true);
    try {
      let resolvedEnd = routeEndPoint;
      if (routeEndQuery.trim() && !resolvedEnd) {
        const gRes = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(routeEndQuery)}&limit=1`);
        const gData = await gRes.json();
        if (gData.features?.length > 0) {
          const [lng, lat] = gData.features[0].geometry.coordinates;
          resolvedEnd = { lat, lng, label: gData.features[0].properties.label };
          setRouteEndPoint(resolvedEnd);
        }
      }

      const res = await fetch(`${API_URL}/tournee/optimiser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  const handleVerifyPieceAdmin = async (idAgent, champ_statut, decision, purge_identite_rgpd = false) => {
    const commentaire = decision === 'REFUSE' ? prompt("Motif du refus (affiché à l'agent) :") || 'Pièce non conforme' : 'Vérifié et validé par la direction STACK';
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
      notify("Commission marquée comme payée.");
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
    if (file.size > 4 * 1024 * 1024) return notify("Fichier trop volumineux (max 4 Mo).", true);
    const reader = new FileReader();
    reader.onload = () => {
      setProfilData(prev => ({ ...prev, [fieldName]: reader.result }));
      notify(`Pièce "${file.name}" prête. Cliquez sur Soumettre l'étape pour l'enregistrer.`);
    };
    reader.readAsDataURL(file);
  };

  const openUploadedDocument = (fileData) => {
    if (!fileData || typeof fileData !== 'string') return notify("Aucun document disponible.", true);
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
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
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
          alert("ERREUR : Le serveur a répondu OK mais aucun lien Yousign n'a été trouvé dans la réponse :\n\n" + JSON.stringify(data));
        }
      } else {
        alert(`YOUSIGN A REJETÉ LA DEMANDE (HTTP ${res.status}) :\n\n` + (data.error || JSON.stringify(data)));
      }
    } catch (e) {
      alert("ERREUR RÉSEAU OU SERVEUR INJOIGNABLE :\n\n" + e.message);
    } finally {
      setIsYousignLoading(false);
    }
  };

  const handleCheckYousign = async () => {
    setIsYousignLoading(true);
    try {
      const res = await fetch(`${API_URL}/profil/yousign/check`, { headers: { 'Authorization': `Bearer ${token}` } });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        alert(`ERREUR SERVEUR CHECK (HTTP ${res.status}) :\n\n` + text.substring(0, 300));
        return;
      }
      if (res.ok && data.status === 'done') {
        notify(data.message || "Félicitations, contrat validé !");
        fetchProfil();
      } else {
        alert(`STATUT ACTUEL SUR YOUSIGN : "${data.status || 'inconnu'}"\n\n` + (data.message || data.error || "Vous n'avez pas encore terminé la signature sur la page Yousign."));
      }
    } catch (e) {
      alert("Erreur réseau lors de la vérification : " + e.message);
    } finally {
      setIsYousignLoading(false);
    }
  };

  const submitEtapeConformite = async (etape, customPayload = null) => {
    try {
      const res = await fetch(`${API_URL}/profil/etape`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ etape, payload: customPayload || profilData })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        notify(data.message || `Étape ${etape} enregistrée.`);
        fetchProfil();
      } else {
        notify(data.error || "Erreur d'enregistrement.", true);
      }
    } catch (err) {
      notify("Erreur réseau.", true);
    }
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const score = (quizAnswers.q1 === 'nf525' ? 25 : 0) + (quizAnswers.q2 === 'interdit' ? 25 : 0) + (quizAnswers.q3 === 'mandataire' ? 25 : 0) + (quizAnswers.q4 === '99' ? 25 : 0);
    if (score < 100) return notify(`Score insuffisant (${score}/100). 100% exigé.`, true);
    submitEtapeConformite(5, { telephone: profilData.telephone, quiz_score: 100, telephone_confirme: profilData.telephone_confirme });
  };

  const notify = (text, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const fetchStats = async () => {
    const res = await fetch(`${API_URL}/dashboard-stats`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const raw = await res.json();
      const vraisSalons = (raw.salons || []).filter(s =>
        !s.est_bac_a_sable &&
        !(s.email_gerant || '').includes('@stack-sim.fr') &&
        !(s.nom_salon || '').includes('Salon Vierge d\'Entraînement') &&
        !(s.nom_salon || '').includes('Maison Éclat — Démo') &&
        !(s.nom_salon || '').includes('Salon Test Onboarding')
      );
      const salonsPayants = vraisSalons.filter(s => s.statut_abonnement === 'actif' && s.plan_actuel !== 'PREMIUM_TRIAL');
      const salonsEssai = vraisSalons.filter(s => s.plan_actuel === 'PREMIUM_TRIAL' || s.statut_abonnement !== 'actif');
      const vraiesCom = (raw.commissions || []).filter(c =>
        !(c.nom_salon || '').includes('Salon Vierge d\'Entraînement') &&
        !(c.nom_salon || '').includes('Maison Éclat — Démo') &&
        !(c.nom_salon || '').includes('Salon Test Onboarding')
      );
      setStats({
        kpis: { ...raw.kpis, nb_salons_actifs: salonsPayants.length, nb_salons_essai: salonsEssai.length },
        salons: vraisSalons,
        commissions: vraiesCom
      });
    }
  };

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
      notify("Facture générée.");
    } else {
      const data = await res.json().catch(() => ({}));
      notify(data.error || "Dossier de conformité incomplet.", true);
    }
  };

  const handleDownload = async (id, numero) => {
    const res = await fetch(`${API_URL}/factures/${id}/pdf`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${numero}.pdf`; a.click();
    }
  };

  const handlePay = async (id) => {
    await fetch(`${API_URL}/factures/${id}/payee`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } });
    fetchFactures();
    notify("Virement validé.");
  };

  const fetchProspects = async () => {
    const res = await fetch(`${API_URL}/prospects`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setProspects(await res.json());
  };

  const handleOnboarding = async (id_prospect) => {
    try {
      const res = await fetch(`${API_URL}/prospects/${id_prospect}/onboarding`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
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

  const Icon = {
    Bord: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Prospects: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    Factures: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    FileDownload: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Check: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    ArrowUpRight: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
    Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    MapPin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    Compass: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    Academie: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    Search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Lock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    Zap: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    Map: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    Car: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="8" rx="3"/><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>,
    Crosshair: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: isMobile ? '18px' : '22px',
    border: '1px solid #e5e7eb',
    padding: isMobile ? '16px' : '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    marginBottom: isMobile ? '16px' : '24px'
  };

  const inputStyle = {
    flex: 1,
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
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
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 18px',
    backgroundColor: '#111827',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13.5px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  const secondaryBtn = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 14px',
    backgroundColor: '#f9fafb',
    color: '#111827',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '12.5px',
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
    textAlign: 'left'
  });

  const renderFilePreviewBadge = (fileValue, label) => {
    if (!fileValue || typeof fileValue !== 'string') return null;
    return (
      <button
        type="button"
        onClick={() => openUploadedDocument(fileValue)}
        style={{
          marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px', borderRadius: '8px', backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0', color: '#166534', fontSize: '11.5px', fontWeight: '600', cursor: 'pointer'
        }}
      >
        <Icon.Eye /> Voir ({label})
      </button>
    );
  };

  const progressionPourcent = Math.min(100, Math.round((stats.kpis.nb_salons_actifs / stats.kpis.seuil_deblocage) * 100));

  // Calculs God Mode
  const getAgentPiecesList = (a) => [
    { label: 'Contrat de Mandat', step: 'Étape 1', field: 'statut_contrat', val: a.statut_contrat, info: a.contrat_signe ? 'Signé électroniquement' : 'Non signé' },
    { label: 'Pièce d’Identité', step: 'Étape 2a', field: 'statut_identite', val: a.statut_identite, file: a.fichier_identite, info: `Né(e): ${a.date_naissance ? a.date_naissance.slice(0,10) : '—'} • Exp: ${a.date_expiration_identite ? a.date_expiration_identite.slice(0,10) : '—'}`, rgpd: true },
    { label: 'SIREN / SIRET (INSEE)', step: 'Étape 2b', field: 'statut_siret', val: a.statut_siret, info: `SIRET : ${a.siret_agent || '—'} (${a.forme_juridique || 'EI'})` },
    { label: 'Extrait RSAC (< 3 mois)', step: 'Étape 2c', field: 'statut_rsac', val: a.statut_rsac, file: a.fichier_rsac, info: `RSAC : ${a.numero_rsac || '—'} (${a.greffe_rsac || 'Greffe N/A'})` },
    { label: 'Extrait Kbis (Société)', step: 'Étape 2d', field: 'statut_kbis', val: a.forme_juridique === 'SOCIETE' ? a.statut_kbis : 'VALIDE', file: a.fichier_kbis, info: a.forme_juridique === 'SOCIETE' ? `Émis: ${a.date_emission_kbis ? a.date_emission_kbis.slice(0,10) : '—'}` : 'Non requis (Entrepreneur Individuel)' },
    { label: 'Vigilance URSSAF', step: 'Étape 3', field: 'statut_urssaf', val: a.statut_urssaf, file: a.fichier_urssaf, info: `Code : ${a.code_verif_urssaf || '—'} • Exp: ${a.date_expiration_urssaf ? a.date_expiration_urssaf.slice(0,10) : '—'}` },
    { label: 'Assurance RC Pro', step: 'Étape 4a', field: 'statut_rc_pro', val: a.statut_rc_pro, file: a.fichier_rc_pro, info: `${a.assureur_nom || 'Assureur N/A'} (${a.assureur_plafond || '—'})` },
    { label: 'IBAN & Titulaire', step: 'Étape 4b', field: 'statut_iban', val: a.statut_iban, info: `${a.titulaire_iban || 'Titulaire N/A'} • ${a.iban || 'IBAN manquant'}` },
    { label: 'TVA, Charte & Quiz NF525', step: 'Étape 5', field: 'statut_tva', val: a.statut_tva, info: `${a.regime_tva || '293B'} • Quiz NF525 : ${a.quiz_score || 0}%` }
  ];

  const filteredAdminAgents = adminAgents.filter(a => {
    const q = adminSearch.toLowerCase().trim();
    const matchSearch = !q ||
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
    return acc + pieces.filter(p => p.val !== 'VALIDE' && p.val !== 'NON_REQUIS').length;
  }, 0);

  const totalCommissionsToPay = adminCommissions.reduce((acc, c) => acc + parseFloat(c.montant_commission || 0), 0).toFixed(2);

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f6f6f7',
      color: '#111827',
      paddingBottom: isMobile ? '84px' : '0'
    }}>

      {/* EN-TÊTE MOBILE STICKY */}
      {isMobile && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 900,
          backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #e5e7eb', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #863bff 0%, #47bfff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '15px' }}>
              S
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', lineHeight: 1 }}>STACK</div>
              <div style={{ fontSize: '10px', fontWeight: '600', color: '#6b7280' }}>Partners</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('profil')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 11px', borderRadius: '999px',
                backgroundColor: activeTab === 'profil' ? '#111827' : '#f3f4f6',
                color: activeTab === 'profil' ? '#ffffff' : '#111827',
                border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: profilData.autorise_a_vendre ? '#22c55e' : '#f59e0b' }} />
              <span style={{ textTransform: 'capitalize' }}>{agent.prenom || agent.nom || 'Mon Profil'}</span>
            </button>
            <button
              onClick={logout}
              title="Déconnexion"
              style={{
                padding: '7px 9px', borderRadius: '10px', backgroundColor: '#fef2f2',
                color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              <Icon.Logout />
            </button>
          </div>
        </div>
      )}

      {/* BANDEAU LATÉRAL GAUCHE (DESKTOP UNIQUEMENT) */}
      {!isMobile && (
        <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '28px 20px', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingLeft: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #863bff 0%, #47bfff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '16px' }}>
              S
            </div>
            <div>
              <div style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '0.03em', color: '#111827', lineHeight: 1.1 }}>STACK</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>Portail Partenaires</div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profil')}
            style={{
              width: '100%', textAlign: 'left',
              backgroundColor: activeTab === 'profil' ? '#111827' : '#f6f6f7',
              border: activeTab === 'profil' ? '1px solid #111827' : '1px solid #e5e7eb',
              borderRadius: '14px', padding: '12px 14px', marginBottom: '28px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
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
            <div style={{ color: activeTab === 'profil' ? '#ffffff' : '#6b7280' }}><Icon.User /></div>
          </button>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button onClick={() => setActiveTab('bord')} style={navBtnStyle(activeTab === 'bord')}><Icon.Bord /> Tableau de Bord</button>
            <button onClick={() => setActiveTab('prospects')} style={navBtnStyle(activeTab === 'prospects')}><Icon.Prospects /> Mes Prospects</button>
            <button onClick={() => setActiveTab('carte')} style={navBtnStyle(activeTab === 'carte')}><Icon.MapPin /> Carte Prospection</button>
            <button onClick={() => setActiveTab('factures')} style={navBtnStyle(activeTab === 'factures')}><Icon.Factures /> Factures Onboarding</button>
            <button onClick={() => setActiveTab('academie')} style={navBtnStyle(activeTab === 'academie')}><Icon.Academie /> Académie & Tutos</button>

            {isSuperAdmin && (
              <>
                <div style={{ margin: '12px 0', borderTop: '1px solid #e5e7eb' }} />
                <button
                  onClick={() => setActiveTab('godmode')}
                  style={{
                    ...navBtnStyle(activeTab === 'godmode'),
                    backgroundColor: activeTab === 'godmode' ? '#111827' : '#f9fafb',
                    color: activeTab === 'godmode' ? '#ffffff' : '#111827',
                    border: '1px solid #e5e7eb',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Icon.Shield /> God Mode</span>
                  <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: activeTab === 'godmode' ? 'rgba(255,255,255,0.2)' : '#e5e7eb', color: activeTab === 'godmode' ? '#fff' : '#374151' }}>
                    ADMIN
                  </span>
                </button>
              </>
            )}
          </div>

          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', padding: '11px 14px', cursor: 'pointer', borderRadius: '12px', fontSize: '13.5px', fontWeight: '600' }}>
            <Icon.Logout /> Quitter
          </button>
        </div>
      )}

      {/* ZONE DE CONTENU PRINCIPALE */}
      <div style={{ flex: 1, padding: isMobile ? '18px 14px' : '40px 48px', maxWidth: '1180px', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>

        {toastMsg && (
          <div style={{ backgroundColor: toastMsg.isError ? '#fef2f2' : '#111827', color: toastMsg.isError ? '#dc2626' : '#ffffff', border: toastMsg.isError ? '1px solid #fecaca' : 'none', padding: '14px 18px', borderRadius: '14px', marginBottom: '20px', fontSize: '13.5px', fontWeight: '500', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
            {toastMsg.text}
          </div>
        )}

        {/* ONGLET 1 : TABLEAU DE BORD */}
        {activeTab === 'bord' && (
          <>
            <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
              <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Tableau de Bord</h1>
              <span style={{ fontSize: '13.5px', color: '#6b7280' }}>
                Suivi en temps réel de vos vrais salons affiliés (hors salons de simulation et hors essai gratuit de 30 jours)
              </span>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'baseline', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>Palier de déblocage des commissions récurrentes</div>
                  <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '2px' }}>
                    {stats.kpis.nb_salons_actifs >= stats.kpis.seuil_deblocage
                      ? "Palier atteint : toutes vos commissions présentes et passées sont débloquées et payables."
                      : "Les salons bénéficient d'un 1er mois gratuit. Ils comptent dans ce palier dès leur 1er abonnement payant."}
                  </div>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap' }}>
                  {stats.kpis.nb_salons_actifs} / {stats.kpis.seuil_deblocage} salons actifs
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressionPourcent}%`, height: '100%', backgroundColor: '#111827', borderRadius: '999px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Salons en Essai (30j)</div>
                <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px' }}>{stats.kpis.nb_salons_essai}</div>
              </div>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Salons Actifs Payants</div>
                <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px', color: '#16a34a' }}>{stats.kpis.nb_salons_actifs}</div>
              </div>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>En attente de seuil</div>
                <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px', color: '#d97706' }}>{stats.kpis.commissions_en_attente} <span style={{ fontSize: '14px', color: '#9ca3af' }}>€ HT</span></div>
              </div>
              <div style={{ ...cardStyle, marginBottom: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Commissions Acquises</div>
                <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginTop: '8px', color: '#111827' }}>{stats.kpis.commissions_acquises} <span style={{ fontSize: '14px', color: '#9ca3af' }}>€ HT</span></div>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
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
                    <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucun salon client inscrit pour le moment.</td></tr>
                  ) : stats.salons.map(s => {
                    const estEnEssai = s.plan_actuel === 'PREMIUM_TRIAL' || s.statut_abonnement !== 'actif';
                    return (
                      <tr key={s.id_salon} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '14px 18px', fontWeight: '600' }}>{s.nom_salon}<br/><span style={{ fontWeight: '400', fontSize: '12px', color: '#6b7280' }}>{s.email_gerant}</span></td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151' }}>
                            {s.plan_actuel === 'PREMIUM_TRIAL' ? 'Essai Gratuit 30j' : s.plan_actuel}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: !estEnEssai ? '#dcfce7' : '#fef3c7', color: !estEnEssai ? '#166534' : '#92400e' }}>
                            {!estEnEssai ? 'Actif payant' : '1er mois gratuit'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#6b7280' }}>
                          {s.date_fin_commissionnement ? new Date(s.date_fin_commissionnement).toLocaleDateString('fr-FR') : 'Au 1er paiement'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
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
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucune commission générée pour le moment.</td></tr>
                  ) : stats.commissions.map(c => (
                    <tr key={c.id_commission} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>{c.periode_mois}</td>
                      <td style={{ padding: '14px 18px' }}>{c.nom_salon}</td>
                      <td style={{ padding: '14px 18px', color: '#6b7280' }}>{c.montant_base_ht} € HT</td>
                      <td style={{ padding: '14px 18px', fontWeight: '700' }}>{c.montant_commission} € HT</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                          backgroundColor: c.statut_commission === 'PAYEE' ? '#dcfce7' : (c.statut_commission === 'ACQUISE_A_PAYER' ? '#dbeafe' : '#fef3c7'),
                          color: c.statut_commission === 'PAYEE' ? '#166534' : (c.statut_commission === 'ACQUISE_A_PAYER' ? '#1e40af' : '#92400e')
                        }}>
                          {c.statut_commission === 'PAYEE' ? 'Payée' : (c.statut_commission === 'ACQUISE_A_PAYER' ? 'Acquise à payer' : 'En attente seuil')}
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
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>Mes Prospects</h1>
                <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Exclusivité de prospection de 45 jours par salon réservé</span>
              </div>
              <button onClick={() => setShowProspectForm(!showProspectForm)} style={primaryBtn}>
                <Icon.Plus /> Réserver un Lead
              </button>
            </div>

            {showProspectForm && (
              <form onSubmit={handleCreateProspect} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {prospectError && <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>{prospectError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  <input type="text" placeholder="Nom du Salon" required value={prospectData.nom_salon} onChange={e => setProspectData({...prospectData, nom_salon: e.target.value})} style={inputStyle}/>
                  <input type="text" placeholder="Numéro SIRET" required value={prospectData.siret_prospect} onChange={e => setProspectData({...prospectData, siret_prospect: e.target.value})} style={inputStyle}/>
                  <input type="email" placeholder="E-mail du gérant" required value={prospectData.email_gerant} onChange={e => setProspectData({...prospectData, email_gerant: e.target.value})} style={inputStyle}/>
                  <input type="text" placeholder="Téléphone du salon" value={prospectData.telephone_salon} onChange={e => setProspectData({...prospectData, telephone_salon: e.target.value})} style={inputStyle}/>
                  <input type="text" placeholder="Code Postal" value={prospectData.code_postal} onChange={e => setProspectData({...prospectData, code_postal: e.target.value})} style={inputStyle}/>
                  <input type="text" placeholder="Ville" value={prospectData.ville} onChange={e => setProspectData({...prospectData, ville: e.target.value})} style={inputStyle}/>
                </div>
                <button type="submit" style={{ ...primaryBtn, alignSelf: isMobile ? 'stretch' : 'flex-end' }}>Verrouiller ce prospect (45 jours)</button>
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
                  {prospects.length === 0 ? <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucun prospect enregistré.</td></tr> : prospects.map(p => (
                    <tr key={p.id_prospect} style={{ borderBottom: '1px solid #f3f4f6', opacity: p.est_protege ? 1 : 0.5 }}>
                      <td style={{ padding: '14px 18px', color: '#6b7280' }}>{new Date(p.date_declaration).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>{p.nom_salon}<br/><span style={{ fontWeight: '400', fontSize: '12px', color: '#6b7280' }}>{p.ville} ({p.siret_prospect || 'SIRET N/A'})</span></td>
                      <td style={{ padding: '14px 18px' }}>{p.email_gerant}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: p.statut_prospect === 'SIGNE' ? '#dcfce7' : (p.est_protege ? '#f3f4f6' : '#fef2f2'), color: p.statut_prospect === 'SIGNE' ? '#166534' : (p.est_protege ? '#111827' : '#dc2626') }}>
                          {p.statut_prospect === 'SIGNE' ? 'Signé' : (p.est_protege ? 'Protégé' : 'Expiré')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: p.jours_restants <= 7 && p.est_protege ? '#dc2626' : '#6b7280', fontWeight: p.jours_restants <= 7 ? '600' : '400' }}>
                        {p.statut_prospect === 'SIGNE' ? 'Converti' : (p.est_protege ? `${Math.max(0, p.jours_restants)}j restants` : 'Libre')}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {p.statut_prospect !== 'SIGNE' && p.est_protege && (
                          <button onClick={() => handleOnboarding(p.id_prospect)} style={{ ...primaryBtn, padding: '8px 12px', fontSize: '12px' }}>
                            <Icon.ArrowUpRight /> Onboarding
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

        {/* ONGLET 3 : CARTE DE PROSPECTION */}
        {activeTab === 'carte' && (
          <>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>Carte de Prospection</h1>
                <span style={{ fontSize: '13.5px', color: '#6b7280' }}>
                  Couverture multi-sources (INSEE 96.02A/B + OpenStreetMap). Verrouillez vos prospects en un clic.
                </span>
              </div>
              <button type="button" onClick={handleGeolocateAgent} style={{ ...primaryBtn, backgroundColor: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' }}>
                <Icon.Compass /> Autour de ma position GPS
              </button>
            </div>

            <div style={{ ...cardStyle, padding: isMobile ? '14px' : '18px 22px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', alignItems: 'stretch' }}>
                <form onSubmit={handleSearchAddressMap} style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', flex: 1, gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Adresse, code postal ou ville..."
                    value={mapAddressQuery}
                    onChange={e => setMapAddressQuery(e.target.value)}
                    style={inputStyle}
                  />
                  <button type="submit" style={primaryBtn}><Icon.Search /> Centrer</button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', backgroundColor: '#f6f6f7', padding: '6px 10px', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Rayon:</span>
                  {[1, 3, 5, 10, 25, 50].map(km => (
                    <button
                      key={km} type="button" onClick={() => handleRadiusChange(km)}
                      style={{
                        padding: '6px 9px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        backgroundColor: mapRadius === km ? '#111827' : 'transparent', color: mapRadius === km ? '#ffffff' : '#4b5563'
                      }}
                    >
                      {km}km
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const inRadiusSalons = mapSalons.filter(s => parseFloat(s.distance_km) <= mapRadius);
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {[
                        { key: 'TOUS', label: `Tous (${inRadiusSalons.length})`, dot: null },
                        { key: 'LIBRE', label: `Jamais visités (${inRadiusSalons.filter(s => s.statut_carte === 'LIBRE').length})`, dot: '#10b981' },
                        { key: 'VISITES', label: `Déjà visités (${inRadiusSalons.filter(s => s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE').length})`, dot: '#9ca3af' },
                        { key: 'PROSPECTE_MOI', label: `Mes leads (${inRadiusSalons.filter(s => s.statut_carte === 'PROSPECTE_MOI').length})`, dot: '#2563eb' },
                        { key: 'PROSPECTE_AUTRE', label: `Réservés (${inRadiusSalons.filter(s => s.statut_carte === 'PROSPECTE_AUTRE').length})`, dot: '#f59e0b' },
                        { key: 'CLIENT_STACK', label: `Clients (${inRadiusSalons.filter(s => s.statut_carte === 'CLIENT_STACK').length})`, dot: '#111827' }
                      ].map(tab => (
                        <button
                          key={tab.key} type="button" onClick={() => setMapFilter(tab.key)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '9px',
                            border: mapFilter === tab.key ? '1px solid #111827' : '1px solid #e5e7eb',
                            backgroundColor: mapFilter === tab.key ? '#111827' : '#ffffff',
                            color: mapFilter === tab.key ? '#ffffff' : '#374151', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                          }}
                        >
                          {tab.dot && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tab.dot }} />}
                          {tab.label}
                        </button>
                      ))}

                      {/* Bouton Toggle : Masquer les salons déjà visités */}
                      <button
                        type="button"
                        onClick={() => setHideVisitedSalons(!hideVisitedSalons)}
                        style={{
                          padding: '6px 11px', borderRadius: '9px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                          border: hideVisitedSalons ? '1px solid #16a34a' : '1px solid #e5e7eb',
                          backgroundColor: hideVisitedSalons ? '#dcfce7' : '#f9fafb',
                          color: hideVisitedSalons ? '#166534' : '#4b5563'
                        }}
                      >
                        {hideVisitedSalons ? '✓ Visités masqués' : 'Masquer les visités'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowRoutePlanner(!showRoutePlanner)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '7px',
                          padding: '7px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
                          background: showRoutePlanner ? '#111827' : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                          color: '#ffffff', border: 'none', boxShadow: '0 4px 12px rgba(17,24,39,0.14)'
                        }}
                      >
                        <Icon.Compass /> Planificateur de Tournée ({routeSalons.length})
                      </button>

                      <select
                        value={mapSortBy}
                        onChange={e => setMapSortBy(e.target.value)}
                        style={{
                          padding: '7px 12px', borderRadius: '10px', border: '1px solid #e5e7eb',
                          backgroundColor: '#f9fafb', fontSize: '12px', fontWeight: '600', color: '#111827', cursor: 'pointer', outline: 'none'
                        }}
                      >
                        <option value="DISTANCE_ASC">Trier : Distance ↑</option>
                        <option value="STARS_DESC">Trier : Étoiles ★ (Meilleure)</option>
                        <option value="STARS_ASC">Trier : Étoiles ★ (Pire)</option>
                      </select>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* TIROIR PLANIFICATEUR DE TOURNÉE INTELLIGENT (OSRM + WAZE / GOOGLE MAPS) */}
            {showRoutePlanner && (
              <div style={{
                ...cardStyle,
                backgroundColor: '#ffffff',
                border: '1px solid #111827',
                padding: isMobile ? '16px' : '20px 24px',
                marginBottom: '18px',
                boxShadow: '0 10px 25px rgba(17,24,39,0.05)'
              }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Icon.Map /> Algorithme OSRM • Optimisation Terrain
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '2px 0 0 0', color: '#111827' }}>
                      Construisez votre feuille de route optimale
                    </h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {routeSalons.length > 0 && (
                      <button type="button" onClick={() => { setRouteSalons([]); setOptimizedRoute(null); }} style={{ ...secondaryBtn, color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
                        Vider la liste
                      </button>
                    )}
                    <button type="button" onClick={() => setShowRoutePlanner(false)} style={secondaryBtn}>Fermer <Icon.Check style={{width: 14, height: 14}}/></button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr auto auto', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#4b5563', marginBottom: '5px' }}>
                      1. Point de départ verrouillé
                    </label>
                    <div style={{ ...inputStyle, backgroundColor: '#f9fafb', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon.MapPin /> {mapCenter.label || 'Ma position GPS'}
                      </span>
                      <button type="button" onClick={handleGeolocateAgent} style={{ background: 'none', border: 'none', color: '#111827', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', padding: 0 }}>Actualiser</button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#4b5563', marginBottom: '5px' }}>
                      2. Point d'arrivée (Domicile / Bureau)
                    </label>
                    <input
                      type="text"
                      placeholder="Laisser vide pour une boucle au point de départ"
                      value={routeEndQuery}
                      onChange={e => { setRouteEndQuery(e.target.value); setRouteEndPoint(null); }}
                      style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#4b5563', marginBottom: '5px' }}>
                      3. Nombre de salons
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select value={routeMaxCount} onChange={e => setRouteMaxCount(Number(e.target.value))} style={{ ...inputStyle, backgroundColor: '#ffffff', width: '95px' }}>
                        {[5, 8, 10, 12, 15].map(n => <option key={n} value={n}>{n} salons</option>)}
                      </select>
                      <button type="button" onClick={handleAutoSelectRouteSalons} style={secondaryBtn}>
                        Sélection Auto
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isOptimizingRoute}
                    onClick={handleOptimizeTournee}
                    style={{ ...primaryBtn, height: '42px', padding: '0 20px', backgroundColor: '#111827', border: '1px solid #111827' }}
                  >
                    {isOptimizingRoute ? 'Calcul OSRM...' : <><Icon.Zap /> Optimiser la route</>}
                  </button>
                </div>

                {/* Liste ordonnée des étapes + Export Waze & Google Maps */}
                {routeSalons.length > 0 && (
                  <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827' }}>
                          Étapes de votre tournée ({routeSalons.length} salons)
                        </span>
                        {optimizedRoute && (
                          <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: '#e5e7eb', color: '#111827', fontSize: '12px', fontWeight: '700' }}>
                            Trajet total : {optimizedRoute.total_distance_km} km • ~{optimizedRoute.estimated_minutes} min (visites incluses)
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                          href={(() => {
                            const origin = `${mapCenter.lat},${mapCenter.lng}`;
                            const dest = routeEndPoint ? `${routeEndPoint.lat},${routeEndPoint.lng}` : `${routeSalons[routeSalons.length - 1].lat},${routeSalons[routeSalons.length - 1].lng}`;
                            const waypoints = routeSalons.slice(0, 9).map(s => `${s.lat},${s.lng}`).join('|');
                            return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ ...primaryBtn, padding: '8px 14px', fontSize: '12px', textDecoration: 'none', backgroundColor: '#111827' }}
                        >
                          <Icon.Map /> Itinéraire complet (Google Maps)
                        </a>
                        <a
                          href={`https://waze.com/ul?ll=${routeSalons[0].lat},${routeSalons[0].lng}&navigate=yes`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ ...secondaryBtn, padding: '8px 14px', fontSize: '12px', textDecoration: 'none', backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
                        >
                          <Icon.Car /> Waze (Étape #1)
                        </a>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {routeSalons.map((s, idx) => (
                        <div
                          key={s.siret}
                          onClick={() => setSelectedSalonMap(s)}
                          style={{
                            minWidth: '185px', padding: '10px 12px', borderRadius: '11px',
                            border: '1px solid #e5e7eb', backgroundColor: '#ffffff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <span style={{
                              width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
                              backgroundColor: '#111827', color: '#ffffff', fontSize: '11px', fontWeight: '800',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {idx + 1}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.nom_salon}</div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>{s.distance_km} km • ★ {s.etoiles || 'N/A'}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleSalonInRoute(s); }}
                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', padding: 0 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 390px', gap: '16px', alignItems: 'stretch' }}>
              <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', height: isMobile ? '380px' : '580px', position: 'relative', marginBottom: 0 }}>
                <div id="stack-partners-map" style={{ width: '100%', height: '100%' }} />

                {mapLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(3px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      backgroundColor: '#111827', color: '#ffffff', padding: '12px 22px', borderRadius: '999px', fontSize: '13px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff', animation: 'spin 0.8s linear infinite' }} />
                      Scan initial...
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {mapProgress !== null && mapProgress > 0 && mapProgress < 6 && (
                  <>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 1000 }}>
                      <div style={{ width: `${(mapProgress / 5) * 100}%`, height: '100%', backgroundColor: '#8b5cf6', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{
                      position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: '#111827', color: '#ffffff', padding: '6px 14px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700',
                      zIndex: 1000, boxShadow: '0 6px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff', animation: 'spin 0.8s linear infinite' }} />
                      Recherche approfondie... ({mapSalons.filter(s => parseFloat(s.distance_km) <= mapRadius).length})
                    </div>
                  </>
                )}
              </div>

              <div style={{ ...cardStyle, height: isMobile ? 'auto' : '580px', maxHeight: isMobile ? '560px' : '580px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', marginBottom: 0, overflowY: 'auto' }}>
                {selectedSalonMap ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                      <span style={{
                        padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                        backgroundColor:
                          selectedSalonMap.statut_carte === 'LIBRE' ? '#dcfce7' :
                          selectedSalonMap.statut_carte === 'PROSPECTE_MOI' ? '#dbeafe' :
                          (selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE') ? '#f3f4f6' : '#fef3c7',
                        color:
                          selectedSalonMap.statut_carte === 'LIBRE' ? '#166534' :
                          selectedSalonMap.statut_carte === 'PROSPECTE_MOI' ? '#1e40af' :
                          (selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE') ? '#374151' : '#92400e'
                      }}>
                        {selectedSalonMap.statut_carte === 'LIBRE' && 'Jamais visité — Cible Libre'}
                        {selectedSalonMap.statut_carte === 'VISITE_MOI' && 'Visité par moi'}
                        {selectedSalonMap.statut_carte === 'VISITE_AUTRE' && `Visité par ${selectedSalonMap.visite_info?.agent_nom_complet || 'un agent'}`}
                        {selectedSalonMap.statut_carte === 'PROSPECTE_MOI' && `Mon prospect (${selectedSalonMap.jours_restants}j)`}
                        {selectedSalonMap.statut_carte === 'PROSPECTE_AUTRE' && 'Réservé par un autre agent'}
                        {selectedSalonMap.statut_carte === 'CLIENT_STACK' && 'Déjà équipé STACK'}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => { toggleSalonInRoute(selectedSalonMap); setShowRoutePlanner(true); }}
                          style={{
                            padding: '5px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer',
                            border: '1px solid #111827',
                            backgroundColor: routeSalons.some(r => r.siret === selectedSalonMap.siret) ? '#111827' : '#ffffff',
                            color: routeSalons.some(r => r.siret === selectedSalonMap.siret) ? '#ffffff' : '#111827'
                          }}
                        >
                          {routeSalons.some(r => r.siret === selectedSalonMap.siret) ? '✓ Dans ma tournée' : '+ Tournée'}
                        </button>
                        <button type="button" onClick={() => setSelectedSalonMap(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>✕</button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 8px 0' }}>{selectedSalonMap.nom_salon}</h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                        backgroundColor: selectedSalonMap.etoiles ? '#fffbeb' : '#f3f4f6',
                        color: selectedSalonMap.etoiles ? '#b45309' : '#6b7280',
                        border: selectedSalonMap.etoiles ? '1px solid #fde68a' : '1px solid #e5e7eb'
                      }}>
                        ★ {selectedSalonMap.etoiles ? `${selectedSalonMap.etoiles} / 5` : 'N/A'}
                      </span>
                      <span style={{ padding: '4px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151' }}>
                        À {selectedSalonMap.distance_km} km
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
                        {selectedSalonMap.adresse}, {selectedSalonMap.code_postal} {selectedSalonMap.ville}
                      </span>
                    </div>

                    {/* Encart Traçabilité Réseau si déjà visité */}
                    {selectedSalonMap.visite_info && (
                      <div style={{
                        backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px',
                        padding: '10px 12px', marginBottom: '12px', fontSize: '12px'
                      }}>
                        <div style={{ fontWeight: '700', color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon.User /> {selectedSalonMap.visite_info.agent_nom_complet}
                          </span>
                          <span style={{ color: '#6b7280', fontWeight: '600' }}>
                            {new Date(selectedSalonMap.visite_info.date_visite).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div style={{ color: '#4b5563', marginTop: '6px', fontSize: '11.5px' }}>
                          Concurrent identifié : <strong style={{ color: '#111827' }}>{selectedSalonMap.visite_info.tag_concurrent}</strong><br/>
                          Remise à zéro automatique le {new Date(selectedSalonMap.visite_info.date_expiration).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    )}

                    {/* BLOC CRM TERRAIN : TAGS RAPIDES + NOTE TEXTUELLE + VALIDATION GPS 100M */}
                    <div style={{
                      backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '14px',
                      padding: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Équipement actuel / Qualification
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[
                            { id: 'PLANITY', label: 'Planity' },
                            { id: 'TREATWELL', label: 'Treatwell' },
                            { id: 'CAHIER_PAPIER', label: 'Cahier papier' },
                            { id: 'A_RAPPELER', label: 'À rappeler' }
                          ].map(tg => {
                            const active = visiteForm.tag_concurrent === tg.id;
                            return (
                              <button
                                key={tg.id}
                                type="button"
                                onClick={() => setVisiteForm({ ...visiteForm, tag_concurrent: tg.id })}
                                style={{
                                  padding: '5px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer',
                                  border: active ? '1px solid #111827' : '1px solid #e5e7eb',
                                  backgroundColor: active ? '#111827' : '#f9fafb',
                                  color: active ? '#ffffff' : '#4b5563'
                                }}
                              >
                                {tg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                          Issue de la visite & Délai de carence
                        </div>
                        <select
                          value={visiteForm.statut_visite}
                          onChange={e => setVisiteForm({ ...visiteForm, statut_visite: e.target.value })}
                          style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px', backgroundColor: '#f9fafb' }}
                        >
                          <option value="ABSENT_3MOIS">Gérant absent / Plaquette déposée (Re-libre dans 3 mois)</option>
                          <option value="A_RAPPELER_3MOIS">Intéressé / À rappeler (Re-libre dans 3 mois)</option>
                          <option value="REFUS_1AN">Refus catégorique / Engagé 2 ans (Re-libre dans 1 an)</option>
                        </select>
                      </div>

                      <div>
                        <textarea
                          rows={2}
                          placeholder="Note personnelle (prénom du gérant, horaires creux, matériel...)"
                          value={visiteForm.note_texte}
                          onChange={e => setVisiteForm({ ...visiteForm, note_texte: e.target.value })}
                          style={{ ...inputStyle, backgroundColor: '#f9fafb', fontSize: '12.5px', resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <button
                          type="button"
                          disabled={isSavingVisite}
                          onClick={() => handleSaveVisiteOrNote(false)}
                          style={{ ...secondaryBtn, flex: 1, padding: '9px 10px', fontSize: '12px', backgroundColor: '#ffffff' }}
                        >
                          Sauvegarder la note
                        </button>
                        <button
                          type="button"
                          disabled={isSavingVisite}
                          onClick={() => handleSaveVisiteOrNote(true, false)}
                          style={{ ...primaryBtn, flex: 1.4, padding: '9px 12px', fontSize: '12px', backgroundColor: '#111827' }}
                        >
                          <Icon.Crosshair /> Valider visite (GPS)
                        </button>
                      </div>

                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => handleSaveVisiteOrNote(true, true)}
                          style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', textAlign: 'right', marginTop: '2px' }}
                        >
                          Validation forcée Super-Admin (sans GPS)
                        </button>
                      )}
                    </div>

                    {selectedSalonMap.statut_carte !== 'PROSPECTE_AUTRE' && selectedSalonMap.statut_carte !== 'CLIENT_STACK' && selectedSalonMap.statut_carte !== 'PROSPECTE_MOI' && (
                      <form onSubmit={handleQuickLockFromMap} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Verrouiller en Prospect Exclusif (45j)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <input type="email" required placeholder="E-mail gérant" value={quickLockForm.email_gerant} onChange={e => setQuickLockForm({ ...quickLockForm, email_gerant: e.target.value })} style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px' }} />
                          <input type="text" placeholder="Téléphone" value={quickLockForm.telephone_salon || selectedSalonMap.telephone || ''} onChange={e => setQuickLockForm({ ...quickLockForm, telephone_salon: e.target.value })} style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px' }} />
                        </div>
                        <button type="submit" style={{ ...primaryBtn, width: '100%', padding: '9px' }}><Icon.Check /> Réserver ce lead (45j)</button>
                      </form>
                    )}

                    {selectedSalonMap.statut_carte === 'PROSPECTE_MOI' && (
                      <button
                        type="button"
                        onClick={() => {
                          setFactureData({ nom_salon: selectedSalonMap.nom_salon, siret_salon: selectedSalonMap.siret, adresse_salon: `${selectedSalonMap.adresse}, ${selectedSalonMap.code_postal} ${selectedSalonMap.ville}` });
                          setShowFactureForm(true);
                          setActiveTab('factures');
                        }}
                        style={{ ...primaryBtn, width: '100%', marginTop: 'auto' }}
                      >
                        <Icon.Factures /> Créer la facture 99 € HT
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {(() => {
                      const filteredList = mapSalons
                        .filter(s => {
                          if (parseFloat(s.distance_km) > mapRadius) return false;
                          if (hideVisitedSalons && (s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE' || s.visite_info?.est_visite_physique)) return false;
                          if (mapFilter === 'TOUS') return true;
                          if (mapFilter === 'VISITES') return s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE';
                          return s.statut_carte === mapFilter;
                        })
                        .slice()
                        .sort((a, b) => {
                          if (mapSortBy === 'STARS_DESC') {
                            const rA = a.etoiles !== null && a.etoiles !== undefined ? Number(a.etoiles) : -1;
                            const rB = b.etoiles !== null && b.etoiles !== undefined ? Number(b.etoiles) : -1;
                            if (rB !== rA) return rB - rA;
                          } else if (mapSortBy === 'STARS_ASC') {
                            const rA = a.etoiles !== null && a.etoiles !== undefined ? Number(a.etoiles) : 99;
                            const rB = b.etoiles !== null && b.etoiles !== undefined ? Number(b.etoiles) : 99;
                            if (rA !== rB) return rA - rB;
                          }
                          return parseFloat(a.distance_km) - parseFloat(b.distance_km);
                        });

                      return (
                        <>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Salons dans le rayon ({filteredList.length})</span>
                            {filteredList.length > 120 && <span style={{ fontSize: '11px', color: '#9ca3af' }}>Top 120 affichés</span>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                            {filteredList.slice(0, 120).map(s => {
                              const inRoute = routeSalons.some(r => r.siret === s.siret);
                              const isVisited = s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE';
                              return (
                                <div
                                  key={s.siret}
                                  onClick={() => {
                                    setSelectedSalonMap(s);
                                    if (window.__stackMap) {
                                      window.__stackMap.setView([s.lat, s.lng], Math.max(window.__stackMap.getZoom(), 16));
                                    }
                                  }}
                                  style={{
                                    padding: '11px 13px', borderRadius: '12px',
                                    border: inRoute ? '1.5px solid #111827' : '1px solid #f3f4f6',
                                    backgroundColor: isVisited ? '#f3f4f6' : '#f9fafb',
                                    opacity: isVisited ? 0.78 : 1,
                                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {s.nom_salon}
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                      <span>{s.ville || 'France'} • {s.distance_km} km</span>
                                      <span style={{
                                        padding: '1px 6px', borderRadius: '5px', fontSize: '10.5px', fontWeight: '700',
                                        backgroundColor: s.etoiles ? '#fffbeb' : '#f3f4f6',
                                        color: s.etoiles ? '#b45309' : '#6b7280'
                                      }}>
                                        ★ {s.etoiles ? s.etoiles : 'N/A'}
                                      </span>
                                      {s.visite_info && (
                                        <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#4b5563' }}>
                                          • Visité ({s.visite_info.agent_nom_complet})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                    <button
                                      type="button"
                                      title="Ajouter à ma tournée"
                                      onClick={(e) => { e.stopPropagation(); toggleSalonInRoute(s); }}
                                      style={{
                                        padding: '4px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                                        border: '1px solid #e5e7eb',
                                        backgroundColor: inRoute ? '#111827' : '#ffffff',
                                        color: inRoute ? '#ffffff' : '#374151'
                                      }}
                                    >
                                      {inRoute ? '✓' : '+'}
                                    </button>
                                    <span style={{
                                      width: '9px', height: '9px', borderRadius: '50%',
                                      backgroundColor:
                                        s.statut_carte === 'LIBRE' ? '#10b981' :
                                        s.statut_carte === 'PROSPECTE_MOI' ? '#2563eb' :
                                        s.statut_carte === 'PROSPECTE_AUTRE' ? '#f59e0b' :
                                        isVisited ? '#9ca3af' : '#111827'
                                    }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </>
        )}
        {/* ONGLET 4 : FACTURES D'INSTALLATION */}
        {activeTab === 'factures' && (
          <>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>Factures d'Installation (99 € HT)</h1>
                <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Émettez vos factures de mise en service et validez leur règlement</span>
              </div>
              <button onClick={() => setShowFactureForm(!showFactureForm)} style={primaryBtn}>
                <Icon.Plus /> Nouvelle Facture
              </button>
            </div>

            {showFactureForm && (
              <form onSubmit={handleCreateFacture} style={{ ...cardStyle, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                <input type="text" placeholder="Nom du Salon" required value={factureData.nom_salon} onChange={e => setFactureData({...factureData, nom_salon: e.target.value})} style={inputStyle}/>
                <input type="text" placeholder="SIRET du Salon" required value={factureData.siret_salon} onChange={e => setFactureData({...factureData, siret_salon: e.target.value})} style={inputStyle}/>
                <input type="text" placeholder="Adresse complète" required value={factureData.adresse_salon} onChange={e => setFactureData({...factureData, adresse_salon: e.target.value})} style={inputStyle}/>
                <button type="submit" style={primaryBtn}>Générer</button>
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
                  {factures.length === 0 ? <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucune facture émise.</td></tr> : factures.map(f => (
                    <tr key={f.id_facture} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 18px', color: '#6b7280' }}>{new Date(f.date_emission).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '600' }}>{f.numero_facture}</td>
                      <td style={{ padding: '14px 18px' }}>{f.nom_salon}<br/><span style={{ fontSize: '12px', color: '#6b7280' }}>SIRET : {f.siret_salon}</span></td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: f.statut === 'PAYEE' ? '#dcfce7' : '#fef3c7', color: f.statut === 'PAYEE' ? '#166534' : '#92400e' }}>
                          {f.statut === 'PAYEE' ? 'Payée' : 'En attente'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleDownload(f.id_facture, f.numero_facture)} style={secondaryBtn}><Icon.FileDownload /> PDF</button>
                        {f.statut !== 'PAYEE' && (
                          <button onClick={() => handlePay(f.id_facture)} style={{ ...primaryBtn, padding: '8px 12px', fontSize: '12px' }}><Icon.Check /> Valider paiement</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ONGLET 5 : ACADÉMIE & SIMULATEURS */}
        {activeTab === 'academie' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>Académie STACK & Simulateurs Live</h1>
              <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Salons de test isolés, scripts de réponse aux objections et formations vidéos.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', backgroundColor: '#f3f4f6', color: '#374151' }}>Auto-destruction 24h</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '12px 0 8px 0' }}>Créer un Salon Vide</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, margin: '0 0 18px 0' }}>Salon 100% vierge purgé après 24h pour vous exercer à paramétrer de A à Z.</p>
                </div>
                <button type="button" disabled={!!sandboxLoading} onClick={() => handleLaunchSandbox('VIDE', 'LAUNCH')} style={{ ...primaryBtn, width: '100%' }}>
                  <Icon.ArrowUpRight /> {sandboxLoading === 'VIDE_LAUNCH' ? 'Création...' : 'Lancer un salon vide'}
                </button>
              </div>

              <div style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1.5px solid #111827' }}>
                <div>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', backgroundColor: '#dcfce7', color: '#166534' }}>Données Riches + Personnalisable</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '12px 0 8px 0' }}>Salon Démo Pré-rempli</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, margin: '0 0 14px 0' }}>Embarque équipe, catalogue et clients. Personnalisez-le et sauvegardez votre version.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button type="button" disabled={!!sandboxLoading} onClick={() => handleLaunchSandbox('DEMO', 'LAUNCH')} style={{ ...primaryBtn, width: '100%' }}>
                    <Icon.ArrowUpRight /> Ouvrir mon salon Démo
                  </button>
                  <button type="button" disabled={!!sandboxLoading} onClick={() => handleLaunchSandbox('DEMO', 'SAVE_CUSTOM')} style={{ ...secondaryBtn, width: '100%' }}>
                    <Icon.Check /> Enregistrer ma config
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button type="button" disabled={!!sandboxLoading} onClick={() => handleLaunchSandbox('DEMO', 'RESET_CUSTOM')} style={secondaryBtn}>Réinitialiser</button>
                    <button type="button" disabled={!!sandboxLoading} onClick={() => handleLaunchSandbox('DEMO', 'RESET_DEFAULT')} style={{ ...secondaryBtn, color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>Défaut</button>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', backgroundColor: '#dbeafe', color: '#1e40af' }}>Tunnel Légal + Checklist</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '12px 0 8px 0' }}>Simulateur d'Onboarding</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, margin: '0 0 18px 0' }}>Réplique de la 1ère connexion : signature CGV, code partenaire ({agent.code}) et checklist.</p>
                </div>
                <button type="button" disabled={!!sandboxLoading} onClick={() => handleLaunchSandbox('ONBOARDING', 'LAUNCH')} style={{ ...primaryBtn, width: '100%' }}>
                  <Icon.ArrowUpRight /> S'exercer à l'onboarding
                </button>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: '12px 18px' }}>
              {[
                { q: "« C'est trop cher, je paie moins cher ailleurs (ou j'ai un cahier papier). »", a: "STACK est rentabilisé dès la 1ère semaine grâce au Winback automatique, à la pointeuse PIN et au scan IA des factures. De plus, un cahier papier expose à 7 500 € d'amende NF525." },
                { q: "« Je suis déjà chez Planity / Treatwell / Wavy, c'est compliqué de changer. »", a: "Mes 99 € HT incluent l'importation intégrale de votre catalogue, la création de votre équipe et votre formation sur place en 45 minutes, avec 30 jours d'essai gratuit." },
                { q: "« Pourquoi payer 99 € HT de frais d'installation aujourd'hui ? »", a: "Ils rémunèrent mon intervention physique en salon : paramétrage TVA, création des collaborateurs, test matériel et formation à la clôture journalière certifiée NF525." },
                { q: "« Et si internet coupe en plein samedi après-midi ? »", a: "STACK intègre un mode Hors-Ligne natif : vous encaissez normalement et tout est synchronisé dès le retour de la connexion." }
              ].map((item, idx) => {
                const isOpen = openObjectionIdx === idx;
                return (
                  <div key={idx} style={{ borderBottom: idx < 3 ? '1px solid #f3f4f6' : 'none', padding: '12px 0' }}>
                    <button type="button" onClick={() => setOpenObjectionIdx(isOpen ? null : idx)} style={{ width: '100%', background: 'none', border: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{item.q}</span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: '#6b7280' }}>{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div style={{ marginTop: '10px', padding: '12px 14px', backgroundColor: '#f9fafb', borderRadius: '12px', fontSize: '13px', color: '#374151', lineHeight: 1.55, borderLeft: '3px solid #111827' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {tutorialsList.map((vid) => (
                <div key={vid.id} style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div onClick={() => setActiveVideoModal(vid)} style={{ height: '140px', borderRadius: '14px', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '12px', cursor: 'pointer' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>▶</div>
                      <span style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{vid.duree}</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#863bff', textTransform: 'uppercase' }}>{vid.cat}</div>
                    <div style={{ fontSize: '14.5px', fontWeight: '700', margin: '4px 0 6px 0' }}>{vid.titre}</div>
                    <div style={{ fontSize: '12.5px', color: '#6b7280', lineHeight: 1.45, marginBottom: '14px' }}>{vid.desc}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setActiveVideoModal(vid)} style={{ ...primaryBtn, flex: 1, padding: '10px' }}>Regarder</button>
                    {isSuperAdmin && <button type="button" onClick={() => handleUpdateVideoUrl(vid.id)} style={secondaryBtn}>Lien</button>}
                  </div>
                </div>
              ))}
            </div>

            {activeVideoModal && (
              <div onClick={() => setActiveVideoModal(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17,24,39,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '780px', backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '15px' }}>{activeVideoModal.titre}</strong>
                    <button type="button" onClick={() => setActiveVideoModal(null)} style={secondaryBtn}>Fermer ✕</button>
                  </div>
                  <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                    <iframe src={activeVideoModal.embedUrl} title={activeVideoModal.titre} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ONGLET 6 : PARAMÈTRES & CONFORMITÉ */}
        {activeTab === 'profil' && (
          <>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>Paramètres & Dossier de Conformité</h1>
                <span style={{ fontSize: '13.5px', color: '#6b7280' }}>Validez les 6 étapes ci-dessous pour débloquer votre droit de prospection et facturation.</span>
              </div>
              <span style={{ padding: '8px 14px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '700', backgroundColor: profilData.autorise_a_vendre ? '#dcfce7' : '#f3f4f6', color: profilData.autorise_a_vendre ? '#166534' : '#374151', border: '1px solid #e5e7eb' }}>
                {profilData.autorise_a_vendre ? 'Compte Actif — Vente Autorisée' : 'Dossier en cours de validation'}
              </span>
            </div>

            {!profilData.autorise_a_vendre && profilData.motifs_blocage?.length > 0 && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Lock /></div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: '700' }}>Éléments requis pour débloquer votre droit de vente</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Complétez les étapes ci-dessous pour activer votre compte partenaire.</div>
                    </div>
                  </div>
                  <span style={{ padding: '5px 10px', borderRadius: '999px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', fontSize: '11.5px', fontWeight: '700' }}>
                    {profilData.motifs_blocage.length} en attente
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(270px, 1fr))', gap: '8px' }}>
                  {profilData.motifs_blocage.map((motif, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '11px', fontSize: '12.5px', fontWeight: '500' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b', flexShrink: 0 }} />
                      <span>{motif}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ÉTAPE 1 */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
                <div style={{ fontSize: '15.5px', fontWeight: '700' }}>1. Contrat de mandat d'agent commercial</div>
                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700', backgroundColor: profilData.statut_contrat === 'VALIDE' ? '#dcfce7' : '#fef3c7', color: profilData.statut_contrat === 'VALIDE' ? '#166534' : '#92400e' }}>{profilData.statut_contrat}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                Contrat conclu sous condition suspensive d'immatriculation RSAC.
              </p>
              {profilData.contrat_signe && profilData.statut_contrat === 'VALIDE' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon.Check /> Contrat signé électroniquement.
                  </div>
                  <button type="button" onClick={handleYousignSignature} disabled={isYousignLoading} style={secondaryBtn}>
                    {isYousignLoading ? "Génération..." : "Relancer un test de signature Yousign"}
                  </button>
                </div>
              ) : profilData.statut_contrat === 'EN_ATTENTE_SIGNATURE' ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleCheckYousign} disabled={isYousignLoading} style={{ ...primaryBtn, backgroundColor: '#16a34a', width: isMobile ? '100%' : 'auto' }}>
                    <Icon.Check /> {isYousignLoading ? "Vérification..." : "J'ai signé, vérifier mon contrat"}
                  </button>
                  <button type="button" onClick={handleYousignSignature} disabled={isYousignLoading} style={{ ...secondaryBtn, width: isMobile ? '100%' : 'auto' }}>
                    {isYousignLoading ? "Génération..." : "Ouvrir à nouveau le lien Yousign"}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleYousignSignature} disabled={isYousignLoading} style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}>
                  <Icon.Check /> {isYousignLoading ? "Génération..." : "Signer électroniquement le contrat de mandat"}
                </button>
              )}
            </div>

            {/* ÉTAPE 2 */}
            <div style={{ ...cardStyle, opacity: profilData.contrat_signe ? 1 : 0.6 }}>
              <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '14px' }}>2. Identité, SIRET & Immatriculation RSAC</div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date de naissance</label>
                  <input type="date" value={profilData.date_naissance ? profilData.date_naissance.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_naissance: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expiration Identité</label>
                  <input type="date" value={profilData.date_expiration_identite ? profilData.date_expiration_identite.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_expiration_identite: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pièce d'identité</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_identite')} style={{ fontSize: '12px' }} />
                  {renderFilePreviewBadge(profilData.fichier_identite, 'Identité')}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Numéro SIRET (14 chiffres)</label>
                  <input type="text" value={profilData.siret_agent || ''} onChange={e => setProfilData({...profilData, siret_agent: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Forme juridique</label>
                  <select value={profilData.forme_juridique || 'EI'} onChange={e => setProfilData({...profilData, forme_juridique: e.target.value})} style={inputStyle}>
                    <option value="EI">Entrepreneur Individuel / Micro</option>
                    <option value="SOCIETE">Société (SASU, EURL, SAS...)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Début d'activité</label>
                  <input type="date" value={profilData.date_debut_activite ? profilData.date_debut_activite.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_debut_activite: e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Adresse professionnelle complète</label>
                <input type="text" value={profilData.adresse_pro || ''} onChange={e => setProfilData({...profilData, adresse_pro: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Numéro RSAC</label>
                  <input type="text" value={profilData.numero_rsac || ''} onChange={e => setProfilData({...profilData, numero_rsac: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Greffe / Tribunal</label>
                  <input type="text" value={profilData.greffe_rsac || ''} onChange={e => setProfilData({...profilData, greffe_rsac: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date extrait RSAC</label>
                  <input type="date" value={profilData.date_emission_rsac ? profilData.date_emission_rsac.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_emission_rsac: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Extrait RSAC (PDF)</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_rsac')} style={{ fontSize: '12px' }} />
                  {renderFilePreviewBadge(profilData.fichier_rsac, 'RSAC')}
                </div>
              </div>
              <button type="button" disabled={!profilData.contrat_signe} onClick={() => submitEtapeConformite(2)} style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}>
                <Icon.Check /> Enregistrer l'Étape 2
              </button>
            </div>

            {/* ÉTAPE 3 */}
            <div style={cardStyle}>
              <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '12px' }}>3. Attestation de vigilance URSSAF</div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Code vérification URSSAF</label>
                  <input type="text" value={profilData.code_verif_urssaf || ''} onChange={e => setProfilData({...profilData, code_verif_urssaf: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date de délivrance</label>
                  <input type="date" value={profilData.date_emission_urssaf ? profilData.date_emission_urssaf.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_emission_urssaf: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Date d'expiration</label>
                  <input type="date" value={profilData.date_expiration_urssaf ? profilData.date_expiration_urssaf.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_expiration_urssaf: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Fichier URSSAF</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_urssaf')} style={{ fontSize: '12px' }} />
                  {renderFilePreviewBadge(profilData.fichier_urssaf, 'URSSAF')}
                </div>
              </div>
              <button type="button" onClick={() => submitEtapeConformite(3)} style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}>
                <Icon.Check /> Enregistrer l'Étape 3
              </button>
            </div>

            {/* ÉTAPE 4 */}
            <div style={cardStyle}>
              <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '12px' }}>4. Assurance RC Pro, IBAN, TVA & Charte</div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <input type="text" placeholder="Assureur (ex: AXA)" value={profilData.assureur_nom || ''} onChange={e => setProfilData({...profilData, assureur_nom: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="N° Police RC Pro" value={profilData.assureur_contrat || ''} onChange={e => setProfilData({...profilData, assureur_contrat: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Plafond garantie" value={profilData.assureur_plafond || ''} onChange={e => setProfilData({...profilData, assureur_plafond: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expiration RC Pro</label>
                  <input type="date" value={profilData.date_expiration_rc_pro ? profilData.date_expiration_rc_pro.slice(0,10) : ''} onChange={e => setProfilData({...profilData, date_expiration_rc_pro: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Attestation RC Pro</label>
                  <input type="file" accept=".pdf,image/*" onChange={e => handleFileUpload(e, 'fichier_rc_pro')} style={{ fontSize: '12px' }} />
                  {renderFilePreviewBadge(profilData.fichier_rc_pro, 'RC Pro')}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
                <input type="text" placeholder="Titulaire de l'IBAN" value={profilData.titulaire_iban || ''} onChange={e => setProfilData({...profilData, titulaire_iban: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="IBAN" value={profilData.iban || ''} onChange={e => setProfilData({...profilData, iban: e.target.value})} style={inputStyle} />
                <select value={profilData.regime_tva || 'FRANCHISE_293B'} onChange={e => setProfilData({...profilData, regime_tva: e.target.value})} style={inputStyle}>
                  <option value="FRANCHISE_293B">Franchise en base de TVA (293B)</option>
                  <option value="ASSUJETTI_TVA">Assujetti à la TVA</option>
                </select>
              </div>
              <div style={{ backgroundColor: '#f9fafb', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={!!profilData.honneur_aucune_interdiction} onChange={e => setProfilData({...profilData, honneur_aucune_interdiction: e.target.checked})} /><span>Aucune interdiction de gérer ou d'exercer.</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={!!profilData.honneur_pas_exclusivite_employeur} onChange={e => setProfilData({...profilData, honneur_pas_exclusivite_employeur: e.target.checked})} /><span>Aucune clause d'exclusivité employeur bloquante.</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={!!profilData.honneur_pas_mandat_concurrent} onChange={e => setProfilData({...profilData, honneur_pas_mandat_concurrent: e.target.checked})} /><span>Aucun mandat concurrent non déclaré.</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}><input type="checkbox" checked={!!profilData.charte_acceptee} onChange={e => setProfilData({...profilData, charte_acceptee: e.target.checked})} /><span>J'accepte la Charte Commerciale STACK (v1.0).</span></label>
              </div>
              <button type="button" onClick={() => submitEtapeConformite(4)} style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}>
                <Icon.Check /> Enregistrer l'Étape 4
              </button>
            </div>

            {/* ÉTAPE 5 */}
            <form onSubmit={handleQuizSubmit} style={cardStyle}>
              <div style={{ fontSize: '15.5px', fontWeight: '700', marginBottom: '12px' }}>5. Quiz de Certification NF525 & Contact</div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <select required value={quizAnswers.q1} onChange={e => setQuizAnswers({...quizAnswers, q1: e.target.value})} style={inputStyle}>
                  <option value="">Q1. Quelle norme encadre la caisse STACK ?</option>
                  <option value="nf525">La certification NF525 obligatoire</option>
                  <option value="aucune">Aucune norme</option>
                </select>
                <select required value={quizAnswers.q2} onChange={e => setQuizAnswers({...quizAnswers, q2: e.target.value})} style={inputStyle}>
                  <option value="">Q2. Un agent peut-il supprimer un ticket ?</option>
                  <option value="interdit">Strictement interdit (séparation NF525)</option>
                  <option value="autorise">Oui sur demande</option>
                </select>
                <select required value={quizAnswers.q3} onChange={e => setQuizAnswers({...quizAnswers, q3: e.target.value})} style={inputStyle}>
                  <option value="">Q3. Votre statut vis-à-vis de STACK ?</option>
                  <option value="mandataire">Mandataire indépendant</option>
                  <option value="salarie">Salarié STACK</option>
                </select>
                <select required value={quizAnswers.q4} onChange={e => setQuizAnswers({...quizAnswers, q4: e.target.value})} style={inputStyle}>
                  <option value="">Q4. Facturation des 99 € HT de mise en service ?</option>
                  <option value="99">Facturés par l'agent au salon (mention RSAC)</option>
                  <option value="stack">Encaissés par STACK</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '14px' }}>
                <input type="text" placeholder="Téléphone mobile actif" required value={profilData.telephone || ''} onChange={e => setProfilData({...profilData, telephone: e.target.value})} style={{ ...inputStyle, maxWidth: isMobile ? '100%' : '260px' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                  <input type="checkbox" required checked={!!profilData.telephone_confirme} onChange={e => setProfilData({...profilData, telephone_confirme: e.target.checked})} />
                  <span>Je confirme que mes coordonnées sont actives.</span>
                </label>
              </div>
              <button type="submit" style={{ ...primaryBtn, width: isMobile ? '100%' : 'auto' }}><Icon.Check /> Valider le Quiz NF525</button>
            </form>
          </>
        )}

        {/* ===================================================================== */}
        {/* ONGLET 7 : GOD MODE — REFONTE ESTHÉTIQUE EXECUTIVE & RESPONSIVE        */}
        {/* ===================================================================== */}
        {activeTab === 'godmode' && isSuperAdmin && (
          <>
            {/* En-tête Executive Noir & Argent */}
            <div style={{
              background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
              borderRadius: isMobile ? '18px' : '24px',
              padding: isMobile ? '20px 18px' : '28px 32px',
              color: '#ffffff',
              marginBottom: '20px',
              boxShadow: '0 12px 30px rgba(17, 24, 39, 0.14)'
            }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '14px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.12)', fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
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
                  style={{ ...secondaryBtn, backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', alignSelf: isMobile ? 'stretch' : 'auto' }}
                >
                  Actualiser les dossiers
                </button>
              </div>

              {/* 4 KPIs Super-Admin intégrés */}
              <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', marginTop: '22px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Agents Inscrits</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{adminAgents.length}</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Agents Autorisés</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#4ade80' }}>
                    {adminAgents.filter(a => a.statut_compte === 'ACTIF').length}
                  </div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Pièces à Auditer</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: '#fbbf24' }}>{totalPendingPieces}</div>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>Virements à Émettre</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{totalCommissionsToPay} <span style={{ fontSize: '13px', color: '#9ca3af' }}>€</span></div>
                </div>
              </div>
            </div>

            {/* Barre de recherche et filtres d'audit */}
            <div style={{ ...cardStyle, padding: isMobile ? '14px' : '16px 20px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Rechercher un agent (nom, e-mail, code PARTNER, SIRET)..."
                  value={adminSearch}
                  onChange={e => setAdminSearch(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { key: 'TOUS', label: `Tous (${adminAgents.length})` },
                  { key: 'A_VERIFIER', label: `À vérifier (${adminAgents.filter(a => a.statut_compte !== 'ACTIF').length})` },
                  { key: 'ACTIFS', label: `Actifs (${adminAgents.filter(a => a.statut_compte === 'ACTIF').length})` },
                  { key: 'BLOQUES', label: `Bloqués (${adminAgents.filter(a => a.statut_compte === 'BLOQUE_CONFORMITE').length})` }
                ].map(f => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setAdminStatusFilter(f.key)}
                    style={{
                      padding: '8px 13px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer',
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
            {filteredAdminAgents.map(a => {
              const pieces = getAgentPiecesList(a);
              const nbValides = pieces.filter(p => p.val === 'VALIDE').length;
              const pctConforme = Math.round((nbValides / pieces.length) * 100);
              const isExpanded = !!expandedAgentIds[a.id_agent];
              const isActif = a.statut_compte === 'ACTIF';
              const isBloque = a.statut_compte === 'BLOQUE_CONFORMITE';

              return (
                <div key={a.id_agent} style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                  {/* En-tête de la carte Agent */}
                  <div style={{ padding: isMobile ? '16px' : '20px 24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '16px', borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
                        backgroundColor: isActif ? '#dcfce7' : isBloque ? '#fef2f2' : '#f3f4f6',
                        color: isActif ? '#166534' : isBloque ? '#dc2626' : '#111827',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px'
                      }}>
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
                          <span style={{
                            padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700',
                            backgroundColor: isActif ? '#dcfce7' : isBloque ? '#fef2f2' : '#fef3c7',
                            color: isActif ? '#166534' : isBloque ? '#dc2626' : '#92400e'
                          }}>
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

                    {/* Barre de progression + Boutons globaux */}
                    <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', alignItems: isSmall ? 'stretch' : 'center', gap: '10px' }}>
                      <div style={{ minWidth: '140px', textAlign: isSmall ? 'left' : 'right', marginRight: '4px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>{nbValides} / {pieces.length} pièces validées</div>
                        <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                          <div style={{ width: `${pctConforme}%`, height: '100%', backgroundColor: pctConforme === 100 ? '#16a34a' : '#111827', borderRadius: '999px' }} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedAgentIds(prev => ({ ...prev, [a.id_agent]: !prev[a.id_agent] }))}
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

                  {/* Grille détaillée des 9 pièces justificatives */}
                  {isExpanded && (
                    <div style={{ padding: isMobile ? '14px' : '20px 24px', backgroundColor: '#f9fafb' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                        {pieces.map(item => {
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
                                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>{item.step}</span>
                                  <span style={{
                                    padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                    backgroundColor: isValide ? '#dcfce7' : isRefuse ? '#fef2f2' : '#fef3c7',
                                    color: isValide ? '#166534' : isRefuse ? '#dc2626' : '#92400e'
                                  }}>
                                    {item.val || 'MANQUANT'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.label}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.4, wordBreak: 'break-word' }}>{item.info}</div>
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
                                    padding: '6px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '11.5px', fontWeight: '700', flex: 1,
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
                                    padding: '6px 10px', borderRadius: '8px', cursor: 'pointer',
                                    fontSize: '11.5px', fontWeight: '700',
                                    backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fecaca'
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

            {/* Intelligence Terrain : Parts de marché des concurrents remontées par les agents */}
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
                    return adminMarketStats.repartition_concurrents.map(item => {
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
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Aucune commission en attente de virement.</td></tr>
                  ) : adminCommissions.map(c => (
                    <tr key={c.id_commission} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '700' }}>{c.prenom} {c.nom}</td>
                      <td style={{ padding: '14px 18px' }}>{c.periode_mois}<br/><span style={{ fontSize: '12px', color: '#6b7280' }}>{c.nom_salon}</span></td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', color: '#111827' }}>{c.montant_commission} € HT</td>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: '12.5px' }}>{c.iban || 'IBAN non renseigné'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <button onClick={() => handlePayCommission(c.id_commission)} style={{ ...primaryBtn, padding: '8px 14px', fontSize: '12px' }}>
                          <Icon.Check /> Confirmer le virement
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

      {/* BARRE DE NAVIGATION MOBILE FIXE EN BAS (STYLE APP NATIVE) */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 950,
          backgroundColor: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid #e5e7eb',
          display: 'grid',
          gridTemplateColumns: `repeat(${isSuperAdmin ? 6 : 5}, 1fr)`,
          padding: '6px 4px calc(6px + env(safe-area-inset-bottom, 0px)) 4px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.04)'
        }}>
          {[
            { key: 'bord', label: 'Bord', icon: <Icon.Bord /> },
            { key: 'prospects', label: 'Leads', icon: <Icon.Prospects /> },
            { key: 'carte', label: 'Carte', icon: <Icon.MapPin /> },
            { key: 'factures', label: 'Factures', icon: <Icon.Factures /> },
            { key: 'academie', label: 'Tutos', icon: <Icon.Academie /> },
            ...(isSuperAdmin ? [{ key: 'godmode', label: 'Admin', icon: <Icon.Shield /> }] : [])
          ].map(item => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                style={{
                  background: 'none', border: 'none', padding: '6px 2px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px',
                  color: active ? '#111827' : '#9ca3af',
                  fontWeight: active ? '700' : '500',
                  fontSize: '10.5px', cursor: 'pointer'
                }}
              >
                <div style={{
                  padding: '4px 10px', borderRadius: '999px',
                  backgroundColor: active ? '#f3f4f6' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
