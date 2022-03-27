let editSideActive = false; // Check whether editor sidebar is displayed
let shapeSideActive = false; // Check whether object sidebar is displayed
let canvas = new fabric.Canvas('canvas');

// Quick helper function to get HTML elements
var $ = function(id) {return document.getElementById(id)};
var round = function(num) {return +(Math.round(num + "e+2")  + "e-2")};
var toInch = function(feet) {return feet * 12};

var lenInput = $('obj-len');
var widthInput = $('obj-width');
var colorInput = $('obj-color');

/**
 * Toggles the edit sidebar
 */
function toggleEditSidebar() {
    if (editSideActive) { // turn off sidebar
        $('obj-editor').classList.add('hidden');
        editSideActive = false;
    } else { // turn on sidebar
        $('obj-editor').classList.remove('hidden');
        editSideActive = true;
    }
}

/**
 * Toggles the shape sidebar
 */
function toggleShapeSidebar() {
    if (shapeSideActive) { // turn off sidebar
        $('shape-select').classList.add('hidden');
        shapeSideActive = false;
    } else { // turn on sidebar
        $('shape-select').classList.remove('hidden');
        shapeSideActive = true;
    }
}

/* -------------------------------------------------------------------------- */
/*                              Canvas Functions                              */
/* -------------------------------------------------------------------------- */

/**
 * Resizes the canvas  when brower size is adjusted, make the canvas fullscreen
 */
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

/**
 *  Creates Rectangle object and renders it onto the canvas
 */
function createRect() {
    var rect = new fabric.Rect( {
        fill: '#b291ff',
        width: 200,
        height: 100,
        objectCaching: false,
        stroke: 'black',
        strokeWidth: 4,
    })
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.centerObject(rect);
}

/**
 * Creates Circle object and renders it onto the canvas
 */
function createCircle() {
    var circle = new fabric.Circle({
        fill: '#b291ff',
        radius: 50,
        objectCaching: false,
        stroke: 'black',
        strokeWidth: 4,
    })
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.centerObject(circle);
}

/**
 * Update input box when object changes
 */
function updateControls() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();

    lenInput.value = round((aObject.height * scale.scaleY) / 50);
    widthInput.value = round((aObject.width * scale.scaleX / 50));
    colorInput.value = aObject.fill;
}

/**
 * Update object when length input box changes
 */
lenInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();

    aObject.set('height', (lenInput.value / scale.scaleY * 50));
    canvas.requestRenderAll();
}

/**
 * Update object when width input box changes
 */
widthInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();

    aObject.set('width', (widthInput.value / scale.scaleX * 50));
    canvas.requestRenderAll();
}

colorInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    aObject.set('fill', colorInput.value);
    canvas.requestRenderAll();
}

canvas.on({
    'object:scaling': updateControls,
    'selection:updated': updateControls,
    'selection:created': updateControls
});

/* -------------------------------------------------------------------------- */

// Canvas Zoom and Pan
canvas.on('mouse:wheel', function(opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
});
canvas.on('mouse:down', function(opt) {
    var evt = opt.e;
    if (evt.altKey === true) {
    this.isDragging = true;
    this.selection = false;
    this.lastPosX = evt.clientX;
    this.lastPosY = evt.clientY;
    }
});
canvas.on('mouse:move', function(opt) {
    if (this.isDragging) {
    var e = opt.e;
    var vpt = this.viewportTransform;
    vpt[4] += e.clientX - this.lastPosX;
    vpt[5] += e.clientY - this.lastPosY;
    this.requestRenderAll();
    this.lastPosX = e.clientX;
    this.lastPosY = e.clientY;
    }
});
canvas.on('mouse:up', function(opt) {
    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    this.selection = true;
});