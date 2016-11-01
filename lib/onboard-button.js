var util = require('util');

var five = require('johnny-five');

function OnboardButton(opts) {
  opts = opts || {};

  opts.pin = 'BTN';

  five.Button.call(this, opts);
}

util.inherits(OnboardButton, five.Button);

module.exports = OnboardButton;
