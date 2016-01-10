# chip-io

![logo](images/CHIP-J5.png)

[Johnny-Five](https://github.com/rwaldron/johnny-five) [IO Plugin](https://github.com/rwaldron/io-plugins) for the [Next Thing Co. C.H.I.P.](http://nextthing.co/index.html)

## Prerequisites

 * Next Thing Co. C.H.I.P. board
 * Node.js installed

## Getting Started

```sh
npm install chip-io johnny-five
```

## Boilerplate Program

```javascript
var five = require('johnny-five');
var ChipIO = require('chip-io');

var board = new five.Board({
  io: new ChipIO()
});

board.on('ready', function() {
  // do Johnny-Five stuff
});
```

## Examples

See [examples](examples folder) as well as [Johnny-Five examples](http://johnny-five.io/examples/).

## API

See  [Johnny-Five API docs](http://johnny-five.io/api/).

## Pin Guide

| Johnny-Five Compatible Name | Number | Supported Modes | Info |
|-----------------------------|--------|-----------------|------|
| XIO-PO | 0 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P1 | 1 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P2 | 2 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P3 | 3 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P4 | 4 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P5 | 5 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P6 | 6 | Input, Output | Connected to the PCF8574A IO extender |
| XIO-P7 | 7 | Input, Output | Connected to the PCF8574A IO extender |
| STATUS | 8 | Output | Connected to status LED via GPIO2 of the AXP290 |
| BAT | 9 | Input | Reads battery voltage from the AXP290 |
| INTTEMP | 10 | Input | Reads internal temperature from the AXP290 |

![C.H.I.P. pinouts](http://docs.getchip.com/images/chip_pinouts.jpg)
