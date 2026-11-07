# 📑 Spécifications des Contrats d'API — STACK Partners Frontend

> **Référentiel des endpoints consommés par l'interface partenaire**  
> *Dernière mise à jour : 07/11/2026*  
> *Base URL : `process.env.VITE_API_URL` (`https://api-salon-backend.onrender.com/api/partners`)*

---

## 1. Authentification & Cycle de Vie du Compte

### `POST /auth/login`
- **Description** : Connexion d'un agent commercial partenaire.
- **Payload** :
  ```json
  { "email": "agent@stack.fr", "mot_de_passe": "secret" }
  ```
- **Réponse Succès (200)** :
  ```json
  {
    "token": "eyJhbGciOi...",
    "agent": {
      "id_agent": 42,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "agent@stack.fr",
      "code_partenaire": "PARTNER-DUP-4821",
      "statut_compte": "ACTIF"
    }
  }
  ```

### `POST /auth/register`
- **Description** : Inscription d'un nouvel apporteur d'affaires.
- **Payload** :
  ```json
  {
    "nom": "Dupont", "prenom": "Jean", "email": "jean@dupont.fr",
    "telephone": "0601020304", "mot_de_passe": "securePass123",
    "siret_agent": "12345678900012", "numero_rsac": "RSAC-67-1234", "iban": "FR76..."
  }
  ```
- **Réponse Succès (200)** : `{ "id_agent": 42, "code_partenaire": "PARTNER-DUP-4821" }`

### `POST /auth/forgot-password` & `POST /auth/reset-password`
- **Description** : Demande d'envoi d'email de récupération et redéfinition du mot de passe.

---

## 2. Tableau de Bord & Sandbox Démo en Direct

### `GET /dashboard-stats`
- **Headers** : `Authorization: Bearer <partner_token>`
- **Réponse Succès (200)** :
  ```json
  {
    "commissions_totales": 3450.00,
    "commissions_en_attente": 850.00,
    "salons_actifs": 12,
    "prospects_total": 38,
    "taux_conversion": 31.5
  }
  ```

### `POST /sandbox/launch` (Lien Clé Inter-Applications)
- **Description** : Instancie un salon d'essai et génère un jeton SSO pour ouvrir STACK Pro sans blocage légal.
- **Payload** :
  ```json
  {
    "nom_salon": "Salon Démo Coiffure",
    "adresse_salon": "14 Rue des Coiffeurs, 67000 Strasbourg",
    "type": "COIFFURE_BARBIER"
  }
  ```
- **Réponse Succès (200)** :
  ```json
  {
    "ok": true,
    "id_salon": 998,
    "sandbox_token": "eyJhbGciOi...",
    "redirect_url": "https://app-salon-caiss.onrender.com/?sandbox_token=eyJhbGciOi..."
  }
  ```

---

## 3. Cartographie & Optimisation de Tournée

### `GET /map-salons`
- **Paramètres** : `lat`, `lng`, `radius` (km), `step`
- **Réponse Succès (200)** :
  ```json
  [
    {
      "id": 104,
      "nom": "Barber Shop Vintage",
      "adresse": "22 Rue du Faubourg, 67000 Strasbourg",
      "lat": 48.5839,
      "lng": 7.7455,
      "telephone": "0388000000",
      "visite": true,
      "derniere_visite": "2026-11-04T14:30:00Z"
    }
  ]
  ```

### `POST /tournee/optimiser`
- **Payload** :
  ```json
  {
    "start_point": { "lat": 48.58, "lng": 7.74 },
    "end_point": { "lat": 48.59, "lng": 7.75 },
    "salons_ids": [104, 108, 112, 115]
  }
  ```
- **Réponse Succès (200)** :
  ```json
  {
    "ordre_optimal": [108, 104, 115, 112],
    "distance_totale_km": 14.8,
    "duree_estimee_minutes": 35
  }
  ```

### `POST /visites`
- **Payload** :
  ```json
  {
    "id_prospect": 104,
    "date_visite": "2026-11-07T14:00:00Z",
    "interlocuteur": "Marc (Gérant)",
    "statut": "CHAUD",
    "compte_rendu": "Très intéressé par la caisse NF525 et le TPE sans frais cachés. Démo Sandbox prévue mardi."
  }
  ```

---

## 4. Pipeline Prospects & Onboarding

### `GET /prospects` & `POST /prospects`
- **Rôle** : Récupération et ajout de prospects dans le CRM partenaire.

### `POST /prospects/:id/onboarding`
- **Description** : Valide la signature du salon et lance l'onboarding dans la base principale STACK.

---

## 5. Factures & Règlements de Commissions

### `GET /factures` & `POST /factures`
- **Rôle** : Gestion des factures de commissions d'onboarding.

### `GET /factures/:id/pdf`
- **Headers** : `Authorization: Bearer <partner_token>`
- **Retour** : Flux binaire `application/pdf` de la facture vectorielle officielle.

### `POST /factures/:id/send-email`
- **Rôle** : Envoi de la facture au service comptabilité STACK pour mise en paiement.

---

## 6. Stock & Logistique TPE (BBPOS WisePad™ 3)

### `GET /tpe-stock`
- **Rôle** : Liste des terminaux physiques disponibles dans l'inventaire de l'agent.

### `POST /tpe-stock/commander`
- **Payload** : `{ "quantite": 3, "adresse_livraison": "..." }`

---

## 7. Profil KYC & Yousign

### `GET /profil` & `PUT /profil/etape`
- **Rôle** : Informations fiscales de l'agent et upload multipart de justificatifs (CNI, KBIS, RSAC).

### `POST /profil/yousign/initiate` & `GET /profil/yousign/check`
- **Rôle** : Génération et vérification de la signature électronique du contrat d'agent commercial.

---

## 8. Espace Super-Admin (God Mode)

- `GET /admin/agents` : Liste de tous les agents enregistrés.
- `PATCH /admin/agents/:id/verifier-piece` : Validation d'un document KYC.
- `GET /admin/commissions` & `PATCH /admin/commissions/:id/payer` : Validation et paiement des commissions.
- `GET /admin/tpe-commandes` & `PATCH /admin/tpe-commandes/:id/expedier` : Gestion des expéditions de terminaux.
