// ============================================
// ENVIRONMENT.JS
// Système de gestion de l'environnement de simulation
// ============================================

class Environment {
    constructor(width, height, cellSize = 10) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.grid = [];
        this.biomes = [];
        this.resources = [];
        this.weather = new WeatherSystem(this);
        this.climate = new ClimateSystem(this);
        this.terrain = new TerrainSystem(this);
        
        this.init();
    }
    
    init() {
        this.generateTerrain();
        this.generateBiomes();
        this.generateResources();
        this.weather.init();
        this.climate.init();
    }
    
    // Génère le terrain de base (montagnes, eaux, plaines, etc.)
    generateTerrain() {
        this.terrain.generate();
    }
    
    // Génère les biomes basés sur le terrain et le climat
    generateBiomes() {
        this.biomes = [];
        const biomeTypes = ['forest', 'desert', 'mountain', 'ocean', 'grassland', 'tundra', 'swamp', 'jungle'];
        
        for (let y = 0; y < this.height; y++) {
            this.biomes[y] = [];
            for (let x = 0; x < this.width; x++) {
                // Déterminer le biome en fonction de l'altitude et de l'humidité
                const altitude = this.terrain.getAltitude(x, y);
                const humidity = this.climate.getHumidity(x, y);
                const temperature = this.climate.getTemperature(x, y);
                
                let biome = this.determineBiome(altitude, humidity, temperature);
                this.biomes[y][x] = new Biome(x, y, biome, this);
            }
        }
    }
    
    determineBiome(altitude, humidity, temperature) {
        // Logique de détermination des biomes
        if (altitude > 0.8) {
            return 'mountain';
        } else if (altitude < 0.2) {
            return 'ocean';
        } else if (temperature > 0.8 && humidity < 0.3) {
            return 'desert';
        } else if (temperature < 0.3) {
            return 'tundra';
        } else if (humidity > 0.8 && temperature > 0.7) {
            return 'jungle';
        } else if (humidity > 0.7) {
            return 'swamp';
        } else if (humidity > 0.5) {
            return 'forest';
        } else {
            return 'grassland';
        }
    }
    
    // Génère les ressources disponibles dans l'environnement
    generateResources() {
        this.resources = [];
        
        for (let y = 0; y < this.height; y++) {
            this.resources[y] = [];
            for (let x = 0; x < this.width; x++) {
                const biome = this.biomes[y][x];
                const resourceType = biome.getResourceType();
                const amount = Math.random() * 100;
                
                this.resources[y][x] = new Resource(x, y, resourceType, amount, biome);
            }
        }
    }
    
    // Met à jour l'environnement (météo, croissance des ressources, etc.)
    update(day) {
        this.weather.update(day);
        this.climate.update(day);
        this.growResources();
        this.updateBiomes();
    }
    
    // Fait pousser les ressources
    growResources() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const biome = this.biomes[y][x];
                const growthRate = biome.getGrowthRate();
                
                this.resources[y][x].amount = Math.min(
                    this.resources[y][x].amount + growthRate * Math.random(),
                    this.resources[y][x].maxAmount
                );
            }
        }
    }
    
    // Met à jour les biomes en fonction des changements climatiques
    updateBiomes() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const newBiome = this.determineBiome(
                    this.terrain.getAltitude(x, y),
                    this.climate.getHumidity(x, y),
                    this.climate.getTemperature(x, y)
                );
                
                if (this.biomes[y][x].type !== newBiome) {
                    this.biomes[y][x].transitionTo(newBiome);
                }
            }
        }
    }
    
    // Consomme une ressource à une position donnée
    consumeResource(x, y, amount) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const resource = this.resources[y][x];
            const consumed = Math.min(amount, resource.amount);
            resource.amount -= consumed;
            return consumed;
        }
        return 0;
    }
    
    // Obtient le biome à une position donnée
    getBiome(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.biomes[y][x];
        }
        return null;
    }
    
    // Obtient la ressource à une position donnée
    getResource(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.resources[y][x];
        }
        return null;
    }
    
    // Obtient l'altitude à une position donnée
    getAltitude(x, y) {
        return this.terrain.getAltitude(x, y);
    }
    
    // Obtient la température à une position donnée
    getTemperature(x, y) {
        return this.climate.getTemperature(x, y);
    }
    
    // Obtient l'humidité à une position donnée
    getHumidity(x, y) {
        return this.climate.getHumidity(x, y);
    }
    
    // Obtient la météo actuelle
    getWeather() {
        return this.weather;
    }
    
    // Obtient le biome dominant
    getDominantBiome() {
        const biomeCounts = {};
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const biomeType = this.biomes[y][x].type;
                biomeCounts[biomeType] = (biomeCounts[biomeType] || 0) + 1;
            }
        }
        
        let dominantBiome = null;
        let maxCount = 0;
        
        for (const biomeType in biomeCounts) {
            if (biomeCounts[biomeType] > maxCount) {
                maxCount = biomeCounts[biomeType];
                dominantBiome = biomeType;
            }
        }
        
        return dominantBiome;
    }
    
    // Réinitialise l'environnement
    reset(width, height) {
        this.width = width;
        this.height = height;
        this.init();
    }
}

// ============================================
// CLASSE BIOME
// ============================================

class Biome {
    constructor(x, y, type, environment) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.environment = environment;
        this.age = 0;
        this.stability = 1.0; // 0 = instable, 1 = très stable
        
        this.colors = {
            'forest': '#2d5a27',
            'desert': '#c2b280',
            'mountain': '#808080',
            'ocean': '#1a5fb4',
            'grassland': '#7cfc00',
            'tundra': '#e0e0e0',
            'swamp': '#556b2f',
            'jungle': '#228b22'
        };
        
        this.resourceTypes = {
            'forest': ['berries', 'wood', 'mushrooms'],
            'desert': ['cactus', 'sand', 'scorpions'],
            'mountain': ['stone', 'metal', 'crystals'],
            'ocean': ['fish', 'algae', 'shells'],
            'grassland': ['grass', 'seeds', 'insects'],
            'tundra': ['moss', 'ice', 'snow'],
            'swamp': ['water', 'reeds', 'frogs'],
            'jungle': ['fruits', 'vines', 'exotic_plants']
        };
        
        this.growthRates = {
            'forest': 0.5,
            'desert': 0.1,
            'mountain': 0.05,
            'ocean': 0.8,
            'grassland': 0.7,
            'tundra': 0.2,
            'swamp': 0.6,
            'jungle': 0.9
        };
    }
    
    getColor() {
        return this.colors[this.type] || '#555555';
    }
    
    getResourceType() {
        const types = this.resourceTypes[this.type] || ['generic'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    getGrowthRate() {
        return this.growthRates[this.type] || 0.3;
    }
    
    transitionTo(newType) {
        this.type = newType;
        this.age = 0;
        this.stability = 0.5; // Réduire la stabilité après un changement
    }
    
    update() {
        this.age++;
        this.stability = Math.min(this.stability + 0.01, 1.0);
    }
}

// ============================================
// CLASSE RESSOURCE
// ============================================

class Resource {
    constructor(x, y, type, amount, biome) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.amount = amount;
        this.maxAmount = amount * 2;
        this.biome = biome;
        this.regrowthRate = biome.getGrowthRate();
        
        this.colors = {
            'berries': '#ff0000',
            'wood': '#8b4513',
            'mushrooms': '#ff69b4',
            'cactus': '#00ff00',
            'sand': '#f4a460',
            'scorpions': '#ff0000',
            'stone': '#808080',
            'metal': '#c0c0c0',
            'crystals': '#00ffff',
            'fish': '#008080',
            'algae': '#006400',
            'shells': '#ffff00',
            'grass': '#7cfc00',
            'seeds': '#f5deb3',
            'insects': '#ff0000',
            'moss': '#8fbc8f',
            'ice': '#add8e6',
            'snow': '#ffffff',
            'water': '#1e90ff',
            'reeds': '#90ee90',
            'frogs': '#008000',
            'fruits': '#ffa500',
            'vines': '#228b22',
            'exotic_plants': '#ff00ff',
            'generic': '#808080'
        };
    }
    
    getColor() {
        return this.colors[this.type] || '#555555';
    }
    
    getNutritionalValue() {
        // Valeur nutritionnelle basée sur le type de ressource
        const values = {
            'berries': 10,
            'wood': 1,
            'mushrooms': 8,
            'cactus': 5,
            'sand': 0,
            'scorpions': -5, // Peut être dangereux
            'stone': 0,
            'metal': 0,
            'crystals': 0,
            'fish': 15,
            'algae': 5,
            'shells': 2,
            'grass': 6,
            'seeds': 8,
            'insects': 10,
            'moss': 3,
            'ice': 0,
            'snow': 0,
            'water': 12,
            'reeds': 4,
            'frogs': 10,
            'fruits': 15,
            'vines': 5,
            'exotic_plants': 20,
            'generic': 5
        };
        
        return values[this.type] || 5;
    }
}

// ============================================
// CLASSE TERRAIN
// ============================================

class TerrainSystem {
    constructor(environment) {
        this.environment = environment;
        this.altitudeMap = [];
        this.noiseScale = 0.1;
    }
    
    generate() {
        this.altitudeMap = [];
        const width = this.environment.width;
        const height = this.environment.height;
        
        // Génération de bruit de Perlin simplifié pour l'altitude
        for (let y = 0; y < height; y++) {
            this.altitudeMap[y] = [];
            for (let x = 0; x < width; x++) {
                // Utilisation d'une fonction de bruit simple
                const nx = x * this.noiseScale;
                const ny = y * this.noiseScale;
                
                // Combinaison de plusieurs octaves pour un terrain plus naturel
                let altitude = 0;
                let amplitude = 1;
                let frequency = 1;
                
                for (let i = 0; i < 4; i++) {
                    altitude += this.simpleNoise(nx * frequency, ny * frequency) * amplitude;
                    amplitude *= 0.5;
                    frequency *= 2;
                }
                
                // Normalisation entre 0 et 1
                altitude = (altitude + 2) / 4;
                altitude = Math.max(0, Math.min(1, altitude));
                
                this.altitudeMap[y][x] = altitude;
            }
        }
    }
    
    // Fonction de bruit simple (simulation de bruit de Perlin)
    simpleNoise(x, y) {
        // Utilisation d'une fonction de hachage simple
        const n = x + y * 57;
        let noise = 0;
        
        // Combinaison de plusieurs fonctions de hachage
        noise += (n * n * n * n) % 1;
        noise += ((n + 1) * (n + 1)) % 1;
        noise += ((n + 2) * (n + 2) * (n + 2)) % 1;
        
        return noise - 1.5; // Retourne une valeur entre -2 et 2 environ
    }
    
    getAltitude(x, y) {
        if (x >= 0 && x < this.environment.width && y >= 0 && y < this.environment.height) {
            return this.altitudeMap[y][x];
        }
        return 0.5;
    }
}

// ============================================
// CLASSE CLIMAT
// ============================================

class ClimateSystem {
    constructor(environment) {
        this.environment = environment;
        this.temperatureMap = [];
        this.humidityMap = [];
        this.season = 0; // 0 = printemps, 1 = été, 2 = automne, 3 = hiver
        this.dayOfYear = 0;
    }
    
    init() {
        this.generateClimateMaps();
    }
    
    generateClimateMaps() {
        const width = this.environment.width;
        const height = this.environment.height;
        
        this.temperatureMap = [];
        this.humidityMap = [];
        
        for (let y = 0; y < height; y++) {
            this.temperatureMap[y] = [];
            this.humidityMap[y] = [];
            
            for (let x = 0; x < width; x++) {
                // La température dépend de la latitude (y) et de l'altitude
                const latitudeFactor = 1 - Math.abs(y / height - 0.5) * 2;
                const altitude = this.environment.terrain.getAltitude(x, y);
                
                // Température de base entre 0 et 1
                let temperature = latitudeFactor * 0.5 + 0.5;
                temperature -= altitude * 0.3; // Plus froid en altitude
                temperature = Math.max(0, Math.min(1, temperature));
                
                // Humidité basée sur la proximité des océans et de l'altitude
                const distanceToOcean = this.getDistanceToOcean(x, y);
                let humidity = 1 - distanceToOcean / Math.max(width, height);
                humidity += altitude * 0.2; // Plus humide en altitude (nuages)
                humidity = Math.max(0, Math.min(1, humidity));
                
                this.temperatureMap[y][x] = temperature;
                this.humidityMap[y][x] = humidity;
            }
        }
    }
    
    getDistanceToOcean(x, y) {
        // Trouve la distance la plus proche à un biome océanique
        let minDistance = Infinity;
        
        for (let dy = -10; dy <= 10; dy++) {
            for (let dx = -10; dx <= 10; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.environment.width && ny >= 0 && ny < this.environment.height) {
                    const biome = this.environment.getBiome(nx, ny);
                    if (biome && biome.type === 'ocean') {
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < minDistance) {
                            minDistance = distance;
                        }
                    }
                }
            }
        }
        
        return minDistance === Infinity ? Math.max(this.environment.width, this.environment.height) : minDistance;
    }
    
    getTemperature(x, y) {
        if (x >= 0 && x < this.environment.width && y >= 0 && y < this.environment.height) {
            // Ajuster en fonction de la saison
            const seasonFactor = [1.0, 1.2, 0.8, 0.5][this.season];
            return this.temperatureMap[y][x] * seasonFactor;
        }
        return 0.5;
    }
    
    getHumidity(x, y) {
        if (x >= 0 && x < this.environment.width && y >= 0 && y < this.environment.height) {
            return this.humidityMap[y][x];
        }
        return 0.5;
    }
    
    update(day) {
        this.dayOfYear = day % 365;
        this.season = Math.floor(this.dayOfYear / 91.25); // ~91 jours par saison
        
        // Mettre à jour les cartes de climat en fonction de la saison
        this.generateClimateMaps();
    }
}

// ============================================
// CLASSE METEO
// ============================================

class WeatherSystem {
    constructor(environment) {
        this.environment = environment;
        this.currentWeather = 'clear';
        this.weatherDuration = 0;
        this.weatherTimer = 0;
        this.temperatureModifier = 0;
        this.precipitation = 0;
        this.windSpeed = 0;
        this.windDirection = 0;
    }
    
    init() {
        this.changeWeather();
    }
    
    changeWeather() {
        const weatherTypes = ['clear', 'cloudy', 'rain', 'snow', 'storm', 'fog'];
        const weights = [0.4, 0.3, 0.15, 0.05, 0.05, 0.05];
        
        // Sélection aléatoire pondérée
        let random = Math.random();
        let totalWeight = 0;
        let selectedIndex = 0;
        
        for (let i = 0; i < weatherTypes.length; i++) {
            totalWeight += weights[i];
            if (random < totalWeight) {
                selectedIndex = i;
                break;
            }
        }
        
        this.currentWeather = weatherTypes[selectedIndex];
        this.weatherDuration = Math.floor(Math.random() * 10) + 3; // 3-12 jours
        this.weatherTimer = 0;
        
        // Modificateurs de météo
        this.temperatureModifier = this.getTemperatureModifier();
        this.precipitation = this.getPrecipitation();
        this.windSpeed = Math.random() * 20; // 0-20 km/h
        this.windDirection = Math.random() * 360; // 0-360 degrés
    }
    
    getTemperatureModifier() {
        switch (this.currentWeather) {
            case 'clear': return 0.1;
            case 'cloudy': return -0.05;
            case 'rain': return -0.15;
            case 'snow': return -0.3;
            case 'storm': return -0.2;
            case 'fog': return -0.05;
            default: return 0;
        }
    }
    
    getPrecipitation() {
        switch (this.currentWeather) {
            case 'clear': return 0;
            case 'cloudy': return 0.1;
            case 'rain': return 0.8;
            case 'snow': return 0.6;
            case 'storm': return 1.0;
            case 'fog': return 0.2;
            default: return 0;
        }
    }
    
    update(day) {
        this.weatherTimer++;
        
        if (this.weatherTimer >= this.weatherDuration) {
            this.changeWeather();
        }
        
        // Variations quotidiennes
        this.windSpeed = Math.max(0, this.windSpeed + (Math.random() - 0.5) * 5);
        this.windDirection = (this.windDirection + (Math.random() - 0.5) * 30) % 360;
    }
    
    getWeatherType() {
        return this.currentWeather;
    }
    
    getWeatherDescription() {
        const descriptions = {
            'clear': 'Ciel dégagé',
            'cloudy': 'Nuageux',
            'rain': 'Pluie',
            'snow': 'Neige',
            'storm': 'Tempête',
            'fog': 'Brouillard'
        };
        return descriptions[this.currentWeather] || 'Inconnu';
    }
    
    getWeatherColor() {
        const colors = {
            'clear': '#87CEEB',
            'cloudy': '#999999',
            'rain': '#4682B4',
            'snow': '#FFFFFF',
            'storm': '#4169E1',
            'fog': '#D3D3D3'
        };
        return colors[this.currentWeather] || '#808080';
    }
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Environment, Biome, Resource, TerrainSystem, ClimateSystem, WeatherSystem };
}
