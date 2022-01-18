class menu {
    constructor(ip, port, appManager) {
        var self = this;
        this.appManager = appManager;
        this.ip = ip;
        this.port = port;
        this.express = require('express');
        this.app = this.express();
        this.http = require('http').Server(this.app);
        this.app.use('/', this.express.static(__dirname + '/../public/menu/'));
        var io = require('socket.io')(this.http);
        io.on('connection', function(client){
            io.emit('connected');
            io.emit('choose', appManager.apps);
            client.on('start_game', function(gamename){
                self.appManager.startGame(gamename);
            });
        });
        this.http.listen(this.port);
        console.log('menu App: ' + this.ip + ":" + this.port);
    }
}
module.exports = menu;