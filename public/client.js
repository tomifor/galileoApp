var socket;
var light;
var tempMax;
var tempMin;
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
    tempMax = document.getElementById('temperatureMax');
    tempMin = document.getElementById('temperatureMin');
    humidityMax = document.getElementById('humidityMax');
    humidityMin = document.getElementById('humidityMin');
}

function emitChecked(emitValue, e){
    socket.emit(emitValue, {
        value: e.target.checked
    });
}

function emitValue(device, e) {
    socket.emit('update', {
        device: device,
        value: e.target.value
    });
}

function emitButtonValue(emitValue, e){
    socket.emit(emitValue, {
        value: e.target.value
    });
}

function addEventListeners(){
    tempMax.addEventListener('change', emitValue.bind(null, 'tempMax'));
    tempMin.addEventListener('change', emitValue.bind(null, 'tempMin'));
    humidityMax.addEventListener('change', emitValue.bind(null, 'humidityMax'));
    humidityMin.addEventListener('change', emitValue.bind(null, 'humidityMin'));
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