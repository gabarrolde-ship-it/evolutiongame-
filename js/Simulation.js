// ============================================
// SIMULATION.JS
// Système principal de simulation d'évolution
// ============================================

class Simulation {
    constructor(canvas, statsCanvas, config = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.statsCanvas = statsCanvas;
        this.statsCtx = statsCanvas.getContext('2d');
        
        // Configuration par défaut
        this.config = {
            gridSize: config.gridSize || 50,
            cellSize: config.cellSize || 10,
            initialCreatures: config.initialCreatures || 20,
            mutationRate: config.mutationRate || 0.1,
            simSpeed: config.simSpeed || 5,
            ...config
        };
        
        // État de la simulation
        this.running = false;
        this.paused = false;
        this.day = 0;
        this.creatures = [];
        this.environment = null;
        this.animationId = null;
        this.lastUpdateTime = 0;
        this.updateInterval = 1000; // 1 seconde par tour
        
        // Statistiques
        this.stats = {
            totalCreatures: [],
            avgEnergy: [],
            avgAge: [],
            avgFitness: [],
            biomeDistribution: {},
            traitDistribution: {}
        };
        
        // Historique
        this.history = {
            creatures: [],
            extinctions: [],
            mutations: []
        };
        
        this.init();
    }
    
    init() {
        // Initialiser l'environnement
        this.environment = new Environment(
            this.config.gridSize,
            this.config.gridSize,
            this.config.cellSize
        );
        
        // Initialiser les créatures
        this.creatures = [];
        for (let i = 0; i < this.config.initialCreatures; i++) {
            const x = Math.floor(Math.random() * this.config.gridSize);
            const y = Math.floor(Math.random() * this.config.gridSize);
            this.creatures.push(new Creature(x, y, this.environment));
        }
        
        // Redimensionner les canvases
        this.resizeCanvas();
        
        // Configurer les écouteurs d'événements
        this.setupEventListeners();
        
        // Mettre à jour l'interface
        this.updateUI();
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        
        const canvasSize = Math.min(maxWidth, maxHeight);
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        
        // Calculer la taille des cellules en fonction de la taille du canvas
        this.config.cellSize = Math.floor(canvasSize / this.config.gridSize);
        
        // Redimensionner le canvas des statistiques
        this.statsCanvas.width = this.statsCanvas.parentElement.clientWidth;
        this.statsCanvas.height = 200;
    }
    
    // Démarre la simulation
    start() {
        if (this.running) return;
        
        this.running = true;
        this.paused = false;
        this.lastUpdateTime = performance.now();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // Met en pause la simulation
    pause() {
        this.paused = true;
    }
    
    // Reprend la simulation
    resume() {
        this.paused = false;
        this.lastUpdateTime = performance.now();
    }
    
    // Arrête la simulation
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // Réinitialise la simulation
    reset(config = {}) {
        this.stop();
        
        this.config = { ...this.config, ...config };
        this.day = 0;
        this.creatures = [];
        this.stats = {
            totalCreatures: [],
            avgEnergy: [],
            avgAge: [],
            avgFitness: [],
            biomeDistribution: {},
            traitDistribution: {}
        };
        this.history = {
            creatures: [],
            extinctions: [],
            mutations: []
        };
        
        this.init();
        this.updateUI();
    }
    
    // Exécute un tour de simulation
    step() {
        if (!this.running) return;
        
        this.day++;
        
        // Mettre à jour l'environnement
        this.environment.update(this.day);
        
        // Mettre à jour les créatures
        const newCreatures = [];
        const deadCreatures = [];
        
        for (const creature of this.creatures) {
            const result = creature.update(this.creatures);
            
            if (result) {
                // Naissance
                if (Array.isArray(result)) {
                    newCreatures.push(...result);
                    this.history.mutations.push({
                        day: this.day,
                        parentId: creature.id,
                        offspringCount: result.length
                    });
                }
            } else if (creature.health <= 0 || creature.energy <= 0) {
                // Mort
                deadCreatures.push(creature);
                this.history.extinctions.push({
                    day: this.day,
                    creatureId: creature.id,
                    age: creature.age,
                    cause: creature.energy <= 0 ? 'energy' : 'health'
                });
            }
        }
        
        // Ajouter les nouvelles créatures
        this.creatures.push(...newCreatures);
        
        // Retirer les créatures mortes
        this.creatures = this.creatures.filter(c => c.health > 0 && c.energy > 0);
        
        // Appliquer la sélection naturelle
        this.applyNaturalSelection();
        
        // Mettre à jour les statistiques
        this.updateStatistics();
        
        // Enregistrer l'historique
        this.recordHistory();
        
        // Mettre à jour l'interface
        this.updateUI();
    }
    
    // Applique la sélection naturelle
    applyNaturalSelection() {
        if (this.creatures.length < 2) return;
        
        // Calculer le fitness de chaque créature
        const creaturesWithFitness = this.creatures.map(c => ({
            creature: c,
            fitness: c.getFitness()
        }));
        
        // Trier par fitness (du plus faible au plus fort)
        creaturesWithFitness.sort((a, b) => a.fitness - b.fitness);
        
        // Éliminer les 10% les moins adaptés
        const eliminationCount = Math.max(1, Math.floor(creaturesWithFitness.length * 0.1));
        
        for (let i = 0; i < eliminationCount; i++) {
            const weakCreature = creaturesWithFitness[i].creature;
            weakCreature.health = 0; // Tuer la créature
            
            this.history.extinctions.push({
                day: this.day,
                creatureId: weakCreature.id,
                age: weakCreature.age,
                cause: 'natural_selection',
                fitness: weakCreature.getFitness()
            });
        }
        
        // Retirer les créatures éliminées
        this.creatures = this.creatures.filter(c => c.health > 0);
    }
    
    // Met à jour les statistiques
    updateStatistics() {
        // Nombre total de créatures
        this.stats.totalCreatures.push(this.creatures.length);
        if (this.stats.totalCreatures.length > 100) {
            this.stats.totalCreatures.shift();
        }
        
        // Énergie moyenne
        const avgEnergy = this.creatures.reduce((sum, c) => sum + c.energy, 0) / Math.max(1, this.creatures.length);
        this.stats.avgEnergy.push(avgEnergy);
        if (this.stats.avgEnergy.length > 100) {
            this.stats.avgEnergy.shift();
        }
        
        // Âge moyen
        const avgAge = this.creatures.reduce((sum, c) => sum + c.age, 0) / Math.max(1, this.creatures.length);
        this.stats.avgAge.push(avgAge);
        if (this.stats.avgAge.length > 100) {
            this.stats.avgAge.shift();
        }
        
        // Fitness moyen
        const avgFitness = this.creatures.reduce((sum, c) => sum + c.getFitness(), 0) / Math.max(1, this.creatures.length);
        this.stats.avgFitness.push(avgFitness);
        if (this.stats.avgFitness.length > 100) {
            this.stats.avgFitness.shift();
        }
        
        // Distribution des biomes
        this.stats.biomeDistribution = {};
        for (const creature of this.creatures) {
            const biome = this.environment.getBiome(Math.floor(creature.x), Math.floor(creature.y));
            if (biome) {
                this.stats.biomeDistribution[biome.type] = (this.stats.biomeDistribution[biome.type] || 0) + 1;
            }
        }
        
        // Distribution des traits
        this.stats.traitDistribution = {};
        for (const creature of this.creatures) {
            for (const trait in creature.physicalTraits) {
                if (trait !== 'color') {
                    const value = Math.floor(creature.physicalTraits[trait] * 10) / 10;
                    const key = `${trait}:${value}`;
                    this.stats.traitDistribution[key] = (this.stats.traitDistribution[key] || 0) + 1;
                }
            }
        }
    }
    
    // Enregistre l'historique
    recordHistory() {
        if (this.day % 10 === 0) {
            this.history.creatures.push({
                day: this.day,
                count: this.creatures.length,
                avgFitness: this.stats.avgFitness[this.stats.avgFitness.length - 1] || 0
            });
        }
    }
    
    // Met à jour l'interface utilisateur
    updateUI() {
        // Mettre à jour les compteurs
        document.getElementById('dayCounter').textContent = this.day;
        document.getElementById('creatureCount').textContent = this.creatures.length;
        document.getElementById('avgAge').textContent = this.stats.avgAge.length > 0 
            ? this.stats.avgAge[this.stats.avgAge.length - 1].toFixed(1) 
            : '0';
        document.getElementById('avgEnergy').textContent = this.stats.avgEnergy.length > 0 
            ? this.stats.avgEnergy[this.stats.avgEnergy.length - 1].toFixed(1) 
            : '0';
        document.getElementById('dominantBiome').textContent = this.environment.getDominantBiome() || '-';
        
        // Mettre à jour la légende
        this.updateLegend();
    }
    
    // Met à jour la légende
    updateLegend() {
        const legendItems = document.getElementById('legendItems');
        legendItems.innerHTML = '';
        
        // Ajouter les biomes
        const biomeColors = {
            'forest': '#2d5a27',
            'desert': '#c2b280',
            'mountain': '#808080',
            'ocean': '#1a5fb4',
            'grassland': '#7cfc00',
            'tundra': '#e0e0e0',
            'swamp': '#556b2f',
            'jungle': '#228b22'
        };
        
        const biomeNames = {
            'forest': 'Forêt',
            'desert': 'Désert',
            'mountain': 'Montagne',
            'ocean': 'Océan',
            'grassland': 'Prairie',
            'tundra': 'Toundra',
            'swamp': 'Marais',
            'jungle': 'Jungle'
        };
        
        for (const biomeType in biomeColors) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            
            const color = document.createElement('div');
            color.className = 'legend-color';
            color.style.backgroundColor = biomeColors[biomeType];
            
            const label = document.createElement('span');
            label.className = 'legend-label';
            label.textContent = `${biomeNames[biomeType]} (${this.stats.biomeDistribution[biomeType] || 0})`;
            
            item.appendChild(color);
            item.appendChild(label);
            legendItems.appendChild(item);
        }
    }
    
    // Boucle principale du jeu
    gameLoop() {
        if (!this.running) return;
        
        const now = performance.now();
        const deltaTime = now - this.lastUpdateTime;
        
        // Calculer le délai entre les tours en fonction de la vitesse de simulation
        const targetInterval = 1000 / this.config.simSpeed;
        
        if (deltaTime >= targetInterval) {
            this.step();
            this.lastUpdateTime = now;
        }
        
        // Dessiner les stats
        this.drawStats();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // Dessine la simulation
    draw() {
        const ctx = this.ctx;
        const cellSize = this.config.cellSize;
        const gridSize = this.config.gridSize;
        
        // Effacer le canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner l'environnement
        this.drawEnvironment(ctx, cellSize, gridSize);
        
        // Dessiner les créatures
        for (const creature of this.creatures) {
            creature.draw(ctx, cellSize);
        }
        
        // Dessiner les informations de la météo
        this.drawWeatherInfo(ctx, cellSize, gridSize);
    }
    
    // Dessine l'environnement
    drawEnvironment(ctx, cellSize, gridSize) {
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const biome = this.environment.getBiome(x, y);
                if (biome) {
                    ctx.fillStyle = biome.getColor();
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    
                    // Dessiner les ressources
                    const resource = this.environment.getResource(x, y);
                    if (resource && resource.amount > 0) {
                        ctx.fillStyle = resource.getColor();
                        ctx.fillRect(
                            x * cellSize + cellSize * 0.25,
                            y * cellSize + cellSize * 0.25,
                            cellSize * 0.5,
                            cellSize * 0.5
                        );
                    }
                }
            }
        }
    }
    
    // Dessine les informations de la météo
    drawWeatherInfo(ctx, cellSize, gridSize) {
        const weather = this.environment.getWeather();
        const weatherType = weather.getWeatherType();
        const weatherColor = weather.getWeatherColor();
        const weatherDesc = weather.getWeatherDescription();
        
        // Dessiner un indicateur de météo
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = weatherColor;
        ctx.fillRect(0, 0, this.canvas.width, 30);
        ctx.restore();
        
        // Texte de la météo
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Météo: ${weatherDesc} | Jour: ${this.day}`, 10, 20);
    }
    
    // Dessine les statistiques
    drawStats() {
        const ctx = this.statsCtx;
        const width = this.statsCanvas.width;
        const height = this.statsCanvas.height;
        
        // Effacer le canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dessiner le graphique du nombre de créatures
        this.drawStatGraph(ctx, this.stats.totalCreatures, 'Nombre de créatures', '#00ff00', 0);
        
        // Dessiner le graphique de l'énergie moyenne
        this.drawStatGraph(ctx, this.stats.avgEnergy, 'Énergie moyenne', '#0088ff', height / 3);
        
        // Dessiner le graphique de l'âge moyen
        this.drawStatGraph(ctx, this.stats.avgAge, 'Âge moyen', '#ff8800', height * 2 / 3);
    }
    
    // Dessine un graphique de statistiques
    drawStatGraph(ctx, data, label, color, yOffset) {
        if (data.length === 0) return;
        
        const width = this.statsCanvas.width;
        const height = this.statsCanvas.height / 3;
        const padding = 40;
        const graphWidth = width - padding * 2;
        const graphHeight = height - 20;
        
        // Dessiner le label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(label, padding, yOffset + 15);
        
        // Dessiner les axes
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(padding, yOffset + 20);
        ctx.lineTo(padding, yOffset + 20 + graphHeight);
        ctx.lineTo(padding + graphWidth, yOffset + 20 + graphHeight);
        ctx.stroke();
        
        // Dessiner la courbe
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        const stepX = graphWidth / (data.length - 1);
        
        for (let i = 0; i < data.length; i++) {
            const x = padding + i * stepX;
            const y = yOffset + 20 + graphHeight - (data[i] / this.getMaxValue(data) * graphHeight);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }
    
    // Obtient la valeur maximale dans un tableau
    getMaxValue(data) {
        return Math.max(...data, 1);
    }
    
    // Obtient les informations de la simulation
    getInfo() {
        return {
            day: this.day,
            creatures: this.creatures.length,
            environment: {
                width: this.environment.width,
                height: this.environment.height,
                dominantBiome: this.environment.getDominantBiome()
            },
            stats: {
                avgEnergy: this.stats.avgEnergy.length > 0 ? this.stats.avgEnergy[this.stats.avgEnergy.length - 1] : 0,
                avgAge: this.stats.avgAge.length > 0 ? this.stats.avgAge[this.stats.avgAge.length - 1] : 0,
                avgFitness: this.stats.avgFitness.length > 0 ? this.stats.avgFitness[this.stats.avgFitness.length - 1] : 0
            }
        };
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Simulation };
}
