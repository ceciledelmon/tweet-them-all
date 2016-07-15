var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pug = require('pug');
var Twit = require('twit');

//Variables a proteger
var client = new Twit({
  consumer_key: 'pspb2iLZ6xz0KuApSZWOUQpkr',
  consumer_secret: 'aUVXVyRZNSJg9TGs3JuioT9ubTR9whFg7S2PkXq1RiaI1eX8rP',
  access_token: '714454775-GhfVvCwYLx0Be2tbBtCABsHeRbHxsupvHqq5lb22',
  access_token_secret: '8UITh7VSbGcCxLxFoKX3QEhaEZXii6dQfSHY4niG4qsbo'
});


client.get('search/tweets', {q:'pokemonGo',  geocode:'48.856614,2.3522219000000177,2mi'}, function(err,data,response) {
  //console.log(data.statuses[3].place.bounding_box.coordinates[0][0]);
  //console.log(data);
  data.statuses.forEach(function(row) {
    if (row.place!=null) {
      console.log(row.place.bounding_box.coordinates[0][0]);
      console.log(row.text);
    };
  });
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
