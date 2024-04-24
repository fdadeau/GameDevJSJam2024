/****
 * Singleton object describing the Graphical User Interface
 */

import { Game } from "./game.js";

import { WIDTH, HEIGHT } from "./app.js";

const STATE = { LOADING: -999, TITLE_SCREEN: 0, RUNNING: 1, PAUSE: 10, GAMEOVER: 999 }

import { audio } from "./audio.js";

class _GUI {

    constructor() {
        /** @type {number} Current state of the GUI */
        this.state = STATE.LOADING;
        /** @type {Game} Game instance */
        this.game = null;
        /** @type {string} debug info */
        this.debug = null;
    };

    /**
     * Updates the GUI
     * @param {number} dt Time elpsed since last update
     */
    update(dt) {
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
            // this.state = STATE.TITLE_SCREEN;
            this.state = STATE.RUNNING;
            this.game = new Game();
            audio.playMusic("sndGame", 0.6);
        }
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
        if (this.state == STATE.RUNNING) {
            this.game.mouseDown(x, y);
        }
    }
    mouseup(x, y) {
        if (this.state == STATE.RUNNING) {
            this.game.mouseUp(x, y);
        }
        else if (this.state == STATE.GAMEOVER) {
            this.start();
        }
    }
}

const GUI = new _GUI();

export default GUI;