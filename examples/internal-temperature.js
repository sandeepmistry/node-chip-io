var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  // do johnny five stuff

  var pin = 'INTTEMP';

  this.pinMode(pin, five.Pin.ANALOG);

  this.analogRead(pin, function(value) {
    var temperature = value * 0.1 - 144.7;

    console.log('Internal temperature is ' + temperature.toFixed(2) + ' °C');
  });
});
