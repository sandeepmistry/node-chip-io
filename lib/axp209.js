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
  this._readInProgress = {};
}

util.inherits(AXP209, events.EventEmitter);

AXP209.prototype.open = function(callback) {
  this._i2c.open(callback);
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
  if (this._reads.BAT && !this._readInProgress.BAT) {
    this._readInProgress.BAT = true;

    this._readBatVolt(function(err, value) {
      if (!err) {
        this.emit('analog-read', 'BAT', value);
      }

      this._readInProgress.BAT = false;
    }.bind(this));
  }

  if (this._reads.INTTEMP && !this._readInProgress.INTTEMP) {
    this._readInProgress.INTTEMP = true;

    this._readIntTemp(function(err, value) {
      if (!err) {
        this.emit('analog-read', 'INTTEMP', value);
      }

      this._readInProgress.INTTEMP = false;
    }.bind(this));
  }
};

AXP209.prototype.close = function(callback) {
  this._i2c.close(callback);
};

AXP209.prototype._readIntTemp = function(callback) {
  this._readAdc(INT_TEMP_MSB_REGISTER, INT_TEMP_LSB_REGISTER, callback);
};

AXP209.prototype._readBatVolt = function(callback) {
  this._readAdc(BAT_VOLT_MSB_REGISTER, BAT_VOLT_LSB_REGISTER, callback);
};

AXP209.prototype._configureBatAdc = function(callback) {
  // force ADC enable for battery voltage and current
  this._i2c.writeRegister(BAT_ADC_REGISTER, new Buffer([0xc3]), callback);
};

AXP209.prototype._writeGpio2 = function(value, callback) {
  this._i2c.writeRegister(GPIO2_REGISTER, new Buffer([value]), callback);
};

AXP209.prototype._readAdc = function(msbRegister, lsbRegister, callback) {
  this._i2c.readRegister(msbRegister, 1, function(err, msbData) {
    if (err) {
      return callback(err);
    }

    this._i2c.readRegister(lsbRegister, 1, function(err, lsbData) {
      if (err) {
        return callback(err);
      }

      var value = (msbData[0] << 4) | (lsbData[0] & 0x0f);

      callback(null, value);
    }.bind(this));
  }.bind(this));
};

module.exports = AXP209;
