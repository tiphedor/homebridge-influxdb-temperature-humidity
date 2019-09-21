let Service, Characteristic;

const Influx = require('influx')

const influx = new Influx.InfluxDB({
    host: '192.168.0.201',
    database: 'homeserver'
})

const getLastMesurement = (mesurementName, cb) => {
    influx.query(`SELECT last(value) FROM ${mesurementName}`)
        .then(result => cb(result[0].last))
        .catch(console.log)
}

module.exports = homebridge => {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    homebridge.registerAccessory("homebridge-influxdb-temperature-humidity", "InfluxTemperatureHumidity", HttpTempInfluxTemperatureHumidityhum)
}

function HttpTempInfluxTemperatureHumidityhum(log, config) {
    this.log = log;

    // Configuration
    this.url             = config["url"];
    this.httpMethod      = config["httpMethod"] || "GET";
    this.name            = config["name"];
    this.manufacturer    = config["manufacturer"] || "Generic";
    this.model           = config["model"] || "HTTP(S)";
    this.serial          = config["serial"] || "";
    this.humidity        = config["humidity"];
    this.lastUpdateAt    = config["lastUpdateAt"] || null;
    this.cacheExpiration = config["cacheExpiration"] || 60;
}

HttpTempInfluxTemperatureHumidityhum.prototype = {
    getRemoteState: (service, callback) => {
        getLastMesurement('temperature', function(temp) {
            this.temperatureService.setCharacteristic(
                Characteristic.CurrentTemperature,
                temp
            )
            this.temperature = temp

            // this.humidityService.setCharacteristic(
            //     Characteristic.CurrentRelativeHumidity,
            //     res.body.humidity
            // );
            // this.humidity = res.body.humidity;

            callback(null, this.temperature);

        }.bind(this))
        // request(this.httpMethod, this.url)
        //   .set("Accept", "application/json")
        //   .use(superagentCache)
        //   .expiration(this.cacheExpiration)
        //   .end(function(err, res, key) {
        //     if (err) {
        //         this.log(`HTTP failure (${this.url})`);
        //         callback(err);
        //     } else {
        //         this.log(`HTTP success (${key})`);

                

        //         if (this.humidity !== false) {
                   
        //         }

        //         this.lastUpdateAt = +Date.now();

        //         switch (service) {
        //             case "temperature":
        //                 callback(null, this.temperature);
        //                 break;
        //             case "humidity":
        //                 callback(null, this.humidity);
        //                 break;
        //             default:
        //                 var error = new Error("Unknown service: " + service);
        //                 callback(error);
        //         }
        //     }
        // }.bind(this));
    },

    getTemperatureState: function(callback) {
        this.getRemoteState("temperature", callback);
    },

    getHumidityState: function(callback) {
        this.getRemoteState("humidity", callback);
    },

    getServices: function () {
        var services = [],
            informationService = new Service.AccessoryInformation();

        informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial);
        services.push(informationService);

        this.temperatureService = new Service.TemperatureSensor(this.name);
        this.temperatureService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({ minValue: -273, maxValue: 200 })
            .on("get", this.getTemperatureState.bind(this));
        services.push(this.temperatureService);

        if (this.humidity !== false) {
            this.humidityService = new Service.HumiditySensor(this.name);
            this.humidityService
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .setProps({ minValue: 0, maxValue: 100 })
                .on("get", this.getHumidityState.bind(this));
            services.push(this.humidityService);
        }

        return services;
    }
};
