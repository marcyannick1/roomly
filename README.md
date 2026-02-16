# Roomly

...

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose installés 
_En vrai installez juste **Docker desktop c'est tout.**_

### Installation

1. **Configuration de l'environnement** ⚠️ **OBLIGATOIRE**

```bash
   # Copier le fichier d'environnement dans la racine du projet
   cp .env.example .env
   
   # Éditer .env si nécessaire (valeurs par défaut OK pour le développement)
```

> 📝 **Note**: Un seul fichier `.env` est utilisé, à la **racine du projet**. Toutes les variables d'environnement y sont définies.

2. **Démarrer tous les services**

```bash
   docker-compose up -d --build
```

3. **Exécuter les migrations** (première fois uniquement)

```bash
   docker exec -it roomly_api uv run alembic upgrade head
```

4. **Accéder à l'application**
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
   - **Database** : `roomly`
   - **Username** : `postgres`
   - **Password** : `root`

### Ligne de commande
```bash
docker exec -it roomly_db psql -U postgres -d roomly
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
docker exec -it roomly_api uv run alembic revision --autogenerate -m "description"

# Appliquer les migrations
docker exec -it roomly_api uv run alembic upgrade head

# Accéder au shell du conteneur API
docker exec -it roomly_api /bin/bash

# Installer de nouvelles dépendances Python
docker exec -it roomly_api uv add package-name
```

## 📝 Notes

### Configuration
- **Un seul fichier `.env`** à la racine du projet contient toutes les variables d'environnement
- Le fichier `back/app/core/config.py` lit automatiquement ces variables
- Aucune valeur par défaut codée en dur - tout vient du `.env`

### Structure & Développement
- Les migrations Alembic sont dans `back/alembic/versions/`
- Le backend utilise **uv** pour la gestion des dépendances Python (rapide et moderne)
- Le code backend est monté en volume pour du hot-reload pendant le développement
- La base de données utilise `postgresql+asyncpg` pour de meilleures performances asynchrones
- Les données PostgreSQL persistent dans un volume Docker même après `docker-compose down`
