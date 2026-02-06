# Roomly

...

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose installés 
_En vrai installez juste **Docker desktop c'est tout.**_

### Installation

1. **Démarrer tous les services**

```bash
   docker-compose up -d --build
```

2. **Exécuter les migrations** (première fois uniquement)

```bash
   docker exec -it roomly_api alembic upgrade head
```

3. **Accéder à l'application**
   - Frontend : http://localhost:5173
   - API : http://localhost:8000/docs
   - pgAdmin : http://localhost:5050

## 📦 Services

| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Base de données |
| **pgAdmin** | 5050 | Interface web pour gérer la BDD |
| **API** | 8000 | Backend FastAPI |
| **Frontend** | 5173 | Interface React |

## 🗄️ Accès Base de Données

### pgAdmin (Interface Web)
1. Ouvrir http://localhost:5050
2. Se connecter :
   - Email : `admin@roomly.com`
   - Mot de passe : `admin`
3. Ajouter un serveur :
   - **Host** : `db`
   - **Port** : `5432`
   - **Database** : `roomly_db`
   - **Username** : `roomly_user`
   - **Password** : `roomly_password`

### Ligne de commande
```bash
docker exec -it roomly_db psql -U roomly_user -d roomly_db
```

## 🔧 Commandes Utiles

```bash
# Arrêter les services
docker-compose down

# Arrêter et supprimer les données (réinitialiser la BDD)
docker-compose down -v

# Voir les logs
docker-compose logs -f api

# Reconstruire après modification du code
docker-compose up -d --build api

# Créer une nouvelle migration
docker exec -it roomly_api alembic revision --autogenerate -m "description"

# Appliquer les migrations
docker exec -it roomly_api alembic upgrade head
```

## 📝 Notes

- Les migrations Alembic sont dans `back/alembic/versions/`
- Le code s'exécute entièrement dans Docker (pas de dossiers partagés)
- La base de données utilise `postgresql+asyncpg` pour de meilleures performances
