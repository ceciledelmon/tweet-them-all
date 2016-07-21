var socket = io();
var renderer = null;
var Protonrenderer=null;
var stage = new PIXI.Container();
var pointsContainer = new PIXI.Container();
var proton;
var emitter;

var pointsCounter = 0;
var newtweetsCounter = 0;
var lastId = 0;
var click = false;

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
  console.log('reload');
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


function createProton(y) {
  var texture = new PIXI.Texture.fromImage("../images/pokeball.svg");
  proton = new Proton();
  emitter = new Proton.BehaviourEmitter();
  emitter.rate = new Proton.Rate(new Proton.Span(2, 5), new Proton.Span(.2, .5));
  emitter.addInitialize(new Proton.Mass(1));
  emitter.addInitialize(new Proton.ImageTarget(texture));
  emitter.addInitialize(new Proton.Life(1, 2));
  emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 9), new Proton.Span(0, 20, true), 'polar'));

  emitter.addBehaviour(new Proton.Gravity(8));
  emitter.addBehaviour(new Proton.Scale(new Proton.Span(1, 3), 0.3));
  emitter.addBehaviour(new Proton.Alpha(1, 0.5));
  emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
  emitter.p.x = 300;
  emitter.p.y = y+50;
  emitter.emit();
  proton.addEmitter(emitter);

  emitter.addSelfBehaviour(new Proton.Gravity(0));
  emitter.addSelfBehaviour(new Proton.RandomDrift(30, 30, .1));
  emitter.addSelfBehaviour(new Proton.CrossZone(new Proton.RectZone(50, 0, 500, y+50), 'bound'));
}


function createRender() {
  Protonrenderer = new Proton.Renderer('other', proton);
  Protonrenderer.onParticleCreated = function(particle) {
    var particleSprite = new PIXI.Sprite(particle.target);
    particle.sprite = particleSprite;
    stage.addChild(particle.sprite);
  };

  Protonrenderer.onParticleUpdate = function(particle) {
    transformSprite(particle.sprite, particle);
  };

  Protonrenderer.onParticleDead = function(particle) {
    stage.removeChild(particle.sprite);
  };
  Protonrenderer.start();
}

function transformSprite(particleSprite, particle) {
  particleSprite.position.x = particle.p.x;
  particleSprite.position.y = particle.p.y;
  particleSprite.scale.x = particle.scale;
  particleSprite.scale.y = particle.scale;
  particleSprite.anchor.x = 0.5;
  particleSprite.anchor.y = 0.5;
  particleSprite.alpha = particle.alpha;
  particleSprite.rotation = particle.rotation*Math.PI/180;
}

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
    tweet.on('mouseup', onUp);
    tweet.on('touchend', onUp);
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
  console.log('Down');
  pointsCounter++;
  points.text= pointsCounter;
  createProton(eventData.target.y);
  createRender();
  click = true;
};

function onUp(eventData){
  console.log('up');
  click=false;
  displayTweets();
  stage.removeChild(eventData.target);
}

function animate() {
  // start the timer for the next animation loop
  requestAnimationFrame(animate);
  if (click) {
      proton.update();
  }
  // this is the main render call that makes pixi draw your container and its children.
  renderer.render(stage);
};
