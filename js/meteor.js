import { HEIGHT, WIDTH } from "./app.js";
import { Entity } from "./entity.js";

import { data } from "./loader.js";

const DEBUG = true;

export class Meteor extends Entity {

    constructor(x, y) {
        super(x, y);
        this.vecX = Math.random() * 2 - 1;
        this.vecY = Math.random() * 2 - 1;
        this.speed = Math.random() * 0.1 + 0.2;
        this.angle = 0;
        this.angularSpeed = Math.random() * 0.08 - 0.04;
        this.radius = Math.floor(Math.random() * 5) * 10 + 30;
        this.size = this.radius * 2;
        this.sprite = Math.random() * 8 | 0;
    }


    update(dt) {
        super.update(dt);
        this.angle = (this.angle + this.angularSpeed * dt) % 360;
    }


    render(ctx, player) {

        let [x, y] = this.getCoords(player);
        
        ctx.fillStyle = "lightgrey";
        if (this.isVisible(x, y, this.size)) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.drawImage(data["meteor"], 64 * this.sprite, 0, 64, 64, -this.radius, -this.radius, this.size, this.size);
            ctx.restore();

            if (DEBUG) {
                ctx.strokeStyle = "red";
                ctx.arc(x, y, this.radius*0.8, 0, Math.PI*2);
                ctx.stroke();
            }
        }
        ctx.fillStyle = "black";        

    }

    collidesWith(player) {
        let [x, y] = this.getCoords(player);
        let dX = x - WIDTH / 2;
        let dY = y - HEIGHT / 2;
        let dist = this.radius + player.size;
        return dY*dY + dX*dX <= dist * dist;
    }


}