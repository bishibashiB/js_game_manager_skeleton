const Player = require('./player')

class player_mgr {
    constructor() {
        this.players = [];
    }

    add(socket_id) {
        // check all used player ids and then give a free id to new player.
        var newPlayerId = this.players.length;

        for (const x of Array(this.players.length).keys()) {
            let index = this.players.findIndex(p => p.id === x);
            if (-1 == index) {
                newPlayerId = x;
                break;
            }
        }
        var p = new Player(socket_id, newPlayerId);
        this.players.push(p);
    }

    remove(socket_id) {
        // remove item at index
        this.players.splice(this.getPlayerIdx(socket_id), 1);
    }

    addAndStartPlayers(app) {
        if (!app) {
            console.log("App unknown");
        }
        for (var i = 0; i < this.players.length; i++) {
            app.addPlayer(i);
            if (this.players[i].getUsername() != "") {
                console.log(this.players[i].getUsername() + " joined the game");
                app.startPlayer(i);
            }
        }
    }

    getUsername(idx) {
        this.players[idx].getUsername();
    }

    initialisePlayer(socket_id, username, queuePos) {
        var idx = this.getPlayerIdx(socket_id);
        this.players[idx].setUsername(username);
        this.players[idx].setQueuePosition(queuePos);
    }

    reduceQueuePositions() {
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].reduceQueuePos(1);
        }
    }

    getQueuePosition(socket_id) {
        console.log("player_mgr getQueuePosition " + socket_id);
        return this.players[this.getPlayerIdx(socket_id)].getQueuePosition();
    }

    numberOfPlayer() {
        return this.players.length;
    }

    resetUsernames() {
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].setUsername("");
        }
    }

    numberOfActivePlayer() {
        var numberOfActivePlayers = 0;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].getUsername() != "") {
                numberOfActivePlayers += 1;
            }
        }
        return numberOfActivePlayers;
    }

    getPlayerId(socket_id) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].socket_id == socket_id) {
                return this.players[i].id;
            }
        }
        return null;
    }
    getPlayerIdx(socket_id) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].socket_id == socket_id) {
                return i;
            }
        }
        return null;
    }
}
module.exports = player_mgr;
