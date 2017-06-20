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

var ledHot = new five.Led(8);
var ledCold = new five.Led(12);
var ledWater = new five.Led(13);

var lcd = new five.LCD({
      controller: "PCF8574"
});

var temperature = new five.Thermometer({
  pin: "A0",
  freq: 100,
  toCelsius: function(raw) {
    return raw - 230;
  }
});

var humiditySensor = new five.Sensor("A0");

var socketClient = null;
var tempMax = 100;
var tempMin = 0;
var humidityMax = 100;
var humidityMin = 0;
var humidity = 0;


// var interval = 3000; //enter the time between sensor queries here (in milliseconds)
 
// //when a client connects
// io.sockets.on('connection', function (socket) {
//     //initiate interval timer
//     console.log("Connected");
//     setInterval(function () {
//       socket.emit('Temp', temperature.celsius);
//     }, interval);
// });

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

     setClientActions();

  temperature.on("change", function() {
    displayTemperature(this.celsius);
    if(this.celsius < tempMin ){
      ledHot.on();
    }else if(this.celsius > tempMax){
      ledCold.on();
    }else {
      ledCold.off();
      ledHot.off();
    }
  });

  humiditySensor.on("change", function() {
    humidity = humiditySensor.scaleTo([0, 100]);
    displayHumidityInLCD(humidity);
     if(humidity > humidityMax ){
      ledWater.on();
    }else if(humidity < humidityMin){
      ledCold.off
    }
  });

});

  function setClientActions(){
    console.log('Setting up socket');

    io.on('connection', function(client) {
      socketClient = client;
      client.on('join', function(handshake) {
        console.log(handshake);
      });
      client.on('update', function(data) {
          tempMax = data.device === 'tempMax' ? data.value : tempMax;
          tempMin = data.device === 'tempMin' ? data.value : tempMin;
          humidityMax = data.device === 'humidityMax' ? data.value : humidityMax;
          tempMin = data.device === 'humidityMin' ? data.value : humidityMin;

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


function printParameters(temperature){
    console.log('Temperature: ' + temperature);
}

function displayTemperature (temperature) {
  displayTemperatureInLCD(temperature);
  // socketClient.emit('Temp', temperature);
}

function displayTemperatureInLCD(temperature) {
  lcd.home();
  lcd.print('Temp: ' + temperature + '°C');
}

function displayHumidityInLCD(humidity) {
  lcd.cursor(1, 0);
  lcd.print('Hum: ' + humidity);
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
