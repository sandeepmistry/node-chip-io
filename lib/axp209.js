var fs = require('fs');

var ioctl = require('ioctl');

var I2C_SLAVE_FORCE = 0x0706;

var GPIO2_ADDRESS = 0x93;

function AXP209(bus, address) {
  this._bus = bus;
  this._address = address;

  this._fd = null;
}

AXP209.prototype.open = function() {
  this._fd = fs.openSync('/dev/i2c-' + this._bus, 'r+');

  ioctl(this._fd, I2C_SLAVE_FORCE, this._address);
};

AXP209.prototype.readGPIO2 = function() {
  return this._readAddress(GPIO2_ADDRESS, 1)[0];
};

AXP209.prototype.writeGPIO2 = function(value) {
  this._writeAddress(GPIO2_ADDRESS, new Buffer([value]));
};

AXP209.prototype.close = function() {
  fs.closeSync(this._fd);
};

AXP209.prototype._readAddress = function(address, size) {
  this._writeAddress(address, new Buffer(0));

  var buffer = new Buffer(size);

  fs.readSync(this._fd, buffer, 0, size);

  return buffer;
};

AXP209.prototype._writeAddress = function(address, value) {
  var buffer = Buffer.concat([
    new Buffer([address]),
    value
  ]);

  fs.writeSync(this._fd, buffer, 0, buffer.length);
};

module.exports = AXP209;
