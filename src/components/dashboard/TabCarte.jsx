// src/components/dashboard/TabCarte.jsx
// Onglet 3 : Carte de prospection interactive Leaflet, tournées OSRM et qualification CRM en Verre Cristal

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
  setFactureData,
  setShowFactureForm,
  setActiveTab,
  isSuperAdmin,
  isMobile,
  isSmall,
  leafletReady
}) {
  const [rechercheLocaleListe, setRechercheLocaleListe] = useState('');

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
      VISITE_MOI: '#64748b',
      VISITE_AUTRE: '#94a3b8'
    };

    const renderMarkersAndClusters = () => {
      layerGroup.clearLayers();

      L.circle([mapCenter.lat, mapCenter.lng], {
        radius: mapRadius * 1000,
        color: '#111827',
        weight: 1.5,
        dashArray: '6, 6',
        fillColor: '#4f46e5',
        fillOpacity: 0.03
      }).addTo(layerGroup);

      const agentIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#6366f1 0%,#0ea5e9 100%);border:3px solid #fff;box-shadow:0 0 0 4px rgba(99,102,241,0.24);"></div>`,
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

          const starsLabel = salon.etoiles ? `${salon.etoiles}/5` : 'N/A';
          marker.bindTooltip(
            `<strong>${formatTextePropre(salon.nom_salon)}</strong><br/>Note ${starsLabel} • ${salon.distance_km} km`,
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
            `<strong>${formatTextePropre(salon.nom_salon)}</strong><br/>Note ${starsLabel} • ${salon.distance_km} km`,
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
            html: `<div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#4f46e5 0%,#111827 100%);color:#fff;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;cursor:pointer;">${idx + 1}</div>`,
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
    <div style={{ paddingBottom: isMobile ? '90px' : '24px' }}>
      <style>{`
        .sp-salon-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.68) 100%);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 16px;
          padding: 11px 13px;
          cursor: pointer;
          transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
        }
        .sp-salon-card:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.09), inset 0 1px 0 #ffffff;
        }
        .sp-salon-card.in-route {
          border: 1.5px solid #111827;
        }
        .sp-map-input {
          width: 100%;
          box-sizing: border-box;
          height: 40px;
          padding: 0 13px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
        }
        .sp-map-input:focus {
          border-color: #0f172a;
          background: #ffffff;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE + ACTIONS GLOBALES (GPS & PLANIFICATEUR DE TOURNÉE)      */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          gap: '14px',
          marginBottom: '18px'
        }}
      >
        <div>
          <span
            className="sp-glass-pill"
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '10.5px',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginBottom: '6px'
            }}
          >
            Prospection Terrain & Tournées OSRM
          </span>
          <h1
            style={{
              fontSize: isMobile ? '24px' : '30px',
              fontWeight: '800',
              margin: '0 0 4px 0',
              letterSpacing: '-0.03em',
              color: '#0f172a',
              lineHeight: 1.1
            }}
          >
            Carte de Prospection
          </h1>
          <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
            Explorez les salons autour de vous, qualifiez vos visites et optimisez vos feuilles de route.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleGeolocateAgent}
            className="sp-glass-pill"
            style={{
              flex: isMobile ? 1 : 'initial',
              height: '40px',
              padding: '0 16px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: '700',
              color: '#0f172a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              cursor: 'pointer'
            }}
          >
            <Icon.Compass />
            <span>Autour de ma position GPS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRoutePlanner(!showRoutePlanner)}
            style={{
              flex: isMobile ? 1 : 'initial',
              height: '40px',
              padding: '0 18px',
              borderRadius: '999px',
              backgroundColor: showRoutePlanner ? '#4f46e5' : '#111827',
              color: '#ffffff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px -4px rgba(17, 24, 39, 0.22)'
            }}
          >
            <Icon.Map />
            <span>Planificateur de Tournée ({routeSalons.length})</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BARRE DE CONTRÔLE : RECHERCHE D'ADRESSE, RAYON & FILTRES         */}
      {/* =================================================================== */}
      <div className="sp-glass-panel" style={{ padding: isMobile ? '14px' : '18px 22px', marginBottom: '18px' }}>
        {/* Ligne 1 : Recherche géographique + Sélecteur de rayon */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', alignItems: 'stretch' }}>
          <form
            onSubmit={handleSearchAddressMap}
            style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', flex: 1, gap: '8px' }}
          >
            <div
              className="sp-glass-pill"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0 14px',
                height: '42px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.92)'
              }}
            >
              <Icon.Search />
              <input
                type="text"
                placeholder="Adresse, code postal ou ville (ex : Strasbourg, 67000)..."
                value={mapAddressQuery}
                onChange={(e) => setMapAddressQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: '#0f172a'
                }}
              />
              {mapAddressQuery && (
                <button
                  type="button"
                  onClick={() => setMapAddressQuery('')}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              style={{
                height: '42px',
                padding: '0 20px',
                borderRadius: '999px',
                backgroundColor: '#111827',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Icon.Search />
              <span>Centrer</span>
            </button>
          </form>

          {/* Sélecteur de rayon en pilules */}
          <div
            className="sp-glass-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '4px',
              padding: '4px 6px 4px 12px',
              borderRadius: '999px',
              overflowX: 'auto'
            }}
          >
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748b', marginRight: '4px' }}>Rayon :</span>
            {[1, 3, 5, 10, 25, 50].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => handleRadiusChange(km)}
                style={{
                  padding: '6px 11px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  backgroundColor: mapRadius === km ? '#111827' : 'transparent',
                  color: mapRadius === km ? '#ffffff' : '#475569',
                  transition: 'all 0.14s ease'
                }}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>

        {/* Ligne 2 : Filtres de statut sur une seule ligne + Tri à droite */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { key: 'TOUS', label: `Tous (${inRadiusSalons.length})`, dot: null },
              { key: 'LIBRE', label: `Jamais visités (${inRadiusSalons.filter((s) => s.statut_carte === 'LIBRE').length})`, dot: '#10b981' },
              { key: 'VISITES', label: `Déjà visités (${inRadiusSalons.filter((s) => s.statut_carte === 'VISITE_MOI' || s.statut_carte === 'VISITE_AUTRE').length})`, dot: '#64748b' },
              { key: 'PROSPECTE_MOI', label: `Mes leads (${inRadiusSalons.filter((s) => s.statut_carte === 'PROSPECTE_MOI').length})`, dot: '#2563eb' },
              { key: 'PROSPECTE_AUTRE', label: `Réservés (${inRadiusSalons.filter((s) => s.statut_carte === 'PROSPECTE_AUTRE').length})`, dot: '#f59e0b' },
              { key: 'CLIENT_STACK', label: `Clients (${inRadiusSalons.filter((s) => s.statut_carte === 'CLIENT_STACK').length})`, dot: '#111827' }
            ].map((tab) => {
              const actif = mapFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setMapFilter(tab.key)}
                  className={actif ? '' : 'sp-glass-pill'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '999px',
                    border: actif ? '1px solid #111827' : undefined,
                    backgroundColor: actif ? '#111827' : undefined,
                    color: actif ? '#ffffff' : '#334155',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {tab.dot && (
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: tab.dot }} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setHideVisitedSalons(!hideVisitedSalons)}
              className="sp-glass-pill"
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '800',
                cursor: 'pointer',
                background: hideVisitedSalons ? 'rgba(16, 185, 129, 0.16)' : undefined,
                border: hideVisitedSalons ? '1px solid rgba(16, 185, 129, 0.4)' : undefined,
                color: hideVisitedSalons ? '#059669' : '#475569'
              }}
            >
              {hideVisitedSalons ? '✓ Visités masqués' : 'Masquer les visités'}
            </button>

            <select
              value={mapSortBy}
              onChange={(e) => setMapSortBy(e.target.value)}
              className="sp-glass-pill"
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#0f172a',
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
      {/* 3. PLANIFICATEUR DE TOURNÉE OSRM EN VERRE CRISTAL                   */}
      {/* =================================================================== */}
      {showRoutePlanner && (
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px' : '20px 24px',
            marginBottom: '18px',
            border: '1.5px solid rgba(79, 70, 229, 0.35)'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: 'rgba(79, 70, 229, 0.12)',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon.Map />
              </div>
              <div>
                <h3 style={{ fontSize: '16.5px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Feuille de route optimale (OSRM)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Sélectionnez vos salons ou lancez la sélection automatique pour calculer le trajet le plus court.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {routeSalons.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setRouteSalons([]);
                    setOptimizedRoute(null);
                  }}
                  style={{
                    padding: '7px 13px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#dc2626',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  Vider la liste
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowRoutePlanner(false)}
                className="sp-glass-pill"
                style={{ padding: '7px 13px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}
              >
                Fermer ✕
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1.25fr auto auto',
              gap: '12px',
              alignItems: 'end',
              marginBottom: routeSalons.length > 0 ? '16px' : 0
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
                1. Point de départ
              </label>
              <div
                className="sp-glass-pill"
                style={{
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
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
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#0f172a'
                  }}
                >
                  <Icon.MapPin /> {mapCenter.label || 'Ma position GPS'}
                </span>
                <button
                  type="button"
                  onClick={handleGeolocateAgent}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: '800', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                >
                  Actualiser
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
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

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '800', color: '#334155', marginBottom: '5px' }}>
                3. Capacité
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select
                  value={routeMaxCount}
                  onChange={(e) => setRouteMaxCount(Number(e.target.value))}
                  className="sp-map-input"
                  style={{ width: '98px' }}
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
                  className="sp-glass-pill"
                  style={{ height: '40px', padding: '0 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '800', color: '#0f172a', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Sélection Auto
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={isOptimizingRoute}
              onClick={handleOptimizeTournee}
              style={{
                height: '40px',
                padding: '0 20px',
                borderRadius: '999px',
                backgroundColor: '#111827',
                color: '#ffffff',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 8px 18px -4px rgba(17, 24, 39, 0.22)'
              }}
            >
              <Icon.Zap />
              <span>{isOptimizingRoute ? 'Calcul OSRM...' : 'Optimiser la route'}</span>
            </button>
          </div>

          {routeSalons.length > 0 && (
            <div className="sp-glass-pill" style={{ borderRadius: '16px', padding: '14px' }}>
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
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    Étapes de votre tournée ({routeSalons.length} salons)
                  </span>
                  {optimizedRoute && (
                    <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.14)', color: '#059669', fontSize: '11.5px', fontWeight: '800' }}>
                      {optimizedRoute.total_distance_km} km • ~{optimizedRoute.estimated_minutes} min (visites incluses)
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
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Icon.Map /> Itinéraire Google Maps
                  </a>
                  <a
                    href={`https://waze.com/ul?ll=${routeSalons[0].lat},${routeSalons[0].lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sp-glass-pill"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '800',
                      textDecoration: 'none',
                      color: '#0f172a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
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
                      minWidth: '195px',
                      padding: '9px 12px',
                      borderRadius: '13px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
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
                          borderRadius: '50%',
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
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {formatTextePropre(s.nom_salon)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {s.distance_km} km • Note {s.etoiles || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSalonInRoute(s);
                      }}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: 0 }}
                    >
                      ✕
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
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 400px',
          gap: '18px',
          alignItems: 'stretch'
        }}
      >
        {/* CARTE INTERACTIVE LEAFLET */}
        <div
          className="sp-glass-panel"
          style={{
            padding: '8px',
            overflow: 'hidden',
            height: isMobile ? '400px' : '610px',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          <div
            id="stack-partners-map"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '18px',
              overflow: 'hidden'
            }}
          />

          {mapLoading && (
            <div
              style={{
                position: 'absolute',
                inset: '8px',
                borderRadius: '18px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(4px)',
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
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
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
                Scan géographique en cours...
              </div>
            </div>
          )}

          {mapProgress !== null && mapProgress > 0 && mapProgress < 6 && (
            <>
              <div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', zIndex: 1000, borderRadius: '18px 18px 0 0', overflow: 'hidden' }}>
                <div style={{ width: `${(mapProgress / 5) * 100}%`, height: '100%', backgroundColor: '#4f46e5', transition: 'width 0.5s ease' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(17, 24, 39, 0.88)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '6px 15px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: '800',
                  zIndex: 1000,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#ffffff', animation: 'spin 0.8s linear infinite' }} />
                <span>Recherche approfondie... ({inRadiusSalons.length})</span>
              </div>
            </>
          )}
        </div>

        {/* PANNEAU LATÉRAL DROIT : FICHE DU SALON SÉLECTIONNÉ OU LISTE FILTRABLE */}
        <div
          className="sp-glass-panel"
          style={{
            height: isMobile ? 'auto' : '610px',
            maxHeight: isMobile ? '580px' : '610px',
            padding: '18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}
        >
          {selectedSalonMap ? (
            /* VUE 1 : FICHE DÉTAILLÉE & QUALIFICATION CRM DU SALON SÉLECTIONNÉ */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSalonMap(null)}
                  className="sp-glass-pill"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    color: '#0f172a',
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
                  style={{
                    padding: '6px 13px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: routeSalons.some((r) => r.siret === selectedSalonMap.siret) ? '#059669' : '#111827',
                    color: '#ffffff'
                  }}
                >
                  {routeSalons.some((r) => r.siret === selectedSalonMap.siret) ? '✓ Dans ma tournée' : '+ Ajouter à la tournée'}
                </button>
              </div>

              {/* Carte d'identité du salon */}
              <div className="sp-glass-pill" style={{ padding: '14px', borderRadius: '18px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0f172a', lineHeight: 1.25 }}>
                    {formatTextePropre(selectedSalonMap.nom_salon)}
                  </h3>

                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '999px',
                      fontSize: '10.5px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      backgroundColor:
                        selectedSalonMap.statut_carte === 'LIBRE'
                          ? 'rgba(16, 185, 129, 0.14)'
                          : selectedSalonMap.statut_carte === 'PROSPECTE_MOI'
                            ? 'rgba(37, 99, 235, 0.14)'
                            : selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE'
                              ? 'rgba(100, 116, 139, 0.14)'
                              : 'rgba(245, 158, 11, 0.16)',
                      color:
                        selectedSalonMap.statut_carte === 'LIBRE'
                          ? '#059669'
                          : selectedSalonMap.statut_carte === 'PROSPECTE_MOI'
                            ? '#1d4ed8'
                            : selectedSalonMap.statut_carte === 'VISITE_MOI' || selectedSalonMap.statut_carte === 'VISITE_AUTRE'
                              ? '#475569'
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

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', lineHeight: 1.4 }}>
                  {formatTextePropre(selectedSalonMap.adresse)}, {selectedSalonMap.code_postal} {formatTextePropre(selectedSalonMap.ville)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: '800',
                        backgroundColor: selectedSalonMap.etoiles ? 'rgba(245, 158, 11, 0.16)' : 'rgba(148, 163, 184, 0.15)',
                        color: selectedSalonMap.etoiles ? '#b45309' : '#64748b'
                      }}
                    >
                      ★ {selectedSalonMap.etoiles ? `${selectedSalonMap.etoiles} / 5` : 'N/A'}
                    </span>
                    <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '700', background: 'rgba(15, 23, 42, 0.06)', color: '#334155' }}>
                      {selectedSalonMap.distance_km} km
                    </span>
                  </div>

                  {/* Raccourcis navigation terrain */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedSalonMap.nom_salon} ${selectedSalonMap.adresse || ''} ${selectedSalonMap.ville || ''}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800',
                        background: '#ffffff',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: '#0f172a',
                        textDecoration: 'none'
                      }}
                    >
                      Maps ↗
                    </a>
                    <a
                      href={`https://waze.com/ul?ll=${selectedSalonMap.lat},${selectedSalonMap.lng}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800',
                        background: '#ffffff',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        color: '#0f172a',
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
                  <div style={{ fontWeight: '800', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon.User /> {formatTextePropre(selectedSalonMap.visite_info.agent_nom_complet)}
                    </span>
                    <span style={{ color: '#64748b', fontWeight: '600' }}>
                      {new Date(selectedSalonMap.visite_info.date_visite).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div style={{ color: '#475569', marginTop: '4px' }}>
                    Équipement : <strong style={{ color: '#0f172a' }}>{selectedSalonMap.visite_info.tag_concurrent}</strong> • Fin carence : {new Date(selectedSalonMap.visite_info.date_expiration).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}

              {/* BLOC CRM TERRAIN */}
              <div
                className="sp-glass-pill"
                style={{
                  borderRadius: '18px',
                  padding: '14px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
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
                            padding: '6px 11px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            border: active ? '1px solid #111827' : '1px solid rgba(148, 163, 184, 0.3)',
                            backgroundColor: active ? '#111827' : '#ffffff',
                            color: active ? '#ffffff' : '#334155'
                          }}
                        >
                          {tg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Issue de la visite & Délai de carence
                  </div>
                  <select
                    value={visiteForm.statut_visite}
                    onChange={(e) => setVisiteForm({ ...visiteForm, statut_visite: e.target.value })}
                    className="sp-map-input"
                    style={{ height: '38px', fontSize: '12px' }}
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
                  style={{ height: 'auto', padding: '8px 11px', fontSize: '12.5px', resize: 'vertical' }}
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={isSavingVisite}
                    onClick={() => handleSaveVisiteOrNote(false)}
                    className="sp-glass-pill"
                    style={{ flex: 1, padding: '9px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
                  >
                    Sauvegarder note
                  </button>
                  <button
                    type="button"
                    disabled={isSavingVisite}
                    onClick={() => handleSaveVisiteOrNote(true, false)}
                    style={{
                      flex: 1.35,
                      padding: '9px 12px',
                      borderRadius: '999px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '800',
                      backgroundColor: '#111827',
                      color: '#ffffff',
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
                      color: '#64748b',
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
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
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
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#111827',
                        color: '#ffffff',
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
                  style={{
                    width: '100%',
                    marginTop: 'auto',
                    padding: '12px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#111827',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Icon.Factures /> Créer la facture 99 € HT
                </button>
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
                  marginBottom: '10px'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Salons dans le rayon ({filteredAndSortedSalons.length})
                </span>
                {filteredAndSortedSalons.length > 120 && (
                  <span className="sp-glass-pill" style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '700', color: '#64748b' }}>
                    Top 120 affichés
                  </span>
                )}
              </div>

              {/* Barre de recherche rapide dans la liste */}
              <div
                className="sp-glass-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 12px',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  background: 'rgba(255, 255, 255, 0.88)'
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
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: '#0f172a'
                  }}
                />
                {rechercheLocaleListe && (
                  <button
                    type="button"
                    onClick={() => setRechercheLocaleListe('')}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px', padding: 0 }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '2px' }}>
                {filteredAndSortedSalons.length === 0 ? (
                  <div className="sp-glass-pill" style={{ padding: '28px 14px', borderRadius: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                    Aucun salon ne correspond à vos filtres sur ce rayon.
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
                          gap: '10px'
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
                                  ? 'rgba(16, 185, 129, 0.14)'
                                  : s.statut_carte === 'PROSPECTE_MOI'
                                    ? 'rgba(37, 99, 235, 0.14)'
                                    : 'rgba(148, 163, 184, 0.16)',
                              color:
                                s.statut_carte === 'LIBRE'
                                  ? '#059669'
                                  : s.statut_carte === 'PROSPECTE_MOI'
                                    ? '#1d4ed8'
                                    : '#475569',
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
                                color: '#0f172a',
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
                                color: '#64748b',
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
                                    backgroundColor: 'rgba(245, 158, 11, 0.16)',
                                    color: '#b45309'
                                  }}
                                >
                                  ★ {s.etoiles}
                                </span>
                              )}
                              {s.visite_info && (
                                <span style={{ fontSize: '10.5px', fontWeight: '700', color: '#475569' }}>
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
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              border: inRoute ? 'none' : '1px solid rgba(148, 163, 184, 0.35)',
                              backgroundColor: inRoute ? '#111827' : '#ffffff',
                              color: inRoute ? '#ffffff' : '#0f172a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            {inRoute ? '✓' : '+'}
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
                                        ? '#94a3b8'
                                        : '#111827',
                              boxShadow: s.statut_carte === 'LIBRE' ? '0 0 6px rgba(16, 185, 129, 0.45)' : 'none'
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
