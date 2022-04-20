var lastPeerId = null;
var conn = null;
var yourId = document.getElementById('receiver-id');
var recvIdInput = document.getElementById("receiver-id-input");
var hostStat = document.getElementById("host-status");
var joinStat = document.getElementById("join-status");
var connectButton = document.getElementById("connect-button");
var copyButton = document.getElementById("copy-button");

const peer = new Peer();

// Asynchronous data and function for making it noticable that you are connected'
colors = ["2px solid #06D85F", "2px solid #19a855", "2px solid #1a964e", "2px solid #19a855", "2px solid #06D85F"];
$("peer-button").transition = "outline 200ms ease-in-out"
function switchColor(index) {
    setColor = colors[index];
    return new Promise((resolve) => {
        setTimeout(function() {
            $("peer-button").style.outline = setColor;
            resolve(setColor);
        }, 200);
    });
}

async function notifyConnectionEnabled() {
    let index = 0;
    while (conn){
        await switchColor(index);
        index = (index + 1) % colors.length;
    }

};

// enabling peer-to-peer porting
peer.on("open", function (id) {
    if (peer.id === null) {
        console.log("Received null id from peer open");
        peer.id = lastPeerId;
    } else {
        lastPeerId = peer.id;
    }
    console.log("ID: " + peer.id);
    yourId.value = peer.id;
    hostStat.innerHTML = "Awaiting connection...";
});

// Connection of own peer uid through receiving a connection
peer.on('connection', function (c) {
    conn = c;
    console.log("Received and Established a connection to UID: " + conn.peer);
    hostStat.innerHTML = "Connected to " + conn.peer;

    notifyConnectionEnabled();

    // Only handles bidirectional information travel (1-to-1 only)
    conn.on('data', function (data) {
        // Load json onto page
        console.log("Peer moved Objects; Replacing canvas");

        // clear page
        canvas.clear();

        try { // check for an invalid data
            currentJSON = data;
            canvas.loadFromJSON(data);
        } catch (error) {
            alert("Invalid Data sent from your peer client.");
        }
    });
});

// Setting disconnection from own peer uid
peer.on("disconnected", function () {
    hostStat.innerHTML = "Connection lost. Please reconnect";
    console.log('Connection lost. Please reconnect');

    // Reconnecting from previous peerid
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect();
});

// on a closed peer-to-peer connection (due to connected peer)
peer.on('close', function() {
    conn = null;
    hostStat.innerHTML = "Connection destroyed. Please refresh";
    console.log('Connection destroyed');

});

peer.on('error', function (err) {
    console.log(err);
    joinStat.innerHTML = ('' + err);
});

let currentJSON = null;

// Only needed for starting connection
connectButton.addEventListener('click', function() {
    if (conn) { // connection status is valid
        conn.close();
    }

    let connUID = recvIdInput.value;
    conn = peer.connect(connUID, {
        reliable: true
    });

    conn.on('open', function () {
        joinStat.innerHTML = "Connected to : " + conn.peer;
        console.log("Connected to requested UID: " + conn.peer);

        // Put here URL params for style stuff if needed
        // conn.send('hello');
        notifyConnectionEnabled();
    });

    // Only handles bidirectional information travel (1-to-1 only)
    conn.on('data', function (data) {
        // Load json onto page
        console.log("Peer moved Objects; Replacing canvas");

        // clear page
        canvas.clear();

        try { // check for an invalid data
            currentJSON = data;
            canvas.loadFromJSON(data);
        } catch (error) {
            alert("Invalid Data sent from your peer client.");
        }
    });
});

canvas.on('object:modified', function() {
    sendCanvas();
});

function sendCanvas() {
    if (conn && conn.open) {
        conn.send(canvas.toJSON(['lockMovementX', 'lockMovementY', 'note', 'hasControls', 'hasBorders']));
    }
}

copyButton.onclick = function () {
    navigator.clipboard.writeText(peer.id);
    copyButton.value = "Copied!";
    setTimeout(function() {
        copyButton.value = "Copy ID";
    }, 1500);
};