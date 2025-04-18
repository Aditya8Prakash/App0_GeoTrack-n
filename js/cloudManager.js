
// cloudManager.js
export class CloudManager {
    constructor(map) {
        this.map = map;
        this.cloudLayers = [];
        this.cloudData = null;
    }

    async initializeCloudData() {
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&hourly=cloudcover');
            const data = await response.json();
            this.cloudData = data.hourly.cloudcover;
            console.log("Cloud data fetched successfully:", this.cloudData);
        } catch (error) {
            console.error("Error fetching cloud data:", error);
            this.cloudData = null;
        }
    }

    displayClouds() {
        if (!this.cloudData) return;

        this.cloudData.forEach(cloud => {
            const latitude = Math.random() * 180 - 90;
            const longitude = Math.random() * 360 - 180;
            const cloudShape = L.polygon(this.generateCloudShape([latitude, longitude], cloud), {
                color: 'rgba(221, 221, 221, 0.00015)',
                fillColor: 'rgba(221, 221, 221, 0.025)',
                fillOpacity: cloud / (128 * Math.PI),
                weight: 4
            }).addTo(this.map);
            this.cloudLayers.push(cloudShape);
        });
    }

    generateCloudShape(center, size) {
        const points = [];
        const numPoints = 80 + Math.round(Math.random() * Math.random());
        const noiseFactor = 0.2;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const radius = size * (0.4 + noiseFactor * (Math.random() - 0.5));
            const x = center[0] + radius * Math.cos(angle);
            const y = center[1] + radius * Math.sin(angle);
            points.push([x, y]);
        }
        return points;
    }

    removeClouds() {
        this.cloudLayers.forEach(layer => this.map.removeLayer(layer));
        this.cloudLayers = [];
    }

    refreshClouds() {
        if (this.cloudData) {
            this.removeClouds();
            this.displayClouds();
            this.displayClouds();
        }
    }
}
