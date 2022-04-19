var peer = new Peer();

peer.on('open', function(id) {
    console.log('My peer id is: ' + id);
});
