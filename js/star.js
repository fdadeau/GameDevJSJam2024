
import { Entity } from "./entity.js";

const DELAY = 120;

export class Star extends Entity {
    
    constructor(x, y) {
        super(x, y);
        this.delay = DELAY;
        this.changeSize();
    }

    update(dt) {
        super.update(dt);
        this.delay -= dt;
        if (this.delay < 0) {
            this.delay = DELAY;
            this.changeSize();
        }
    }

    render(ctx, player) {
        const [x,y] = this.getCoords(player);
        if (this.isVisible(x, y, this.size)) {
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "black";
        }
    }

    changeSize() {
        let s;
        do {
            s = Math.random() * 3 + 1;
        }
        while (s == this.size);
        this.size = s;
    }


}