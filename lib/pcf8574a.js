var events = require('events');
var util = require('util');

var I2C = require('./i2c');

function PCF8574A(bus, address) {
  this._i2c = new I2C(bus, address);

  this._writeMask = 0;
  this._readMask = 0;
}

util.inherits(PCF8574A, events.EventEmitter);

PCF8574A.prototype.open = function(callback) {
  this._i2c.open(function(err) {
    if (err) {
      return callback(err);
    }

    this._i2c.write(0x00, callback);
  }.bind(this));
};

PCF8574A.prototype.pinMode = function(pin, mode) {
  pin = parseInt(pin.charAt(5));

  if (mode === 0) {
    // input
    this._readMask |= (1 << pin);
  } else {
    // output
    this._readMask &= ~(1 << pin);
  }

  this.digitalWrite('XIO-P' + pin, 0);
};

PCF8574A.prototype.digitalWrite = function(pin, value) {
  pin = parseInt(pin.charAt(5));

  if (value) {
    this._writeMask |= (1 << pin);
  } else {
    this._writeMask &= ~(1 << pin);
  }

  this._i2c.write(new Buffer([~this._readMask & this._writeMask & 0xff]));
};

PCF8574A.prototype.digitalRead = function(pin, value) {
  // no-op
};

PCF8574A.prototype.tick = function() {
  if (this._readMask) {
    this._read(function(err, value) {
      if (!err) {
        for (var i = 0; i < 8; i++) {
          var pinMask = (1 << i);

          if (this._readMask & pinMask) {
            this.emit('digital-read', 'XIO-P' + i, (value & pinMask) ? 1 : 0);
          }
        }
      }
    }.bind(this));
  }
};

PCF8574A.prototype.close = function(callback) {
  this._i2c.close(callback);
};

PCF8574A.prototype._read = function(callback) {
  this._i2c.read(1, function(err, value) {
    if (err) {
      return callback(err);
    }

    callback(err, value[0]);
  });
};

module.exports = PCF8574A;
