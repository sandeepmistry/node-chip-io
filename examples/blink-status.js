var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // Create an LED for the STATUS LED
  var statusLed = new chipio.StatusLed();

  // Blink every half second
  statusLed.blink(500);
});
