# Roomly

...

## 🚀 Démarrage Rapide

### Prérequis
- **Docker & Docker Compose** installés (pour la base de données)
- **Node.js 18+** (pour le frontend React/Vite)
- **Python 3.10+** (pour le backend FastAPI)
- **uv** installé (gestionnaire de dépendances Python)

#### Installation de uv

**macOS / Linux :**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows :**
```bash
powershell -ExecutionPolicy BypassUser -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Ou avec Homebrew (macOS) :
```bash
brew install uv
```

Vérifier l'installation :
```bash
uv --version
```

### Installation

1. **Configuration de l'environnement** ⚠️ **OBLIGATOIRE**

```bash
   # Copier le fichier d'environnement dans la racine du projet
   cp .env.example .env
   
   # Éditer .env si nécessaire (valeurs par défaut OK pour le développement)
```

> 📝 **Note**: Un seul fichier `.env` est utilisé, à la **racine du projet**. Toutes les variables d'environnement y sont définies.

2. **Démarrer la base de données (Docker)**

```bash
   docker-compose up -d
```

### 🏃 Lancer l'Application

L'application nécessite de lancer le backend et le frontend **séparément** (ils ne sont pas dockerisés).

#### Backend (FastAPI) - À lancer en premier ⚠️

```bash
# 1. Se placer dans le dossier backend
cd backend

# 2. Lancer l'API avec uv (uv installe et gère automatiquement les dépendances)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

L'API sera accessible à : http://localhost:8000/docs (Swagger UI)

#### Frontend (React/Vite)

Dans un **autre terminal** :

```bash
# 1. Se placer dans le dossier frontend
cd frontend

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible à : http://localhost:5173

#### Accès à l'application

Une fois les deux services lancés :
   - Frontend : http://localhost:5173
   - API : http://localhost:8000/docs (Swagger UI)
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
