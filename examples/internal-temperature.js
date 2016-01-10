var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

var previousTemperature = null;

board.on('ready', function() {
  // set INTTEMP pin as analog input
  this.pinMode('INTTEMP', five.Pin.ANALOG);

  // enable analog read's on INTTEMP pin
  this.analogRead('INTTEMP', function(value) {
    // convert value to temperature
    var temperature = value * 0.1 - 144.7;

    // print new temperature to console, only if it has changes
    if (temperature !== previousTemperature) {
      console.log('Internal temperature is ' + temperature.toFixed(2) + ' °C');

      previousTemperature = temperature;
    }
  });
});
