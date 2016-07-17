var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // Create an LED on the XIO-P0 pin
  var led    = new five.Led('XIO-P0');

  // Create an button on the XIO-P1 pin
  var button = new five.Button('XIO-P1');

  // add event listeners for 'up' and 'down' events
  // turn LED on when button is down, LED off when button is up

  button.on('down', function() {
    console.log('down');
    led.on();
  });

  button.on('up', function() {
    console.log('up');
    led.off();
  });
});
