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
