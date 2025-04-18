export class CrosshairManager {
    constructor(map) {
        this.map = map;
        this.crosshair = document.getElementById('crosshair');
        this.centerDot = document.getElementById('centerDot');
        this.crosshairStyles = null;
        this.currentStyleIndex = 0;
        this.currentSize = null; // Track current size

        // Configuration constants
        this.CONFIG = {
            BASE_SIZE: 16,
            MAX_SIZE: 64,
            ZOOM_THRESHOLD: 15,
            VISIBILITY_THRESHOLD: 6,
            TRANSITION_DURATION: 300,
            MAX_GLOW: 10, // Maximum glow intensity multiplier
            COLORS: {
                DEFAULT: 'rgba(255, 255, 255, 0.4)',
                TARGET: 'rgb(0, 255, 0)',
                HOVER: 'rgba(100, 181, 246, 0.5)'
            }
        };

        this.init();
    }

    async init() {
        await this.loadCrosshairStyles();
        this.setupEventListeners();
        this.updatePosition();
        this.updateCrosshairVisibility();
    }

    async loadCrosshairStyles() {
        try {
            const response = await fetch('./json/crosshair.json');
            if (!response.ok) throw new Error('Failed to load crosshair styles');
            this.crosshairStyles = await response.json();
            this.applyCurrentStyle();
        } catch (error) {
            console.error('Crosshair styles loading error:', error);
            this.applyDefaultStyle();
        }
    }

    setupEventListeners() {
        const throttledZoomHandler = this.throttle(() => {
            this.updateCrosshairVisibility();
            this.updateCrosshairStyle();

        }, 16);

        const throttledResizeHandler = this.throttle(() => {
            this.updatePosition();
        }, 100);

        this.map.on('zoom', throttledZoomHandler);
        window.addEventListener('resize', throttledResizeHandler);

        document.addEventListener('change', (e) => {
            if (e.target.name === 'crosshair_style') {
                this.currentStyleIndex = parseInt(e.target.value);
                this.applyCurrentStyle(true); // Pass true to preserve size
            }
        });
    }

    applyCurrentStyle(preserveSize = false) {
        if (!this.crosshairStyles) return;

        const style = this.crosshairStyles[this.currentStyleIndex].styles;
        const previousSize = preserveSize ? this.getCurrentSize() : null;

        this.crosshair.className = `crosshair-${style.shape}`;

        if (!this.centerDot) {
            this.centerDot = document.createElement('div');
            this.centerDot.id = 'centerDot';
            this.centerDot.className = 'center-dot';
            this.crosshair.appendChild(this.centerDot);
        }

        // Apply size while preserving current size if needed
        if (preserveSize && previousSize) {
            this.setSize(previousSize);
        } else {
            this.applyBaseStyles();
        }
    }

    getCurrentSize() {
        return this.currentSize || this.CONFIG.BASE_SIZE;
    }

    setSize(size) {
        this.currentSize = size;
        this.crosshair.style.width = `${size}px`;
        this.crosshair.style.height = `${size}px`;
    }

    applyDefaultStyle() {
        this.crosshair.className = 'crosshair-circle';
        this.setSize(this.CONFIG.BASE_SIZE);
        this.crosshair.style.border = `2px solid ${this.CONFIG.COLORS.DEFAULT}`;
    }

    applyBaseStyles() {
        this.setSize(this.CONFIG.BASE_SIZE);
    }

    updatePosition() {
        requestAnimationFrame(() => {
            this.crosshair.style.left = '50%';
            this.crosshair.style.top = '50%';
        });
    }

    updateCrosshairVisibility() {
        const currentZoom = this.map.getZoom();
        const isVisible = currentZoom >= this.CONFIG.VISIBILITY_THRESHOLD;

        const styles = {
            opacity: isVisible ? '1' : '0',
            transform: `scale(${isVisible ? 1 : 0.5}) translate(-50%, -50%)`,
            display: isVisible ? 'block' : 'none'
        };

        Object.assign(this.crosshair.style, styles);
    }

    updateCrosshairStyle() {
        const currentZoom = this.map.getZoom();

        // Exit early if zoom is below threshold
        if (currentZoom < this.CONFIG.ZOOM_THRESHOLD) {
            this.applyCurrentStyle(true);
            return;
        }

        const zoomDiff = currentZoom - this.CONFIG.ZOOM_THRESHOLD;

        // Calculate interpolations for size, color, and glow
        const sizeInterpolation = Math.min(zoomDiff / 3, 1);
        const glowInterpolation = Math.min(zoomDiff / 4, 1);

        // Update visual properties
        this.updateSizeInterpolation(sizeInterpolation);
        this.updateGlowEffect(zoomDiff, glowInterpolation);
        this.updateColorInterpolation(glowInterpolation);
    }

    updateSizeInterpolation(interpolation) {
        const baseSize = this.CONFIG.BASE_SIZE;
        const maxSize = this.CONFIG.MAX_SIZE;

        // Interpolate size dynamically
        const newSize = baseSize + (maxSize - baseSize) * interpolation;

        this.setSize(newSize);
    }

    updateGlowEffect(zoomDiff, interpolation) {
        // Dynamic intensity and shadow size
        const intensity = Math.min(zoomDiff * 2, this.CONFIG.MAX_GLOW);
        const shadowSize = intensity * interpolation;

        const glowStyle = `
            0 0 ${shadowSize}px ${shadowSize}px rgba(0, 255, 0, ${interpolation * 0.5}),
            inset 0 0 ${shadowSize / 2}px ${shadowSize / 2}px rgba(0, 255, 0, ${interpolation * 0.3})
        `;

        // Apply glow to the crosshair and center dot
        this.crosshair.style.boxShadow = glowStyle;

        if (this.centerDot) {
            this.centerDot.style.boxShadow = `
                0 0 ${shadowSize}px ${shadowSize}px rgba(0, 255, 0, ${interpolation * 0.5})
            `;
        }
    }

    updateColorInterpolation(interpolation) {
        // Interpolate between default and target colors
        const color = this.interpolateColor(
            this.CONFIG.COLORS.DEFAULT,
            this.CONFIG.COLORS.TARGET,
            interpolation
        );

        this.crosshair.style.borderColor = color;
        this.updateCrosshairLines(color);

        if (this.centerDot) {
            this.centerDot.style.backgroundColor = color;
        }
    }

    updateCrosshairLines(color) {
        // Use CSS custom property for better performance
        this.crosshair.style.setProperty('--crosshair-color', color);
    }

    interpolateColor(startColor, endColor, progress) {
        const start = this.parseColor(startColor);
        const end = this.parseColor(endColor);

        if (!start || !end) return startColor;

        const r = Math.round(start.r + (end.r - start.r) * progress);
        const g = Math.round(start.g + (end.g - start.g) * progress);
        const b = Math.round(start.b + (end.b - start.b) * progress);
        const a = start.a + (end.a - start.a) * progress;

        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    parseColor(color) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        if (!match) return null;

        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] ? parseFloat(match[4]) : 1
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
