// uiManager.js
export class UIManager {
    constructor() {
        this.initializeUIElements();
        this.tileDebugData = {
            tilesLoading: 0,
            tilesLoaded: 0,
            process: 'NaN'
        };
        this.altitudeRanges = {
            satellite: {
                min: 250000,     // Low Earth Orbit satellites (~250km)
                max: 35786000    // Geostationary orbit (~35,786km)
            },
            aerial: {
                min: 150,        // Low-flying aircraft
                max: 20000       // High-altitude aircraft/spy planes
            }
        };
        this.zoomRanges = {
            satellite: { min: 1, max: 5 },    // Satellite view zoom levels
            aerial: { min: 6, max: 19 }       // Aerial view zoom levels
        };
    }

    initializeUIElements() {
        this.worldLevelText = document.getElementById('worldLevelText');
        this.worldLevelText.textContent = 'World: 0';

        this.compulsoryDebugData = {
            zoomLabel: document.getElementById('zoom_level'),
            chunkLoder: document.getElementById('chunk_loader_status'),
            zoomAltitude: document.getElementById('zoom_altitude'),
            parent: document.getElementById('display_compulsory_debug_data')
        };

        this.headerAndFooter = {
            header: document.getElementById('header'),
            footer: document.getElementById('footer')
        };
    }

    getUIElements() {
        return {
            worldLevelText: this.worldLevelText,
            compulsoryDebugData: this.compulsoryDebugData,
            headerAndFooter: this.headerAndFooter
        };
    }

    formatAltitude(meters) {
        if (meters >= 1000000) {
            return `${(meters / 1000000).toFixed(1)} Gm`;
        } else if (meters >= 100000) {
            return `${(meters / 1000).toFixed(1)} Mm`;
        } else if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} Km`;
        }
        return `${Math.round(meters)} m`;
    }

    updateZoomUI(currentZoomLevel) {
        this.compulsoryDebugData.zoomLabel.textContent = `Zoom Level: ${currentZoomLevel - 1}`;
        const altitude = this.predictAltitude(currentZoomLevel);
        this.compulsoryDebugData.zoomAltitude.textContent = `Altitude: ${this.formatAltitude(altitude)}`;
    }

    predictAltitude(zoomLevel) {
        if (zoomLevel <= this.zoomRanges.satellite.max) {
            // Satellite view calculation (exponential scale)
            const zoomProgress = (zoomLevel - this.zoomRanges.satellite.min) / 
                               (this.zoomRanges.satellite.max - this.zoomRanges.satellite.min);
            const exponentialFactor = Math.exp(-4 * zoomProgress);
            return this.altitudeRanges.satellite.min + 
                   (this.altitudeRanges.satellite.max - this.altitudeRanges.satellite.min) * exponentialFactor;
        } else {
            // Aerial view calculation (logarithmic scale)
            const zoomProgress = (zoomLevel - this.zoomRanges.aerial.min) / 
                               (this.zoomRanges.aerial.max - this.zoomRanges.aerial.min);
            const logarithmicFactor = 1 - Math.log10(9 * zoomProgress + 1);
            return this.altitudeRanges.aerial.min + 
                   (this.altitudeRanges.aerial.max - this.altitudeRanges.aerial.min) * logarithmicFactor;
        }
    }

    updateTileData(process, increment = 0) {
        this.tileDebugData.tilesLoading += increment;
        this.tileDebugData.process = process;
        this.compulsoryDebugData.chunkLoder.textContent = `Chunk: ${process}`;
    }

    handleTileLoadEnd() {
        this.tileDebugData.tilesLoading--;
        if (this.tileDebugData.tilesLoading === 0) {
            console.log('All tiles loaded!');
        }
    }
}