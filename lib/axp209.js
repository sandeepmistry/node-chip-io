var I2C = require('./i2c');

var BAT_VOLT_MSB_ADDRESS = 0x78;
var BAT_VOLT_LSB_ADDRESS = 0x79;
var BAT_ADC_ADDRESS      = 0x82;
var GPIO2_ADDRESS        = 0x93;

function AXP209(bus, address) {
  this._i2c = new I2C(bus, address);
}

AXP209.prototype.open = function(callback) {
  this._i2c.open(callback);
};

AXP209.prototype.readBatVolt = function(callback) {
  this._i2c.read(BAT_VOLT_MSB_ADDRESS, 1, function(err, msbData) {
    if (err) {
      return callback(err);
    }

    this._i2c.read(BAT_VOLT_LSB_ADDRESS, 1, function(err, lsbData) {
      if (err) {
        return callback(err);
      }

      var value = (msbData[0] << 4) | (lsbData[0] & 0x0f);

      callback(null, value);
    }.bind(this));
  }.bind(this));
};

AXP209.prototype.configureBatAdc = function(callback) {
  // force ADC enable for battery voltage and current
  this._i2c.write(BAT_ADC_ADDRESS, new Buffer([0xc3]), callback);
};

AXP209.prototype.writeGpio2 = function(value, callback) {
  this._i2c.write(GPIO2_ADDRESS, new Buffer([value]), callback);
};

AXP209.prototype.close = function(callback) {
  this._i2c.close(this._fd, callback);
};

module.exports = AXP209;
