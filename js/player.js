
import { HEIGHT, WIDTH } from "./app.js";
import { audio } from "./audio.js";
import { Entity } from "./entity.js";
import { WORLD_H, WORLD_W } from "./game.js";
import { data } from "./loader.js";

const SIZE = 20;


const DEBUG = false;

// Player's animation frames from its spritesheet 
const ANIMATION_IDLE = [4];
const ANIMATION_FIRE = [0, 1, 2, 3];
// Delay between animations
const ANIMATION_DELAY = 80;

// In-game parameter: automatic regain of power (speed)
const POWER_REGAIN_BY_MS = 0.0001;
// Acceleration max time 
const ACCELERATION_BY_POWER = 2000;
// Player acceleration
const ACCELERATION = 0.001;
// Player breaking speed 
const BREAKING_SPEED = 0.0004;
// Angular speed (deg/ms)
const ANGLE_SPEED = 0.05;
const MAX_ANGLE = 80;

const MAX_LEN = 200;

export class Player extends Entity {

    constructor(x, y) {
        super(x, y);
        // direction/orientation
        this.vecX = 0;
        this.vecY = 1;
        // size 
        this.size = SIZE;
        // speed 
        this.speed = 0;
        this.animation = { frames: ANIMATION_IDLE, delay: ANIMATION_DELAY, step: 0 };
        this.spritesheet = data["fly"];
        // current player's power (% of the max)
        this.power = 1;
        // current power decrease (% of the max -- always <= this.power)
        this.prevision = { vecX: 0, vecY: 0, force: 0 };
        // maximal power units
        this.maxPower = 200;
        // 
        this.boosterTime = 0;
        // current character inclination
        this.angle = 0; 

        // current piece
        this.piece = null;

        this.alive = true;
        this.debris = [];
    }

    setVectorAndSpeed(vx, vy, f) {
        if (!this.alive) return;
        this.prevision.vecX = vx;
        this.prevision.vecY = vy;
        this.prevision.force = (f < this.power) ? f : this.power;
        if (this.speed == 0) {
            this.vecX = vx;
            this.vecY = vy;
        }
    }

    boost() {
        if (this.alive && this.angle == 0) {
            this.vecX = this.prevision.vecX;
            this.vecY = this.prevision.vecY;
            this.power = this.power - this.prevision.force;
            this.boosterTime = ACCELERATION_BY_POWER * this.prevision.force;
            this.resetAnimation(ANIMATION_FIRE);
            audio.playSound("rocketFire", 1, 0.5, false);
        }
        this.prevision.force = 0;
    }

    die() {
        this.alive = false;
        this.prevision.vecX = this.prevision.vecY = this.prevision.force = 0;
        audio.playSound("impact", 1, 0.5, false);
        audio.playSound("gameover", 2, 0.6, false);
        while (this.debris.length < 30) {
            this.debris.push({
                x: WIDTH / 2,
                y: HEIGHT / 2,
                vecX: Math.random() * 2 - 1,
                vecY: Math.random() * 2 - 1,
                size: Math.floor(Math.random() * 3 + 5),
                speed: Math.random() + 1,
                round: Math.random() < 0.5 ? 0 : 1
            });
        }
    }

    update(dt) {
        if (!this.alive) {
            this.debris.filter(d => {
                d.x += d.vecX * d.speed * dt;
                d.y += d.vecY * d.speed * dt;
                return d.x > -10 && d.x < WIDTH + 10 && d.y > -10 && d.y < HEIGHT + 10;
            });
            return;
        };
        this.boosterTime -= dt;
        if (this.boosterTime > 0) {
            this.speed += ACCELERATION * dt;

            this.angle += 2 * ANGLE_SPEED * dt;
            if (this.angle > MAX_ANGLE) {
                this.angle = MAX_ANGLE;
            }
        }
        else {
            this.speed -= BREAKING_SPEED * dt;
            if (this.speed < 0) {
                this.speed = 0; 
            }
    
            this.boosterTime = 0;
            if (this.animation.frames !== ANIMATION_IDLE) {
                this.resetAnimation(ANIMATION_IDLE);
            }

            this.angle -= ANGLE_SPEED * dt;
            if (this.angle < 0) {
                this.angle = 0;
            }
        }
        super.update(dt);
        this.x = this.x % WORLD_W;
        if (this.x < 0) {
            this.x += WORLD_W;
        }
        this.y = this.y % WORLD_H;
        if (this.y < 0) {
            this.y += WORLD_H;
        }
        // automatic power regain
        this.power += POWER_REGAIN_BY_MS * (this.power + 0.1) * dt;
        if (this.power > 1) {
            this.power = 1;
        }

        this.updateAnimation(dt);
    }


    updateAnimation(dt) {
        this.animation.delay -= dt;
        if (this.animation.delay < 0) {
            this.animation.step = (this.animation.step + 1) % this.animation.frames.length;
            this.animation.delay = ANIMATION_DELAY;
        }
    }

    resetAnimation(anim) {
        this.animation.frames = anim;
        this.animation.step = 0;
        this.delay = ANIMATION_DELAY;
    }

    render(ctx) {
        
        if (!this.alive) {
            ctx.fillStyle = "lightblue";
            this.debris.forEach(d => {
                if (d.round) {
                    ctx.beginPath();
                    ctx.arc(d.x, d.y, d.size, 0, 2*Math.PI);
                    ctx.fill();
                }
                else {
                    ctx.fillRect(d.x, d.y, d.size, d.size);
                }
            });
            ctx.fillSyle = "black";
            return;
        }


        if (this.prevision.force > 0) {
            ctx.fillText(`dX = ${this.prevision.vecX}, dY = ${this.prevision.vecY}, force = ${this.prevision.force}`, 10, 400);
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 4;
            ctx.moveTo(WIDTH/2, HEIGHT/2);
            ctx.lineTo(WIDTH/2 + this.prevision.vecX * MAX_LEN * this.prevision.force, HEIGHT/2 + this.prevision.vecY * MAX_LEN * this.prevision.force);
            ctx.stroke();
        }

        let angle = getAngle(this.vecX, this.vecY);
        angle += (this.vecX > 0) ? this.angle : -this.angle;
        ctx.save();
        ctx.translate(WIDTH/2, HEIGHT/2);
        ctx.rotate(angle * Math.PI / 180);
        if (this.vecX < 0) {
            ctx.scale(1,-1);
        }
        ctx.drawImage(data["fly"], 0, 64 * this.animation.frames[this.animation.step], 64, 64, -32, -32, 58, 58);
        ctx.restore();
        // display player hud
        ctx.fillStyle = ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.font = "12px arial";
        ctx.fillText("Power", 8, 16);
        ctx.fillStyle = "#00AA00";
        ctx.fillRect(50, 5, MAX_LEN * this.power, 14);
        ctx.strokeRect(50, 5, MAX_LEN, 14);
        if (this.prevision.force > 0) {
            ctx.fillStyle = "orange";
            ctx.fillRect(50, 5, MAX_LEN * this.prevision.force, 14);
        }
        // debug hitbox 
        if (DEBUG) {
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.arc(WIDTH/2, HEIGHT/2, SIZE, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
    }

    sees(x, y, size) {
        return x >= this.x - WIDTH/2 - size && x <= this.x + WIDTH/2 + size && y >= this.y - HEIGHT/2 - size && y <= this.y + HEIGHT/2 + size;
    }
}

function getAngle(vecX, vecY) {
    var angle = Math.atan2(vecY, vecX);   //radians
    // you need to devide by PI, and MULTIPLY by 180:
    var degrees = 180*angle/Math.PI;  //degrees
    return (360+Math.round(degrees))%360; //round number, avoid decimal fragments
}
