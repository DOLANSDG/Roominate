let editSideActive = false; // Check whether editor sidebar is displayed
let shapeSideActive = false; // Check whether object sidebar is displayed
let canvas = new fabric.Canvas('canvas');

// Quick helper function to get HTML elements
var $ = function(id) {return document.getElementById(id)};


function toggleEditSidebar() {
    if (editSideActive) { // turn off sidebar
        $('obj-editor').classList.add('hidden');
        editSideActive = false;
    } else { // turn on sidebar
        $('obj-editor').classList.remove('hidden');
        editSideActive = true;
    }
}

function toggleShapeSidebar() {
    if (shapeSideActive) { // turn off sidebar
        $('shape-select').classList.add('hidden');
        shapeSideActive = false;
    } else { // turn on sidebar
        $('shape-select').classList.remove('hidden');
        shapeSideActive = true;
    }
}

// Makes the canvas fullscreen
(function() {
    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    function resizeCanvas() {
            canvas.setWidth(window.innerWidth);
            canvas.setHeight(window.innerHeight);
            canvas.renderAll();
    }
    
    resizeCanvas();
})();
