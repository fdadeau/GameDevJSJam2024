/**
 * Game class 
 */
// dimensions of the world
export const WORLD_W = 8000, WORLD_H = 5000;
// 
const NB_OBSTACLES = 100; 
const NB_BONUSES = 20;

// trail size to reach maximal power
const MAX_LEN = 200;

import { Player } from "./player.js";
import { Star } from "./star.js";
import { Barrier } from "./barrier.js";

import { Bonus } from "./bonus.js";
import { Piece } from "./piece.js";
import { Meteor } from "./meteor.js";



export class Game {

    constructor() {
        // Small character 
        this.player = new Player(WORLD_W/2,WORLD_H/2);
        // 
        this.obstacles = [];
        while (this.obstacles.length < NB_OBSTACLES) {
            this.obstacles.push(new Star(Math.random() * WORLD_W, Math.random() * WORLD_H));
        }
        this.barrier = new Barrier(WORLD_W / 2, WORLD_H / 2 + 200);
        this.bonuses = [];
        this.bonuses.push(new Bonus(WORLD_W/2 + 100, WORLD_H/2+100));
        while (this.bonuses.length < NB_BONUSES) {
            this.bonuses.push(new Bonus(Math.random() * WORLD_W, Math.random() * WORLD_H));
            console.log(this.bonuses[this.bonuses.length-1].x, this.bonuses[this.bonuses.length-1].y);
        }
        this.piece = new Piece(WORLD_W / 2 - 200, WORLD_H / 2 + 200, 5);
        this.meteor = new Meteor(WORLD_W / 2 - 200, WORLD_H / 2 - 200);
        //

        this.down = { x: -1, y: -1 };
        this.mouse = { x: 0, y: 0 };
    }

    /**
     * Update of the game
     * @param {number} dt elapsed time since last update
     */
    update(dt) {
        this.player.update(dt);
        this.obstacles.forEach(o => o.update(dt));
        this.barrier.update(dt);
        this.bonuses = this.bonuses.filter(b => {
            b.update(dt);
            if (b.collidesWith(this.player)) {
                this.player.power = 1;
                return false;
            }
            return true;
        });
        this.meteor.update(dt);
        if (this.meteor.collidesWith(this.player)) {
            this.player.die();
            return;
        }
        
        if (this.piece.state < 0) {
            this.piece.update(dt);
        }
        if (this.piece.canBeCaught(this.player)) {
            this.piece.catchIt(this.player);
        }
        else if (this.piece.canBePlaced(this.player)) {
            this.piece.placeIt(this.player);
        }
    }

    /**
     * Renders the game
     * @param {CanvasRenderingContext2D} ctx the context to be drawn
     */
    render(ctx) {
        ctx.font = "10px arial";
        ctx.textAlign = "left";
        ctx.fillText(`Player : x = ${this.player.x | 0}, y = ${this.player.y | 0}`, 5, 490);
        this.obstacles.forEach(o => o.render(ctx, this.player));
        this.bonuses.forEach(b => b.render(ctx, this.player));
        this.barrier.render(ctx, this.player);
        this.piece.render(ctx, this.player);
        this.meteor.render(ctx, this.player);
        this.player.render(ctx);
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