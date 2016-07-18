require('dotenv').config();
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pug = require('pug');
var Twit = require('twit');

//API Connexion
var client = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret
});

client.get('search/tweets', { q:'pokemonGo', geocode:'48.8579049,2.3447032,10km', count:50 }, function(err,data,response) {
  data.statuses.forEach(function(row) {
    if (row.place!=null) {
      console.log(row.place.bounding_box.coordinates[0][0]);
    };
    console.log(row.id);
    console.log(row.text);
    i++;
  });
});


app.get('/', function(req, res){
  var html = pug.renderFile('views/index.pug');
  res.send(html);
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
