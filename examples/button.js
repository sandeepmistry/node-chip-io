var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  // Create an button on the XIO-P1 pin
  var button = new five.Button('XIO-P1');

  // add event listeners for 'up' and 'down' events

  button.on('down', function() {
    console.log('down');
  });

  button.on('up', function() {
    console.log('up');
  });
});
