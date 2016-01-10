var fs = require('fs');

var ioctl = require('ioctl');

var I2C_SLAVE_FORCE = 0x0706;

function I2C(bus, address) {
  this._bus = bus;
  this._address = address;

  this._fd = null;
}

I2C.prototype.open = function(callback) {
  fs.open('/dev/i2c-' + this._bus, 'r+', function(err, fd) {
    if (err) {
      return callback(err);
    }

    this._fd = fd;

    try {
      ioctl(this._fd, I2C_SLAVE_FORCE, this._address);
    } catch (e) {
      return callback(e);
    }

    callback();
  }.bind(this));
};

I2C.prototype.write = function(value, callback) {
  fs.write(this._fd, value, 0, value.length, callback);
};

I2C.prototype.read = function(size, callback) {
  fs.read(this._fd, new Buffer(size), 0, size, null, function(err, bytesRead, buffer) {
    callback(err, buffer);
  });
};

I2C.prototype.writeRegister = function(register, value, callback) {
  var buffer = Buffer.concat([
    new Buffer([register]),
    value
  ]);

  this.write(buffer);
};

I2C.prototype.readRegister = function(register, size, callback) {
  this.write(new Buffer([register]), function(err) {
    if (err) {
      return callback(err);
    }

    this.read(size, callback);
  }.bind(this));
};

I2C.prototype.close = function(callback) {
  fs.close(this._fd, callback);
};

module.exports = I2C;
