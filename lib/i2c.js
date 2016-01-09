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

I2C.prototype.write = function(address, value, callback) {
  var buffer = Buffer.concat([
    new Buffer([address]),
    value
  ]);

  fs.write(this._fd, buffer, 0, buffer.length, callback);
};

I2C.prototype.close = function(callback) {
  fs.close(this._fd, callback);
};

module.exports = I2C;
