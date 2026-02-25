🎯 GUIDE DE DÉMARRAGE - Roomly Frontend Statique

## ✅ Pré-requis

- Node.js 16+ installé
- npm ou yarn
- Un navigateur moderne

## 🚀 Démarrage rapide

```bash
# 1. Se placer dans le dossier
cd "frontend copie"

# 2. Installer les dépendances
npm install
# ou
yarn install

# 3. Démarrer le serveur de développement
npm start
# ou
yarn start
```

L'application s'ouvrira automatiquement sur http://localhost:3000

## 👤 Comptes de test

### Compte Étudiant
- **Email**: student@example.com
- **Mot de passe**: n'importe quel mot de passe
- **Accès**: Interface de recherche/swipe de propriétés

### Compte Propriétaire
- **Email**: landlord@example.com
- **Mot de passe**: n'importe quel mot de passe
- **Accès**: Dashboard de gestion des annonces

## 🧭 Navigation

### Pour les étudiants
- **Swipe** - Découvrir et liker les propriétés
- **Matches** - Voir les matchs établis
- **Chat** - Échanger avec les propriétaires
- **Carte** - Visualiser les propriétés géographiquement
- **Profil** - Éditer le profil

### Pour les propriétaires
- **Dashboard** - Voir le résumé des annonces
- **Ajouter annonce** - Créer une nouvelle propriété
- **Matches** - Voir les candidatures
- **Chat** - Échanger avec les étudiants
- **Calendrier** - Gérer les visites
- **Carte** - Visualiser ses annonces

## 📦 Build pour production

```bash
npm run build
# ou
yarn build
```

Les fichiers compilés seront dans le dossier `build/`

## 🐛 Dépannage

### "Cannot find module 'axios'"
- Vous pouvez ignorer cet avertissement lors de la compilation
- L'application n'utilise que des données mock

### Port 3000 déjà utilisé
```bash
# Utiliser un port différent
PORT=3001 npm start
```

## 🔄 Structures des données

Les données mock sont définies dans `src/mockData.js`:
- **mockUser** - Profil propriétaire
- **mockStudentUser** - Profil étudiant
- **mockProperties** - Liste des annonces
- **mockMatches** - Liste des matchs
- **mockMessages** - Messages de chat
- **mockCalendarEvents** - Événements calendrier

## 📝 Notes importantes

1. **Les données ne persistent pas** - Elles se réinitialisent au rechargement
2. **Pas de requêtes réseau** - Tout fonctionne localement
3. **Pas de base de données** - Les données sont en mémoire
4. **Mode développement seulement** - Ceci n'est pas une application de production

## 🔗 Ressources

- [Documentation détaillée](STATIC_VERSION_INFO.md)
- [Résumé des changements](CHANGES_SUMMARY.md)
- [Vérification complète](VERIFICATION.md)

---

**Bon développement! 🎉**
