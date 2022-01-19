const {WebSocketServer} = require('ws');
const wss = new WebSocketServer({ port: 8000 });
const exec = require('child_process').exec;


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
            return;
        }

        if (msg === 'server') {
            sockets.saveServer(cpt, ws);
            cpt++;
            return;
        }

        let parts = msg.split(' ');
        if (parts[0] === 'server') {
            switch (parts[1]) {
                case 'search':
                    console.log('search')
                    break;
                case 'stop':
                    console.log('stop')
                    sockets.slaveList.forEach(slave => slave.send('stop'));
                    break;
                case 'exit':
                    console.log('exit')
                    sockets.slaveList.forEach(slave => slave.send('exit'));
                    break;
                case 'nbSlave':
                    console.log('nbSlave' + sockets.slaveList.length)
                    sockets.serverList.forEach(server => server.send('nbSlave : ' + sockets.slaveList.size));
                    sockets.serverList.forEach(server => server.send('nbServer : ' + sockets.serverList.size));
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
            sockets.serverList.forEach(server => server.send(msg));
        }
    });

    ws.on('close', function () {
        if (sockets.serverList.has(ws)) {
            sockets.serverList.delete(ws);
        }

        if (sockets.slaveList.has(ws)) {
            sockets.slaveList.delete(ws);
        }
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