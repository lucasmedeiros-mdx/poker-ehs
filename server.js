var ehs = require('./lib/ehs').EffectiveHandStrength;

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use('/',express.static(path.join(__dirname, '/public')));
app.use('/data',express.static(path.join(__dirname, '/data')));

app.get('/', function (req, res) {
  res.render('index')
});

io.on('connection', function(socket){

    var stats = 0;

    socket.on('ehs', function(boardcards, ourcards, oppcards, speed) {
        var value;
        if (+speed && oppcards.length) {
            value = ehs.compareHands(ourcards, boardcards, oppcards);
        } else {
            value = ehs.handPotential(ourcards, boardcards, oppcards.length ? oppcards : null);
        }
        socket.emit('info', value);
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});;
