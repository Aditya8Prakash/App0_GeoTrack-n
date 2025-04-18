
// terminatorManager.js
export class TerminatorManager {
    constructor(map) {
        this.map = map;
        this.terminator = L.terminator({
            color: 'rgba(0, 0, 0, 0.125)',
            fillColor: 'rgba(0, 0, 0, 0.625)',
            fillOpacity: 0.5,
            resolution: 7
        });
    }

    updateTerminator() {
        this.terminator.setTime(new Date());
        this.terminator.addTo(this.map);
    }

    removeTerminator() {
        this.map.removeLayer(this.terminator);
    }
}