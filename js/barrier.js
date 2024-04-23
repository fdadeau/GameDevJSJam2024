
import { Entity } from "./entity.js";

const DELAY = 100;

export class Barrier extends Entity {
    
    constructor(x, y) {
        super(x, y);
        this.delay = DELAY;
        this.width = 200;
        this.height = 20;
        this.generatePoints();
        console.log(this.points);
    }

    update(dt) {
        super.update(dt);
        this.delay -= dt;
        if (this.delay < 0) {
            this.delay = DELAY;
            this.generatePoints();
        }
    }

    render(ctx, player) {
        ctx.strokeStyle = "lightblue";
        const [x,y] = this.getCoords(player);
        for(let t of this.points) {
            ctx.beginPath();
            t.forEach((p, i) => {
                if (i == 0) {
                    ctx.moveTo(x + p[0] * this.width, y + this.height * p[1]);
                }
                else {
                    ctx.lineTo(x + p[0] * this.width, y + (i%2 == 0 ? 1 : -1) * this.height * p[1]);
                } 
            });
            ctx.closePath();
            ctx.stroke();
        }
        ctx.strokeStyle = "black";
    }

    generatePoints() {
        const nb_lines = Math.random() * 3 | 0 + 2;
        this.points = [];
        while (this.points.length < nb_lines) {
            const nbPtsOnLine = Math.random() * 8 | 0 + 10;
            const h = Math.random();
            const t = [];
            for (let i=1; i <= nbPtsOnLine; i++) {
                if (i == 1) {
                    t.push([0, h]);
                }
                else if (i == nbPtsOnLine) {
                    t.push([1, h]);
                }
                else {
                    t.push([Math.random(), Math.random()]);
                }
            }
            t.sort((v1,v2) => v1[0] - v2[0]);
            this.points.push(t);
        }
    }

}