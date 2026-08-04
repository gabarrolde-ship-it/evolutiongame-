// ============================================
// RENDERER.JS
// Système de rendu avancé pour la simulation
// ============================================

class Renderer {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.simulation = simulation;
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        this.selectedCreature = null;
        this.showDetails = false;
        this.detailsCanvas = null;
        this.detailsCtx = null;
        
        this.init();
    }
    
    init() {
        // Créer un canvas pour les détails
        this.detailsCanvas = document.createElement('canvas');
        this.detailsCanvas.width = 300;
        this.detailsCanvas.height = 400;
        this.detailsCtx = this.detailsCanvas.getContext('2d');
        
        // Configurer les événements
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Touches du clavier
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    handleMouseDown(e) {
        this.dragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }
    
    handleMouseMove(e) {
        if (this.dragging) {
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            
            this.camera.x -= dx / this.camera.zoom;
            this.camera.y -= dy / this.camera.zoom;
            
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        }
    }
    
    handleMouseUp(e) {
        this.dragging = false;
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.camera.zoom = Math.max(0.1, Math.min(3, this.camera.zoom * delta));
        
        // Ajuster la position de la caméra pour zoomer sur la souris
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX / this.camera.zoom) + this.camera.x;
        const worldY = (mouseY / this.camera.zoom) + this.camera.y;
        
        this.camera.x = worldX - (mouseX / (this.camera.zoom * delta));
        this.camera.y = worldY - (mouseY / (this.camera.zoom * delta));
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Convertir en coordonnées du monde
        const worldX = (mouseX / this.camera.zoom) + this.camera.x;
        const worldY = (mouseY / this.camera.zoom) + this.camera.y;
        
        // Trouver la créature cliquée
        const cellSize = this.simulation.config.cellSize;
        const gridX = Math.floor(worldX / cellSize);
        const gridY = Math.floor(worldY / cellSize);
        
        for (const creature of this.simulation.creatures) {
            if (Math.abs(creature.x - gridX) < 1 && Math.abs(creature.y - gridY) < 1) {
                this.selectedCreature = creature;
                this.showDetails = true;
                return;
            }
        }
        
        this.selectedCreature = null;
        this.showDetails = false;
    }
    
    handleKeyDown(e) {
        const moveSpeed = 20 / this.camera.zoom;
        
        switch (e.key) {
            case 'ArrowUp':
                this.camera.y -= moveSpeed;
                break;
            case 'ArrowDown':
                this.camera.y += moveSpeed;
                break;
            case 'ArrowLeft':
                this.camera.x -= moveSpeed;
                break;
            case 'ArrowRight':
                this.camera.x += moveSpeed;
                break;
            case '+':
            case '=':
                this.camera.zoom = Math.min(3, this.camera.zoom * 1.1);
                break;
            case '-':
            case '_':
                this.camera.zoom = Math.max(0.1, this.camera.zoom * 0.9);
                break;
            case 'r':
                this.resetCamera();
                break;
            case 'd':
                this.showDetails = !this.showDetails;
                break;
        }
    }
    
    resetCamera() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.zoom = 1;
    }
    
    // Dessine la simulation avec la caméra
    draw() {
        const ctx = this.ctx;
        const simulation = this.simulation;
        const cellSize = simulation.config.cellSize * this.camera.zoom;
        const gridSize = simulation.config.gridSize;
        
        // Effacer le canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sauvegarder le contexte et appliquer la transformation de la caméra
        ctx.save();
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);
        
        // Dessiner l'environnement
        this.drawEnvironment(ctx, cellSize, gridSize);
        
        // Dessiner les créatures
        for (const creature of simulation.creatures) {
            this.drawCreature(ctx, creature, cellSize);
        }
        
        // Dessiner les informations supplémentaires
        this.drawAdditionalInfo(ctx, cellSize, gridSize);
        
        // Restaurer le contexte
        ctx.restore();
        
        // Dessiner les détails de la créature sélectionnée
        if (this.showDetails && this.selectedCreature) {
            this.drawCreatureDetails();
        }
    }
    
    drawEnvironment(ctx, cellSize, gridSize) {
        const simulation = this.simulation;
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const biome = simulation.environment.getBiome(x, y);
                if (biome) {
                    // Dessiner le biome
                    ctx.fillStyle = biome.getColor();
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    
                    // Ajouter des détails au biome
                    this.drawBiomeDetails(ctx, biome, x, y, cellSize);
                    
                    // Dessiner les ressources
                    const resource = simulation.environment.getResource(x, y);
                    if (resource && resource.amount > 0) {
                        this.drawResource(ctx, resource, x, y, cellSize);
                    }
                }
            }
        }
    }
    
    drawBiomeDetails(ctx, biome, x, y, cellSize) {
        // Ajouter des motifs en fonction du biome
        ctx.save();
        ctx.globalAlpha = 0.3;
        
        switch (biome.type) {
            case 'forest':
                // Dessiner des arbres
                ctx.fillStyle = '#006400';
                ctx.beginPath();
                ctx.arc(
                    x * cellSize + cellSize / 2,
                    y * cellSize + cellSize / 2,
                    cellSize * 0.2,
                    0, Math.PI * 2
                );
                ctx.fill();
                break;
                
            case 'mountain':
                // Dessiner des rochers
                ctx.fillStyle = '#555555';
                ctx.beginPath();
                ctx.moveTo(x * cellSize, y * cellSize + cellSize);
                ctx.lineTo(x * cellSize + cellSize / 2, y * cellSize);
                ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'ocean':
                // Dessiner des vagues
                ctx.strokeStyle = '#00aaff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x * cellSize, y * cellSize + cellSize / 2);
                ctx.quadraticCurveTo(
                    x * cellSize + cellSize / 2,
                    y * cellSize + cellSize / 2 - 2,
                    x * cellSize + cellSize,
                    y * cellSize + cellSize / 2
                );
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
    
    drawResource(ctx, resource, x, y, cellSize) {
        // Dessiner la ressource
        ctx.save();
        ctx.globalAlpha = 0.7 + (resource.amount / resource.maxAmount) * 0.3;
        
        ctx.fillStyle = resource.getColor();
        const size = cellSize * 0.4 * (resource.amount / resource.maxAmount);
        ctx.beginPath();
        ctx.arc(
            x * cellSize + cellSize / 2,
            y * cellSize + cellSize / 2,
            size,
            0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    drawCreature(ctx, creature, cellSize) {
        // Dessiner la créature avec des détails supplémentaires
        creature.draw(ctx, cellSize);
        
        // Ajouter des indicateurs visuels pour les traits
        this.drawTraitIndicators(ctx, creature, cellSize);
    }
    
    drawTraitIndicators(ctx, creature, cellSize) {
        const centerX = creature.x * cellSize + cellSize / 2;
        const centerY = creature.y * cellSize + cellSize / 2;
        const radius = creature.physicalTraits.size * cellSize * 0.4;
        
        // Indicateur de vitesse (flèche)
        if (creature.physicalTraits.speed > 1.5) {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(creature.direction * Math.PI / 180);
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.moveTo(0, -radius);
            ctx.lineTo(-radius * 0.3, -radius * 1.5);
            ctx.lineTo(radius * 0.3, -radius * 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        
        // Indicateur de force (cercle épais)
        if (creature.physicalTraits.strength > 1.5) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Indicateur de camouflage (transparence)
        if (creature.physicalTraits.camouflage > 0.8) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = creature.physicalTraits.color;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    drawAdditionalInfo(ctx, cellSize, gridSize) {
        const simulation = this.simulation;
        
        // Dessiner la grille
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= gridSize; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, gridSize * cellSize);
            ctx.stroke();
        }
        
        for (let y = 0; y <= gridSize; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(gridSize * cellSize, y * cellSize);
            ctx.stroke();
        }
        
        // Dessiner les informations de la météo
        const weather = simulation.environment.getWeather();
        const weatherType = weather.getWeatherType();
        const weatherColor = weather.getWeatherColor();
        const weatherDesc = weather.getWeatherDescription();
        
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = weatherColor;
        ctx.fillRect(0, 0, gridSize * cellSize, 20);
        ctx.restore();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `${cellSize * 0.8}px Arial`;
        ctx.textAlign = 'left';
        ctx.fillText(`Jour: ${simulation.day} | Météo: ${weatherDesc} | Créatures: ${simulation.creatures.length}`, 5, 15);
    }
    
    // Dessine les détails de la créature sélectionnée
    drawCreatureDetails() {
        if (!this.selectedCreature) return;
        
        const creature = this.selectedCreature;
        const ctx = this.detailsCtx;
        const width = this.detailsCanvas.width;
        const height = this.detailsCanvas.height;
        
        // Effacer le canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dessiner l'arrière-plan
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, width, height);
        
        // Dessiner la créature
        const scale = 2;
        const centerX = width / 2;
        const centerY = height / 4;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        
        // Dessiner la créature au centre
        const tempCtx = this.ctx;
        this.ctx = ctx;
        creature.draw(ctx, 30);
        this.ctx = tempCtx;
        
        ctx.restore();
        
        // Dessiner les informations
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        
        let y = height / 3 + 20;
        
        ctx.fillText(`ID: ${creature.id}`, 20, y);
        y += 20;
        ctx.fillText(`Génération: ${creature.generation}`, 20, y);
        y += 20;
        ctx.fillText(`Âge: ${creature.age}/${creature.lifespan}`, 20, y);
        y += 20;
        ctx.fillText(`Énergie: ${creature.energy.toFixed(1)}/${creature.maxEnergy}`, 20, y);
        y += 20;
        ctx.fillText(`Santé: ${creature.health.toFixed(1)}/${creature.maxHealth}`, 20, y);
        y += 20;
        ctx.fillText(`Sexe: ${creature.gender === 'male' ? 'Mâle' : 'Femelle'}`, 20, y);
        y += 20;
        
        if (creature.gender === 'female' && creature.pregnancy > 0) {
            ctx.fillText(`Grossesse: ${creature.pregnancy} tours`, 20, y);
            y += 20;
        }
        
        ctx.fillText(`Descendants: ${creature.offspring}`, 20, y);
        y += 20;
        ctx.fillText(`Mutations: ${creature.mutations}`, 20, y);
        y += 30;
        
        // Traits physiques
        ctx.fillStyle = '#00ff00';
        ctx.fillText('Traits physiques:', 20, y);
        y += 20;
        ctx.fillStyle = '#ffffff';
        
        for (const trait in creature.physicalTraits) {
            if (trait !== 'color') {
                const value = creature.physicalTraits[trait];
                ctx.fillText(`  ${trait}: ${value.toFixed(2)}`, 20, y);
                y += 15;
            }
        }
        
        y += 10;
        
        // Traits comportementaux
        ctx.fillStyle = '#0088ff';
        ctx.fillText('Traits comportementaux:', 20, y);
        y += 20;
        ctx.fillStyle = '#ffffff';
        
        for (const trait in creature.behavioralTraits) {
            const value = creature.behavioralTraits[trait];
            ctx.fillText(`  ${trait}: ${value.toFixed(2)}`, 20, y);
            y += 15;
        }
        
        // Dessiner le canvas des détails sur le canvas principal
        const x = this.canvas.width - this.detailsCanvas.width - 10;
        const yPos = 10;
        
        this.ctx.drawImage(this.detailsCanvas, x, yPos);
    }
    
    // Met à jour le rendu
    update() {
        this.draw();
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderer };
}
