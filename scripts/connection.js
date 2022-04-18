var lastPeerId = null;
var conn = null;
var recvIdInput = document.getElementById("receiver-id-input");
var stat = document.getElementById("status");
var connectButton = document.getElementById("connect-button");

const peer = new Peer();
peer.on("open", function (id) {
    if (peer.id === null) {
        console.log("Received null id from peer open");
    }
    console.log("ID: " + peer.id);
});

peer.on('connection', function (c) {
    conn = c;
    console.log("connected to: " + conn.peer);
    stat.value = "Connected";
});

connectButton.onclick = function() {
    var peerId = recvIdInput.value;
    conn = peer.connect(recvIdInput.value, {
        reliable: true
    });
    
    conn.on('open', function () {
        stat.innerHTML = "Connected to: " + conn.peer;
        console.log("Connected to: " + conn.peer);
        
        conn.send('hello');
    });
    
    peer.on('close', function() {
        conn = null;
        stat.innerHTML = "Connection destroyed. Please refresh";
        console.log('Connection destroyed');
    });
    peer.on('error', function (err) {
        console.log(err);
        alert('' + err);
    });
}



// function initSendPeer() {
//     // Create own peer object with connection to shared PeerJS server
//     peer = new Peer(null, {
//         debug: 2
//     });

//     peer.on('open', function (id) {
//         // Workaround for peer.reconnect deleting previous id
//         if (peer.id === null) {
//             console.log('Received null id from peer open');
//             peer.id = lastPeerId;
//         } else {
//             lastPeerId = peer.id;
//         }

//         console.log('ID: ' + peer.id);
//     });
//     peer.on('connection', function (c) {
//         // Disallow incoming connections
//         c.on('open', function() {
//             c.send("Sender does not accept incoming connections");
//             setTimeout(function() { c.close(); }, 500);
//         });
//     });
//     peer.on('disconnected', function () {
//         status.innerHTML = "Connection lost. Please reconnect";
//         console.log('Connection lost. Please reconnect');

//         // Workaround for peer.reconnect deleting previous id
//         peer.id = lastPeerId;
//         peer._lastServerId = lastPeerId;
//         peer.reconnect();
//     });
//     peer.on('close', function() {
//         conn = null;
//         status.innerHTML = "Connection destroyed. Please refresh";
//         console.log('Connection destroyed');
//     });
//     peer.on('error', function (err) {
//         console.log(err);
//         alert('' + err);
//     });
// };
// /**
// * Create the connection between the two Peers.
// *
// * Sets up callbacks that handle any events related to the
// * connection and data received on it.
// */
// function join() {
//     // Close old connection
//     if (conn) {
//         conn.close();
//     }

//     // Create connection to destination peer specified in the input field
//     conn = peer.connect(recvIdInput.value, {
//         reliable: true
//     });

//     conn.on('open', function () {
//         status.innerHTML = "Connected to: " + conn.peer;
//         console.log("Connected to: " + conn.peer);

//         // Check URL params for comamnds that should be sent immediately
//         var command = getUrlParam("command");
//         if (command)
//         conn.send(command);
//     });
//     // Handle incoming data (messages only since this is the signal sender)
//     conn.on('data', function (data) {
//         addMessage("<span class=\"peerMsg\">Peer:</span> " + data);
//     });
//     conn.on('close', function () {
//         status.innerHTML = "Connection closed";
//     });
// };

// /**
// * Get first "GET style" parameter from href.
// * This enables delivering an initial command upon page load.
// *
// * Would have been easier to use location.hash.
// */
// function getUrlParam(name) {
//     name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
//     var regexS = "[\\?&]" + name + "=([^&#]*)";
//     var regex = new RegExp(regexS);
//     var results = regex.exec(window.location.href);
//     if (results == null)
//     return null;
//     else
//     return results[1];
// };

// /**
// * Send a signal via the peer connection and add it to the log.
// * This will only occur if the connection is still alive.
// */
// function signal(sigName) {
//     if (conn && conn.open) {
//         conn.send(sigName);
//         console.log(sigName + " signal sent");
//         addMessage(cueString + sigName);
//     } else {
//         console.log('Connection is closed');
//     }
// }

// connectButton.onclick = function() {
//     join();
//     console.log('button clicked');
// }
// connectButton.addEventListener('click', join);

// // Since all our callbacks are setup, start the process of obtaining an ID
// // initialize();
