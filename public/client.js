var socket;
var light;
var temperatureMax;
var temperatureMin;
var humidityMax;
var humidityMin;


$(document).ready(function(){
    socket = io.connect(window.location.hostname + ':' + 3000);
    getVariables();
    addEventListeners();
    setActions();
});

function getVariables(){
    temperatureMax = document.getElementById('temperatureMax');
    temperatureMin = document.getElementById('temperatureMin');
    humidityMax = document.getElementById('humidityMax');
    humidityMin = document.getElementById('humidityMin');
}

function addEventListeners(){
    temperatureMax.addEventListener('change', emitValue.bind(null, 'temperatureMax'));
    temperatureMin.addEventListener('change', emitValue.bind(null, 'temperatureMin'));
    humidityMax.addEventListener('change', emitValue.bind(null, 'humidityMax'));
    humidityMin.addEventListener('change', emitValue.bind(null, 'humidityMin'));
}

function setActions(){
    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('Temp', function(data){
        document.getElementById("temp").innerHTML = data;
    });

    socket.on('Hum', function(data){
        document.getElementById("hum").innerHTML = data;
    });
   
}

function emitValue(device, e) {
    socket.emit('changeMade', {
        device: device,
        value: e.target.value
    });
}