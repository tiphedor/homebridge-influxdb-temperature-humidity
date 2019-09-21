const Influx = require('influx')

const influx = new Influx.InfluxDB({
    host: '192.168.0.201',
    database: 'homeserver'
})

const getLastMesurement = (mesurementName, cb) => {
    influx.query(`SELECT last(value), last(value) FROM temperature, humidity`)
        .then(result => cb(result))
        .catch(console.log)
}

getLastMesurement('temperature', console.log)

