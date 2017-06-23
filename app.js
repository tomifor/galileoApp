// ~~~~~~~~~~~~~~~~~~~~~~ http://blog.ricardofilipe.com/post/getting-started-arduino-johhny-five ~~

var five = require('johnny-five');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Galileo = require("galileo-io");
var board = new five.Board({
     io: new Galileo()
});

var ledHot = new five.Led(10);
var ledCold = new five.Led(8);
var ledWater = new five.Led(13);

var lcd = new five.LCD({
      controller: "PCF8574"
});

var temperature = new five.Thermometer({
  pin: "A0",
  freq: 100,
  toCelsius: function(raw) {
    return raw - 641;
  }
});

var humiditySensor = new five.Sensor("A0");

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
  console.log('Setting up board');

    this.repl.inject({
    on: function(){
      ledHot.on();
    }
    });

  temperature.on("change", function() {
    displayInformation();
    controlTemperature();
  });

  humiditySensor.on("change", function() {
    humidity = humiditySensor.scaleTo([0, 100]);
    displayInformation();
    controlHumidity();
  });

  setClientActions();

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

function setClientActions(){
  console.log('Setting up socket');

  io.on('connection', function(client) {
    socketClient = client;
    client.on('join', function(handshake) {
      console.log(handshake);
    });
    client.on('update', function(data) {
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
        client.emit('update', data);
        client.broadcast.emit('update', data);
    });

    client.on('saveValues', function(){
        saveParameteres();
    });

    client.on('defaultValues', function(){
        setSavedParameters();
    });
  });
}

  // io.on('connection', function(client) {
  //   client.on('join', function(handshake) {
  //     console.log(handshake);
  //   });

  //   client.on('update', function(data) {
  //     state.temperature = data.device === 'temperature' ? data.value : state.temperature;
      
  //     printParameters(state.temperature);

  //     client.emit('update', data);
  //     client.broadcast.emit('update', data);
  //   });

  //   client.on('operate', function(data){
  //       console.log("Operate was emitted");
  //       operate = Boolean(data.value);
  //       if(operate === false) ledHot.off();
  //   });

  // });

  console.log('Socket setup correctly');
  console.log('Board setup correctly');


// function displayTemperature (temperature) {
//   displayTemperatureInLCD(temperature);
//   if (socketClient != null) {
//     socketClient.emit('Temp', temperature);
//   };
// }

// function displayTemperatureInLCD(temperature) {
//   lcd.home();
//   lcd.print('Temp: ' + temperature + ' ' + tempMin + ' ' + tempMax);
// }

// function displayHumidityInLCD() {
//   lcd.cursor(1, 0);
//   lcd.print('Hum:  ' + humidity + ' ' + humidityMin + ' ' + humidityMax);
// }

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

function setSavedParameters(){
    var file = './resources/data.json';
    var jsonParameters = jsonfile.readFileSync(file);

    tempMax = jsonParameters.tempMax;
    tempMin = jsonParameters.tempMin;
    humidityMax = jsonParameters.humidityMax;
    humidityMin = jsonParameters.humidityMin;
    
    socketClient.emit('setSavedParameters', jsonParameters);
}

function saveParameteres(){

    var file = './resources/data.json';
    var obj = {tempMax: tempMax, tempMin: tempMin, humidityMax: humidityMax, humidityMin: humidityMin};

    jsonfile.writeFileSync(file, obj, function (err) {
      console.error(err);
    });
}


port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);
