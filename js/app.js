import { preload, data } from "./loader.js";

import GUI from "./gui.js";

export const WIDTH = 800, HEIGHT = 500;     // should be a ratio of 16/10

/**
 *  Application 
 *  - loads resources 
 *  - starts GUI when ready
 */
document.addEventListener("DOMContentLoaded", function() {

    /** @type {HTMLCanvasElement} Canvas */
    const CVS = document.querySelector("canvas");
    /** @type {CanvasRenderingContext2D} Canvas 2D context */
    const CXT = CVS.getContext("2d");
    CXT.textAlign = "center";
    CXT.verticalAlign = "middle";
    CXT.font = "20px arial";
    CXT.fillStyle = "white";
    
    /** @type { boolean } true if all resources have been successfully loaded */ 
    let loaded = false;

    // start preload
    preload(onLoad).catch(onError);
    
    /**
     * Callback invoked each time a resource has been loaded. 
     * @param {number} current number of loaded resources 
     * @param {number} total number of expected resources
     * @returns 
     */
    function onLoad(current, total) {
        CXT.clearRect(0, 0, WIDTH, HEIGHT);
        // loading not yet completed
        if (current < total) {
            CXT.fillText(`Loading resources... (${(current / total) / 100 | 0}%)`, WIDTH / 2, HEIGHT * 0.5);
            return;
        }
        // loading complete!
        loaded = true;
        //CXT.drawImage(data["logoGGJ"], WIDTH - 130, HEIGHT - 130, 120, 120)
        CXT.fillText(`Game ready. Click to start.`, WIDTH / 2, HEIGHT * 0.5);
    }
    function onError(err) {
        CXT.clearRect(0, 0, WIDTH, HEIGHT);
        CXT.textAlign = "center";
        CXT.fillText("Unable to load resource: " + err, WIDTH / 2, HEIGHT * 0.4);
        CXT.fillText("Solve the problem to start the game.", WIDTH / 2, HEIGHT * 0.6);
    }

    // last update
    let lastUpdate = Date.now();
    // game loop
    function mainloop() {
        requestAnimationFrame(mainloop);
        let now = Date.now();
        const dT = now - lastUpdate;
        lastUpdate = now;
        GUI.update(dT);
        GUI.render(CXT);
    }


    /** Event listeners **/
    CVS.addEventListener("click", function(e) {
        if (!loaded) {
            return;
        }
        if (GUI.state < 0) {
          //  goFullScreen();
            GUI.start();
            mainloop();
            return;
        }
        const rect = CVS.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (CVS.width / rect.width) | 0; 
        const y = (e.clientY - rect.top) * (CVS.height / rect.height) | 0;
        GUI.click(x, y);
    });
    document.addEventListener("dblclick", function(e) {
        if (e.target !== CVS && !document.fullscreenElement) {
            goFullScreen();
        }
    });
    CVS.addEventListener("mousedown", function(e) {
        const rect = CVS.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (CVS.width / rect.width) | 0; 
        const y = (e.clientY - rect.top) * (CVS.height / rect.height) | 0;
        GUI.mousedown(x, y);
    });
    CVS.addEventListener("mouseup", function(e) {
        const rect = CVS.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (CVS.width / rect.width) | 0; 
        const y = (e.clientY - rect.top) * (CVS.height / rect.height) | 0;
        GUI.mouseup(x, y);
    });
    CVS.addEventListener("mousemove", function(e) {
        const rect = CVS.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (CVS.width / rect.width) | 0; 
        const y = (e.clientY - rect.top) * (CVS.height / rect.height) | 0;
        GUI.mousemove(x, y);
    })

    CVS.addEventListener("keydown", GUI.keydown.bind(GUI));
    CVS.addEventListener("keyup", GUI.keyup.bind(GUI));

    /** Polyfill for setting fullscreen display */
    function goFullScreen() {
        CVS.requestFullscreen && CVS.requestFullscreen() || 
        CVS.webkitRequestFullscreen && CVS.webkitRequestFullscreen() || 
        CVS.msRequestFullscreen && CVS.msRequestFullscreen();
    }
});
