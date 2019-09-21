let Service, Characteristic;

const InfluxDB = require('influx')

const getLastMesurement = (influx, temperatureKeyName, humidityKeyName, cb) => {
    influx.query(`SELECT last(value), last(value) FROM ${temperatureKeyName}, ${humidityKeyName}`)
        .then(result => cb(null, result[1].last, result[0].last))
        .catch(err => cb(err))
}

module.exports = homebridge => {
    Service = homebridge.hap.Service
    Characteristic = homebridge.hap.Characteristic
    homebridge.registerAccessory("homebridge-influxdb-temperature-humidity", "InfluxTemperatureHumidity", HttpTempInfluxTemperatureHumidityhum)
}

function HttpTempInfluxTemperatureHumidityhum(log, config) {
    this.log = log;

    // Configuration
    this.name = config["name"]
    this.manufacturer = config["manufacturer"] || "Generic"
    this.model = config["model"] || "Accesory"
    this.serial = config["serial"] || "123-321-123"

    this.influx = new InfluxDB.InfluxDB({
        ...config['influx']
    })
}

HttpTempInfluxTemperatureHumidityhum.prototype = {
    // Called when HomeKit wants to read our sensor value.
    getRemoteState: function (service, callback) {
        getLastMesurement(this.influx, 'temperature', 'humidity', function(influxError, temp, humi) {
            if (influxError) {
                this.log(influxError)
                return callback(new Error(influxError))
            }

            this.temperatureService.setCharacteristic(Characteristic.CurrentTemperature, temp)
            this.humidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, humi)

            if (service === 'temperature') {
                return callback(null, temp)
            } else if (service === 'humidity') {
                return callback(null, humi);
            }

            return callback(new Error(`Unknown service ${service}`))
        }.bind(this))
    },

    // Homekit-specific getters
    getTemperatureState: function(callback) { this.getRemoteState("temperature", callback) },
    getHumidityState: function(callback) { this.getRemoteState("humidity", callback) },


    // Service configuration
    // Sets up all the capacities of the accessory, as well as the AccessoryInformation, which provides basic identification for our accessory.
    getServices: function () {
        const informationService = new Service.AccessoryInformation()
        this.temperatureService = new Service.TemperatureSensor(this.name)
        this.humidityService = new Service.HumiditySensor(this.name)

        informationService
            .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
            .setCharacteristic(Characteristic.Model, this.model)
            .setCharacteristic(Characteristic.SerialNumber, this.serial)
        
        this.temperatureService
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({ minValue: -273, maxValue: 200 })
            .on("get", this.getTemperatureState.bind(this))
        
        this.humidityService
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .setProps({ minValue: 0, maxValue: 100 })
            .on("get", this.getHumidityState.bind(this))

        return [
            informationService, this.temperatureService, this.humidityService
        ]
    }
};
