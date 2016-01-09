var util = require('util');

var BoardIO = require('board-io');

var AXP209 = require('./axp209');

function ChipIO() {
  // call super constructor
  BoardIO.call(this, {
    quiet: true
  });

  this.isReady = false;
  this.name = 'C.H.I.P.';
  this.defaultLed = 'STATUS';

  // .. configure pins
  this._pins.push({
    id: 'STATUS',
    supportedModes: [0, 1],
    mode: 1,
    report: 0,
    analogChannel: 127
  });

  this._axp209 = new AXP209(0, 0x34);

  this._axp209.open();

  // connect to hardware and emit "connected" event
  this.emit('connected');

  // all done, emit ready event
  this.isReady = true;
  this.emit('ready');
}

util.inherits(ChipIO, BoardIO);

ChipIO.prototype.normalize = function(pin) {
  if (typeof(pin) === 'string') {
    this._pins.every(function(_pin, index) {
      if (_pin.id === pin) {
        pin = index;
        return false;
      }

      return true;
    });
  }

  return pin;
};

ChipIO.prototype.pinMode = function(pin, mode) {
};

ChipIO.prototype.digitalWrite = function(pin, value) {
  if (pin === 0) {
    this._axp209.writeGPIO2(value);
  }
};

module.exports = ChipIO;
