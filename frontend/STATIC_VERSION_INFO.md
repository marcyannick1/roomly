# Version Statique de Roomly Frontend

## Changements effectués

Cette version du frontend Roomly a été convertie en **application statique** sans aucune dépendance backend.

### ✅ Ce qui a été fait :

1. **Suppression de toutes les dépendances backend**
   - ❌ Supprimé `axios` de package.json
   - ✅ Remplacé par des données mock locales

2. **Suppression de la configuration Craco**
   - ❌ Supprimé `craco.config.js`
   - ❌ Supprimé `@craco/craco` de devDependencies

3. **Création de données mock**
   - ✅ Créé `src/mockData.js` avec :
     - Utilisateurs (étudiant, propriétaire)
     - Propriétés
     - Matchs
     - Messages
     - Notifications
     - Événements calendrier
     - Statistiques

4. **Mise à jour du contexte Auth (App.js)**
   - ✅ Authentification simulée avec localStorage
   - ✅ Login/Register utilisent les mock data
   - ✅ Les données mock sont fournies via le contexte Auth

5. **Mise à jour de toutes les pages**
   - ✅ StudentDashboard.jsx
   - ✅ LandlordDashboard.jsx
   - ✅ LoginPage.jsx
   - ✅ RegisterPage.jsx
   - ✅ MapPage.jsx
   - ✅ ChatPage.jsx
   - ✅ MatchesPage.jsx
   - ✅ PropertyDetailPage.jsx
   - ✅ ProfilePage.jsx
   - ✅ CalendarPage.jsx
   - ✅ AddPropertyPage.jsx

## Comment démarrer

```bash
# Installer les dépendances
npm install
# ou
yarn install

# Démarrer le serveur de développement
npm start
# ou
yarn start

# Construire pour la production
npm run build
# ou
yarn build
```

## Comptes de test

### Étudiant
- Email: `student@example.com`
- Mot de passe: N'importe quel mot de passe

### Propriétaire
- Email: `landlord@example.com`
- Mot de passe: N'importe quel mot de passe

## Données disponibles

L'application utilise des données mock pour :
- **3 propriétés** avec images, descriptions, prix, localisation
- **2 matchs** entre étudiants et propriétaires
- **Messages de chat** fictifs
- **Événements calendrier** d'exemple
- **Statistiques** de propriétaire

## Notes

- Les données sont réinitialisées à chaque rechargement de la page
- Les modifcations apportées à travers l'interface ne sont pas persistées
- Aucun appel réseau n'est effectué
- L'application est entièrement statique et fonctionnelle localement

## Pour ajouter plus de données mock

Éditez `src/mockData.js` et ajoutez vos données au format JSON. Elles seront automatiquement disponibles dans toutes les pages via le contexte Auth.
