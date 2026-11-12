
# Documentation complète du Frontend — Cabinet Comptable

**Projet :** Application web de gestion d'un cabinet comptable  
**Frontend :** React + Vite  
**Backend :** Java (HttpServer)  
**Base de données :** MySQL  
**Date de documentation :** Novembre 2026

---

# 1. Présentation générale du projet

Le projet Cabinet Comptable est une application web permettant de gérer les différentes activités d'un cabinet comptable.

L'application possède trois types d'utilisateurs :

- **ADMIN** : administrateur du cabinet. Il possède les droits d'administration générale.
- **COMPTABLE** : comptable chargé de gérer les clients qui lui sont affectés.
- **CLIENT** : client du cabinet qui peut consulter ses propres informations et les services qui le concernent.

L'application est divisée en deux grandes parties :

1. **Backend Java** : contient la logique métier, les règles de gestion, les contrôles d'accès et la communication avec la base de données.
2. **Frontend React** : représente l'interface utilisateur. Il permet de naviguer entre les pages, afficher les données et envoyer des demandes au backend.

Le frontend ne communique pas directement avec MySQL. Toutes les opérations passent par le backend à travers des API REST.

## 1.1 Technologies utilisées

| Technologie | Utilisation |
|---|---|
| React | Construction de l'interface utilisateur |
| Vite | Environnement de développement frontend |
| JavaScript | Logique de l'application frontend |
| React Router | Gestion de la navigation entre les pages |
| React Context API | Gestion globale de l'authentification |
| Fetch API | Communication HTTP avec le backend |
| CSS | Mise en forme et design |
| Java HttpServer | Serveur HTTP backend |
| MySQL | Stockage des données |
| JWT | Authentification et sécurisation des requêtes |

---

# 2. Emplacement du projet et lancement

Le projet se trouve dans :

```text
C:\Users\mezni\Desktop\cabinet_comptable
```

Le frontend se trouve dans :

```text
C:\Users\mezni\Desktop\cabinet_comptable\frontend
```

## 2.1 Configuration de l'API

Dans le dossier `frontend`, le fichier `.env` contient :

```env
VITE_API_URL=http://localhost:8081/api
```

Cette variable représente l'adresse de base du backend.

Par exemple, lorsque le frontend appelle :

```javascript
apiRequest("/clients");
```

L'URL complète devient :

```text
http://localhost:8081/api/clients
```

Si l'adresse ou le port du backend change, il faut modifier cette variable et redémarrer le serveur Vite.

## 2.2 Lancer le frontend

Ouvrir un terminal dans le dossier `frontend` et exécuter :

```bash
npm install
npm run dev
```

Vite démarre généralement l'application sur :

```text
http://localhost:5173
```

Le backend Java doit également être démarré pour que les fonctionnalités nécessitant des données puissent fonctionner.

---

# 3. Architecture générale du frontend

Le frontend suit une architecture organisée par responsabilités.

Voici la structure du dossier `src` :

```text
frontend/
│
├── .env
├── package.json
├── index.html
│
└── src/
    │
    ├── main.jsx
    ├── App.jsx
    │
    ├── api/
    │   ├── apiClient.js
    │   ├── authApi.js
    │   ├── clientApi.js
    │   ├── comptableApi.js
    │   ├── factureApi.js
    │   ├── missionApi.js
    │   ├── documentApi.js
    │   └── profileApi.js
    │
    ├── context/
    │   └── AuthContext.jsx
    │
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useClients.js
    │   ├── useFactures.js
    │   ├── useMissions.js
    │   └── useDocuments.js
    │
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── AppLayout.jsx
    │   ├── Loading.jsx
    │   ├── ErrorMessage.jsx
    │   └── StatusBadge.jsx
    │
    ├── pages/
    │   ├── Home.jsx
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── Clients.jsx
    │   ├── Comptables.jsx
    │   ├── Factures.jsx
    │   ├── Missions.jsx
    │   ├── Documents.jsx
    │   └── Profile.jsx
    │
    ├── utils/
    │   ├── formatDate.js
    │   ├── formatMoney.js
    │   └── permissions.js
    │
    └── styles/
        ├── variables.css
        └── global.css
```

## 3.1 Rôle de chaque dossier

| Dossier | Responsabilité |
|---|---|
| `api/` | Contient les fonctions qui communiquent avec le backend |
| `context/` | Gère les informations globales de l'utilisateur connecté |
| `hooks/` | Contient la logique React réutilisable |
| `components/` | Contient les composants d'interface réutilisables |
| `pages/` | Contient les pages principales de l'application |
| `utils/` | Contient les fonctions utilitaires |
| `styles/` | Contient les styles CSS et les variables visuelles |

## 3.2 Principe de séparation des responsabilités

Chaque partie possède un rôle précis.

Exemple : lorsqu'on veut afficher les factures :

```text
Factures.jsx
    |
    | Appelle getFactures()
    v
factureApi.js
    |
    | Appelle apiRequest("/factures")
    v
apiClient.js
    |
    | Envoie la requête HTTP avec le token JWT
    v
Backend Java
    |
    v
Service Java
    |
    v
DAO
    |
    v
Base de données MySQL
```

Cette architecture permet de modifier une partie sans devoir réécrire toute l'application.

Par exemple, si l'URL d'une API change, il suffit généralement de modifier le fichier correspondant dans `api/`, sans toucher à toute la page React.

---

# 4. Point d'entrée et navigation

## 4.1 main.jsx

Le fichier `main.jsx` est le point d'entrée de l'application React.

Il permet de :

- Initialiser l'application.
- Activer la navigation avec `BrowserRouter`.
- Rendre le contexte d'authentification accessible avec `AuthProvider`.
- Importer les styles globaux.

L'organisation générale est :

```text
main.jsx
   |
   ├── BrowserRouter
   |
   ├── AuthProvider
   |
   └── App.jsx
```

## 4.2 App.jsx

Le fichier `App.jsx` définit les routes de l'application.

Chaque URL est associée à une page.

| Route | Page | Accès |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/dashboard` | Dashboard | Connecté |
| `/clients` | Clients | ADMIN, COMPTABLE |
| `/comptables` | Comptables | ADMIN |
| `/factures` | Factures | Connecté |
| `/missions` | Missions | Connecté |
| `/documents` | Documents | Connecté |
| `/profile` | Profile | Connecté |

Les routes privées utilisent `ProtectedRoute` pour empêcher les utilisateurs non connectés d'accéder à l'espace privé.

Les pages privées utilisent également `AppLayout` pour partager une structure commune avec la barre latérale.

### Ajouter une nouvelle page

Pour ajouter une page :

1. Créer le fichier dans `src/pages/`.
2. Ajouter sa route dans `App.jsx`.
3. Définir si elle nécessite une authentification.
4. Définir les rôles autorisés.
5. Ajouter son lien dans `Sidebar.jsx` si nécessaire.
6. Vérifier que les endpoints backend sont également protégés.

---

# 5. Authentification et gestion de la session

## 5.1 AuthContext.jsx

Le fichier `AuthContext.jsx` centralise les informations liées à l'authentification.

Il permet à toutes les pages de connaître l'utilisateur connecté sans devoir transmettre ses informations manuellement entre les composants.

Il expose notamment :

- `user` : informations de l'utilisateur connecté.
- `login` : fonction de connexion.
- `logout` : fonction de déconnexion.
- `loading` : état de chargement de la session.
- `isAuthenticated` : indique si l'utilisateur est connecté.

Dans l'implémentation actuelle, les informations conservées dans `user` comprennent principalement le nom et le rôle.

## 5.2 useAuth.js

Ce fichier permet aux composants d'utiliser facilement le contexte d'authentification.

Les pages utilisent généralement :

```javascript
import { useAuth } from "../hooks/useAuth";
```

Le fichier `useAuth.js` réexporte le hook défini dans `AuthContext.jsx`.

Il ne faut donc pas remplacer cet import par un import direct du contexte.

## 5.3 Fonctionnement de la connexion

Le processus de connexion est le suivant :

```text
Login.jsx
    |
    v
loginApi(email, motDePasse)
    |
    v
POST /api/auth/login
    |
    v
Backend vérifie les identifiants
    |
    v
Backend renvoie le token JWT et les informations utilisateur
    |
    v
AuthContext enregistre la session
    |
    v
L'utilisateur accède à son espace
```

Le token JWT est enregistré dans le `localStorage` sous la clé :

```javascript
localStorage.getItem("token");
```

Le token est ensuite utilisé pour authentifier les requêtes protégées.

## 5.4 Déconnexion

La déconnexion :

1. Appelle l'endpoint `/auth/logout`.
2. Supprime le token du `localStorage`.
3. Réinitialise les informations de l'utilisateur dans le contexte.
4. Redirige vers la page de connexion.

Le backend utilise une authentification JWT stateless. Le token possède une durée de validité de deux heures.

## 5.5 Amélioration possible du profil utilisateur

Dans la version actuelle, le contexte conserve principalement le nom et le rôle.

Certaines informations comme l'email, le téléphone ou l'adresse peuvent donc ne pas être disponibles immédiatement dans `Profile.jsx`.

Une amélioration future serait de récupérer les informations complètes du profil connecté depuis le backend et de les enregistrer dans le contexte.

---

# 6. Protection des routes et permissions

## 6.1 ProtectedRoute.jsx

Ce composant protège les pages privées.

Son rôle est de vérifier si l'utilisateur est connecté avant de lui permettre d'accéder à une page.

Il peut également vérifier le rôle autorisé pour certaines pages.

## 6.2 Sidebar.jsx

La barre latérale contient les liens de navigation.

Les liens affichés changent selon le rôle de l'utilisateur.

Exemple :

- ADMIN : Dashboard, Clients, Comptables, Factures, Missions, Documents, Profil.
- COMPTABLE : Dashboard, Clients, Factures, Missions, Documents, Profil.
- CLIENT : Dashboard, Factures, Missions, Documents, Profil.

## 6.3 permissions.js

Ce fichier centralise les vérifications liées aux rôles.

Exemples :

```javascript
const isAdmin = user?.role === "ADMIN";
const isComptable = user?.role === "COMPTABLE";
const isClient = user?.role === "CLIENT";
```

L'objectif est d'éviter de répéter les mêmes conditions dans toutes les pages.

## 6.4 Une règle importante concernant la sécurité

Le frontend peut masquer un bouton ou une page selon le rôle, mais cela ne suffit pas pour sécuriser l'application.

Un utilisateur peut essayer d'appeler directement une API.

C'est pourquoi le backend doit toujours vérifier :

- Le rôle de l'utilisateur.
- Son identité.
- Ses droits sur la ressource demandée.
- Les règles métier liées à l'opération.

**Le frontend contrôle l'affichage. Le backend contrôle réellement les autorisations.**

---

# 7. Couche API : communication avec le backend

Le dossier `src/api/` contient toutes les fonctions utilisées pour communiquer avec les endpoints Java.

## 7.1 apiClient.js

C'est le fichier central de communication HTTP.

Au lieu d'écrire `fetch()` dans toutes les pages, on utilise une fonction commune appelée `apiRequest()`.

Ses responsabilités sont :

- Construire l'URL complète à partir de `VITE_API_URL`.
- Ajouter le token JWT dans l'en-tête Authorization.
- Envoyer les requêtes HTTP.
- Envoyer les données JSON.
- Gérer les fichiers envoyés avec `FormData`.
- Lire les réponses du backend.
- Gérer les erreurs HTTP.
- Gérer les réponses sans contenu.

Les requêtes protégées utilisent normalement :

```http
Authorization: Bearer <token>
```

Le backend renvoie les erreurs sous une forme similaire à :

```json
{
  "erreur": "Message explicatif"
}
```

`apiClient.js` permet de récupérer ce message et de le transmettre à la page.

## 7.2 authApi.js

Contient les fonctions liées à l'authentification :

- `loginApi(email, motDePasse)`
- `logoutApi()`

Il communique avec :

```text
POST /api/auth/login
POST /api/auth/logout
```

## 7.3 clientApi.js

Contient les opérations concernant les clients :

- Récupérer la liste des clients.
- Récupérer un client par son identifiant.
- Créer un client.
- Modifier un client.
- Désactiver un client.
- Affecter un comptable à un client.

## 7.4 comptableApi.js

Contient les opérations concernant les comptables :

- Récupérer les comptables.
- Récupérer un comptable.
- Créer un comptable.
- Modifier un comptable.
- Désactiver un comptable.

## 7.5 factureApi.js

Contient les opérations concernant les factures :

- Récupérer les factures.
- Récupérer une facture.
- Récupérer les factures d'un client.
- Récupérer les factures du client connecté.
- Créer une facture.
- Modifier une facture.
- Marquer une facture comme payée.
- Annuler une facture.

## 7.6 missionApi.js

Contient les opérations concernant les missions :

- Récupérer les missions.
- Récupérer une mission.
- Récupérer les missions d'un client.
- Récupérer les missions du client connecté.
- Créer une mission.
- Modifier une mission.
- Démarrer une mission.
- Valider une mission.
- Terminer une mission.
- Annuler une mission.
- Déposer une déclaration.

## 7.7 documentApi.js

Contient les opérations concernant les documents :

- Récupérer les documents.
- Déposer un document.
- Télécharger un document.
- Supprimer un document.

Le dépôt utilise `FormData`, car il contient un fichier.

Le téléchargement utilise une méthode particulière :

1. Le frontend récupère le token JWT.
2. Il effectue une requête `fetch` avec l'en-tête Authorization.
3. Il récupère le fichier sous forme de `Blob`.
4. Il crée une URL temporaire avec `URL.createObjectURL()`.
5. Il déclenche le téléchargement dans le navigateur.

## 7.8 profileApi.js

Contient les fonctions liées à la modification du profil utilisateur.

L'endpoint principal est :

```http
PUT /api/profile
```

---

# 8. Hooks React

Le dossier `src/hooks/` contient des hooks personnalisés.

Un hook permet de réutiliser une logique React dans plusieurs composants.

| Hook | Utilité |
|---|---|
| `useAuth.js` | Accéder à l'authentification |
| `useClients.js` | Gérer les données des clients |
| `useFactures.js` | Gérer les données des factures |
| `useMissions.js` | Gérer les données des missions |
| `useDocuments.js` | Gérer les données des documents |

Un hook peut notamment gérer :

- Le chargement des données.
- Les états `loading`.
- Les erreurs.
- Les appels API.
- Les mises à jour des données.

Il n'est pas obligatoire d'utiliser un hook pour chaque page. Il est surtout utile lorsqu'une logique est réutilisée ou devient trop complexe dans le composant.

---

# 9. Composants réutilisables

Le dossier `src/components/` contient les éléments d'interface utilisés dans plusieurs pages.

| Composant | Rôle |
|---|---|
| `Navbar.jsx` | Barre de navigation |
| `Sidebar.jsx` | Menu latéral |
| `ProtectedRoute.jsx` | Protection des routes |
| `AppLayout.jsx` | Structure générale des pages privées |
| `Loading.jsx` | Indicateur de chargement |
| `ErrorMessage.jsx` | Affichage des erreurs |
| `StatusBadge.jsx` | Affichage visuel des statuts |

## Pourquoi créer des composants réutilisables ?

Cela évite de réécrire plusieurs fois le même code.

Par exemple, si le design des statuts change, il suffit de modifier `StatusBadge.jsx` au lieu de modifier toutes les pages.

---

# 10. Les pages de l'application

## 10.1 Home.jsx — Accueil

C'est la page publique de l'application.

Elle présente le cabinet et permet à l'utilisateur d'accéder à la page de connexion.

Elle ne nécessite pas d'authentification.

## 10.2 Login.jsx — Connexion

Cette page contient le formulaire de connexion.

Elle récupère :

- L'email.
- Le mot de passe.

Elle appelle `loginApi()` et utilise `AuthContext` pour enregistrer la session.

## 10.3 Dashboard.jsx — Tableau de bord

C'est la page d'accueil de l'espace privé.

Elle peut présenter des statistiques, des indicateurs et des raccourcis adaptés au rôle de l'utilisateur.

Le backend possède notamment un endpoint destiné à l'ADMIN :

```http
GET /api/statistiques
```

Il renvoie :

```json
{
  "nbAdmins": 0,
  "nbComptables": 0,
  "nbClients": 0,
  "nbClientsSansComptable": 0
}
```

Les valeurs sont données uniquement à titre d'exemple.

## 10.4 Clients.jsx — Gestion des clients

Cette page permet de :

- Afficher la liste des clients.
- Rechercher un client.
- Ajouter un client.
- Modifier un client.
- Désactiver un client.
- Gérer l'affectation à un comptable selon les permissions.

### Structure d'un client

| Champ | Description |
|---|---|
| `id` | Identifiant |
| `nom` | Nom du client |
| `email` | Adresse email |
| `telephone` | Téléphone facultatif |
| `typeClient` | PHYSIQUE ou ENTREPRISE |
| `identifiantFiscal` | Identifiant fiscal éventuel |
| `adresse` | Adresse éventuelle |
| `comptableId` | Identifiant du comptable affecté |
| `actif` | État actif/inactif |

**Attention :** lors d'une modification de client, le backend exige que `comptableId` soit également envoyé dans la requête PUT, même si l'affectation ne change pas.

La suppression d'un client est une désactivation logique. L'enregistrement n'est pas nécessairement supprimé physiquement de la base de données.

## 10.5 Comptables.jsx — Gestion des comptables

Cette page est réservée à l'ADMIN.

Elle permet de :

- Afficher les comptables.
- Ajouter un comptable.
- Modifier un comptable.
- Désactiver un comptable.

La désactivation est également logique.

## 10.6 Factures.jsx — Gestion des factures

Cette page permet de consulter les factures et d'effectuer les actions autorisées selon le rôle.

### Structure d'une facture

| Champ | Description |
|---|---|
| `id` | Identifiant |
| `numero` | Numéro unique |
| `description` | Description |
| `dateEmission` | Date d'émission |
| `dateEcheance` | Date limite de paiement |
| `montantHT` | Montant hors taxes |
| `tauxTVA` | Taux de TVA |
| `montantTTC` | Montant TTC calculé par le backend |
| `statut` | EMISE, PAYEE ou ANNULEE |
| `datePaiement` | Date de paiement éventuelle |
| `clientId` | Identifiant du client |
| `enRetard` | Indique si la facture est en retard |

### Cycle de vie d'une facture

```text
          EMISE
          /   \
         /     \
      payer   annuler
        |        |
        v        v
      PAYEE    ANNULEE
```

Une facture ne peut être modifiée que lorsqu'elle possède le statut `EMISE`.

Il n'existe pas de suppression classique de facture dans l'API connue.

### Cas particulier du CLIENT

Le client ne doit pas utiliser l'endpoint général :

```http
GET /api/factures
```

Il utilise son endpoint personnel :

```http
GET /api/me/factures
```

Dans le frontend, la sélection doit donc dépendre du rôle :

- CLIENT : `getMyFactures()`
- ADMIN et COMPTABLE : `getFactures()`

Cette distinction est importante pour éviter les erreurs `403 Forbidden`.

## 10.7 Missions.jsx — Gestion des missions

Cette page permet de :

- Consulter les missions.
- Rechercher une mission.
- Créer une mission.
- Modifier une mission lorsque cela est autorisé.
- Démarrer une mission.
- Valider une mission.
- Terminer une mission.
- Annuler une mission.
- Déposer une déclaration lorsque cela est autorisé.

### Les types de missions

Il existe trois types de missions :

1. DECLARATION
2. PAIE
3. COMPTABILITE

Chaque type possède ses propres informations.

### Mission DECLARATION

Informations spécifiques :

- `typeDeclaration`
- `periodeDebut`
- `periodeFin`
- `montantDu`
- `dateDepot`

Types de déclaration connus :

- TVA
- IS_IR
- CNSS
- RETENUE_SOURCE

### Mission PAIE

Informations spécifiques :

- `periodePaie` au format YYYY-MM.
- `nbSalaries`
- `masseSalariale`

### Mission COMPTABILITE

Informations spécifiques :

- `exercice`
- `periodicite`
- `nbPiecesTraitees`
- `dateCloture`

Les périodicités possibles sont :

- MENSUELLE
- TRIMESTRIELLE
- ANNUELLE

### Cycle de vie d'une mission

```text
             A_FAIRE
                |
             demarrer
                |
                v
             EN_COURS
                |
              valider
                |
                v
              VALIDEE
                |
             terminer
                |
                v
             TERMINEE
```

Une mission peut également être annulée dans les états autorisés par le backend.

Le dépôt concerne uniquement les missions de type `DECLARATION`, sous les conditions définies côté serveur.

### Consultation des missions par le CLIENT

Le client utilise :

```http
GET /api/me/missions
```

Il ne doit pas utiliser la liste générale réservée aux autres rôles.

## 10.8 Documents.jsx — Gestion des documents

Cette page permet de :

- Consulter les documents.
- Déposer un document.
- Télécharger un document.
- Supprimer un document lorsque cela est autorisé.

### Types de documents

- FACTURE_VENTE
- FACTURE_ACHAT
- RELEVE_BANCAIRE
- ACCUSE_DEPOT
- CONTRAT
- AUTRE

### Dépôt d'un document

Le dépôt utilise `FormData`.

Les champs envoyés sont :

| Champ | Description |
|---|---|
| `file` | Fichier à déposer |
| `nom` | Nom du document |
| `typeDocument` | Type du document |
| `clientId` | Client concerné |
| `missionId` | Mission concernée, facultative |

Il ne faut pas envoyer ce formulaire comme du JSON.

### Téléchargement

Le téléchargement est différent des autres appels API car il récupère un fichier binaire.

Le frontend :

1. Récupère le token JWT.
2. Envoie une requête authentifiée.
3. Récupère le fichier sous forme de Blob.
4. Crée une URL temporaire.
5. Lance le téléchargement.

Les permissions documentaires sont contrôlées par le backend. Par exemple, le comptable ne peut pas automatiquement accéder aux documents déposés par l'ADMIN.

## 10.9 Profile.jsx — Mon profil

Cette page permet à l'utilisateur de consulter et modifier ses informations personnelles.

Règles métier :

- CLIENT : peut modifier son propre profil, y compris son adresse.
- COMPTABLE : peut modifier son propre profil.
- ADMIN : peut modifier son propre profil et certaines informations d'autres utilisateurs via les endpoints d'administration.
- Personne ne peut modifier son propre rôle.

L'endpoint de modification du profil courant est :

```http
PUT /api/profile
```

Il accepte notamment :

- `nom`
- `email`
- `telephone`
- `adresse` pour le CLIENT

---

# 11. Contrat API du backend

Cette section regroupe les endpoints connus pour faciliter les développements futurs.

Base URL :

```text
http://localhost:8081/api
```

## 11.1 Authentification

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/ping` | Vérifier le backend |
| POST | `/auth/login` | Connexion |
| POST | `/auth/logout` | Déconnexion |

## 11.2 Clients

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/clients` | Liste des clients |
| GET | `/clients/{id}` | Détail d'un client |
| POST | `/clients` | Création |
| PUT | `/clients/{id}` | Modification |
| DELETE | `/clients/{id}` | Désactivation |
| PUT | `/clients/{id}/comptable` | Affectation d'un comptable |

## 11.3 Comptables

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/comptables` | Liste |
| GET | `/comptables/{id}` | Détail |
| POST | `/comptables` | Création |
| PUT | `/comptables/{id}` | Modification |
| DELETE | `/comptables/{id}` | Désactivation |

## 11.4 Statistiques

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/statistiques` | Statistiques ADMIN |

## 11.5 Factures

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/factures` | Liste générale |
| GET | `/factures/{id}` | Détail |
| GET | `/clients/{id}/factures` | Factures d'un client |
| GET | `/me/factures` | Factures du client connecté |
| POST | `/factures` | Création |
| PUT | `/factures/{id}` | Modification |
| POST | `/factures/{id}/payer` | Paiement |
| POST | `/factures/{id}/annuler` | Annulation |

## 11.6 Missions

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/missions` | Liste générale |
| GET | `/missions/{id}` | Détail |
| GET | `/clients/{id}/missions` | Missions d'un client |
| GET | `/me/missions` | Missions du client connecté |
| POST | `/missions` | Création |
| PUT | `/missions/{id}` | Modification |
| POST | `/missions/{id}/demarrer` | Démarrer |
| POST | `/missions/{id}/valider` | Valider |
| POST | `/missions/{id}/terminer` | Terminer |
| POST | `/missions/{id}/annuler` | Annuler |
| POST | `/missions/{id}/deposer` | Déposer une déclaration |

## 11.7 Documents

| Méthode | Endpoint | Fonction |
|---|---|---|
| GET | `/documents` | Liste |
| POST | `/documents` | Dépôt |
| GET | `/documents/{id}/download` | Téléchargement |
| DELETE | `/documents/{id}` | Suppression |

## 11.8 Profil et administration des utilisateurs

| Méthode | Endpoint | Fonction |
|---|---|---|
| PUT | `/profile` | Modifier son profil |
| PUT | `/users/{id}` | Modifier les informations d'un utilisateur |
| PUT | `/users/{id}/password` | Modifier son mot de passe |
| PATCH | `/users/{id}/status` | Modifier l'état actif/inactif |

Les endpoints d'administration ne sont pas accessibles à tous les rôles.

---

# 12. Règles métier importantes

Ces règles doivent être respectées lorsque le frontend est modifié.

## 12.1 Gestion des utilisateurs

- Les rôles sont `ADMIN`, `COMPTABLE` et `CLIENT`.
- Les emails doivent être uniques.
- Les identifiants fiscaux doivent être uniques lorsqu'ils sont renseignés.
- La désactivation d'un utilisateur est logique.
- Un comptable ne peut gérer que les clients qui lui sont affectés selon les règles du backend.

## 12.2 Gestion des clients

Le DTO de création/modification utilise notamment :

```text
nom
email
telephone
motDePasse
typeClient
identifiantFiscal
adresse
comptableId
```

Le mot de passe est obligatoire à la création et facultatif à la modification.

Attention : lors d'une modification, `comptableId` doit être renvoyé.

## 12.3 Gestion des factures

- Le numéro de facture doit être unique.
- La date d'échéance doit être supérieure ou égale à la date d'émission.
- Le montant HT doit être positif ou nul.
- Le taux de TVA est compris entre 0 et 100.
- Le montant TTC est calculé par le backend.
- Une facture payée ou annulée ne peut plus être modifiée.

## 12.4 Gestion des missions

- Une mission appartient à un client.
- La mission possède un type.
- Les champs spécifiques dépendent du type.
- Les transitions de statut sont contrôlées par le backend.
- Une mission terminée ou annulée ne peut pas être modifiée.
- Le dépôt concerne les missions de type DECLARATION.

## 12.5 Gestion des documents

- Un document appartient à un client.
- Il peut être associé à une mission.
- La mission associée doit appartenir au même client.
- Les droits de consultation et de suppression dépendent du rôle, du client et de l'utilisateur qui a déposé le document.

---

# 13. Problème connu à corriger ultérieurement : les listes du COMPTABLE

**État : problème identifié, correction volontairement reportée.**

Actuellement, le comptable peut voir des données qui ne concernent pas uniquement ses clients affectés dans certaines listes :

- Liste des clients.
- Liste des factures.
- Liste des missions.

### Cause identifiée

Dans les services backend examinés :

- `ClientService.list()` appelle `clientDao.findAll()`.
- `FactureService.list()` appelle `factureDao.findAll()`.
- `MissionService.list()` appelle `missionDao.findAll()`.

Ces méthodes récupèrent les données générales sans filtrer selon le comptable connecté.

### Correction à effectuer plus tard

Le filtrage doit être fait côté backend en utilisant l'identifiant du comptable connecté et la relation entre le client et son comptable.

Les fichiers à examiner :

```text
ClientDao.java
ClientService.java
ClientController.java

FactureDao.java
FactureService.java
FactureController.java

MissionDao.java
MissionService.java
MissionController.java
```

Il ne suffit pas de filtrer les tableaux dans React.

Il faut également vérifier les accès par identifiant et les opérations de création, modification et changement de statut. Sinon, un comptable pourrait tenter d'accéder directement à une ressource appartenant à un autre comptable.

### Comportement attendu

Un comptable doit uniquement consulter et gérer les clients qui lui sont affectés, ainsi que les factures et missions de ces clients, conformément aux permissions métier.

---

# 14. Design et identité visuelle

La palette de couleurs utilisée dans le projet est :

| Couleur | Code hexadécimal | Utilisation |
|---|---|---|
| Vert forêt | `#012B1D` | Couleur principale |
| Vert jungle | `#01B36C` | Accent et actions positives |
| Pêche clair | `#FEB192` | Accent secondaire |
| Fond clair | `#F7F9F7` | Fond général |

## 14.1 variables.css

Ce fichier contient les variables CSS partagées.

Exemple :

```css
:root {
    --color-primary: #012B1D;
    --color-accent: #01B36C;
    --color-secondary: #FEB192;
    --color-background: #F7F9F7;
}
```

L'intérêt est de pouvoir changer une couleur dans un seul endroit et de mettre à jour toute l'application.

## 14.2 global.css

Ce fichier contient les styles généraux :

- Police.
- Fond de l'application.
- Marges.
- Boutons.
- Formulaires.
- Styles communs.
- Règles générales d'affichage.

Avant d'ajouter un nouveau style, vérifier si une classe ou une variable similaire existe déjà.

---

# 15. Comment ajouter une nouvelle fonctionnalité ?

Pour développer un nouveau module, suivre cette méthode.

## Étape 1 : Comprendre le besoin

Identifier :

- Qui peut utiliser la fonctionnalité ?
- Quelles données doivent être affichées ?
- Quelles actions sont possibles ?
- Quelles validations sont nécessaires ?
- Quels rôles sont autorisés ?

## Étape 2 : Vérifier le backend

Avant de commencer le frontend, vérifier :

- L'endpoint.
- La méthode HTTP.
- Les champs attendus.
- Le format de la réponse.
- Les erreurs possibles.
- Les permissions.

Les DTO, contrôleurs et services Java sont les références pour comprendre le contrat backend.

## Étape 3 : Créer le fichier API

Ajouter les fonctions nécessaires dans `src/api/`.

Exemple :

```javascript
import { apiRequest } from "./apiClient";

export function getExemples() {
    return apiRequest("/exemples");
}
```

## Étape 4 : Créer la page React

La page doit gérer :

- Les données.
- Le chargement.
- Les erreurs.
- Les actions.
- L'actualisation après une modification.

## Étape 5 : Ajouter la route

Ajouter la route dans `App.jsx`.

## Étape 6 : Ajouter le lien de navigation

Ajouter le lien dans `Sidebar.jsx` si nécessaire.

## Étape 7 : Tester les rôles

Tester avec ADMIN, COMPTABLE et CLIENT.

Ne pas supposer qu'une fonctionnalité qui marche en ADMIN fonctionnera automatiquement pour les autres rôles.

---

# 16. Comment diagnostiquer un problème ?

Lorsqu'une fonctionnalité ne marche pas, il faut identifier à quelle couche appartient le problème.

| Problème | Fichiers à examiner |
|---|---|
| Mauvaise URL | Fichier API concerné, `apiClient.js` |
| Erreur HTTP | `apiClient.js`, endpoint backend |
| Données non affichées | Page React, fichier API, format de réponse |
| Mauvais rôle affiché | `AuthContext.jsx`, `permissions.js`, page concernée |
| Page accessible sans connexion | `App.jsx`, `ProtectedRoute.jsx` |
| Session incorrecte | `AuthContext.jsx`, `authApi.js` |
| Téléchargement impossible | `documentApi.js`, endpoint backend |
| Formulaire incorrect | Page React, DTO Java |
| Données incorrectes en base | Service Java, DAO Java |
| Problème de style | `global.css`, `variables.css`, composant concerné |
| Menu incorrect | `Sidebar.jsx`, `AppLayout.jsx` |

### Suivre le chemin de la donnée

Pour comprendre une fonctionnalité, suivre cet ordre :

```text
Page React
    |
    v
Fichier API
    |
    v
apiClient.js
    |
    v
Controller Java
    |
    v
Service Java
    |
    v
DAO Java
    |
    v
Base de données
```

Cela permet de localiser précisément l'origine du problème.

---

# 17. Gestion des erreurs

Les erreurs HTTP les plus fréquentes sont :

| Code | Signification | Comportement frontend |
|---|---|---|
| 400 | Requête invalide | Afficher le message de validation |
| 401 | Non authentifié | Effacer la session et rediriger vers login |
| 403 | Accès interdit | Afficher un message de permission |
| 404 | Ressource introuvable | Afficher un message adapté |
| 409 | Conflit, par exemple doublon | Afficher le conflit |
| 500 | Erreur serveur | Afficher un message général et consulter les logs |

Une page doit idéalement gérer trois états :

1. **Loading** : les données sont en cours de chargement.
2. **Success** : les données sont chargées.
3. **Error** : une erreur est survenue.

Les composants `Loading.jsx` et `ErrorMessage.jsx` servent à uniformiser cet affichage.

---

# 18. Tests à effectuer après une modification

## 18.1 Tests généraux

- [ ] Le backend démarre.
- [ ] Le frontend démarre.
- [ ] La page d'accueil s'affiche.
- [ ] La connexion fonctionne.
- [ ] La déconnexion fonctionne.
- [ ] Les pages privées sont protégées.

## 18.2 Tests ADMIN

- [ ] Dashboard.
- [ ] Gestion des clients.
- [ ] Gestion des comptables.
- [ ] Gestion des factures.
- [ ] Gestion des missions.
- [ ] Gestion des documents.
- [ ] Profil.

## 18.3 Tests COMPTABLE

- [ ] Connexion.
- [ ] Accès aux pages autorisées.
- [ ] Gestion des clients.
- [ ] Consultation des factures.
- [ ] Consultation des missions.
- [ ] Gestion des documents selon les permissions.
- [ ] Modification du profil.
- [ ] **À vérifier après correction backend :** les listes ne contiennent que les données des clients affectés à ce comptable.

## 18.4 Tests CLIENT

- [ ] Connexion.
- [ ] Consultation des factures via `/me/factures`.
- [ ] Consultation des missions via `/me/missions`.
- [ ] Consultation des documents autorisés.
- [ ] Modification du profil.
- [ ] Impossibilité d'accéder aux pages réservées aux autres rôles.

---

# 19. Bonnes pratiques pour continuer le développement

1. Toujours respecter la séparation entre pages, API, composants et logique métier.
2. Utiliser `apiClient.js` pour les appels HTTP classiques.
3. Vérifier les endpoints avant de les utiliser.
4. Respecter exactement les noms des propriétés définies dans les DTO Java.
5. Respecter les valeurs des enums : `ADMIN`, `COMPTABLE`, `CLIENT`, etc.
6. Gérer les états de chargement et les erreurs.
7. Réutiliser les composants existants.
8. Ne jamais considérer le frontend comme une protection suffisante.
9. Tester avec les trois rôles après chaque modification importante.
10. Modifier progressivement et tester régulièrement.
11. Vérifier les imports avant de remplacer un fichier.
12. Mettre à jour la documentation lorsque l'architecture évolue.

---

# 20. Glossaire

| Terme | Signification |
|---|---|
| API | Interface de communication entre frontend et backend |
| Endpoint | URL correspondant à une opération backend |
| CRUD | Create, Read, Update, Delete |
| DTO | Objet de transfert de données |
| DAO | Couche d'accès à la base de données |
| Service | Couche contenant les règles métier |
| Controller | Couche qui reçoit les requêtes HTTP |
| JWT | Jeton d'authentification |
| Context API | Mécanisme React de partage d'état |
| Hook | Fonction React réutilisable |
| Route | URL associée à une page |
| FormData | Format permettant d'envoyer des fichiers et des champs |
| Blob | Objet représentant des données binaires |
| Soft delete | Désactivation logique sans suppression physique |

---

# 21. Résumé : comment comprendre le projet rapidement

Pour comprendre ou modifier une fonctionnalité, ouvrir les fichiers dans cet ordre :

1. **Page React** : comprendre ce que l'utilisateur voit et les actions disponibles.
2. **Fichier API** : comprendre quel endpoint est appelé.
3. **apiClient.js** : comprendre comment la requête est envoyée.
4. **Controller Java** : comprendre l'endpoint et les paramètres reçus.
5. **Service Java** : comprendre les règles métier.
6. **DAO Java** : comprendre les requêtes SQL.
7. **Base de données** : comprendre les données réellement stockées.

## Principe fondamental de l'architecture

**React présente et orchestre l'expérience utilisateur.**

**Les fichiers API assurent la communication avec le backend.**

**Le backend applique les règles métier et contrôle les autorisations.**

**La base de données conserve les informations.**

En respectant cette séparation, il est possible d'améliorer le design, d'ajouter des fonctionnalités, de modifier les formulaires ou de faire évoluer les modules sans désorganiser l'ensemble du projet.
