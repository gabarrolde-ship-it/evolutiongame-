# Simulation d'Évolution

Une simulation d'évolution en tour par tour avec visualisation Canvas. Ce projet simule un écosystème où des créatures évoluent avec des caractéristiques physiques et comportementales qui apparaissent aléatoirement et sont sélectionnées par la sélection naturelle.

## Fonctionnalités

### Environnement
- **Grille de jeu** : Espace délimité avec différentes caractéristiques environnementales
- **Biomes variés** : Forêt, désert, montagne, océan, prairie, toundra, marais, jungle
- **Ressources** : Chaque biome a ses propres types de ressources (nourriture, eau, etc.)
- **Météo dynamique** : Ciel dégagé, nuageux, pluie, neige, tempête, brouillard
- **Climat** : Températures et humidité variables selon les saisons et les biomes
- **Terrain** : Altitudes variables avec montagnes et océans

### Créatures
- **Caractéristiques physiques** :
  - Taille (size)
  - Vitesse (speed)
  - Force (strength)
  - Vision (vision)
  - Camouflage (camouflage)
  - Armure (armor)
  - Couleur (color)

- **Caractéristiques comportementales** :
  - Agressivité (aggression)
  - Sociabilité (sociability)
  - Curiosité (curiosity)
  - Peur (fear)
  - Chasse (hunting)
  - Récolte (gathering)
  - Reproduction (reproduction)

- **État** :
  - Énergie
  - Santé
  - Âge
  - Faim
  - Soif
  - Température interne

### Système d'Évolution
- **Mutations aléatoires** : Les nouvelles créatures peuvent hériter des traits modifiés de leurs parents
- **Sélection naturelle** : Les créatures les moins adaptées sont progressivement éliminées
- **Adaptation aux biomes** : Les créatures développent une adaptation aux biomes dans lesquels elles vivent
- **Reproduction** : Les créatures peuvent se reproduire pour donner naissance à une nouvelle génération

### Visualisation
- **Canvas principal** : Affichage de l'environnement et des créatures
- **Graphiques statistiques** : Suivi du nombre de créatures, de l'énergie moyenne, de l'âge moyen
- **Légende** : Explication des différents biomes et de leur répartition
- **Détails des créatures** : Cliquez sur une créature pour voir ses caractéristiques détaillées
- **Contrôles de caméra** : Déplacement, zoom, réinitialisation

## Installation

1. Clonez le dépôt ou téléchargez les fichiers
2. Ouvrez le fichier `index.html` dans un navigateur web moderne

## Utilisation

### Contrôles

- **Boutons** :
  - **Démarrer** : Lance la simulation
  - **Pause** : Met la simulation en pause
  - **Réinitialiser** : Réinitialise la simulation avec les paramètres actuels
  - **Tour suivant** : Exécute un tour manuellement

- **Paramètres** :
  - **Taille de la grille** : Nombre de cellules par côté (10-100)
  - **Créatures initiales** : Nombre de créatures au début (1-100)
  - **Taux de mutation** : Probabilité de mutation des traits (0-100%)
  - **Vitesse de simulation** : Vitesse d'exécution des tours (1-10)

- **Contrôles clavier** :
  - **Flèches** : Déplacer la caméra
  - **+/-** : Zoomer/dézoomer
  - **R** : Réinitialiser la caméra
  - **D** : Afficher/masquer les détails de la créature sélectionnée

- **Souris** :
  - **Cliquer** : Sélectionner une créature
  - **Glisser** : Déplacer la caméra
  - **Molette** : Zoomer/dézoomer

## Architecture du Code

```
/
├── index.html          # Page HTML principale
├── styles.css          # Styles CSS
├── README.md           # Documentation
└── js/
    ├── Environment.js   # Système d'environnement (biomes, ressources, météo)
    ├── Creature.js      # Classe Créature avec traits physiques et comportementaux
    ├── Simulation.js    # Système principal de simulation
    ├── Renderer.js       # Système de rendu avancé
    └── main.js          # Point d'entrée principal
```

### Classes Principales

#### Environment
Gère l'environnement de simulation avec :
- Grille de biomes
- Système de ressources
- Système météorologique
- Système climatique
- Système de terrain

#### Creature
Représente une créature avec :
- Caractéristiques physiques et comportementales
- État (énergie, santé, âge, etc.)
- Comportements (recherche de nourriture, reproduction, etc.)
- Système de mutations
- Adaptation aux biomes

#### Simulation
Gère la simulation principale avec :
- Boucle de jeu
- Système tour par tour
- Sélection naturelle
- Statistiques et historique
- Interface utilisateur

#### Renderer
Gère le rendu avancé avec :
- Caméra (déplacement, zoom)
- Sélection de créatures
- Affichage des détails
- Rendu optimisé

## Personnalisation

Vous pouvez personnaliser la simulation en modifiant :

1. **Les paramètres** : Dans le fichier `index.html`, modifiez les valeurs par défaut des inputs
2. **Les biomes** : Dans `Environment.js`, ajoutez ou modifiez les types de biomes
3. **Les ressources** : Dans `Environment.js`, ajoutez ou modifiez les types de ressources
4. **Les traits** : Dans `Creature.js`, ajoutez ou modifiez les caractéristiques physiques et comportementales
5. **Les comportements** : Dans `Creature.js`, modifiez la logique des comportements

## Exemples de Scénarios

### 1. Monde équilibré
- Taille de grille : 50
- Créatures initiales : 20
- Taux de mutation : 10%
- Résultat : Écosystème stable avec diversité

### 2. Monde hostile
- Taille de grille : 30
- Créatures initiales : 50
- Taux de mutation : 20%
- Résultat : Compétition intense, évolution rapide

### 3. Monde isolé
- Taille de grille : 20
- Créatures initiales : 5
- Taux de mutation : 5%
- Résultat : Population stable, peu de diversité

## Technologies Utilisées

- **HTML5** : Structure de la page
- **CSS3** : Styles et mise en page
- **JavaScript (ES6+)** : Logique de la simulation
- **Canvas API** : Rendu graphique

## Compatibilité

Testé et fonctionnant sur :
- Chrome (recommandé)
- Firefox
- Edge
- Safari

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commitez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteur

Créé pour gabarrolde-ship-it.

## Remerciements

- Inspiration : Théorie de l'évolution de Darwin
- Concepts : Sélection naturelle, adaptation, mutation
- Technologies : HTML5 Canvas, JavaScript moderne
