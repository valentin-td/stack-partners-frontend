// src/components/dashboard/TabAcademie.jsx
// Onglet 6 : Académie, simulateurs sandbox, playbook onboarding 9 phases, objections et vidéos en Verre Cristal

import React from 'react';
import { Icon } from '../common/Icons';
import { getPlaybookOnboarding, OBJECTIONS_SALONS } from '../../constants/playbook';

// Visuel de couverture intelligent pour les cartes vidéos (remplace le rectangle noir vide)
const getVideoCoverImage = (vid = {}, index = 0) => {
  const txt = `${vid.cat || ''} ${vid.titre || ''}`.toLowerCase();
  if (txt.includes('caisse') || txt.includes('pointeuse') || txt.includes('démo') || txt.includes('demo')) {
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80';
  }
  if (txt.includes('onboarding') || txt.includes('checklist') || txt.includes('go-live')) {
    return 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80';
  }
  if (txt.includes('compta') || txt.includes('nf525') || txt.includes('financier')) {
    return 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80';
  }
  const defaults = [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80'
  ];
  return defaults[index % defaults.length];
};

export default function TabAcademie({
  agent,
  academieSubTab,
  setAcademieSubTab,
  openPlaybookPhase,
  setOpenPlaybookPhase,
  playbookChecks = {},
  togglePlaybookStep,
  resetPlaybookChecks,
  openObjectionIdx,
  setOpenObjectionIdx,
  sandboxLoading,
  handleLaunchSandbox,
  tutorialsList = [],
  handleUpdateVideoUrl,
  activeVideoModal,
  setActiveVideoModal,
  handlePurgeAllSandboxes,
  isSuperAdmin,
  isMobile
}) {
  const playbook = getPlaybookOnboarding(agent?.code || 'PARTNER');
  const totalPlaybookSteps = playbook.reduce((acc, p) => acc + p.etapes.length, 0);
  const completedPlaybookSteps = playbook.reduce(
    (acc, p) => acc + p.etapes.filter((e) => playbookChecks[e.id]).length,
    0
  );
  const playbookProgressPct = totalPlaybookSteps > 0 ? Math.round((completedPlaybookSteps / totalPlaybookSteps) * 100) : 0;

  // Phase active affichée à droite (par défaut la première phase non terminée ou 0)
  const activePhaseIdx =
    openPlaybookPhase !== null && openPlaybookPhase !== undefined && playbook[openPlaybookPhase]
      ? openPlaybookPhase
      : 0;
  const activeBloc = playbook[activePhaseIdx] || playbook[0];

  return (
    <div style={{ paddingBottom: isMobile ? '90px' : '28px' }}>
      <style>{`
        .sp-acad-subtab {
          border: none;
          outline: none !important;
          cursor: pointer;
          transition: all 0.16s ease;
        }
        .sp-acad-subtab:focus,
        .sp-acad-subtab:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
        .sp-phase-nav-item {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.48) 100%);
          border: 1px solid rgba(255, 255, 255, 0.92);
          box-shadow: 0 3px 10px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 15px;
          padding: 11px 13px;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          text-align: left;
          outline: none !important;
          transition: all 0.15s ease;
        }
        .sp-phase-nav-item:hover {
          background: rgba(255, 255, 255, 0.94);
          transform: translateY(-1px);
        }
        .sp-phase-nav-item.active {
          background: #ffffff;
          border: 1.5px solid #0f172a;
          box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.12);
        }
        .sp-phase-nav-item.completed:not(.active) {
          background: linear-gradient(145deg, rgba(236, 253, 245, 0.85) 0%, rgba(209, 250, 229, 0.55) 100%);
          border: 1px solid rgba(16, 185, 129, 0.35);
        }
        .sp-step-check-row {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.68) 100%);
          border: 1px solid rgba(255, 255, 255, 0.96);
          box-shadow: 0 4px 12px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 #ffffff;
          border-radius: 14px;
          padding: 12px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          transition: all 0.14s ease;
        }
        .sp-step-check-row:hover {
          background: #ffffff;
        }
        .sp-step-check-row.checked {
          background: linear-gradient(145deg, rgba(236, 253, 245, 0.9) 0%, rgba(209, 250, 229, 0.65) 100%);
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .sp-video-card {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.62) 100%);
          border: 1.5px solid #ffffff;
          box-shadow: 0 10px 26px -6px rgba(15, 23, 42, 0.06), inset 0 1px 0 #ffffff;
          border-radius: 22px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        .sp-video-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -8px rgba(15, 23, 42, 0.12), inset 0 1px 0 #ffffff;
        }
      `}</style>

      {/* =================================================================== */}
      {/* 1. EN-TÊTE ACADÉMIE & PURGE DES SALONS DE TEST                      */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: '14px',
          marginBottom: '20px'
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
            Formation Terrain & Simulateurs Live
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
            Académie & Tutos
          </h1>
          <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '500' }}>
            Entraînez-vous sur vos environnements de démonstration et suivez le Playbook d'installation client.
          </span>
        </div>

        <button
          type="button"
          onClick={handlePurgeAllSandboxes}
          style={{
            height: '38px',
            padding: '0 15px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            background: 'rgba(254, 226, 226, 0.65)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer'
          }}
        >
          <Icon.Shield />
          <span>Purger les salons de test</span>
        </button>
      </header>

      {/* =================================================================== */}
      {/* 2. LES 3 CARTES SIMULATEURS LIVE EN VERRE CRISTAL                   */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '20px',
          alignItems: 'stretch'
        }}
      >
        {/* Simulateur 1 : Salon Vide */}
        <div
          className="sp-glass-panel"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span
                className="sp-glass-pill"
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  color: '#475569'
                }}
              >
                Entraînement A à Z
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Slot unique</span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>
              Salon Vide
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Environnement vierge pour vous exercer à paramétrer un salon complet de zéro.
            </p>
          </div>

          <button
            type="button"
            disabled={!!sandboxLoading}
            onClick={() => handleLaunchSandbox('VIDE', 'LAUNCH')}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: '999px',
              backgroundColor: '#111827',
              color: '#ffffff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 8px 18px -4px rgba(17, 24, 39, 0.2)'
            }}
          >
            <Icon.ArrowUpRight />
            <span>{sandboxLoading === 'VIDE_LAUNCH' ? 'Ouverture...' : 'Ouvrir mon salon vide'}</span>
          </button>
        </div>

        {/* Simulateur 2 : Salon Démo Pré-rempli */}
        <div
          className="sp-glass-panel"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
            border: '1.5px solid rgba(16, 185, 129, 0.45)'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  backgroundColor: 'rgba(16, 185, 129, 0.14)',
                  color: '#059669'
                }}
              >
                RDV Client • Simulateur IA inclus
              </span>
              <span
                className="sp-glass-pill"
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  fontSize: '10.5px',
                  color: '#0f172a',
                  fontWeight: '800'
                }}
              >
                PIN : 0000
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>
              Salon Démo Pré-rempli
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Salon « Maison Éclat » prêt pour vos démonstrations en rendez-vous client.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              disabled={!!sandboxLoading}
              onClick={() => handleLaunchSandbox('DEMO', 'LAUNCH')}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '999px',
                backgroundColor: '#111827',
                color: '#ffffff',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'pointer',
                boxShadow: '0 8px 18px -4px rgba(17, 24, 39, 0.22)'
              }}
            >
              <Icon.ArrowUpRight />
              <span>Ouvrir le Salon Démo</span>
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                disabled={!!sandboxLoading}
                onClick={() => handleLaunchSandbox('DEMO', 'SAVE_CUSTOM')}
                className="sp-glass-pill"
                style={{ padding: '6px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
                title="Sauvegarder ma configuration actuelle"
              >
                Sauver
              </button>
              <button
                type="button"
                disabled={!!sandboxLoading}
                onClick={() => handleLaunchSandbox('DEMO', 'RESET_CUSTOM')}
                className="sp-glass-pill"
                style={{ padding: '6px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', color: '#0f172a', cursor: 'pointer' }}
                title="Restaurer ma sauvegarde"
              >
                Restaurer
              </button>
              <button
                type="button"
                disabled={!!sandboxLoading}
                onClick={() => handleLaunchSandbox('DEMO', 'RESET_DEFAULT')}
                style={{
                  padding: '6px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.28)',
                  backgroundColor: 'rgba(254, 226, 226, 0.6)',
                  cursor: 'pointer'
                }}
                title="Remettre les données d'usine STACK"
              >
                Usine
              </button>
            </div>
          </div>
        </div>

        {/* Simulateur 3 : Tunnel d'Onboarding */}
        <div
          className="sp-glass-panel"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  backgroundColor: 'rgba(59, 130, 246, 0.14)',
                  color: '#1d4ed8'
                }}
              >
                Tunnel Légal + Go-Live
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', fontWeight: '700' }}>
                {agent?.code}
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px 0', color: '#0f172a' }}>
              Simulateur d'Onboarding
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
              Testez le parcours exact de 1ère connexion du gérant et la Checklist Go-Live NF525.
            </p>
          </div>

          <button
            type="button"
            disabled={!!sandboxLoading}
            onClick={() => handleLaunchSandbox('ONBOARDING', 'LAUNCH')}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: '999px',
              backgroundColor: '#111827',
              color: '#ffffff',
              border: 'none',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 8px 18px -4px rgba(17, 24, 39, 0.2)'
            }}
          >
            <Icon.ArrowUpRight />
            <span>Simuler 1ère connexion</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. BARRE DE NAVIGATION INTERNE EN VERRE CRISTAL                     */}
      {/* =================================================================== */}
      <div
        className="sp-glass-pill"
        style={{
          display: 'flex',
          gap: '6px',
          padding: '5px',
          borderRadius: '999px',
          marginBottom: '20px',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'playbook', label: `Playbook d'Onboarding Client (${completedPlaybookSteps}/${totalPlaybookSteps})` },
          { id: 'scenarios', label: 'Scénarios Démo & Objections' },
          { id: 'videos', label: `Vidéos Terrain (${tutorialsList.length})` }
        ].map((tab) => {
          const active = academieSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAcademieSubTab(tab.id)}
              className="sp-acad-subtab"
              style={{
                flex: 1,
                whiteSpace: 'nowrap',
                padding: '10px 16px',
                borderRadius: '999px',
                backgroundColor: active ? '#111827' : 'transparent',
                color: active ? '#ffffff' : '#475569',
                fontWeight: active ? '800' : '700',
                fontSize: '12.5px',
                boxShadow: active ? '0 6px 16px -4px rgba(17, 24, 39, 0.22)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* SOUS-ONGLET A : PLAYBOOK D'ONBOARDING EN 2 COLONNES                 */}
      {/* =================================================================== */}
      {academieSubTab === 'playbook' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '350px minmax(0, 1fr)',
            gap: '20px',
            alignItems: 'start'
          }}
        >
          {/* COLONNE GAUCHE : SOMMAIRE DES 9 PHASES D'INSTALLATION */}
          <div className="sp-glass-panel" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                  Checklist Terrain
                </span>
                <strong style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                  Progression : {completedPlaybookSteps}/{totalPlaybookSteps} ({playbookProgressPct}%)
                </strong>
              </div>

              {completedPlaybookSteps > 0 && (
                <button
                  type="button"
                  onClick={resetPlaybookChecks}
                  className="sp-glass-pill"
                  style={{ padding: '5px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', color: '#dc2626', cursor: 'pointer' }}
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Barre de progression globale */}
            <div
              style={{
                height: '6px',
                backgroundColor: 'rgba(148, 163, 184, 0.22)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '14px'
              }}
            >
              <div
                style={{
                  width: `${playbookProgressPct}%`,
                  height: '100%',
                  backgroundColor: playbookProgressPct === 100 ? '#10b981' : '#111827',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            {/* Liste des 9 phases */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {playbook.map((bloc, idx) => {
                const isSelected = activePhaseIdx === idx;
                const nbDonePhase = bloc.etapes.filter((e) => playbookChecks[e.id]).length;
                const isPhaseComplete = nbDonePhase === bloc.etapes.length;

                return (
                  <button
                    key={bloc.phase || idx}
                    type="button"
                    onClick={() => setOpenPlaybookPhase(idx)}
                    className={`sp-phase-nav-item ${isSelected ? 'active' : ''} ${isPhaseComplete ? 'completed' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          backgroundColor: isPhaseComplete
                            ? '#10b981'
                            : isSelected
                              ? '#111827'
                              : 'rgba(148, 163, 184, 0.2)',
                          color: isPhaseComplete || isSelected ? '#ffffff' : '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11.5px',
                          fontWeight: '800'
                        }}
                      >
                        {isPhaseComplete ? 'OK' : idx + 1}
                      </span>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {bloc.titre}
                        </div>
                        <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '600' }}>
                          Durée estimée : {bloc.duree}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        fontSize: '10.5px',
                        fontWeight: '800',
                        backgroundColor: isPhaseComplete ? 'rgba(16, 185, 129, 0.16)' : 'rgba(15, 23, 42, 0.06)',
                        color: isPhaseComplete ? '#059669' : '#475569',
                        flexShrink: 0
                      }}
                    >
                      {nbDonePhase}/{bloc.etapes.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLONNE DROITE : ÉTAPES DE LA PHASE SÉLECTIONNÉE */}
          {activeBloc && (() => {
            const nbDoneActive = activeBloc.etapes.filter((e) => playbookChecks[e.id]).length;
            const isCompleteActive = nbDoneActive === activeBloc.etapes.length;

            return (
              <div className="sp-glass-panel" style={{ padding: isMobile ? '20px 16px' : '26px 28px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '18px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        className="sp-glass-pill"
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          color: '#4f46e5',
                          textTransform: 'uppercase'
                        }}
                      >
                        Phase {activePhaseIdx + 1} sur {playbook.length}
                      </span>
                      <span className="sp-glass-pill" style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                        {activeBloc.duree}
                      </span>
                    </div>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: isMobile ? '19px' : '22px', fontWeight: '800', color: '#0f172a' }}>
                      {activeBloc.titre}
                    </h2>
                  </div>

                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      backgroundColor: isCompleteActive ? 'rgba(16, 185, 129, 0.14)' : 'rgba(15, 23, 42, 0.06)',
                      color: isCompleteActive ? '#059669' : '#334155'
                    }}
                  >
                    {nbDoneActive} / {activeBloc.etapes.length} validée{nbDoneActive > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Liste des vérifications de la phase active */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                  {activeBloc.etapes.map((etape) => {
                    const checked = !!playbookChecks[etape.id];
                    return (
                      <label
                        key={etape.id}
                        className={`sp-step-check-row ${checked ? 'checked' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePlaybookStep(etape.id)}
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: '#10b981',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                          />
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: '700',
                              color: checked ? '#059669' : '#0f172a',
                              textDecoration: checked ? 'line-through' : 'none',
                              lineHeight: 1.4
                            }}
                          >
                            {etape.label}
                          </span>
                        </div>

                        {etape.tag && (
                          <span
                            className="sp-glass-pill"
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              color: '#475569',
                              flexShrink: 0
                            }}
                          >
                            {etape.tag}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Navigation entre les phases */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={activePhaseIdx === 0}
                    onClick={() => setOpenPlaybookPhase(Math.max(0, activePhaseIdx - 1))}
                    className="sp-glass-pill"
                    style={{
                      padding: '10px 16px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#0f172a',
                      cursor: activePhaseIdx === 0 ? 'not-allowed' : 'pointer',
                      opacity: activePhaseIdx === 0 ? 0.4 : 1
                    }}
                  >
                    ← Phase précédente
                  </button>

                  {activePhaseIdx < playbook.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setOpenPlaybookPhase(activePhaseIdx + 1)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#111827',
                        color: '#ffffff',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: '0 8px 18px -4px rgba(17, 24, 39, 0.2)'
                      }}
                    >
                      Suivant : {playbook[activePhaseIdx + 1].titre} →
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =================================================================== */}
      {/* SOUS-ONGLET B : SCÉNARIOS DÉMO & OBJECTIONS (BENTO 2 COLONNES)      */}
      {/* =================================================================== */}
      {academieSubTab === 'scenarios' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.25fr 1fr',
            gap: '20px',
            alignItems: 'start'
          }}
        >
          {/* COLONNE GAUCHE : LES 4 SCÉNARIOS DÉMO (« MAISON ÉCLAT ») */}
          <div className="sp-glass-panel" style={{ padding: isMobile ? '18px 16px' : '22px 24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#0f172a' }}>
                  4 Scénarios Démo (« Maison Éclat »)
                </h3>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                  Bouton « Simulateur IA » disponible en bas à droite du Salon Démo
                </span>
              </div>
              <span
                style={{
                  padding: '5px 11px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800',
                  backgroundColor: '#111827',
                  color: '#ffffff'
                }}
              >
                PIN Pointeuse : 0000
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                {
                  num: '01',
                  titre: 'Compta & Scan IA',
                  kpi: '+4 820 € net',
                  kpiBg: 'rgba(16, 185, 129, 0.14)',
                  kpiColor: '#059669',
                  tags: ['CA : 18 450 € HT', '5 factures IA (Split-Screen)', 'Liasse PDF signée']
                },
                {
                  num: '02',
                  titre: 'Urgence RH & SMS',
                  kpi: 'Chloé absente',
                  kpiBg: 'rgba(239, 68, 68, 0.14)',
                  kpiColor: '#dc2626',
                  tags: ['Arrêt maladie Cerfa', 'Détection RDV en conflit', 'Robot SMS reprogrammation']
                },
                {
                  num: '03',
                  titre: 'Avis & Winback',
                  kpi: 'Avis 2/5 Marine',
                  kpiBg: 'rgba(245, 158, 11, 0.16)',
                  kpiColor: '#b45309',
                  tags: ['Alerte Tableau de bord', 'Offre pardon en 1 clic', 'Rappel auto en Caisse']
                },
                {
                  num: '04',
                  titre: 'Académie & Stocks',
                  kpi: '2 ruptures',
                  kpiBg: 'rgba(15, 23, 42, 0.08)',
                  kpiColor: '#0f172a',
                  tags: ['Recettes & doses au gramme', 'Calcul de marge brute', 'Huile Élixir (reste 2)']
                }
              ].map((sc) => (
                <div
                  key={sc.num}
                  className="sp-glass-pill"
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', letterSpacing: '0.04em' }}>
                        SCÉNARIO {sc.num}
                      </span>
                      <span
                        style={{
                          padding: '3px 9px',
                          borderRadius: '999px',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          backgroundColor: sc.kpiBg,
                          color: sc.kpiColor
                        }}
                      >
                        {sc.kpi}
                      </span>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                      {sc.titre}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {sc.tags.map((t, i) => (
                        <div key={i} style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: '500' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.kpiColor, flexShrink: 0 }} />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE DROITE : 4 RÉPONSES FLASH AUX OBJECTIONS (SANS BORDURE COURBÉE CASSÉE) */}
          <div className="sp-glass-panel" style={{ padding: isMobile ? '18px 16px' : '22px 24px' }}>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Argumentaire Terrain
              </span>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '16.5px', fontWeight: '800', color: '#0f172a' }}>
                4 Réponses flash aux objections
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {OBJECTIONS_SALONS.map((item, idx) => {
                const isOpen = openObjectionIdx === idx;
                return (
                  <div
                    key={idx}
                    className="sp-glass-pill"
                    style={{
                      borderRadius: '16px',
                      padding: '13px 15px',
                      border: isOpen ? '1.5px solid #0f172a' : undefined,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenObjectionIdx(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: '10px',
                        outline: 'none'
                      }}
                    >
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                        {item.q}
                      </span>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isOpen ? '#111827' : 'rgba(15, 23, 42, 0.06)',
                          color: isOpen ? '#ffffff' : '#64748b',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '800',
                          flexShrink: 0
                        }}
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          marginTop: '10px',
                          paddingTop: '10px',
                          borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                          fontSize: '12.5px',
                          color: '#334155',
                          lineHeight: 1.55,
                          fontWeight: '500'
                        }}
                      >
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SOUS-ONGLET C : VIDÉOS DE FORMATION TERRAIN (AVEC COUVERTURES HD)   */}
      {/* =================================================================== */}
      {academieSubTab === 'videos' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '18px' }}>
          {tutorialsList.map((vid, idx) => {
            const coverImg = getVideoCoverImage(vid, idx);
            return (
              <div key={vid.id} className="sp-video-card">
                <div>
                  <div
                    onClick={() => setActiveVideoModal(vid)}
                    style={{
                      height: '160px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      marginBottom: '14px',
                      cursor: 'pointer',
                      backgroundColor: '#0f172a'
                    }}
                  >
                    <img
                      src={coverImg}
                      alt={vid.titre}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(15,23,42,0.12) 0%, rgba(15,23,42,0.58) 100%)'
                      }}
                    />

                    {/* Bouton Play central en verre dépoli */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(15, 23, 42, 0.62)',
                        border: '1.5px solid rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" style={{ marginLeft: '2px' }}>
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                    </div>

                    {/* Badge durée */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(15, 23, 42, 0.82)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}
                    >
                      {vid.duree}
                    </span>
                  </div>

                  <div style={{ padding: '0 4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgba(79, 70, 229, 0.12)',
                        color: '#4f46e5',
                        marginBottom: '8px'
                      }}
                    >
                      {vid.cat}
                    </span>
                    <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#0f172a', lineHeight: 1.3, marginBottom: '6px' }}>
                      {vid.titre}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                      {vid.desc}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveVideoModal(vid)}
                    style={{
                      flex: 1,
                      padding: '11px 16px',
                      borderRadius: '999px',
                      border: 'none',
                      backgroundColor: '#111827',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 8px 18px -4px rgba(17, 24, 39, 0.2)'
                    }}
                  >
                    Regarder la vidéo
                  </button>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => handleUpdateVideoUrl(vid.id)}
                      className="sp-glass-pill"
                      style={{
                        padding: '11px 15px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#0f172a',
                        cursor: 'pointer'
                      }}
                    >
                      Lien
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODALE LECTEUR VIDÉO EN VERRE CRISTAL                               */}
      {/* =================================================================== */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 100020,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px',
            boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="sp-glass-panel"
            style={{
              width: '100%',
              maxWidth: '820px',
              background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 249, 253, 0.9) 100%)',
              borderRadius: '26px',
              overflow: 'hidden',
              padding: '18px'
            }}
          >
            <div
              style={{
                padding: '4px 6px 14px 6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase' }}>
                  {activeVideoModal.cat}
                </span>
                <strong style={{ display: 'block', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                  {activeVideoModal.titre}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                className="sp-glass-pill"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                X
              </button>
            </div>
            <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#0f172a', borderRadius: '18px', overflow: 'hidden' }}>
              <iframe
                src={activeVideoModal.embedUrl}
                title={activeVideoModal.titre}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
