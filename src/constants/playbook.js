// src/constants/playbook.js
// Guide d'onboarding en 9 phases et reponses aux objections terrain

export const getPlaybookOnboarding = (agentCode = 'PARTNER') => [
  {
    phase: 'Phase 1',
    titre: 'Facturation 99 € & Compte',
    duree: '5 min',
    etapes: [
      { id: 'p1_1', label: 'Générer et encaisser la facture 99 € HT', tag: 'Onglet Factures' },
      { id: 'p1_2', label: `Créer le compte gérant avec le code ${agentCode}`, tag: 'Inscription' },
      { id: 'p1_3', label: 'Noter l’ID unique du salon (#ID)', tag: 'Tableau de bord' }
    ]
  },
  {
    phase: 'Phase 2',
    titre: 'Signature Légale NF525',
    duree: '3 min',
    etapes: [
      { id: 'p2_1', label: 'Présenter l’essai 30j sans engagement & le mode Hors-Ligne', tag: 'Volet 1' },
      { id: 'p2_2', label: 'Rappeler la propriété des données RGPD & conservation 6 ans', tag: 'Volets 2 & 3' },
      { id: 'p2_3', label: 'Faire signer électroniquement le Popup Légal au gérant', tag: 'Certificat SHA-256' }
    ]
  },
  {
    phase: 'Phase 3',
    titre: 'Paramètres Essentiels du Salon',
    duree: '10 min',
    etapes: [
      { id: 'p3_1', label: 'Renseigner Forme juridique, SIRET & TVA (vide si Franchise 293B)', tag: 'Identité & Légal' },
      { id: 'p3_2', label: 'Régler les horaires d’ouverture et activer la Pointeuse PIN', tag: 'Agenda & RH' },
      { id: 'p3_3', label: 'Définir le PIN Tablette Salon et activer le PIN actions sensibles', tag: 'Sécurité' },
      { id: 'p3_4', label: 'Configurer la Fidélité (Points/Tampons) & relance SMS (60j)', tag: 'Fidélité' },
      { id: 'p3_5', label: 'Ajouter le lien Google Maps & activer les notifications Push', tag: 'SMS & Alertes' },
      { id: 'p3_6', label: 'Saisir l’e-mail de l’expert-comptable et le jour d’envoi auto', tag: 'Compta & FEC' }
    ]
  },
  {
    phase: 'Phase 4',
    titre: 'Équipe, Contrats RH & Planity',
    duree: '8 min',
    etapes: [
      { id: 'p4_1', label: 'Créer les employés (PIN 4 chiffres, % primes HT, contrat 35h/39h)', tag: 'Onglet Équipe' },
      { id: 'p4_2', label: 'Montrer l’ajout d’heures supp (+/-) et la validation des congés', tag: 'Suivi RH' },
      { id: 'p4_3', label: 'Copier les liens iCal (.ics) vers Planity PRO si utilisé', tag: 'Synchro iCal' }
    ]
  },
  {
    phase: 'Phase 5',
    titre: 'Stocks, Catalogue & Académie',
    duree: '10 min',
    etapes: [
      { id: 'p5_1', label: 'Créer les produits revente/labo (Réf. 4 caract. min + stock)', tag: '1. Stocks' },
      { id: 'p5_2', label: 'Créer les prestations (Durée min + Tarif TTC)', tag: '2. Prestations' },
      { id: 'p5_3', label: 'Créer une recette Académie type (Étapes + Doses g/ml + Marge)', tag: '3. Tutoriel' }
    ]
  },
  {
    phase: 'Phase 6',
    titre: 'Connexion E-mail & Cerveau IA',
    duree: '5 min',
    etapes: [
      { id: 'p6_1', label: 'Connecter la boîte mail du salon (factures & notifications)', tag: 'Paramètres Mail' },
      { id: 'p6_2', label: 'Montrer la validation Split-Screen d’une facture fournisseur IA', tag: 'Centre d’Action' }
    ]
  },
  {
    phase: 'Phase 7',
    titre: 'Formation Caisse & Pointeuse',
    duree: '10 min',
    etapes: [
      { id: 'p7_1', label: 'Connecter la Tablette « Salon » et faire pointer une arrivée PIN', tag: 'Pointeuse' },
      { id: 'p7_2', label: 'Ouvrir un RDV Agenda et afficher son protocole Académie', tag: 'Agenda' },
      { id: 'p7_3', label: 'Simuler un encaissement (Client auto, remise, pourboire, reçu)', tag: 'Caisse' }
    ]
  },
  {
    phase: 'Phase 8',
    titre: 'Clôture Z & Liasse Comptable',
    duree: '5 min',
    etapes: [
      { id: 'p8_1', label: 'Montrer les mouvements d’espèces (dépôt banque / retrait)', tag: 'Petite Caisse' },
      { id: 'p8_2', label: 'Expliquer la Clôture Z du soir (comptage billets + PIN)', tag: 'Blind Close Z' },
      { id: 'p8_3', label: 'Montrer la signature manuscrite de la Liasse PDF & export FEC', tag: 'Bilan Mensuel' }
    ]
  },
  {
    phase: 'Phase 9',
    titre: 'Empreinte Stripe & Go-Live',
    duree: '2 min',
    etapes: [
      { id: 'p9_1', label: 'Enregistrer l’empreinte CB Stripe (0 € — 30j) & cocher les 5 verrous', tag: 'Go-Live Caisse' }
    ]
  }
];

export const OBJECTIONS_SALONS = [
  {
    q: "« C'est trop cher / J'ai un cahier papier. »",
    a: "1 seule cliente sauvée via le Winback (120 €) rembourse l'abonnement. Et le cahier papier expose à 7 500 € d'amende NF525."
  },
  {
    q: "« Je suis déjà sur Planity / Treatwell. »",
    a: "On ne remplace pas votre visibilité Planity : on s'y synchronise en iCal et on automatise vos factures IA, vos stocks et votre compta."
  },
  {
    q: "« Pourquoi payer 99 € HT d'installation ? »",
    a: "Je paramètre tout sur place maintenant (SIRET, catalogue, équipe, IA) et vous avez 30 jours d'essai 100 % gratuits derrière."
  },
  {
    q: "« Et si internet coupe le samedi ? »",
    a: "Mode Hors-Ligne natif : vous encaissez normalement et tout est scellé automatiquement dès le retour du réseau."
  }
];
