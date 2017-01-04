var five = require('johnny-five');
var chipio = require('../index'); // or require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // Create an LED for the STATUS LED
  var statusLed = new chipio.StatusLed();

  // Create an button for the built-in button
  var onboardButton = new chipio.OnboardButton();

  // add event listener for the 'up' event
  // note: the on-board button emits the 'down' and 'up'
  //       event at the same time on button release
  onboardButton.on('up', function() {
    
    // Turn status LED on
    statusLed.on();

    // Turn status LED off after 50ms
    setTimeout(function(){
      statusLed.off();
    }, 50);

  });
});

