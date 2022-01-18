class player {
    constructor(socket_id, id) {
        this.socket_id = socket_id;
        this.id = id;
        this.username = "";
        this.queuePos = -1;
    }
    setQueuePosition(queuePos) {
        this.queuePos = queuePos;
    }

    reduceQueuePos(x) {
        this.queuePos-=x;
    }

    getQueuePosition() {
        console.log("player getQueuePosition " + this.queuePos);
        return this.queuePos;
    }

    setUsername(name) {
        this.username = name;
    }

    getUsername() {
        return this.username;
    }
}
module.exports = player;
