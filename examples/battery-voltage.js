var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // create battery voltage sensor
  var batteryVoltage = new chipio.BatteryVoltage();

  // listen for value changes
  batteryVoltage.on('change', function(voltage) {
    console.log('Battery voltage is ' + voltage.toFixed(2) + 'V');
  });
});
