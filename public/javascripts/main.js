
var socket = io();
socket.on('userConnected', function(){
  console.log("go");
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
  console.log(tweets);
  tweets.forEach(function(row) {
    var li = document.createElement('li');
    li.innerHTML = row.created_at+' '+row.text;
    document.getElementById('messages').appendChild(li);
  });
});
