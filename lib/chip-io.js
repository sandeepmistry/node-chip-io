var util = require('util');

var BoardIO = require('board-io');
var debug = require('debug')('chip-io');
var i2cBus = require('i2c-bus');

var AllwinnnerR8 = require('./allwinner-r8');
var AXP209 = require('./axp209');
var PCF8574A = require('./pcf8574a');

var pins = require('./pins');

var TICK_INTERVAL = 19;
var DEFAULT_BUS = 2;
var addressToBus = {};

function ChipIO() {
  // call super constructor
  BoardIO.call(this, {
    quiet: true
  });

  this.name = 'C.H.I.P.';
  this.defaultLed = 'STATUS';

  this._pinsById = {};

  var analogChannel = 0;

  pins.forEach(function(pin, index) {
    pin.number = index;

    if (pin.supportedModes.length > 0) {
      pin.id = pin.name;

      if (pin.supportedModes.indexOf(2) !== -1) {
        pin.analogChannel = analogChannel;

        analogChannel++;
      }

      this._pinsById[pin.id] = pin;
    }

    this._pins.push(pin);
  }.bind(this));

  // emit 'connect' event on the next tick
  process.nextTick(function() {
    this.emit('connect');
  }.bind(this));

  this._i2cBuses = {};

  this._chips = {
    AXP209: new AXP209(0, 0x34),
    PCF8574A: new PCF8574A(2, 0x38),
    R8: new AllwinnnerR8()
  };

  this._chips.AXP209.on('analog-read', this._onAnalogRead.bind(this));
  this._chips.AXP209.on('digital-read', this._onDigitalRead.bind(this));
  this._chips.PCF8574A.on('digital-read', this._onDigitalRead.bind(this));
  this._chips.R8.on('analog-read', this._onAnalogRead.bind(this));
  this._chips.R8.on('digital-read', this._onDigitalRead.bind(this));

  this._chips.AXP209.open();
  this._chips.PCF8574A.open();

  try {
    this._chips.R8.open();
  } catch(err) {
    // "optional" (requires root), so ignore err
  }

  // all done, emit 'ready' event on the next tick
  process.nextTick(function() {
    this.emit('ready');

    // start the internal ticker
    this._tick();
  }.bind(this));
}

util.inherits(ChipIO, BoardIO);

ChipIO.prototype.normalize = function(pin) {
  if (typeof(pin) === 'string') {
    pin = this._pinsById[pin].number;
  }

  return pin;
};

ChipIO.prototype.pinMode = function(pin, mode) {
  debug('pinMode', pin, mode);

  pin = this.normalize(pin);

  var pinData = this._pins[pin];

  if (pinData && pinData.chip) {
    this._pins[pin].mode = mode;

    this._chips[pinData.chip].pinMode(pinData.name, mode);
  }

  return this;
};

ChipIO.prototype.pwmWrite = function(pin, value) {
  debug('pwmWrite', pin, value);

  pin = this.normalize(pin);

  var pinData = this._pins[pin];

  if (pinData && pinData.chip) {
    this._chips[pinData.chip].pwmWrite(pinData.name, value);
  }

  return this;
};

ChipIO.prototype.analogWrite = ChipIO.prototype.pwmWrite;

ChipIO.prototype.analogRead = function(pin, handler) {
  debug('analogRead', pin);

  pin = this.normalize(pin);

  var pinData = this._pins[pin];

  if (pinData && pinData.chip) {
    this._pins[pin].report = 1;

    this.on('analog-read-' + pin, handler);

    this._chips[pinData.chip].analogRead(pinData.name);
  }

  return this;
};

ChipIO.prototype.digitalWrite = function(pin, value) {
  debug('digitalWrite', pin, value);

  pin = this.normalize(pin);

  var pinData = this._pins[pin];

  if (pinData && pinData.chip) {
    this._chips[pinData.chip].digitalWrite(pinData.name, value);
  }

  return this;
};

ChipIO.prototype.digitalRead = function(pin, handler) {
  debug('digitalRead', pin);

  pin = this.normalize(pin);

  var pinData = this._pins[pin];

  if (pinData && pinData.chip) {
    this._pins[pin].report = 1;

    this.on('digital-read-' + pin, handler);

    this._chips[pinData.chip].digitalRead(pinData.name);
  }

  return this;
};

ChipIO.prototype.i2cConfig = function(options) {
  debug('i2cConfig', options);

  // note that there's a design flaw here
  // two devices with the same address on different buses doesn't work
  // see https://github.com/rwaldron/io-plugins/issues/13

  // options.address is _always_ sent by all I2C component classes in
  // Johnny-Five
  var address = options.address;

  // options.bus is optional
  var bus = typeof(options.bus) !== 'undefined' ? options.bus : DEFAULT_BUS;

  // associate the address to the bus
  if (!addressToBus.hasOwnProperty(address)) {
    addressToBus[address] = bus;
  }

  // create an i2c-bus object for the I2C bus
  if (!this._i2cBuses.hasOwnProperty(bus)) {
    this._i2cBuses[bus] = i2cBus.openSync(bus);
  }

  return this;
};

ChipIO.prototype.i2cWrite = function(address, cmdRegOrData, inBytes) {
  debug('i2cWrite', address, cmdRegOrData, inBytes);

  var i2c = this._i2cBuses[addressToBus[address]];

  // if i2cWrite was used for an i2cWriteReg call...
  if (arguments.length === 3 &&
      !Array.isArray(cmdRegOrData) &&
      !Array.isArray(inBytes)) {
    return this.i2cWriteReg(address, cmdRegOrData, inBytes);
  }

  // fix arguments if called with Firmata.js API
  if (arguments.length === 2) {
    if (Array.isArray(cmdRegOrData)) {
      inBytes = cmdRegOrData.slice();
      cmdRegOrData = inBytes.shift();
    } else {
      inBytes = [];
    }
  }

  var buffer = new Buffer([cmdRegOrData].concat(inBytes));

  // only write if bytes provided
  if (buffer.length) {
    i2c.i2cWriteSync(address, buffer.length, buffer);
  }
  return this;
};

ChipIO.prototype.i2cWriteReg = function(address, register, byte) {
  debug('i2cWriteReg', address, register, byte);

  var i2c = this._i2cBuses[addressToBus[address]];

  i2c.writeByteSync(address, register, byte);

  return this;
};

ChipIO.prototype.i2cRead = function(address, register, size, handler) {
  debug('i2cRead', address, register, size, handler);

  var continuousRead = function() {
    this.i2cReadOnce(address, register, size, function(bytes) {
      handler(bytes);
      setTimeout(continuousRead, TICK_INTERVAL);
    });
  }.bind(this);

  continuousRead();

  return this;
};

ChipIO.prototype.i2cReadOnce = function(address, register, size, handler) {
  // fix arguments if called with Firmata.js API
  if (arguments.length === 3 &&
      typeof register === "number" &&
      typeof size === "function") {
    handler = size;
    size = register;
    register = null;
  }

  debug('i2cReadOnce', address, register, size, handler);

  var event = "I2C-reply" + address + "-" + (register !== null ? register : 0);

  var afterRead = function (err, bytesRead, buffer) {
    if (err) {
      return this.emit("error", err);
    }

    // convert buffer to an Array before emit
    this.emit(event, Array.prototype.slice.call(buffer));
  }.bind(this);

  if (typeof handler === "function") {
    this.once(event, handler);
  }

  var i2c = this._i2cBuses[addressToBus[address]];
  var data = new Buffer(size);

  if (register !== null) {
    i2c.readI2cBlock(address, register, size, data, afterRead);
  } else {
    i2c.i2cRead(address, size, data, afterRead);
  }

  return this;
};

ChipIO.prototype.pingRead = function() {
  throw new Error('pingRead is not supported! Please use an I2C backpack: http://johnny-five.io/examples/proximity-hcsr04-i2c/');
};

ChipIO.prototype._tick = function() {
  var asyncTicksRunning = 2;

  var afterTick = function() {
    asyncTicksRunning -= 1;

    if (asyncTicksRunning === 0) {
      // schedule next tick
      this._tickTimeout = setTimeout(this._tick.bind(this), TICK_INTERVAL);
    }
  }.bind(this);

  this._chips.AXP209.tick(afterTick);
  this._chips.PCF8574A.tick(afterTick);
  this._chips.R8.tick();
};

ChipIO.prototype._onAnalogRead = function(id, value) {
  var pin = this._pinsById[id];

  this.emit('analog-read-' + pin.number, value);
};

ChipIO.prototype._onDigitalRead = function(id, value) {
  var pin = this._pinsById[id];

  this.emit('digital-read-' + pin.number, value);
};

module.exports = ChipIO;
