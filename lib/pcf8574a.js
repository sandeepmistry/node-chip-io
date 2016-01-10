var I2C = require('./i2c');

function PCF8574A(bus, address) {
  this._i2c = new I2C(bus, address);

  this._writeMask = 0;
  this._readMask = 0;
}

PCF8574A.prototype.open = function(callback) {
  this._i2c.open(function(err) {
    if (err) {
      return callback(err);
    }

    this._i2c.write(0x00, callback);
  }.bind(this));
};

PCF8574A.prototype.pinMode = function(pin, mode) {
  if (mode === 0) {
    // input
    this._readMask |= (1 << pin);
  } else {
    // output
    this._readMask &= ~(1 << pin);
  }

  this.digitalWrite(pin, 0);
};

PCF8574A.prototype.digitalWrite = function(pin, value) {
  if (value) {
    this._writeMask |= (1 << pin);
  } else {
    this._writeMask &= ~(1 << pin);
  }

  this._i2c.write(~this._readMask & this._writeMask & 0xff);
};

PCF8574A.prototype.digitalRead = function(pin, callback) {
  this._i2c.read(1, function(err, value) {
    if (err) {
      return callback(err);
    }

    callback(err, (value[0] & (1 << pin)) ? 1 : 0);
  });
};

PCF8574A.prototype.close = function(callback) {
  this._i2c.close(callback);
};

module.exports = PCF8574A;
