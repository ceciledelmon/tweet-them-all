require('dotenv').config();
var pug = require('pug');
var Twit = require('twit');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var tweets = {};

//API Connexion
var client = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret
});

client.get('search/tweets', { q:'pokemonGo', geocode:'48.8579049,2.3447032,15mi' }, function(err,data,response)
  tweets = data.statuses;
});


app.get('/', function(req, res){
  // var html = pug.renderFile('views/index.pug');
  // res.send(html);
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('monevent', function(){
    console.log('message: click click');
  });
  socket.on('monevent', function(msg){
    io.emit('monevent', tweets);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
