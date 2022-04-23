var $ = function(id) { return document.getElementById(id)};
let polyMode = false;        // boolean to track if polygon mode is active
let roomMode = false;        // boolean to track if room mode is active
let polyButton = $('polygon-mode');
let roomButton = $('room-mode');
var points = [];
var lines = [];
var texts = [];
var lineCount = 0;
var startCircle = null;
var text = null;
var x = 0;
var y = 0;

// Find midpoint
var mid = function(x1, x2) {return (x1 + x2) / 2};
// Find distance
var dist = function (x1,x2,y1,y2) {return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))};

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
        fill: '#ffffff',
        objectCaching: false,
        stroke: 'black',
        strokeWidth: 2,
        strokeUniform: true,
        note: ""
    });

    if (roomMode) {
        poly.fill = 'rgba(0,0,0,0)';
        poly.strokeWidth = 8;
    }

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

roomButton.onclick = function () {
    if (!roomMode) {
        roomMode = true;
    } else {
        removePolyLines();
        roomMode = false;
    }
}

canvas.on('mouse:down', function (options) {
    if (polyMode || roomMode) {
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

            text = new fabric.Text ('', {
                left: x,
                top: y,
                width: 150,
                fontSize: 18,
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false
            });
            texts.push(text);
            canvas.add(texts[lineCount]);

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

            if (roomMode) {
                startCircle.fill = 'blue'
                line.stroke = 'blue';
                line.strokeWidth = 8;
            }

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
    if (lines[0] !== null && lines[0] !== undefined && (polyMode || roomMode)) {
        setStartingPoint(options);
        lines[lineCount - 1].set({
            x2: x,
            y2: y
        });

        // Update text positon
        var x1 = lines[lineCount - 1].x1;
        var y1 = lines[lineCount - 1].y1;
        var distance = dist(x1,x,y1,y);

        texts[lineCount - 1].set({
            left: mid(x1, x),
            top: mid(y1, y)
        });
        canvas.bringToFront(texts[lineCount - 1]);

        // Update text
        var ft = Math.floor(distance/60);
        var inch = Math.floor(distance % 60 / 5);
        texts[lineCount - 1].set('text', ft.toString() + "'" + inch.toString());

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

    // Remove each text
    texts.forEach(function(text, index) {
        canvas.remove(text);
    });

    // Remove circle
    canvas.remove(startCircle);

    // Reset vars
    points = [];
    lines = [];
    texts = [];
    lineCount = 0;
    polyMode = false;
    roomMode = false;
}