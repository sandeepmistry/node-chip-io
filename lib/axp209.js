var fs = require('fs');

var ioctl = require('ioctl');

var I2C_SLAVE_FORCE = 0x0706;

var GPIO2_ADDRESS = 0x93;

function AXP209(bus, address) {
  this._bus = bus;
  this._address = address;

  this._fd = null;
}

AXP209.prototype.open = function(callback) {
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

AXP209.prototype.writeGPIO2 = function(value, callback) {
  this._writeAddress(GPIO2_ADDRESS, new Buffer([value]), callback);
};

AXP209.prototype.close = function() {
  fs.closeSync(this._fd);
};

AXP209.prototype._writeAddress = function(address, value, callback) {
  var buffer = Buffer.concat([
    new Buffer([address]),
    value
  ]);

  fs.write(this._fd, buffer, 0, buffer.length, callback);
};

module.exports = AXP209;
