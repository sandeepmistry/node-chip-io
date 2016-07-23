# chip-io

![logo](images/CHIP-J5.png)

[Johnny-Five](https://github.com/rwaldron/johnny-five) [IO Plugin](https://github.com/rwaldron/io-plugins) for the [Next Thing Co.](http://nextthing.co/index.html) [C.H.I.P.](http://getchip.com)

## Prerequisites

 * Next Thing Co. [C.H.I.P.](http://getchip.com) board
 * Node.js installed
   1. Install ```curl```: ```sudo apt-get install curl```
   2. Follow Debian section of [NodeSource installations instructions](https://github.com/nodesource/distributions#debinstall)
 * Build essential installed: ```sudo apt-get install build-essential```
 * Add ```chip``` user to ```i2c``` group: ```sudo adduser chip i2c```

## Getting Started

```sh
npm install chip-io johnny-five
```

## Boilerplate Program

```javascript
var five = require('johnny-five');
var chipio = require('chip-io');

var board = new five.Board({
  io: new chipio()
});

board.on('ready', function() {
  // do Johnny-Five stuff
});
```

## Examples

See [examples](examples) folder as well as [Johnny-Five examples](http://johnny-five.io/examples/).

## API

See  [Johnny-Five API docs](http://johnny-five.io/api/).

## Pin Guide

| Johnny-Five Compatible Name | Number | Supported Modes | Info |
|-----------------------------|--------|-----------------|------|
| XIO-P0 | 53 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P1 | 54 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P2 | 55 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P3 | 56 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P4 | 57 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P5 | 58 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P6 | 59 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P7 | 60 | Input, Output | Connected to the PCF8574A IO extender |
| I2C | | I2C | Uses I2C port 2 (TWI2-SCK and TWI2-SDA) |

![C.H.I.P. pinouts](http://docs.getchip.com/images/chip_pinouts.jpg)

## Additional Features

| Type | Usage | Johnny-Five type | Notes |
| ---- | ----- | ---------------- | ----- |
| Battery Voltage | `new chipio.BatteryVoltage();` | [five.Sensor](http://johnny-five.io/api/sensor/) | Reads battery voltage from the AXP290 |
| Internal Temperature | `new chipio.InternalTemperature();` | [five.Thermometer](http://johnny-five.io/api/thermometer/) | Reads internal temperature from the AXP290 |
| Status LED | `new chipio.StatusLed;` | [five.Led](http://johnny-five.io/api/led/) | Controls status LED connected to GPIO2 on the AXP290 |
