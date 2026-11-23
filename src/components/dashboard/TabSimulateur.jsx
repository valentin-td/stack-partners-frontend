// src/components/dashboard/TabSimulateur.jsx
// Simulateur de Rentabilite & Comparateur Executif (STACK vs Planity / STACK vs Sans Logiciel)
// Design Pleine Largeur, Reactivite Temps Reel & Mode 100% Zero Emoji

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

const TARIFS_STACK = {
  ESSENTIAL: {
    id: 'ESSENTIAL',
    label: 'Essentiel',
    prix: 39.00,
    planityRef: 269.00,
    planityNom: 'Planity Solo (269 €)',
    description: '1 collaborateur · Caisse NF525 & TPE T600 inclus'
  },
  PRO: {
    id: 'PRO',
    label: 'Pro',
    prix: 69.00,
    planityRef: 289.00,
    planityNom: 'Planity Standard (289 €)',
    description: 'Jusqu\'a 5 collaborateurs · Agenda en ligne & SMS inclus'
  },
  PREMIUM: {
    id: 'PREMIUM',
    label: 'Premium',
    prix: 99.00,
    planityRef: 339.00,
    planityNom: 'Planity Equipe (339 €)',
    description: 'Equipe complete · Intelligence Artificielle & Comptabilite FEC'
  }
};

export default function TabSimulateur({
  isMobile,
  setActiveTab,
  setProspectData,
  setShowProspectForm
}) {
  // Mode de comparaison : 'PLANITY' (salon deja equipe) ou 'SANS_LOGICIEL' (cahier papier / caisse basique)
  const [modeComparatif, setModeComparatif] = useState('PLANITY');

  // Parametres du salon prospect
  const [simNomProspect, setSimNomProspect] = useState('');
  const [simRdvMois, setSimRdvMois] = useState(300);
  const [simPctNouveaux, setSimPctNouveaux] = useState(20);
  const [simPanier, setSimPanier] = useState(48);
  const [simPlanStack, setSimPlanStack] = useState('PRO'); // 'ESSENTIAL' | 'PRO' | 'PREMIUM'
  const [simNbCollaborateurs, setSimNbCollaborateurs] = useState(2);
  const [simFiltreCritere, setSimFiltreCritere] = useState('TOUS'); // 'TOUS' | 'BUSINESS' | 'TECH_LEGAL'
  const [simCopiePitch, setSimCopiePitch] = useState(false);

  // Constantes tarifaires marche Planity
  const planActuel = TARIFS_STACK[simPlanStack] || TARIFS_STACK.PRO;
  const PRIX_PLANITY_BASE = planActuel.planityRef;
  const COM_PLANITY_NOUVEAU = 2.90; // Commission ponctionnee par nouveau client chez Planity
  const LOYER_TPE_PLANITY_MOIS = 39.00; // Location de TPE bancaire ou Planity
  const FRAIS_INSTALL_PLANITY = 350.00; // Frais de mise en service et formation Planity

  // Constantes STACK
  const PRIX_STACK = planActuel.prix;
  const LOYER_TPE_STACK_MOIS = 0.00; // Pret 100% gratuit du TPE Stripe Reader T600
  const FRAIS_INSTALL_STACK = 99.00; // Mise en service, formation et import de fichier

  // =========================================================================
  // CALCULS MODE 1 : COMPARATIF PLANITY
  // =========================================================================
  const nbNouveaux = Math.round(simRdvMois * (simPctNouveaux / 100));
  const commPlanityMois = nbNouveaux * COM_PLANITY_NOUVEAU;
  const coutPlanityTotalMois = PRIX_PLANITY_BASE + commPlanityMois + LOYER_TPE_PLANITY_MOIS;
  const coutPlanityAn = coutPlanityTotalMois * 12;

  const coutStackTotalMois = PRIX_STACK + LOYER_TPE_STACK_MOIS;
  const coutStackAn = coutStackTotalMois * 12;

  const ecoMois = Math.max(0, coutPlanityTotalMois - coutStackTotalMois);
  const ecoAn = ecoMois * 12;
  const ecoInstall = FRAIS_INSTALL_PLANITY - FRAIS_INSTALL_STACK;
  const gainPremiereAnnee = ecoAn + ecoInstall;
  const eco3Ans = ecoAn * 3 + ecoInstall;
  const pctEco = coutPlanityTotalMois > 0 ? Math.round((ecoMois / coutPlanityTotalMois) * 100) : 0;
  const ratioBarreStack = coutPlanityTotalMois > 0 ? Math.max(8, Math.round((coutStackTotalMois / coutPlanityTotalMois) * 100)) : 16;

  // Equivalences metier concretes (Planity)
  const pairesCiseaux = Math.max(1, Math.floor(ecoAn / 650));
  const moisLoyer = ecoAn / 1500;
  const bacsLavage = Math.max(1, Math.floor(ecoAn / 2200));
  const formationsPro = Math.max(1, Math.floor(ecoAn / 800));

  // =========================================================================
  // CALCULS MODE 2 : SALON SANS LOGICIEL DE CAISSE (CE QUE STACK FAIT GAGNER)
  // =========================================================================
  const caEstimeMois = simRdvMois * simPanier;
  const caEstimeAn = caEstimeMois * 12;

  // 1. No-shows eradiques grace aux acomptes et rappels SMS (8% de no-shows historiques sauves)
  const nbRdvSauvesNoShow = Math.max(1, Math.round(simRdvMois * 0.08));
  const gainNoShowMois = nbRdvSauvesNoShow * simPanier;

  // 2. Rendez-vous pris en ligne en dehors des heures d ouverture (soir apres 20h et dimanche) : ~6% de RDV supplementaires
  const nbRdvEnLigneCaptes = Math.max(1, Math.round(simRdvMois * 0.06));
  const gainRdvEnLigneMois = nbRdvEnLigneCaptes * simPanier;

  // 3. Economie de loyer TPE bancaire (TPE T600 inclus sans frais vs 39 EUR factures par la banque)
  const gainTpeBancaireMois = 39.00;

  // Total gain brut et benefice net annuel
  const gainBrutMois = gainNoShowMois + gainRdvEnLigneMois + gainTpeBancaireMois;
  const gainBrutAn = gainBrutMois * 12;
  const beneficeNetMois = Math.max(0, gainBrutMois - coutStackTotalMois);
  const beneficeNetAn = beneficeNetMois * 12;
  const multiplicateurRoi = coutStackTotalMois > 0 ? (gainBrutMois / coutStackTotalMois).toFixed(1) : '15.0';
  const heuresGagneesMois = Math.round(simRdvMois * 0.07); // ~4 min gagnees par RDV en moins au telephone

  // =========================================================================
  // CRITERES COMPARATIFS (TABLEAU DU BAS)
  // =========================================================================
  const criteresPlanity = [
    {
      id: 'commissions',
      categorie: 'BUSINESS',
      titre: 'Commissions sur nouveaux clients',
      planity: '2,50 a 5,90 EUR HT par nouveau client',
      planityDetail: `Soit ${formatEuroFr(commPlanityMois, 2)} HT / mois ponctionnes directement sur votre chiffre d affaires.`,
      stack: '0,00 EUR a vie (0% de commission)',
      stackDetail: '100% de vos encaissements et de votre croissance restent acquis au salon.'
    },
    {
      id: 'tpe',
      categorie: 'TECH_LEGAL',
      titre: 'Terminal de paiement (TPE)',
      planity: '39 a 55 EUR HT / mois de location bancaire',
      planityDetail: 'Contrat bancaire de location avec engagement ferme de 36 a 48 mois.',
      stack: '0 EUR / mois (Pret gracieux inclus)',
      stackDetail: 'Terminal tactile couleur Stripe Reader T600 prete sans frais pendant toute la souscription.'
    },
    {
      id: 'frais_install',
      categorie: 'BUSINESS',
      titre: 'Mise en service & formation',
      planity: '250 a 490 EUR HT a la souscription',
      planityDetail: 'Frais de dossier et de formation preleves des le premier mois.',
      stack: '99 EUR HT (Tarif forfaitaire unique)',
      stackDetail: 'Import complet de votre base clients, configuration du catalogue et formation de l equipe.'
    },
    {
      id: 'engagement',
      categorie: 'BUSINESS',
      titre: 'Engagement contractuel',
      planity: '12 a 24 mois avec reconduction tacite',
      planityDetail: 'Preavis rigide de 3 mois et penalites financieres en cas de resiliation.',
      stack: '100% sans engagement de duree',
      stackDetail: 'Libre resiliation en un clic depuis votre espace administrateur, sans aucune penalite.'
    },
    {
      id: 'fichier_client',
      categorie: 'TECH_LEGAL',
      titre: 'Propriete du fichier clients (RGPD)',
      planity: 'Base mutualisee dans leur annuaire',
      planityDetail: 'Vos clients sont enregistres sur la marketplace et sollicites pour d autres etablissements.',
      stack: 'Propriete souveraine hermetique du salon',
      stackDetail: 'Vos donnees clients ne sont jamais partagees, vendues ni sollicitees pour la concurrence.'
    },
    {
      id: 'concurrence',
      categorie: 'BUSINESS',
      titre: 'Visibilite des salons concurrents',
      planity: 'Salons voisins affiches lors des recherches',
      planityDetail: 'Un client en retard ou cherchant un horaire se voit proposer les confreres a proximite.',
      stack: 'Marque blanche exclusive (Zero concurrence)',
      stackDetail: 'Votre page et application de reservation mettent uniquement en valeur votre equipe et vos tarifs.'
    },
    {
      id: 'caisse_nf525',
      categorie: 'TECH_LEGAL',
      titre: 'Conformite fiscale caisse NF525',
      planity: 'Module externe ou surcout caisse',
      planityDetail: 'Necessite souvent un abonnement de caisse complementaire (40 a 80 EUR / mois).',
      stack: 'Caisse NF525 certifiee scellee SHA-256',
      stackDetail: 'Journal JET inviolable, clotures Z automatiques et exports du grand livre comptable inclus.'
    },
    {
      id: 'parrainage',
      categorie: 'BUSINESS',
      titre: 'Programme de parrainage integre',
      planity: 'Aucun programme de parrainage salon',
      planityDetail: 'L acquisition de clientele reste entierement tributaire de la plateforme payante.',
      stack: 'Moteur de parrainage digital en 1 clic',
      stackDetail: 'Vos clients fideles partagent leur code promo sur WhatsApp / SMS et cumulent des avoirs.'
    },
    {
      id: 'acomptes',
      categorie: 'TECH_LEGAL',
      titre: 'Protection Anti-NoShow & Acomptes',
      planity: 'Options standardisees peu flexibles',
      planityDetail: 'Regles rigides difficilement ajustables selon les specificites de vos prestations.',
      stack: 'Acomptes CB adaptables par prestation',
      stackDetail: 'Regle 24h automatique : conservation de l acompte ou emission d un avoir sous garantie.'
    },
    {
      id: 'sms',
      categorie: 'BUSINESS',
      titre: 'Rappels et notifications SMS',
      planity: 'Packs SMS surtaxes hors-forfait',
      planityDetail: 'Forte marge appliquee des que le quota de base est depasse.',
      stack: 'Quota mensuel inclus + prix coutant',
      stackDetail: 'SMS envoyes avec le nom officiel de votre salon affiche en emetteur sur le telephone du client.'
    },
    {
      id: 'accompagnement',
      categorie: 'BUSINESS',
      titre: 'Interlocuteur et assistance de terrain',
      planity: 'Plateforme telephonique impersonnelle',
      planityDetail: 'Attente reguliere et conseillers distants ne connaissant pas votre etablissement.',
      stack: 'Agent commercial partenaire de votre secteur',
      stackDetail: 'Visite physique sur place, ligne directe mobile et accompagnement technique de proximite.'
    }
  ];

  const criteresSansLogiciel = [
    {
      id: 'noshow',
      categorie: 'BUSINESS',
      titre: 'Gestion des lapins (No-Shows)',
      planity: 'Cahier papier : Perte seche 8% a 12% du CA',
      planityDetail: 'Un creneau non honore est irrecuperable. Les pertes cumulent souvent plus de 800 EUR / mois.',
      stack: 'Acomptes en ligne + Rappels automatiques',
      stackDetail: 'Elimination de 95% des no-shows. L acompte garantit le chiffre d affaires du creneau.'
    },
    {
      id: 'reservation_247',
      categorie: 'BUSINESS',
      titre: 'Prise de rendez-vous soir et week-end',
      planity: 'Uniquement aux heures d ouverture par telephone',
      planityDetail: '40% des clients souhaitent reserver apres 20h ou le dimanche et vont chez un confrere.',
      stack: 'Prise de rendez-vous en ligne 24h/24',
      stackDetail: 'Vos clients reservent depuis leur smartphone a toute heure, sans aucune interruption pour vous.'
    },
    {
      id: 'temps_telephone',
      categorie: 'BUSINESS',
      titre: 'Temps passe au telephone au fauteuil',
      planity: '1h30 a 2h interrompues par jour',
      planityDetail: 'Vous devez lacher vos ciseaux, repondre au client et feuilleter votre agenda papier.',
      stack: 'Agendas synchronises en temps reel',
      stackDetail: 'Calme retrouve au salon : 70% des reservations se font en ligne sans que le telephone sonne.'
    },
    {
      id: 'conformite_nf525',
      categorie: 'TECH_LEGAL',
      titre: 'Conformite fiscale DGFiP (Loi anti-fraude)',
      planity: 'Caisse manuelle : Risque lourd en cas de controle',
      planityDetail: 'Amende legale de 7 500 EUR par systeme non conforme avec obligation de mise en conformite sous 30 jours.',
      stack: 'Caisse NF525 scellee cryptographiquement',
      stackDetail: 'Certificat de conformite officiel fourni, clotures Z scellees et export comptable automatique.'
    },
    {
      id: 'tpe_banque',
      categorie: 'TECH_LEGAL',
      titre: 'Cout du terminal bancaire TPE',
      planity: '39 a 55 EUR HT / mois de location bancaire',
      planityDetail: 'Engagement ferme aupres de votre banque avec commissions d encaissement opaques.',
      stack: 'Pret 100% gratuit du Stripe Reader T600',
      stackDetail: 'Terminal tactile moderne sans aucun loyer mensuel, pret a l emploi des le premier jour.'
    },
    {
      id: 'fidelite_marketing',
      categorie: 'BUSINESS',
      titre: 'Fidelisation et relance des clients dormants',
      planity: 'Cartes papier vite egarees',
      planityDetail: 'Aucune visibilite sur les clients qui n ont pas pris de rendez-vous depuis 3 mois.',
      stack: 'Relance intelligente et carte digitale',
      stackDetail: 'Campagnes de relance automatiques pour faire revenir les clients et recompenses parrainage.'
    }
  ];

  const criteresAffiches = (modeComparatif === 'PLANITY' ? criteresPlanity : criteresSansLogiciel).filter(c => {
    if (simFiltreCritere === 'BUSINESS') return c.categorie === 'BUSINESS';
    if (simFiltreCritere === 'TECH_LEGAL') return c.categorie === 'TECH_LEGAL';
    return true;
  });

  // =========================================================================
  // ACTIONS COMMERCIALE (PITCH & CRÉATION PROSPECT)
  // =========================================================================
  const copierPitch = () => {
    const nom = simNomProspect.trim() || 'votre salon';
    let texte = '';

    if (modeComparatif === 'PLANITY') {
      texte = `SYNTHESE COMPARATIVE STACK vs PLANITY (${nom.toUpperCase()}) :
Volume d activite : ${simRdvMois} RDV / mois (dont ${nbNouveaux} nouveaux clients estimes)
Forfait STACK selectionne : ${planActuel.label} (${planActuel.prix} EUR HT / mois)

COUTS ACTUELS ESTIMES CHEZ PLANITY + BANQUE :
- Abonnement logiciel : ${formatEuroFr(PRIX_PLANITY_BASE, 2)} HT / mois (${planActuel.planityNom})
- Commissions nouveaux clients (${nbNouveaux} x 2,90 EUR) : ${formatEuroFr(commPlanityMois, 2)} HT / mois
- Location TPE traditionnel : ${formatEuroFr(LOYER_TPE_PLANITY_MOIS, 2)} HT / mois
TOTAL PLANITY : ${formatEuroFr(coutPlanityTotalMois, 2)} HT / mois (${formatEuroFr(coutPlanityAn, 0)} HT / an)

COUT GLOBAL AVEC STACK :
- Abonnement ${planActuel.label} : ${formatEuroFr(PRIX_STACK, 2)} HT / mois
- Commissions sur nouveaux clients : 0,00 EUR (0% a vie)
- Terminal TPE Stripe Reader T600 : 0,00 EUR (Pret gracieux inclus)
TOTAL STACK : ${formatEuroFr(coutStackTotalMois, 2)} HT / mois (${formatEuroFr(coutStackAn, 0)} HT / an)

VOS ECONOMIES IMMEDIATES :
- Economie recurrente annuelle : +${formatEuroFr(ecoAn, 0)} HT / an (+${formatEuroFr(ecoMois, 2)} HT / mois)
- Gain net 1re annee : +${formatEuroFr(gainPremiereAnnee, 0)} HT (TPE offert & mise en service a 99 EUR vs 350 EUR)
- Projection sur 3 ans : +${formatEuroFr(eco3Ans, 0)} HT
- Baisse immediate de vos charges : -${pctEco} %

EQUIVALENCES METIER CONCRETES :
- ${formatDecimalFr(moisLoyer, 1)} mois de loyer commercial finances
- ${pairesCiseaux} paire${pairesCiseaux > 1 ? 's' : ''} de ciseaux japonais Mizutani
- ${bacsLavage} bac${bacsLavage > 1 ? 's' : ''} de lavage massant neuf${bacsLavage > 1 ? 's' : ''}
- ${formationsPro} stage${formationsPro > 1 ? 's' : ''} de formation technique pour l equipe`;
    } else {
      texte = `BILAN FINANCIER & GAINS ESTIMES AVEC STACK (${nom.toUpperCase()}) :
Volume d activite : ${simRdvMois} RDV / mois · Panier moyen : ${simPanier} EUR TTC
Forfait STACK selectionne : ${planActuel.label} (${planActuel.prix} EUR HT / mois)

CE QUE STACK FAIT GAGNER A VOTRE SALON CHAQUE MOIS :
1. No-shows eradiques (acomptes + rappels SMS) : +${formatEuroFr(gainNoShowMois, 0)} / mois (${nbRdvSauvesNoShow} RDV sauves)
2. Nouveaux clients captes en ligne 24h/24 : +${formatEuroFr(gainRdvEnLigneMois, 0)} / mois (${nbRdvEnLigneCaptes} RDV en ligne le soir/dimanche)
3. Economie location TPE bancaire : +${formatEuroFr(gainTpeBancaireMois, 0)} / mois (Lecteur tactile T600 prete a 0 EUR)
TOTAL GAIN BRUT : +${formatEuroFr(gainBrutMois, 0)} / mois (+${formatEuroFr(gainBrutAn, 0)} / an)

COUT DE L ABONNEMENT STACK :
- Forfait ${planActuel.label} : ${formatEuroFr(PRIX_STACK, 2)} HT / mois (100% sans engagement)

VOTRE BENEFICE NET SUPPLEMENTAIRE :
- Gain net annuel pour le salon : +${formatEuroFr(beneficeNetAn, 0)} NET / an (+${formatEuroFr(beneficeNetMois, 0)} / mois)
- Retour sur investissement (ROI) : chaque euro investi dans STACK en rapporte ${multiplicateurRoi} EUR
- Temps libere au fauteuil : ~${heuresGagneesMois} heures gagnees par mois sans telephone`;
    }

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
        gap: isMobile ? '16px' : '20px',
        paddingBottom: isMobile ? 'calc(95px + env(safe-area-inset-bottom, 0px))' : '36px',
        width: '100%',
        maxWidth: '1560px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .sp-sim-roi-card {
          background:
            radial-gradient(120% 120% at 95% 10%, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 58%),
            linear-gradient(145deg, #162420 0%, #0f1715 100%) !important;
          border: 1px solid rgba(52, 211, 153, 0.32) !important;
          box-shadow: 0 16px 36px -10px rgba(15, 23, 21, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
          border-radius: 20px !important;
          color: #ffffff !important;
          box-sizing: border-box;
        }
        .sp-sim-input {
          width: 100%;
          box-sizing: border-box;
          height: 42px;
          padding: 0 13px;
          background: var(--sp-bg-input, #ffffff);
          border: var(--sp-border-input, 1px solid rgba(148, 163, 184, 0.30));
          border-radius: 12px;
          font-size: 13.5px;
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

      {/* =================================================================== */}
      {/* 1. TITRE DE LA PAGE & ACTIONS SUPERIEURES                           */}
      {/* =================================================================== */}
      <header
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '14px',
          width: '100%'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? '24px' : '28px',
              fontWeight: '800',
              margin: 0,
              letterSpacing: '-0.03em',
              color: 'var(--sp-text-main, #18181b)',
              lineHeight: 1.15
            }}
          >
            Simulateur
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--sp-text-muted, #64748b)', fontWeight: '600' }}>
            Calculateur de rentabilite, d economies et de retour sur investissement salon
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <button
            type="button"
            onClick={copierPitch}
            className="sp-glass-pill"
            style={{
              height: '38px',
              padding: '0 16px',
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
            <span>{simCopiePitch ? 'Pitch copie !' : 'Copier le pitch commercial'}</span>
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
            <span>Creer le prospect</span>
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. SWITCHER PRINCIPAL DE SITUATION PROSPECT (PLANITY VS SANS LOGICIEL) */}
      {/* =================================================================== */}
      <div
        className="sp-glass-panel"
        style={{
          padding: '6px',
          borderRadius: '16px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '6px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <button
          type="button"
          onClick={() => setModeComparatif('PLANITY')}
          style={{
            padding: isMobile ? '11px 12px' : '12px 18px',
            borderRadius: '12px',
            border: modeComparatif === 'PLANITY' ? '1.5px solid #10b981' : '1px solid transparent',
            backgroundColor: modeComparatif === 'PLANITY' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
            color: modeComparatif === 'PLANITY' ? '#059669' : 'var(--sp-text-muted, #64748b)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800' }}>Comparatif avec Planity</span>
            <span style={{ fontSize: '11px', fontWeight: '800', padding: '1px 7px', borderRadius: '999px', backgroundColor: modeComparatif === 'PLANITY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.15)', color: modeComparatif === 'PLANITY' ? '#059669' : 'inherit' }}>
              Salon equipe Planity
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', textAlign: 'center' }}>
            Demonstration des economies massives realisees en passant sur STACK (0% commission & TPE offert)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModeComparatif('SANS_LOGICIEL')}
          style={{
            padding: isMobile ? '11px 12px' : '12px 18px',
            borderRadius: '12px',
            border: modeComparatif === 'SANS_LOGICIEL' ? '1.5px solid #10b981' : '1px solid transparent',
            backgroundColor: modeComparatif === 'SANS_LOGICIEL' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
            color: modeComparatif === 'SANS_LOGICIEL' ? '#059669' : 'var(--sp-text-muted, #64748b)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800' }}>Salon sans logiciel de caisse</span>
            <span style={{ fontSize: '11px', fontWeight: '800', padding: '1px 7px', borderRadius: '999px', backgroundColor: modeComparatif === 'SANS_LOGICIEL' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.15)', color: modeComparatif === 'SANS_LOGICIEL' ? '#059669' : 'inherit' }}>
              Cahier papier / Caisse simple
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--sp-text-muted, #64748b)', textAlign: 'center' }}>
            Demonstration du Chiffre d Affaires supplementaire gagne grace a la reservation en ligne et aux acomptes
          </span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 3. COCKPIT DU SIMULATEUR EN PLEINE LARGEUR (2 COLONNES EQUILIBREES) */}
      {/* =================================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.05fr) minmax(0, 1.15fr)',
          gap: isMobile ? '16px' : '20px',
          alignItems: 'stretch',
          width: '100%'
        }}
      >
        {/* COLONNE GAUCHE : PARAMETRES DU SALON PROSPECT */}
        <div
          className="sp-glass-panel"
          style={{
            padding: isMobile ? '18px 16px' : '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#059669', display: 'flex' }}>
                  <Icon.Calculator />
                </span>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                  Parametres du salon
                </h2>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', fontVariantNumeric: 'tabular-nums' }}>
                CA estime : {formatEuroFr(caEstimeMois)} / mois
              </span>
            </div>

            <input
              type="text"
              placeholder="Nom du salon prospect (optionnel, ex : Atelier Saint-Germain)..."
              value={simNomProspect}
              onChange={e => setSimNomProspect(e.target.value)}
              className="sp-sim-input"
            />
          </div>

          {/* Curseur 1 : Volume mensuel de RDV */}
          <div className="sp-glass-pill" style={{ padding: '13px 16px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>
                Volume mensuel de rendez-vous
              </span>
              <strong style={{ fontSize: '16px', fontWeight: '800', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '6px' }}>
              <span>50 (Independant)</span>
              <span>300 (Salon moyen)</span>
              <span>1 000 (Grosse equipe)</span>
            </div>
          </div>

          {/* Curseur 2 selon le mode : Nouveaux clients (Planity) OU Nb collaborateurs (Sans Caisse) */}
          {modeComparatif === 'PLANITY' ? (
            <div className="sp-glass-pill" style={{ padding: '13px 16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>
                  Nouveaux clients en ligne (ponctionnes par Planity)
                </span>
                <strong style={{ fontSize: '15px', fontWeight: '800', color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                  {simPctNouveaux} % <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sp-text-muted, #64748b)' }}>({nbNouveaux} clients / mois)</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '6px' }}>
                <span>5 % (Fidele)</span>
                <span>20 % (Moyenne du marche)</span>
                <span>50 % (En forte croissance)</span>
              </div>
            </div>
          ) : (
            <div className="sp-glass-pill" style={{ padding: '13px 16px', borderRadius: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sp-text-main, #18181b)' }}>
                  Nombre de collaborateurs au salon
                </span>
                <strong style={{ fontSize: '15px', fontWeight: '800', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                  {simNbCollaborateurs} coiffeur{simNbCollaborateurs > 1 ? 's' : ''} / barbier{simNbCollaborateurs > 1 ? 's' : ''}
                </strong>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={simNbCollaborateurs}
                onChange={e => setSimNbCollaborateurs(parseInt(e.target.value, 10))}
                className="sp-sim-range"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--sp-text-muted, #64748b)', marginTop: '6px' }}>
                <span>1 (Solo)</span>
                <span>2 a 3 (Salon classique)</span>
                <span>8 (Grand espace)</span>
              </div>
            </div>
          )}

          {/* Panier moyen */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '5px' }}>
                Panier moyen par prestation (EUR TTC)
              </label>
              <input
                type="number"
                min="15"
                max="250"
                value={simPanier}
                onChange={e => setSimPanier(parseFloat(e.target.value) || 40)}
                className="sp-sim-input"
              />
            </div>
          </div>

          {/* Selecteur des 3 forfaits STACK : Essentiel, Pro, Premium */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--sp-text-muted, #64748b)', marginBottom: '6px' }}>
              Forfait STACK propose au salon
            </label>
            <div
              className="sp-glass-pill"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                padding: '4px',
                borderRadius: '12px',
                boxSizing: 'border-box'
              }}
            >
              {Object.values(TARIFS_STACK).map(plan => {
                const actif = simPlanStack === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSimPlanStack(plan.id)}
                    style={{
                      border: actif ? '1.5px solid #10b981' : '1px solid transparent',
                      backgroundColor: actif ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                      color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                      borderRadius: '9px',
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: actif ? '800' : '700',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.14s ease'
                    }}
                  >
                    <div>{plan.label}</div>
                    <div style={{ fontSize: '11px', opacity: 0.85 }}>{plan.prix} EUR / mois</div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #64748b)', marginTop: '4px', textAlign: 'center' }}>
              {planActuel.description}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : RESULTATS DYNAMIQUES VISIBLES IMMEDIATEMENT */}
        <div
          className="sp-sim-roi-card"
          style={{
            padding: isMobile ? '20px 18px' : '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '18px'
          }}
        >
          {modeComparatif === 'PLANITY' ? (
            /* RESULTAT MODE PLANITY : ECONOMIES REALISEES */
            <>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.72)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {simNomProspect.trim() ? `Economies · ${simNomProspect.trim()}` : 'Economie annuelle directe'}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', backgroundColor: 'rgba(16, 185, 129, 0.24)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.35)' }}>
                    -{pctEco} % de charges
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isMobile ? '34px' : '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                    +{formatEuroFr(ecoAn, 0)}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#34d399' }}>
                    HT / an
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.78)', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
                  Soit <strong style={{ color: '#ffffff' }}>+{formatEuroFr(ecoMois, 2)} HT / mois</strong> economises dans la tresorerie du salon.
                </div>
              </div>

              {/* Barres comparatives animées Planity vs STACK */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px 16px', borderRadius: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px', marginBottom: '5px', gap: '8px' }}>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                      Cout actuel Planity ({planActuel.planityRef} EUR + {formatEuroFr(commPlanityMois, 0)} com. + 39 EUR TPE)
                    </span>
                    <strong style={{ color: '#fca5a5', fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>
                      {formatEuroFr(coutPlanityTotalMois, 2)} / mois
                    </strong>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.10)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', backgroundColor: 'rgba(248, 113, 113, 0.78)', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px', marginBottom: '5px', gap: '8px' }}>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>
                      Cout global STACK {planActuel.label} (0% com. + TPE T600 offert)
                    </span>
                    <strong style={{ color: '#34d399', fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>
                      {formatEuroFr(coutStackTotalMois, 2)} / mois
                    </strong>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.10)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ratioBarreStack}%`, backgroundColor: '#10b981', borderRadius: '999px', transition: 'width 0.25s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.65)', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span>Planity sur 1 an : <strong>{formatEuroFr(coutPlanityAn, 0)} HT</strong></span>
                  <span>STACK sur 1 an : <strong>{formatEuroFr(coutStackAn, 0)} HT</strong></span>
                </div>
              </div>

              {/* Equivalences financieres concretes pour convaincre le gerant */}
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                  Ce que ces economies financent chaque annee au salon
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { val: `${formatDecimalFr(moisLoyer, 1)} mois`, label: 'Loyer commercial (1 500 €)' },
                    { val: `${pairesCiseaux} paire${pairesCiseaux > 1 ? 's' : ''}`, label: 'Ciseaux Mizutani (650 €)' },
                    { val: `${bacsLavage} bac${bacsLavage > 1 ? 's' : ''}`, label: 'Bac massant neuf (2 200 €)' },
                    { val: `${formationsPro} stage${formationsPro > 1 ? 's' : ''}`, label: 'Formations equipe (800 €)' }
                  ].map((eq, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '11px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                        {eq.val}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.62)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {eq.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* RESULTAT MODE SANS LOGICIEL : CHIFFRE D AFFAIRES GAGNE */
            <>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.72)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {simNomProspect.trim() ? `Gains nets · ${simNomProspect.trim()}` : 'Chiffre d affaires net supplementaire'}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: '800', backgroundColor: 'rgba(16, 185, 129, 0.24)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.35)' }}>
                    ROI x{multiplicateurRoi}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isMobile ? '34px' : '42px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>
                    +{formatEuroFr(beneficeNetAn, 0)}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#34d399' }}>
                    NET / an
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.78)', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
                  Soit un benefice net de <strong style={{ color: '#ffffff' }}>+{formatEuroFr(beneficeNetMois, 0)} / mois</strong> apres deduction complete du forfait STACK.
                </div>
              </div>

              {/* Decomposition des 3 gains cles pour un salon sans logiciel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px 16px', borderRadius: '14px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                      No-shows eradiques (Acomptes en ligne)
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.62)' }}>
                      {nbRdvSauvesNoShow} creneaux sauves / mois grace aux acomptes et rappels SMS
                    </div>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                    +{formatEuroFr(gainNoShowMois, 0)} / mois
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                      Reservations en ligne 24h/24
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.62)' }}>
                      {nbRdvEnLigneCaptes} clients en plus / mois qui reservent le soir et le dimanche
                    </div>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                    +{formatEuroFr(gainRdvEnLigneMois, 0)} / mois
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#ffffff' }}>
                      Economie location TPE bancaire
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.62)' }}>
                      Pret gratuit du lecteur Stripe T600 (vs 39 EUR / mois a la banque)
                    </div>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>
                    +{formatEuroFr(gainTpeBancaireMois, 0)} / mois
                  </strong>
                </div>
              </div>

              {/* Bilan retour sur investissement & temps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ padding: '8px 12px', borderRadius: '11px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                    x{multiplicateurRoi} le cout
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.62)' }}>
                    Chaque euro investi rapporte {multiplicateurRoi} EUR
                  </div>
                </div>

                <div style={{ padding: '8px 12px', borderRadius: '11px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                    ~{heuresGagneesMois} h / mois
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.62)' }}>
                    Gagnees au fauteuil sans interruption
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. BANDEAU DES 3 GARANTIES MAITRESSES STACK                        */}
      {/* =================================================================== */}
      <div
        className="sp-glass-panel"
        style={{
          padding: isMobile ? '14px 16px' : '16px 24px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '12px' : '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ color: '#059669', display: 'flex', marginTop: '2px' }}>
            <Icon.Check />
          </span>
          <div>
            <strong style={{ fontSize: '13.5px', color: 'var(--sp-text-main, #18181b)' }}>
              TPE Stripe Reader T600 inclus
            </strong>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4 }}>
              0 EUR / mois de location au lieu des 39 a 55 EUR HT factures par les banques et Planity.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ color: '#059669', display: 'flex', marginTop: '2px' }}>
            <Icon.Check />
          </span>
          <div>
            <strong style={{ fontSize: '13.5px', color: 'var(--sp-text-main, #18181b)' }}>
              Mise en service a 99 EUR HT
            </strong>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4 }}>
              Import de l integralite de votre base clients, catalogue de prestations et formation sur site.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ color: '#059669', display: 'flex', marginTop: '2px' }}>
            <Icon.Check />
          </span>
          <div>
            <strong style={{ fontSize: '13.5px', color: 'var(--sp-text-main, #18181b)' }}>
              0 % de commission a vie
            </strong>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4 }}>
              Aucun prelevement sur les nouveaux clients. Votre fichier reste 100% votre propriete.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. TABLEAU COMPARATIF COMPLET CRITERE PAR CRITERE                  */}
      {/* =================================================================== */}
      <section
        className="sp-glass-panel"
        style={{
          padding: isMobile ? '16px 14px' : '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '12px'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
              {modeComparatif === 'PLANITY'
                ? `Comparatif detaille : STACK ${planActuel.label} vs Planity (${criteresAffiches.length} criteres)`
                : `Comparatif detaille : STACK ${planActuel.label} vs Salon sans logiciel (${criteresAffiches.length} criteres)`}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)' }}>
              Arguments techniques et financiers pour demontrer la superiorite de STACK
            </span>
          </div>

          <div
            className="sp-glass-pill"
            style={{
              display: 'inline-flex',
              padding: '3px',
              borderRadius: '999px',
              gap: '2px'
            }}
          >
            {[
              { id: 'TOUS', label: 'Tous' },
              { id: 'BUSINESS', label: 'Business & Finances' },
              { id: 'TECH_LEGAL', label: 'Legal & Technique' }
            ].map(f => {
              const actif = simFiltreCritere === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSimFiltreCritere(f.id)}
                  style={{
                    border: actif ? '1px solid rgba(16, 185, 129, 0.42)' : '1px solid transparent',
                    backgroundColor: actif ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
                    color: actif ? '#059669' : 'var(--sp-text-muted, #64748b)',
                    padding: '4px 11px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: actif ? '800' : '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.14s ease'
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table responsive */}
        <div style={{ width: '100%', overflowX: 'auto', boxSizing: 'border-box' }}>
          <table
            className="sp-sim-table"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left'
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1.5px solid rgba(148, 163, 184, 0.25)' }}>
                <th style={{ padding: '10px 12px', fontWeight: '800', color: 'var(--sp-text-muted, #64748b)', width: '28%' }}>
                  Critere
                </th>
                <th style={{ padding: '10px 12px', fontWeight: '800', color: '#ef4444', width: '36%' }}>
                  {modeComparatif === 'PLANITY' ? 'Planity' : 'Salon sans logiciel (Papier / Simple)'}
                </th>
                <th style={{ padding: '10px 12px', fontWeight: '800', color: '#059669', width: '36%' }}>
                  STACK ({planActuel.label})
                </th>
              </tr>
            </thead>
            <tbody>
              {criteresAffiches.map(critere => (
                <tr key={critere.id}>
                  <td style={{ padding: '14px 12px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '800', color: 'var(--sp-text-main, #18181b)' }}>
                      {critere.titre}
                    </div>
                    <span style={{ fontSize: '10.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: critere.categorie === 'BUSINESS' ? '#3b82f6' : '#8b5cf6' }}>
                      {critere.categorie === 'BUSINESS' ? 'Business' : 'Legal & Tech'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 12px', verticalAlign: 'top', backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
                    <div style={{ fontWeight: '700', color: '#b91c1c', marginBottom: '3px' }}>
                      {critere.planity}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--sp-text-muted, #64748b)', lineHeight: 1.4 }}>
                      {critere.planityDetail}
                    </div>
                  </td>

                  <td style={{ padding: '14px 12px', verticalAlign: 'top', backgroundColor: 'rgba(16, 185, 129, 0.04)' }}>
                    <div style={{ fontWeight: '800', color: '#059669', marginBottom: '3px' }}>
                      {critere.stack}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--sp-text-main, #18181b)', lineHeight: 1.4 }}>
                      {critere.stackDetail}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
