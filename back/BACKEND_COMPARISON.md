# Comparaison Backend Emergent vs Roomly

## Architecture globale

### Emergent (MongoDB + FastAPI simple)
- **Base de données** : MongoDB avec Motor (async driver)
- **Auth** : Tokens simples (secrets.token_hex), stockés en mémoire
- **Modèles** : Pydantic uniquement, pas d'ORM
- **Migrations** : Aucune (NoSQL)
- **Structure** : Tout dans un seul fichier `main.py`

### Roomly (PostgreSQL + FastAPI robuste) ✅
- **Base de données** : PostgreSQL avec SQLAlchemy async
- **Auth** : JWT avec bcrypt, tokens sécurisés avec expiration
- **Modèles** : SQLAlchemy ORM + Pydantic schemas séparés
- **Migrations** : Alembic (versionning de la BDD)
- **Structure** : Séparation claire (models, schemas, controllers, routes)

---

## Modèle utilisateur

### Emergent
```python
class User:
    - email, first_name, last_name
    - role: "student" | "landlord"  # Un seul champ
    - profile_image, phone, bio
    # Champs spécifiques selon role:
    - university, budget_min, budget_max (students)
    - company_name, is_agency (landlords)
```

### Roomly ✅
```python
class User:
    - email, name, hashed_password
    - is_landlord: boolean
    - telephone, photo

class Student (table séparée):
    - user_id (FK)
    - university, budget_min, budget_max

class Landlord (table séparée):
    - user_id (FK)
    - company_name
```

**Avantage Roomly** : 
- Relations claires avec foreign keys
- Intégrité référentielle
- Pas de champs NULL inutiles
- Requêtes SQL optimisées avec JOINs

---

## Modèle Property/Listing

### Emergent
```python
class Property:
    - title, description, price, surface
    - rooms, bedrooms  # Nombre de pièces
    - address, city, postal_code, lat, lng
    - property_type: "studio" | "apartment" | "room" | "colocation"
    - furnished, colocation, available_from
    - images: List[str]  # URLs directement dans le doc
    - amenities: List[str]  # ["wifi", "washing_machine"]
    - views_count, likes_count  # Compteurs
```

### Roomly
```python
class Listing:
    - title, description, price, surface
    - room_type (équivalent property_type)
    - city, address, postal_code, lat, lng
    - floor, total_floors
    - furnished, available_from
    - min_duration_months, deposit, charges_included
    - wifi, washing_machine, kitchen, parking... (colonnes booléennes)
    
class ListingPhoto (table séparée):
    - listing_id (FK)
    - url
```

**Avantages Roomly** :
- Photos en table séparée (meilleure scalabilité)
- Amenities en colonnes = requêtes SQL efficaces (`WHERE wifi = true`)
- Champs financiers détaillés (deposit, charges)

**Manques Roomly** :
- ❌ Pas de rooms/bedrooms
- ❌ Pas de views_count, likes_count

---

## Système de Likes/Matches

### Emergent
```python
# Swipe (action étudiante)
class Swipe:
    - user_id, property_id
    - action: "like" | "dislike" | "superlike"
    
# Match (créé automatiquement sur like)
class Match:
    - student_id, landlord_id, property_id
    - is_superlike
```

### Roomly ✅
```python
class Like:
    - user_id, listing_id
    - is_like: boolean  # True=like, False=dislike
    
class Match:
    - student_id, landlord_id, listing_id
```

**Similaire** mais Emergent a le concept de "superlike"

---

## Système de Messages

### Les deux
```python
class Message:
    - match_id, sender_id, content
    - created_at, is_read
```

**Identique** ✅

---

## Système de Visites

### Emergent
```python
class Visit:
    - property_id, match_id, student_id, landlord_id
    - scheduled_date, scheduled_time (strings)
    - notes, status: "pending" | "confirmed" | "cancelled" | "completed"
```

### Roomly
```python
class Visit:
    - listing_id, student_id, landlord_id
    - scheduled_at (datetime)
    - status, notes
```

**Similaire** ✅

---

## Notifications

### Emergent ✅
```python
class Notification:
    - user_id, type, title, message
    - related_id (ID du match/message/etc)
    - is_read
```

### Roomly ✅
```python
class Notification:
    - user_id, type, content
    - reference_type, reference_id
    - is_read
```

**Identique** ✅

---

## Authentification

### Emergent (Simple)
```python
# Hash simple
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Tokens aléatoires stockés en mémoire
active_tokens = {}  # {token: user_id}
token = secrets.token_hex(32)

# Validation
async def get_current_user(token: str = Query(...)) -> dict:
    if token not in active_tokens:
        raise HTTPException(401)
    user_id = active_tokens[token]
    return await db.users.find_one({"id": user_id})
```

**Problèmes** :
- ❌ SHA256 seul = vulnérable aux rainbow tables
- ❌ Tokens en mémoire = perdus au redémarrage
- ❌ Pas d'expiration des tokens
- ❌ Pas de refresh tokens

### Roomly (Robuste) ✅
```python
# Bcrypt avec salt
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

# JWT avec expiration
def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

# Validation JWT
def decode_access_token(token: str) -> dict:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    return payload
```

**Avantages** :
- ✅ Bcrypt = résistant aux rainbow tables
- ✅ JWT = tokens auto-contenus, pas de stockage serveur
- ✅ Expiration automatique
- ✅ Standard industriel

---

## Routes API

### Emergent
```
/api/auth/register
/api/auth/login
/api/auth/me
/api/auth/profile

/api/properties (GET, POST)
/api/properties/swipe (GET) - Annonces non swipées
/api/properties/{id} (GET, PUT, DELETE)
/api/properties/landlord/my (GET)

/api/swipes (POST)
/api/matches (GET)
/api/matches/{id} (GET)

/api/messages/{match_id} (GET, POST)
/api/visits (GET, POST)
/api/visits/{id}/status (PUT)

/api/notifications (GET)
/api/notifications/{id}/read (PUT)
/api/notifications/read-all (PUT)
/api/notifications/unread-count (GET)

/api/stats/landlord (GET)
/api/seed (POST) - Pour tests
```

### Roomly
```
/auth/register, /auth/login, /auth/me
/listings (GET, POST)
/listings/{id} (GET, PUT, DELETE)
/likes (GET, POST, DELETE)
/matches (GET)
/messages (GET, POST)
/visits (GET, POST, PUT)
/notifications (GET, PUT)
```

**Manques Roomly** :
- ❌ Pas de /properties/swipe (annonces non swipées)
- ❌ Pas de /stats/landlord
- ❌ Pas de /notifications/unread-count

---

## Endpoint `/properties/swipe`

### Logique Emergent
```python
@router.get("/properties/swipe")
async def get_properties_for_swipe(current_user, limit: int = 10):
    # 1. Récupérer les IDs déjà swipés par l'utilisateur
    swiped = await db.swipes.find({"user_id": current_user['id']})
    swiped_ids = [s['property_id'] for s in swiped]
    
    # 2. Exclure ces IDs + appliquer budget utilisateur
    query = {
        "is_active": True,
        "id": {"$nin": swiped_ids}
    }
    if current_user.get('budget_max'):
        query["price"] = {"$lte": current_user['budget_max']}
    
    # 3. Limiter à 10 résultats
    properties = await db.properties.find(query).limit(limit).to_list(limit)
    
    # 4. Incrémenter views_count
    for prop in properties:
        await db.properties.update_one(
            {"id": prop['id']},
            {"$inc": {"views_count": 1}}
        )
    
    return properties
```

**À implémenter dans Roomly** ✅

---

## Endpoint `/stats/landlord`

### Logique Emergent
```python
@router.get("/stats/landlord")
async def get_landlord_stats(current_user):
    properties = await db.properties.find({"landlord_id": current_user['id']})
    matches = await db.matches.find({"landlord_id": current_user['id']})
    visits = await db.visits.find({"landlord_id": current_user['id']})
    
    return {
        "total_properties": len(properties),
        "active_properties": len([p for p in properties if p.get('is_active')]),
        "total_views": sum(p.get('views_count', 0) for p in properties),
        "total_likes": sum(p.get('likes_count', 0) for p in properties),
        "total_matches": len(matches),
        "total_visits": len(visits),
        "pending_visits": len([v for v in visits if v.get('status') == 'pending']),
        "confirmed_visits": len([v for v in visits if v.get('status') == 'confirmed'])
    }
```

**À implémenter dans Roomly** ✅

---

## Système de Seed Data

### Emergent
- Endpoint `/api/seed` qui crée des données de test
- 2 landlords : pierre.dupont@immo.fr, marie.martin@gmail.com
- 2 students : lucas.bernard@etudiant.fr, emma.dubois@etudiant.fr
- 8 propriétés parisiennes avec vraies photos Unsplash

### Roomly
- Script `clean_and_seed.py` pour Lyon
- Script `seed_emergent_data.py` ✅ créé avec les 8 annonces parisiennes

**Avantage Roomly** : Scripts séparés (pas exposés en API publique)

---

## Résumé : Ce qui manque à Roomly

### Fonctionnalités à ajouter
1. ✅ **FAIT** : 8 annonces Emergent créées via script
2. 🔄 **À FAIRE** : Ajouter `views_count`, `likes_count` au modèle Listing
3. 🔄 **À FAIRE** : Endpoint `/api/properties/swipe` (annonces non swipées)
4. 🔄 **À FAIRE** : Endpoint `/api/stats/landlord` (dashboard bailleur)
5. 🔄 **À FAIRE** : Support "superlike" dans le système de likes
6. 🔄 **À FAIRE** : Endpoint `/api/notifications/unread-count`
7. 🔄 **À FAIRE** : Ajouter `rooms`, `bedrooms` au modèle Listing

### Forces de Roomly à conserver ✅
- PostgreSQL (intégrité, transactions, relations)
- JWT + bcrypt (sécurité)
- Alembic (migrations versionnées)
- Séparation models/schemas/controllers/routes
- Tests possibles avec fixtures SQL
- Performances avec indexes PostgreSQL

---

## Recommandations

1. **Garder l'architecture Roomly** ✅
   - Ne PAS migrer vers MongoDB
   - Ne PAS simplifier l'auth vers tokens simples
   - Ne PAS tout mettre dans un seul fichier

2. **S'inspirer d'Emergent pour**
   - Le système de swipe (filtrage des annonces déjà vues)
   - Les statistiques bailleurs (dashboard complet)
   - Le concept de "superlike" (priorité dans les matches)
   - Les compteurs de vues/likes (analytics)

3. **Ajouter des colonnes à Listing**
   ```sql
   ALTER TABLE listings ADD COLUMN views_count INTEGER DEFAULT 0;
   ALTER TABLE listings ADD COLUMN likes_count INTEGER DEFAULT 0;
   ALTER TABLE listings ADD COLUMN rooms INTEGER;
   ALTER TABLE listings ADD COLUMN bedrooms INTEGER;
   ```

4. **Implémenter les endpoints manquants**
   - `/api/properties/swipe` → listing_ctrl.get_swipeable_listings()
   - `/api/stats/landlord` → landlord_ctrl.get_stats()
   - `/api/notifications/unread-count` → notification_ctrl.get_unread_count()

---

## Conclusion

**Backend Roomly est supérieur** en termes de :
- Architecture (séparation, testabilité)
- Sécurité (JWT, bcrypt, PostgreSQL)
- Maintenabilité (Alembic, ORM, typage)
- Scalabilité (indexes, relations, transactions)

**Backend Emergent a de bonnes idées** pour :
- Fonctionnalités métier (swipe, stats, superlikes)
- UX (compteurs de vues, analytics simples)

👉 **Action recommandée** : Ajouter les fonctionnalités Emergent à l'architecture Roomly
