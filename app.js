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
});

var humidity = new five.Sensor("A0");

var state = {
  temperature: 1
};


var interval = 3000; //enter the time between sensor queries here (in milliseconds)
 
//when a client connects
io.sockets.on('connection', function (socket) {
    //initiate interval timer
    console.log("Connected");
    setInterval(function () {
      socket.emit('Temp', temperature.celsius);
    }, interval);
});

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
      displayTemperatureInLCD(this.celsius);
      //console.log(this.celsius + "°C", this.fahrenheit + "°F");
    if( this.celsius < 200 ){
      console.log(true);
      ledHot.on();
    }else{
      ledHot.off();
    }
  });

  humidity.on("change", function() {
    displayHumidityInLCD(humidity.scaleTo([0, 100]));
  });

});

  console.log('temperature sensor setup correctly');


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
  io.on('Temp', function(tmp) {
    io.sockets.emit(tmp);
  });
}

function displayTemperatureInLCD(temperature) {
  lcd.home();
  lcd.print('Temp: ' + temperature + '°C');
}

function displayHumidityInLCD(humidity) {
  lcd.cursor(1, 0);
  lcd.print('Hum: ' + humidity);
}


port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);
