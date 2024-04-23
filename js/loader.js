/** Data to preload */
import data from "./assets.js";

/***
 * Preload of resource files (images/sounds) 
 * @param {function} callback function called when new data has been loaded
 */
async function preload(callback) {
    let loaded = 0;
    const total = Object.keys(data).length;
    for (let i in data) {
        data[i] = data[i].match(/(png|jp[e]?g)$/) ? await loadImage(data[i]) : await loadSound(data[i]);
        loaded++;
        callback(loaded, total);
    }
}

/** 
 * Image loading 
 * @param {string} path Path to the image to load
 * @return {Promise} 
 */
function loadImage(path) {
    return new Promise(function(resolve, reject) {
        let img = new Image();
        img.onload = function() {
            resolve(this);
        }
        img.onerror = function() {
            reject(path);
        }
        img.src = path;
    });
}


function loadSound(path) {
    return new Promise(function(resolve, reject) {
        let audio = new Audio();
        audio.oncanplaythrough = function() {
            resolve(this);
        }
        audio.onerror = function() {
            reject(path);
        }
        audio.src = path;
    });    
}

export { preload, data };