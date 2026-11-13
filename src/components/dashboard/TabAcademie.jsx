// src/components/dashboard/TabAcademie.jsx
// Onglet 6 : Academie, simulateurs sandbox, playbook onboarding 9 phases, objections et videos

import { Icon } from '../common/Icons';
import { getPlaybookOnboarding, OBJECTIONS_SALONS } from '../../constants/playbook';

export default function TabAcademie({
  agent,
  academieSubTab,
  setAcademieSubTab,
  openPlaybookPhase,
  setOpenPlaybookPhase,
  playbookChecks,
  togglePlaybookStep,
  resetPlaybookChecks,
  openObjectionIdx,
  setOpenObjectionIdx,
  sandboxLoading,
  handleLaunchSandbox,
  tutorialsList,
  handleUpdateVideoUrl,
  activeVideoModal,
  setActiveVideoModal,
  handlePurgeAllSandboxes,
  isSuperAdmin,
  isMobile,
  primaryBtn,
  secondaryBtn,
  cardStyle
}) {
  const playbook = getPlaybookOnboarding(agent?.code || 'PARTNER');
  const totalPlaybookSteps = playbook.reduce((acc, p) => acc + p.etapes.length, 0);
  const completedPlaybookSteps = playbook.reduce(
    (acc, p) => acc + p.etapes.filter((e) => playbookChecks[e.id]).length,
    0
  );
  const playbookProgressPct = Math.round((completedPlaybookSteps / totalPlaybookSteps) * 100);

  return (
    <>
      {/* En-tête épuré */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '12px',
          marginBottom: '18px'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '800',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Académie
          </h1>
          <span style={{ fontSize: '13px', color: '#6b7280' }}></span>
        </div>
        <button
          type="button"
          onClick={handlePurgeAllSandboxes}
          style={{
            ...secondaryBtn,
            color: '#dc2626',
            borderColor: '#fecaca',
            backgroundColor: '#fef2f2',
            padding: '8px 12px',
            fontSize: '12px'
          }}
        >
          <Icon.Shield /> Purger les salons de test
        </button>
      </div>

      {/* 1. LES 3 CARTES SIMULATEURS LIVE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {/* Simulateur 1 : Salon Vide */}
        <div
          style={{
            ...cardStyle,
            padding: '16px 18px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  backgroundColor: '#f3f4f6',
                  color: '#374151'
                }}
              >
                Entraînement A à Z
              </span>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600' }}>Slot unique</span>
            </div>
            <h3 style={{ fontSize: '15.5px', fontWeight: '800', margin: '0 0 4px 0' }}>Salon Vide</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.45, margin: '0 0 14px 0' }}></p>
          </div>
          <button
            type="button"
            disabled={!!sandboxLoading}
            onClick={() => handleLaunchSandbox('VIDE', 'LAUNCH')}
            style={{ ...primaryBtn, width: '100%', padding: '10px 14px', fontSize: '12.5px' }}
          >
            <Icon.ArrowUpRight /> {sandboxLoading === 'VIDE_LAUNCH' ? 'Ouverture...' : 'Ouvrir mon salon vide'}
          </button>
        </div>

        {/* Simulateur 2 : Salon Démo Pré-rempli */}
        <div
          style={{
            ...cardStyle,
            padding: '16px 18px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1.5px solid #111827'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  backgroundColor: '#dcfce7',
                  color: '#166534'
                }}
              >
                RDV Client • Simulateur IA inclus
              </span>
              <span style={{ fontSize: '11px', color: '#111827', fontWeight: '700' }}>PIN : 0000</span>
            </div>
            <h3 style={{ fontSize: '15.5px', fontWeight: '800', margin: '0 0 4px 0' }}>Salon Démo Pré-rempli</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.45, margin: '0 0 12px 0' }}></p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              disabled={!!sandboxLoading}
              onClick={() => handleLaunchSandbox('DEMO', 'LAUNCH')}
              style={{ ...primaryBtn, width: '100%', padding: '10px 14px', fontSize: '12.5px' }}
            >
              <Icon.ArrowUpRight /> Ouvrir le Salon Démo
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                disabled={!!sandboxLoading}
                onClick={() => handleLaunchSandbox('DEMO', 'SAVE_CUSTOM')}
                style={{ ...secondaryBtn, padding: '6px 8px', fontSize: '11px' }}
                title="Sauvegarder ma configuration actuelle"
              >
                Sauver
              </button>
              <button
                type="button"
                disabled={!!sandboxLoading}
                onClick={() => handleLaunchSandbox('DEMO', 'RESET_CUSTOM')}
                style={{ ...secondaryBtn, padding: '6px 8px', fontSize: '11px' }}
                title="Restaurer ma sauvegarde"
              >
                Restaurer
              </button>
              <button
                type="button"
                disabled={!!sandboxLoading}
                onClick={() => handleLaunchSandbox('DEMO', 'RESET_DEFAULT')}
                style={{
                  ...secondaryBtn,
                  padding: '6px 8px',
                  fontSize: '11px',
                  color: '#dc2626',
                  borderColor: '#fecaca',
                  backgroundColor: '#fef2f2'
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
          style={{
            ...cardStyle,
            padding: '16px 18px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af'
                }}
              >
                Tunnel Légal + Go-Live
              </span>
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace', fontWeight: '700' }}>
                {agent?.code}
              </span>
            </div>
            <h3 style={{ fontSize: '15.5px', fontWeight: '800', margin: '0 0 4px 0' }}>Simulateur d'Onboarding</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.45, margin: '0 0 14px 0' }}></p>
          </div>
          <button
            type="button"
            disabled={!!sandboxLoading}
            onClick={() => handleLaunchSandbox('ONBOARDING', 'LAUNCH')}
            style={{ ...primaryBtn, width: '100%', padding: '10px 14px', fontSize: '12.5px' }}
          >
            <Icon.ArrowUpRight /> Simuler 1ère connexion
          </button>
        </div>
      </div>

      {/* 2. BARRE DE NAVIGATION INTERNE */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          backgroundColor: '#e5e7eb',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '18px',
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
              style={{
                flex: 1,
                whiteSpace: 'nowrap',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: active ? '#ffffff' : 'transparent',
                color: active ? '#111827' : '#4b5563',
                fontWeight: active ? '800' : '600',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SOUS-ONGLET A : PLAYBOOK ONBOARDING */}
      {academieSubTab === 'playbook' && (
        <div style={{ ...cardStyle, padding: isMobile ? '14px' : '18px 20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#111827' }}>
                Checklist d’installation terrain
              </span>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '800',
                  backgroundColor: playbookProgressPct === 100 ? '#dcfce7' : '#f3f4f6',
                  color: playbookProgressPct === 100 ? '#166534' : '#111827'
                }}
              >
                {completedPlaybookSteps}/{totalPlaybookSteps} ({playbookProgressPct}%)
              </span>
            </div>

            {completedPlaybookSteps > 0 && (
              <button
                type="button"
                onClick={resetPlaybookChecks}
                style={{ ...secondaryBtn, padding: '5px 10px', fontSize: '11.5px' }}
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div
            style={{
              height: '5px',
              backgroundColor: '#f3f4f6',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '14px'
            }}
          >
            <div
              style={{
                width: `${playbookProgressPct}%`,
                height: '100%',
                backgroundColor: playbookProgressPct === 100 ? '#16a34a' : '#111827',
                borderRadius: '999px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {playbook.map((bloc, idx) => {
              const isOpen = openPlaybookPhase === idx;
              const nbDonePhase = bloc.etapes.filter((e) => playbookChecks[e.id]).length;
              const isPhaseComplete = nbDonePhase === bloc.etapes.length;

              return (
                <div
                  key={bloc.phase}
                  style={{
                    borderRadius: '12px',
                    border: isOpen
                      ? '1.5px solid #111827'
                      : isPhaseComplete
                      ? '1px solid #bbf7d0'
                      : '1px solid #e5e7eb',
                    backgroundColor: isOpen ? '#ffffff' : isPhaseComplete ? '#f0fdf4' : '#f9fafb',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenPlaybookPhase(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '11px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '7px',
                          flexShrink: 0,
                          backgroundColor: isPhaseComplete ? '#16a34a' : isOpen ? '#111827' : '#e5e7eb',
                          color: isPhaseComplete || isOpen ? '#ffffff' : '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11.5px',
                          fontWeight: '800'
                        }}
                      >
                        {isPhaseComplete ? 'OK' : idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: '700',
                          color: '#111827',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {bloc.titre}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#6b7280',
                          backgroundColor: '#f3f4f6',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          flexShrink: 0
                        }}
                      >
                        {bloc.duree}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: isPhaseComplete ? '#166534' : '#6b7280'
                        }}
                      >
                        {nbDonePhase}/{bloc.etapes.length}
                      </span>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: '#9ca3af',
                          width: '14px',
                          textAlign: 'center'
                        }}
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '8px 14px 12px 14px',
                        borderTop: '1px solid #f3f4f6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      {bloc.etapes.map((etape) => {
                        const checked = !!playbookChecks[etape.id];
                        return (
                          <label
                            key={etape.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              padding: '9px 12px',
                              borderRadius: '9px',
                              border: checked ? '1px solid #bbf7d0' : '1px solid #f3f4f6',
                              backgroundColor: checked ? '#f0fdf4' : '#f9fafb',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePlaybookStep(etape.id)}
                                style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer', flexShrink: 0 }}
                              />
                              <span
                                style={{
                                  fontSize: '12.5px',
                                  fontWeight: '600',
                                  color: checked ? '#166534' : '#111827',
                                  textDecoration: checked ? 'line-through' : 'none'
                                }}
                              >
                                {etape.label}
                              </span>
                            </div>
                            {etape.tag && (
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: '700',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#ffffff',
                                  color: '#4b5563',
                                  border: '1px solid #e5e7eb',
                                  flexShrink: 0
                                }}
                              >
                                {etape.tag}
                              </span>
                            )}
                          </label>
                        );
                      })}

                      {idx < playbook.length - 1 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                          <button
                            type="button"
                            onClick={() => setOpenPlaybookPhase(idx + 1)}
                            style={{ ...secondaryBtn, padding: '5px 10px', fontSize: '11.5px' }}
                          >
                            Suivant : {playbook[idx + 1].titre} →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SOUS-ONGLET B : SCENARIOS DEMO & OBJECTIONS */}
      {academieSubTab === 'scenarios' && (
        <>
          <div style={{ ...cardStyle, padding: isMobile ? '16px' : '20px', marginBottom: '14px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>
                  4 Scénarios Démo (« Maison Éclat »)
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    backgroundColor: '#dcfce7',
                    color: '#166534'
                  }}
                >
                  Bouton « Simulateur IA » en bas à droite
                </span>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '800',
                  backgroundColor: '#111827',
                  color: '#ffffff'
                }}
              >
                PIN Pointeuse : 0000
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                {
                  num: '01',
                  titre: 'Compta & Scan IA',
                  kpi: '+4 820 € net',
                  kpiColor: '#16a34a',
                  tags: ['CA : 18 450 € HT', '5 factures IA (Split-Screen)', 'Liasse PDF signée']
                },
                {
                  num: '02',
                  titre: 'Urgence RH & SMS',
                  kpi: 'Chloé absente',
                  kpiColor: '#dc2626',
                  tags: ['Arrêt maladie Cerfa', 'Détection RDV en conflit', 'Robot SMS reprogrammation']
                },
                {
                  num: '03',
                  titre: 'Avis & Winback',
                  kpi: 'Avis 2/5 Marine',
                  kpiColor: '#d97706',
                  tags: ['Alerte Tableau de bord', 'Offre pardon en 1 clic', 'Rappel auto en Caisse']
                },
                {
                  num: '04',
                  titre: 'Académie & Stocks',
                  kpi: '2 ruptures',
                  kpiColor: '#111827',
                  tags: ['Recettes & doses au gramme', 'Calcul de marge brute', 'Huile Élixir (reste 2)']
                }
              ].map((sc) => (
                <div
                  key={sc.num}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#9ca3af' }}>SCÉNARIO {sc.num}</span>
                      <span style={{ fontSize: '11.5px', fontWeight: '800', color: sc.kpiColor }}>{sc.kpi}</span>
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                      {sc.titre}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sc.tags.map((t, i) => (
                        <div key={i} style={{ fontSize: '11.5px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#9ca3af', flexShrink: 0 }} />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traitement des objections */}
          <div style={{ ...cardStyle, padding: '14px 18px', marginBottom: 0 }}>
            <div
              style={{
                fontSize: '11.5px',
                fontWeight: '800',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '6px'
              }}
            >
              4 Réponses flash aux objections
            </div>
            {OBJECTIONS_SALONS.map((item, idx) => {
              const isOpen = openObjectionIdx === idx;
              return (
                <div key={idx} style={{ borderBottom: idx < OBJECTIONS_SALONS.length - 1 ? '1px solid #f3f4f6' : 'none', padding: '10px 0' }}>
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
                      gap: '10px'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{item.q}</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#9ca3af' }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#374151',
                        lineHeight: 1.45,
                        borderLeft: '3px solid #111827'
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* SOUS-ONGLET C : VIDEOS DE FORMATION */}
      {academieSubTab === 'videos' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {tutorialsList.map((vid) => (
            <div
              key={vid.id}
              style={{
                ...cardStyle,
                marginBottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div
                  onClick={() => setActiveVideoModal(vid)}
                  style={{
                    height: '130px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginBottom: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                  >
                    ▶
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}
                  >
                    {vid.duree}
                  </span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#863bff', textTransform: 'uppercase' }}>
                  {vid.cat}
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: '700', margin: '4px 0 6px 0' }}>{vid.titre}</div>
                <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.45, marginBottom: '14px' }}>
                  {vid.desc}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(vid)}
                  style={{ ...primaryBtn, flex: 1, padding: '10px' }}
                >
                  Regarder
                </button>
                {isSuperAdmin && (
                  <button type="button" onClick={() => handleUpdateVideoUrl(vid.id)} style={secondaryBtn}>
                    Lien
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE VIDEO */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17,24,39,0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '780px', backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <strong style={{ fontSize: '15px' }}>{activeVideoModal.titre}</strong>
              <button type="button" onClick={() => setActiveVideoModal(null)} style={secondaryBtn}>
                Fermer (X)
              </button>
            </div>
            <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
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
    </>
  );
}
