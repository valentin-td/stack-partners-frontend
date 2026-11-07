# 🔄 Flux de Données et Séquences Métier — Stack Partners

> **Cartographie exhaustive des échanges de données, protocoles et flux d'état de l'application partenaires.**  
> *Dernière mise à jour : 07/11/2026*  
> *Application : `stack-partners-frontend` (Portail Agents Commerciaux)*

---

## 1. Vue d'Ensemble des Flux

L'application `stack-partners-frontend` est une Single Page Application (SPA) React qui orchestre ses échanges autour de :
1. **L'API Backend Unifiée STACK** (`https://api-salon-backend.onrender.com/api/partners/*`) hébergée dans le repository `APP-GITHUB`.
2. **L'API Adresse du Gouvernement Français** (`https://api-adresse.data.gouv.fr/search/`) pour le géocodage haute précision des prospects en direct.
3. **Le service de cartographie Leaflet / OpenStreetMap** (CDN `unpkg.com`) pour le rendu des cartes de prospection et tournées.
4. **La passerelle SSO Sandbox** reliant instantanément un agent commercial à l'application de caisse STACK en production (`https://app-salon-caiss.onrender.com/?sandbox_token=...`).

```mermaid
flowchart TD
    Agent([Agent Commercial / Manager]) <--> SPA[Stack Partners SPA]
    SPA <-->|JWT partner_token| Backend[Backend STACK Express]
    SPA -->|Recherche d'adresse| DataGouv[API Adresse data.gouv.fr]
    SPA -->|Tuiles cartographiques| OSM[OpenStreetMap / Leaflet CDN]
    Backend <--> DB[(PostgreSQL Render)]
    Backend <--> R2[Cloudflare R2 Storage]
    Backend <--> Yousign[Yousign eSignature API]
    Backend <--> Stripe[Stripe Connect Payouts]
    SPA -.->|Redirection SSO Sandbox| AppCaisse[Stack Caisse Webapp]
```

---

## 2. Flux 1 : Authentification & Contrôle d'Accès de l'Agent

L'authentification s'appuie sur une session JWT dédiée (`partner_token`) stockée dans le `localStorage`. La SPA vérifie systématiquement son expiration avant tout affichage.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Agent Commercial
    participant SPA as stack-partners-frontend
    participant API as Backend STACK (/api/partners)
    participant DB as PostgreSQL (Render)

    Agent->>SPA: Saisie email + mot de passe (ou code agent)
    SPA->>API: POST /api/partners/login { email, password }
    API->>DB: SELECT * FROM partner_agents WHERE email = $1 AND actif = TRUE
    DB-->>API: Enregistrement agent (mot de passe haché argon2/bcrypt)
    API->>API: Vérification hash & signature JWT (role: 'commercial' | 'manager' | 'admin')
    API-->>SPA: 200 OK { token, agent: { id, nom, email, role, code_parrain, kyc_status } }
    SPA->>SPA: localStorage.setItem('partner_token', token)
    SPA->>SPA: Vérification payload JWT (exp)
    SPA->>API: GET /api/partners/me (Bearer token)
    API-->>SPA: 200 OK (Profil complet + stats temps réel)
    SPA-->>Agent: Affichage Dashboard (8 onglets débloqués)
```

---

## 3. Flux 2 : Prospection Cartographique, Géocodage & Tournées

L'agent consulte la carte interactive des salons prospectés, géocode de nouveaux prospects via l'API publique `data.gouv.fr`, et calcule son itinéraire optimisé de visite.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Agent Commercial
    participant SPA as stack-partners-frontend (Leaflet)
    participant Gouv as API Adresse data.gouv.fr
    participant API as Backend STACK (/api/partners)
    participant DB as PostgreSQL (Render)

    Agent->>SPA: Ouvre l'onglet "Carte & Prospection"
    SPA->>API: GET /api/partners/prospects (Bearer token)
    API->>DB: SELECT * FROM partner_prospects WHERE agent_id = $1
    DB-->>API: Liste des prospects (coordonnées GPS lat/lng, statuts)
    API-->>SPA: 200 OK [ { id, nom, adresse, lat, lng, statut, telephone } ]
    SPA->>SPA: Injection des marqueurs colorés (Leaflet MarkerCluster)
    
    rect rgb(240, 248, 255)
    Note over Agent, Gouv: Ajout d'un nouveau salon prospecté
    Agent->>SPA: Saisie "Salon Modern Cut, 12 rue de la Paix Paris"
    SPA->>Gouv: GET /search/?q=12+rue+de+la+Paix+Paris&limit=1
    Gouv-->>SPA: 200 OK { coordinates: [2.3312, 48.8698], label: "..." }
    SPA->>API: POST /api/partners/prospects { nom, adresse, lat, lng, statut: 'a_visiter' }
    API->>DB: INSERT INTO partner_prospects ...
    DB-->>API: Record créé (id: 42)
    API-->>SPA: 201 Created { id: 42, ... }
    SPA->>SPA: Marqueur vert fluo ajouté sur la carte
    end

    rect rgb(255, 250, 240)
    Note over Agent, SPA: Optimisation de Tournée Terrain
    Agent->>SPA: Clic "Optimiser ma tournée du jour (5 salons)"
    SPA->>SPA: Algorithme Voyageur de Commerce (TSP glouton basé sur distance Haversine)
    SPA-->>Agent: Tracé polyline ordonné sur la carte avec temps estimé
    end
```

---

## 4. Flux 3 : Démonstration en Direct via la Passerelle SSO Sandbox

L'une des innovations majeures de l'écosystème Stack est la capacité pour l'agent commercial de lancer en 1 clic une démonstration fonctionnelle de l'application de caisse devant le gérant sans passer par un formulaire d'inscription fastidieux.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Agent Commercial
    participant SPA as stack-partners-frontend
    participant API as Backend STACK (/api/partners)
    participant DB as PostgreSQL (Render)
    participant Caisse as Stack Caisse Webapp (app-salon-caiss)

    Agent->>SPA: Clic "Lancer une Démo Bac à Sable (Sandbox)"
    SPA->>API: POST /api/partners/sandbox/launch (Bearer partner_token)
    API->>DB: INSERT INTO configuration_salon (nom, est_bac_a_sable, expire_at) VALUES ('Démo ' || agent_nom, TRUE, NOW() + INTERVAL '2 hours')
    DB-->>API: Salon ID temporaire créé
    API->>DB: INSERT INTO tickets, employes, prestations (Jeux de données factices pour la démo)
    API->>API: Génération JWT éphémère sandbox_token (payload: { salon_id, role: 'gerant', sandbox: true })
    API-->>SPA: 200 OK { sandbox_url: "https://app-salon-caiss.onrender.com/?sandbox_token=ey..." }
    SPA->>Agent: Ouvre un nouvel onglet avec l'URL Sandbox
    
    rect rgb(245, 245, 255)
    Note over Caisse, API: Interception SSO sur l'application de caisse
    Caisse->>Caisse: URLSearchParams lit ?sandbox_token=ey...
    Caisse->>API: GET /api/salon/parametres (avec sandbox_token)
    API->>API: Middleware creerMiddlewareSSOSandbox vérifie sandbox: true
    API-->>Caisse: 200 OK { tout_accepte: true, salon: { nom: "Démo Agent", est_bac_a_sable: true } }
    Caisse->>Caisse: Bypass automatique des popups légaux CGV/Mandats
    Caisse-->>Agent: Caisse et Agenda immédiatement interactifs en direct
    end
```

---

## 5. Flux 4 : Onboarding Salon & Affiliation Partenaire

Dès que le prospect est convaincu, l'agent commercial l'onboarde directement depuis son interface Stack Partners.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Agent Commercial
    actor Gerant as Gérant Salon
    participant SPA as stack-partners-frontend
    participant API as Backend STACK (/api/partners)
    participant DB as PostgreSQL (Render)
    participant Brevo as Service Email (Brevo)

    Agent->>SPA: Remplissage formulaire Onboarding (Nom salon, SIRET, Email gérant, IBAN)
    SPA->>API: POST /api/partners/onboard-salon { code_parrain, siret, email_gerant, nom_salon, offre }
    API->>DB: SELECT id FROM partner_agents WHERE code_parrain = $1
    API->>DB: INSERT INTO configuration_salon (siret, nom_salon, email_contact, code_parrain_utilise, statut_abonnement)
    DB-->>API: Salon créé (id: 108)
    API->>DB: INSERT INTO partner_commissions (agent_id, salon_id, statut, montant_commission)
    API->>Brevo: Envoi email d'activation sécurisé au gérant avec lien de mot de passe initial
    API-->>SPA: 201 Created { message: "Salon créé et affilié avec succès", salon_id: 108 }
    SPA-->>Agent: Affichage notification de succès & passage du prospect au statut 'converti'
```

---

## 6. Flux 5 : Logistique Matériel — Commande de TPE WisePad 3

L'agent commercial peut commander et assigner des terminaux de paiement physiques Stripe WisePad 3 pour les salons qu'il a parrainés.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Agent Commercial
    participant SPA as stack-partners-frontend
    participant API as Backend STACK (/api/partners)
    participant DB as PostgreSQL (Render)

    Agent->>SPA: Sélectionne un salon client affilié + quantité de WisePad 3
    Agent->>SPA: Valide l'adresse de livraison du salon
    SPA->>API: POST /api/partners/tpe/commander { salon_id, quantite, adresse_livraison }
    API->>DB: INSERT INTO partner_tpe_commandes (agent_id, salon_id, statut, numero_serie, transporteur)
    DB-->>API: Commande enregistrée (statut: 'en_preparation')
    API-->>SPA: 200 OK { commande_id: 88, statut: 'en_preparation' }
    SPA-->>Agent: Tableau de bord logistique mis à jour avec suivi transporteur
```

---

## 7. Flux 6 : Facturation des Commissions, Signature Yousign & Cloudflare R2

Les commissions récurrentes dues aux agents commerciaux font l'objet d'un flux financier et contractuel rigoureux.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Agent Commercial
    participant SPA as stack-partners-frontend
    participant API as Backend STACK (/api/partners)
    participant DB as PostgreSQL (Render)
    participant R2 as Cloudflare R2
    participant Yousign as Yousign API

    Agent->>SPA: Consultation des commissions validées du mois
    Agent->>SPA: Clic "Générer ma note d'honoraires / facture"
    SPA->>API: POST /api/partners/factures/generer { mois: "2026-11", agent_id }
    API->>DB: SELECT SUM(montant) FROM partner_commissions WHERE agent_id = $1 AND statut = 'validee'
    API->>API: Génération dynamique du PDF de facture de commission
    API->>R2: Upload facture PDF sur Cloudflare R2 (`partners/factures/FAC-2026-11-001.pdf`)
    API->>DB: INSERT INTO partner_factures (numero, url_r2, montant_ht, montant_ttc)
    API-->>SPA: 200 OK { facture_url: "https://r2.../FAC-2026-11-001.pdf", requires_signature: true }
    SPA->>Agent: Affichage du PDF et invite de signature électronique Yousign
    
    Agent->>SPA: Clic "Signer électroniquement via Yousign"
    SPA->>API: POST /api/partners/factures/signer { facture_id }
    API->>Yousign: POST /signature_requests (PDF + infos agent)
    Yousign-->>API: { signature_url: "https://yousign.app/sign/..." }
    API-->>SPA: 200 OK { signature_url }
    SPA->>Agent: Iframe / redirection Yousign pour signature OTP SMS
```
