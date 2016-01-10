var util = require('util');

var BoardIO = require('board-io');
var debug = require('debug')('chip-io');

var AXP209 = require('./axp209');
var PCF8574A = require('./pcf8574a');

var TICK_INTERVAL = 19;

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

  this._lastXioPin = this._pins.length - 1;
  this._statusPin = this._pins.length;
  this._pins.push({
    id: 'STATUS',
    supportedModes: [1],
    mode: 1,
    report: 0,
    analogChannel: 127
  });

  this._batPin = this._pins.length;
  this._pins.push({
    id: 'BAT',
    supportedModes: [2],
    mode: 2,
    report: 0,
    analogChannel: 0
  });

  this._intTempPin = this._pins.length;
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

      // setup interval for digital and analog reads
      this._tickInterval = setInterval(this._tick.bind(this), TICK_INTERVAL);

      // all done, emit ready event
      this.emit('ready');
    }.bind(this));
  }.bind(this));
}

util.inherits(ChipIO, BoardIO);

ChipIO.prototype.normalize = function(pin) {
  if (typeof(pin) === 'string') {
    for (var i = 0; i < this._pins.length; i++) {
      if (this._pins[i].id === pin) {
        pin = i;
        break;
      }
    }
  }

  return pin;
};

ChipIO.prototype.pinMode = function(pin, mode) {
  debug('pinMode', pin, mode);

  pin = this.normalize(pin);

  if (this._pins[pin]) {
    this._pins[pin].mode = mode;

    if (pin <= this._lastXioPin) {
      this._pcf8574a.pinMode(pin, mode);
    } else if (pin === this._batPin) {
      this._axp209.configureBatAdc();
    }
  }

  return this;
};

ChipIO.prototype.analogRead = function(pin, handler) {
  debug('analogRead', pin);

  pin = this.normalize(pin);

  if (this._pins[pin]) {
    this._pins[pin].report = 1;

    this.on('analog-read-' + pin, handler);
  }

  return this;
};

ChipIO.prototype.digitalWrite = function(pin, value) {
  debug('digitalWrite', pin, value);

  if (pin <= this._lastXioPin) {
    this._pcf8574a.digitalWrite(pin, value);
  } else if (pin === this._statusPin) {
    this._axp209.writeGpio2(value);
  }

  return this;
};

ChipIO.prototype.digitalRead = function(pin, handler) {
  debug('digitalRead', pin);

  pin = this.normalize(pin);

  if (this._pins[pin]) {
    this._pins[pin].report = 1;
  }

  this.on('digital-read-' + pin, handler);

  return this;
};

ChipIO.prototype._tick = function() {
  if (this._pins[this._batPin].report) {
    this._axp209.readBatVolt(function(err, value) {
      if (!err) {
        this.emit('analog-read-' + this._batPin, value);
      }
    }.bind(this));
  }

  if (this._pins[this._intTempPin].report) {
    this._axp209.readIntTemp(function(err, value) {
      if (!err) {
        this.emit('analog-read-' + this._intTempPin, value);
      }
    }.bind(this));
  }

  var readPcf8574 = false;

  for (var i = 0; i < this._lastXioPin; i++) {
    if (this._pins[i].report) {
      readPcf8574 = true;
      break;
    }
  }

  if (readPcf8574) {
    this._pcf8574a.read(function(err, value) {
      if (!err) {
        for (var i = 0; i < this._lastXioPin; i++) {
          if (this._pins[i].report) {
            this.emit('digital-read-' + i, (value & (1 << i)) ? 1 : 0);
          }
        }
      }
    }.bind(this));
  }
};

module.exports = ChipIO;
