class viewcontroller {
    constructor(view) {
        this.view = view;
    }

    reset() {
        console.log("Reset View (web)")
        this.view.setMatrixColor(0, 0, 0);
    }

    setMatrixColor(r, g, b) {
        console.log("Set Color " + r + ", " + g + ", " + b);
        this.view.setMatrixColor(r, g, b);
    }

    setColor(x, y, r, g, b) {
        // console.log("Set Color " + x + ", "+ y + ", "+  r + ", "+ g + ", "+ b );
        this.view.setColor(x, y, r, g, b);
    }

    show() {
        // this.view.show();
    }

    setMatrix(color_array) {
        console.log(color_array);
    }
}
module.exports = viewcontroller;