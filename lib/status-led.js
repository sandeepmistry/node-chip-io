var util = require('util');

var five = require('johnny-five');

function StatusLed(opts) {
  opts = opts || {};

  opts.pin = 'STATUS';

  five.Led.call(this, opts);
}

util.inherits(StatusLed, five.Led);

module.exports = StatusLed;
