# Combat Pad - Pathfinder

Une application Electron moderne pour aider les maîtres de jeu (MJ) à gérer les combats de Pathfinder de manière fluide et organisée.

## 🎯 Fonctionnalités

### 👥 Gestion des Personnages
- Ajout, modification et suppression de personnages joueurs
- Gestion des points de vie (actuels et maximum)
- Classe d'armure configurable
- Barre de progression visuelle pour les PV
- Interface intuitive avec thème sombre

### 🐉 Gestion des Monstres
- Création et gestion de monstres et créatures
- Configuration des points de vie maximum
- Classe d'armure et bonus de perception
- Bonus de perception utilisé pour l'initiative automatique
- Interface dédiée avec couleurs distinctes

### ⚔️ Système de Combat
- Sélection des participants (personnages et monstres)
- Saisie manuelle de l'initiative pour les personnages
- Calcul automatique de l'initiative pour les monstres (d20 + perception)
- Instanciation multiple de monstres identiques
- Ordre d'initiative automatique
- Suivi des points de vie en temps réel
- Navigation entre les tours
- Fin automatique du combat quand tous les monstres sont vaincus
- Sauvegarde automatique des PV des personnages

### 💾 Système de Sauvegarde
- Sauvegarde automatique au démarrage de l'application
- Gestion complète des sauvegardes (créer, charger, supprimer)
- Interface dédiée pour la gestion des fichiers de sauvegarde
- Horodatage automatique des sauvegardes
- Chargement de la sauvegarde la plus récente au démarrage
- Sauvegarde uniquement des personnages et monstres (pas des combats en cours)

## 🚀 Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone [url-du-repo]
cd combat-pad

# Installer les dépendances
npm install
```

## 🛠️ Développement

### Mode Développement
```bash
# Démarrer l'application Electron en mode développement
npm run electron-dev
```

### Build de Production
```bash
# Construire l'application
npm run build

# Créer l'exécutable
npm run dist
```

## 📁 Structure du Projet

```
combat-pad/
├── electron/                    # Code Electron (processus principal)
│   ├── main.js                 # Point d'entrée Electron
│   └── preload.js              # Script de préchargement
├── src/                        # Code React/TypeScript
│   ├── components/             # Composants React
│   │   ├── CharactersPanel.tsx # Gestion des personnages
│   │   ├── MonstresPanel.tsx  # Gestion des monstres
│   │   ├── CombatPanel.tsx    # Interface de combat
│   │   └── SaveManager.tsx    # Gestion des sauvegardes
│   ├── interfaces/             # Définitions TypeScript
│   │   ├── Character.interface.tsx
│   │   ├── Monster.interface.tsx
│   │   ├── CombatEntity.interface.tsx
│   │   └── SaveFile.interface.tsx
│   ├── types/                  # Types globaux
│   │   └── electron.d.ts      # Types pour les APIs Electron
│   ├── App.tsx                # Composant principal
│   ├── main.tsx               # Point d'entrée React
│   └── index.css              # Styles globaux
├── public/                    # Assets statiques
├── dist/                      # Build de production
└── package.json               # Configuration du projet
```

## 🎮 Utilisation

### 1. Gestion des Personnages
1. Allez dans l'onglet "Personnages"
2. Cliquez sur "Ajouter un personnage"
3. Remplissez les informations :
   - **Nom** : Nom du personnage
   - **Points de vie maximum** : PV totaux du personnage
   - **Points de vie actuels** : PV actuels (peuvent être modifiés)
   - **Classe d'armure** : CA du personnage
4. Cliquez sur "Ajouter" pour sauvegarder
5. Utilisez les boutons d'édition et de suppression pour gérer vos personnages

### 2. Gestion des Monstres
1. Allez dans l'onglet "Monstres"
2. Cliquez sur "Ajouter un monstre"
3. Remplissez les informations :
   - **Nom** : Nom du monstre
   - **Classe d'armure** : CA du monstre
   - **Points de vie maximum** : PV du monstre
   - **Perception** : Bonus d'initiative (ex: +5 pour un bonus de 5)
4. Cliquez sur "Ajouter" pour sauvegarder
5. Les monstres peuvent être modifiés ou supprimés

### 3. Lancement d'un Combat
1. Allez dans l'onglet "Combat"
2. **Sélection des participants** :
   - Cochez les personnages qui participent au combat
   - Cochez les monstres et ajustez leur nombre d'instances
3. Cliquez sur "Lancer le combat"
4. **Saisie des initiatives** :
   - Entrez l'initiative pour chaque personnage sélectionné
   - Les initiatives des monstres sont calculées automatiquement (d20 + perception)
   - Vous pouvez relancer les initiatives des monstres si nécessaire
5. Cliquez sur "Lancer le combat" pour commencer

### 4. Gestion du Combat
- **Tour actuel** : L'entité en cours est mise en évidence
- **Modification des PV** : Utilisez les boutons +/- ou modifiez directement dans le tableau
- **Navigation** : Utilisez "Précédent" et "Suivant" pour naviguer entre les tours
- **Fin de combat** : Le combat se termine automatiquement quand tous les monstres sont à 0 PV
- **Sauvegarde** : Les PV des personnages sont automatiquement sauvegardés

### 5. Gestion des Sauvegardes
1. Allez dans l'onglet "Sauvegardes"
2. **Sauvegarde manuelle** : Cliquez sur "Sauvegarder" pour créer une sauvegarde de l'état actuel
3. **Chargement** : 
   - "Charger le plus récent" pour charger la dernière sauvegarde
   - Cliquez sur l'icône de téléchargement à côté d'une sauvegarde spécifique
4. **Gestion des fichiers** :
   - Voir toutes les sauvegardes disponibles avec date et taille
   - Supprimer une sauvegarde avec l'icône poubelle
   - Confirmation de suppression pour éviter les erreurs
5. **Chargement automatique** : L'application charge automatiquement la sauvegarde la plus récente au démarrage

## 🎨 Interface

L'application utilise un design moderne avec :
- **Thème sombre** optimisé pour les sessions de jeu
- **Interface responsive** qui s'adapte à différentes tailles d'écran
- **Indicateurs visuels** pour les PV (vert, jaune, rouge selon les dégâts)
- **Navigation intuitive** entre les quatre onglets principaux
- **Modales** pour la saisie des initiatives
- **Messages de victoire** quand le combat se termine
- **Interface de sauvegarde** avec gestion complète des fichiers

## 🔧 Configuration

### Raccourcis Clavier
- `Ctrl+Q` : Quitter l'application

### Personnalisation
L'application peut être personnalisée en modifiant :
- Les couleurs dans `tailwind.config.js`
- Les composants dans `src/components/`
- Les styles dans `src/index.css`

## 📦 Technologies Utilisées

- **Electron** : Framework pour applications desktop
- **React** : Interface utilisateur
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **Vite** : Build tool moderne
- **Lucide React** : Icônes

## 🎲 Fonctionnalités Avancées

### Calcul d'Initiative
- **Personnages** : Initiative saisie manuellement
- **Monstres** : d20 + bonus de perception automatique
- **Instances multiples** : Tous les monstres identiques partagent la même initiative

### Gestion des PV
- **Barres de progression** colorées selon les dégâts
- **Modification en temps réel** pendant le combat
- **Sauvegarde automatique** des PV des personnages
- **Limite minimale** à 0 PV

### Interface de Combat
- **Ordre d'initiative** trié automatiquement
- **Indication du tour actuel** avec mise en évidence
- **Tableau complet** avec toutes les informations
- **Boutons d'action** pour chaque entité

### Système de Sauvegarde
- **Chargement automatique** au démarrage de l'application
- **Gestion des fichiers** avec interface dédiée
- **Horodatage** automatique des sauvegardes
- **Chargement intelligent** de la sauvegarde la plus récente
- **Sécurité** : Sauvegarde uniquement des données persistantes (personnages/monstres)
- **Gestion d'erreurs** avec messages utilisateur

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

## 🆘 Support

Si vous rencontrez des problèmes ou avez des suggestions :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Contactez l'équipe de développement

---

**Combat Pad** - Rendez vos combats de Pathfinder plus fluides et organisés ! ⚔️🎲 