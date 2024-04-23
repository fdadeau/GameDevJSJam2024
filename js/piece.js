import { HEIGHT, WIDTH } from "./app.js";
import { Entity } from "./entity.js";

import { audio } from "./audio.js";


export class Piece extends Entity {

    constructor(x, y, sides) {
        super(x, y);
        this.state = -1;    // -1 : deriving into space, 0 : replaced on the ship, 1 : caught by the player
        this.vecX = 0;
        this.vecY = 0;
        this.angle = 0;
        this.initialX = x+200;
        this.initialY = y-200;
        this.angularSpeed = Math.random() * 0.08 - 0.04;
        this.size = Math.floor(Math.random() * 5 + 2) * 10;
        this.points = [];
        let a = 0;
        for (let i=0; i < sides; i++) {
            this.points.push({x: Math.cos(a), y: Math.sin(a)});
            a += 2 * Math.PI / sides;
        }
    }


    update(dt) {
        super.update(dt);
        this.angle = (this.angle + this.angularSpeed * dt) % 360;
    }


    render(ctx, player) {

        let [x, y] = this.getCoords(player);
        
        if (this.state > 0) {
            x = WIDTH / 2;
            y = HEIGHT / 2;
        }
        else if (this.state == 0) {
            [x,y] = this.getCoords2(player);
        }

        ctx.fillStyle = "lightgrey";
        ctx.strokeStyle = "green";
        if (this.isVisible(x, y, this.size) && this.state !== 0) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.beginPath();
            ctx.lineTo(this.points[0].x * this.size, this.points[0].y * this.size);
            for (let i=0; i <= this.points.length; i++) {
                ctx.lineTo(this.points[i % this.points.length].x * this.size, this.points[i % this.points.length].y * this.size);
            }
            ctx.fill();
            if (this.state > 0) {
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            ctx.restore();
        }
        else if (!this.isVisible(x, y, this.size) && this.state < 0) {
            // indicate direction of the symbol
            let dX = this.x - player.x, dY = this.y - player.y;
            const [x, y] = getPointOnScreen(dX, dY);
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "black";
        }
        
        let [x0, y0] = this.getCoords2(player);
        if (this.isVisible(x0, y0, this.size)) {
            ctx.strokeStyle = "lightgrey";
            ctx.beginPath();
            ctx.lineTo(x0 + this.points[0].x * this.size, y0 + this.points[0].y * this.size);
            for (let i=0; i <= this.points.length; i++) {
                ctx.lineTo(x0 + this.points[i % this.points.length].x * this.size, y0 + this.points[i % this.points.length].y * this.size);
            }
            ctx.stroke();
            if (this.state == 0) {
                ctx.fill();
            }
            ctx.strokeStyle = "black";
        }
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";        
        ctx.lineWidth = 1;
    }


    canBeCaught(player) {
        let dX = this.x - player.x, dY = this.y - player.y;
        return this.state < 0 && player.piece == null && player.speed == 0 && dX*dX + dY*dY <= this.size*this.size;
    }
    canBePlaced(player) {
        let dX = this.initialX - player.x, dY = this.initialY - player.y;
        return this.state > 0 && player.speed == 0 && player.piece == this && dX*dX + dY*dY <= this.size*this.size;
    }

    catchIt(player) {
        this.state = 1; // caught
        player.piece = this;
    }
    placeIt(player) {
        this.state = 0; // placed
        player.piece = null;
        audio.playSound("replace", 1, 0.4, false);
    }


    getCoords2(player) {
        // save old x, y;
        const oldX = this.x, oldY = this.y;
        this.x = this.initialX;
        this.y = this.initialY;
        const r = this.getCoords(player);
        // restore x, y
        this.x = oldX;
        this.y = oldY;
        return r;
    }
}




function getPointOnScreen(vx, vy) {
    let r = segmentsIntersection(WIDTH/2, HEIGHT/2, WIDTH/2 + vx, HEIGHT/ 2 + vy, 0, 0, WIDTH, 0) 
        || segmentsIntersection(WIDTH/2, HEIGHT/2, WIDTH/2 + vx, HEIGHT/ 2 + vy, WIDTH, 0, WIDTH, HEIGHT) 
        || segmentsIntersection(WIDTH/2, HEIGHT/2, WIDTH/2 + vx, HEIGHT/ 2 + vy, 0, HEIGHT, WIDTH, HEIGHT)
        || segmentsIntersection(WIDTH/2, HEIGHT/2, WIDTH/2 + vx, HEIGHT/ 2 + vy, 0, 0, 0, HEIGHT);    
    return r || [-10, -10];
}


function segmentsIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    // Calculate determinant
    let determinant = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (determinant === 0) {
        return null; // Segments are parallel or coincident, no intersection
    }

    // Calculate parameters for the line equations
    let s = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / determinant;
    let t = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / determinant;

    // Check if intersection point is within the segment bounds
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        let intersectionX = x1 + s * (x2 - x1);
        let intersectionY = y1 + s * (y2 - y1);
        return [intersectionX, intersectionY];
    } else {
        return null; // Intersection point is outside the segment bounds
    }
}
