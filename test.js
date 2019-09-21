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

getLastMesurement('temperature', console.log)

