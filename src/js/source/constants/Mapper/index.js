import ol from 'openlayers';
import ActionTypes from '../ActionTypes';
import { PropViewControl, PropViewAllControl, RefreshControl } from './Control';
import { FeatureInteraction, PropInteraction } from './Interaction';
import Config from './Config';
import Factory from './Factory';
import Properties from './Properties';
import LogManager from '../Logger';

class Map {
    constructor() {
        this.map = null;
        this.raster = new ol.source.OSM();
        this.logger = LogManager.getLogger('ty.edelweiss.viewp.Map');
    }

    fetch(DOMtarget) {
        this.map = new ol.Map({
            target: DOMtarget,
            layers: [
                new ol.layer.Tile({
                    source: this.raster
                })
            ],
            controls: [
                new ol.control.Zoom(),
                new ol.control.ZoomSlider(),
                new ol.control.Attribution(),
                new RefreshControl()
            ],
            interactions: [
                new ol.interaction.DragRotate(),
                new ol.interaction.DoubleClickZoom(),
                new ol.interaction.DragPan(),
                new ol.interaction.PinchRotate(),
                new ol.interaction.KeyboardPan(),
                new ol.interaction.KeyboardZoom(),
                new ol.interaction.DragZoom(),
                new FeatureInteraction(),
                new PropInteraction()
            ],
            overlays: [
                new ol.Overlay({
                    id: 'popup',
                    element: document.getElementById("popup"),
                    positioning: 'bottom-center',
                    offset: [0, -10]
                })
            ],
            view: new ol.View({
                center: ol.proj.transform([139.7800, 35.6800], 'EPSG:4326', 'EPSG:3857'),
                zoom: 11,
                maxzoom: 16,
                minzoom: 10
            })
        });
        return this;
    }

    change(action, sources) {
        let accessLayer = this.map.getLayers().getArray()[action.id + 1];
        switch (action.type) {
            case ActionTypes.ADD_SOURCE:
                this.map.addLayer(new ol.layer.Vector());
                const newSource = sources[sources.length - 1];
                this.logger.log('Add new source to map ' + newSource);
                const sourceFormat = new ol.format.GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
                const newFeatures = sourceFormat.readFeatures(newSource.body);
                newFeatures.forEach(function(feature, index, array) { feature.setId(index); });
                if (!accessLayer) { accessLayer = this.map.getLayers().getArray()[sources.length]; }
                accessLayer.setSource(new ol.source.Vector({ features: newFeatures, format: sourceFormat }));
                accessLayer.setStyle(Factory.styleFactory(newSource.staple));
                accessLayer.set('id_', sources.length - 1);
                Properties.setValue(newSource.extra);
                break;

            case ActionTypes.DELETE_SOURCE:
                Properties.delValue(action.id);
                this.map.removeLayer(accessLayer);
                break;

            case ActionTypes.CHECK_SOURCE:
                const newInvalid = sources[action.id].invalid;
                accessLayer.setVisible(!newInvalid);
                break;

            case ActionTypes.STAPLE_SOURCE:
                const newStaple = sources[action.id].staple;
                accessLayer.setStyle(Factory.styleFactory(newStaple));
                accessLayer.getSource().changed();
                break;

            case ActionTypes.COLOR_SOURCE:
                const newColor = sources[action.id].color;
                Config.setRgb(newColor);
                accessLayer.getSource().changed();
                break;

            case ActionTypes.CHANGE_SOURCE:
                const newSampleSource = sources[action.id];
                const sampleSourceFormat = new ol.format.GeoJSON({ dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
                const newSampleFeatures = sampleSourceFormat.readFeatures(newSampleSource.body);
                newSampleFeatures.forEach(function(feature, index, array) { feature.setId(index); });
                accessLayer.setSource(new ol.source.Vector({ features: newSampleFeatures, format: sampleSourceFormat }));
                accessLayer.setStyle(Factory.styleFactory(newSampleSource.staple));
                break;

            default:
                return null;
        }
    }

    update(action, config) {
        let accessLayers = this.map.getLayers().getArray();
        switch (action.type) {
            case ActionTypes.CHANGE_ALPHARANGE:
                const newAlphaRange = config.alphaRange;
                Config.setAlphaRange(newAlphaRange);
                this.logger.log('Change alpha value range to ' + newAlphaRange.join(', '));
                accessLayers.forEach(function(elm, index) { elm.getSource().changed(); });
                break;

            case ActionTypes.CHANGE_STROKECOLOR:
                const newStrokeColor = config.strokeColor;
                Config.setStrokeColor(newStrokeColor);
                this.logger.log('Change stroke-color value range to ' + newStrokeColor.join(', '));
                accessLayers.forEach(function(elm, index) { elm.getSource().changed(); });
                break;

            case ActionTypes.CHANGE_TEXTSCALE:
                const newTextScale = config.textScale;
                Config.setTextScale(newTextScale);
                this.logger.log('Change text-scale value range to ' + newTextScale);
                accessLayers.forEach(function(elm, index) { elm.getSource().changed(); });
                break;

            case ActionTypes.CHANGE_OUTLINECOLOR:
                const newOutlineColor = config.outlineColor;
                Config.setOutlineColor(newOutlineColor);
                this.logger.log('Change outline-color value range to ' + newOutlineColor.join(', '));
                accessLayers.forEach(function(elm, index) { elm.getSource().changed(); });
                break;

            default:
                return null;
        }
    }
}

export default new Map();
