var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  // do johnny five stuff

  var led    = new five.Led('XIO-P0');
  var button = new five.Button('XIO-P1');

  // "down" the button is pressed
  button.on('down', function() {
    console.log('down');
    led.on();
  });

  // 'up' the button is released
  button.on('up', function() {
    console.log('up');
    led.off();
  });
});
