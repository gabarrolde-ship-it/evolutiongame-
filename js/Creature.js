// ============================================
// CREATURE.JS
// Système de gestion des créatures avec évolution
// ============================================

class Creature {
    constructor(x, y, environment, parent = null) {
        this.id = Creature.nextId++;
        this.x = x;
        this.y = y;
        this.environment = environment;
        
        // Caractéristiques physiques
        this.physicalTraits = {
            size: parent ? this.mutateTrait(parent.physicalTraits.size, 0.1, 0.1, 2.0) : Math.random() * 1.5 + 0.5,
            speed: parent ? this.mutateTrait(parent.physicalTraits.speed, 0.1, 0.1, 2.0) : Math.random() * 1.5 + 0.5,
            strength: parent ? this.mutateTrait(parent.physicalTraits.strength, 0.1, 0.1, 2.0) : Math.random() * 1.5 + 0.5,
            vision: parent ? this.mutateTrait(parent.physicalTraits.vision, 0.1, 0.1, 2.0) : Math.random() * 1.5 + 0.5,
            camouflage: parent ? this.mutateTrait(parent.physicalTraits.camouflage, 0.1, 0.1, 1.0) : Math.random(),
            armor: parent ? this.mutateTrait(parent.physicalTraits.armor, 0.1, 0.1, 1.0) : Math.random(),
            color: parent ? this.mutateColor(parent.physicalTraits.color) : this.generateRandomColor()
        };
        
        // Caractéristiques comportementales
        this.behavioralTraits = {
            aggression: parent ? this.mutateTrait(parent.behavioralTraits.aggression, 0.1, 0.0, 1.0) : Math.random(),
            sociability: parent ? this.mutateTrait(parent.behavioralTraits.sociability, 0.1, 0.0, 1.0) : Math.random(),
            curiosity: parent ? this.mutateTrait(parent.behavioralTraits.curiosity, 0.1, 0.0, 1.0) : Math.random(),
            fear: parent ? this.mutateTrait(parent.behavioralTraits.fear, 0.1, 0.0, 1.0) : Math.random(),
            hunting: parent ? this.mutateTrait(parent.behavioralTraits.hunting, 0.1, 0.0, 1.0) : Math.random(),
            gathering: parent ? this.mutateTrait(parent.behavioralTraits.gathering, 0.1, 0.0, 1.0) : Math.random(),
            reproduction: parent ? this.mutateTrait(parent.behavioralTraits.reproduction, 0.1, 0.0, 1.0) : Math.random()
        };
        
        // État de la créature
        this.energy = 100;
        this.maxEnergy = 100;
        this.health = 100;
        this.maxHealth = 100;
        this.age = 0;
        this.lifespan = parent ? this.mutateTrait(parent.lifespan, 0.1, 10, 200) : Math.random() * 100 + 50;
        this.hunger = 0;
        this.thirst = 0;
        this.temperature = 0.5; // 0 = froid, 1 = chaud
        
        // Reproduction
        this.gender = Math.random() < 0.5 ? 'male' : 'female';
        this.fertility = parent ? this.mutateTrait(parent.fertility, 0.1, 0.0, 1.0) : Math.random();
        this.pregnancy = 0;
        this.pregnancyDuration = 5; // Nombre de tours pour la gestation
        
        // Mémoire et apprentissage
        this.memory = {
            foodSources: [],
            dangers: [],
            partners: []
        };
        
        // Statistiques
        this.foodEaten = 0;
        this.creaturesKilled = 0;
        this.offspring = 0;
        this.mutations = parent ? parent.mutations + 1 : 0;
        
        // Direction actuelle
        this.direction = Math.random() * 360;
        
        // Génération
        this.generation = parent ? parent.generation + 1 : 0;
        
        // Adaptation au biome
        this.biomeAdaptation = {};
        this.updateBiomeAdaptation();
    }
    
    static nextId = 0;
    
    // Génère une couleur aléatoire
    generateRandomColor() {
        const hue = Math.random() * 360;
        const saturation = 70 + Math.random() * 30;
        const lightness = 40 + Math.random() * 20;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // Fait muter une couleur
    mutateColor(parentColor) {
        if (Math.random() < 0.3) {
            // Mutation de la teinte
            const match = parentColor.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
            if (match) {
                let hue = parseInt(match[1]);
                let saturation = parseFloat(match[2]);
                let lightness = parseFloat(match[3]);
                
                hue = (hue + (Math.random() - 0.5) * 60) % 360;
                saturation = Math.max(0, Math.min(100, saturation + (Math.random() - 0.5) * 20));
                lightness = Math.max(0, Math.min(100, lightness + (Math.random() - 0.5) * 10));
                
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            }
        }
        return parentColor;
    }
    
    // Fait muter un trait
    mutateTrait(parentValue, mutationRate, min, max) {
        if (Math.random() < mutationRate) {
            const mutationAmount = (Math.random() - 0.5) * 0.3; // -15% à +15%
            let newValue = parentValue * (1 + mutationAmount);
            newValue = Math.max(min, Math.min(max, newValue));
            return newValue;
        }
        return parentValue;
    }
    
    // Met à jour l'adaptation au biome actuel
    updateBiomeAdaptation() {
        const biome = this.environment.getBiome(Math.floor(this.x), Math.floor(this.y));
        if (biome) {
            const biomeType = biome.type;
            this.biomeAdaptation[biomeType] = (this.biomeAdaptation[biomeType] || 0) + 0.1;
            
            // Réduire l'adaptation aux autres biomes
            for (const otherBiome in this.biomeAdaptation) {
                if (otherBiome !== biomeType) {
                    this.biomeAdaptation[otherBiome] = Math.max(0, this.biomeAdaptation[otherBiome] - 0.05);
                }
            }
        }
    }
    
    // Met à jour l'état de la créature
    update(creatures) {
        this.age++;
        
        // Vieillissement
        if (this.age >= this.lifespan) {
            this.health -= 5;
        }
        
        // Métabolisme de base
        this.energy -= 0.5;
        this.hunger += 0.3;
        this.thirst += 0.2;
        
        // Effets de la faim et de la soif
        if (this.hunger > 80) {
            this.health -= 0.5;
        }
        if (this.thirst > 80) {
            this.health -= 0.5;
        }
        
        // Effets de la température
        const biome = this.environment.getBiome(Math.floor(this.x), Math.floor(this.y));
        if (biome) {
            const temp = this.environment.getTemperature(Math.floor(this.x), Math.floor(this.y));
            const humidity = this.environment.getHumidity(Math.floor(this.x), Math.floor(this.y));
            
            // Mettre à jour la température interne
            this.temperature = this.temperature * 0.9 + temp * 0.1;
            
            // Effets sur la santé
            if (this.temperature < 0.2 || this.temperature > 0.8) {
                this.health -= 0.3;
            }
        }
        
        // Grossesse
        if (this.pregnancy > 0) {
            this.pregnancy--;
            this.energy -= 1;
            
            if (this.pregnancy === 0) {
                // Naissance
                return this.giveBirth();
            }
        }
        
        // Mort
        if (this.health <= 0 || this.energy <= 0) {
            return null;
        }
        
        // Comportement
        this.performBehavior(creatures);
        
        // Mettre à jour l'adaptation au biome
        this.updateBiomeAdaptation();
        
        return null;
    }
    
    // Effectue un comportement basé sur les traits
    performBehavior(creatures) {
        // Déterminer la priorité des besoins
        const needs = {
            energy: 1 - (this.energy / this.maxEnergy),
            health: 1 - (this.health / this.maxHealth),
            hunger: this.hunger / 100,
            thirst: this.thirst / 100,
            reproduction: this.gender === 'female' && this.pregnancy === 0 && this.fertility > Math.random() ? 1 : 0
        };
        
        // Trouver la priorité la plus élevée
        let maxPriority = -1;
        let selectedBehavior = null;
        
        for (const need in needs) {
            if (needs[need] > maxPriority) {
                maxPriority = needs[need];
                selectedBehavior = need;
            }
        }
        
        // Exécuter le comportement
        switch (selectedBehavior) {
            case 'energy':
                this.rest();
                break;
            case 'hunger':
                this.searchForFood();
                break;
            case 'thirst':
                this.searchForWater();
                break;
            case 'reproduction':
                this.seekPartner(creatures);
                break;
            default:
                this.wander();
        }
    }
    
    // Se repose pour récupérer de l'énergie
    rest() {
        this.energy += 2;
        this.energy = Math.min(this.energy, this.maxEnergy);
        
        // Changement de direction aléatoire
        if (Math.random() < 0.3) {
            this.direction += (Math.random() - 0.5) * 90;
        }
    }
    
    // Cherche de la nourriture
    searchForFood() {
        const biome = this.environment.getBiome(Math.floor(this.x), Math.floor(this.y));
        
        if (biome && biome.type === 'ocean') {
            // Dans l'eau, essayer de pêcher
            this.fish();
        } else {
            // Sur terre, chercher des ressources
            this.forage();
        }
        
        // Se déplacer vers une source de nourriture connue
        if (this.memory.foodSources.length > 0 && Math.random() < this.behavioralTraits.gathering) {
            const target = this.memory.foodSources[Math.floor(Math.random() * this.memory.foodSources.length)];
            this.moveTowards(target.x, target.y);
        } else {
            // Mouvement aléatoire
            this.wander();
        }
    }
    
    // Pêche
    fish() {
        const resource = this.environment.getResource(Math.floor(this.x), Math.floor(this.y));
        if (resource && resource.type === 'fish' && resource.amount > 0) {
            const consumed = this.environment.consumeResource(Math.floor(this.x), Math.floor(this.y), 1);
            if (consumed > 0) {
                this.energy += resource.getNutritionalValue() * 2;
                this.hunger = Math.max(0, this.hunger - 30);
                this.thirst = Math.max(0, this.thirst - 10);
                this.energy = Math.min(this.energy, this.maxEnergy);
                this.foodEaten++;
                
                // Mémoriser cette source de nourriture
                this.memory.foodSources.push({ x: Math.floor(this.x), y: Math.floor(this.y) });
            }
        }
    }
    
    // Récolte
    forage() {
        const resource = this.environment.getResource(Math.floor(this.x), Math.floor(this.y));
        if (resource && resource.amount > 0) {
            const consumed = this.environment.consumeResource(Math.floor(this.x), Math.floor(this.y), 1);
            if (consumed > 0) {
                this.energy += resource.getNutritionalValue();
                this.hunger = Math.max(0, this.hunger - 20);
                this.energy = Math.min(this.energy, this.maxEnergy);
                this.foodEaten++;
                
                // Mémoriser cette source de nourriture
                this.memory.foodSources.push({ x: Math.floor(this.x), y: Math.floor(this.y) });
            }
        }
    }
    
    // Cherche de l'eau
    searchForWater() {
        // Se déplacer vers un biome océanique ou humide
        const biome = this.environment.getBiome(Math.floor(this.x), Math.floor(this.y));
        
        if (biome && (biome.type === 'ocean' || biome.type === 'swamp')) {
            this.drink();
        } else {
            // Trouver le biome humide le plus proche
            let closestWater = null;
            let minDistance = Infinity;
            
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    const nx = Math.floor(this.x) + dx;
                    const ny = Math.floor(this.y) + dy;
                    
                    if (nx >= 0 && nx < this.environment.width && ny >= 0 && ny < this.environment.height) {
                        const otherBiome = this.environment.getBiome(nx, ny);
                        if (otherBiome && (otherBiome.type === 'ocean' || otherBiome.type === 'swamp')) {
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestWater = { x: nx, y: ny };
                            }
                        }
                    }
                }
            }
            
            if (closestWater) {
                this.moveTowards(closestWater.x, closestWater.y);
            } else {
                this.wander();
            }
        }
    }
    
    // Boit de l'eau
    drink() {
        const biome = this.environment.getBiome(Math.floor(this.x), Math.floor(this.y));
        if (biome && (biome.type === 'ocean' || biome.type === 'swamp')) {
            this.thirst = Math.max(0, this.thirst - 50);
            this.energy += 5;
            this.energy = Math.min(this.energy, this.maxEnergy);
        }
    }
    
    // Cherche un partenaire pour la reproduction
    seekPartner(creatures) {
        const potentialPartners = creatures.filter(c => 
            c !== this && 
            c.gender !== this.gender && 
            c.fertility > 0.5 && 
            c.energy > 50 && 
            c.health > 50
        );
        
        if (potentialPartners.length > 0) {
            // Trouver le partenaire le plus proche
            let closestPartner = null;
            let minDistance = Infinity;
            
            for (const partner of potentialPartners) {
                const distance = this.getDistanceTo(partner);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPartner = partner;
                }
            }
            
            // Se déplacer vers le partenaire
            if (closestPartner && minDistance > 1) {
                this.moveTowards(closestPartner.x, closestPartner.y);
            } else if (closestPartner && minDistance <= 1) {
                // Reproduction
                this.reproduce(closestPartner);
            }
        } else {
            this.wander();
        }
    }
    
    // Reproduction
    reproduce(partner) {
        if (this.gender === 'female' && this.pregnancy === 0 && Math.random() < this.fertility) {
            this.pregnancy = this.pregnancyDuration;
            this.energy -= 20;
            
            // Mémoriser le partenaire
            this.memory.partners.push(partner.id);
            partner.memory.partners.push(this.id);
        }
    }
    
    // Donne naissance
    giveBirth() {
        const offspringCount = Math.floor(Math.random() * 3) + 1; // 1-3 petits
        const offspring = [];
        
        for (let i = 0; i < offspringCount; i++) {
            const child = new Creature(this.x, this.y, this.environment, this);
            child.energy = this.energy * 0.3;
            this.energy *= 0.7;
            this.offspring += offspringCount;
            offspring.push(child);
        }
        
        return offspring;
    }
    
    // Se déplace de manière aléatoire
    wander() {
        this.direction += (Math.random() - 0.5) * 45;
        this.moveForward();
    }
    
    // Se déplace vers une position cible
    moveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.direction = Math.atan2(dy, dx) * 180 / Math.PI;
            this.moveForward();
        }
    }
    
    // Avance dans la direction actuelle
    moveForward() {
        const speed = this.physicalTraits.speed * (this.energy / this.maxEnergy);
        
        const rad = this.direction * Math.PI / 180;
        const dx = Math.cos(rad) * speed;
        const dy = Math.sin(rad) * speed;
        
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Vérifier les limites
        if (newX >= 0 && newX < this.environment.width && newY >= 0 && newY < this.environment.height) {
            const biome = this.environment.getBiome(Math.floor(newX), Math.floor(newY));
            
            // Vérifier si le biome est accessible
            if (biome && (biome.type !== 'mountain' || this.physicalTraits.strength > 0.8)) {
                this.x = newX;
                this.y = newY;
                this.energy -= 0.1 * speed;
            }
        }
    }
    
    // Calcule la distance vers une autre créature
    getDistanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Obtient le fitness de la créature (adaptation à l'environnement)
    getFitness() {
        const biome = this.environment.getBiome(Math.floor(this.x), Math.floor(this.y));
        if (!biome) return 0;
        
        let fitness = 0;
        
        // Adaptation au biome
        fitness += (this.biomeAdaptation[biome.type] || 0) * 2;
        
        // Caractéristiques physiques
        fitness += this.physicalTraits.size * 0.5;
        fitness += this.physicalTraits.speed * 0.5;
        fitness += this.physicalTraits.strength * 0.5;
        fitness += this.physicalTraits.vision * 0.3;
        fitness += this.physicalTraits.camouflage * 0.2;
        fitness += this.physicalTraits.armor * 0.2;
        
        // Caractéristiques comportementales
        fitness += this.behavioralTraits.gathering * 0.8;
        fitness += this.behavioralTraits.hunting * 0.5;
        fitness += this.behavioralTraits.sociability * 0.3;
        fitness += (1 - this.behavioralTraits.fear) * 0.2;
        
        // État général
        fitness += this.energy / this.maxEnergy * 2;
        fitness += this.health / this.maxHealth * 2;
        fitness += (1 - this.age / this.lifespan) * 1;
        
        // Bonus pour la reproduction
        fitness += this.offspring * 0.5;
        fitness += this.fertility * 0.3;
        
        return fitness;
    }
    
    // Obtient les informations de la créature pour l'affichage
    getInfo() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            energy: this.energy,
            health: this.health,
            age: this.age,
            lifespan: this.lifespan,
            gender: this.gender,
            generation: this.generation,
            offspring: this.offspring,
            mutations: this.mutations,
            biomeAdaptation: this.biomeAdaptation,
            physicalTraits: { ...this.physicalTraits },
            behavioralTraits: { ...this.behavioralTraits }
        };
    }
    
    // Dessine la créature sur un contexte Canvas
    draw(ctx, cellSize) {
        const centerX = this.x * cellSize + cellSize / 2;
        const centerY = this.y * cellSize + cellSize / 2;
        const radius = this.physicalTraits.size * cellSize * 0.4;
        
        // Corps principal
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.physicalTraits.color;
        ctx.fill();
        
        // Bordure (armure)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.lineWidth = this.physicalTraits.armor * 3;
        ctx.strokeStyle = '#333333';
        ctx.stroke();
        
        // Yeux (vision)
        const eyeSize = this.physicalTraits.vision * 2;
        const eyeOffset = radius * 0.6;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX + eyeOffset, centerY - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, centerY - eyeOffset * 0.5, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilles
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX + eyeOffset, centerY - eyeOffset * 0.5, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, centerY - eyeOffset * 0.5, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Indicateurs d'état
        this.drawStatusIndicators(ctx, centerX, centerY, radius, cellSize);
        
        // Direction
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.direction * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(0, -radius * 1.5);
        ctx.lineTo(radius * 0.3, -radius * 1.2);
        ctx.closePath();
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.restore();
        
        ctx.restore();
    }
    
    // Dessine les indicateurs d'état
    drawStatusIndicators(ctx, centerX, centerY, radius, cellSize) {
        // Barre d'énergie
        const barHeight = 3;
        const barWidth = radius * 2;
        const barY = centerY - radius - 5;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(centerX - barWidth / 2, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(centerX - barWidth / 2, barY, barWidth * (this.energy / this.maxEnergy), barHeight);
        
        // Barre de santé
        ctx.fillStyle = '#333333';
        ctx.fillRect(centerX - barWidth / 2, barY + barHeight + 2, barWidth, barHeight);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(centerX - barWidth / 2, barY + barHeight + 2, barWidth * (this.health / this.maxHealth), barHeight);
        
        // Indicateur de grossesse (femelle)
        if (this.gender === 'female' && this.pregnancy > 0) {
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Indicateur de genre
        ctx.fillStyle = this.gender === 'male' ? '#0088ff' : '#ff0088';
        ctx.beginPath();
        ctx.arc(centerX + radius * 0.5, centerY - radius * 0.5, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Creature };
}
