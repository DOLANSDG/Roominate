var $ = function(id) { return document.getElementById(id)};
let polyMode = false;        // boolean to track if polygon mode is active
let polyButton = $('polygon-mode');
var points = [];
var lines = [];
var lineCount = 0;
var startCircle = null;
var x = 0;
var y = 0;

/**
 * Point class
 */
class Point {
    /**
     * Create a point.
     * @param {number} x - The x value.
     * @param {number} y - The y value.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Determines whether points are at the same coordinates
     *
     * @param {Point} point Point to compare to.
     * @return {boolean} indicating whether x and y coords are the same. 
     * @memberof Point
     */
    isEqual(point) {
        var xInRange = this.x - 10 <= point.x && point.x <= this.x + 10;
        var yInRange = this.y - 10 <= point.y && point.y <= this.y + 10;

        return xInRange && yInRange;
    }
}

/**
 * Create a polygon
 *
 * @param {*} points
 */
function createPoly(points) {
    var poly = new fabric.Polygon(points, {
        fill: '#b291ff',
        objectCaching: false,
        stroke: 'black',
        strokeWidth: 4,
    })
    canvas.add(poly);
    canvas.setActiveObject(poly);
}

polyButton.onclick = function () {
    if (!polyMode) { // Begin drawing polygon
        polyMode = true;
    } else {
        removePolyLines();
        polyMode = false;
    }
};

canvas.on('mouse:down', function (options) {
    if (polyMode) {
        var canvasPoint = new Point(canvas.getPointer().x, canvas.getPointer().y);
        // If end and start points meet
        if (points.length != 0 && options.target && canvasPoint.isEqual(points[0])) {
            // Draw render polygon from point array
            createPoly(points);
            canvas.renderAll();
            // Remove the prototype lines
            removePolyLines();

        } else {
            canvas.selection = false;
            setStartingPoint(options); // Update to curr x and y pos
            points.push(new Point(x, y));

            // Circle indicating start point
            if (lineCount == 0) {
                startCircle =  new fabric.Circle({
                    radius: 7,
                    fill: 'red',
                    stroke: '#333333',
                    strokeWidth: 0.5,
                    left: (x),
                    top: (y),
                    selectable: false,
                    hasBorders: false,
                    hasControls: false,
                    originX:'center',
                    originY:'center',
                });
                canvas.add(startCircle);
            }

            var point = [x,y,x,y];
            var line = new fabric.Line(point, {
                strokeWidth: 4,
                fill: '#999999',
                stroke: 'red',
                class:'line',
                originX:'center',
                originY:'center',
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false
            });
            lines.push(line);
            canvas.add(lines[lineCount]);
            lineCount++;
            canvas.on('mouse:up', function (options) {
                canvas.selection = true;
            });
        }
    }
});

canvas.on('mouse:move', function (options) {
    if (lines[0] !== null && lines[0] !== undefined && polyMode) {
        setStartingPoint(options);
        lines[lineCount - 1].set({
            x2: x,
            y2: y
        });
        canvas.renderAll();
    }
});

function setStartingPoint(options) {
    var pointer = canvas.getPointer();
    x = pointer.x;
    y = pointer.y;
}

function removePolyLines() {
    // Remove each line
    lines.forEach(function(line, index) {
        canvas.remove(line);
    });
    canvas.remove(startCircle);

    // Reset vars
    points = [];
    lines = [];
    lineCount = 0;
    polyMode = false;
}