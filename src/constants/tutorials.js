// src/constants/tutorials.js
// Tutoriels video de formation pour agents terrain STACK Partners

export const DEFAULT_TUTORIALS = [
  {
    id: 'vid-1',
    duree: '4 min',
    cat: 'Démonstration Terrain',
    titre: 'Réussir sa démo Caisse & Pointeuse en 5 minutes chrono',
    desc: 'Le parcours exact à montrer au gérant : encaissement 3 clics, pointage PIN et reçu NF525.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pointsCles: ['Pointeuse PIN (0000)', 'Ticket mixte Prestation + Produit', 'Remise fidélité & Winback']
  },
  {
    id: 'vid-2',
    duree: '6 min',
    cat: 'Procédure Go-Live',
    titre: 'Réaliser un Onboarding parfait & débloquer la Checklist',
    desc: 'Accompagner le client sur le Popup Légal, saisir votre code partenaire et valider les 5 étapes.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pointsCles: ['Signature CGV / NF525', 'Saisie code partenaire', 'Déblocage des 5 verrous Go-Live']
  },
  {
    id: 'vid-3',
    duree: '5 min',
    cat: 'Argumentaire Financier',
    titre: 'Présenter l’IA Comptable & la conformité fiscale NF525',
    desc: 'Les arguments clés pour convaincre un gérant après ses 30 jours d’essai gratuit.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    pointsCles: ['Scan IA de factures en 10s', 'Clôture Blind Close (Z de caisse)', 'Export FEC mensuel en 1 clic']
  }
];
