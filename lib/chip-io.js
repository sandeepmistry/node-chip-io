var util = require('util');

var BoardIO = require('board-io');

var AXP209 = require('./axp209');

function ChipIO() {
  // call super constructor
  BoardIO.call(this, {
    quiet: true
  });

  this.name = 'C.H.I.P.';
  this.defaultLed = 'STATUS';

  // .. configure pins
  this._pins.push({
    id: 'STATUS',
    supportedModes: [1],
    mode: 1,
    report: 0,
    analogChannel: 127
  });

  this._pins.push({
    id: 'BAT',
    supportedModes: [2],
    mode: 2,
    report: 0,
    analogChannel: 2
  });

  this._axp209 = new AXP209(0, 0x34);

  // emit "connect" event on the next tick
  process.nextTick(function() {
    this.emit('connect');
  }.bind(this));

  this._axp209.open(function(err) {
    if (err) {
      throw err;
    }

    // all done, emit ready event
    this.emit('ready');
  }.bind(this));
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
  BoardIO.prototype.pinMode.apply(this, arguments);

  this._pins[pin].mode = mode;

  if (pin === 1) {
    this._axp209.configureBatAdc();
  }
};

ChipIO.prototype.analogRead = function(pin, handler) {
  BoardIO.prototype.analogRead.apply(this, arguments);

  this._pins[pin].report = 1;

  var event = 'analog-read-' + pin;

  setInterval(function() {
    this._axp209.readBatVolt(function(err, value) {
      if (!err) {
        this.emit(event, value);
      }
    }.bind(this));
  }.bind(this), 19);

  this.on(event, handler);
};

ChipIO.prototype.digitalWrite = function(pin, value) {
  BoardIO.prototype.digitalWrite.apply(this, arguments);

  if (pin === 0) {
    this._axp209.writeGpio2(value);
  }
};

module.exports = ChipIO;
