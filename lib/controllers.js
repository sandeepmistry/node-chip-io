// Controllers are defined in terms of object descriptors.
module.exports = {
  INTERNAL_TEMP: {
    initialize: {
      value: function(options, dataHandler) {
        options.pin = 'INTTEMP';
        // `this` refers to the Thermometer instance object
        this.io.pinMode(options.pin, this.io.MODES.ANALOG);
        this.io.analogRead(options.pin, dataHandler.bind(this));
      }
    },
    toCelsius: {
      value: function(raw) {
        return raw * 0.1 - 144.7;
      }
    },
  },
};
