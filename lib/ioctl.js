var ioctl = require('ioctl');

module.exports = function(fd, request, arg, callback) {
  var err;

  try {
    ioctl(fd, request, arg);
  } catch (e) {
    err = e;
  }

  if (typeof(callback) === 'function') {
    callback(err);
  }
};
