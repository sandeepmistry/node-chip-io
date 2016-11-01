var ChipIO = require('./lib/chip-io');

ChipIO.Controllers = require('./lib/controllers');

ChipIO.BatteryVoltage = require('./lib/battery-voltage');
ChipIO.InternalTemperature = require('./lib/internal-temperature');
ChipIO.OnboardButton = require('./lib/onboard-button');
ChipIO.StatusLed = require('./lib/status-led');

module.exports = ChipIO;
