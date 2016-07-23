var util = require('util');

var BoardIO = require('board-io');
var debug = require('debug')('chip-io');

var I2C = require('./i2c');
var AllwinnnerR8 = require('./allwinner-r8');
var AXP209 = require('./axp209');
var PCF8574A = require('./pcf8574a');

var pins = require('./pins');

var TICK_INTERVAL = 19;

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

  this._i2cReads = [];

  this._chips = {
    AXP209: new AXP209(0, 0x34),
    PCF8574A: new PCF8574A(2, 0x38),
    R8: new AllwinnnerR8()
  };

  this._chips.AXP209.on('analog-read', this._onAnalogRead.bind(this));
  this._chips.PCF8574A.on('digital-read', this._onDigitalRead.bind(this));
  this._chips.R8.on('analog-read', this._onAnalogRead.bind(this));
  this._chips.R8.on('digital-read', this._onDigitalRead.bind(this));

  this._chips.AXP209.open(function(err) {
    if (err) {
      throw err;
    }

    this._chips.PCF8574A.open(function(err) {
      if (err) {
        throw err;
      }

      this._chips.R8.open(function(err) {
        // "optional" (requires root), so ignore err

        // setup interval for digital and analog reads
        this._tickInterval = setInterval(this._tick.bind(this), TICK_INTERVAL);

        // all done, emit ready event
        this.emit('ready');
      }.bind(this));
    }.bind(this));
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

ChipIO.prototype.i2cConfig = function(delay) {
  debug('i2cConfig', delay);

  return this;
};

ChipIO.prototype.i2cWrite = function(address, register, data) {
  if (arguments.length === 2) {
    data = register;
    register = null;
  }

  debug('i2cWrite', address, register, data);

  var i2c = new I2C(2, address);

  if (typeof(data) === 'number') {
    data = [data];
  }

  data = new Buffer(data);

  i2c.open(function(err) {
    if (err) {
      return;
    }

    if (register) {
      i2c.writeRegister(register, data, function() {
        i2c.close();
      });
    } else {
      i2c.write(data, function() {
        i2c.close();
      });
    }
  });

  return this;
};

ChipIO.prototype.i2cWriteReg = function(address, register, data) {
  debug('i2cWriteReg', address, register, data);

  this.i2cWrite(address, register, data);

  return this;
};

ChipIO.prototype.i2cRead = function(address, register, size, handler) {
  debug('i2cRead', address, register, size, handler);

  this._i2cReads.push(arguments);

  return this;
};

ChipIO.prototype.i2cReadOnce = function(address, register, size, handler) {
  if (arguments.length === 3) {
    handler = size;
    size = register;
    register = null;
  }

  debug('i2cReadOnce', address, register, size, handler);

  var i2c = new I2C(2, address);

  i2c.open(function(err) {
    if (err) {
      return;
    }

    if (register) {
      i2c.readRegister(register, size, function(err, data) {
        if (err) {
          return;
        }

        i2c.close(function() {
          var event = 'I2C-reply-' + address + '-' + register;

          this.once(event, handler);

          this.emit(event, data);
        }.bind(this));
      }.bind(this));
    } else {
      i2c.read(size, function(err, data) {
        if (err) {
          return;
        }

        i2c.close(function() {
          var event = 'I2C-reply-' + address;

          this.once(event, handler);

          this.emit(event, data);
        }.bind(this));
      }.bind(this));
    }
  }.bind(this));

  return this;
};

ChipIO.prototype._tick = function() {
  this._chips.AXP209.tick();
  this._chips.PCF8574A.tick();
  this._chips.R8.tick();

  for (var j = 0; j < this._i2cReads.length; j++) {
    this.i2cReadOnce.apply(this, this._i2cReads[j]);
  }
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
