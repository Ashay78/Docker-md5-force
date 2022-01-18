const {WebSocketServer} = require('ws');
const wss = new WebSocketServer({ port: 8000 });


class Sockets {
    constructor() {
        this.serverList = [];
        this.slaveList = [];
        this.saveServer = this.saveServer.bind(this);
        this.saveSlave = this.saveSlave.bind(this);
    }

    saveServer(id, server) {
        this.serverList[id] = server;
    }

    saveSlave(id, slave) {
        this.slaveList[id] = slave;
    }
}


const sockets = new Sockets();
let cpt = 0;
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
                default:
                    break;
            }
            return;
        }

        if (parts[0] === 'found') {
            sockets.serverList.forEach(server => server.send(msg));
        }
    });
});