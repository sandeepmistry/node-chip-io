var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  // do johnny five stuff

  var pin = 1;

  this.pinMode(pin, five.Pin.ANALOG);

  this.analogRead(pin, function(value) {
    var voltage = (value * 1.1) / 1000;

    console.log('Battery voltage is ' + voltage.toFixed(2) + 'V');
  });
});
