/**
 * Game class 
 */
// dimensions of the world
export const WORLD_W = 8000, WORLD_H = 5000;
// 

import { WIDTH } from "./app.js";

const NB_STARS = 200; 
const NB_BONUSES = 20;

// trail size to reach maximal power
const MAX_LEN = 200;

import { Player } from "./player.js";
import { Star } from "./star.js";

import { Bonus } from "./bonus.js";
import { Piece, Spaceship } from "./piece.js";
import { Meteor } from "./meteor.js";

import { audio } from "./audio.js";

const TIME = 300;

export class Game {

    constructor() {
        // Small robot character
        this.player = new Player(WORLD_W/2, WORLD_H/2);
    
        this.spaceship = new Spaceship(WORLD_W / 2, WORLD_H / 2);
        // 
        this.stars = [];
        while (this.stars.length < NB_STARS) {
            this.stars.push(new Star(Math.random() * WORLD_W, Math.random() * WORLD_H));
        }
        
        this.bonuses = [];
        this.bonuses.push(new Bonus(WORLD_W/2 + 100, WORLD_H/2+100));
        while (this.bonuses.length < NB_BONUSES) {
            this.bonuses.push(new Bonus(Math.random() * WORLD_W, Math.random() * WORLD_H));
        }

        const W = WORLD_W / 2, H = WORLD_H / 2;
        const PLACES = [ 
            [W-370,H-20,30], [W-180,H+10,60], [W+60,H+10,40], [W+210,H-0,30], 
            [W-80,H+120,50], [W+250,H+120,40], [W+420,H+100,30]
        ];
        this.pieces = [];
        for (let sides = 3; sides <= 9; sides++) {
            let p0;
            let xy = PLACES.splice(Math.random() * PLACES.length | 0, 1);
            console.log(xy);
            //do {
                p0 = new Piece(WORLD_W, WORLD_H, xy[0], sides)
            //}
            //while (false && this.pieces.some(p => (p.initialX-p0.initialX)*(p.initialY-p0.initialY) <= (2*p.size+p0.size)*(2*p.size+p0.size)));
            this.pieces.push(p0);
        }

        this.meteors = [];
        while (this.meteors.length < 10) {
            this.meteors.push(new Meteor(WORLD_W * Math.random(), WORLD_H * Math.random()));
        }
        
        this.time = TIME * 1000;

        this.over = false;
        this.lost = false;

        this.down = { x: -1, y: -1 };
        this.mouse = { x: 0, y: 0 };
    }

    /**
     * Update of the game
     * @param {number} dt elapsed time since last update
     */
    update(dt) {

        if (!this.over) {
            this.time -= dt;
            if (this.time <= 0) {
                this.time = 0;
                this.over = true;
                //this.lost = true;
                audio.playSound("victory");
            }
        }

        this.player.update(dt);
        
        this.stars.forEach(o => o.update(dt));
        
        this.bonuses = this.bonuses.filter(b => {
            b.update(dt);
            if (b.collidesWith(this.player)) {
                this.player.power = 1;
                audio.playSound("bonusSnd");
                return false;
            }
            return true;
        });

        this.meteors.forEach(m => {
            m.update(dt);
            if (this.player.alive && m.collidesWith(this.player)) {
                this.player.die();
                this.over = true;
                this.lost = true;
            }
        });
        
        this.pieces.forEach(p => {
            if (p.state < 0) {
                p.update(dt);
            }
            if (p.canBeCaught(this.player)) {
                p.catchIt(this.player);
            }
            else if (p.canBePlaced(this.player)) {
                p.placeIt(this.player);
            }
        });

        if (this.pieces.every(p => p.state == 0)) {
            this.over = true;
            audio.playSound("victory");
        }
    }

    /**
     * Renders the game
     * @param {CanvasRenderingContext2D} ctx the context to be drawn
     */
    render(ctx) {
        ctx.font = "12px arial";
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        let t = Math.floor(this.time / 1000);
        ctx.strokeText(`${Math.floor(t / 60)}:${t % 60 < 10 ? 0 : ''}${t % 60}`, WIDTH-10, 18);
        ctx.fillText(`${Math.floor(t / 60)}:${t % 60 < 10 ? 0 : ''}${t % 60}`, WIDTH-10, 18);
        ctx.textAlign = "left";
        //ctx.fillText(`Player : x = ${this.player.x | 0}, y = ${this.player.y | 0}`, 5, 490);
        this.stars.forEach(o => o.render(ctx, this.player));
        this.spaceship.render(ctx, this.player);
        this.pieces.forEach(p => p.render(ctx, this.player));
        this.bonuses.forEach(b => b.render(ctx, this.player));
        this.player.render(ctx);
        this.meteors.forEach(m => m.render(ctx, this.player));
    }

    mouseDown(x, y) {
        this.down.x = x;
        this.down.y = y;
    }
    mouseMove(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        if (this.down.x >= 0) {
            const dX = x - this.down.x;
            const dY = y - this.down.y;
            if (dX !== 0 || dY !== 0) {
                const len = Math.sqrt(dX*dX + dY*dY);
                this.player.setVectorAndSpeed(-dX / len, -dY / len, Math.min(1, len / MAX_LEN));
            }
        }
    }
    mouseUp(x, y) {
        this.player.boost();
        this.down.x = this.down.y = -1;
    }


}