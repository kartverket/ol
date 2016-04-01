goog.provide('ol.source.CartoDB');

goog.require('ol.source.State');
goog.require('ol.source.XYZ');


/**
 * @classdesc
 * Layer source for the CartoDB tiles.
 *
 * @constructor
 * @extends {ol.source.XYZ}
 * @param {olx.source.CartoDBOptions} options CartoDB options.
 * @api
 */
ol.source.CartoDB = function(options) {
  this.account_ = options.account;
  this.mapId_ = options.map || '';
  this.config_ = options.config || {};
  this.templateCache_ = {};
  delete options.map;
  goog.base(this, options);
  this.initializeMap_();
};
goog.inherits(ol.source.CartoDB, ol.source.XYZ);


/**
 * Returns the current config.
 * @return {Object} The current configuration.
 * @api
 */
ol.source.CartoDB.prototype.getConfig = function() {
  return this.config_;
};


/**
 * Updates the carto db config.
 * @param {Object} config a key-value lookup. Values will replace current values
 *     in the config.
 * @api
 */
ol.source.CartoDB.prototype.updateConfig = function(config) {
  for (var key in config) {
    this.config_[key] = config[key];
  }
  this.initializeMap_();
};


/**
 * Sets the CartoDB config
 * @param {Object} config In the case of anonymous maps, a CartoDB configuration
 *     object.
 * If using named maps, a key-value lookup with the template parameters.
 */
ol.source.CartoDB.prototype.setConfig = function(config) {
  this.config_ = config || {};
  this.initializeMap_();
};


/**
 * Issue a request to initialize the CartoDB map.
 * @private
 */
ol.source.CartoDB.prototype.initializeMap_ = function() {
  var paramHash = JSON.stringify(this.config_);
  if (this.templateCache_[paramHash]) {
    this.applyTemplate_(this.templateCache_[paramHash]);
    return;
  }
  var mapUrl = 'https://' + this.account_ +
      '.cartodb.com/api/v1/map';

  if (this.mapId_) {
    mapUrl += '/named/' + this.mapId_;
  }

  var client = new XMLHttpRequest();
  client.addEventListener('load', this.handleInitResponse_.bind(this, paramHash));
  client.addEventListener('error', this.handleInitError_.bind(this));
  client.open('POST', mapUrl);
  client.setRequestHeader('Content-type', 'application/json');
  client.send(JSON.stringify(this.config_));
};


/**
 * Handle map initialization response.
 * @param {string} paramHash a hash representing the parameter set that was used
 *     for the request
 * @param {Event} event Event.
 * @private
 */
ol.source.CartoDB.prototype.handleInitResponse_ = function(paramHash, event) {
  var client = /** @type {XMLHttpRequest} */ (event.target);
  if (client.status >= 200 && client.status < 300) {
    var response;
    try {
      response = /** @type {Object} */(JSON.parse(client.responseText));
    } catch (err) {
      this.setState(ol.source.State.ERROR);
      return;
    }
    this.applyTemplate_(response);
    this.templateCache_[paramHash] = response;
  } else {
    this.setState(ol.source.State.ERROR);
  }
};

/**
 * @private
 * @param {Event} event Event.
 */
ol.source.CartoDB.prototype.handleInitError_ = function(event) {
  this.setState(ol.source.State.ERROR);
}

/**
 * Apply the new tile urls returned by carto db
 * @param {Object} data Result of carto db call.
 * @private
 */
ol.source.CartoDB.prototype.applyTemplate_ = function(data) {
  var layerId = data['layergroupid'];
  var tilesUrl = 'https://' + data['cdn_url']['https'] + '/' + this.account_ +
      '/api/v1/map/' + layerId + '/{z}/{x}/{y}.png';
  this.setUrl(tilesUrl);
};
