var pins = require('../lib/pins');

console.log('| Johnny-Five Compatible Name | Number | Supported Modes | Requires root or sudo | Info |');
console.log('| --------------------------- | :----: | --------------- | :-------------------: | ---- |');

for (var i = 0; i < pins.length; i++) {
  var pin = pins[i];

  if (pin.supportedModes.length === 0 || pin.chip === 'AXP209') {
    continue;
  }

  var modes = [];

  if (pin.supportedModes.indexOf(0) !== -1) {
    modes.push('Input');
  }

  if (pin.supportedModes.indexOf(1) !== -1) {
    modes.push('Output');
  }

  if (pin.supportedModes.indexOf(2) !== -1) {
    modes.push('Analog');
  }

  if (pin.supportedModes.indexOf(3) !== -1) {
    modes.push('PWM');
  }

  var line = '| ';

  line += pin.name;
  line += ' | ';
  line += i;
  line += ' | ';
  line += modes.join(', ');
  line += ' | ';
  line += (pin.chip === 'R8') ? '✓' : '';
  line += ' | ';
  line += (pin.chip === 'PCF8574A') ? 'Connected to the built-in PCF8574A IO extender' : '';
  line += ' |'

  console.log(line);
}

console.log('| I2C | | I2C | | Uses I2C port 2 (TWI2-SCK and TWI2-SDA) |');
