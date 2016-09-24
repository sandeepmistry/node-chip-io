var util = require('util');

var five = require('johnny-five');

var Controllers = require('./controllers');

function InternalTemperature(opts) {
  opts = opts || {};

  opts.controller = Controllers.INTERNAL_TEMP;

  five.Thermometer.call(this, opts);
}

util.inherits(InternalTemperature, five.Thermometer);

module.exports = InternalTemperature;
