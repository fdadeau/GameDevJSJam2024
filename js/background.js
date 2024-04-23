
import { WIDTH, HEIGHT } from "app.js";

class Background {


    constructor() {

    }

    update(dt) {

    } 

    render(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

}