# Transitaire Express

![Transitaire Express Logo](./logo.png)

**Solution logistique professionnelle pour le suivi de colis entre la Chine et Kinshasa**

---

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Architecture Technique](#architecture-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du Projet](#structure-du-projet)
- [Guide d'Utilisation](#guide-dutilisation)
- [Déploiement](#déploiement)
- [API Documentation](#api-documentation)
- [Sécurité](#sécurité)
- [Contributions](#contributions)
- [Support](#support)
- [Licence](#licence)

---

## Présentation

**Transitaire Express** est une plateforme web moderne de gestion logistique conçue pour faciliter le suivi et la gestion des colis expédiés entre la Chine et Kinshasa (RDC). Développée avec les dernières technologies web, elle offre une interface intuitive et des fonctionnalités puissantes pour les transitaires et leurs clients.

### Objectifs Principaux

- **Suivi en temps réel** des colis tout au long du parcours
- **Gestion simplifiée** des expéditions internationales
- **Interface professionnelle** adaptée aux besoins des transitaires
- **Sécurité renforcée** avec gestion des rôles et permissions
- **Accessibilité mobile** pour une gestion nomade

---

## Fonctionnalités

### Fonctionnalités Principales

#### Gestion des Colis
- **Création** de nouveaux colis avec tracking automatique
- **Suivi** en temps réel avec historique complet
- **Mise à jour** des statuts avec commentaires
- **Recherche** avancée par tracking, client, catégorie
- **Filtrage** par statut et période

#### Gestion des Clients
- **Registre** des clients avec informations complètes
- **Historique** des expéditions par client
- **Coordonnées** détaillées (téléphone, ville, etc.)

#### Tarification Dynamique
- **Tarifs par catégorie** de produits
- **Support** des tarifs au kilogramme et à la pièce
- **Multi-devises** (USD, EUR, CDF)
- **Mise à jour** en temps réel des prix

#### Gestion des Utilisateurs
- **Rôles et permissions** (Admin / Agent)
- **Sécurité** renforcée avec authentification
- **Interface adaptative** selon le rôle
- **Création** de comptes agents par l'admin

### Fonctionnalités Techniques

#### Performance
- **Interface réactive** avec React 18
- **Chargement optimisé** avec lazy loading
- **Mise en cache** intelligente des données
- **Navigation fluide** entre les pages

#### Sécurité
- **Authentification** Supabase sécurisée
- **Row Level Security** sur toutes les tables
- **Validation** des entrées utilisateur
- **Protection** contre les attaques XSS

#### Accessibilité
- **Design responsive** pour tous les écrans
- **Interface mobile** optimisée
- **Navigation intuitive** avec keyboard support
- **Compatibilité** navigateurs modernes

---

## Architecture Technique

### Stack Technologique

#### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et développement
- **Tailwind CSS** pour le design system
- **Shadcn/ui** pour les composants UI
- **React Hook Form** avec Zod pour la validation
- **Sonner** pour les notifications toast

#### Backend & Base de Données
- **Supabase** comme backend BaaS
- **PostgreSQL** pour la base de données
- **Authentification** Supabase Auth
- **Realtime subscriptions** pour les mises à jour

#### Développement
- **ESLint** pour la qualité du code
- **TypeScript** pour la typage statique
- **Prettier** pour le formatage du code
- **Git** pour le version control

### Architecture de la Base de Données

```sql
-- Tables principales
profiles          -- Profils utilisateurs
clients           -- Clients enregistrés
colis             -- Colis/expéditions
categories_colis  -- Catégories de produits
tarifs            -- Tarification par catégorie
statuts           -- Statuts des colis
historique_statuts -- Historique des changements
```

### Flux de Données

```
Client Web  <--->  React App  <--->  Supabase API  <--->  PostgreSQL
                     |
                     v
                 Auth Context
                     |
                     v
                 Components
```

---

## Prérequis

### Système Requis

#### Développement
- **Node.js** 18.0+ (recommandé 20.x)
- **npm** 8.0+ ou **yarn** 1.22+
- **Git** 2.30+
- **Navigateur** moderne (Chrome 90+, Firefox 88+, Safari 14+)

#### Production
- **Domaine** avec SSL/TLS
- **Hébergement** compatible (Vercel, Netlify, etc.)
- **Compte Supabase** configuré

### Environnement Supabase

- **Projet Supabase** créé
- **Tables** migrées via le script SQL
- **RLS** activé sur toutes les tables
- **Auth** configuré avec les providers nécessaires

---

## Installation

### 1. Cloner le Projet

```bash
git clone https://github.com/votre-organisation/transitaire-express.git
cd transitaire-express
```

### 2. Installer les Dépendances

```bash
# Avec npm
npm install

# Ou avec yarn
yarn install
```

### 3. Configurer l'Environnement

Créer un fichier `.env.local` à la racine :

```env
# Supabase Configuration
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase

# Configuration Optionnelle
VITE_APP_NAME=Transitaire Express
VITE_APP_VERSION=1.0.0
```

### 4. Configurer la Base de Données

Exécuter le script de migration SQL dans votre projet Supabase :

```sql
-- Exécuter le contenu du fichier :
-- supabase/migrations/20260416121105_create_transitaire_express_schema.sql
```

### 5. Démarrer le Développement

```bash
# Avec npm
npm run dev

# Ou avec yarn
yarn dev
```

L'application sera disponible sur `http://localhost:5173`

---

## Configuration

### Variables d'Environnement

| Variable | Description | Requise |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | Oui |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | Oui |
| `VITE_APP_NAME` | Nom de l'application | Non |
| `VITE_APP_VERSION` | Version de l'application | Non |

### Configuration Supabase

#### Authentification
- Activer **Email/Password** authentication
- Configurer les **redirect URLs** (localhost et production)
- Activer les providers externes si nécessaire

#### Row Level Security
- Activer RLS sur toutes les tables
- Configurer les politiques par défaut
- Tester les permissions avec différents rôles

#### Storage
- Configurer le bucket pour les images si nécessaire
- Définir les politiques d'accès aux fichiers

---

## Structure du Projet

```
transitaire-express/
  README.md                    # Documentation du projet
  package.json                 # Dépendances et scripts
  vite.config.ts              # Configuration Vite
  tailwind.config.js          # Configuration Tailwind
  tsconfig.json               # Configuration TypeScript
  index.html                  # Page HTML principale
  
  public/                     # Fichiers statiques
    logo.png                  # Logo de l'application
    favicon.ico               # Favicon
    
  src/                        # Source code
    main.tsx                  # Point d'entrée React
    App.tsx                   # Composant racine
    index.css                 # Styles globaux
    
    components/               # Composants réutilisables
      ui/                     # Composants UI (shadcn/ui)
        button.tsx
        dialog.tsx
        input.tsx
        # ... autres composants UI
      
      layout/                 # Composants de layout
        DashboardLayout.tsx   # Layout principal dashboard
    
    pages/                    # Pages de l'application
      LoginPage.tsx           # Page de connexion
      DashboardPage.tsx       # Page dashboard principale
      UserManagement.tsx      # Gestion des utilisateurs
      TarifManagement.tsx     # Gestion des tarifs
      TrackingPage.tsx        # Page de suivi publique
      
      dashboard/              # Pages du dashboard
        OverviewPage.tsx      # Vue d'ensemble
        ColisPage.tsx         # Gestion des colis
        ClientsPage.tsx       # Gestion des clients
        NouveauColisPage.tsx  # Création de colis
    
    contexts/                 # Contextes React
      AuthContext.tsx         # Contexte d'authentification
    
    hooks/                    # Hooks personnalisés
      useAuth.ts              # Hook d'authentification
    
    lib/                      # Bibliothèques utilitaires
      supabase.ts             # Client Supabase
      types.ts                # Types TypeScript
    
    styles/                   # Styles CSS
      globals.css             # Styles globaux
    
  supabase/                  # Fichiers Supabase
    migrations/               # Scripts de migration
      20260416121105_create_transitaire_express_schema.sql
```

---

## Guide d'Utilisation

### Pour les Administrateurs

#### Accès et Navigation
1. **Connexion** avec les identifiants administrateur
2. **Accès complet** à toutes les fonctionnalités
3. **Gestion des utilisateurs** et permissions
4. **Configuration** des tarifs et catégories

#### Gestion des Utilisateurs
- **Créer** de nouveaux comptes agents
- **Modifier** les informations utilisateur
- **Supprimer** des comptes (sauf le sien)
- **Assigner** les rôles appropriés

#### Gestion des Tarifs
- **Définir** les tarifs par catégorie
- **Mettre à jour** les prix en temps réel
- **Support** multi-devises
- **Types** de tarification (kg/pièce)

### Pour les Agents

#### Fonctionnalités Accessibles
- **Gestion des colis** (créer, modifier, consulter)
- **Mise à jour** des statuts de colis
- **Suivi** des expéditions
- **Dashboard** avec statistiques limitées

#### Restrictions
- **Pas d'accès** à la gestion des utilisateurs
- **Pas d'accès** à la configuration des tarifs
- **Impossible de supprimer** des colis
- **Vue limitée** des statistiques

### Pour les Clients

#### Suivi Public
- **Recherche** par numéro de tracking
- **Historique** des statuts
- **Informations** de livraison
- **Interface** mobile-friendly

---

## Déploiement

### Déploiement sur Vercel

#### 1. Préparation
```bash
# Build de production
npm run build

# Test local
npm run preview
```

#### 2. Configuration Vercel
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

#### 3. Variables d'Environnement
Configurer les variables dans le dashboard Vercel :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Déploiement sur Netlify

#### 1. Build Configuration
Dans `netlify.toml` :
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

#### 2. Déploiement
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Déployer
netlify deploy --prod --dir=dist
```

### Déploiement Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build et Run
```bash
# Build image
docker build -t transitaire-express .

# Run container
docker run -p 80:80 transitaire-express
```

---

## API Documentation

### Supabase API

#### Authentification
```typescript
// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      nom: 'John Doe',
      role: 'agent'
    }
  }
})
```

#### Opérations CRUD
```typescript
// Lire les colis
const { data, error } = await supabase
  .from('colis')
  .select('*, clients(*), statuts(*)')

// Créer un colis
const { data, error } = await supabase
  .from('colis')
  .insert({
    tracking_interne: 'TE-2024-1001',
    client_id: 'client-uuid',
    description: 'Description du colis'
  })

// Mettre à jour un statut
const { data, error } = await supabase
  .from('colis')
  .update({ statut_id: 3 })
  .eq('id', 'colis-uuid')
```

### Types TypeScript

```typescript
// Profile utilisateur
interface Profile {
  id: string;
  nom: string;
  telephone: string;
  role: 'admin' | 'agent';
  created_at: string;
}

// Colis avec relations
interface ColisWithRelations extends Colis {
  clients: Client;
  statuts: Statut | null;
  categories_colis: CategorieColis | null;
}
```

---

## Sécurité

### Mesures de Sécurité

#### Authentification
- **JWT tokens** avec expiration configurée
- **Refresh tokens** automatiques
- **Password policies** renforcées
- **Multi-factor auth** (optionnel)

#### Base de Données
- **Row Level Security** sur toutes les tables
- **Politiques granulaires** par rôle
- **Validation** des entrées côté serveur
- **Logging** des accès sensibles

#### Application
- **HTTPS obligatoire** en production
- **CORS** configuré restrictivement
- **CSP headers** pour prévenir XSS
- **Input validation** côté client et serveur

#### Permissions par Rôle

| Action | Admin | Agent | Public |
|--------|-------|-------|--------|
| Voir les colis | Oui | Oui | Limité |
| Créer des colis | Oui | Oui | Non |
| Modifier des colis | Oui | Oui | Non |
| Supprimer des colis | Oui | Non | Non |
| Gérer les utilisateurs | Oui | Non | Non |
| Gérer les tarifs | Oui | Non | Non |
| Voir les statistiques | Complet | Limité | Non |

### Bonnes Pratiques

#### Développement
- **Code review** obligatoire
- **Tests** unitaires et intégration
- **Scan de sécurité** régulier
- **Dépendances** à jour

#### Production
- **Backups** réguliers de la base
- **Monitoring** des performances
- **Alertes** de sécurité
- **Mises à jour** régulières

---

## Contributions

### Guide de Contribution

#### 1. Fork le Projet
```bash
git clone https://github.com/votre-username/transitaire-express.git
cd transitaire-express
```

#### 2. Créer une Branche
```bash
git checkout -b feature/nouvelle-fonctionnalite
```

#### 3. Développement
- Suivre les **conventions de code**
- Ajouter des **tests** si nécessaire
- Documenter les **changements**
- Respecter la **structure** du projet

#### 4. Soumission
```bash
git commit -m "feat: ajouter nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

Créer une **Pull Request** avec :
- Description claire des changements
- Captures d'écran si applicable
- Tests passants
- Documentation mise à jour

### Conventions de Code

#### TypeScript
- **Typage strict** activé
- **Interfaces** pour tous les objets
- **Enums** pour les constantes
- **JSDoc** pour les fonctions complexes

#### React
- **Components** fonctionnels avec hooks
- **Props typées** avec TypeScript
- **State management** local ou context
- **Error boundaries** pour la robustesse

#### CSS/Tailwind
- **Components-first** approach
- **Responsive design** mobile-first
- **Thème** cohérent avec les couleurs de la marque
- **Accessibility** WCAG 2.1 AA

---

## Support

### Assistance Technique

#### Documentation
- **README** complet et à jour
- **Code comments** pour les fonctions complexes
- **API documentation** intégrée
- **Wiki** avec guides détaillés

#### Canaux de Support
- **Issues GitHub** pour les bugs
- **Discussions** pour les questions
- **Email** : support@transitaire-express.com
- **Téléphone** : +243 XXX XXX XXX

#### Temps de Réponse
- **Urgences** : 2-4 heures
- **Bugs critiques** : 24 heures
- **Questions générales** : 48-72 heures
- **Demandes de fonctionnalités** : 1 semaine

### Dépannage Commun

#### Problèmes de Connexion
```bash
# Vérifier la configuration Supabase
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Tester la connexion
curl -X POST "$VITE_SUPABASE_URL/auth/v1/token" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

#### Problèmes de Build
```bash
# Nettoyer les dépendances
rm -rf node_modules package-lock.json
npm install

# Vérifier TypeScript
npm run typecheck

# Vérifier ESLint
npm run lint
```

#### Performance
- **Monitoring** avec Lighthouse
- **Bundle analysis** avec webpack-bundle-analyzer
- **Performance budgets** configurés
- **Lazy loading** des composants lourds

---

## Licence

Ce projet est sous licence **MIT License**.

### Droits d'Utilisation
- **Usage commercial** autorisé
- **Modification** autorisée
- **Distribution** autorisée
- **Paternité** requise

### Limitation de Responsabilité
Le logiciel est fourni "tel quel", sans garantie d'aucune sorte.

### Contact Licence
Pour toute question concernant la licence :
- **Email** : legal@transitaire-express.com
- **Adresse** : Kinshasa, RDC

---

## À Propos

### Équipe de Développement
- **Lead Developer** : [Nom du développeur]
- **UI/UX Designer** : [Nom du designer]
- **DevOps Engineer** : [Nom du DevOps]
- **Product Manager** : [Nom du PM]

### Technologies Utilisées
- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Backend** : Supabase, PostgreSQL
- **Déploiement** : Vercel, Docker
- **Outils** : Vite, ESLint, Prettier

### Roadmap 2024
- [ ] **Application mobile** native (React Native)
- [ ] **Intégration API** tiers (transporteurs)
- [ ] **Notifications** push et email
- [ ] **Tableau de bord** analytique avancé
- [ ] **Multi-langues** (EN, ZH-CN, PT)
- [ ] **Facturation** intégrée

### Changelog

#### v1.0.0 (2024-04-16)
- **Initial release** avec fonctionnalités complètes
- **Authentification** sécurisée avec Supabase
- **Gestion** des colis, clients, tarifs
- **Dashboard** avec rôles et permissions
- **Interface** responsive et moderne

---

**© 2024 Transitaire Express. Tous droits réservés.**

*Pour plus d'informations, visitez [transitaire-express.com](https://transitaire-express.com)*
