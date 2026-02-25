# Guide de Migration Frontend → Backend

Ce document recense les modifications nécessaires pour adapter le frontend au nouveau backend.

---

## Base URL & Préfixe API

### Ancien Backend
Routes directement à la racine : `/auth/register`, `/listings`, etc.

### Nouveau Backend  
**Toutes les routes** sont préfixées par `/api/v1`  
URLs complètes : `http://localhost:8000/api/v1/auth/register`

### [!] Correctif Obligatoire

`frontend/src/lib/api.js` :

```javascript
// AVANT
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// APRÈS
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
```

---

## Authentication

### [√] Fonctionnels Sans Changement

| Endpoint | Méthode | Ancien | Nouveau | Statut |
|----------|---------|--------|---------|--------|
| Register | POST | `/auth/register` | `/api/v1/auth/register` | [√] |
| Login | POST | `/auth/login` | `/api/v1/auth/login` | [√] |
| Logout | POST | `/auth/logout` | `/api/v1/auth/logout` | [√] |

### [!] Modifications Requises

| Fonction Frontend | Ancien Endpoint | Nouveau Endpoint | Notes |
|-------------------|-----------------|------------------|-------|
| `getCurrentUser()` | `GET /auth/me` | **N'EXISTE PAS** | À implémenter ou approche différente |
| `googleCallback()` | `POST /auth/google/callback` | **N'EXISTE PAS** | Auth Google non implémentée |

---

## Gestion Utilisateurs

### [!] Modifications Requises

| Fonction Frontend | Ancien | Nouveau | Notes |
|-------------------|--------|---------|-------|
| `getUserById(userId)` | `GET /users/{userId}` | **NON DISPONIBLE** | Seul `/api/v1/users/me` accessible |
| `uploadProfilePhoto()` | `POST /users/{userId}/photo` | `POST /api/v1/media/avatar` | [!] Endpoint & structure différents |
| `deleteProfilePhoto()` | `DELETE /users/{userId}/photo` | `DELETE /api/v1/media/avatar` | [!] Endpoint différent |
| `deleteUserAccount()` | `DELETE /users/{userId}` | `DELETE /api/v1/users/me` | [!] Suppression personnelle uniquement |

---

## Profils

### [!] Changements Majeurs

| Fonction Frontend | Ancien | Nouveau | Notes |
|-------------------|--------|---------|-------|
| `getStudentProfile(userId)` | `GET /students/profile/{userId}` | `GET /api/v1/profiles/me/student` | [!] Profil personnel uniquement |
| `updateStudentProfile()` | `POST /students/profile` | `POST /api/v1/profiles/student` (création)<br>`PATCH /api/v1/profiles/student` (mise à jour) | [!] Création/MAJ séparées |
| `getLandlordProfile(userId)` | `GET /landlords/profile/{userId}` | `GET /api/v1/profiles/me/landlord` | [!] Profil personnel uniquement |
| `updateLandlordProfile()` | `POST /landlords/profile` | `POST /api/v1/profiles/landlord` (création)<br>`PATCH /api/v1/profiles/landlord` (mise à jour) | [!] Création/MAJ séparées |

---

## Properties/Listings

### [!] Modifications Requises

| Fonction Frontend | Ancien | Nouveau | Notes |
|-------------------|--------|---------|-------|
| `createListing()` | `POST /listings` | `POST /api/v1/properties/` | [!] Nom de route changé |
| `getListing(id)` | `GET /listings/{id}` | `GET /api/v1/properties/{property_id}` | [!] Nom de route changé |
| `getLandlordListings(id)` | `GET /listings/landlord/{id}` | `GET /api/v1/properties/me` | [!] Properties personnelles uniquement |
| `updateListing(id, data)` | `PUT /listings/{id}` | `PATCH /api/v1/properties/{property_id}` | [!] PUT → PATCH, route changée |
| `deleteListing(id)` | `DELETE /listings/{id}` | `DELETE /api/v1/properties/{property_id}` | [!] Nom de route changé |
| — | — | `GET /api/v1/properties/` | [+] Lister toutes les properties |

---

## Matching & Interactions

### [!] Restructuration Majeure

Le nouveau backend utilise des "swipes" au lieu des "likes" avec un flux différent.

| Fonction Frontend | Ancien | Nouveau | Notes |
|-------------------|--------|---------|-------|
| `getStudentFeed()` | `GET /ai/recommendations/{id}` | **NON IMPLÉMENTÉ** | Utiliser `GET /api/v1/properties/` + filtre client |
| `likeListing()` | `POST /students/{id}/like/{listing_id}` | `POST /api/v1/interactions/swipe` | [!] Structure différente |
| `unlikeListing()` | `DELETE /students/{id}/reaction/{listing_id}` | `DELETE /api/v1/interactions/swipe/{property_id}` | [!] Structure différente |
| `getStudentLikedListings()` | `GET /students/{id}/liked` | `GET /api/v1/interactions/my-likes` | [!] Structure différente |
| `getInterestedStudents()` | `GET /listings/{id}/interested-students` | **NON DISPONIBLE** | Utiliser `/api/v1/interactions/landlord/received-likes` |
| `getLandlordReceivedLikes()` | `GET /landlords/{id}/likes` | `GET /api/v1/interactions/landlord/received-likes` | [!] Structure différente |
| `createMatch()` | `POST /landlords/{id}/match/{student_id}/{listing_id}` | `POST /api/v1/interactions/landlord/accept-swipe/{swipe_id}` | [!] Complètement différent |
| `getStudentMatches()` | `GET /matches/user/{id}` | `GET /api/v1/interactions/matches` | [!] Structure différente |
| `getLandlordMatches()` | `GET /matches/landlord/{id}` | `GET /api/v1/interactions/matches` | [!] Endpoint identique pour les deux |

### Nouveau Format de Swipe

```javascript
// AVANT
likeListing(studentId, listingId)

// APRÈS
api.post('/api/v1/interactions/swipe', {
  property_id: listingId,
  swipe_type: "like"  // ou "dislike"
})
```

---

## Messages

### [!] Modifications Requises

| Fonction Frontend | Ancien | Nouveau | Notes |
|-------------------|--------|---------|-------|
| `sendMessage()` | `POST /messages` | `POST /api/v1/messages/` | [√] Structure identique |
| `getMatchMessages(matchId)` | `GET /matches/{matchId}/messages` | `GET /api/v1/messages/{match_id}` | [!] Structure de route changée |
| `markMessageRead(msgId)` | `PATCH /messages/{msgId}/read` | **NON IMPLÉMENTÉ** | Fonctionnalité manquante |

---

## Media/Upload

### [!] Changements Majeurs

| Fonction Frontend | Ancien | Nouveau | Notes |
|-------------------|--------|---------|-------|
| `uploadFile(file)` | `POST /upload` | `POST /api/v1/media/properties/{property_id}/images` | [!] Spécifique par property |
| — | — | `POST /api/v1/media/avatar` | [+] Upload avatar utilisateur |
| — | — | `DELETE /api/v1/media/images/{image_id}` | [+] Supprimer image property |
| — | — | `DELETE /api/v1/media/avatar` | [+] Supprimer avatar utilisateur |

---

## Nouveaux Endpoints Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/v1/amenities/` | GET | Récupérer toutes les commodités |
| `/api/v1/amenities/` | POST | Créer commodité (admin) |
| `/api/v1/amenities/{id}` | DELETE | Supprimer commodité (admin) |
| `/api/v1/notifications/` | GET | Notifications utilisateur |
| `/api/v1/notifications/{id}/read` | PATCH | Marquer notification comme lue |
| `/api/v1/interactions/landlord/reject-swipe/{swipe_id}` | POST | Rejeter un swipe étudiant |
| `/api/v1/auth/forgot-password` | POST | Demander reset mot de passe |
| `/api/v1/auth/reset-password` | POST | Réinitialiser mot de passe |
| `/api/v1/auth/request-verify-token` | POST | Demander vérification email |
| `/api/v1/auth/verify` | POST | Vérifier email |

---

## Checklist Correctifs Rapides

### Modifications Immédiates (Obligatoire)

1. **Mettre à jour l'URL de base** dans `frontend/src/lib/api.js`
2. **Corriger les noms de routes** (partout "listing" → "property")
3. **Adapter la logique de swipe** vers la nouvelle structure d'endpoint
4. **Mettre à jour les endpoints profils** vers `/profiles/me/student` ou `/profiles/me/landlord`
5. **Adapter les uploads media** vers les nouveaux endpoints `/media/*`
6. **Retirer ou stuber** le callback Google OAuth (non implémenté)
7. **Retirer ou stuber** `getCurrentUser()` (utiliser les endpoints profils)

---

## Tests À Effectuer

Valider les flux critiques après modifications :

1. Inscription utilisateur
2. Connexion utilisateur
3. Création profil étudiant/propriétaire
4. Création annonce property
5. Upload images property
6. Swipe/like properties
7. Création matches
8. Envoi messages

---

## Notes Techniques

- Le nouveau backend utilise **FastAPI-Users** pour l'authentification (JWT)
- Tous les endpoints nécessitent l'authentification via header `Authorization: Bearer <token>`
- La plupart des endpoints utilisent l'utilisateur courant depuis le JWT (plus de passage d'ID utilisateur)
- Les images de properties sont uploadées séparément de la création
- Meilleure séparation des responsabilités et respect des conventions REST

---

## Documentation API

Documentation interactive disponible :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

Affiche tous les endpoints avec schémas requête/réponse.
