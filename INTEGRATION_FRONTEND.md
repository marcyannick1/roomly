# 🏡 Roomly - Intégration Nouveau Frontend

## Configuration effectuée

Le nouveau frontend généré par Emergent a été intégré avec le backend existant.

### 🔧 Modifications Backend

#### 1. Routes API avec préfixe `/api`
Toutes les routes sont maintenant disponibles avec le préfixe `/api` pour compatibilité :
- `/api/auth/*` - Authentification
- `/api/users/*` - Utilisateurs
- `/api/students/*` - Étudiants
- `/api/landlords/*` - Bailleurs
- `/api/properties/*` - Annonces (alias de listings)
- `/api/matches/*` - Matches
- `/api/swipes/*` - Swipes (likes/dislikes)
- `/api/messages/*` - Messagerie
- `/api/notifications/*` - Notifications
- `/api/visits/*` - Visites
- `/api/stats/*` - Statistiques

#### 2. Schémas Adaptés
- **UserCreate/UserOut** : Ajout de `first_name`, `last_name`, `role`, `phone` (alias)
- **ListingOut** : Ajout de `images`, `rent`, `property_type`, `amenities`, `rooms`, `bedrooms`
- **Auth responses** : Retourne `token` ET `session_token` pour compatibilité

#### 3. Nouvelles Routes
- `GET /api/properties/swipe?token=xxx` - Feed pour swiper
- `GET /api/properties/landlord/my?token=xxx` - Mes annonces (landlord)
- `GET /api/stats/landlord?token=xxx` - Statistiques landlord
- `GET /api/notifications/unread-count?token=xxx` - Nombre de notifications non lues

#### 4. Authentification
Le backend supporte maintenant 2 méthodes d'auth :
- **Header Bearer** : `Authorization: Bearer <token>` (existant)
- **Query Param** : `?token=<token>` (nouveau frontend)

### 🎨 Configuration Frontend

#### Fichier `.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8000
ENABLE_HEALTH_CHECK=false
```

#### Structure
- **frontend/** - Nouveau frontend Emergent (React + CRA)
- **front/** - Ancien frontend (React + Vite) - peut être archivé

### 🚀 Lancement

#### Backend
```bash
cd back
uvicorn main:app --reload
```

Le backend sera accessible sur http://localhost:8000
Documentation API: http://localhost:8000/docs

#### Frontend (nouveau)
```bash
cd frontend
yarn install  # ou npm install
yarn start    # ou npm start
```

Le frontend sera accessible sur http://localhost:3000

### 📋 Comptes de test

**Étudiant:**
- Email: `lucas.bernard@etudiant.fr`
- Mot de passe: `password123`

**Bailleur:**
- Email: `pierre.dupont@immo.fr`
- Mot de passe: `password123`

### 🔄 Flux d'authentification

1. Login/Register retourne `{ token, session_token, user }`
2. Frontend stocke le token dans `localStorage` sous `roomly_token`
3. Toutes les requêtes incluent `?token=xxx` en query param

### 🎯 Routes principales utilisées

**Authentification:**
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me?token=xxx` - Utilisateur actuel

**Annonces (Student):**
- `GET /api/properties/swipe?token=xxx&limit=20` - Feed de swipe
- `POST /api/students/{user_id}/like/{listing_id}` - Liker une annonce
- `GET /api/matches?token=xxx` - Mes matches

**Annonces (Landlord):**
- `GET /api/properties/landlord/my?token=xxx` - Mes annonces
- `POST /api/properties?token=xxx` - Créer une annonce
- `GET /api/stats/landlord?token=xxx` - Statistiques

**Messagerie:**
- `GET /api/messages/{match_id}?token=xxx` - Messages d'un match
- `POST /api/messages/{match_id}?token=xxx` - Envoyer un message

**Visites:**
- `GET /api/visits?token=xxx` - Mes visites
- `POST /api/visits?token=xxx` - Créer une visite

### ⚠️ Notes importantes

1. **CORS** : Le backend autorise `http://localhost:3000` (nouveau frontend)
2. **Token** : Le frontend utilise localStorage, pas de cookies
3. **Images** : Les URLs sont dans `listing.images[]` (compatible frontend)
4. **Properties vs Listings** : Les deux termes sont interchangeables côté API

### 🐛 Troubleshooting

**Erreur 401 Unauthorized:**
- Vérifier que le token est bien passé en query param
- Vérifier que l'utilisateur existe dans la DB

**Erreur 404 sur /api/***:**
- Vérifier que le backend tourne sur http://localhost:8000
- Vérifier `.env` du frontend

**Les annonces ne s'affichent pas:**
- Vérifier que des listings existent en DB
- Lancer `clean_and_seed.py` pour créer des données de test

### 📊 Données de test

Pour populer la DB avec des données de test :
```bash
cd back
python clean_and_seed.py
```

Cela va créer :
- Utilisateurs (étudiants et bailleurs)
- Annonces avec photos
- Likes et matches
- Messages et notifications

---

**Dernière mise à jour:** 8 février 2026
