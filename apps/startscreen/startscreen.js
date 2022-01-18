class startscreen {
    constructor(app_mgr, viewcontroller, gamespeedMS, sizeX, sizeY) {
        this.app_mgr = app_mgr;
        this.viewcontroller = viewcontroller;
        this.x = 0;
        this.y = 0;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.gamespeedMS = gamespeedMS;
        this.blink = true;
        this.app_mgr.setMaxPlayer(1);
    }

    addPlayer(id)   {}
    removePlayer(id){}
    startPlayer(id) {}

    run() {
        // check gamespeed
        this.date = (new Date).getTime();
        if(this.nextAction > this.date) { return false; }
        this.nextAction = this.date + this.gamespeedMS;

        // decide if view should be updated
        if(this.run_app()) {  
            // webview is live
            // table need show call
            this.viewcontroller.show();  
        }       
    }

    run_app() {
        if(this.blink) {
            this.viewcontroller.setColor(7,6,255,0,0);
            this.viewcontroller.setColor(8,6,0,255,0);
            this.viewcontroller.setColor(7,7,0,0,255);
            this.viewcontroller.setColor(8,7,255,127,0);
        } else {
            this.viewcontroller.reset();
        }
        this.blink = !this.blink;
        return true;
    }
}
module.exports = startscreen;