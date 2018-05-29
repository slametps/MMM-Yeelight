/* Magic Mirror
 * Node Helper: MMM-Yeelight
 *
 * By Slamet PS/slametps@gmail.com
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var Lookup = require('node-yeelight-wifi').Lookup;
var arrDevices;
var arrDevicesItem;
var look;

module.exports = NodeHelper.create({
	// Subclass start method.
	start: function() {
		console.log("Starting node_helper.js for MMM-Yeelight.");
	},

  search: function (config, params) {
    try {
      console.log('Searching Yeelight...');
      look = new Lookup();
      arrDevices = [];

      look.on("detected",(device) =>
      {
        //console.log("new yeelight detected: id="+device.id + " name="+device.name + " mac="+device.mac + " power="+device.power + " ip="+device.host + " port="+device.port);
        let stateDevice = (device.power ? 1 : 0);
        //console.log(config.devicesInfo);
        let deviceInfo = config.devicesInfo.find(deviceInfo => deviceInfo.mac.toLowerCase() === device.mac.toLowerCase());
        //console.log(deviceInfo);
        let deviceAlias;
        if (!deviceInfo) deviceAlias = "XXX";
        else deviceAlias = deviceInfo.alias;
        arrDevicesItem = {alias:deviceAlias, type:"bulb", ip:device.host, port:device.port, on_off:stateDevice};
        arrDevices.push(arrDevicesItem);
      });
    } catch (err) {
      console.log(err);
    }
  },

	socketNotificationReceived: function(notification, payload) {
    console.log(this.name + " node helper received a socket notification: " + notification + " - Payload: " + payload);
    if (notification == "YEELIGHT_NETWORK_SEARCH") {
      //console.log("Yeelight SEARCH BEGIN");
      this.search(payload.config, {});
      var that = this;

      function sendInfo() {
        // nothing to do
        //console.log("in sendInfo-" + arrDevices.length);
        if (arrDevices.length >= 1) {
          //console.log("1-PRINT OUTPUT LENGTH = " + arrDevices.length);
          arrDevices.sort(function(a, b) {
            var x = a.alias.toLowerCase();
            var y = b.alias.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
          });
          //console.log(arrDevices);
          //console.log("2-PRINT OUTPUT LENGTH = " + arrDevices.length);
          that.sendSocketNotification('YEELIGHT_NETWORK_SEARCH_RESULT', {devices: arrDevices});
          //console.log("before process.exit()");
          clearInterval(look.interval);
          //console.log("after process.exit()");
        }
      }

      setTimeout(sendInfo, payload.config.timeout);
      //console.log(payload.config.timeout + " ms -> CHECK arrDevices-" + arrDevices.length);
      //console.log("Yeelight SEARCH END");
    }
	},
});
