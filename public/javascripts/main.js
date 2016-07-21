var socket = io();
var renderer = null;
var stage = new PIXI.Container();
var pointsContainer = new PIXI.Container();

var pointsCounter = 0;
var newtweetsCounter = 0;
var lastId = 0;

var allTweets = [];
var updatedParams= {};

// create a texture from an image path
var texture = PIXI.Texture.fromImage('../images/pokeball.svg');
// create a new Sprite using the texture
var pokeball = new PIXI.Sprite(texture);
var points = new PIXI.Text(pointsCounter,{font : "14px 'Open Sans'", fill : 0x506264, align : 'left'});

pokeball.anchor.x = 0.5;
pokeball.anchor.y = 0.5;
pokeball.position.x = 0;
pokeball.position.y = 0;

points.position.x = 30;
points.position.y = -7;
// move the sprite to the center of the screen
pointsContainer.position.x = 700;
pointsContainer.position.y = 40;

pointsContainer.addChild(points);
pointsContainer.addChild(pokeball);

socket.on('userConnected', function(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { enableHighAccuracy: true });
  } else {
    console.log('Your browser is out of fashion, there\'s no geolocation!');
  }
});
function positionSuccess(position) {
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

socket.on('collectedTweets', function(params){
  params.tweets.forEach(function(row) {
    allTweets.push(row);
    if (row.id>lastId) {
      lastId = row.id;
    };
  });
  displayTweets();
  updatedParams = {
    latitude : params.latitude,
    longitude: params.longitude,
    lastId : lastId
  };
  setInterval(function(){
    socket.emit('updateTweets', updatedParams);
  }, 10000);
});

socket.on('newTweets', function(newTweets){
  newTweets.forEach(function(row) {
    if (row.id>updatedParams.lastId) {
      allTweets.unshift(row);
      allTweets.splice(100, 1);
      newtweetsCounter++;
      updatedParams.lastId = row.id;
    };
  });
  document.getElementById('load').innerHTML = 'Load More tweets ('+newtweetsCounter+')';
});

document.getElementById('load').addEventListener('click',function(){
  console.log('click');
  displayTweets();
  newtweetsCounter = 0;
  document.getElementById('load').innerHTML = 'Load More tweets ('+newtweetsCounter+')';
});

function displayTweets(){
  var y = 10;
  console.log('displaying');
  for (var i = stage.children.length - 1; i >= 0; i--) {stage.removeChild(stage.children[i]);};
  stage.addChild(pointsContainer);
  allTweets.forEach(function(row) {
    var tweet = new PIXI.Container();
    var date = new PIXI.Text(row.created_at,{font : "12px 'Slabo 27px'", fill : 0x506264, align : 'left'});
    var text = new PIXI.Text(row.text,{font : "14px 'Open Sans'", fill : 0x506264, align : 'left', wordWrap:true, wordWrapWidth:500});
    var graphics = new PIXI.Graphics();
    graphics.beginFill(0x24cdad, 0.3);
    graphics.drawRect(5, 7, 140, 10);
    tweet.addChild(graphics)
    tweet.addChild(date);
    text.position.y = 20;
    tweet.addChild(text);
    tweet.position.y = y;
    tweet.interactive = true;
    tweet.on('mousedown', onDown);
    tweet.on('touchstart', onDown);
    stage.addChild(tweet);
    y += text.height + 40;
  });
  if (!renderer) {
    renderer = new PIXI.WebGLRenderer(800, y, {backgroundColor : 0xffffff});
    // DOM insertion
    document.getElementById('tweet-container').appendChild(renderer.view);
  }
  animate();
}



function onDown(eventData) {
  pointsCounter++;
  points.text= pointsCounter;
  console.log(eventData.target);
  stage.removeChild(eventData.target);
};

function animate() {
  // start the timer for the next animation loop
  requestAnimationFrame(animate);
  // this is the main render call that makes pixi draw your container and its children.
  renderer.render(stage);
};
