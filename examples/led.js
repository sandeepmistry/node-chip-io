var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // Create an LED on the XIO-P0 pin
  var led = new five.Led('XIO-P0');

  // Blink every half second
  led.blink(500);
});
