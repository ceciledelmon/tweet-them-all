require('dotenv').config();
var pug = require('pug');
var Twit = require('twit');
var express = require('express');
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

app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', { title: 'tweet-them-all', message: 'Hello there!'});
});


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//Socket io part
io.on('connection', function(socket){
  console.log('user connected');
  io.emit('userConnected');
  socket.on('location', function(position) {
    client.get('search/tweets', { q:'pokemonGo -RT :)', geocode: position.latitude+','+position.longitude+',15mi', count:100 }, function(err,data,response){
      tweets = data.statuses;
      io.emit('collectedTweets', tweets);
    });
  });

  socket.on('loadMore', function(){
    console.log('Load More !');
    //detect last tweet than upload after
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
