var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');
var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  var temperature = null;
  var thermometer = new five.Thermometer({
    controller: ChipIO.Controllers.INTERNAL_TEMP
  });
  thermometer.on('data', function() {
    var celsius = Math.round(this.celsius);

    if (temperature !== celsius) {
      temperature = celsius;
      console.log('%d°C', temperature);
    }
  });
});
