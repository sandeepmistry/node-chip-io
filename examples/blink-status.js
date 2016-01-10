var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  // Create an LED for the STATUS LED
  var led = new five.Led('STATUS');

  // Blink every half second
  led.blink(500);
});
