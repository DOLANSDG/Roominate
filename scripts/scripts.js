// let editSideActive = false;  // Check whether editor sidebar is displayed
// let shapeSideActive = false; // Check whether object sidebar is displayed
let gridActive = false;      // boolean to track if the grid should be added or removed
let canvas = new fabric.Canvas('canvas', {
    preserveObjectStacking: true
});

// Quick helper functions
var $ = function(id) { return document.getElementById(id)};
var round = function(num) {return +(Math.round(num + "e+2")  + "e-2")};

var lenFtInput = $('obj-len-ft');
var lenInInput = $('obj-len-in');

var widthFtInput = $('obj-width-ft');
var widthInInput = $('obj-width-in');

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

/* -------------------------------------------------------------------------- */
/*                              Button Functions                              */
/* -------------------------------------------------------------------------- */


// Grid Creation - TODO: Implement unlimited grid functionality
let gridCreator = function() {
    let pixelDelta = 60;
    let totalWidth = canvas.getWidth()*10;
    let lineCount = (totalWidth / pixelDelta);
    let lines = [];
    for (let i = 0; i < lineCount; i++) {
        lines.push(new fabric.Line([i * pixelDelta, 0, i * pixelDelta, totalWidth], {stroke: '#000', selectable: false}));
        lines.push(new fabric.Line([0, i * pixelDelta, totalWidth, i * pixelDelta], {stroke: '#000', selectable: false}));
    }
    
    return lines;
};

let grid = gridCreator();

/**
 * Enable or Disable the canvas grid
 * In the future, implement this as a class
 */
function toggleGrid() {
    for (let i = 0; i < grid.length; i++) {
        gridActive ? canvas.remove(grid[i]) : canvas.add(grid[i]);
        if (!gridActive) canvas.sendToBack(grid[i]); // On grid creation, send to back to prevent object behind grid
    }
    gridActive = !gridActive;
}
/**
 * Helper function for changing button color
 *
 * @param turnedOn turn on or off button colors
 * @param button   button object that is being changed
 */
function changeSideBarButtonColor(turnedOn, button) {
    let id = $(button);
    let textColor;
    let backgroundColor;
    if (turnedOn) {
        textColor = "rgb(0, 0, 0)";
        backgroundColor = "rgb(125,125,125)";
    } else {
        textColor = "rgb(255, 255, 255)";
        backgroundColor = "rgb(141, 93, 187)";
    }
    id.style.color = textColor;
    id.style.backgroundColor = backgroundColor;
}

/**
 * removes children buttons
 */
function removeChildrenButtons(childrenButtons) {
    // proceed if children are not null
    if (childrenButtons != null) {
        for (let i = 0; i < childrenButtons.length; i++) {
            let childButton = buttonCollection[childrenButtons[i]];
            removeChildrenButtons(childButton.childrenButtons);

            // turn off functionality
            $(childButton.purposeID).classList.add('hidden');

            // reset the display of the button
            $(childButton.buttonID).type = "hidden";
            childButton.active = false;
            changeSideBarButtonColor(false, childButton.buttonID);
        }
    }
}

/**
 * Button Constructor
 *
 * @param buttonID     button id
 * @param active       state
 * @param purposeID    ID for the css id used when clicked
 * @param childrenButtons list of buttons that are enabled when clicked
 * @param singleClickButton Necessary field for checking if the button needs to just do a simple task
 */
function Button(buttonID, active, purposeID, childrenButtons = [], singleClickButton = false) {
    this.buttonID = buttonID;
    this.active = active;
    this.purposeID = purposeID;
    this.childrenButtons = childrenButtons;
    this.singleClickButton = singleClickButton;
}

Button.prototype = {
    toggleButton: function() {
        if (this.active) {
            if (typeof this.purposeID === 'string') {
                $(this.purposeID).classList.add('hidden');
            } else {
                this.purposeID();
            }
            removeChildrenButtons(this.childrenButtons);
        } else {
            // Do the purpose id function or enable the html element string
            if (typeof this.purposeID === 'string') {
                $(this.purposeID).classList.remove('hidden');
            } else {
                this.purposeID();
            }
            // add children button nodes
            for (let i = 0; i < this.childrenButtons.length; i++) {
                $(this.childrenButtons[i]).type = "button"; // enable the visibility from hidden to button
            }
        }

        this.active = !this.active;
        changeSideBarButtonColor(this.active, this.buttonID); // make it visibly unpressed
    }
}

Button.prototype.constructor = Button;

/* -------------------------------------------------------------------------- */
/*             Button Collection and Button Toggle Selection                  */
/* -------------------------------------------------------------------------- */
let buttonCollection = {
    "shapes-button": new Button("shapes-button",false, 'shape-select', ["editor-button"], false),
    "editor-button": new Button("editor-button",false, 'obj-editor', [], false),
    "toggle-grid": new Button("toggle-grid", false, toggleGrid, [], false),
    "rectangle-button": new Button("rectangle-button", false, createRect, [], true),
    "circle-button": new Button("circle-button", false, createEllipse, [], true)
}

let buttonIMGPairs = {
    "rectangle-button": ["square_icon.png", "square_icon_clicked.png"],
    "circle-button": ["circle_icon.png", "circle_icon_clicked.png"]
}

/**
 * Chooses the correct button to toggle based off the collection and parameter
 * @param buttonid argument
 */
async function toggle(buttonID) {
    let button = buttonCollection[buttonID];
    if (button.singleClickButton) {
        button.purposeID();
    } else {
        button.toggleButton();
    }
}

/* -------------------------------------------------------------------------- */
/*                              Canvas Functions                              */
/* -------------------------------------------------------------------------- */

// /**
//  * Resizes the canvas  when brower size is adjusted, make the canvas fullscreen
//  */
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
        strokeWidth: 2,
        strokeUniform: true,
        top: centerCoord().y,
        left : centerCoord().x,
        note: ""
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
        strokeWidth: 2,
        strokeUniform: true,
        top: centerCoord().y,
        left : centerCoord().x,
        note: ""
    })
    canvas.add(ellipse);
    canvas.setActiveObject(ellipse);
}

/* ------------------------------ Object Icons ------------------------------ */


// Set up remove icon
var removeIcon = "img/remove_icon.png";
var removeImg = document.createElement('img');
removeImg.src = removeIcon;

// Set up copy icon
var cloneIcon = "img/clone_icon.png";
var cloneImg = document.createElement('img');
cloneImg.src = cloneIcon;

// Render icons
function renderIcon(icon) {
    return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
        var size = this.cornerSize;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(icon, -size/2, -size/2, size, size);
        ctx.restore();
    }
}

// Remove icon control
fabric.Object.prototype.controls.removeControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: removeObject,
    render: renderIcon(removeImg),
    cornerSize: 24
});

// Clone icon control
fabric.Object.prototype.controls.clone = new fabric.Control({
    x: -0.5,
    y: -0.5,
    offsetY: -16,
    offsetX: -16,
    cursorStyle: 'pointer',
    mouseUpHandler: cloneObject,
    render: renderIcon(cloneImg),
    cornerSize: 24
});

/**
 * Delete object from the canvas.  
 * @param {*} eventData 
 * @param {*} transform 
 */
function removeObject(eventData, transform) {
    var target = transform.target;
    var canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
}

/**
 * Clone object on the canvas.
 * @param {*} eventData 
 * @param {*} transform 
 */
function cloneObject(eventData, transform) {
    var target = transform.target;
    var canvas = target.canvas;
    target.clone(function(cloned) {
    cloned.left += 10;
    cloned.top += 10;
    canvas.add(cloned);
    });
}

/* -------------------------------------------------------------------------- */

/**
 * Update input box when object changes
 */
function updateControls() {
    var aObject = canvas.getActiveObjects()[0];
    var scale = aObject.getObjectScaling();

    lenFtInput.value = Math.floor(round((aObject.height * scale.scaleY) / 60));
    lenInInput.value = Math.floor((aObject.height * scale.scaleY) % 60 / 5); // Math to get inches from pixels

    widthFtInput.value = Math.floor(round((aObject.width * scale.scaleX) / 60));
    widthInInput.value = Math.floor((aObject.width * scale.scaleX) % 60 / 5); // Math to get inches from pixels

    $('notes').value = aObject.note;

    if (aObject.fill == 'rgba(0,0,0,0)') {
        colorInput.value = aObject.stroke;
    } else {
        colorInput.value = aObject.fill;
    }
    
    // Update lock/unlock icon
    if (!aObject.hasControls) {
        $('lock-icon').classList.remove('hidden');
        $('unlock-icon').classList.add('hidden');
    } else {
        $('lock-icon').classList.add('hidden');
        $('unlock-icon').classList.remove('hidden');
    }
}

// Update notes on object
$('notes').oninput = function() {
    var aObject = canvas.getActiveObject();
    aObject.note = $('notes').value;
}

// Unlock object
$('lock-icon').onclick = function() {
    $('lock-icon').classList.add('hidden');
    $('unlock-icon').classList.remove('hidden');
    var aObjects = canvas.getActiveObjects();
    for (var aObject of aObjects) {
        aObject.hasControls = canvas.item(0).hasBorders = true;

        aObject.lockMovementX = false;
        aObject.lockMovementY = false;

        lenFtInput.disabled = false;
        lenInInput.disabled = false;
        widthFtInput.disabled = false;
        widthInInput.disabled = false;
    }
    canvas.renderAll();
}

// Lock object
$('unlock-icon').onclick = function() {
    $('unlock-icon').classList.add('hidden');
    $('lock-icon').classList.remove('hidden');
    var aObjects = canvas.getActiveObjects();
    for (var aObject of aObjects) {
        aObject.hasControls = false;
        canvas.item(0).hasBorders = false;
        
        aObject.lockMovementX = true;
        aObject.lockMovementY = true;

        lenFtInput.disabled = true;
        lenInInput.disabled = true;
        widthFtInput.disabled = true;
        widthInInput.disabled = true;
    }
    canvas.renderAll();
}

// Send active object backwards
$('back-icon').onclick = function() {
    var aObject = canvas.getActiveObject();
    canvas.sendBackwards(aObject);
}

// Bring active object forward
$('front-icon').onclick = function() {
    var aObject = canvas.getActiveObject();
    canvas.bringForward(aObject);
}

/**
 * Update object when length ft input box changes
 */
lenFtInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();
    var currFt = lenFtInput.value / scale.scaleY * 60;

        switch (aObject.type) {
            case 'ellipse':
                aObject.set('ry', (currFt + (lenInInput.value * 5)) / 2); // Divide by 2 for diameter instead of radius
                break;
            case 'rect':
                aObject.set('height', currFt + (lenInInput.value * 5));
                break;
        }
        canvas.requestRenderAll();
}

/**
 * Update object in when length inch input box changes
 */
lenInInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();
    var currIn = lenInInput.value / scale.scaleY * 5;

    switch (aObject.type) {
        case 'ellipse':
            aObject.set('ry', (currIn + (lenFtInput.value * 60)) / 2); // Divide by 2 for diameter instead of radius
            break;
        case 'rect':
            aObject.set('height', currIn + (lenFtInput.value * 60));
            break;
    }
    canvas.requestRenderAll();
}

/**
 * Update object when width ft input box changes
 */
widthFtInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();
    var currFt = widthFtInput.value / scale.scaleX * 60;

    switch (aObject.type) {
        case 'ellipse':
            aObject.set('rx', (currFt + (widthInInput.value * 5)) / 2); // Divide by 2 for diameter instead of radius
            break;
        case 'rect':
            aObject.set('width', currFt + (widthInInput.value * 5));
            break;
        case 'polygon':
            break;
    }
    canvas.requestRenderAll();
}

/**
 * Update object when width inch input box changes
 */
widthInInput.oninput = function() {
    var aObject = canvas.getActiveObject();
    var scale = aObject.getObjectScaling();
    var currIn = widthInInput.value / scale.scaleY * 5;

    switch (aObject.type) {
        case 'ellipse':
            aObject.set('ry', (currIn + (widthFtInput.value * 60)) / 2); // Divide by 2 for diameter instead of radius
            break;
        case 'rect':
            aObject.set('width', currIn + (widthFtInput.value * 60));
            break;
        case 'polygon':
            break;
    }
    canvas.requestRenderAll();
}

colorInput.oninput = function() {
    var aObjects = canvas.getActiveObjects();
    for (var aObject of aObjects) {
        if (aObject.fill == 'rgba(0,0,0,0)') {
            aObject.set('stroke', colorInput.value);
        } else  {
            aObject.set('fill', colorInput.value);
        }
    }
    canvas.requestRenderAll();
}

// Ensures that locked objects aren't moved
canvas.on('selection:created', function() {
    if (!canvas.getActiveObject() || (canvas.getActiveObject().type !== 'activeSelection')) {
        return;
    }
    
    var aGroup = canvas.getActiveObject().toGroup();
    for (var i = 0; i < aGroup.size(); i++) {
        if (aGroup.item(i).lockMovementX) {
            //aGroup.removeWithUpdate(aGroup.item(i));
            canvas.add(aGroup.item(i));
            aGroup.removeWithUpdate(aGroup.item(i));
        }
    }
    canvas.getActiveObject().toActiveSelection();
    canvas.requestRenderAll();
});

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

    // Restict from panning outside the grid
    var vpt = this.viewportTransform;
    if (zoom < 400 / 1000) {
        vpt[4] = 200 - 1000 * zoom / 2;
        vpt[5] = 200 - 1000 * zoom / 2;
    } else {
    if (vpt[4] >= 0) {
        vpt[4] = 0;
    } else if (vpt[4] < canvas.getWidth() - 1000 * zoom) {
        vpt[4] = canvas.getWidth() - 1000 * zoom;
    }
    if (vpt[5] >= 0) {
        vpt[5] = 0;
    } else if (vpt[5] < canvas.getHeight() - 1000 * zoom) {
        vpt[5] = canvas.getHeight() - 1000 * zoom;
    }
    }
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

var maxSize = 4500;



canvas.on('mouse:move', function(opt) {
    if (this.isDragging) {
        var e = opt.e;
        var vpt = this.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;

        if (this.viewportTransform[4] >=0) { // Restrict left pan
            this.viewportTransform[4] = 0;
        } if (this.viewportTransform[4] < -1750) {
            this.viewportTransform[4] = -1750;
        }

        if (this.viewportTransform[5] >= 0) { // Restrict right pan
            this.viewportTransform[5] = 0;
        } if (this.viewportTransform[5] < -3200) {
            this.viewportTransform[5] = -3200;
        }

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