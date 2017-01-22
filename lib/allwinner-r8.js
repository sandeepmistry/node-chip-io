var events = require('events');
var util = require('util');

var Registers = require('./../build/Release/registers.node').Registers;

var PIO = 0x01C20800;

var PORTS = {
  B: {
    CFG: [PIO + 0x24, PIO + 0x28, PIO + 0x2c, PIO + 0x30],
    DAT: PIO + 0x34,
    DRV: [PIO + 0x38, PIO + 0x3c],
    PUL: [PIO + 0x40, PIO + 0x44]
  },
  C: {
    CFG: [PIO + 0x48, PIO + 0x4c, PIO + 0x50, PIO + 0x54],
    DAT: PIO + 0x58,
    DRV: [PIO + 0x5c, PIO + 0x60],
    PUL: [PIO + 0x64, PIO + 0x68]
  },
  D: {
    CFG: [PIO + 0x6c, PIO + 0x70, PIO + 0x74, PIO + 0x78],
    DAT: PIO + 0x7c,
    DRV: [PIO + 0x80, PIO + 0x84],
    PUL: [PIO + 0x88, PIO + 0x8c]
  },
  E: {
    CFG: [PIO + 0x90, PIO + 0x94, PIO + 0x98, PIO + 0x9c],
    DAT: PIO + 0xa0,
    DRV: [PIO + 0xa4, PIO + 0xa8],
    PUL: [PIO + 0xac, PIO + 0xb0]
  },
  F: {
    CFG: [PIO + 0xb4, PIO + 0xb8, PIO + 0xbc, PIO + 0xc0],
    DAT: PIO + 0xc4,
    DRV: [PIO + 0xc8, PIO + 0xcc],
    PUL: [PIO + 0xd0, PIO + 0xd4]
  },
};

var PIN_DATA = require('./allwinner-r8.json');

var PWM = 0x01C20C00;
var PWM_CTRL = PWM + 0x0200;
var PWM_CH0_PERIOD = PWM + 0x0204;

var LRADC = 0x01C22800;
var LRADC_CTRL = LRADC + 0x00;
var LRADC_DATA0 = LRADC + 0x0c;

function AllwinnerR8() {
  this._registers = new Registers();

  this._reads = {};
}

util.inherits(AllwinnerR8, events.EventEmitter);

AllwinnerR8.prototype.open = function() {
  this._registers.open();
};

AllwinnerR8.prototype.pinMode = function(pin, mode) {
  if (pin === 'LRADC') {
    var lradcCtrlVal = 0x01;

    this._writeRegister(LRADC_CTRL, lradcCtrlVal);
  } else {
    var pinData = PIN_DATA[pin];
    var port = pinData.port;
    var register = pinData.register;
    var index = pinData.index;

    if (mode === 3) {
      mode = 2;
    }

    var cfgReg = PORTS[port].CFG[register];
    var cfgVal = this._readRegister(cfgReg);

    cfgVal = (cfgVal & ~(0x07 << (index * 4))) | (mode << (index * 4));
    this._writeRegister(cfgReg, cfgVal);
  }

  if (pin === 'PWM0' && mode === 2) {
    var pwmCtrlVal = (1 << 6) | (1 << 5) | (1 << 4);
    var pwmPeriodVal = (0xff << 16) | 0;

    this._writeRegister(PWM_CH0_PERIOD, pwmPeriodVal);
    this._writeRegister(PWM_CTRL, pwmCtrlVal);
  }
};

AllwinnerR8.prototype.pwmWrite = function(pin, value) {
  if (pin === 'PWM0') {
    var pwmPeriodVal = (0xff << 16) | Math.round(value);

    this._writeRegister(PWM_CH0_PERIOD, pwmPeriodVal);
  }
};

AllwinnerR8.prototype.analogRead = function(pin) {
  this._reads[pin] = true;
};

AllwinnerR8.prototype.digitalWrite = function(pin, value) {
  var pinData = PIN_DATA[pin];
  var port = pinData.port;
  var register = pinData.register;
  var index = pinData.index;

  var datReg = PORTS[port].DAT;
  var datVal = this._readRegister(datReg);
  var pinMask = 1 << (register * 8 + index);

  if (value) {
    datVal |= pinMask;
  } else {
    datVal &= ~pinMask;
  }

  this._writeRegister(datReg, datVal);
};

AllwinnerR8.prototype.digitalRead = function(pin) {
  this._reads[pin] = true;
};

AllwinnerR8.prototype.tick = function() {
  Object.keys(this._reads).forEach(function(pin) {
    if (pin === 'LRADC') {
      var adcVal = this._readRegister(LRADC_DATA0);

      this.emit('analog-read', pin, adcVal);
    } else {
      var pinData = PIN_DATA[pin];
      var port = pinData.port;
      var register = pinData.register;
      var index = pinData.index;

      var datReg = PORTS[port].DAT;
      var datVal = this._readRegister(datReg);
      var pinMask = 1 << (register * 8 + index);

      this.emit('digital-read', pin, (datVal & pinMask) ? 1 : 0);
    }
  }.bind(this));
};

AllwinnerR8.prototype.close = function() {
  this._registers.close();
};

AllwinnerR8.prototype._readRegister = function(register) {
  return this._registers.read(register);
};

AllwinnerR8.prototype._writeRegister = function(register, value) {
  this._registers.write(register, value);
};

module.exports = AllwinnerR8;
