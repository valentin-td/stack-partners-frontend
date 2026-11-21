// src/components/dashboard/TabSimulateur.jsx
// Simulateur d'Économies & Comparateur Chiffré Anti-Planity pour STACK Partners
// Outil commercial de négociation pour démontrer le ROI aux gérants de salons

import { useState } from 'react';
import { Icon } from '../common/Icons';

export default function TabSimulateur({
  isMobile,
  cardStyle,
  primaryBtn,
  secondaryBtn,
  inputStyle,
  setActiveTab,
  setProspectData,
  setShowProspectForm
}) {
  const [simRdvMois, setSimRdvMois] = useState(250);
  const [simPctNouveaux, setSimPctNouveaux] = useState(20);
  const [simPanier, setSimPanier] = useState(48);
  const [simPlanStack, setSimPlanStack] = useState('PRO'); // 'ESSENTIAL' | 'PRO'
  const [simFiltreCritere, setSimFiltreCritere] = useState('TOUS'); // 'TOUS' | 'BUSINESS' | 'TECH_LEGAL'
  const [simNomProspect, setSimNomProspect] = useState('');
  const [simCopiePitch, setSimCopiePitch] = useState(false);

  // Calculs financiers
  const nbNouveaux = Math.round(simRdvMois * (simPctNouveaux / 100));
  const commPlanityMois = nbNouveaux * 2.90; // 2,90 € HT par nouveau client en moyenne
  const fixePlanityMois = 269.00; // 269 € HT / mois abonnement salon avec prise de RDV
  const coutPlanityMois = fixePlanityMois + commPlanityMois;
  const coutPlanityAn = coutPlanityMois * 12;

  const coutStackMois = simPlanStack === 'ESSENTIAL' ? 39.00 : 69.00;
  const coutStackAn = coutStackMois * 12;

  const ecoMois = Math.max(0, coutPlanityMois - coutStackMois);
  const ecoAn = ecoMois * 12;
  const eco3Ans = ecoAn * 3;
  const pctEco = coutPlanityMois > 0 ? Math.round((ecoMois / coutPlanityMois) * 100) : 0;

  // Equivalences metier salon
  const pairesCiseaux = Math.max(1, Math.floor(ecoAn / 650));
  const moisLoyer = Number((ecoAn / 1500).toFixed(1));
  const bacsLavage = Math.max(1, Math.floor(ecoAn / 2200));
  const formationsPro = Math.max(1, Math.floor(ecoAn / 800));

  const criteresComparatifs = [
    {
      id: 'commissions',
      categorie: 'BUSINESS',
      titre: 'Commissions sur nouveaux clients',
      planity: '2,50 € à 5,90 € HT par nouveau client',
      planityDetail: `Soit ${commPlanityMois.toFixed(2)} € HT / mois de ponction directe sur votre travail`,
      stack: '0,00 € à vie (0 % de commission)',
      stackDetail: '100% du chiffre d affaires reste à la disposition exclusive du salon',
      avantage: 'Fin définitive des pénalités financières sur votre propre croissance'
    },
    {
      id: 'engagement',
      categorie: 'BUSINESS',
      titre: 'Engagement contractuel',
      planity: '12 à 24 mois fermes obligatoires',
      planityDetail: 'Reconduction tacite, préavis contraignant et pénalités de sortie',
      stack: '100% sans engagement',
      stackDetail: 'Résiliation libre en 1 clic à tout moment, sans aucun frais de sortie',
      avantage: 'Vous restez par choix et satisfaction, jamais par contrainte juridique'
    },
    {
      id: 'fichier_client',
      categorie: 'TECH_LEGAL',
      titre: 'Propriété du fichier client (RGPD)',
      planity: 'Capté dans leur annuaire centralisé',
      planityDetail: 'Vos clients deviennent les utilisateurs de Planity, soumis à leurs communications',
      stack: 'Propriété 100% exclusive et souveraine du salon',
      stackDetail: 'Base hermétique, vos données ne sont jamais partagées ni exploitées pour des tiers',
      avantage: 'Votre clientèle est et restera toujours votre propre patrimoine commercial'
    },
    {
      id: 'concurrence',
      categorie: 'BUSINESS',
      titre: 'Mise en avant des salons concurrents',
      planity: 'Concurrents du quartier systématiquement affichés',
      planityDetail: 'Lorsqu un client cherche un créneau, Planity suggère les autres salons voisins',
      stack: 'Zéro concurrence (Marque Blanche)',
      stackDetail: 'Page de réservation élégante et dédiée à 100% à l identité unique de votre salon',
      avantage: 'Aucune fuite de vos clients vers les salons concurrents du quartier'
    },
    {
      id: 'caisse_nf525',
      categorie: 'TECH_LEGAL',
      titre: 'Caisse certifiée légale NF525 conforme DGFiP',
      planity: 'Module externe ou surcoût partenaire',
      planityDetail: 'Nécessite souvent un logiciel de caisse additionnel à 40 € à 80 € / mois',
      stack: 'Caisse NF525 nativement scellée SHA-256',
      stackDetail: 'Journal JET inviolable, clôtures Z automatiques et exports FEC inclus sans surcoût',
      avantage: 'Tranquillité fiscale absolue sans double abonnement logiciel'
    },
    {
      id: 'parrainage',
      categorie: 'BUSINESS',
      titre: 'Acquisition locale & Parrainage viral B2C',
      planity: 'Inexistant',
      planityDetail: 'Pour acquérir des clients, vous devez payer les commissions Planity',
      stack: 'Programme de parrainage client intégré',
      stackDetail: 'Vos clients ambassadeurs partagent leur lien unique en 1 clic sur WhatsApp et SMS',
      avantage: 'Bouche-à-oreille local décuplé sans budget publicitaire'
    },
    {
      id: 'tpe',
      categorie: 'TECH_LEGAL',
      titre: 'Terminal de paiement physique (TPE)',
      planity: 'Location bancaire classique contraignante',
      planityDetail: '35 € à 55 € / mois facturés par votre banque sur 36 à 48 mois d engagement',
      stack: 'Stripe Reader T600 nouvelle génération',
      stackDetail: 'Écran tactile couleur client, pourboires digitalisés et sans location bancaire',
      avantage: 'Modernité au comptoir et fin des rentes bancaires mensuelles'
    },
    {
      id: 'acomptes',
      categorie: 'TECH_LEGAL',
      titre: 'Protection Anti-No-Show & Acomptes',
      planity: 'Gestion rigide et standardisée',
      planityDetail: 'Conditions imposées peu souples pour la réalité quotidienne du salon',
      stack: 'Acomptes en ligne paramétrables par soin',
      stackDetail: 'Règle 24h automatisée : conversion en Avoir client ou conservation par le salon',
      avantage: 'Suppression définitive des rendez-vous non honorés et trésorerie sécurisée'
    },
    {
      id: 'sms',
      categorie: 'BUSINESS',
      titre: 'SMS transactionnels & Marketing direct',
      planity: 'Packs de SMS à prix élevé avec forte marge',
      planityDetail: 'Surcoût important pour les rappels de rendez-vous et campagnes personnalisées',
      stack: 'SMS au prix coûtant direct sans marge',
      stackDetail: 'Norme GSM éco directe avec nom de votre salon en émetteur officiel',
      avantage: 'Budget communication réduit au coût réel des opérateurs télécoms'
    },
    {
      id: 'relation_humaine',
      categorie: 'BUSINESS',
      titre: 'Accompagnement & Présence de proximité',
      planity: 'Plateforme téléphonique impersonnelle',
      planityDetail: 'Interlocuteurs changeants et temps d attente réguliers au standard',
      stack: 'Conseiller commercial partenaire dédié sur votre secteur',
      stackDetail: 'Accompagnement humain personnalisé, installation sur site et hotline directe',
      avantage: 'Un vrai partenaire de confiance qui connaît personnellement votre équipe'
    }
  ];

  const criteresFiltres = criteresComparatifs.filter(c => {
    if (simFiltreCritere === 'BUSINESS') return c.categorie === 'BUSINESS';
    if (simFiltreCritere === 'TECH_LEGAL') return c.categorie === 'TECH_LEGAL';
    return true;
  });

  const copierPitch = () => {
    const nom = simNomProspect.trim() || 'votre salon';
    const texte = `SYNTHESE COMPARATIVE STACK vs PLANITY (${nom.toUpperCase()}) :
Volume salon : ${simRdvMois} RDV / mois (dont ${nbNouveaux} nouveaux clients)
Coût actuel estimé Planity : ${coutPlanityMois.toFixed(2)} EUR HT / mois (269 EUR fixe + ${commPlanityMois.toFixed(2)} EUR de commissions)
Coût STACK (${simPlanStack === 'ESSENTIAL' ? 'Essentiel 39 EUR' : 'Pro 69 EUR'} HT / mois) : ${coutStackMois.toFixed(2)} EUR HT / mois (0 EUR de commission)

VOS GAINS DIRECTS :
- Economie nette mensuelle : +${ecoMois.toFixed(2)} EUR HT / mois
- Economie nette annuelle : +${ecoAn.toFixed(2)} EUR HT / an (+${eco3Ans.toFixed(0)} EUR sur 3 ans)
- Baisse immediate de vos frais logiciels : -${pctEco} %

EQUIVALENCES METIER CONCRETES :
- ${pairesCiseaux} paires de ciseaux japonais Mizutani haut de gamme
- ${moisLoyer} mois de loyer commercial autofinances
- ${bacsLavage} bacs de lavage massants neufs

AVANTAGES CLES STACK :
- 0,00 EUR de commission a vie sur vos clients
- 100% sans engagement (resiliable a tout moment)
- 100% propriete exclusive de votre fichier client (aucune concurrence dans votre quartier)
- Caisse certifiee NF525 et scellement SHA-256 inclus sans surcout.`;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* EN-TETE DE SECTION */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', margin: '0', letterSpacing: '-0.02em', color: 'var(--sp-text-main, #111827)' }}>
              Simulateur & Comparateur Anti-Planity
            </h1>
            <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.28)' }}>
              Argumentaire Commercial
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'var(--sp-text-muted, #6b7280)' }}>
            Démontrez instantanément au gérant ses milliers d euros d économies annuelles et la supériorité opérationnelle de STACK.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={copierPitch}
            style={{ ...secondaryBtn, padding: '10px 16px', fontSize: '13px' }}
          >
            <Icon.Check /> {simCopiePitch ? 'Pitch copié !' : 'Copier le pitch commercial'}
          </button>
          <button
            type="button"
            onClick={basculerVersNouveauProspect}
            style={{ ...primaryBtn, padding: '10px 16px', fontSize: '13px' }}
          >
            <Icon.Plus /> Créer le prospect avec ce calcul
          </button>
        </div>
      </div>

      {/* BARRE PERSONNALISATION PROSPECT */}
      <div style={{ ...cardStyle, padding: '16px 20px', marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Icon.User />
          <input
            type="text"
            placeholder="Nom du salon prospect (ex: Atelier Saint-Germain)..."
            value={simNomProspect}
            onChange={e => setSimNomProspect(e.target.value)}
            style={{ ...inputStyle, padding: '8px 14px', fontSize: '13.5px' }}
          />
        </div>
        <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #6b7280)' }}>
          {simNomProspect ? `Simulation pour ${simNomProspect}` : 'Simulation standard salon'}
        </span>
      </div>

      {/* BLOC PRINCIPAL : SLIDERS INTERACTIFS & PARAMETRES DU SALON */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--sp-btn-primary, #111827)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Calculator />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--sp-text-main, #111827)' }}>
              Paramètres d activité du salon prospect
            </h2>
            <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #6b7280)' }}>
              Ajustez les curseurs selon le volume déclaré par le coiffeur pour calculer le ROI instantané.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '18px' : '24px' }}>
          {/* Curseur 1 : RDV mensuels */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(148, 163, 184, 0.08)', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sp-text-main, #111827)' }}>
                Volume mensuel de rendez-vous
              </span>
              <strong style={{ fontSize: '16px', fontWeight: '800', color: 'var(--sp-text-main, #111827)', fontVariantNumeric: 'tabular-nums' }}>
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
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--sp-text-muted, #9ca3af)', marginTop: '4px' }}>
              <span>50 RDV (Indépendant)</span>
              <span>500 RDV (Salon moyen)</span>
              <span>1 000 RDV (Grosse équipe)</span>
            </div>
          </div>

          {/* Curseur 2 : Part de nouveaux clients */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(148, 163, 184, 0.08)', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sp-text-main, #111827)' }}>
                Part de nouveaux clients (Commissions Planity)
              </span>
              <strong style={{ fontSize: '16px', fontWeight: '800', color: '#dc2626', fontVariantNumeric: 'tabular-nums' }}>
                {simPctNouveaux} % ({nbNouveaux} clients / mois)
              </strong>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={simPctNouveaux}
              onChange={e => setSimPctNouveaux(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#dc2626', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--sp-text-muted, #9ca3af)', marginTop: '4px' }}>
              <span>5% (Clientèle très fidèle)</span>
              <span>20% (Moyenne observée)</span>
              <span>50% (Salon récent)</span>
            </div>
          </div>

          {/* Paramètre 3 : Panier moyen */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(148, 163, 184, 0.08)', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--sp-text-main, #111827)', marginBottom: '6px' }}>
              Panier moyen du salon (€ TTC)
            </label>
            <input
              type="number"
              min="15"
              max="250"
              value={simPanier}
              onChange={e => setSimPanier(parseFloat(e.target.value) || 45)}
              style={inputStyle}
            />
            <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--sp-text-muted, #6b7280)', marginTop: '6px' }}>
              Chiffre d affaires mensuel estimé : {(simRdvMois * simPanier).toLocaleString('fr-FR')} € TTC
            </span>
          </div>

          {/* Paramètre 4 : Choix du Forfait STACK */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(148, 163, 184, 0.08)', borderRadius: '14px', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--sp-text-main, #111827)', marginBottom: '6px' }}>
              Forfait STACK proposé
            </label>
            <select
              value={simPlanStack}
              onChange={e => setSimPlanStack(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="PRO">STACK Pro (69 € HT / mois) - Caisse NF525 + RDV + Promos</option>
              <option value="ESSENTIAL">STACK Essentiel (39 € HT / mois) - Caisse NF525 + RDV</option>
            </select>
            <span style={{ display: 'block', fontSize: '11.5px', color: '#059669', fontWeight: '600', marginTop: '6px' }}>
              0,00 € de commission sur les nouveaux clients • 100% sans engagement
            </span>
          </div>
        </div>
      </div>

      {/* CARTOUCHES DE KPIS CLES D ECONOMIES */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '14px' }}>
        {/* 1. Coût Planity */}
        <div style={{ ...cardStyle, padding: '20px', marginBottom: 0, backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.28)' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: '#991b1b', letterSpacing: '0.04em' }}>
            Coût mensuel Planity
          </span>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#b91c1c', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
            {coutPlanityMois.toFixed(2)} € HT
          </div>
          <span style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', display: 'block' }}>
            269 € fixe + {commPlanityMois.toFixed(2)} € com.
          </span>
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(220,38,38,0.2)', fontSize: '11px', color: '#991b1b' }}>
            Soit {coutPlanityAn.toFixed(0)} € HT prélevés par an
          </div>
        </div>

        {/* 2. Coût STACK */}
        <div style={{ ...cardStyle, padding: '20px', marginBottom: 0, backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.28)' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: '#166534', letterSpacing: '0.04em' }}>
            Coût mensuel STACK
          </span>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#15803d', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
            {coutStackMois.toFixed(2)} € HT
          </div>
          <span style={{ fontSize: '12px', color: '#14532d', marginTop: '4px', display: 'block' }}>
            0,00 € commission • Tout inclus
          </span>
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(22,101,52,0.2)', fontSize: '11px', color: '#166534' }}>
            Soit {coutStackAn.toFixed(0)} € HT seulement par an
          </div>
        </div>

        {/* 3. Économie Annuelle */}
        <div style={{ ...cardStyle, padding: '20px', marginBottom: 0, backgroundColor: '#111827', color: '#ffffff', border: '1px solid #111827' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.04em' }}>
              Économie nette / an
            </span>
            <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: '#10b981', color: '#ffffff', padding: '2px 8px', borderRadius: '999px' }}>
              -{pctEco} %
            </span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#34d399', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
            +{ecoAn.toFixed(2)} € HT
          </div>
          <span style={{ fontSize: '12px', color: '#d1d5db', marginTop: '4px', display: 'block' }}>
            +{ecoMois.toFixed(2)} € HT de gain chaque mois
          </span>
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '11px', color: '#9ca3af' }}>
            Cumul 3 ans : +{eco3Ans.toFixed(0)} € HT dans la poche
          </div>
        </div>

        {/* 4. Équivalence Loyer */}
        <div style={{ ...cardStyle, padding: '20px', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--sp-text-muted, #6b7280)', letterSpacing: '0.04em' }}>
              Équivalence Loyer
            </span>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--sp-text-main, #111827)', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              {moisLoyer} mois
            </div>
            <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #4b5563)', marginTop: '4px', display: 'block' }}>
              de loyer commercial autofinancé
            </span>
          </div>
          <button
            type="button"
            onClick={copierPitch}
            style={{ ...secondaryBtn, width: '100%', marginTop: '12px', padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
          >
            <Icon.Check /> {simCopiePitch ? 'Copié' : 'Copier'}
          </button>
        </div>
      </div>

      {/* EQUIVALENCES CONCRETES METIER */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--sp-text-main, #111827)' }}>
          Ce que cette économie ({ecoAn.toFixed(0)} € HT / an) permet de financer dans le salon :
        </h3>
        <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #6b7280)', display: 'block', marginBottom: '16px' }}>
          Arguments visuels à présenter au coiffeur pour matérialiser le gaspillage financier annuel causé par Planity.
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sp-text-main, #111827)' }}>{pairesCiseaux} paires</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sp-text-main, #374151)', marginTop: '4px' }}>Ciseaux japonais Mizutani</div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #9ca3af)', marginTop: '2px' }}>Modèles précision haut de gamme (valeur 650 €)</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sp-text-main, #111827)' }}>{moisLoyer} mois</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sp-text-main, #374151)', marginTop: '4px' }}>Loyer commercial</div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #9ca3af)', marginTop: '2px' }}>Autofinancé sur la base de 1 500 € / mois</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sp-text-main, #111827)' }}>{bacsLavage} bac{bacsLavage > 1 ? 's' : ''}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sp-text-main, #374151)', marginTop: '4px' }}>Bacs de lavage neufs</div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #9ca3af)', marginTop: '2px' }}>Postes massants shiatsu (valeur 2 200 €)</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.18)' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--sp-text-main, #111827)' }}>{formationsPro} session{formationsPro > 1 ? 's' : ''}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--sp-text-main, #374151)', marginTop: '4px' }}>Formations équipe</div>
            <div style={{ fontSize: '11px', color: 'var(--sp-text-muted, #9ca3af)', marginTop: '2px' }}>Stages techniques balayage & coupe pro (800 €)</div>
          </div>
        </div>
      </div>

      {/* GRAND TABLEAU COMPARATIF DETAILLE : STACK vs PLANITY */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--sp-text-main, #111827)' }}>
              Comparatif Avancé : STACK vs Planity
            </h2>
            <span style={{ fontSize: '12.5px', color: 'var(--sp-text-muted, #6b7280)' }}>
              10 critères déterminants où STACK protège les intérêts et la rentabilité du salon.
            </span>
          </div>

          {/* Filtres de catégorie */}
          <div style={{ display: 'inline-flex', padding: '3px', borderRadius: '999px', backgroundColor: 'rgba(148, 163, 184, 0.15)', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setSimFiltreCritere('TOUS')}
              style={{
                padding: '6px 12px', borderRadius: '999px', border: 'none', fontSize: '12px', fontWeight: simFiltreCritere === 'TOUS' ? '700' : '500',
                backgroundColor: simFiltreCritere === 'TOUS' ? 'var(--sp-btn-primary, #111827)' : 'transparent', color: simFiltreCritere === 'TOUS' ? '#ffffff' : 'var(--sp-text-muted, #6b7280)', cursor: 'pointer'
              }}
            >
              Tous les critères ({criteresComparatifs.length})
            </button>
            <button
              type="button"
              onClick={() => setSimFiltreCritere('BUSINESS')}
              style={{
                padding: '6px 12px', borderRadius: '999px', border: 'none', fontSize: '12px', fontWeight: simFiltreCritere === 'BUSINESS' ? '700' : '500',
                backgroundColor: simFiltreCritere === 'BUSINESS' ? 'var(--sp-btn-primary, #111827)' : 'transparent', color: simFiltreCritere === 'BUSINESS' ? '#ffffff' : 'var(--sp-text-muted, #6b7280)', cursor: 'pointer'
              }}
            >
              Business & Liberté
            </button>
            <button
              type="button"
              onClick={() => setSimFiltreCritere('TECH_LEGAL')}
              style={{
                padding: '6px 12px', borderRadius: '999px', border: 'none', fontSize: '12px', fontWeight: simFiltreCritere === 'TECH_LEGAL' ? '700' : '500',
                backgroundColor: simFiltreCritere === 'TECH_LEGAL' ? 'var(--sp-btn-primary, #111827)' : 'transparent', color: simFiltreCritere === 'TECH_LEGAL' ? '#ffffff' : 'var(--sp-text-muted, #6b7280)', cursor: 'pointer'
              }}
            >
              Technique & Légal
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(148, 163, 184, 0.25)', backgroundColor: 'rgba(148, 163, 184, 0.06)' }}>
                <th style={{ padding: '14px 16px', color: 'var(--sp-text-main, #374151)', fontWeight: '700', width: '28%' }}>Critère déterminant</th>
                <th style={{ padding: '14px 16px', color: '#b91c1c', fontWeight: '700', width: '32%' }}>Planity</th>
                <th style={{ padding: '14px 16px', color: '#047857', fontWeight: '800', width: '40%' }}>STACK (Avantage Salon)</th>
              </tr>
            </thead>
            <tbody>
              {criteresFiltres.map((c, idx) => (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(148, 163, 184, 0.03)'
                  }}
                >
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '700', color: 'var(--sp-text-main, #111827)', fontSize: '13.5px' }}>
                      {c.titre}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '10.5px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(148, 163, 184, 0.12)', color: 'var(--sp-text-muted, #6b7280)' }}>
                      {c.categorie === 'BUSINESS' ? 'Modèle Financier' : 'Technique & Légal'}
                    </span>
                  </td>

                  <td style={{ padding: '16px', verticalAlign: 'top', backgroundColor: 'rgba(254, 242, 242, 0.45)' }}>
                    <div style={{ fontWeight: '700', color: '#b91c1c', fontSize: '13px' }}>
                      {c.planity}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px', lineHeight: 1.4 }}>
                      {c.planityDetail}
                    </div>
                  </td>

                  <td style={{ padding: '16px', verticalAlign: 'top', backgroundColor: 'rgba(240, 253, 244, 0.50)' }}>
                    <div style={{ fontWeight: '800', color: '#065f46', fontSize: '13.5px' }}>
                      {c.stack}
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px', lineHeight: 1.4 }}>
                      {c.stackDetail}
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '600', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon.Check />
                      {c.avantage}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* NOTE DE BAS DE TABLEAU */}
        <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(148, 163, 184, 0.08)', border: '1px solid rgba(148, 163, 184, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--sp-text-muted, #6b7280)' }}>
            Calculs établis sur la base des grilles tarifaires et conditions contractuelles publiques constatées (forfait salon avec prise de RDV à 269 € HT/mois + commissions nouveaux clients à 2,90 € HT).
          </span>
          <button
            type="button"
            onClick={basculerVersNouveauProspect}
            style={{ ...primaryBtn, padding: '8px 14px', fontSize: '12px' }}
          >
            Enregistrer ce salon prospect ›
          </button>
        </div>
      </div>
    </div>
  );
}
