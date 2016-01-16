var errno = require('errno').errno;
var ffi = require('ffi');

var libc = ffi.Library(null, {
  'ioctl': [ 'int', [ 'int', 'long', 'int' ] ]
});

module.exports = function(fd, request, arg, callback) {
  var err;

  if (libc.ioctl(fd, request, arg) === -1) {
    var no = ffi.errno();

    err = new Error(errno[no].code + ': ' + errno[no].description + ', ioctl');
  }

  if (typeof(callback) === 'function') {
    callback(err);
  }
};
