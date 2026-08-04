// ============================================
// MAIN.JS
// Point d'entrée principal de l'application
// ============================================

// Attendre que le DOM soit chargé
window.addEventListener('DOMContentLoaded', () => {
    // Récupérer les éléments du DOM
    const simulationCanvas = document.getElementById('simulationCanvas');
    const statsCanvas = document.getElementById('statsCanvas');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const stepBtn = document.getElementById('stepBtn');
    
    const gridSizeInput = document.getElementById('gridSize');
    const initialCreaturesInput = document.getElementById('initialCreatures');
    const mutationRateInput = document.getElementById('mutationRate');
    const mutationRateValue = document.getElementById('mutationRateValue');
    const simSpeedInput = document.getElementById('simSpeed');
    const simSpeedValue = document.getElementById('simSpeedValue');
    
    // Configuration initiale
    let config = {
        gridSize: parseInt(gridSizeInput.value),
        initialCreatures: parseInt(initialCreaturesInput.value),
        mutationRate: parseInt(mutationRateInput.value) / 100,
        simSpeed: parseInt(simSpeedInput.value)
    };
    
    // Créer la simulation
    let simulation = null;
    
    function initSimulation() {
        // Redimensionner le canvas
        const container = simulationCanvas.parentElement;
        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        
        const canvasSize = Math.min(maxWidth, maxHeight);
        simulationCanvas.width = canvasSize;
        simulationCanvas.height = canvasSize;
        
        // Créer la simulation
        if (simulation) {
            simulation.stop();
        }
        simulation = new Simulation(simulationCanvas, statsCanvas, config);
        
        // Mettre à jour l'interface
        updateUI();
        
        // Dessiner une première fois
        drawSimulation();
    }
    
    function updateUI() {
        // Mettre à jour les valeurs affichées
        mutationRateValue.textContent = `${mutationRateInput.value}%`;
        simSpeedValue.textContent = simSpeedInput.value;
        
        // Mettre à jour les compteurs de la simulation
        if (simulation) {
            document.getElementById('dayCounter').textContent = simulation.day;
            document.getElementById('creatureCount').textContent = simulation.creatures.length;
            document.getElementById('avgAge').textContent = simulation.stats.avgAge.length > 0 
                ? simulation.stats.avgAge[simulation.stats.avgAge.length - 1].toFixed(1) 
                : '0';
            document.getElementById('avgEnergy').textContent = simulation.stats.avgEnergy.length > 0 
                ? simulation.stats.avgEnergy[simulation.stats.avgEnergy.length - 1].toFixed(1) 
                : '0';
            document.getElementById('dominantBiome').textContent = simulation.environment.getDominantBiome() || '-';
        }
        
        // Activer/désactiver les boutons
        startBtn.disabled = simulation && simulation.running && !simulation.paused;
        pauseBtn.disabled = !(simulation && simulation.running && !simulation.paused);
    }
    
    function drawSimulation() {
        if (!simulation) return;
        
        const ctx = simulationCanvas.getContext('2d');
        const cellSize = simulation.config.cellSize;
        const gridSize = simulation.config.gridSize;
        
        // Effacer le canvas
        ctx.clearRect(0, 0, simulationCanvas.width, simulationCanvas.height);
        
        // Dessiner l'environnement
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const biome = simulation.environment.getBiome(x, y);
                if (biome) {
                    ctx.fillStyle = biome.getColor();
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    
                    // Dessiner les ressources
                    const resource = simulation.environment.getResource(x, y);
                    if (resource && resource.amount > 0) {
                        ctx.fillStyle = resource.getColor();
                        ctx.globalAlpha = 0.7;
                        ctx.beginPath();
                        ctx.arc(
                            x * cellSize + cellSize / 2,
                            y * cellSize + cellSize / 2,
                            cellSize * 0.3,
                            0, Math.PI * 2
                        );
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        }
        
        // Dessiner les créatures
        for (const creature of simulation.creatures) {
            creature.draw(ctx, cellSize);
        }
        
        // Dessiner les informations de la météo
        const weather = simulation.environment.getWeather();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Jour: ${simulation.day} | Météo: ${weather.getWeatherDescription()} | Créatures: ${simulation.creatures.length}`, 10, 20);
    }
    
    // Événements des boutons
    startBtn.addEventListener('click', () => {
        if (!simulation) {
            initSimulation();
        }
        
        if (simulation) {
            if (simulation.paused) {
                simulation.resume();
            } else if (!simulation.running) {
                simulation.start();
            }
        }
        
        updateUI();
    });
    
    pauseBtn.addEventListener('click', () => {
        if (simulation && simulation.running) {
            simulation.pause();
        }
        updateUI();
    });
    
    resetBtn.addEventListener('click', () => {
        // Mettre à jour la configuration
        config = {
            gridSize: parseInt(gridSizeInput.value),
            initialCreatures: parseInt(initialCreaturesInput.value),
            mutationRate: parseInt(mutationRateInput.value) / 100,
            simSpeed: parseInt(simSpeedInput.value)
        };
        
        initSimulation();
        updateUI();
    });
    
    stepBtn.addEventListener('click', () => {
        if (!simulation) {
            initSimulation();
        }
        
        if (simulation) {
            simulation.step();
            drawSimulation();
        }
        
        updateUI();
    });
    
    // Événements des inputs
    gridSizeInput.addEventListener('change', () => {
        config.gridSize = parseInt(gridSizeInput.value);
    });
    
    initialCreaturesInput.addEventListener('change', () => {
        config.initialCreatures = parseInt(initialCreaturesInput.value);
    });
    
    mutationRateInput.addEventListener('input', () => {
        mutationRateValue.textContent = `${mutationRateInput.value}%`;
        config.mutationRate = parseInt(mutationRateInput.value) / 100;
    });
    
    simSpeedInput.addEventListener('input', () => {
        simSpeedValue.textContent = simSpeedInput.value;
        config.simSpeed = parseInt(simSpeedInput.value);
        
        if (simulation) {
            simulation.config.simSpeed = config.simSpeed;
        }
    });
    
    // Événement de redimensionnement
    window.addEventListener('resize', () => {
        if (simulation) {
            simulation.resizeCanvas();
            drawSimulation();
        }
    });
    
    // Initialiser la simulation
    initSimulation();
    
    // Boucle de rendu
    function renderLoop() {
        if (simulation && simulation.running) {
            drawSimulation();
        }
        
        requestAnimationFrame(renderLoop);
    }
    
    renderLoop();
    
    // Exposer les objets globaux pour le débogage
    window.simulation = simulation;
});

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Génère un ID unique
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

// Formate un nombre
function formatNumber(num) {
    return num.toFixed(2);
}
