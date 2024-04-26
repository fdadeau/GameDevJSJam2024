/****
 * Singleton object describing the Graphical User Interface
 */

import { Game } from "./game.js";

import { WIDTH, HEIGHT } from "./app.js";

const STATE = { LOADING: -999, TITLE_SCREEN: 0, RUNNING: 1, PAUSE: 10, GAMEOVER: 999 }

import { audio } from "./audio.js";

import { data } from "./loader.js";

class _GUI {

    constructor() {
        /** @type {number} Current state of the GUI */
        this.state = STATE.LOADING;
        /** @type {Game} Game instance */
        this.game = null;
        /** @type {string} debug info */
        this.debug = null;

        this.char = { angle: 0, delay: 120, frame: 4, boostTime: 0, waitTime: 2000 };
    };

    /**
     * Updates the GUI
     * @param {number} dt Time elpsed since last update
     */
    update(dt) {
        if (this.state == STATE.TITLE_SCREEN) {
            if (this.char.boostTime > 0) {
                this.char.boostTime -= dt;
                this.char.delay -= dt;
                if (this.char.angle < 80) {
                    this.char.angle += 0.1 * dt;
                    if (this.char.angle >= 80) {
                        this.char.angle = 80;
                    }
                }
                if (this.char.delay < 0) {
                    this.char.delay = 120;
                    this.char.frame = (this.char.frame + 1) % 4;
                }
                if (this.char.boostTime <= 0) {
                    this.char.waitTime = 1600;
                    this.char.boostTime = 0;
                    this.char.frame = 4;
                }
            }
            else {
                this.char.angle -= 0.1 * dt;
                if (this.char.angle < 0) {
                    this.char.angle = 0;
                }
                this.char.waitTime -= dt;
                if (this.char.waitTime < 0) {
                    this.char.boostTime = 3000;
                }
            }
            return;
        }
        if (this.state == STATE.COMMANDS) {
            this.char.delay -= dt;
            if (this.char.delay < 0) {
                this.char.delay = 120;
                this.char.frame = (this.char.frame + 1) % 4;
            }
            return;
        }
        if (this.state >= STATE.RUNNING) {
            this.game.update(dt);
            if (this.game.over) {
                this.state = STATE.GAMEOVER;
                audio.ambiance.pause();
            }
        }
    }

    /**
     * Renders the GUI
     * @param {CanvasRenderingContext2D} ctx Drawing area
     */
    render(ctx) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT)
        if (this.debug) {
            ctx.textAlign = "left";
            ctx.font = "10px arial";
            ctx.fillText("DEBUG: " + this.debug, 1, 10);
        }

        if (this.state == STATE.TITLE_SCREEN) {
            ctx.textAlign = "center";
            ctx.font = "18px arial";
            ctx.drawImage(data["title"], WIDTH / 2 - 300, HEIGHT/ 2 - 100, 600, 80);
            ctx.drawImage(data["logo"], WIDTH - 140, HEIGHT - 50, 120, 40);
            ctx.save();
            ctx.translate(WIDTH / 2, HEIGHT / 2 + 30);
            ctx.rotate(this.char.angle * Math.PI / 180);
            ctx.drawImage(data["fly"], 0, 64*this.char.frame, 64, 64, -32, -32, 64, 64);
            ctx.restore();
            ctx.fillText("Manage your power to retrieve pieces of the spaceship.", WIDTH / 2, HEIGHT / 2 + 100);
            ctx.fillText("Click to start", WIDTH / 2, HEIGHT / 2 + 200);
            return;
        } 

        if (this.state == STATE.COMMANDS) {
            this.commands(ctx);
            return;
        }

        // draw scene
        if (this.state >= STATE.RUNNING) {
            this.game.render(ctx);
            if (this.state === STATE.PAUSE) {
                ctx.textAlign = "center";
                ctx.font = "18px arial";
                ctx.fillText("Game paused. Press P to resume.", WIDTH / 2, HEIGHT / 2);
            }
            else if (this.state === STATE.GAMEOVER) {
                ctx.textAlign = "center";
                ctx.font = "18px arial";
                ctx.fillStyle = "white";
                if (this.game.lost) {
                    ctx.fillText("Game over, you lost.", WIDTH / 2, HEIGHT / 2);
                }
                else {
                    ctx.fillText("You win, congratulations.", WIDTH / 2, HEIGHT / 2);
                }
                ctx.fillText("Click to restart.", WIDTH / 2, HEIGHT / 2 + 100);
            }
        }
    }

    start() {
        if (this.state === STATE.LOADING || this.state == STATE.GAMEOVER) {
            this.state = STATE.TITLE_SCREEN;
            this.game = new Game();
            audio.playMusic("sndGame", 0.6);
        }
    }


    commands(ctx) {
        ctx.textAlign = "center";
        ctx.font = "24px arial";
        ctx.fillText("How to play", WIDTH / 2, 50)
        ctx.textAlign = "left";
        const y0 = 100;
        ctx.font = "16px arial";

        ctx.drawImage(data["meteor"], 0, 0, 64, 64, 200, 400, 64, 64);
        ctx.drawImage(data["fly"], 0, 64*this.char.frame, 64, 64, 20, y0 - 20, 58, 58);
        ctx.drawImage(data["bonus"], 15*64, 0, 64, 64, 20, 270, 32, 32);
        ctx.drawImage(data["commands1"], 540, 140, 170, 120);
        ctx.drawImage(data["commands2"], 500, 300, 120, 90);
        ctx.drawImage(data["commands3"], 650, 320, 80, 70);
        

        ctx.fillText("Your spaceship is broken!", 90, y0);
        ctx.fillText("Help RAWD-E (Repair And Wander Droid) to find and bring back the pieces of the ship.", 90, y0+30);

        ctx.fillText("Press down mouse left button and adjust the power by moving the mouse.", 20, y0+80);
        ctx.fillText("An orange line will show the direction and force applied to the movement.", 20, y0+110);
        ctx.fillText("Release the button to propel RAWD-E through space.", 20, y0+140);

        ctx.fillText("Propulsion costs power but it can be regained automatically or by picking up bonuses. ", 60, y0 + 190);

        ctx.fillText("Stop RAWD-E on a ship fragment to take it with you.", 20, y0 + 240);
        ctx.fillText("Bring the fragment to its ship hole, and stop on it to repair the ship. ", 20, y0 + 270);
        ctx.fillText("→", 630, y0+250);

        ctx.fillText("Your time is limited and the place is full of meteors, so be quick, but be careful.", 20, y0+320);

        ctx.textAlign = "center";
        ctx.font = "20px arial";
        ctx.fillText("Ready ? Click to start! ", WIDTH / 2, HEIGHT - 20);

    }


    /************************************************
     *                  GUI INTERACTIONS            *
     ************************************************/

    /**
     * Key down (press) event captured
     * @param {KeyboardEvent} e the keyboard event that has been captured
     */
    keydown(e) {
        switch (e.code) {
            case "KeyP":
                if (this.state !== STATE.PAUSE) {
                    this.state = STATE.PAUSE;
                }
                else if (this.state === STATE.PAUSE) {
                    this.state = STATE.RUNNING;
                }
                break;
            
        }
    }
    /**
     * Key up (release) event captured
     * @param {KeyboardEvent} e the keyboard event that has been captured
     */
    keyup(e) {
        
    }
    click(x,y) {
     //   this.debug = `click at ${x},${y}`;

    }
    dblclick(x, y) {
      //  this.debug = `dblclick move at ${x},${y}`;
    }
    mousemove(x, y) {
        if (this.state == STATE.RUNNING) {
          this.game.mouseMove(x, y);
        }
    }
    mousedown(x, y) {
        if (this.state == STATE.TITLE_SCREEN) {
            this.state = STATE.COMMANDS;
        }
        else if (this.state == STATE.COMMANDS) {
            this.state = STATE.RUNNING;
        }
        else if (this.state == STATE.RUNNING) {
            this.game.mouseDown(x, y);
        }
        else if (this.state == STATE.GAMEOVER) {
            this.start();
        }
    }
    mouseup(x, y) {
        if (this.state == STATE.RUNNING) {
            this.game.mouseUp(x, y);
        }
    }
}

const GUI = new _GUI();

export default GUI;