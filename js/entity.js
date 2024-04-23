
import { WIDTH, HEIGHT } from "./app.js";
import { WORLD_W, WORLD_H } from "./game.js";

export class Entity {
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vecX = 0;
        this.vecY = 0.
        this.speed = 0;
    }

    update(dt) {
        this.x = (this.x + this.vecX * this.speed * dt) % WORLD_W;
        this.y = (this.y + this.vecY * this.speed * dt) % WORLD_H;
    }

    render(ctx) {

    }

    getCoords(player) {
        const x0 = player.x - WIDTH / 2;
        const y0 = player.y - HEIGHT / 2;
        let x = this.x - x0, y = this.y - y0;
        if (x0 < 0 && x > x0 + WORLD_W) {
            x -= WORLD_W;
        }
        if (y0 < 0 && y > y0 + WORLD_H) {
            y -= WORLD_H;
        }
        return [x,y];
    }

    isVisible(x, y, size) {
        return x >= -size*2 && x <= WIDTH+size*2 && y >= -size && y <= HEIGHT + size*2;
    }


}