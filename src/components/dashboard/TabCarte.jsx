// src/components/dashboard/TabCarte.jsx
// Onglet 3 : Carte de prospection interactive Leaflet, tournées OSRM et qualification CRM — Design Salon Architecte (Jour & Nuit)

import React, { useState, useEffect, useMemo } from 'react';
import { Icon } from '../common/Icons';

const ACRONYMES_SALON = new Set(['SARL', 'SAS', 'SASU', 'EURL', 'SPA', 'VIP', 'CO', 'NR', 'RN', 'GPS']);

const formatTextePropre = (str) => {
  const s = String(str || '').trim();
  if (!s) return '';
  return s
    .split(/\s+/)
    .map((word) => {
      const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, '').toUpperCase();
      if (ACRONYMES_SALON.has(clean)) return word.toUpperCase();
      return word
        .split(/(['’-])/)
        .map((part) =>
          part === "'" || part === '’' || part === '-'
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join('');
    })
    .join(' ');
};

const getInitialesSalon = (nom = '') => {
  const parts = String(nom || 'S')
    .replace(/[^a-zA-ZÀ-ÿ\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return String(parts[0] || 'SA').slice(0, 2).toUpperCase();
};

export default function TabCarte({
  mapCenter,
  mapRadius,
  handleRadiusChange,
  mapAddressQuery,
  setMapAddressQuery,
  handleSearchAddressMap,
  mapSalons = [],
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
  routeSalons = [],
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
  setActiveTab,
  isSuperAdmin,
  isMobile,
  leafletReady
}) {
  const [rechercheLocaleListe, setRechercheLocaleListe] = useState('');

  // Remise à zéro automatique du scroll au chargement de l'onglet Carte
  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    resetScroll();
    const timers = [0, 40, 100, 200, 350, 600, 1000].map((t) => setTimeout(resetScroll, t));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Salons dans le rayon actif
  const inRadiusSalons = useMemo(
    () => (mapSalons || []).filter((s) => parseFloat(s.distance_km) <= mapRadius),
    [mapSalons, mapRadius]
  );

  // Salons filtrés et triés pour la carte et la liste latérale
  const filteredAndSortedSalons = useMemo(() => {
    const q = rechercheLocaleListe.trim().toLowerCase();

    return inRadiusSalons
      .filter((s) => {
        if (
          hideVisitedSalons &&
          (s.statut_carte === 'VISITE_MOI' ||
            s.statut_carte === 'VISITE_AUTRE' ||
            s.visite_info?.est_visite_physique)
        ) {
          return false;
        }
        if (mapFilter !== 'TOUS') {
          if (mapFilter === 'VISITES') {
            if (s.statut_carte !== 'VISITE_MOI' && s.statut_carte !== 'VISITE_AUTRE') return false;
          } else if (s.statut_carte !== mapFilter) {
            return false;
          }
        }
        if (q) {
          const matchNom = String(s.nom_salon || '').toLowerCase().includes(q);
          const matchVille = String(s.ville || '').toLowerCase().includes(q);
          const matchAdr = String(s.adresse || '').toLowerCase().includes(q);
          return matchNom || matchVille || matchAdr;
        }
        return true;
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
  }, [inRadiusSalons, hideVisitedSalons, mapFilter, mapSortBy, rechercheLocaleListe]);

  // Effet de rendu Leaflet spécifique au conteneur de la carte
  useEffect(() => {
    if (!leafletReady || !window.L) return;
    const L = window.L;
    const container = document.getElementById('stack-partners-map');
    if (!container) return;

    // Neutralisation stricte de l'auto-focus Leaflet pour empêcher le défilement intempestif
    try {
      container.focus = () => {};
      container.tabIndex = -1;
      container.blur();
    } catch (e) {}

    if (window.__stackMap && window.__stackMap.getContainer() !== container) {
      try {
        window.__stackMap.remove();
      } catch (e) {}
      window.__stackMap = null;
      window.__stackLayerGroup = null;
      window.__lastCenterKey = null;
    }

    if (!window.__stackMap) {
      if (container._leaflet_id) container._leaflet_id = null;
      const zoomByRadius = mapRadius <= 2 ? 14 : mapRadius <= 5 ? 13 : mapRadius <= 15 ? 11 : 10;
      const map = L.map(container, { zoomControl: false, preferCanvas: true, keyboard: false }).setView(
        [mapCenter.lat, mapCenter.lng],
        zoomByRadius
      );
      if (map._container) {
        try {
          map._container.focus = () => {};
          map._container.tabIndex = -1;
          map._container.blur();
        } catch (e) {}
      }
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
      PROSPECTE_MOI: '#0284c7',
      PROSPECTE_AUTRE: '#f59e0b',
      CLIENT_STACK: '#065f46',
      VISITE_MOI: '#64748b',
      VISITE_AUTRE: '#94a3b8'
    };

    const renderMarkersAndClusters = () => {
      layerGroup.clearLayers();

      // Cercle de périmètre doux Émeraude/Ardoise (sans violet ni noir dur)
      L.circle([mapCenter.lat, mapCenter.lng], {
        radius: mapRadius * 1000,
        color: '#059669',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: '#10b981',
        fillOpacity: 0.035
      }).addTo(layerGroup);

      // Point GPS de l'agent en Émeraude/Océan harmonisé
      const agentIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#059669 0%,#0284c7 100%);border:3px solid #fff;box-shadow:0 0 0 4px rgba(16,185,129,0.24);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([mapCenter.lat, mapCenter.lng], { icon: agentIcon }).addTo(layerGroup);

      const currentZoom = map.getZoom();
      const bounds = map.getBounds().pad(0.15);
      const visibleSalons = filteredAndSortedSalons.filter((s) => bounds.contains([s.lat, s.lng]));

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

          const starsLabel = salon.etoiles ? `${String(salon.etoiles).replace('.', ',')}/5` : 'N/A';
          marker.bindTooltip(
            `<strong>${formatTextePropre(salon.nom_salon)}</strong><br/>Note : ${starsLabel} • ${salon.distance_km} km`,
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
          const starsLabel = salon.etoiles ? `${String(salon.etoiles).replace('.', ',')}/5` : 'N/A';
          marker.bindTooltip(
            `<strong>${formatTextePropre(salon.nom_salon)}</strong><br/>Note : ${starsLabel} • ${salon.distance_km} km`,
            { direction: 'top', offset: [0, -6] }
          );
          marker.on('click', () => setSelectedSalonMap(salon));
        } else {
          const avgLat = group.sumLat / count;
          const avgLng = group.sumLng / count;
          const size = count >= 100 ? 44 : count >= 25 ? 38 : 32;
          // Dégradé naturel Émeraude clair -> Émeraude moyen -> Vert Forêt profond (fini la tache noire sur >=100)
          const bgCluster = count >= 100 ? '#065f46' : count >= 25 ? '#059669' : '#10b981';

          const clusterIcon = L.divIcon({
            className: '',
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bgCluster};color:#ffffff;border:2.5px solid rgba(255,255,255,0.94);box-shadow:0 6px 16px rgba(6,95,70,0.28);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:${count >= 100 ? 12 : 13}px;cursor:pointer;">${count}</div>`,
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
          color: '#065f46',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8'
        }).addTo(layerGroup);

        (optimizedRoute.orderedSalons || []).forEach((stopSalon, idx) => {
          const stepBadge = L.divIcon({
            className: '',
            html: `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#059669 0%,#064e3b 100%);color:#fff;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;cursor:pointer;">${idx + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          L.marker([stopSalon.lat, stopSalon.lng], { icon: stepBadge, zIndexOffset: 1000 })
            .addTo(layerGroup)
            .bindTooltip(`<strong>Étape #${idx + 1} : ${formatTextePropre(stopSalon.nom_salon)}</strong>`, { direction: 'top' })
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
    filteredAndSortedSalons,
    selectedSalonMap,
    optimizedRoute
  ]);

  return (
    <div
      style={{
        paddingBottom: isMobile ? 'calc(125px + env(safe-area-inset-bottom, 0px))' : '24px',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .sp-salon-card {
          background: var(--sp-bg-pill, rgba(255, 255, 255, 0.90));
          border: var(--sp-border-pill, 1px solid rgba(148, 163, 184, 0.22));
          box-shadow: 0 3px 10px -4px rgba(15, 23, 42, 0.04);
          border-radius: 15px;
          padding: 10px 12px;
          cursor: pointer;
          transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }
        .sp-salon-card:hover {
          transform: translateY(-1px);
          border-color: rgba(16, 185, 129, 0.40);
          box-shadow: 0 8px 18px -6px rgba(15, 23, 42, 0.07);
        }
        .sp-salon-card.in-route {
          border: 1.5px solid #10b981;
          background: rgba(16, 185, 129, 0.08);
        }
        .sp-map-input {
          width: 100%;
          box-sizing: border-box;
          height: 39px;
          padding: 0 13px;
          background: var(--sp-bg-input, #ffffff);
          border: var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.3));
          border-radius: 11px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--sp-text-main, #18181b);
          outline: none;
          transition: border-color 0.15s ease;
        }
        .sp-map-input:focus {
          border-color: #10b981;
        }
        .sp-carte-btn {
          outline: none !important;
        }
        .sp-carte-btn:focus,
        .sp-carte-btn:focus-visible {
          outline: none !important;
        }
        .sp-no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 860px) {
          .sp-carte-split-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
          .sp-carte-map-panel,
          .sp-carte-side-panel {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: 'border-box' !important;
          }
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE FIXE ET GARANTI TOUJOURS VISIBLE (JOUR & NUIT)          */}
      {/* =================================================================== */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'var(--sp-bg-app, #f3f1ed)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          paddingTop: '2px',
          paddingBottom: '8px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '10px',
          marginBottom: isMobile ? '10px' : '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', minWidth: 0 }}>
          <h1
            style={{
              fontSize: isMobile ? '22px' : '27px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.03em',
              color: 'var(--sp-text-main, #18181b)',
              lineHeight: 1.1
            }}
          >
            Carte & Prospection
          </h1>
          {!isMobile && (
            <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
              Qualification terrain & optimisation de tournées OSRM
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'auto auto', gap: '8px', alignItems: 'center', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' }}>
          <button
            type="button"
            onClick={handleGeolocateAgent}
            className="sp-glass-pill sp-carte-btn"
            title="Centrer autour de ma position GPS"
            style={{
              height: '36px',
              padding: isMobile ? '0 10px' : '0 16px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--sp-text-main, #18181b)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
            }}
          >
            <Icon.Compass />
            <span>{isMobile ? 'Ma position' : 'Autour de ma position GPS'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRoutePlanner(!showRoutePlanner)}
            className={`sp-carte-btn ${showRoutePlanner ? '' : 'sp-glass-pill'}`}
            title="Préparer et optimiser une tournée de prospection"
            style={{
              height: '36px',
              padding: isMobile ? '0 10px' : '0 18px',
              borderRadius: '999px',
              backgroundColor: showRoutePlanner ? 'rgba(16, 185, 129, 0.16)' : undefined,
              color: showRoutePlanner ? '#059669' : 'var(--sp-text-main, #18181b)',
              border: showRoutePlanner ? '1.5px solid rgba(16, 185, 129, 0.45)' : undefined,
              fontSize: '12px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              boxShadow: showRoutePlanner ? '0 2px 8px rgba(16, 185, 129, 0.18)' : '0 2px 6px rgba(15, 23, 42, 0.04)'
            }}
          >
            <Icon.Map />
            <span>{isMobile ? `Tournée (${routeSalons.length})` : `Planificateur de Tournée (${routeSalons.length})`}</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BARRE DE CONTRÔLE ADOUCIE (SANS MULTIPLES BLOCS NOIRS)           */}
      {/* =================================================================== */}
      <div
        className="sp-glass-panel"
        style={{
          padding: isMobile ? '10px 12px' : '14px 18px',
          borderRadius: '20px',
          marginBottom: isMobile ? '10px' : '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Ligne 1 : Recherche géographique + Sélecteur de rayon doux */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', alignItems: 'stretch', width: '100%', boxSizing: 'border-box' }}>
          <form
            onSubmit={handleSearchAddressMap}
            style={{ display: 'flex', flexDirection: 'row', flex: 1, gap: '6px', alignItems: 'center', minWidth: 0 }}
          >
            <div
              className="sp-glass-pill"
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 13px',
                height: '38px',
                borderRadius: '999px',
                boxSizing: 'border-box'
              }}
            >
              <Icon.Search />
              <input
                type="text"
                placeholder={isMobile ? 'Ville, CP ou adresse...' : 'Adresse, code postal ou ville (ex : Strasbourg, 67000)...'}
                value={mapAddressQuery}
                onChange={(e) => setMapAddressQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  minWidth: 0,
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: 'var(--sp-text-main, #18181b)'
                }}
              />
              {mapAddressQuery && (
                <button
                  type="button"
                  onClick={() => setMapAddressQuery('')}
                  style={{ background: 'none', border: 'none', color: 'var(--sp-text-muted, #64748b)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleGeolocateAgent}
              className="sp-glass-pill sp-carte-btn"
              title="Centrer la carte sur ma position GPS"
              style={{
                height: '38px',
                padding: isMobile ? '0 10px' : '0 13px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--sp-text-main, #18181b)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              <Icon.Compass />
              <span>{isMobile ? 'GPS' : 'Ma position'}</span>
            </button>

            <button
              type="submit"
              className="sp-carte-btn"
              style={{
                height: '38px',
                padding: isMobile ? '0 14px' : '0 18px',
                borderRadius: '999px',
                backgroundColor: 'var(--sp-btn-primary, #18181b)',
                color: 'var(--sp-btn-primary-text, #ffffff)',
                border: 'none',
                fontSize: '12px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
            >
              {!isMobile && <Icon.Search />}
              <span>Centrer</span>
            </button>
          </form>

          {/* Sélecteur de rayon avec pilule active Émeraude douce */}
          <div
            className="sp-glass-pill sp-no-scrollbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'space-between',
              gap: '2px',
              padding: '3px 5px 3px 11px',
              borderRadius: '999px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              width: isMobile ? '100%' : 'auto',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', whiteSpace: 'nowrap', marginRight: '3px' }}>
              Rayon :
            </span>
            {[1, 3, 5, 10, 25, 50].map((km) => {
              const actif = mapRadius === km;
              return (
                <button
                  key={km}
                  type="button"
                  onClick={() => handleRadiusChange(km)}
                  className="sp-carte-btn"
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: actif ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
                    fontSize: '11.5px',
                    fontWeight: actif ? '800' : '700',
                    cursor: 'pointer',
                    backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                    color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.14s ease'
                  }}
                >
                  {km} km
                </button>
              );
            })}
          </div>
        </div>

        {/* Ligne 2 : Ruban horizontal de filtres adoucis + Masquer visités & Tri */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '8px',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(148, 163, 184, 0.18)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="sp-no-scrollbar"
            style={{
              display: 'flex',
              gap: '6px',
              flexWrap: isMobile ? 'nowrap' : 'wrap',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              alignItems: 'center',
              width: '100%'
            }}
          >
            {[
              { key: 'TOUS', label: `Tous (${inRadiusSalons.length})`, dot: null },
              { key: 'LIBRE', label: `Jamais visités (${inRadiusSalons.filter((s) => s.statut_carte === 'LIBRE').length})`, dot: '#10b981' },
              { key: 'VISITES', label: `Déjà visités (${inRadiusSalons.filter((s) => s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE').length})`, dot: '#64748b' },
              { key: 'PROSPECTE_MOI', label: `Mes leads (${inRadiusSalons.filter((s) => s.statut_carte === 'PROSPECTE_MOI').length})`, dot: '#0284c7' },
              { key: 'PROSPECTE_AUTRE', label: `Réservés (${inRadiusSalons.filter((s) => s.statut_carte === 'PROSPECTE_AUTRE').length})`, dot: '#f59e0b' },
              { key: 'CLIENT_STACK', label: `Clients (${inRadiusSalons.filter((s) => s.statut_carte === 'CLIENT_STACK').length})`, dot: '#065f46' }
            ].map((tab) => {
              const actif = mapFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMapFilter(tab.key)}
                  className="sp-glass-pill sp-carte-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 11px',
                    borderRadius: '999px',
                    border: actif ? '1.5px solid rgba(16, 185, 129, 0.45)' : undefined,
                    backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : undefined,
                    color: actif ? '#059669' : 'var(--sp-text-main, #18181b)',
                    fontSize: '11.5px',
                    fontWeight: actif ? '800' : '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {tab.dot && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: tab.dot, flexShrink: 0 }} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
            <button
              type="button"
              onClick={() => setHideVisitedSalons(!hideVisitedSalons)}
              className="sp-glass-pill sp-carte-btn"
              style={{
                flex: isMobile ? 1 : 'initial',
                padding: '5px 11px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                background: hideVisitedSalons ? 'rgba(16, 185, 129, 0.14)' : undefined,
                border: hideVisitedSalons ? '1px solid rgba(16, 185, 129, 0.4)' : undefined,
                color: hideVisitedSalons ? '#059669' : 'var(--sp-text-muted, #64748b)',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              {hideVisitedSalons && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              <span>{hideVisitedSalons ? 'Visités masqués' : 'Masquer les visités'}</span>
            </button>

            <select
              value={mapSortBy}
              onChange={(e) => setMapSortBy(e.target.value)}
              className="sp-glass-pill sp-carte-btn"
              style={{
                flex: isMobile ? 1 : 'initial',
                padding: '5px 11px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: 'var(--sp-text-main, #18181b)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="DISTANCE_ASC">Trier : Distance ↑</option>
              <option value="STARS_DESC">Trier : Meilleure note</option>
              <option value="STARS_ASC">Trier : Pire note</option>
            </select>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. PLANIFICATEUR DE TOURNÉE OSRM COMPACT & HARMONISÉ                */}
      {/* =================================================================== */}
      {showRoutePlanner && (
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '14px 12px' : '16px 20px',
            borderRadius: '20px',
            marginBottom: isMobile ? '10px' : '14px',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'rgba(16, 185, 129, 0.14)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon.Map />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: 'var(--sp-text-main, #18181b)' }}>
                  Feuille de route optimale (OSRM)
                </h3>
                {!isMobile && (
                  <span style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)' }}>
                    Sélectionnez vos salons ou lancez la sélection automatique pour calculer le trajet le plus court.
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              {routeSalons.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRouteSalons([]);
                    setOptimizedRoute(null);
                  }}
                  style={{
                    padding: '5px 11px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Vider
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowRoutePlanner(false)}
                className="sp-glass-pill sp-carte-btn"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  color: 'var(--sp-text-muted, #64748b)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.25fr auto auto',
              gap: '10px',
              alignItems: 'end',
              marginBottom: routeSalons.length > 0 ? '12px' : 0
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '4px' }}>
                  1. Départ
                </label>
                <div
                  className="sp-glass-pill"
                  style={{
                    height: '39px',
                    padding: '0 11px',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--sp-text-main, #18181b)'
                    }}
                  >
                    <Icon.MapPin /> {mapCenter.label || 'Position GPS'}
                  </span>
                  <button
                    type="button"
                    onClick={handleGeolocateAgent}
                    style={{ background: 'none', border: 'none', color: '#059669', fontWeight: '800', fontSize: '10.5px', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                  >
                    GPS
                  </button>
                </div>
              </div>

              {isMobile && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '4px' }}>
                    2. Arrivée (opt.)
                  </label>
                  <input
                    type="text"
                    placeholder="Boucle départ"
                    value={routeEndQuery}
                    onChange={(e) => {
                      setRouteEndQuery(e.target.value);
                      setRouteEndPoint(null);
                    }}
                    className="sp-map-input"
                  />
                </div>
              )}
            </div>

            {!isMobile && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '4px' }}>
                  2. Point d'arrivée (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Vide = retour au point de départ"
                  value={routeEndQuery}
                  onChange={(e) => {
                    setRouteEndQuery(e.target.value);
                    setRouteEndPoint(null);
                  }}
                  className="sp-map-input"
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ flex: isMobile ? 1 : 'initial' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '4px' }}>
                  3. Capacité
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={routeMaxCount}
                    onChange={(e) => setRouteMaxCount(Number(e.target.value))}
                    className="sp-map-input"
                    style={{ width: isMobile ? '90px' : '98px', padding: '0 8px' }}
                  >
                    {[5, 8, 10, 12, 15].map((n) => (
                      <option key={n} value={n}>
                        {n} salons
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAutoSelectRouteSalons}
                    className="sp-glass-pill sp-carte-btn"
                    style={{
                      height: '39px',
                      padding: '0 13px',
                      borderRadius: '11px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'var(--sp-text-main, #18181b)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Sélection Auto
                  </button>
                </div>
              </div>

              {isMobile && (
                <button
                  type="button"
                  disabled={isOptimizingRoute}
                  onClick={handleOptimizeTournee}
                  className="sp-carte-btn"
                  style={{
                    height: '39px',
                    padding: '0 14px',
                    borderRadius: '999px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <Icon.Zap />
                  <span>{isOptimizingRoute ? 'Calcul...' : 'Optimiser'}</span>
                </button>
              )}
            </div>

            {!isMobile && (
              <button
                type="button"
                disabled={isOptimizingRoute}
                onClick={handleOptimizeTournee}
                className="sp-carte-btn"
                style={{
                  height: '39px',
                  padding: '0 18px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                  border: '1.5px solid rgba(16, 185, 129, 0.45)',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon.Zap />
                <span>{isOptimizingRoute ? 'Calcul OSRM...' : 'Optimiser la route'}</span>
              </button>
            )}
          </div>

          {routeSalons.length > 0 && (
            <div className="sp-glass-pill" style={{ borderRadius: '14px', padding: '11px 12px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'stretch' : 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                    Étapes ({routeSalons.length} salons)
                  </span>
                  {optimizedRoute && (
                    <span style={{ padding: '2px 9px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.14)', color: '#059669', fontSize: '11px', fontWeight: '800' }}>
                      {optimizedRoute.total_distance_km} km • ~{optimizedRoute.estimated_minutes} min
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
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
                    style={{
                      flex: isMobile ? 1 : 'initial',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Icon.Map /> Google Maps
                  </a>
                  <a
                    href={`https://waze.com/ul?ll=${routeSalons[0].lat},${routeSalons[0].lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sp-glass-pill"
                    style={{
                      flex: isMobile ? 1 : 'initial',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      color: 'var(--sp-text-main, #18181b)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Icon.Car /> Waze (#1)
                  </a>
                </div>
              </div>

              <div className="sp-no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                {routeSalons.map((s, idx) => (
                  <div
                    key={s.siret}
                    onClick={() => setSelectedSalonMap(s)}
                    className="sp-glass-pill"
                    style={{
                      minWidth: '175px',
                      padding: '7px 10px',
                      borderRadius: '11px',
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
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          backgroundColor: 'rgba(16, 185, 129, 0.16)',
                          color: '#059669',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formatTextePropre(s.nom_salon)}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--sp-text-muted, #64748b)' }}>
                          {s.distance_km} km • {s.etoiles ? `Note : ${String(s.etoiles).replace('.', ',')}` : 'Sans note'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSalonInRoute(s);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--sp-text-muted, #64748b)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. CONTENEUR SPLIT : CARTE LEAFLET | PANNEAU LATÉRAL DE DROITE      */}
      {/* =================================================================== */}
      <div
        className="sp-carte-split-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) 390px',
          gap: isMobile ? '12px' : '16px',
          alignItems: 'stretch',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* CARTE INTERACTIVE LEAFLET */}
        <div
          className="sp-glass-panel sp-carte-map-panel"
          style={{
            padding: '6px',
            borderRadius: '20px',
            overflow: 'hidden',
            height: isMobile ? '310px' : '600px',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <div
            id="stack-partners-map"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '15px',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          />

          {mapLoading && (
            <div
              style={{
                position: 'absolute',
                inset: '6px',
                borderRadius: '15px',
                backgroundColor: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  backgroundColor: '#162420',
                  color: '#ffffff',
                  padding: '9px 18px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.18)'
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#34d399',
                    animation: 'spin 0.8s linear infinite'
                  }}
                />
                Scan géographique...
              </div>
            </div>
          )}

          {mapProgress !== null && mapProgress > 0 && mapProgress < 6 && (
            <>
              <div style={{ position: 'absolute', top: '6px', left: '6px', right: '6px', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 1000, borderRadius: '15px 15px 0 0', overflow: 'hidden' }}>
                <div style={{ width: `${(mapProgress / 5) * 100}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.5s ease' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(22, 36, 32, 0.90)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '5px 13px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  zIndex: 1000,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  whiteSpace: 'nowrap'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#34d399', animation: 'spin 0.8s linear infinite' }} />
                <span>Recherche approfondie... ({inRadiusSalons.length})</span>
              </div>
            </>
          )}
        </div>

        {/* PANNEAU LATÉRAL DROIT : FICHE DU SALON SÉLECTIONNÉ OU LISTE FILTRABLE */}
        <div
          className="sp-glass-panel sp-carte-side-panel"
          style={{
            height: isMobile ? 'auto' : '600px',
            maxHeight: isMobile ? 'none' : '600px',
            padding: isMobile ? '14px 12px' : '16px 18px',
            borderRadius: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflowY: isMobile ? 'visible' : 'auto',
            width: '100%',
            minWidth: 0
          }}
        >
          {selectedSalonMap ? (
            /* VUE 1 : FICHE DÉTAILLÉE & QUALIFICATION CRM DU SALON SÉLECTIONNÉ */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSalonMap(null)}
                  className="sp-glass-pill sp-carte-btn"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    color: 'var(--sp-text-main, #18181b)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>←</span>
                  <span>Liste ({filteredAndSortedSalons.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleSalonInRoute(selectedSalonMap);
                    setShowRoutePlanner(true);
                  }}
                  className="sp-carte-btn"
                  style={{
                    padding: '6px 13px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    backgroundColor: routeSalons.some((r) => r.siret === selectedSalonMap.siret)
                      ? '#059669'
                      : 'rgba(16, 185, 129, 0.14)',
                    color: routeSalons.some((r) => r.siret === selectedSalonMap.siret) ? '#ffffff' : '#059669'
                  }}
                >
                  {routeSalons.some((r) => r.siret === selectedSalonMap.siret) ? 'Dans ma tournée' : '+ Ajouter à la tournée'}
                </button>
              </div>

              {/* Carte d'identité du salon */}
              <div className="sp-glass-pill" style={{ padding: '14px', borderRadius: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--sp-text-main, #18181b)', lineHeight: 1.25 }}>
                    {formatTextePropre(selectedSalonMap.nom_salon)}
                  </h3>

                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      backgroundColor:
                        selectedSalonMap.statut_carte === 'LIBRE'
                          ? 'rgba(16, 185, 129, 0.14)'
                          : selectedSalonMap.statut_carte === 'PROSPECTE_MOI'
                            ? 'rgba(2, 132, 199, 0.14)'
                            : selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE'
                              ? 'rgba(100, 116, 139, 0.14)'
                              : 'rgba(245, 158, 11, 0.16)',
                      color:
                        selectedSalonMap.statut_carte === 'LIBRE'
                          ? '#059669'
                          : selectedSalonMap.statut_carte === 'PROSPECTE_MOI'
                            ? '#0284c7'
                            : selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE'
                              ? 'var(--sp-text-muted, #64748b)'
                              : '#b45309'
                    }}
                  >
                    {selectedSalonMap.statut_carte === 'LIBRE' && 'Cible Libre'}
                    {selectedSalonMap.statut_carte === 'VISITE_MOI' && 'Visité par moi'}
                    {selectedSalonMap.statut_carte === 'VISITE_AUTRE' && `Visité (${formatTextePropre(selectedSalonMap.visite_info?.agent_nom_complet || 'Agent')})`}
                    {selectedSalonMap.statut_carte === 'PROSPECTE_MOI' && `Mon lead (${selectedSalonMap.jours_restants}j)`}
                    {selectedSalonMap.statut_carte === 'PROSPECTE_AUTRE' && 'Réservé'}
                    {selectedSalonMap.statut_carte === 'CLIENT_STACK' && 'Client STACK'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', marginBottom: '10px', lineHeight: 1.4 }}>
                  {formatTextePropre(selectedSalonMap.adresse)}, {selectedSalonMap.code_postal} {formatTextePropre(selectedSalonMap.ville)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor: selectedSalonMap.etoiles ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                        color: selectedSalonMap.etoiles ? '#b45309' : 'var(--sp-text-muted, #64748b)'
                      }}
                    >
                      {selectedSalonMap.etoiles ? `Note : ${String(selectedSalonMap.etoiles).replace('.', ',')} / 5` : 'Sans note'}
                    </span>
                    <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: 'rgba(148, 163, 184, 0.14)', color: 'var(--sp-text-main, #18181b)' }}>
                      {selectedSalonMap.distance_km} km
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedSalonMap.nom_salon} ${selectedSalonMap.adresse || ''} ${selectedSalonMap.ville || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sp-glass-pill"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: 'var(--sp-text-main, #18181b)',
                        textDecoration: 'none'
                      }}
                    >
                      Maps ↗
                    </a>
                    <a
                      href={`https://waze.com/ul?ll=${selectedSalonMap.lat},${selectedSalonMap.lng}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sp-glass-pill"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: 'var(--sp-text-main, #18181b)',
                        textDecoration: 'none'
                      }}
                    >
                      Waze ↗
                    </a>
                  </div>
                </div>
              </div>

              {selectedSalonMap.visite_info && (
                <div
                  className="sp-glass-pill"
                  style={{
                    borderRadius: '14px',
                    padding: '10px 12px',
                    marginBottom: '12px',
                    fontSize: '11.5px'
                  }}
                >
                  <div style={{ fontWeight: '800', color: 'var(--sp-text-main, #18181b)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon.User /> {formatTextePropre(selectedSalonMap.visite_info.agent_nom_complet)}
                    </span>
                    <span style={{ color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
                      {new Date(selectedSalonMap.visite_info.date_visite).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div style={{ color: 'var(--sp-text-muted, #64748b)', marginTop: '4px' }}>
                    Équipement : <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>{selectedSalonMap.visite_info.tag_concurrent}</strong> • Fin carence : {new Date(selectedSalonMap.visite_info.date_expiration).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}

              {/* BLOC CRM TERRAIN */}
              <div
                className="sp-glass-pill"
                style={{
                  borderRadius: '16px',
                  padding: '14px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                          className="sp-carte-btn"
                          style={{
                            padding: '5px 11px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: active ? '800' : '700',
                            cursor: 'pointer',
                            border: active ? '1.5px solid #10b981' : 'var(--sp-border-pill)',
                            backgroundColor: active ? 'rgba(16, 185, 129, 0.14)' : 'var(--sp-bg-input)',
                            color: active ? '#059669' : 'var(--sp-text-main, #18181b)'
                          }}
                        >
                          {tg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Issue de la visite & Délai de carence
                  </div>
                  <select
                    value={visiteForm.statut_visite}
                    onChange={(e) => setVisiteForm({ ...visiteForm, statut_visite: e.target.value })}
                    className="sp-map-input"
                  >
                    <option value="ABSENT_3MOIS">Gérant absent / Plaquette déposée (3 mois)</option>
                    <option value="A_RAPPELER_3MOIS">Intéressé / À rappeler (3 mois)</option>
                    <option value="REFUS_1AN">Refus catégorique / Engagé 2 ans (1 an)</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  placeholder="Note terrain (prénom du gérant, horaires creux, matériel...)"
                  value={visiteForm.note_texte}
                  onChange={(e) => setVisiteForm({ ...visiteForm, note_texte: e.target.value })}
                  className="sp-map-input"
                  style={{ height: 'auto', padding: '8px 11px', fontSize: '12px', resize: 'vertical' }}
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={isSavingVisite}
                    onClick={() => handleSaveVisiteOrNote(false)}
                    className="sp-glass-pill sp-carte-btn"
                    style={{ flex: 1, padding: '9px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)', cursor: 'pointer' }}
                  >
                    Sauvegarder note
                  </button>
                  <button
                    type="button"
                    disabled={isSavingVisite}
                    onClick={() => handleSaveVisiteOrNote(true, false)}
                    className="sp-carte-btn"
                    style={{
                      flex: 1.35,
                      padding: '9px 12px',
                      borderRadius: '999px',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      fontSize: '12px',
                      fontWeight: '800',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#059669',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
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
                      color: 'var(--sp-text-muted, #64748b)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      textAlign: 'right',
                      padding: 0
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
                    className="sp-glass-pill"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginTop: 'auto',
                      padding: '12px 14px',
                      borderRadius: '16px'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', textTransform: 'uppercase' }}>
                      Verrouiller en Prospect Exclusif (45j)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <input
                        type="email"
                        required
                        placeholder="E-mail gérant *"
                        value={quickLockForm.email_gerant}
                        onChange={(e) => setQuickLockForm({ ...quickLockForm, email_gerant: e.target.value })}
                        className="sp-map-input"
                        style={{ height: '36px', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        placeholder="Téléphone"
                        value={quickLockForm.telephone_salon || selectedSalonMap.telephone || ''}
                        onChange={(e) => setQuickLockForm({ ...quickLockForm, telephone_salon: e.target.value })}
                        className="sp-map-input"
                        style={{ height: '36px', fontSize: '12px' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="sp-carte-btn"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: 'var(--sp-btn-primary, #18181b)',
                        color: 'var(--sp-btn-primary-text, #ffffff)',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon.Lock /> Réserver ce lead (45j)
                    </button>
                  </form>
                )}
            </>
          ) : (
            /* VUE 2 : LISTE DES SALONS DANS LE RAYON AVEC RECHERCHE RAPIDE */
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '6px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Salons dans le rayon ({filteredAndSortedSalons.length})
                </span>
                {filteredAndSortedSalons.length > 120 && (
                  <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
                    Top 120 affichés
                  </span>
                )}
              </div>

              {inRadiusSalons.length > 0 && (
                <div
                  className="sp-glass-pill"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    marginBottom: '10px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <Icon.Search />
                  <input
                    type="text"
                    placeholder="Filtrer un salon dans la liste..."
                    value={rechercheLocaleListe}
                    onChange={(e) => setRechercheLocaleListe(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      width: '100%',
                      minWidth: 0,
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--sp-text-main, #18181b)'
                    }}
                  />
                  {rechercheLocaleListe && (
                    <button
                      type="button"
                      onClick={() => setRechercheLocaleListe('')}
                      style={{ background: 'none', border: 'none', color: 'var(--sp-text-muted, #64748b)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px',
                  maxHeight: isMobile ? '360px' : 'none',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  width: '100%',
                  boxSizing: 'border-box',
                  paddingRight: '2px'
                }}
              >
                {filteredAndSortedSalons.length === 0 ? (
                  <div className="sp-glass-pill" style={{ padding: '16px 14px', borderRadius: '14px', textAlign: 'center', color: 'var(--sp-text-muted, #64748b)', fontSize: '12px' }}>
                    {mapLoading
                      ? 'Recherche des établissements autour de ce point...'
                      : 'Aucun salon ne correspond à vos filtres sur ce rayon.'}
                  </div>
                ) : (
                  filteredAndSortedSalons.slice(0, 120).map((s) => {
                    const inRoute = routeSalons.some((r) => r.siret === s.siret);
                    const isVisited = s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE';
                    const nomFormate = formatTextePropre(s.nom_salon);
                    const villeFormatee = formatTextePropre(s.ville || 'France');

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
                        className={`sp-salon-card ${inRoute ? 'in-route' : ''}`}
                        style={{
                          opacity: isVisited ? 0.72 : 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background:
                                s.statut_carte === 'LIBRE'
                                  ? 'rgba(16, 185, 129, 0.13)'
                                  : s.statut_carte === 'PROSPECTE_MOI'
                                    ? 'rgba(2, 132, 199, 0.14)'
                                    : 'rgba(148, 163, 184, 0.16)',
                              border:
                                s.statut_carte === 'LIBRE'
                                  ? '1px solid rgba(16, 185, 129, 0.28)'
                                  : '1px solid transparent',
                              color:
                                s.statut_carte === 'LIBRE'
                                  ? '#059669'
                                  : s.statut_carte === 'PROSPECTE_MOI'
                                    ? '#0284c7'
                                    : 'var(--sp-text-muted, #64748b)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '800',
                              fontSize: '11.5px',
                              flexShrink: 0
                            }}
                          >
                            {getInitialesSalon(nomFormate)}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: '13.5px',
                                fontWeight: '800',
                                color: 'var(--sp-text-main, #18181b)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {nomFormate}
                            </div>

                            <div
                              style={{
                                fontSize: '11.5px',
                                color: 'var(--sp-text-muted, #64748b)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '2px',
                                flexWrap: 'wrap'
                              }}
                            >
                              <span style={{ fontWeight: '600' }}>{villeFormatee} • {s.distance_km} km</span>
                              {s.etoiles && (
                                <span
                                  style={{
                                    padding: '1px 7px',
                                    borderRadius: '999px',
                                    fontSize: '10.5px',
                                    fontWeight: '800',
                                    backgroundColor: 'rgba(245, 158, 11, 0.14)',
                                    color: '#b45309'
                                  }}
                                >
                                  Note : {String(s.etoiles).replace('.', ',')}
                                </span>
                              )}
                              {s.visite_info && (
                                <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
                                  • Visité ({formatTextePropre(s.visite_info.agent_nom_complet)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <button
                            type="button"
                            title={inRoute ? 'Retirer de ma tournée' : 'Ajouter à ma tournée'}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSalonInRoute(s);
                            }}
                            className="sp-carte-btn"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              border: inRoute ? '1px solid #10b981' : 'var(--sp-border-pill)',
                              backgroundColor: inRoute ? 'rgba(16, 185, 129, 0.16)' : 'var(--sp-bg-input)',
                              color: inRoute ? '#059669' : 'var(--sp-text-main, #18181b)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            {inRoute ? 'OK' : '+'}
                          </button>

                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor:
                                s.statut_carte === 'LIBRE'
                                  ? '#10b981'
                                  : s.statut_carte === 'PROSPECTE_MOI'
                                    ? '#0284c7'
                                    : s.statut_carte === 'PROSPECTE_AUTRE'
                                      ? '#f59e0b'
                                      : isVisited
                                        ? '#94a3b8'
                                        : '#065f46'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
