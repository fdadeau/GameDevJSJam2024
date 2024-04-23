
import data from "./assets.js";
import { Entity } from "./entity.js";

const DELAY = 100;

const SIZE = 32, NB_FRAMES = 30;

export class Bonus extends Entity {
    
    constructor(x, y) {
        super(x, y);
        this.delay = DELAY;
        this.currentFrame = 0;
    }

    update(dt) {
        super.update(dt);
        this.delay -= dt;
        if (this.delay < 0) {
            this.delay = DELAY;
            this.currentFrame = (this.currentFrame + 1) % NB_FRAMES;
        }
    }

    render(ctx, player) {
        const [x,y] = this.getCoords(player);
        ctx.drawImage(data["bonus"], 64*this.currentFrame, 0, 64, 64, x, y, SIZE, SIZE);        
    }

    collidesWith(player) {
        return player.x >= this.x && player.x <= this.x + SIZE && player.y >= this.y && player.y <= this.y + SIZE;
    }

}