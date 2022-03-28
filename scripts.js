let editSideActive = false; // Check whether editor sidebar is displayed
let shapeSideActive = false; // Check whether object sidebar is displayed
let canvas = new fabric.Canvas('canvas');

// Quick helper functions
var $ = function(id) {return document.getElementById(id)};
var round = function(num) {return +(Math.round(num + "e+2")  + "e-2")};
var toInch = function(feet) {return feet * 12};

var lenInput = $('obj-len');
var widthInput = $('obj-width');
var colorInput = $('obj-color');

/**
 * Get center of the viewport
 */
function centerCoord(){
    var zoom=canvas.getZoom()

    return{
        x: fabric.util.invertTransform(canvas.viewportTransform)[4]+(canvas.width/zoom)/2,
        y: fabric.util.invertTransform(canvas.viewportTransform)[5]+(canvas.height/zoom)/2
    }
}

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

var grid = 50;
totalWidth = canvas.getWidth() * 5;
for (var i = 0; i < (totalWidth / grid); i++) {
    canvas.add(new fabric.Line([ i * grid, 0, i * grid, totalWidth], { stroke: '#000', selectable: false }));
    canvas.add(new fabric.Line([ 0, i * grid, totalWidth, i * grid], { stroke: '#000', selectable: false }))
}

/* -------------------------------------------------------------------------- */
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
        top: centerCoord().y,
        left : centerCoord().x

    })
    canvas.add(rect);
    canvas.setActiveObject(rect);
}

/**
* Creates Circle object and renders it onto the canvas
*/
function createEllipse() {
    var ellipse = new fabric.Ellipse({
        fill: '#b291ff',
        rx: 50,
        ry: 50,
        objectCaching: false,
        stroke: 'black',
        strokeWidth: 4,
        top: centerCoord().y,
        left : centerCoord().x
    })
    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
}

var points = [{x: 0, y: 0}, {x: 16, y: 0}, {x: 30, y: 15},  {x: 25, y: 55}, {x: 0, y: 44}];

/**
* Create Polygon
*/
function createPoly() {
    var poly = new fabric.Polygon(points, {
        fill: '#b291ff',
        objectCaching: false,
        stroke: 'black',
        strokeWidth: 4,
        top: centerCoord().y,
        left : centerCoord().x
    })
    canvas.add(poly);
    canvas.setActiveObject(poly);
}

/* -------------------------------------------------------------------------- */

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
    
    switch (aObject.type) {
        case 'ellipse':
        aObject.set('ry', (lenInput.value / scale.scaleY * 50) / 2) // Divide by 2 for diameter instead of radius
        break;
        case 'rect':
        aObject.set('height', (lenInput.value / scale.scaleY * 50));
        break;
        case 'polygon':
        break;
        
    }
    canvas.requestRenderAll();
}

/**
* Update object when width input box changes
*/
widthInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();
    
    switch (aObject.type) {
        case 'ellipse':
        aObject.set('rx', (widthInput.value / scale.scaleX * 50) / 2); // Divide by 2 for diameter instead of radius
        break;
        case 'rect':
        aObject.set('width', (widthInput.value / scale.scaleX * 50));
        break;
        case 'polygon':
        break;
    }
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
    if (zoom > 2) zoom = 2; // Restrict zoom size
    if (zoom < 0.25) zoom = 0.25; // Restrict zoom size
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