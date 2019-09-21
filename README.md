# homebridge-influxdb-temperature-humidity

![npm](https://img.shields.io/npm/v/homebridge-influxdb-temperature-humidity?style=flat-square)

HomeBridge plugin that exposes temperature/humidity values stored in an InfluxDB database. Largely inspired by [lucacri/homebridge-http-temperature-humidity](https://github.com/lucacri/homebridge-http-temperature-humidity).

# Usage

## Install

Install the plugin using: 

````bash
npm i -g homebridge-influxdb-temperature-humidity
````

You may have to use either `sudo` or `--unsafe-perm`, or both, depending on your env.

## Configure

Add this to the `accessories` field of your Homebridge `config.json` file (most likely located at `~/.homebride/config.js` : 

````
{
  "accessories": [
      ...rest of your acccesories
      {
        "accessory": "InfluxTemperatureHumidity",
        "name": "Weather Sensors", // You can use any name, it's only for the UI
        "influx": {
          "host": "127.0.0.1",
          "database": "homeserver"
        }
      }
    ]
}
````

The `influx` configuration object is passed as-is to the `influx` npm library. You can use all options supported by the library, more information can be found [here](https://node-influx.github.io/class/src/index.js~InfluxDB.html#instance-constructor-constructor)
