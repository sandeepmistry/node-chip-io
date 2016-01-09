var I2C = require('./i2c');

var GPIO2_ADDRESS = 0x93;

function AXP209(bus, address) {
  this._i2c = new I2C(bus, address);
}

AXP209.prototype.open = function(callback) {
  this._i2c.open(callback);
};

AXP209.prototype.writeGPIO2 = function(value, callback) {
  this._i2c.write(GPIO2_ADDRESS, new Buffer([value]), callback);
};

AXP209.prototype.close = function(callback) {
  thsi._i2c.close(this._fd, callback);
};

module.exports = AXP209;
