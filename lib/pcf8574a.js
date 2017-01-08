var events = require('events');
var util = require('util');
var i2cBus = require('i2c-bus');

function PCF8574A(bus, address) {
  this._bus = bus;
  this._address = address;
  this._i2c = null;
  this._writeMask = 0;
  this._readMask = 0;
}

util.inherits(PCF8574A, events.EventEmitter);

PCF8574A.prototype.open = function() {
  this._i2c = i2cBus.openSync(this._bus, {forceAccess: true});

  this._i2c.sendByteSync(this._address, 0x00);
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

  this._i2c.sendByteSync(this._address, ~this._readMask & this._writeMask & 0xff);
};

PCF8574A.prototype.digitalRead = function(pin, value) {
  // no-op
};

PCF8574A.prototype.tick = function(callback) {
  if (!this._readMask) {
    // if there's nothing to do the callback also needs to be called
    process.nextTick(callback);
  } else {
    this._i2c.receiveByte(this._address, function(err, value) {
      if (!err) {
        for (var i = 0; i < 8; i++) {
          var pinMask = (1 << i);

          if (this._readMask & pinMask) {
            this.emit('digital-read', 'XIO-P' + i, (value & pinMask) ? 1 : 0);
          }
        }
      }
      callback();
    }.bind(this));
  }
};

PCF8574A.prototype.close = function() {
  this._i2c.closeSync();
};

module.exports = PCF8574A;
