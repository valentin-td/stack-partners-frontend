// src/components/dashboard/TabSimulateur.jsx
// Simulateur ROI & Comparateur STACK vs Planity — Design Salon Architecte (Jour & Nuit)

import { useState } from 'react';
import { Icon } from '../common/Icons';

const formatEuroFr = (val, decimals = 0) => {
  const num = Number(val) || 0;
  return `${num.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} €`;
};

const formatDecimalFr = (val, decimals = 1) => {
  const num = Number(val) || 0;
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export default function TabSimulateur({
  isMobile,
  setActiveTab,
  setProspectData,
  setShowProspectForm
}) {
  const [simRdvMois, setSimRdvMois] = useState(250);
  const [simPctNouveaux, setSimPctNouveaux] = useState(20);
  const [simPanier, setSimPanier] = useState(48);
  const [simPlanStack, setSimPlanStack] = useState('PRO'); // 'ESSENTIAL' | 'PRO'
  const [simFiltreCritere, setSimFiltreCritere] = useState('TOUS'); // 'TOUS' | 'BUSINESS' | 'TECH_LEGAL'
  const [voirTousCriteres, setVoirTousCriteres] = useState(false);
  const [simNomProspect, setSimNomProspect] = useState('');
  const [simCopiePitch, setSimCopiePitch] = useState(false);

  // Constantes tarifaires constatées sur le marché
  const PRIX_PLANITY_BASE = 269.00;
  const COM_PLANITY_NOUVEAU = 2.90;
  const LOYER_TPE_PLANITY_MOIS = 39.00; // Location de TPE classique (39 € à 55 € HT / mois)
  const FRAIS_INSTALL_PLANITY = 350.00; // Moyenne constatée (250 € à 490 € HT)

  const PRIX_STACK_ESSENTIEL = 39.00;
  const PRIX_STACK_PRO = 69.00;
  const LOYER_TPE_STACK_MOIS = 0.00; // 0 € / mois : Prêt 100% gratuit du terminal TPE Stripe Reader T600
  const FRAIS_INSTALL_STACK = 99.00; // 99 € HT : Mise en service, paramétrage complet et formation

  // Calculs financiers
  const nbNouveaux = Math.round(simRdvMois * (simPctNouveaux / 100));
  const commPlanityMois = nbNouveaux * COM_PLANITY_NOUVEAU;
  const coutPlanityLogicielMois = PRIX_PLANITY_BASE + commPlanityMois;
  const coutPlanityTotalMois = coutPlanityLogicielMois + LOYER_TPE_PLANITY_MOIS;
  const coutPlanityAn = coutPlanityTotalMois * 12;

  const coutStackLogicielMois = simPlanStack === 'ESSENTIAL' ? PRIX_STACK_ESSENTIEL : PRIX_STACK_PRO;
  const coutStackTotalMois = coutStackLogicielMois + LOYER_TPE_STACK_MOIS;
  const coutStackAn = coutStackTotalMois * 12;

  // Économie récurrente par mois et par an (logiciel + TPE)
  const ecoMois = Math.max(0, coutPlanityTotalMois - coutStackTotalMois);
  const ecoAn = ecoMois * 12;

  // Économie d'installation la première année
  const ecoInstall = FRAIS_INSTALL_PLANITY - FRAIS_INSTALL_STACK; // 251 € HT d'économie immédiate
  const gainPremiereAnnee = ecoAn + ecoInstall;
  const eco3Ans = (ecoAn * 3) + ecoInstall;

  const pctEco = coutPlanityTotalMois > 0 ? Math.round((ecoMois / coutPlanityTotalMois) * 100) : 0;
  const ratioBarreStack = coutPlanityTotalMois > 0 ? Math.max(8, Math.round((coutStackTotalMois / coutPlanityTotalMois) * 100)) : 16;

  // Équivalences métier concrètes pour le gérant
  const pairesCiseaux = Math.max(1, Math.floor(ecoAn / 650));
  const moisLoyer = ecoAn / 1500;
  const bacsLavage = Math.max(1, Math.floor(ecoAn / 2200));
  const formationsPro = Math.max(1, Math.floor(ecoAn / 800));

  const criteresComparatifs = [
    {
      id: 'commissions',
      categorie: 'BUSINESS',
      titre: 'Commissions nouveaux clients',
      planity: '2,50 € à 5,90 € HT par nouveau client',
      planityDetail: `Soit ${formatEuroFr(commPlanityMois, 2)} HT / mois ponctionnés sur votre croissance.`,
      stack: '0,00 € à vie (0 % de commission)',
      stackDetail: '100 % du chiffre d’affaires reste acquis au salon.'
    },
    {
      id: 'tpe',
      categorie: 'TECH_LEGAL',
      titre: 'Terminal de paiement (TPE)',
      planity: '39 € à 55 € HT / mois de location',
      planityDetail: 'Location longue durée auprès d’une banque avec engagement 36 à 48 mois.',
      stack: '0 € / mois (Prêt gracieux inclus)',
      stackDetail: 'Stripe Reader T600 moderne avec écran tactile couleur, prêté gratuitement.'
    },
    {
      id: 'frais_install',
      categorie: 'BUSINESS',
      titre: 'Frais de mise en service & formation',
      planity: '250 € à 490 € HT facturés d’office',
      planityDetail: 'Frais d’installation et de paramétrage prélevés dès la souscription.',
      stack: '99 € HT (Pack Démarrage Sérénité)',
      stackDetail: 'Import complet de votre fichier clients, configuration sur-mesure et formation équipe.'
    },
    {
      id: 'engagement',
      categorie: 'BUSINESS',
      titre: 'Engagement contractuel',
      planity: '12 à 24 mois fermes',
      planityDetail: 'Reconduction tacite, préavis contraignant et pénalités de sortie.',
      stack: '100 % sans engagement',
      stackDetail: 'Résiliation libre en un clic, sans aucun frais de sortie.'
    },
    {
      id: 'fichier_client',
      categorie: 'TECH_LEGAL',
      titre: 'Propriété du fichier client (RGPD)',
      planity: 'Capté dans leur annuaire centralisé',
      planityDetail: 'Vos clients deviennent des utilisateurs de leur plateforme.',
      stack: 'Propriété 100 % souveraine du salon',
      stackDetail: 'Base hermétique, jamais partagée ni exploitée pour des tiers.'
    },
    {
      id: 'concurrence',
      categorie: 'BUSINESS',
      titre: 'Visibilité des salons concurrents',
      planity: 'Concurrents du quartier suggérés',
      planityDetail: 'Lorsqu’un client cherche un créneau, les salons voisins sont affichés.',
      stack: 'Zéro concurrence (Marque blanche)',
      stackDetail: 'Page de réservation dédiée exclusivement à l’identité de votre salon.'
    },
    {
      id: 'caisse_nf525',
      categorie: 'TECH_LEGAL',
      titre: 'Caisse certifiée NF525 (DGFiP)',
      planity: 'Module externe ou surcoût',
      planityDetail: 'Nécessite souvent un logiciel de caisse additionnel (40 à 80 € / mois).',
      stack: 'Caisse NF525 nativement scellée SHA-256',
      stackDetail: 'Journal JET inviolable, clôtures Z et exports FEC inclus sans surcoût.'
    },
    {
      id: 'parrainage',
      categorie: 'BUSINESS',
      titre: 'Parrainage client & bouche-à-oreille',
      planity: 'Inexistant',
      planityDetail: 'Acquisition payante via les commissions sur nouveaux clients.',
      stack: 'Parrainage viral intégré (WhatsApp / SMS)',
      stackDetail: 'Vos clients partagent leur code en un clic et déclenchent des avoirs.'
    },
    {
      id: 'acomptes',
      categorie: 'TECH_LEGAL',
      titre: 'Protection Anti-NoShow & Acomptes',
      planity: 'Règles rigides standardisées',
      planityDetail: 'Paramétrage limité face à la réalité quotidienne du salon.',
      stack: 'Acomptes en ligne souples par prestation',
      stackDetail: 'Règle 24h automatisée : conversion en avoir ou conservation par le salon.'
    },
    {
      id: 'sms',
      categorie: 'BUSINESS',
      titre: 'SMS transactionnels & rappels',
      planity: 'Packs SMS facturés avec forte marge',
      planityDetail: 'Surcoût rapide sur les rappels et campagnes de relance.',
      stack: 'Quota inclus + hors-forfait à prix coûtant',
      stackDetail: 'Envoi GSM direct avec le nom officiel de votre salon en émetteur.'
    },
    {
      id: 'relation_humaine',
      categorie: 'BUSINESS',
      titre: 'Accompagnement de proximité',
      planity: 'Standard téléphonique impersonnel',
      planityDetail: 'Interlocuteurs changeants et délais d’attente réguliers.',
      stack: 'Conseiller partenaire dédié sur votre secteur',
      stackDetail: 'Installation sur site, formation de l’équipe et ligne directe.'
    }
  ];

  const criteresFiltres = criteresComparatifs.filter(c => {
    if (simFiltreCritere === 'BUSINESS') return c.categorie === 'BUSINESS';
    if (simFiltreCritere === 'TECH_LEGAL') return c.categorie === 'TECH_LEGAL';
    return true;
  });

  const criteresAffiches =
    simFiltreCritere === 'TOUS' && !voirTousCriteres
      ? criteresFiltres.slice(0, 6)
      : criteresFiltres;

  const copierPitch = () => {
    const nom = simNomProspect.trim() || 'votre salon';
    const texte = `SYNTHÈSE COMPARATIVE STACK vs PLANITY (${nom.toUpperCase()}) :
Volume salon : ${simRdvMois} RDV / mois (dont ${nbNouveaux} nouveaux clients)

COÛTS ACTUELS ESTIMÉS PLANITY + TPE :
- Abonnement logiciel : 269,00 € HT / mois
- Commissions nouveaux clients (${nbNouveaux} x 2,90 €) : ${formatEuroFr(commPlanityMois, 2)} HT / mois
- Location TPE traditionnel : 39,00 € HT / mois
TOTAL PLANITY : ${formatEuroFr(coutPlanityTotalMois, 2)} HT / mois (${formatEuroFr(coutPlanityAn, 0)} HT / an)

COÛT GLOBAL AVEC STACK :
- Abonnement ${simPlanStack === 'ESSENTIAL' ? 'Essentiel (39 €)' : 'Pro (69 €)'} HT / mois
- Commissions nouveaux clients : 0,00 € (0% commission à vie)
- Terminal TPE Stripe Reader T600 : 0,00 € (Prêt gracieux inclus)
TOTAL STACK : ${formatEuroFr(coutStackTotalMois, 2)} HT / mois (${formatEuroFr(coutStackAn, 0)} HT / an)

VOS GAINS DIRECTS EN PASSANT CHEZ STACK :
- ÉCONOMIE RÉCURRENTE PAR AN : +${formatEuroFr(ecoAn, 0)} HT / an (+${formatEuroFr(ecoMois, 2)} HT / mois conservés)
- GAIN TOTAL 1ÈRE ANNÉE : +${formatEuroFr(gainPremiereAnnee, 0)} HT (avec TPE offert & mise en service à 99 € au lieu de 350 €)
- PROJECTION SUR 3 ANS : +${formatEuroFr(eco3Ans, 0)} HT préservés dans votre trésorerie
- BAISSE GLOBALE DE VOS FRAIS : -${pctEco} %

CE QUE CETTE ÉCONOMIE REPRÉSENTE CONCRÈTEMENT :
- ${formatDecimalFr(moisLoyer, 1)} mois de loyer commercial financés
- ${pairesCiseaux} paire${pairesCiseaux > 1 ? 's' : ''} de ciseaux japonais Mizutani
- ${bacsLavage} bac${bacsLavage > 1 ? 's' : ''} de lavage massant${bacsLavage > 1 ? 's' : ''} neuf${bacsLavage > 1 ? 's' : ''}
- ${formationsPro} formation${formationsPro > 1 ? 's' : ''} technique${formationsPro > 1 ? 's' : ''} équipe`;
    navigator.clipboard.writeText(texte);
    setSimCopiePitch(true);
    setTimeout(() => setSimCopiePitch(false), 2500);
  };

  const basculerVersNouveauProspect = () => {
    if (setProspectData && simNomProspect.trim()) {
      setProspectData(prev => ({ ...prev, nom_salon: simNomProspect.trim() }));
    }
    if (setShowProspectForm) {
      setShowProspectForm(true);
    }
    if (setActiveTab) {
      setActiveTab('prospects');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '14px' : '18px',
        paddingBottom: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 0px))' : '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .sp-sim-input {
          width: 100%;
          box-sizing: border-box;
          height: 40px;
          padding: 0 13px;
          background: var(--sp-bg-input, #ffffff);
          border: var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.30));
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--sp-text-main, #18181b);
          outline: none;
          transition: border-color 0.15s ease;
        }
        .sp-sim-input:focus {
          border-color: #10b981;
        }
        .sp-sim-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.28);
          outline: none;
          cursor: pointer;
        }
        .sp-sim-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #10b981;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.22);
          cursor: pointer;
        }
        .sp-sim-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #10b981;
          border: 2.5px solid #ffffff;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.22);
          cursor: pointer;
        }
        .sp-sim-table tr {
          border-bottom: 1px solid rgba(148, 163, 184, 0.16);
        }
        .sp-sim-table tbody tr:last-child {
          border-bottom: none;
        }
      `}</style>

      {/* 1. EN-TÊTE COMPACT SUR UNE SEULE LIGNE */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
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
            Simulateur d'Économies & Comparateur
          </h1>
          <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
            STACK vs Planity — Démonstration du gain annuel pour le salon
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={copierPitch}
            className="sp-glass-pill"
            style={{
              height: '38px',
              padding: '0 15px',
              borderRadius: '999px',
              fontSize: '12.5px',
              fontWeight: '700',
              color: simCopiePitch ? '#059669' : 'var(--sp-text-main, #18181b)',
              borderColor: simCopiePitch ? 'rgba(16, 185, 129, 0.45)' : undefined,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              cursor: 'pointer',
              flex: isMobile ? 1 : 'initial',
              whiteSpace: 'nowrap'
            }}
          >
            <Icon.Check />
            <span>{simCopiePitch ? 'Pitch copié !' : 'Copier le pitch commercial'}</span>
          </button>

          <button
            type="button"
            onClick={basculerVersNouveauProspect}
            style={{
              height: '38px',
              padding: '0 18px',
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
              cursor: 'pointer',
              boxShadow: '0 6px 16px -4px rgba(15, 23, 42, 0.18)',
              flex: isMobile ? 1 : 'initial',
              whiteSpace: 'nowrap'
            }}
          >
            <Icon.Plus />
            <span>Créer le prospect</span>
          </button>
        </div>
      </header>

      {/* 2. LES 3 PILIERS FORTS DE STACK (TPE OFFERT, MISE EN SERVICE 99€, 0% COMMISSION) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '12px'
        }}
      >
        <div
          className="sp-glass-panel"
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.14)',
              color: '#059669',
              display: 'flex',
              flexShrink: 0
            }}
          >
            <Icon.CreditCard />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 7px', borderRadius: '4px' }}>
                0 € / mois
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--sp-text-main, #18181b)' }}>Prêt Gratuit du TPE</strong>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4 }}>
              Terminal tactile Stripe Reader T600 prêté sans frais. Économisez les <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>39 € à 55 € HT/mois</strong> de location facturés par les banques ou Planity.
            </p>
          </div>
        </div>

        <div
          className="sp-glass-panel"
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.14)',
              color: '#4f46e5',
              display: 'flex',
              flexShrink: 0
            }}
          >
            <Icon.Sparkles />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#4f46e5', backgroundColor: 'rgba(99, 102, 241, 0.12)', padding: '2px 7px', borderRadius: '4px' }}>
                99 € au lieu de 350 €+
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--sp-text-main, #18181b)' }}>Mise en Service Sérénité</strong>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4 }}>
              Import de vos données, paramétrage complet et formation de l'équipe à seulement <strong style={{ color: 'var(--sp-text-main, #18181b)' }}>99 € HT</strong> contre 250 € à 490 € HT chez les géants du secteur.
            </p>
          </div>
        </div>

        <div
          className="sp-glass-panel"
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div
            style={{
              padding: '8px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.14)',
              color: '#d97706',
              display: 'flex',
              flexShrink: 0
            }}
          >
            <Icon.TrendingUp />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#d97706', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '2px 7px', borderRadius: '4px' }}>
                0 % de commission
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--sp-text-main, #18181b)' }}>Zéro Rançon sur vos Clients</strong>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4 }}>
              Vos clients restent vos clients. Pas de taxe de 2,90 € HT par tête. 100 % de votre chiffre d'affaires reste acquis dans la caisse du salon.
            </p>
          </div>
        </div>
      </div>

      {/* 3. COCKPIT 2 COLONNES : PARAMÈTRES À GAUCHE | SYNTHÈSE DU MONTANT ANNUEL GAGNÉ À DROITE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.05fr) minmax(0, 1fr)',
          gap: isMobile ? '14px' : '18px',
          alignItems: 'stretch'
        }}
      >
        {/* COLONNE GAUCHE : PARAMÈTRES D'ACTIVITÉ */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '16px 14px' : '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          {/* En-tête + Nom du salon prospect intégré */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#059669', display: 'flex' }}>
                  <Icon.Calculator />
                </span>
                <h2 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', letterSpacing: '-0.01em' }}>
                  Activité du salon prospect
                </h2>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)' }}>
                CA estimé : {formatEuroFr(simRdvMois * simPanier)} / mois
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Nom du salon prospect (ex : Atelier Saint-Germain)..."
                value={simNomProspect}
                onChange={e => setSimNomProspect(e.target.value)}
                className="sp-sim-input"
              />
            </div>
          </div>

          {/* Curseur 1 : RDV mensuels */}
          <div className="sp-glass-pill" style={{ padding: '13px 15px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>
                Volume mensuel de rendez-vous
              </span>
              <strong style={{ fontSize: '15px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)', fontVariantNumeric: 'tabular-nums' }}>
                {simRdvMois} RDV / mois
              </strong>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={simRdvMois}
              onChange={e => setSimRdvMois(parseInt(e.target.value, 10))}
              className="sp-sim-range"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '5px' }}>
              <span>50 (Indépendant)</span>
              <span>350 (Salon moyen)</span>
              <span>1 000 (Grosse équipe)</span>
            </div>
          </div>

          {/* Curseur 2 : Part de nouveaux clients */}
          <div className="sp-glass-pill" style={{ padding: '13px 15px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>
                Part de nouveaux clients en ligne
              </span>
              <strong style={{ fontSize: '14.5px', fontWeight: '800', color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>
                {simPctNouveaux} % ({nbNouveaux} / mois)
              </strong>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={simPctNouveaux}
              onChange={e => setSimPctNouveaux(parseInt(e.target.value, 10))}
              className="sp-sim-range"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '5px' }}>
              <span>5 % (Fidèle)</span>
              <span>20 % (Moyenne marché)</span>
              <span>50 % (En forte croissance)</span>
            </div>
          </div>

          {/* Ligne du bas : Panier moyen + Forfait STACK en pilules */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.75fr 1.25fr', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '5px' }}>
                Panier moyen (€ TTC)
              </label>
              <input
                type="number"
                min="15"
                max="250"
                value={simPanier}
                onChange={e => setSimPanier(parseFloat(e.target.value) || 45)}
                className="sp-sim-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '5px' }}>
                Forfait STACK proposé (0 % comm.)
              </label>
              <div
                className="sp-glass-pill"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '3px',
                  padding: '3px',
                  borderRadius: '12px',
                  height: '40px',
                  boxSizing: 'border-box'
                }}
              >
                {[
                  { id: 'ESSENTIAL', label: 'Essentiel · 39 €' },
                  { id: 'PRO', label: 'Pro · 69 €' }
                ].map(plan => {
                  const actif = simPlanStack === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSimPlanStack(plan.id)}
                      style={{
                        border: actif ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
                        backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                        color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                        borderRadius: '9px',
                        fontSize: '12px',
                        fontWeight: actif ? '800' : '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.14s ease'
                      }}
                    >
                      {plan.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : CARTE MAÎTRESSE OBSIDIENNE ÉMERAUDE (MONTANT ANNUEL GAGNÉ PAR LE SALON) */}
        <div
          className="sp-glass-panel-dark"
          style={{
            padding: isMobile ? '18px 16px' : '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '18px'
          }}
        >
          {/* Haut : Grand montant annuel gagné */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.72)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {simNomProspect.trim() ? `Montant annuel gagné · ${simNomProspect.trim()}` : 'Montant annuel gagné par le salon'}
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', backgroundColor: 'rgba(16, 185, 129, 0.22)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.32)' }}>
                -{pctEco} % de frais
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: isMobile ? '32px' : '38px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                +{formatEuroFr(ecoAn, 0)}
              </span>
              <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#34d399' }}>
                HT / an de charges économisées
              </span>
            </div>

            <div style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.76)', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              soit <strong style={{ color: '#34d399' }}>+{formatEuroFr(ecoMois, 2)} HT / mois</strong> conservés dans la trésorerie du gérant
            </div>

            {/* Badges 1ère année & 3 ans */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.60)', fontWeight: '600' }}>Gain total 1ère année</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#34d399', marginTop: '2px' }}>
                  +{formatEuroFr(gainPremiereAnnee, 0)} HT
                </div>
                <div style={{ fontSize: '9.5px', color: 'rgba(255, 255, 255, 0.45)', marginTop: '1px' }}>Avec TPE offert & install. à 99 €</div>
              </div>

              <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.60)', fontWeight: '600' }}>Projection sur 3 ans</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                  +{formatEuroFr(eco3Ans, 0)} HT
                </div>
                <div style={{ fontSize: '9.5px', color: '#34d399', marginTop: '1px' }}>Préservés de Planity</div>
              </div>
            </div>
          </div>

          {/* Milieu : Comparaison visuelle Planity vs STACK */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px 16px', borderRadius: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
            {/* Barre Planity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px', marginBottom: '5px', gap: '8px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.75)', fontWeight: '600' }}>
                  Planity + TPE bancaire <span style={{ color: 'rgba(255, 255, 255, 0.48)', fontSize: '11px' }}>(269 € + {formatEuroFr(commPlanityMois, 0)} comm. + 39 € TPE)</span>
                </span>
                <strong style={{ color: '#fca5a5', fontWeight: '800', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {formatEuroFr(coutPlanityTotalMois, 2)} HT / mois
                </strong>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.10)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', backgroundColor: 'rgba(248, 113, 113, 0.75)', borderRadius: '999px' }} />
              </div>
            </div>

            {/* Barre STACK */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px', marginBottom: '5px', gap: '8px' }}>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>
                  STACK {simPlanStack === 'ESSENTIAL' ? 'Essentiel' : 'Pro'} <span style={{ color: '#34d399', fontSize: '11px', fontWeight: '600' }}>(0 € commission · TPE offert)</span>
                </span>
                <strong style={{ color: '#34d399', fontWeight: '800', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {formatEuroFr(coutStackTotalMois, 2)} HT / mois
                </strong>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.10)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${ratioBarreStack}%`, backgroundColor: '#10b981', borderRadius: '999px', transition: 'width 0.25s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span>Coût annuel Planity + TPE : {formatEuroFr(coutPlanityAn, 0)} HT</span>
              <span>STACK tout compris : {formatEuroFr(coutStackAn, 0)} HT</span>
            </div>
          </div>

          {/* Bas : 4 équivalences concrètes intégrées */}
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255, 255, 255, 0.58)', marginBottom: '8px' }}>
              Ce que cette économie finance directement dans le salon
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { val: `${formatDecimalFr(moisLoyer, 1)} mois`, label: 'Loyer commercial financé' },
                { val: `${pairesCiseaux} paire${pairesCiseaux > 1 ? 's' : ''}`, label: 'Ciseaux Mizutani (650 €)' },
                { val: `${bacsLavage} bac${bacsLavage > 1 ? 's' : ''}`, label: 'Poste massant neuf (2 200 €)' },
                { val: `${formationsPro} stage${formationsPro > 1 ? 's' : ''}`, label: 'Formations équipe (800 €)' }
              ].map((eq, i) => (
                <div
                  key={i}
                  style={{
                    padding: '9px 11px',
                    borderRadius: '11px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                    {eq.val}
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {eq.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABLEAU COMPARATIF SOBRE & LISIBLE */}
      <div className="sp-glass-panel" style={{ padding: isMobile ? '16px 14px' : '22px 24px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--sp-text-main, #18181b)', letterSpacing: '-0.01em' }}>
              Comparatif détaillé : STACK vs Planity
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
              Les {criteresComparatifs.length} points clés qui protègent la rentabilité et l’indépendance du salon.
            </span>
          </div>

          {/* Filtres doux en Émeraude */}
          <div
            className="sp-glass-pill"
            style={{
              display: isMobile ? 'grid' : 'inline-flex',
              gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : undefined,
              padding: '3px',
              borderRadius: '999px',
              gap: '2px'
            }}
          >
            {[
              { id: 'TOUS', label: `Tous (${criteresComparatifs.length})` },
              { id: 'BUSINESS', label: 'Business' },
              { id: 'TECH_LEGAL', label: 'Technique & Légal' }
            ].map(tab => {
              const actif = simFiltreCritere === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSimFiltreCritere(tab.id)}
                  style={{
                    border: actif ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                    backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                    color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                    padding: '5px 12px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: actif ? '800' : '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    transition: 'all 0.14s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="sp-sim-table" style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 12px 12px 4px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sp-text-muted, #64748b)', width: '26%' }}>
                  Critère
                </th>
                <th style={{ padding: '10px 14px 12px 14px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sp-text-muted, #64748b)', width: '34%' }}>
                  Planity
                </th>
                <th style={{ padding: '10px 12px 12px 14px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', width: '40%' }}>
                  STACK
                </th>
              </tr>
            </thead>
            <tbody>
              {criteresAffiches.map(c => (
                <tr key={c.id}>
                  <td style={{ padding: '13px 12px 13px 4px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '700', color: 'var(--sp-text-main, #18181b)', fontSize: '13px', lineHeight: 1.35 }}>
                      {c.titre}
                    </div>
                  </td>

                  <td style={{ padding: '13px 14px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '600', color: 'var(--sp-text-muted, #64748b)', fontSize: '13px', lineHeight: 1.35 }}>
                      {c.planity}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', opacity: 0.8, marginTop: '2px', lineHeight: 1.4 }}>
                      {c.planityDetail}
                    </div>
                  </td>

                  <td style={{ padding: '13px 12px 13px 14px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                      <span style={{ color: '#059669', marginTop: '2px', flexShrink: 0, display: 'inline-flex' }}>
                        <Icon.Check />
                      </span>
                      <div>
                        <div style={{ fontWeight: '800', color: 'var(--sp-text-main, #18181b)', fontSize: '13px', lineHeight: 1.35 }}>
                          {c.stack}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '2px', lineHeight: 1.4 }}>
                          {c.stackDetail}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bouton discret d'affichage complet + note méthodologique sobre */}
        <div
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(148, 163, 184, 0.16)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)' }}>
            Base de calcul : forfait public avec prise de RDV (269 € HT/mois) + commission moyenne 2,90 € HT par nouveau client + location TPE standard (39 € HT/mois).
          </span>

          {simFiltreCritere === 'TOUS' && criteresFiltres.length > 6 && (
            <button
              type="button"
              onClick={() => setVoirTousCriteres(!voirTousCriteres)}
              className="sp-glass-pill"
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: '700',
                color: 'var(--sp-text-main, #18181b)',
                cursor: 'pointer'
              }}
            >
              {voirTousCriteres ? 'Réduire le comparatif' : `Afficher les ${criteresFiltres.length - 6} autres critères`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
