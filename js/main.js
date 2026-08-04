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
    let renderer = null;
    
    function initSimulation() {
        // Redimensionner les canvases
        const container = simulationCanvas.parentElement;
        const maxWidth = container.clientWidth;
        const maxHeight = window.innerHeight * 0.6;
        
        const canvasSize = Math.min(maxWidth, maxHeight);
        simulationCanvas.width = canvasSize;
        simulationCanvas.height = canvasSize;
        
        // Créer la simulation
        simulation = new Simulation(simulationCanvas, statsCanvas, config);
        
        // Créer le renderer
        renderer = new Renderer(simulationCanvas, simulation);
        
        // Mettre à jour l'interface
        updateUI();
    }
    
    function updateUI() {
        // Mettre à jour les valeurs affichées
        mutationRateValue.textContent = `${mutationRateInput.value}%`;
        simSpeedValue.textContent = simSpeedInput.value;
        
        // Activer/désactiver les boutons
        startBtn.disabled = simulation && simulation.running && !simulation.paused;
        pauseBtn.disabled = !(simulation && simulation.running && !simulation.paused);
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
        if (simulation) {
            simulation.stop();
        }
        
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
            if (!simulation.running) {
                simulation.start();
            }
            
            simulation.step();
            if (renderer) {
                renderer.update();
            }
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
        }
        if (renderer) {
            renderer.resizeCanvas();
        }
    });
    
    // Initialiser la simulation
    initSimulation();
    
    // Boucle de rendu
    function renderLoop() {
        if (simulation && simulation.running) {
            if (renderer) {
                renderer.update();
            }
        }
        
        requestAnimationFrame(renderLoop);
    }
    
    renderLoop();
    
    // Exposer les objets globaux pour le débogage
    window.simulation = simulation;
    window.renderer = renderer;
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

// Convertit HSL en RGB
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// EXPORT
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSimulation, generateId, formatNumber, hslToRgb };
}
