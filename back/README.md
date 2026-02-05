# Roomly Backend

API FastAPI pour la plateforme Roomly de mise en relation entre étudiants et propriétaires.

## Prérequis

- Python 3.12+
- PostgreSQL
- Compte Cloudinary (pour la gestion des images)

## Installation

1. Créer et activer l'environnement virtuel :
```bash
python -m venv .venv
source .venv/bin/activate  # Sur macOS/Linux
# ou
.venv\Scripts\activate  # Sur Windows
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos informations :
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/roomly
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Initialiser la base de données avec Alembic :
```bash
alembic upgrade head
```

## Lancement du serveur

```bash
uvicorn main:app --reload
```

Le serveur sera accessible sur `http://localhost:8000`

Documentation interactive de l'API :
- Swagger UI : `http://localhost:8000/docs`
- ReDoc : `http://localhost:8000/redoc`

## Migrations avec Alembic

### Créer une nouvelle migration
Après avoir modifié les modèles SQLAlchemy :
```bash
alembic revision --autogenerate -m "description de la migration"
```

### Appliquer les migrations
```bash
alembic upgrade head
```

### Revenir en arrière
```bash
alembic downgrade -1  # Annuler la dernière migration
alembic downgrade <revision_id>  # Revenir à une révision spécifique
```

### Voir l'historique des migrations
```bash
alembic history
alembic current  # Voir la révision actuelle
```

## Structure du projet

```
back/
├── app/
│   ├── controllers/      # Logique métier
│   ├── routes/          # Endpoints API
│   ├── models/          # Modèles SQLAlchemy
│   ├── schemas/         # Schémas Pydantic
│   ├── db/              # Configuration base de données
│   ├── core/            # Configuration centrale
│   ├── ai/              # Fonctionnalités IA
│   └── airflow/         # Workflows Airflow
├── alembic/             # Migrations de base de données
├── main.py              # Point d'entrée de l'application
└── requirements.txt     # Dépendances Python
```

## API Endpoints

- `/users` - Gestion des utilisateurs
- `/students` - Profils étudiants
- `/landlords` - Profils propriétaires
- `/auth` - Authentification
- `/listings` - Annonces de logement
- `/listing-photos` - Photos des annonces
- `/matches` - Système de matching
