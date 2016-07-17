var events = require('events');
var util = require('util');

var five = require('johnny-five');

function BatteryVoltage(opts) {
  this._sensor = new five.Sensor({
    pin: 'BAT',
    range: [0x000, 0xfff]
  });

  this._sensor.on('data', this._onSensorData.bind(this));
  this._sensor.on('change', this._onSensorChange.bind(this));
}

util.inherits(BatteryVoltage, events.EventEmitter);

BatteryVoltage.prototype._onSensorData = function(value) {
  var voltage = (value * 1.1) / 1000;

  this.emit('data', voltage);
};

BatteryVoltage.prototype._onSensorChange = function(value) {
  var voltage = (value * 1.1) / 1000;

  this.emit('change', voltage);
};

module.exports = BatteryVoltage;
