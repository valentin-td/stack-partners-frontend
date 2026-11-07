# 📋 Inventaire des Fonctionnalités — STACK Partners Frontend

> **Inventaire fonctionnel exhaustif et fiches de dépendance**  
> *Dernière mise à jour : 07/11/2026*  
> *Dépôt : `https://github.com/valentin-td/stack-partners-frontend.git`*

---

## Sommaire des Fonctionnalités

1. [Authentification, Inscription & Sécurité Agent](#1-authentification-inscription--sécurité-agent)
2. [Tableau de Bord Exécutif & KPIs Partenaires](#2-tableau-de-bord-exécutif--kpis-partenaires)
3. [Lien d'Affiliation & Tracking Commercial](#3-lien-daffiliation--tracking-commercial)
4. [Simulateur Sandbox & Démo en Direct (SSO)](#4-simulateur-sandbox--démo-en-direct-sso)
5. [Pipeline Commercial & Gestion des Prospects](#5-pipeline-commercial--gestion-des-prospects)
6. [Onboarding d'un Prospect en Salon STACK Actif](#6-onboarding-dun-prospect-en-salon-stack-actif)
7. [Cartographie Interactive des Salons Cibles (Leaflet)](#7-cartographie-interactive-des-salons-cibles-leaflet)
8. [Géocodage d'Adresses (API data.gouv.fr)](#8-géocodage-dadresses-api-datagouvfr)
9. [Optimisation Algorithmique d'Itinéraire de Tournée](#9-optimisation-algorithmique-ditinéraire-de-tournée)
10. [Consignation des Comptes-Rendus de Visites Terrain](#10-consignation-des-comptes-rendus-de-visites-terrain)
11. [Facturation des Commissions d'Onboarding & Téléchargement PDF](#11-facturation-des-commissions-donboarding--téléchargement-pdf)
12. [Gestion du Stock Matériel TPE (WisePad 3)](#12-gestion-du-stock-matériel-tpe-wisepad-3)
13. [Commandes de Réassort de Terminaux TPE](#13-commandes-de-réassort-de-terminaux-tpe)
14. [Académie Commerciale & Argumentaires de Vente](#14-académie-commerciale--argumentaires-de-vente)
15. [Profil Légal Agent, SIRET, RSAC & IBAN](#15-profil-légal-agent-siret-rsac--iban)
16. [Signature Électronique du Mandat Commercial (Yousign)](#16-signature-électronique-du-mandat-commercial-yousign)
17. [Stockage Sécurisé des Pièces KYC sur Cloudflare R2](#17-stockage-sécurisé-des-pièces-kyc-sur-cloudflare-r2)
18. [Super-Administration (God Mode) & Audit Central](#18-super-administration-god-mode--audit-central)
19. [Validation des Dossiers Agents & Déblocage des Commissions](#19-validation-des-dossiers-agents--déblocage-des-commissions)

---

## 1. Authentification, Inscription & Sécurité Agent
- **Composant** : `src/Auth.jsx`.
- **Endpoints** : `POST /api/partners/auth/login`, `POST /api/partners/auth/register`, `POST /api/partners/auth/forgot-password`, `POST /api/partners/auth/reset-password`.
- **Rôle** : Connexion par email / mot de passe, création de compte agent commercial avec recueil du SIRET et du numéro RSAC, génération automatique du code partenaire unique (`PARTNER-XXX-XXXX`), réinitialisation de mot de passe par jeton sécurisé.
- **Stockage** : `partner_token` et `partner_data` enregistrés dans `localStorage`.

---

## 2. Tableau de Bord Exécutif & KPIs Partenaires
- **Composant** : `src/Dashboard.jsx` (onglet `'bord'`).
- **Endpoint** : `GET /api/partners/dashboard-stats`.
- **Rôle** : Synthèse de performance financière de l'agent :
  - Total des commissions perçues à date (€).
  - Commissions en attente de validation ou de paiement (€).
  - Nombre total de salons démarchés, en cours et convertis.
  - Taux de transformation commercial.

---

## 3. Lien d'Affiliation & Tracking Commercial
- **Composant** : `src/Dashboard.jsx` (widget dans `'bord'`).
- **Rôle** : Génération en un clic du lien d'affiliation personnalisé :
  `https://app-salon-caiss.onrender.com/?partner=PARTNER-XXX`
- **Mécanisme** : Copie dans le presse-papier avec feedback visuel. Lorsque le salon ouvre ce lien, son inscription est irréversiblement attachée à l'agent dans `configuration_salon.id_agent_apporteur`.

---

## 4. Simulateur Sandbox & Démo en Direct (SSO)
- **Composant** : `src/Dashboard.jsx` (modale de simulation démo).
- **Endpoint** : `POST /api/partners/sandbox/launch`.
- **Rôle** : Permet à l'agent en rendez-vous de créer instantanément un salon fictif ultra-réaliste (catalogue complet, collaborateurs, planning peuplé) et d'ouvrir directement STACK Pro dans un nouvel onglet avec un jeton `sandbox_token`.
- **Bypass Légal** : Neutralise automatiquement l'étape bloquante des CGV pour une démonstration fluide et immédiate des fonctionnalités de caisse NF525.

---

## 5. Pipeline Commercial & Gestion des Prospects
- **Composant** : `src/Dashboard.jsx` (onglet `'prospects'`).
- **Endpoints** : `GET /api/partners/prospects`, `POST /api/partners/prospects`.
- **Rôle** : Suivi des étapes du cycle de vente :
  - Statuts : *Nouveau*, *Contacté*, *Démo effectuée*, *Contrat envoyé*, *Signé / Onboardé*, *Perdu*.
  - Enregistrement des coordonnées (nom du salon, gérant, téléphone, adresse, date du dernier contact, notes).

---

## 6. Onboarding d'un Prospect en Salon STACK Actif
- **Composant** : `src/Dashboard.jsx` (action `'Lancer onboarding'`).
- **Endpoint** : `POST /api/partners/prospects/:id/onboarding`.
- **Rôle** : Conversion d'un prospect qualifié en salon officiel STACK. Crée le compte gérant, initialise la configuration de caisse et pré-remplit les informations légales.

---

## 7. Cartographie Interactive des Salons Cibles (Leaflet)
- **Composant** : `src/Dashboard.jsx` (onglet `'carte'`).
- **Endpoint** : `GET /api/partners/map-salons?lat=...&lng=...&radius=...`.
- **Technologie** : Leaflet.js chargé dynamiquement avec tuiles OpenStreetMap.
- **Rôle** : Visualisation géospatiale des salons de coiffure et barbiers dans un rayon configurable (1 km à 50 km) autour d'une position.
- **Marqueurs & Filtres** : Différenciation visuelle entre salons visités et non-visités, popups détaillés avec actions directes (appeler, créer prospect, consigner une visite).

---

## 8. Géocodage d'Adresses (API data.gouv.fr)
- **Composant** : `src/Dashboard.jsx`.
- **Endpoint externe** : `https://api-adresse.data.gouv.fr/search/?q=...&limit=1`.
- **Rôle** : Autocomplétion et géocodage haute précision des adresses en France sans clé d'API payante. Transforme n'importe quel libellé en coordonnées latitude / longitude.

---

## 9. Optimisation Algorithmique d'Itinéraire de Tournée
- **Composant** : `src/Dashboard.jsx` (outil `'Optimiser la tournée'`).
- **Endpoint** : `POST /api/partners/tournee/optimiser`.
- **Rôle** : À partir d'une sélection de prospects à visiter dans la journée, calcule l'ordonnancement optimal des étapes (résolution du problème du voyageur de commerce) afin de minimiser le temps de trajet en voiture.

---

## 10. Consignation des Comptes-Rendus de Visites Terrain
- **Composant** : `src/Dashboard.jsx` (formulaire popup sur la carte).
- **Endpoint** : `POST /api/partners/visites`.
- **Rôle** : Enregistrement immédiat post-rendez-vous : interlocuteur rencontré, intérêt manifesté, objections éventuelles, prochaine action programmée.

---

## 11. Facturation des Commissions d'Onboarding & Téléchargement PDF
- **Composant** : `src/Dashboard.jsx` (onglet `'factures'`).
- **Endpoints** : `GET /api/partners/factures`, `POST /api/partners/factures`, `GET /api/partners/factures/:id/pdf`, `POST /api/partners/factures/:id/send-email`, `PATCH /api/partners/factures/:id/payee`.
- **Rôle** : Émission et archivage des factures de commission d'apporteur d'affaires. Téléchargement direct au format PDF vectoriel conforme aux mentions légales B2B (Art. L. 441-9 du Code de commerce).

---

## 12. Gestion du Stock Matériel TPE (WisePad 3)
- **Composant** : `src/Dashboard.jsx` (onglet `'stock'`).
- **Endpoint** : `GET /api/partners/tpe-stock`.
- **Rôle** : Suivi des terminaux de paiement physiques détenus par l'agent. Affichage des numéros de série, de l'état du matériel (neuf, attribué, en transit) et historique des remises en main propre aux salons.

---

## 13. Commandes de Réassort de Terminaux TPE
- **Composant** : `src/Dashboard.jsx` (action `'Commander des TPE'`).
- **Endpoint** : `POST /api/partners/tpe-stock/commander`.
- **Rôle** : Demande de réapprovisionnement en terminaux physiques auprès du siège STACK pour anticiper les futurs onboardings.

---

## 14. Académie Commerciale & Argumentaires de Vente
- **Composant** : `src/Dashboard.jsx` (onglet `'academie'`).
- **Rôle** : Base de connaissances commerciale :
  - Pitch d'accroche 30 secondes pour gérants pressés.
  - Tableau comparatif concurrentiel : STACK vs Planity vs Treatwell vs Fresha.
  - Grille tarifaire détaillée et calcul du ROI pour le salon (absence de commissions abusives par RDV).
  - Réponses types aux objections (engagement, changement de matériel, habitudes de caisse).

---

## 15. Profil Légal Agent, SIRET, RSAC & IBAN
- **Composant** : `src/Dashboard.jsx` (onglet `'profil'`).
- **Endpoints** : `GET /api/partners/profil`, `PUT /api/partners/profil/etape`.
- **Rôle** : Dossier juridique de l'agent : coordonnées fiscales, SIRET d'indépendant, immatriculation au RSAC, RIB pour le versement des commissions.

---

## 16. Signature Électronique du Mandat Commercial (Yousign)
- **Composant** : `src/Dashboard.jsx` (tunnel de signature Yousign).
- **Endpoints** : `POST /api/partners/profil/yousign/initiate`, `GET /api/partners/profil/yousign/check`.
- **Rôle** : Déclenchement de la procédure de signature électronique du contrat d'agent commercial via l'API Yousign. Réception du webhook et scellement du document d'habilitation.

---

## 17. Stockage Sécurisé des Pièces KYC sur Cloudflare R2
- **Composant** : `src/Dashboard.jsx` (upload multipart).
- **Endpoint** : `GET /api/partners/documents/r2/:agentId/:fileName`.
- **Rôle** : Téléversement et archivage hautement sécurisé des pièces d'identité, extrait KBIS et attestation d'assurance RC Pro sur le bucket Cloudflare R2 souverain.

---

## 18. Super-Administration (God Mode) & Audit Central
- **Composant** : `src/Dashboard.jsx` (onglet `'godmode'`).
- **Endpoints** : `GET /api/partners/admin/agents`, `GET /api/partners/admin/commissions`, `GET /api/partners/admin/market-stats`, `GET /api/partners/admin/tpe-commandes`.
- **Rôle** : Vue de contrôle réservée au fondateur de STACK pour piloter l'ensemble du réseau commercial, auditer les conversions et suivre la croissance globale.

---

## 19. Validation des Dossiers Agents & Déblocage des Commissions
- **Composant** : `src/Dashboard.jsx` (actions modales dans `'godmode'`).
- **Endpoints** : `PATCH /api/partners/admin/agents/:id/verifier-piece`, `PATCH /api/partners/admin/commissions/:id/payer`, `PATCH /api/partners/admin/tpe-commandes/:id/expedier`.
- **Rôle** : Validation unitaire des justificatifs d'agents, marquage des commissions comme réglées par virement bancaire et validation de l'expédition des colis de terminaux TPE.
