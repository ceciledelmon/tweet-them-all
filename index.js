var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pug = require('pug');
var Twit = require('twit');

//Variables a proteger
var client = new Twit({
  consumer_key: '...',
  consumer_secret: '...',
  access_token: '...',
  access_token_secret: '...'
});


client.get('search/tweets', {q:'pokemonGo',  count: 50}, function(err,data,response) {
  console.log(data);
});

// stream.on('tweet', function(tweet) {
//   });
//   stream.on('error', function(error) {
//     throw error;
//   });


app.get('/', function(req, res){
  var html = pug.renderFile('templates/index.pug');
  res.send(html);
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
