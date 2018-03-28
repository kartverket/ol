import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import {defaults as defaultInteractions} from '../src/ol/interaction.js';
import Select from '../src/ol/interaction/Select.js';
import Translate from '../src/ol/interaction/Translate.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';


const raster = new TileLayer({
  source: new OSM()
});

const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/geojson/countries.geojson',
    format: new GeoJSON()
  })
});

const select = new Select();

const translate = new Translate({
  features: select.getFeatures()
});

const map = new Map({
  interactions: defaultInteractions().extend([select, translate]),
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});
