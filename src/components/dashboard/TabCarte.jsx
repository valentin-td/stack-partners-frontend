// src/components/dashboard/TabCarte.jsx
// Onglet 3 : Carte de prospection interactive Leaflet, tournees OSRM, qualification CRM

import { useEffect } from 'react';
import { Icon } from '../common/Icons';

export default function TabCarte({
  mapCenter,
  mapRadius,
  handleRadiusChange,
  mapAddressQuery,
  setMapAddressQuery,
  handleSearchAddressMap,
  mapSalons,
  mapLoading,
  mapProgress,
  mapFilter,
  setMapFilter,
  hideVisitedSalons,
  setHideVisitedSalons,
  mapSortBy,
  setMapSortBy,
  selectedSalonMap,
  setSelectedSalonMap,
  visiteForm,
  setVisiteForm,
  isSavingVisite,
  handleSaveVisiteOrNote,
  quickLockForm,
  setQuickLockForm,
  handleQuickLockFromMap,
  handleGeolocateAgent,
  showRoutePlanner,
  setShowRoutePlanner,
  routeSalons,
  setRouteSalons,
  toggleSalonInRoute,
  handleAutoSelectRouteSalons,
  routeMaxCount,
  setRouteMaxCount,
  routeEndQuery,
  setRouteEndQuery,
  routeEndPoint,
  setRouteEndPoint,
  optimizedRoute,
  setOptimizedRoute,
  isOptimizingRoute,
  handleOptimizeTournee,
  setFactureData,
  setShowFactureForm,
  setActiveTab,
  isSuperAdmin,
  isMobile,
  isSmall,
  primaryBtn,
  secondaryBtn,
  inputStyle,
  cardStyle,
  leafletReady
}) {
  // Effet de rendu Leaflet specifique au conteneur de la carte
  useEffect(() => {
    if (!leafletReady || !window.L) return;
    const L = window.L;
    const container = document.getElementById('stack-partners-map');
    if (!container) return;

    if (window.__stackMap && window.__stackMap.getContainer() !== container) {
      try { window.__stackMap.remove(); } catch (e) {}
      window.__stackMap = null;
      window.__stackLayerGroup = null;
      window.__lastCenterKey = null;
    }

    if (!window.__stackMap) {
      if (container._leaflet_id) container._leaflet_id = null;
      const zoomByRadius = mapRadius <= 2 ? 14 : mapRadius <= 5 ? 13 : mapRadius <= 15 ? 11 : 10;
      const map = L.map(container, { zoomControl: false, preferCanvas: true }).setView(
        [mapCenter.lat, mapCenter.lng],
        zoomByRadius
      );
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);
      window.__stackMap = map;
      window.__stackLayerGroup = L.layerGroup().addTo(map);
    }

    const map = window.__stackMap;
    const layerGroup = window.__stackLayerGroup;

    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 400);

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

    const filtered = mapSalons.filter((s) => {
      if (parseFloat(s.distance_km) > mapRadius) return false;
      if (
        hideVisitedSalons &&
        (s.statut_carte === 'VISITE_MOI' ||
          s.statut_carte === 'VISITE_AUTRE' ||
          s.visite_info?.est_visite_physique)
      ) {
        return false;
      }
      if (mapFilter === 'TOUS') return true;
      if (mapFilter === 'VISITES') return s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE';
      return s.statut_carte === mapFilter;
    });

    const renderMarkersAndClusters = () => {
      layerGroup.clearLayers();

      L.circle([mapCenter.lat, mapCenter.lng], {
        radius: mapRadius * 1000,
        color: '#111827',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: '#111827',
        fillOpacity: 0.03
      }).addTo(layerGroup);

      const agentIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#863bff 0%,#47bfff 100%);border:3px solid #fff;box-shadow:0 0 0 4px rgba(134,59,255,0.22);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([mapCenter.lat, mapCenter.lng], { icon: agentIcon }).addTo(layerGroup);

      const currentZoom = map.getZoom();
      const bounds = map.getBounds().pad(0.15);
      const visibleSalons = filtered.filter((s) => bounds.contains([s.lat, s.lng]));

      if (currentZoom >= 16 || visibleSalons.length <= 90) {
        visibleSalons.forEach((salon) => {
          const isSelected = selectedSalonMap?.siret === salon.siret;
          const marker = L.circleMarker([salon.lat, salon.lng], {
            radius: isSelected ? 10 : 7,
            fillColor: colorMap[salon.statut_carte] || '#10b981',
            color: '#ffffff',
            weight: isSelected ? 3 : 2,
            fillOpacity: 0.95
          }).addTo(layerGroup);

          const starsLabel = salon.etoiles ? `${salon.etoiles}/5` : 'N/A';
          marker.bindTooltip(
            `<strong>${salon.nom_salon}</strong><br/>${starsLabel} • ${salon.distance_km} km`,
            { direction: 'top', offset: [0, -6] }
          );
          marker.on('click', () => setSelectedSalonMap(salon));
        });
        return;
      }

      const cellSizePx = currentZoom <= 11 ? 75 : currentZoom <= 13 ? 60 : 46;
      const clusters = new Map();

      visibleSalons.forEach((salon) => {
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

      clusters.forEach((group) => {
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
          const starsLabel = salon.etoiles ? `${salon.etoiles}/5` : 'N/A';
          marker.bindTooltip(
            `<strong>${salon.nom_salon}</strong><br/>${starsLabel} • ${salon.distance_km} km`,
            { direction: 'top', offset: [0, -6] }
          );
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

      if (optimizedRoute?.polyline?.length > 1) {
        L.polyline(optimizedRoute.polyline, {
          color: '#111827',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8'
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
    };
  }, [
    leafletReady,
    mapCenter,
    mapRadius,
    mapSalons,
    mapFilter,
    hideVisitedSalons,
    selectedSalonMap,
    optimizedRoute
  ]);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', margin: '0 0 4px 0' }}>
            Carte de Prospection
          </h1>
          <span style={{ fontSize: '13.5px', color: '#6b7280' }}></span>
        </div>
        <button
          type="button"
          onClick={handleGeolocateAgent}
          style={{ ...primaryBtn, backgroundColor: '#ffffff', color: '#111827', border: '1px solid #e5e7eb' }}
        >
          <Icon.Compass /> Autour de ma position GPS
        </button>
      </div>

      <div style={{ ...cardStyle, padding: isMobile ? '14px' : '18px 22px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', alignItems: 'stretch' }}>
          <form
            onSubmit={handleSearchAddressMap}
            style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', flex: 1, gap: '8px' }}
          >
            <input
              type="text"
              placeholder="Adresse, code postal ou ville..."
              value={mapAddressQuery}
              onChange={(e) => setMapAddressQuery(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={primaryBtn}>
              <Icon.Search /> Centrer
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              backgroundColor: '#f6f6f7',
              padding: '6px 10px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              overflowX: 'auto'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Rayon:</span>
            {[1, 3, 5, 10, 25, 50].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => handleRadiusChange(km)}
                style={{
                  padding: '6px 9px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: mapRadius === km ? '#111827' : 'transparent',
                  color: mapRadius === km ? '#ffffff' : '#4b5563'
                }}
              >
                {km}km
              </button>
            ))}
          </div>
        </div>

        {(() => {
          const inRadiusSalons = mapSalons.filter((s) => parseFloat(s.distance_km) <= mapRadius);
          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid #f3f4f6'
              }}
            >
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { key: 'TOUS', label: `Tous (${inRadiusSalons.length})`, dot: null },
                  { key: 'LIBRE', label: `Jamais visités (${inRadiusSalons.filter((s) => s.statut_carte === 'LIBRE').length})`, dot: '#10b981' },
                  { key: 'VISITES', label: `Déjà visités (${inRadiusSalons.filter((s) => s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE').length})`, dot: '#9ca3af' },
                  { key: 'PROSPECTE_MOI', label: `Mes leads (${inRadiusSalons.filter((s) => s.statut_carte === 'PROSPECTE_MOI').length})`, dot: '#2563eb' },
                  { key: 'PROSPECTE_AUTRE', label: `Réservés (${inRadiusSalons.filter((s) => s.statut_carte === 'PROSPECTE_AUTRE').length})`, dot: '#f59e0b' },
                  { key: 'CLIENT_STACK', label: `Clients (${inRadiusSalons.filter((s) => s.statut_carte === 'CLIENT_STACK').length})`, dot: '#111827' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMapFilter(tab.key)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px',
                      borderRadius: '9px',
                      border: mapFilter === tab.key ? '1px solid #111827' : '1px solid #e5e7eb',
                      backgroundColor: mapFilter === tab.key ? '#111827' : '#ffffff',
                      color: mapFilter === tab.key ? '#ffffff' : '#374151',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.dot && (
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tab.dot }} />
                    )}
                    {tab.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setHideVisitedSalons(!hideVisitedSalons)}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    border: hideVisitedSalons ? '1px solid #16a34a' : '1px solid #e5e7eb',
                    backgroundColor: hideVisitedSalons ? '#dcfce7' : '#f9fafb',
                    color: hideVisitedSalons ? '#166534' : '#4b5563'
                  }}
                >
                  {hideVisitedSalons ? 'Visités masqués (Actif)' : 'Masquer les visités'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowRoutePlanner(!showRoutePlanner)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: showRoutePlanner ? '#111827' : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(17,24,39,0.14)'
                  }}
                >
                  <Icon.Compass /> Planificateur de Tournée ({routeSalons.length})
                </button>

                <select
                  value={mapSortBy}
                  onChange={(e) => setMapSortBy(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#111827',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="DISTANCE_ASC">Trier : Distance ↑</option>
                  <option value="STARS_DESC">Trier : Note avis (Meilleure)</option>
                  <option value="STARS_ASC">Trier : Note avis (Pire)</option>
                </select>
              </div>
            </div>
          );
        })()}
      </div>

      {/* PLANIFICATEUR DE TOURNEE */}
      {showRoutePlanner && (
        <div
          style={{
            ...cardStyle,
            backgroundColor: '#ffffff',
            border: '1px solid #111827',
            padding: isMobile ? '16px' : '20px 24px',
            marginBottom: '18px',
            boxShadow: '0 10px 25px rgba(17,24,39,0.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <Icon.Map />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '2px 0 0 0', color: '#111827' }}>
                Construisez votre feuille de route optimale
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {routeSalons.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRouteSalons([]);
                    setOptimizedRoute(null);
                  }}
                  style={{ ...secondaryBtn, color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
                >
                  Vider la liste
                </button>
              )}
              <button type="button" onClick={() => setShowRoutePlanner(false)} style={secondaryBtn}>
                Fermer (X)
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.3fr auto auto',
              gap: '12px',
              alignItems: 'end',
              marginBottom: '16px'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#4b5563', marginBottom: '5px' }}>
                1. Point de départ verrouillé
              </label>
              <div
                style={{
                  ...inputStyle,
                  backgroundColor: '#f9fafb',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon.MapPin /> {mapCenter.label || 'Ma position GPS'}
                </span>
                <button
                  type="button"
                  onClick={handleGeolocateAgent}
                  style={{ background: 'none', border: 'none', color: '#111827', fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', padding: 0 }}
                >
                  Actualiser
                </button>
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
                onChange={(e) => {
                  setRouteEndQuery(e.target.value);
                  setRouteEndPoint(null);
                }}
                style={{ ...inputStyle, backgroundColor: '#ffffff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#4b5563', marginBottom: '5px' }}>
                3. Nombre de salons
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  value={routeMaxCount}
                  onChange={(e) => setRouteMaxCount(Number(e.target.value))}
                  style={{ ...inputStyle, backgroundColor: '#ffffff', width: '95px' }}
                >
                  {[5, 8, 10, 12, 15].map((n) => (
                    <option key={n} value={n}>
                      {n} salons
                    </option>
                  ))}
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

          {routeSalons.length > 0 && (
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: '10px',
                  marginBottom: '12px'
                }}
              >
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
                      const dest = routeEndPoint
                        ? `${routeEndPoint.lat},${routeEndPoint.lng}`
                        : `${routeSalons[routeSalons.length - 1].lat},${routeSalons[routeSalons.length - 1].lng}`;
                      const waypoints = routeSalons.slice(0, 9).map((s) => `${s.lat},${s.lng}`).join('|');
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
                      minWidth: '185px',
                      padding: '10px 12px',
                      borderRadius: '11px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '5px',
                          flexShrink: 0,
                          backgroundColor: '#111827',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.nom_salon}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                          {s.distance_km} km • Note : {s.etoiles || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSalonInRoute(s);
                      }}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', padding: 0 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENEUR CARTE + PANNEAU LATERAL */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 390px', gap: '16px', alignItems: 'stretch' }}>
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', height: isMobile ? '380px' : '580px', position: 'relative', marginBottom: 0 }}>
          <div id="stack-partners-map" style={{ width: '100%', height: '100%' }} />

          {mapLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(3px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#ffffff',
                    animation: 'spin 0.8s linear infinite'
                  }}
                />
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
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  zIndex: 1000,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff', animation: 'spin 0.8s linear infinite' }} />
                Recherche approfondie... ({mapSalons.filter((s) => parseFloat(s.distance_km) <= mapRadius).length})
              </div>
            </>
          )}
        </div>

        <div style={{ ...cardStyle, height: isMobile ? 'auto' : '580px', maxHeight: isMobile ? '560px' : '580px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', marginBottom: 0, overflowY: 'auto' }}>
          {selectedSalonMap ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                <span
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor:
                      selectedSalonMap.statut_carte === 'LIBRE'
                        ? '#dcfce7'
                        : selectedSalonMap.statut_carte === 'PROSPECTE_MOI'
                        ? '#dbeafe'
                        : selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE'
                        ? '#f3f4f6'
                        : '#fef3c7',
                    color:
                      selectedSalonMap.statut_carte === 'LIBRE'
                        ? '#166534'
                        : selectedSalonMap.statut_carte === 'PROSPECTE_MOI'
                        ? '#1e40af'
                        : selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE'
                        ? '#374151'
                        : '#92400e'
                  }}
                >
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
                    onClick={() => {
                      toggleSalonInRoute(selectedSalonMap);
                      setShowRoutePlanner(true);
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: '1px solid #111827',
                      backgroundColor: routeSalons.some((r) => r.siret === selectedSalonMap.siret) ? '#111827' : '#ffffff',
                      color: routeSalons.some((r) => r.siret === selectedSalonMap.siret) ? '#ffffff' : '#111827'
                    }}
                  >
                    {routeSalons.some((r) => r.siret === selectedSalonMap.siret) ? 'Dans ma tournée' : '+ Tournée'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSalonMap(null)}
                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                  >
                    X
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 8px 0' }}>{selectedSalonMap.nom_salon}</h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 9px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: selectedSalonMap.etoiles ? '#fffbeb' : '#f3f4f6',
                    color: selectedSalonMap.etoiles ? '#b45309' : '#6b7280',
                    border: selectedSalonMap.etoiles ? '1px solid #fde68a' : '1px solid #e5e7eb'
                  }}
                >
                  Note : {selectedSalonMap.etoiles ? `${selectedSalonMap.etoiles} / 5` : 'N/A'}
                </span>
                <span style={{ padding: '4px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', backgroundColor: '#f3f4f6', color: '#374151' }}>
                  À {selectedSalonMap.distance_km} km
                </span>
                <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
                  {selectedSalonMap.adresse}, {selectedSalonMap.code_postal} {selectedSalonMap.ville}
                </span>
              </div>

              {selectedSalonMap.visite_info && (
                <div
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    marginBottom: '12px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon.User /> {selectedSalonMap.visite_info.agent_nom_complet}
                    </span>
                    <span style={{ color: '#6b7280', fontWeight: '600' }}>
                      {new Date(selectedSalonMap.visite_info.date_visite).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div style={{ color: '#4b5563', marginTop: '6px', fontSize: '11.5px' }}>
                    Concurrent identifié : <strong style={{ color: '#111827' }}>{selectedSalonMap.visite_info.tag_concurrent}</strong><br />
                    Remise à zéro automatique le {new Date(selectedSalonMap.visite_info.date_expiration).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}

              {/* BLOC CRM TERRAIN */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  padding: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
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
                    ].map((tg) => {
                      const active = visiteForm.tag_concurrent === tg.id;
                      return (
                        <button
                          key={tg.id}
                          type="button"
                          onClick={() => setVisiteForm({ ...visiteForm, tag_concurrent: tg.id })}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            border: active ? '1px solid #111827' : '1px solid #e5e7eb',
                            backgroundColor: active ? '#111827' : '#f9fafb',
                            color: active ? '#ffffff' : '#374151'
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
                    onChange={(e) => setVisiteForm({ ...visiteForm, statut_visite: e.target.value })}
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
                    onChange={(e) => setVisiteForm({ ...visiteForm, note_texte: e.target.value })}
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
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      textAlign: 'right',
                      marginTop: '2px'
                    }}
                  >
                    Validation forcée Super-Admin (sans GPS)
                  </button>
                )}
              </div>

              {selectedSalonMap.statut_carte !== 'PROSPECTE_AUTRE' &&
                selectedSalonMap.statut_carte !== 'CLIENT_STACK' &&
                selectedSalonMap.statut_carte !== 'PROSPECTE_MOI' && (
                  <form
                    onSubmit={handleQuickLockFromMap}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: 'auto',
                      paddingTop: '10px',
                      borderTop: '1px solid #f3f4f6'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>
                      Verrouiller en Prospect Exclusif (45j)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="email"
                        required
                        placeholder="E-mail gérant"
                        value={quickLockForm.email_gerant}
                        onChange={(e) => setQuickLockForm({ ...quickLockForm, email_gerant: e.target.value })}
                        style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        placeholder="Téléphone"
                        value={quickLockForm.telephone_salon || selectedSalonMap.telephone || ''}
                        onChange={(e) => setQuickLockForm({ ...quickLockForm, telephone_salon: e.target.value })}
                        style={{ ...inputStyle, padding: '8px 10px', fontSize: '12px' }}
                      />
                    </div>
                    <button type="submit" style={{ ...primaryBtn, width: '100%', padding: '9px' }}>
                      <Icon.Check /> Réserver ce lead (45j)
                    </button>
                  </form>
                )}

              {selectedSalonMap.statut_carte === 'PROSPECTE_MOI' && (
                <button
                  type="button"
                  onClick={() => {
                    setFactureData({
                      nom_salon: selectedSalonMap.nom_salon,
                      siret_salon: selectedSalonMap.siret,
                      adresse_salon: `${selectedSalonMap.adresse}, ${selectedSalonMap.code_postal} ${selectedSalonMap.ville}`
                    });
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
                  .filter((s) => {
                    if (parseFloat(s.distance_km) > mapRadius) return false;
                    if (
                      hideVisitedSalons &&
                      (s.statut_carte === 'VISITE_MOI' ||
                        s.statut_carte === 'VISITE_AUTRE' ||
                        s.visite_info?.est_visite_physique)
                    ) {
                      return false;
                    }
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
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        marginBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>Salons dans le rayon ({filteredList.length})</span>
                      {filteredList.length > 120 && (
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>Top 120 affichés</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                      {filteredList.slice(0, 120).map((s) => {
                        const inRoute = routeSalons.some((r) => r.siret === s.siret);
                        const isVisited = s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE';
                        return (
                          <div
                            key={s.siret}
                            onClick={() => {
                              setSelectedSalonMap(s);
                              if (window.__stackMap) {
                                window.__stackMap.setView(
                                  [s.lat, s.lng],
                                  Math.max(window.__stackMap.getZoom(), 16)
                                );
                              }
                            }}
                            style={{
                              padding: '11px 13px',
                              borderRadius: '12px',
                              border: inRoute ? '1.5px solid #111827' : '1px solid #f3f4f6',
                              backgroundColor: isVisited ? '#f3f4f6' : '#f9fafb',
                              opacity: isVisited ? 0.78 : 1,
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {s.nom_salon}
                              </div>
                              <div
                                style={{
                                  fontSize: '11.5px',
                                  color: '#6b7280',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginTop: '2px',
                                  flexWrap: 'wrap'
                                }}
                              >
                                <span>{s.ville || 'France'} • {s.distance_km} km</span>
                                <span
                                  style={{
                                    padding: '1px 6px',
                                    borderRadius: '5px',
                                    fontSize: '10.5px',
                                    fontWeight: '700',
                                    backgroundColor: s.etoiles ? '#fffbeb' : '#f3f4f6',
                                    color: s.etoiles ? '#b45309' : '#6b7280'
                                  }}
                                >
                                  Note : {s.etoiles ? s.etoiles : 'N/A'}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSalonInRoute(s);
                                }}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '7px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  border: '1px solid #e5e7eb',
                                  backgroundColor: inRoute ? '#111827' : '#ffffff',
                                  color: inRoute ? '#ffffff' : '#374151'
                                }}
                              >
                                {inRoute ? 'Inclus' : '+'}
                              </button>
                              <span
                                style={{
                                  width: '9px',
                                  height: '9px',
                                  borderRadius: '50%',
                                  backgroundColor:
                                    s.statut_carte === 'LIBRE'
                                      ? '#10b981'
                                      : s.statut_carte === 'PROSPECTE_MOI'
                                      ? '#2563eb'
                                      : s.statut_carte === 'PROSPECTE_AUTRE'
                                      ? '#f59e0b'
                                      : isVisited
                                      ? '#9ca3af'
                                      : '#111827'
                                }}
                              />
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
  );
}
