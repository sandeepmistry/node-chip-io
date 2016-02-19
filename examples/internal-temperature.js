var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  var thermometer = new five.Thermometer({
    controller: ChipIO.Controllers.INTERNAL_TEMP
  });

  thermometer.on('change', function(data) {
    console.log('Internal temperature is ' + data.celsius.toFixed(2) + '°C');
  });
});
