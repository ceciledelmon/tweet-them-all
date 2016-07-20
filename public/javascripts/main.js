// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.WebGLRenderer(800, 1500, {backgroundColor : 0xffffff});

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.getElementById('tweet-container').appendChild(renderer.view);

// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container();

function animate() {
  // start the timer for the next animation loop
  requestAnimationFrame(animate);

  // this is the main render call that makes pixi draw your container and its children.
  renderer.render(stage);
};


var socket = io();
socket.on('userConnected', function(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
  } else {
    console.log('Your browser is out of fashion, there\'s no geolocation!');
  }
});

function positionSuccess(position) {
  console.log(position);
  var userPosition = {
    latitude : position.coords.latitude,
    longitude : position.coords.longitude
  };
  socket.emit('location', userPosition);
};

// handle geolocation api errors
function positionError(error) {
  var errors = {
    1: 'Authorization fails', // permission denied
    2: 'Can\'t detect your location', //position unavailable
    3: 'Connection timeout' // timeout
  };
  showError('Error:' + errors[error.code]);
};

document.getElementById('load').addEventListener('click',function(){
  console.log('click');
  socket.emit('loadMore');
  return false;
});

socket.on('collectedTweets', function(tweets){
  var y = 0;
  tweets.forEach(function(row) {
    var tweet = new PIXI.Container();
    var date = new PIXI.Text(row.created_at,{font : '12px Slabo 27px', fill : 0x506264, align : 'left'});
    var text = new PIXI.Text(row.text,{font : '14px Open Sans', fill : 0x506264, align : 'left'});
    tweet.addChild(date);
    text.position.y = 20;
    tweet.addChild(text);
    tweet.position.y = y;
    stage.addChild(tweet);
    console.log(text.height);
    y += text.height + 40;
  });
  console.log(y);
  animate();
});
