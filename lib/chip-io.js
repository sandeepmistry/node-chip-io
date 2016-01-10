var util = require('util');

var BoardIO = require('board-io');
var debug = require('debug')('chip-io');

var AXP209 = require('./axp209');
var PCF8574A = require('./pcf8574a');

function ChipIO() {
  // call super constructor
  BoardIO.call(this, {
    quiet: true
  });

  this.name = 'C.H.I.P.';
  this.defaultLed = 'STATUS';

  // .. configure pins
  for (var i = 0; i < 8; i++) {
    this._pins.push({
      id: 'XIO-P' + i,
      supportedModes: [0, 1],
      mode: 0,
      report: 0,
      analogChannel: 127
    });
  }

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
    analogChannel: 0
  });

  this._pins.push({
    id: 'INTTEMP',
    supportedModes: [2],
    mode: 2,
    report: 0,
    analogChannel: 1
  });

  this._axp209 = new AXP209(0, 0x34);
  this._pcf8574a = new PCF8574A(2, 0x38);

  // emit "connect" event on the next tick
  process.nextTick(function() {
    this.emit('connect');
  }.bind(this));

  this._axp209.open(function(err) {
    if (err) {
      throw err;
    }

    this._pcf8574a.open(function(err) {
      if (err) {
        throw err;
      }

      // all done, emit ready event
      this.emit('ready');
    }.bind(this));
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
  debug('pinMode', pin, mode);

  pin = this.normalize(pin);

  this._pins[pin].mode = mode;

  if (pin < 8) {
    this._pcf8574a.pinMode(pin, mode);
  } else if (pin === 9) {
    this._axp209.configureBatAdc();
  }

  return this;
};

ChipIO.prototype.analogRead = function(pin, handler) {
  debug('analogRead', pin);

  pin = this.normalize(pin);

  this._pins[pin].report = 1;

  var event = 'analog-read-' + pin;

  if (pin === 9) {
    setInterval(function() {
      this._axp209.readBatVolt(function(err, value) {
        if (!err) {
          this.emit(event, value);
        }
      }.bind(this));
    }.bind(this), 19);
  } else if (pin === 10) {
    setInterval(function() {
      this._axp209.readIntTemp(function(err, value) {
        if (!err) {
          this.emit(event, value);
        }
      }.bind(this));
    }.bind(this), 19);
  } else {
    throw new Error('analogRead is not supported for pin ' + pin);
  }

  this.on(event, handler);

  return this;
};

ChipIO.prototype.digitalWrite = function(pin, value) {
  debug('digitalWrite', pin, value);

  if (pin < 8) {
    this._pcf8574a.digitalWrite(pin, value);
  } else if (pin === 8) {
    this._axp209.writeGpio2(value);
  }

  return this;
};

ChipIO.prototype.digitalRead = function(pin, handler) {
  debug('digitalRead', pin);

  pin = this.normalize(pin);

  this._pins[pin].report = 1;

  var event = 'digitalRead-read-' + pin;

  setInterval(function() {
    this._pcf8574a.digitalRead(pin, function(err, value) {
      if (!err) {
        this.emit(event, value);
      }
    }.bind(this));
  }.bind(this), 19);

  this.on(event, handler);

  return this;
};

module.exports = ChipIO;
