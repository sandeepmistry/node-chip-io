var events = require('events');
var util = require('util');

var I2C = require('./i2c');

var INT_TEMP_MSB_REGISTER = 0x5e;
var INT_TEMP_LSB_REGISTER = 0x5f;
var BAT_VOLT_MSB_REGISTER = 0x78;
var BAT_VOLT_LSB_REGISTER = 0x79;
var BAT_ADC_REGISTER      = 0x82;
var GPIO2_REGISTER        = 0x93;

function AXP209(bus, address) {
  this._i2c = new I2C(bus, address);

  this._reads = {};
}

util.inherits(AXP209, events.EventEmitter);

AXP209.prototype.open = function() {
  this._i2c.open();
};

AXP209.prototype.pinMode = function(pin, mode) {
  if (pin === 'BAT') {
    this._configureBatAdc();
  }
};

AXP209.prototype.analogRead = function(pin) {
  this._reads[pin] = true;
};

AXP209.prototype.digitalWrite = function(pin, value) {
  if (pin === 'STATUS') {
    this._writeGpio2(value);
  }
};

AXP209.prototype.tick = function() {
  if (this._reads.BAT) {
    var batVolt = this._readBatVolt();

    this.emit('analog-read', 'BAT', batVolt);
  }

  if (this._reads.INTTEMP) {
    var intTemp = this._readIntTemp();

    this.emit('analog-read', 'INTTEMP', intTemp);
  }
};

AXP209.prototype.close = function() {
  this._i2c.close();
};

AXP209.prototype._readIntTemp = function() {
  return this._readAdc(INT_TEMP_MSB_REGISTER, INT_TEMP_LSB_REGISTER);
};

AXP209.prototype._readBatVolt = function() {
  return this._readAdc(BAT_VOLT_MSB_REGISTER, BAT_VOLT_LSB_REGISTER);
};

AXP209.prototype._configureBatAdc = function() {
  // force ADC enable for battery voltage and current
  return this._i2c.writeRegister(BAT_ADC_REGISTER, new Buffer([0xc3]));
};

AXP209.prototype._writeGpio2 = function(value) {
  this._i2c.writeRegister(GPIO2_REGISTER, new Buffer([value]));
};

AXP209.prototype._readAdc = function(msbRegister, lsbRegister) {
  msbData = this._i2c.readRegister(msbRegister, 1);
  lsbData = this._i2c.readRegister(lsbRegister, 1);

  return ((msbData[0] << 4) | (lsbData[0] & 0x0f));
};

module.exports = AXP209;
