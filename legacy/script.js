// SCRIPT . JS



// MAP CREATION




// Define map options
const mapOptions = {
    worldCopyJump: false,
    inertiaDeceleration: 3000,
    maxBounds: [[-90, -180], [90, 180]],
    initialView: [0, 0],
    initialZoom: 1
};
// Initialize the map with options
const map = L.map('map', {
    ...mapOptions,
    renderer: L.canvas()
}).setView(mapOptions.initialView, mapOptions.initialZoom);

// Add tile layer to the map with custom styling
const tileLayerOptions = {
    maxZoom: 19,
    minZoom: 1,
    attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
};

const tileLayer = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWRpdHlhLXByYWthc2giLCJhIjoiY2toaXk0emcxMWd6MjJ5bzQ1d3llOG9lYiJ9.TP_domm-fG2YvZPszt0DSA',
    tileLayerOptions
).addTo(map);

// Initialize terminator
const terminator = L.terminator({
    color: 'rgba(0, 0, 0, 0.125)',  // Transparent night side
    fillColor: 'rgba(0, 0, 0, 0.625)', // Semi-transparent night side
    fillOpacity: 0.5,
    resolution: 7  // Higher resolution for smoother edges
});

// Function to update the terminator position based on the current time
function updateTerminator() {
    terminator.setTime(new Date());
    terminator.addTo(map);
}

setInterval(updateTerminator, 300000);
updateTerminator();

map.removeLayer(terminator);


// ZOOM END HANDLER

// Track tile loading state
const tileDebugData = {
    tilesLoading: 0,
    tilesLoaded: 0,
    process: 'NaN'
};

// Update UI on tile load events
tileLayer.on({
    tileloadstart: () => updateTileData('Loading', 1),
    tileload: () => updateTileData('Loaded'),
    tileloadend: () => {
        tileDebugData.tilesLoading--;
        if (tileDebugData.tilesLoading === 0) console.log('All tiles loaded!');
    }
});

const updateTileData = (process, increment = 0) => {
    tileDebugData.tilesLoading += increment;
    tileDebugData.process = process;
    UI_MAP_display_compulsory_debug_data.chunkLoder.textContent = `Chunk: ${process}`;
};

const predictAltitude = (zoomLevel) => {
    const minAltitude = 15240; // Height of average spy drone +- 500m in SI units  // DO NOT MIND mountain height
    const maxAltitude = 3578600; // Height of Average Geo-Sat Sattelite in SI units

    const zoomFactor = (zoomLevel - tileLayerOptions.minZoom) / (tileLayerOptions.maxZoom - tileLayerOptions.minZoom);
    return maxAltitude * (1 - zoomFactor) + minAltitude * zoomFactor;
}


// Define the world border coordinates
const worldBorder = [
    [-90, -180],
    [-90, 180],
    [90, 180],
    [90, -180],
    [-90, -180]
];

// Create and add polyline to the map
const polylineOptions = {
    color: 'orange',
    weight: Math.E ** 2,
    opacity: Math.PI / 10,
    smoothFactor: Math.E
};

L.polyline(worldBorder, polylineOptions).addTo(map);

// FADE ANIMATION

/**
 * Fades an element to a target opacity over a specified duration.
 * @param {HTMLElement} element - The DOM element to fade.
 * @param {number} targetOpacity - The target opacity (0 to 1).
 * @param {number} duration - The duration of the fade effect in milliseconds.
 */
const fadeTo = (element, targetOpacity, duration) => {
    const startOpacity = parseFloat(getComputedStyle(element).opacity);
    const startTime = Date.now();

    const update = () => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        element.style.opacity = startOpacity + (targetOpacity - startOpacity) * progress;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    };

    update();
};

// DYNAMIC ZOOM UI

// UI Elements
const UI_world_header = document.getElementById('worldLevelText');
UI_world_header.textContent = 'World: 0';

const UI_MAP_display_compulsory_debug_data = {
    zoomLabel: document.getElementById('zoom_level'),
    chunkLoder: document.getElementById('chunk_loader_status'),
    zoomAltitude: document.getElementById('zoom_altitude'),
    parent: document.getElementById('display_compulsory_debug_data')
};

const headerAndFooter = {
    header: document.getElementById('header'),
    footer: document.getElementById('footer')
};

// CLOUDS FETCHING AND DISPLAYING
let cloudLayers = [];
let cloudData = null;

// Fetch cloud data
async function fetchCloudData() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&hourly=cloudcover');
        const data = await response.json();
        return data.hourly.cloudcover;
    } catch (error) {
        console.error("Error fetching cloud data:", error);
        return null;
    }
}

// Initialize cloud data
async function initializeCloudData() {
    cloudData = await fetchCloudData();
    if (cloudData) {
        console.log("Cloud data fetched successfully:", cloudData);
        // Further processing like displayClouds(cloudData) can be done here
    } else {
        console.log("No cloud data available.");
    }
}

initializeCloudData();

// Display clouds on the map
function displayClouds(cloudData) {
    cloudData.forEach(cloud => {
        const latitude = Math.random() * 180 - 90;
        const longitude = Math.random() * 360 - 180;

        // Generate random shape for the cloud
        const cloudShape = L.polygon(generateCloudShape([latitude, longitude], cloud), {
            color: 'rgba(221, 221, 221, 0.00015)', // Light grey color with transparency
            fillColor: 'rgba(221, 221, 221, 0.025)',
            fillOpacity: cloud / (128 * Math.PI), // Higher opacity for denser clouds
            weight: 4
        }).addTo(map);

        // Store cloud layer
        cloudLayers.push(cloudShape);
    });
}

// Generate cloud shape

// SIMPLE NOISE FUNCTION FOR CLOUD GENERATION

// Generate cloud shape using a noise function to create more natural cloud boundaries
function generateCloudShape(center, size) {
    const points = [];
    const numPoints = 80 + Math.round(Math.random() * Math.random());
    const noiseFactor = 0.2;  // Adjusts irregularity
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const radius = size * (0.4 + noiseFactor * (Math.random() - 0.5));
        const x = center[0] + radius * Math.cos(angle);
        const y = center[1] + radius * Math.sin(angle);
        points.push([x, y]);
    }
    console.log("clouds shown");
    return points;
}

// Remove clouds from the map
function removeClouds() {
    cloudLayers.forEach(layer => map.removeLayer(layer));
    cloudLayers = []; // Clear the cloud layers array
    console.log("removed clouds");
    
}






// Clamp a value between a minimum and maximum value
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Calculate the zoom step value
const calculateZoomStep = (currentZoomLevel, stepHeight, compensation) =>
    stepHeight * currentZoomLevel - compensation;

// ZOOM END HANDLER
map.on('zoomend', () => {
    const currentZoomLevel = map.getZoom();
    console.log("Current Zoom Level:", currentZoomLevel);

    UI_MAP_display_compulsory_debug_data.zoomLabel.textContent = `Zoom Level: ${currentZoomLevel - 1}`;
    UI_MAP_display_compulsory_debug_data.zoomAltitude.textContent = `Altitude: ${Math.round(predictAltitude(currentZoomLevel))} m`;

    console.log(predictAltitude(currentZoomLevel));

    if (currentZoomLevel < 2) {
        fadeTo(UI_world_header, 1, 250);
        fadeTo(UI_MAP_display_compulsory_debug_data.parent, 0, 250);
        fadeTo(headerAndFooter.header, 0.45, 250);
        fadeTo(headerAndFooter.footer, 0.45, 250);
        removeClouds(); // Remove clouds when zooming out
    } else {
        const opacity_fadeoutUI = clamp(0.4 - calculateZoomStep(currentZoomLevel, 0.02, 0), 0.3, 0.4);
        const opacity_fadeinUI = clamp(0.45 + calculateZoomStep(currentZoomLevel, 0.05, 0), 0.45, 0.85);

        fadeTo(headerAndFooter.header, opacity_fadeoutUI, 250);
        fadeTo(headerAndFooter.footer, opacity_fadeoutUI, 250);
        fadeTo(UI_MAP_display_compulsory_debug_data.parent, opacity_fadeinUI, 250);
        fadeTo(UI_world_header, 0, 250);
    }

    if (currentZoomLevel > 7 || currentZoomLevel < 4) {
        removeClouds();
        console.log('Clouds removed');
    } else if (currentZoomLevel === 7 || currentZoomLevel === 4) {
        if (cloudData) {
            removeClouds();

            displayClouds(cloudData);
            displayClouds(cloudData);

            console.log('Clouds added');
        }
    }

    if (currentZoomLevel >= 2) {
        updateTerminator();
    } else {
        map.removeLayer(terminator);
    }

});
























// TESTING


var polygon = L.polygon([
    [60, -60],    // Original starting point
    [55, -40],    // New point
    [48, -30],    // New point
    [40, -20],    // Original point
    [45, 0],      // New point
    [35, 10],     // New point
    [30, 20],     // Original point
    [25, 30],     // New point
    [20, 40],     // Original point
    [10, 45],     // New point
    [0, 50],      // Original point
    [-10, 48],    // New point
    [-20, 45],    // Original point
    [-30, 40],    // New point
    [-40, 30],    // Original point
    [-45, 45],    // New point
    [-60, 60],    // Original point
    [-60, 40],    // New point
    [-60, 20],    // Original point
    [-55, 0],     // New point
    [-50, -20],   // Original point
    [-55, -40],   // New point
    [-60, -60],   // Original point
    [-45, -55],   // New point
    [-30, -58],   // New point
    [-10, -60],   // Original point
    [-15, -50],   // New point
    [-20, -40],   // Original point
    [-25, -45]    // New point
], {
    id: 'my-polygon',
    color: 'red',
    weight: 2,
    opacity: 0.5
}).addTo(map);

map.on('moveend', async () => {
    var center = map.getCenter();
    console.log("Latitude:", center.lat, "Longitude:", center.lng);
    
    // Use isMarkerInsidePolygon helper function
    var isWithin = isMarkerInsidePolygon(center, polygon);
    
    if (isWithin) {
        console.log('center is within the polygon!');
    } else {
        console.log('center has exited the polygon.');
    }
});

// Helper function to check if a point is inside polygon
function isMarkerInsidePolygon(point, poly) {
    var polyPoints = poly.getLatLngs()[0];
    var x = point.lat, y = point.lng;
    
    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
}