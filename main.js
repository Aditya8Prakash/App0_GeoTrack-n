// main.js
import { MapManager } from './js/mapManager.js';
import { UIManager } from './js/uiManager.js';
import { CloudManager } from './js/cloudManager.js';
import { TerminatorManager } from './js/terminatorManager.js';
import { AnimationManager } from './js/animationManager.js';
import { CrosshairManager } from './js/crosshairManager.js';
import ReverseGeocodingService from './js/reverseGeocodingService.js';

class MainApplication {
    constructor() {
        // Initialize managers
        this.mapManager = new MapManager();
        this.mapManager.mainApp = this;
        this.uiManager = new UIManager();
        this.cloudManager = new CloudManager(this.mapManager.map);
        this.terminatorManager = new TerminatorManager(this.mapManager.map);
        this.animationManager = new AnimationManager();
        this.crosshairManager = new CrosshairManager(this.mapManager.map);
        this.reverseGeocodingService = new ReverseGeocodingService();

        // Setup event listeners
        this.setupEventListeners();
        
        // Initial setup
        this.init();
    }

    setupEventListeners() {
        this.mapManager.map.on('zoomend', () => {
            const currentZoomLevel = this.mapManager.map.getZoom();

            // Update UI
            this.uiManager.updateZoomUI(currentZoomLevel);
            
            // Handle zoom-based features
            this.handleZoomFeatures(currentZoomLevel);
            console.log(currentZoomLevel);
        });

        this.mapManager.map.on('moveend', async () => {
            const currentZoomLevel = this.mapManager.map.getZoom();
            const center = this.mapManager.map.getCenter();
            console.log("Latitude:", center.lat, "Longitude:", center.lng);
        
            // Fetch and log the address using the geocoding service
            const address = await this.reverseGeocodingService.reverseGeocode(center.lat, center.lng, currentZoomLevel);
            console.log("Address:", address);
        });
    
        // Add a method to reattach tile layer listeners
        this.reattachTileLayerListeners();
    }
    
    reattachTileLayerListeners() {
        // Remove existing listeners if they exist
        if (this.mapManager.tileLayer) {
            this.mapManager.tileLayer.off({
                tileloadstart: this.tileLoadStartHandler,
                tileload: this.tileLoadHandler,
                tileloadend: this.tileLoadEndHandler
            });
        }
    
        // Create handler methods
        this.tileLoadStartHandler = () => this.uiManager.updateTileData('Loading', 1);
        this.tileLoadHandler = () => this.uiManager.updateTileData('Loaded');
        this.tileLoadEndHandler = () => this.uiManager.handleTileLoadEnd();
    
        // Reattach listeners to the current tile layer
        this.mapManager.tileLayer.on({
            tileloadstart: this.tileLoadStartHandler,
            tileload: this.tileLoadHandler,
            tileloadend: this.tileLoadEndHandler
        });
    }
    
    handleZoomFeatures(currentZoomLevel) {
        // Handle clouds
        if (currentZoomLevel > 7 || currentZoomLevel < 4) {
            this.cloudManager.removeClouds();
        } else if (currentZoomLevel === 7 || currentZoomLevel === 4) {
            this.cloudManager.refreshClouds();
        }

        // Handle terminator visibility based on zoom level
        if (currentZoomLevel >= 2) {
            this.terminatorManager.updateTerminator();
        } else {
            this.terminatorManager.removeTerminator();
        }

        // Handle UI animations
        this.animationManager.handleZoomAnimations(
            currentZoomLevel,
            this.uiManager.getUIElements()
        );
    }

    async init() {
        // Get initial zoom level
        const initialZoom = this.mapManager.map.getZoom();
        
        // Initialize terminator based on initial zoom
        if (initialZoom >= 2) {
            this.terminatorManager.updateTerminator();
        } else {
            this.terminatorManager.removeTerminator();
        }

        // Initialize cloud data
        await this.cloudManager.initializeCloudData();
    }
}

// Initialize application
const app = new MainApplication();

export default app;