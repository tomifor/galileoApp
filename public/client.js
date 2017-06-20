var socket;
var light;
var temperatureMax;
var temperatureMin;
var humidityMax;
var humidityMin;


$(document).ready(function(){
    socket = io.connect(window.location.hostname + ':' + 3000);

    prepareDOMVariables();
    //
    addEventListeners();
    //
    setSocketActions();
});

function prepareDOMVariables(){
    temperatureMax = document.getElementById('temperatureMax');
    temperatureMin = document.getElementById('temperatureMin');
    humidityMax = document.getElementById('humidityMax');
    humidityMin = document.getElementById('humidityMin');
}

function emitChecked(emitValue, e){
    socket.emit(emitValue, {
        value: e.target.checked
    });
}

function emitValue(e) {
    console.log(e);
    socket.emit('update', {
        value: e.target.value
    });
}

function emitButtonValue(emitValue, e){
    socket.emit(emitValue, {
        value: e.target.value
    });
}

function addEventListeners(){
    tempMax.addEventListener('change', emitValue.bind('temperatureMax'));
    tempMin.addEventListener('change', emitValue.bind('temperatureMin'));
    humidityMax.addEventListener('change', emitValue.bind('humidityMax'));
    humidityMin.addEventListener('change', emitValue.bind('humidityMin'));
}

function setSocketActions(){
    socket.on('connect', function(data) {
        socket.emit('join', 'Client is connected!');
    });

    socket.on('Temp', function(data){
        console.log(data);
        document
    });

    // socket.on('setSavedParameters', function(data){
    //     light.value = data.light;
    //     sound.value = data.sound;
    //     activeBuzzerCheckbox.checked = data.buzzerOn;
    //     rgbLedCheckbox.checked = data.alarmLedOn;
    //     lightSystemCheckBox.checked = data.lightSystemActive;
    //     alarmSystemCheckbox.checked = data.alarmSystemActive;
    // });
}