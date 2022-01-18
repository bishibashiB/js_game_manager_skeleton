class view {
    constructor(ip, port, sizeX, sizeY) {
        this.ip = ip;
        this.port = port;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.express = require('express');
        this.app = this.express();
        this.http = require('http').Server(this.app);
        this.app.use('/', this.express.static(__dirname + '/../public/view'));
        var io = require('socket.io')(this.http);
        io.on('connection', function(client){
            io.emit('connected');
            client.on('msg', function(msg){
                console.log("Message: " + msg)
                io.emit('msg', msg);
                //send msg to one client only: client.emit("topic", "message")
            });
        });
        this.io = io;
        this.http.listen(this.port);
        console.log('view App: ' + this.ip + ":" + this.port);
    }

    show() {
        this.io.emit('show');
    }

    setColor(x,y,r,g,b) {
        this.io.emit('color', {"x":x, "y":y, "r":r, "g":g, "b":b} );
    }

    setMatrixColor(r,g,b) {var x;
        var x;
        var y;
        for (y = 0; y < this.sizeY; y++) {
            for (x = 0; x < this.sizeX; x++) {
                this.io.emit('color', {"x":x, "y":y, "r":r, "g":g, "b":b} );
            }
        }
    }
}
module.exports = view;