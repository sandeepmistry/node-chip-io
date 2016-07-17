var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // Create an LED on the PWM0 pin
  var led = new five.Led('PWM0');

  // Make it pulse with a 1 second interval
  led.pulse(1000);
});
