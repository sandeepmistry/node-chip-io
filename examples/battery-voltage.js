var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  // create (analog) sensor on BAT pin
  var bat = new five.Sensor('BAT');

  // listen for value changes
  bat.on('change', function(value) {
    // convert analog read value to voltage
    var voltage = (value * 1.1) / 1000;

    console.log('Battery voltage is ' + voltage.toFixed(2) + 'V', value);
  });
});
