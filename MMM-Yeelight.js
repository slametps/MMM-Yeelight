/**
 * @file MMM-Yeelight.js
 *
 * @author slametps
 * @license MIT
 *
 * @see https://github.com/slametps/MMM-Yeelight
 */
Module.register("MMM-Yeelight", {

    // Default module config.
    defaults: {
      colour: false,
      updateInterval: 600 * 1000,
      showOnlyOn: false,
      showLabel: true,
      timeout: 3000,
      animationSpeed: 2.5 * 1000, // Speed of the update animation. (milliseconds)
      devicesInfo: []
    },

    getStyles: function () {
        return ["font-awesome.css", "MMM-Yeelight.css"];
    },

    // Define required translations.
    getTranslations: function() {
      return {
        'en': 'translations/en.json',
        'id': 'translations/id.json'
      };
    },

    // Define start sequence.
    start: function () {
        var self = this;
        var devices = [];

        this.getData();
        setInterval(() => {
          this.getData();
        }, self.config.updateInterval);
    },

    // Override dom generator.
    getDom: function () {
        var wrapper = document.createElement("div");
        var self = this;

        if (self.devices && self.devices.length > 0) {
          var table = document.createElement("table");
          table.classList.add("small", "table", "align-left");

          if (this.config.showLabel)
            table.appendChild(this.createLabelRow());

          for (var i = 0; i < self.devices.length; i++) {
            if (self.config.showOnlyOn) {
              if (self.devices[i].on_off == 1) {
                domAction(self.devices[i], self.config);
              }
            }
            else {
              domAction(self.devices[i], self.config);
            }
          }

          function domAction(device, config) {
            var row = document.createElement("tr");
            var room = document.createElement("td");
            console.debug(device.alias);
            room.innerHTML = device.alias;
            row.appendChild(room);
            var lightsallLabel = document.createElement("td");
            lightsallLabel.classList.add("centered");

            var lightstatus = document.createElement("i");
            lightstatus.classList.add("fa", device.on_off ? (device.type === "bulb" ? "fa-lightbulb-o" : "fa-plug") : "fa-times");
            if (config.colour) {
              lightstatus.classList.add("lights-all-on");
            }
            lightsallLabel.appendChild(lightstatus);
            row.appendChild(lightsallLabel);
            table.appendChild(row);
          }
          wrapper.appendChild(table);
        } else {
          wrapper.innerHTML = this.translate("NO_DATA");
          wrapper.className = "dimmed light small";
        }
        return wrapper;
    },

    createLabelRow: function () {

        var labelRow = document.createElement("tr");

        var roomiconlabel = document.createElement("th");
        var typeIcon = document.createElement("room");
        typeIcon.classList.add("fa", "fa-home");
        roomiconlabel.appendChild(typeIcon);
        labelRow.appendChild(roomiconlabel);

        var lightsonlabel = document.createElement("th");
        lightsonlabel.classList.add("centered");
        var typeIcon = document.createElement("lightson");
        //typeIcon.classList.add("fa", "fa-lightbulb-o");
        typeIcon.innerHTML = this.translate("LIGHTS_ON");
        lightsonlabel.appendChild(typeIcon);
        labelRow.appendChild(lightsonlabel);

        var lightsonlabel = document.createElement("th");
        lightsonlabel.classList.add("centered");

        return labelRow;
    },

    getData: function () {
      this.notificationReceived('YEELIGHT_NETWORK_SEARCH');
    },

    notificationReceived: function(notification, payload, sender) {
      console.log(this.name + " received " + notification + " notification");
      this.sendSocketNotification(notification, {config: this.config, payload: payload});
    },

    socketNotificationReceived: function(notification, payload) {
      var self = this;
      console.log(this.name + " received " + notification + " socket notification");
      if (notification == 'YEELIGHT_NETWORK_SEARCH_RESULT') {
        this.devices = payload.devices;
        this.updateDom(self.config.animationSpeed);
      }
    }
});
