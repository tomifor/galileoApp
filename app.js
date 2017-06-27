var jf = require('johnny-five');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Galileo = require("galileo-io");
var board = new jf.Board({
     io: new Galileo()
});

var ledHot = new jf.Led(10);
var ledCold = new jf.Led(8);
var ledWater = new jf.Led(13);

var lcd = new jf.LCD({
      controller: "PCF8574"
});

var temperature = new jf.Thermometer({
  pin: "A0",
  freq: 100
});

var humiditySensor = new jf.Sensor("A0");

var socketClient = null;
var tempMax = 25;
var tempMin = 15;
var humidityMax = 40;
var humidityMin = 20;
var humidity = 0;


app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next) {
  res.sendFile('./index.html');
});

board.on('ready', function() {

  temperature.on("data", function() {
    displayInformation();
    controlTemperature();
  });

  humiditySensor.on("data", function() {
    humidity = humiditySensor.scaleTo([0, 100]);
    displayInformation();
    controlHumidity();
  });

  manageClient();

});

function controlTemperature(){
  if(temperature.celsius < tempMin ){
    ledHot.on();
  }else if(temperature.celsius > tempMax){
    ledCold.on();
  }else {
    ledCold.off();
    ledHot.off();
  }
}

function controlHumidity(){
  if(humidity > humidityMax){
    ledWater.on();
  }else if(humidity < humidityMin){
    ledWater.off();
  }
}

function manageClient(){

  io.on('connection', function(client) {
    socketClient = client;
    client.on('changeMade', function(data) {
        if(data.device === 'temperatureMax'){
          tempMax = data.value;
        }else if (data.device === 'temperatureMin') {
          tempMin = data.value;
        }else if(data.device === 'humidityMax'){
          humidityMax = data.value;
        }else if(data.device === 'humidityMin'){
          humidityMin = data.value;
        }
        controlHumidity();
        controlTemperature();
        displayInformation();
    });

    client.on('saveValues', function(){
        saveParameteres();
    });

    client.on('defaultValues', function(){
        setSavedParameters();
    });
  });
}

function displayInformation() {
  lcd.home();
  lcd.print('Temp: ' + temperature.celsius + ' ' + tempMin + ' ' + tempMax);
  lcd.cursor(1, 0);
  lcd.print('Hum:  ' + humidity + ' ' + humidityMin + ' ' + humidityMax);
  if (socketClient != null) {
    socketClient.emit('Temp', temperature.celsius);
    socketClient.emit('Hum', humidity);
  };
}

port = process.env.PORT || 3000;

server.listen(port);
