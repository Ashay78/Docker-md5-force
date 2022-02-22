const {WebSocketServer} = require('ws');
const wss = new WebSocketServer({ port: 8000 });
const exec = require('child_process').exec;
const mongoose = require('mongoose');
const {Hash} = require("./Models/Hash");

mongoose.connect('mongodb://mongo:27017/md5', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

class Sockets {
    constructor() {
        this.serverList = new Set();
        this.slaveList = new Set();
        this.saveServer = this.saveServer.bind(this);
        this.saveSlave = this.saveSlave.bind(this);
    }

    saveServer(id, server) {
        // this.serverList[id] = server;
        this.serverList.add(server);
    }

    saveSlave(id, slave) {
        // this.slaveList[id] = slave;
        this.slaveList.add(slave);
    }
}

const sockets = new Sockets();
let cpt = 0;
let cptSlave = 0;

wss.on('connection', function connection(ws) {
    ws.on('message', function (message) {
        var buf = Buffer.from(message);
        let msg = buf.toString();
        console.log()
        console.log(message);
        console.log(msg)

        if (msg === 'slave') {
            sockets.saveSlave(cpt, ws);
            cpt++;
            sendNbSlaveAndUser();
            return;
        }

        if (msg === 'server') {
            sockets.saveServer(cpt, ws);
            cpt++;
            sendNbSlaveAndUser();
            return;
        }

        let parts = msg.split(' ');
        if (parts[0] === 'server') {
            switch (parts[1]) {
                case 'search':
                    var min = getNumber("a");
                    var max = getNumber("9999");
                    var nbSlave = sockets.slaveList.size;
                    var step = (max - min) / nbSlave;
                    var last = min;
                    console.log(nbSlave);
                    Hash.findOne({hash: parts[2]}).then(hash => {
                        if (hash === null) {
                            sockets.slaveList.forEach(
                                slave => {
                                    slave.send('search ' + parts[2] + ' ' + last + ' ' + (last+step))
                                    last = last+step;
                                })
                            sockets.serverList.forEach(
                                server => server.send('search ' + parts[2]))
                        } else {
                            sockets.serverList.forEach(server => server.send('db ' + hash.hash + ' ' + hash.value))
                        }
                    })
                    break;
                case 'stop':
                    console.log('stop')
                    sockets.slaveList.forEach(slave => slave.send('stop'))
                    sockets.serverList.forEach(server => server.send('stop'))

                    break;
                case 'exit':
                    console.log('exit')
                    sockets.slaveList.forEach(slave => slave.send('exit'))
                    sockets.serverList.forEach(server => server.send('exit'))
                    cptSlave = 0
                    break;
                case 'addSlave':
                    cptSlave++;
                    scaleSlave(cptSlave);
                    break;
                case 'removeSlave':
                    if (cptSlave > 0) {
                        cptSlave--;
                    }
                    scaleSlave(cptSlave);
                    break;
                default:
                    break;
            }
            return;
        }

        if (parts[0] === 'found') {
            console.log('found : ' + parts[1] + ' ' + parts[2]);
            sockets.slaveList.forEach(slave => slave.send('stop'))
            sockets.serverList.forEach(server => server.send(msg));

            let hash = new Hash({
                hash: parts[1],
                value: parts[2]
            })

            hash.save();
        }
    });

    ws.on('close', function () {
        if (sockets.serverList.has(ws)) {
            sockets.serverList.delete(ws);
        }

        if (sockets.slaveList.has(ws)) {
            sockets.slaveList.delete(ws);
        }
        sendNbSlaveAndUser();
    });
});

function scaleSlave(nbSlave) {
    exec('docker-compose up -d --no-recreate --scale slave=' + nbSlave,
        function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        });
}

function sendNbSlaveAndUser() {
    sockets.serverList.forEach(server => server.send('nbSlave ' + sockets.slaveList.size));
    sockets.serverList.forEach(server => server.send('nbServer ' + sockets.serverList.size));
}

function getNumber(word) {
    var number = 0;
    for (var i = word.Length - 1; i >= 0; i--)
    {
        var letter = word[i];
        var index = _alphabet.IndexOf(letter);
        if (index == -1)
        {
            return -1;
        }

        var x = (index + 1) * Math.pow(62, word.Length - (i + 1));
        number += x;
    }

    return number - 1;
}