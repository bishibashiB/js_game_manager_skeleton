// 'app' that forwards virtual joystick commands over serial (handshake) to microcontroller running a (snake) game

// @ts-check

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline');
const serial = require('serial');

const MaxPlayers = 8;

const SerialCmd = {
    "ADD_PLAYER": 1,    // "1Byte number/ID, 2x3Byte color head / body"
    "REMOVE_PLAYER": 2, // "1Byte number/ID"
    "ITERATE_STEP": 3, // 0Byte, ... all players
    "DIR_CMD_PLAYER": 4, // "1Byte number/ID, 1Byte NEW rel. direction ('r', 'l')"
}


function getBinarySize(string) {
    return Buffer.byteLength(string, 'utf8');
}

class serial_forward {


    constructor(app_mgr, viewcontroller, gamespeedMS, sizeX, sizeY) {
        console.log("Init serial_forward");
        this.app_mgr = app_mgr;

        this.gamespeedMS = gamespeedMS;
        this.activePlayers = [];
        this.playerbuffer_len = [];
        this.playerbuffer_queue = [];
        this.buffer_len = [];
        this.buffer_queue = [];
        this.finsihed_step_on_target = 0;
        this.port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 }, function (err) {
            if (err) {
                return console.log('SerialPort open Error: ', err.message)
            }
        });

        this.parser = new Readline({ delimiter: '\n' });
        this.port.pipe(this.parser);

        this.parser.on('data', line => {
            this.sendNextCommand();

            console.log(`<<< ${line}`); // log return value
        });

        this.max_players = 8;
        this.app_mgr.setMaxPlayer(this.max_players);
    }


    startNewGame() { } //TODO

    _getColor(id) {
        if ((id % 8) == 0) { return [255, 127, 0, 255, 0, 0]; } //Orange Head and Red Body
        if ((id % 8) == 1) { return [0, 127, 255, 0, 0, 255]; } //LightBlue Head and Blue Body
        if ((id % 8) == 2) { return [127, 255, 0, 0, 255, 0]; } //LightGreen Head and Green Body
        if ((id % 8) == 3) { return [255, 255, 127, 255, 255, 0]; } //LightYellow Head and Yellow Body
        if ((id % 8) == 4) { return [127, 255, 255, 0, 255, 255]; } //Light Turquoise Head and Turquoise Body
        if ((id % 8) == 5) { return [255, 127, 255, 255, 0, 255]; } //Light Purple Head and Purple Body
        if ((id % 8) == 6) { return [255, 180, 0, 255, 63, 0]; } //Orange Head and Red/Orange Body
        if ((id % 8) == 7) { return [255, 180, 255, 255, 63, 255]; } //Orange Head and Red Body
    }

    sendNextCommand() {
        if (this.buffer_len.length === 0) {
            // console.log("sendNextCommand nothing to do .. dying");
            return;
        }
        var buffer_size = this.buffer_len.shift();
        // console.log("sendNextCommand Buffer_size: " + buffer_size);
        // console.log("sendNextCommand Buffer: " + this.buffer_queue);
        var buffer = new Uint8Array(buffer_size + 1);
        for (var i = 0; i < buffer_size; i++) {
            buffer[i] = this.buffer_queue.shift();
        }
        buffer[buffer_size] = '\n'.charCodeAt(0);
        this.port.write(Buffer.from(buffer));
        console.log(">>> " + buffer);
    }

    addPlayer(id) {
        console.log("serial_forward Player Adding / Connected " + id);
        var color = this._getColor(id);
        this.activePlayers.push(id);
        this.buffer_queue.push(SerialCmd.ADD_PLAYER);
        this.buffer_queue.push(id);
        this.buffer_queue.push(color[0]);
        this.buffer_queue.push(color[1]);
        this.buffer_queue.push(color[2]);
        this.buffer_queue.push(color[3]);
        this.buffer_queue.push(color[4]);
        this.buffer_queue.push(color[5]);
        this.buffer_len.push(8);
    }

    removePlayer(id) {
        console.log("serial_forward Player Removed " + id);
        this.buffer_queue.push(SerialCmd.REMOVE_PLAYER);
        this.buffer_queue.push(id);
        this.buffer_len.push(2);
        const index = this.activePlayers.indexOf(id);
        if (index > -1) {
            this.activePlayers.splice(index, 1);
        } else {
            console.log("serial_forward Player Remove not found " + id);
        }
    }

    startPlayer(id) {
        console.log("serial_forward Start Player " + id);
    }

    run() {

        this.queue_commands();

        // check gamespeed
        const d = new Date();
        this.time = d.getTime();
        if (this.nextAction > this.time) { return false; }
        if (this.activePlayers.length === 0) { return false; }
        this.nextAction = this.time + this.gamespeedMS;

        // console.log("serial_forward run2 " + d.toUTCString());

        // let trigger_sendNextCommand = false;
        // if (this.buffer_len.length === 0) {
        //     // the previous processing of command queue is finished, the automated send-receive-nextSend... on serial has to be retriggered.
        //     trigger_sendNextCommand = true;
        // }

        //send set of player commands (1per player) and iterate-step command
        this.activePlayers.forEach(playerId => {
            console.log(playerId);
            if (typeof this.playerbuffer_len[playerId] == 'undefined') { return; }
            if (this.playerbuffer_len[playerId].length === 0) { return; }

            var buffer_size = this.playerbuffer_len[playerId].shift();
            this.buffer_len.push(buffer_size);
            for (var i = 0; i < buffer_size; i++) {
                this.buffer_queue.push(this.playerbuffer_queue[playerId].shift());
            }
        });

        this.buffer_queue.push(SerialCmd.ITERATE_STEP);
        this.buffer_len.push(1);

        // if (trigger_sendNextCommand) {
        this.sendNextCommand();
        // console.log("serial_forward run3 retrigger sendNextCommand");
        // }
    }

    queue_commands() {
        // check for new commands (null if no command available)
        var cmd = this.app_mgr.getNextCommand();

        // complete content of command
        if (cmd) {
            var id = cmd.id; // id which player (virtual joystick) sends the command (from 0 to X))
            var command = cmd.command; // push, release, up, down, left, right
            var controller = cmd.controller // left, right (controller of virtual joystick)
            // console.log("==========================================================================");
            // console.log("serial_forward Controller " + controller + " with id: " + id + " sends command: " + command);
            // console.log("pushing Player " + id + " cmd " + command);

            // queue command

            if (typeof this.playerbuffer_queue[id] == 'undefined') {
                this.playerbuffer_queue[id] = [];
            }
            if (typeof this.playerbuffer_len[id] == 'undefined') {
                this.playerbuffer_len[id] = [];
            }
            if (command == 'left') {
                this.playerbuffer_queue[id].push(SerialCmd.DIR_CMD_PLAYER);
                this.playerbuffer_queue[id].push(id);
                this.playerbuffer_queue[id].push('l'.charCodeAt(0));
                this.playerbuffer_len[id].push(3);
            } else if (command == 'right') {
                this.playerbuffer_queue[id].push(SerialCmd.DIR_CMD_PLAYER);
                this.playerbuffer_queue[id].push(id);
                this.playerbuffer_queue[id].push('r'.charCodeAt(0));
                this.playerbuffer_len[id].push(3);
            } else {
                // ignore
                // console.log("serial_forward run_app unhandled command " + id);
                return false;
            }

        }

        return true;
    }
}

module.exports = serial_forward;
