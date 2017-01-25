## Version 2.1.1

 * Added new on-board button and status LED example. ([@norgeous](https://github.com/norgeous))
 * Switch to `i2c-bus` module for I2C layer. ([@fivdi](https://github.com/fivdi))
 * Throw exception for `pingRead`.

## Version 2.1.0

 * Fixed I2C address 0 not working
 * Added support for Onboard Button

## Version 2.0.2

 * Correct internal temperature controller name.
 * Correct PWM polarity inversion.
 * Switch to sync. I/O, resolves I2C issues.

## Version 2.0.1

 * Correct typeof comparison for addressToBus map, fixes I2C read and write operations.

## Version 2.0.0

 * Officially added support to access LCD pins via `mmap` to `/dev/mem` (requires `root` or `sudo`).
 * Added PWM and LRADC support.
 * Added new components for battery voltage, internal temperature, and status LED.
 * Fixed segfault if `sudo` was not used for R8 pins. ([@urish](https://github.com/urish))
 * Bus 2 is now the default bus for I2C. ([@bbx10](https://github.com/bbx10))
 * Added support for J2 components to specificy I2C bus via `i2cConfig` ([@rwaldron](https://github.com/rwaldron))

## Older

 * Changes not recorded
