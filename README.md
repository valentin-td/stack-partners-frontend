# STACK Partners Frontend

Portail B2B officiel pour les agents commerciaux et apporteurs d'affaires de la solution logicielle STACK.

## Architecture

- **Stack technique** : React 18, Vite 5, JavaScript (ESModules).
- **Style & Design System** : Thème Verre Cristal & Aurora, responsive mobile/desktop sans lag.
- **Connexion API** : `src/api/partnersApi.js` vers le backend central STACK (`/api/partners/*`).

## Fonctionnalités Principales

1. **Tableau de bord & Commissions** (`TabBord.jsx`) :
   - Suivi en temps réel des salons affiliés (période d'essai, actifs payants).
   - Déblocage du récurrent (palier de 3 salons actifs).
   - Suivi des commissions de 20 % HT pendant 24 mois.
2. **Gestion des Prospects & Leads** (`TabProspects.jsx`) :
   - Enregistrement des salons cibles, verrouillage territorial et statut de négociation.
3. **Carte GPS & Tournées** (`TabCarte.jsx`) :
   - Cartographie des établissements de coiffure et beauté, optimisation des itinéraires de prospection.
4. **Facturation de mise en service** (`TabFactures.jsx`) :
   - Génération des factures d'installation (99 EUR HT), envoi direct par e-mail et validation du règlement.
5. **Logistique & Matériel TPE** (`TabStock.jsx`) :
   - Choix du matériel d'encaissement Stripe Terminal :
     - **Stripe Reader T600** : terminal de comptoir tactile 8 pouces avec pourboires dynamiques.
     - **Stripe Reader S700** : terminal mobile tout-en-un avec imprimante thermique intégrée.
   - Commande directe de terminaux tampon et suivi d'expédition.
   - Protocole logistique intégré.
6. **Dossier de Conformité KYC & Signature Électronique** (`TabProfil.jsx`, `ModalSignatureContrat.jsx`) :
   - **Étape 1** : Signature électronique native du contrat de mandat commercial (Articles L.134-1+ Code de commerce) conforme eIDAS et Code civil art. 1366 & 1367 avec pavé manuscrit canvas, horodatage certifié UTC, adresse IP et empreinte SHA-256. Téléchargement instantané du contrat scellé en PDF.
   - **Étape 2** : Justificatif d'identité et immatriculation RSAC (Registre Spécial des Agents Commerciaux).
   - **Étape 3** : Attestation de vigilance URSSAF semestrielle.
   - **Étape 4** : Attestation d'assurance RC Professionnelle et IBAN de règlement.
   - **Étape 5** : Formation certifiée NF525 et validation du quiz métier.
7. **Académie & Tutos** (`TabAcademie.jsx`) :
   - Vidéos et fiches pratiques de formation terrain.
8. **God Mode Super-Admin** (`TabGodMode.jsx`) :
   - Pilotage des agents, validation unitaire des pièces justificatives et expédition du matériel.

## Commandes

```bash
# Installation des dépendances
npm install

# Lancement en développement local
npm run dev

# Compilation de production
npm run build
```
