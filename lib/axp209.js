var events = require('events');
var util = require('util');
var i2cBus = require('i2c-bus');

var BUTTON_REGISTER       = 0x4a;
var INT_TEMP_MSB_REGISTER = 0x5e;
var BAT_VOLT_MSB_REGISTER = 0x78;
var BAT_ADC_REGISTER      = 0x82;
var GPIO2_REGISTER        = 0x93;

function AXP209(bus, address) {
  this._bus = bus;
  this._address = address;
  this._i2c = null;
  this._reads = {};
}

util.inherits(AXP209, events.EventEmitter);

AXP209.prototype.open = function() {
  this._i2c = i2cBus.openSync(this._bus, {forceAccess: true});
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

AXP209.prototype.digitalRead = function(pin) {
  this._reads[pin] = true;
};

AXP209.prototype.tick = function(callback) {
  var readsRunning = 0;

  var afterRead = function() {
    readsRunning -= 1;

    if (readsRunning === 0) {
      callback();
    }
  };

  if (this._reads.BAT) {
    readsRunning += 1;

    this._readBatVolt(function(err, batVolt) {
      if (!err) {
        this.emit('analog-read', 'BAT', batVolt);
      }

      afterRead();
    }.bind(this));
  }

  if (this._reads.INTTEMP) {
    readsRunning += 1;

    this._readIntTemp(function(err, intTemp) {
      if (!err) {
        this.emit('analog-read', 'INTTEMP', intTemp);
      }

      afterRead();
    }.bind(this));
  }

  if (this._reads.BTN) {
    readsRunning += 1;

    this._readButton(function(err, button) {
      if (!err) {
        this.emit('digital-read', 'BTN', button);
      }

      afterRead();
    }.bind(this));
  }

  // if there's nothing to do the callback also needs to be called
  if (readsRunning === 0) {
    process.nextTick(callback);
  }
};

AXP209.prototype.close = function() {
  this._i2c.closeSync();
};

AXP209.prototype._readIntTemp = function(callback) {
  this._readAdc(INT_TEMP_MSB_REGISTER, callback);
};

AXP209.prototype._readBatVolt = function(callback) {
  this._readAdc(BAT_VOLT_MSB_REGISTER, callback);
};

AXP209.prototype._readButton = function(callback) {
  this._i2c.readByte(this._address, BUTTON_REGISTER, function(err, data) {
    if (err) {
      return callback(err);
    }

    var value = (data & 0x02) !== 0;

    if (value) {
      this._i2c.writeByteSync(this._address, BUTTON_REGISTER, 0x02);
    }

    callback(null, value ? 1 : 0);
  }.bind(this));
};

AXP209.prototype._configureBatAdc = function() {
  // force ADC enable for battery voltage and current
  this._i2c.writeByteSync(this._address, BAT_ADC_REGISTER, 0xc3);
};

AXP209.prototype._writeGpio2 = function(value) {
  this._i2c.writeByteSync(this._address, GPIO2_REGISTER, value);
};

AXP209.prototype._readAdc = function(msbRegister, callback) {
  var adcData = new Buffer(2);

  this._i2c.readI2cBlock(this._address, msbRegister, 2, adcData, function(err, bytesRead, adcData) {
    if (err) {
      return callback(err);
    }

    var value = (adcData[0] << 4) | (adcData[1] & 0x0f);

    callback(null, value);
  });
};

module.exports = AXP209;
