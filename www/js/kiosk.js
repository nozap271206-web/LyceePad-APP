window.KioskMode = {
  start: function(success, error) {
    cordova.exec(success, error, "KioskMode", "startLockTask", []);
  },
  stop: function(success, error) {
    cordova.exec(success, error, "KioskMode", "stopLockTask", []);
  }
};
