var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // Create an analog pin for the LRADC
  var lradc = new five.Pin({
    pin: 'LRADC',
    type: 'analog'
  });

  // read the value continuously
  // value is between 0 and 63 (it's only 6-bit)
  lradc.read(function(error, value) {
    console.log(value);
  });
});
