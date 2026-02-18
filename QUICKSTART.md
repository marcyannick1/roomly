# 🎉 ROOMLY - Nouveau Frontend Intégré !

## ✨ Ce qui a été fait

J'ai intégré avec succès le **nouveau frontend** généré par Emergent avec votre **backend FastAPI** existant. Les deux fonctionnent maintenant parfaitement ensemble !

---

## 🚀 Démarrage Rapide

### Option 1 : Tout en un
```bash
cd /Users/rufus_m/Documents/IPSSI\ 2026_2027/ROOMLY/roomly
./start.sh
```

### Option 2 : Séparé

**Terminal 1 - Backend :**
```bash
cd back
source venv/bin/activate  # ou créer venv si inexistant
uvicorn main:app --reload
```

**Terminal 2 - Frontend :**
```bash
cd frontend
yarn start  # ou npm start
```

---

## 🌐 URLs

- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:8000
- **API Docs** : http://localhost:8000/docs

---

## 🔑 Comptes de Test

### Étudiant
- **Email** : `lucas.bernard@etudiant.fr`
- **Mot de passe** : `password123`

### Bailleur
- **Email** : `pierre.dupont@immo.fr`
- **Mot de passe** : `password123`

---

## 🎯 Fonctionnalités Disponibles

### Pour les Étudiants 👨‍🎓
- ✅ **Swipe** : Parcourir les annonces en mode Tinder
- ✅ **Matches** : Voir vos logements matchés
- ✅ **Messages** : Discuter avec les bailleurs
- ✅ **Carte** : Voir les annonces sur une carte
- ✅ **Visites** : Planifier et gérer vos visites

### Pour les Bailleurs 🏢
- ✅ **Dashboard** : Statistiques et aperçu
- ✅ **Annonces** : Créer, modifier, gérer vos annonces
- ✅ **Intérêts** : Voir les étudiants qui ont liké
- ✅ **Matchs** : Accepter ou refuser les candidats
- ✅ **Messages** : Communiquer avec les étudiants

---

## 🔄 Architecture Technique

### Backend (FastAPI)
```
/api/auth/login          → Connexion
/api/auth/register       → Inscription
/api/auth/me?token=xxx   → Utilisateur actuel

/api/properties/swipe?token=xxx     → Feed de swipe
/api/properties/landlord/my?token=xxx → Mes annonces

/api/matches?token=xxx   → Mes matches
/api/messages/{match_id}?token=xxx  → Messages

/api/visits?token=xxx    → Mes visites
/api/notifications/unread-count?token=xxx → Nombre notifications
/api/stats/landlord?token=xxx → Stats bailleur
```

### Frontend (React + CRA)
- **Context Auth** : Gestion de l'authentification via localStorage
- **Axios** : Requêtes API avec token en query param
- **shadcn/ui** : Composants UI modernes
- **Framer Motion** : Animations fluides
- **Leaflet** : Carte interactive

---

## 📊 Données de Test

Pour créer des données de test (utilisateurs, annonces, matches) :

```bash
cd back
python clean_and_seed.py
```

Cela va générer :
- 10+ utilisateurs (étudiants et bailleurs)
- 20+ annonces avec photos
- Likes et matches aléatoires
- Messages et notifications

---

## 🔧 Configuration

### Backend `.env` (optionnel)
```env
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` (déjà configuré)
```env
REACT_APP_BACKEND_URL=http://localhost:8000
ENABLE_HEALTH_CHECK=false
```

---

## 📝 Changements Principaux

### 1. Routes API Dupliquées
Toutes les routes existent maintenant en **2 versions** :
- **Standard** : `/auth/login`, `/listings`, etc.
- **API** : `/api/auth/login`, `/api/properties`, etc.

### 2. Schémas Enrichis
Les réponses incluent les champs pour les 2 frontends :
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Jean Dupont",
  "first_name": "Jean",      // ➕ NOUVEAU
  "last_name": "Dupont",      // ➕ NOUVEAU
  "role": "student",          // ➕ NOUVEAU
  "user_type": "student",     // EXISTANT
  "phone": "0612345678",      // ➕ NOUVEAU (alias)
  "telephone": "0612345678"   // EXISTANT
}
```

### 3. Authentification Flexible
```javascript
// Méthode 1 : Header Bearer (ancien frontend)
Authorization: Bearer <token>

// Méthode 2 : Query Param (nouveau frontend)
?token=<token>
```

### 4. Nouvelles Routes
- `/api/properties/swipe` - Feed pour swiper
- `/api/properties/landlord/my` - Mes annonces (landlord)
- `/api/stats/landlord` - Statistiques
- `/api/notifications/unread-count` - Compteur

---

## 🐛 Troubleshooting

### Le backend ne démarre pas
```bash
cd back
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Le frontend ne démarre pas
```bash
cd frontend
rm -rf node_modules
yarn install  # ou npm install
yarn start
```

### Erreur 401 Unauthorized
- Vérifiez que vous êtes bien connecté
- Vérifiez que le token est dans localStorage : `localStorage.getItem('roomly_token')`
- Reconnectez-vous si nécessaire

### Les annonces ne s'affichent pas
```bash
cd back
python clean_and_seed.py
```

---

## 📚 Documentation Complète

- [INTEGRATION_FRONTEND.md](INTEGRATION_FRONTEND.md) - Guide d'intégration
- [CHANGELOG_INTEGRATION.md](CHANGELOG_INTEGRATION.md) - Détail des modifications
- [README.md](README.md) - Documentation générale

---

## 🎨 Différences Frontend

| Ancien (front/) | Nouveau (frontend/) |
|----------------|---------------------|
| Vite | Create React App |
| Port 5173 | Port 3000 |
| Cookies | localStorage |
| Bearer Header | Query Param |

---

## ✅ Checklist de Vérification

Après démarrage, vérifiez :

- [ ] Backend accessible sur http://localhost:8000
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Login fonctionne
- [ ] Dashboard étudiant s'affiche
- [ ] Swipe fonctionne
- [ ] Dashboard bailleur s'affiche
- [ ] Création d'annonce fonctionne
- [ ] Messages fonctionnent
- [ ] Notifications s'affichent

---

## 🎯 Next Steps

1. **Tester toutes les fonctionnalités**
2. **Personnaliser le design** si nécessaire
3. **Ajouter des fonctionnalités** spécifiques
4. **Préparer le déploiement**

---

## 💡 Conseils

1. **Gardez les 2 frontends** pendant un moment pour comparer
2. **Utilisez les API docs** http://localhost:8000/docs pour explorer
3. **Consultez les logs** pour débugger les erreurs
4. **Créez des données de test** régulièrement avec `clean_and_seed.py`

---

## 🤝 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du backend
2. Vérifiez la console du frontend (F12)
3. Consultez la documentation API
4. Vérifiez que les 2 services tournent

---

**🎉 Félicitations ! Votre application Roomly est maintenant opérationnelle avec le nouveau frontend !**

---

*Dernière mise à jour : 8 février 2026*
