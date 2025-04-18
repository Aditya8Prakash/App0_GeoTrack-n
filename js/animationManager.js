export class AnimationManager {
    static CONFIG = {
        ANIMATION: {
            DEFAULT_DURATION: 250,
            FPS: 60,
            WORLD_VIEW_THRESHOLD: 2
        },
        OPACITY: {
            FADEOUT: { MIN: 0.3, MAX: 0.4, BASE: 0.4, STEP: 0.02 },
            FADEIN: { MIN: 0.45, MAX: 0.85, BASE: 0.45, STEP: 0.05 }
        },
        EASING: {
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }
    };

    constructor() {
        this.activeAnimations = new Map();
        this.frameInterval = 1000 / AnimationManager.CONFIG.ANIMATION.FPS;
        this.boundUpdateAnimations = this.updateAnimations.bind(this);
        
        // Pre-calculate common values
        this.rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/;
    }

    handleZoomAnimations(zoomLevel, { worldLevelText, compulsoryDebugData, headerAndFooter }) {
        this.cancelActiveAnimations();

        if (zoomLevel < AnimationManager.CONFIG.ANIMATION.WORLD_VIEW_THRESHOLD) {
            this.animateWorldView(worldLevelText, compulsoryDebugData, headerAndFooter);
        } else {
            this.animateDetailedView(zoomLevel, worldLevelText, compulsoryDebugData, headerAndFooter);
        }
    }

    animateWorldView(worldText, debugData, { header, footer }) {
        this.batchStartFadeAnimations([
            [worldText, 1, 'element'],
            [debugData.parent, 0, 'element'],
            [header, 0.45, 'background'],
            [footer, 0.45, 'background']
        ]);
    }

    animateDetailedView(zoomLevel, worldText, debugData, { header, footer }) {
        const fadeOut = this.calculateOpacity(zoomLevel, 'FADEOUT');
        const fadeIn = this.calculateOpacity(zoomLevel, 'FADEIN');

        this.batchStartFadeAnimations([
            [header, fadeOut, 'background'],
            [footer, fadeOut, 'background'],
            [debugData.parent, fadeIn, 'element'],
            [worldText, 0, 'element']
        ]);
    }

    calculateOpacity(zoomLevel, type) {
        const config = AnimationManager.CONFIG.OPACITY[type];
        return Math.min(Math.max(
            config.BASE + (type === 'FADEOUT' ? -1 : 1) * (config.STEP * zoomLevel),
            config.MIN
        ), config.MAX);
    }

    batchStartFadeAnimations(animations) {
        const startTime = performance.now();
        
        animations.forEach(([element, targetOpacity, type]) => {
            if (!element) return;

            const startOpacity = type === 'background' 
                ? this.getBackgroundOpacity(element)
                : parseFloat(getComputedStyle(element).opacity);

            this.activeAnimations.set(Symbol('animation'), {
                element,
                startOpacity,
                targetOpacity,
                startTime,
                duration: AnimationManager.CONFIG.ANIMATION.DEFAULT_DURATION,
                type,
                easingFunction: AnimationManager.CONFIG.EASING.easeInOutCubic
            });
        });

        if (!this.animationFrameId) {
            this.lastFrameTime = performance.now();
            this.animationFrameId = requestAnimationFrame(this.boundUpdateAnimations);
        }
    }

    getBackgroundOpacity(element) {
        const match = getComputedStyle(element).backgroundColor.match(this.rgbaRegex);
        return match ? (match[4] === undefined ? 1 : parseFloat(match[4])) : 1;
    }

    updateAnimations(currentTime) {
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            this.animationFrameId = requestAnimationFrame(this.boundUpdateAnimations);
            return;
        }

        this.lastFrameTime = currentTime;
        const completed = new Set();

        for (const [id, anim] of this.activeAnimations) {
            const progress = Math.min((currentTime - anim.startTime) / anim.duration, 1);
            const opacity = anim.startOpacity + 
                          (anim.targetOpacity - anim.startOpacity) * 
                          anim.easingFunction(progress);

            if (anim.type === 'background') {
                const match = getComputedStyle(anim.element).backgroundColor.match(this.rgbaRegex);
                if (match) {
                    anim.element.style.backgroundColor = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
                }
            } else {
                anim.element.style.opacity = opacity;
            }

            if (progress >= 1) completed.add(id);
        }

        completed.forEach(id => this.activeAnimations.delete(id));

        if (this.activeAnimations.size > 0) {
            this.animationFrameId = requestAnimationFrame(this.boundUpdateAnimations);
        } else {
            this.animationFrameId = null;
        }
    }

    cancelActiveAnimations() {
        this.activeAnimations.clear();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    dispose() {
        this.cancelActiveAnimations();
        this.activeAnimations = null;
    }
}