var five = require('johnny-five');
var ChipIO = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

var previousVoltage = null;

board.on('ready', function() {
  // set BAT pin as analog input
  this.pinMode('BAT', five.Pin.ANALOG);

  // enable analog read's on BAT pin
  this.analogRead('BAT', function(value) {
    // convert analog read value to voltage
    var voltage = (value * 1.1) / 1000;

    // print new voltage to console, only if it has changes
    if (voltage !== previousVoltage) {
      console.log('Battery voltage is ' + voltage.toFixed(2) + 'V');

      previousVoltage = voltage;
    }
  });
});
