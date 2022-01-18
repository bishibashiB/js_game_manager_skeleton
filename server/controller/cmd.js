class cmd_queue {
    constructor(id, controller, command) {
        this.id = id;
        this.controller = controller;
        this.command = command;
    }
}
module.exports = cmd_queue;