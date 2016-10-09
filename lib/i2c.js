var fs = require('fs');

var ioctl = require('./ioctl');

var I2C_SLAVE_FORCE = 0x0706;

function I2C(bus, address) {
  this._bus = bus;
  this._address = address;

  this._fd = null;
}

I2C.prototype.open = function() {
  this._fd = fs.openSync('/dev/i2c-' + this._bus, 'r+');

  ioctl(this._fd, I2C_SLAVE_FORCE, this._address);
};

I2C.prototype.write = function(value) {
  fs.writeSync(this._fd, value, 0, value.length);
};

I2C.prototype.read = function(size) {
  var buffer = new Buffer(size);

  fs.readSync(this._fd, buffer, 0, size, null);

  return buffer;
};

I2C.prototype.writeRegister = function(register, value) {
  var buffer = Buffer.concat([
    new Buffer([register]),
    value
  ]);

  this.write(buffer);
};

I2C.prototype.readRegister = function(register, size) {
  this.write(new Buffer([register]));

  return this.read(size);
};

I2C.prototype.close = function() {
  fs.closeSync(this._fd);
};

module.exports = I2C;
