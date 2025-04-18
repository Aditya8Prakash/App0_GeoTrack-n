// mapManager.js
export class MapManager {
    constructor() {
      this.mapOptions = {
        worldCopyJump: false,
        inertiaDeceleration: 3000,
        maxBounds: [[-90, -180], [90, 180]],
        initialView: [0, 0],
        initialZoom: 1,
      };
  
      this.tileLayerOptions = {
        maxZoom: 19,
        minZoom: 1,
      };
  
      this.mapStyle = {
        name: "SatView (Esri WorldImagery)",
        type: "satellite",
        time: "day",
        api: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "&copy; Esri &amp; GIS Community"
      };
  
      this.mapStyles = null; // Initialize mapStyles to null
      this.loadMapStyles(); // Load styles asynchronously
      this.initializeMap();
      this.addWorldBorder();
      this.updateMapStyle();
    }
  
    async loadMapStyles() {
      try {
        this.mapStyles = await (await fetch('./json/map_styles.json')).json();
        console.log('Map styles loaded:', this.mapStyles);
      } catch (error) {
        console.error('Failed to load JSON file', error);
      }
    }
  
    initializeMap() {
      this.map = L.map('map', {
        ...this.mapOptions,
        renderer: L.canvas(),
      }).setView(this.mapOptions.initialView, this.mapOptions.initialZoom);
  
      this.updateTileLayer();
    }
  
    updateTileLayer() {
      if (this.tileLayer) {
        this.tileLayer.remove();
      }
  
      this.tileLayer = L.tileLayer(this.mapStyle.api, {
        attribution: this.mapStyle.attribution,
        maxZoom: this.tileLayerOptions.maxZoom,
        minZoom: this.tileLayerOptions.minZoom,
      }).addTo(this.map);
    }
  
    addWorldBorder() {
      const worldBorder = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
        [-90, -180],
      ];
  
      const polylineOptions = {
        color: 'orange',
        weight: Math.E ** 2,
        opacity: Math.PI / 10,
        smoothFactor: Math.E,
      };
  
      L.polyline(worldBorder, polylineOptions).addTo(this.map);
    }
  
    updateMapStyle() {
      const radios = document.querySelectorAll('input[type="radio"][name="map_style"]');
      radios.forEach((radio) => {
        radio.addEventListener('change', (event) => this.handleStyleChange(event));
      });
    }
    
    handleStyleChange(event) {
      const styleNumber = parseInt(event.target.value);
      console.log(`Selected style: ${styleNumber}`);
  
      if (this.mapStyles) {
          this.mapStyle = this.mapStyles[styleNumber];
          this.updateTileLayer();
          
          // If this is part of a MainApplication instance, trigger listener reattachment
          if (this.mainApp) {
              this.mainApp.reattachTileLayerListeners();
          }
          
          console.log(this.mapStyle);
      } else {
          console.error('Map styles not loaded yet');
      }
  }
  }