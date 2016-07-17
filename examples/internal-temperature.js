var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  var thermometer = new chipio.InternalTemperature();

  thermometer.on('change', function(data) {
    console.log('Internal temperature is ' + data.celsius.toFixed(2) + '°C');
  });
});
