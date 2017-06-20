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
      console.log(this.celsius + "°C", this.fahrenheit + "°F");
      console.log(this.celsius);
    if( this.celsius < 200 ){
      console.log(true);
      ledHot.on();
    }else{
      ledHot.off();
    }
  });

  humidity.on("change", function() {
    displayHumidityInLCD(humidity.scaleTo([0, 80]));
  });

});

  console.log('temperature sensor setup correctly');

  var checkTime = function(){
      var timeFlag = checkDate(state);
  };

  setInterval(checkTime, 60 * 1000 * 2);


  io.on('connection', function(client) {
    client.on('join', function(handshake) {
      console.log(handshake);
    });

    client.on('update', function(data) {
      state.temperature = data.device === 'temperature' ? data.value : state.temperature;
      
      printParameters(state.temperature);

      client.emit('update', data);
      client.broadcast.emit('update', data);
    });

    client.on('operate', function(data){
        console.log("Operate was emitted");
        operate = Boolean(data.value);
        if(operate === false) ledHot.off();
    });

  });

  console.log('Socket setup correctly');
  console.log('Board setup correctly');


function printParameters(temperature){
    console.log('Temperature: ' + temperature);
}

function displayTemperatureInLCD(temperature) {
  lcd.home();
  lcd.print('Temp: ' + temperature + '°C');
}

function displayHumidityInLCD(humidity) {
  lcd.cursor(1, 0);
  lcd.print('Hum: ' + humidity);
}

function checkDate(state){
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var toCheck;
    if(minutes < 30) toCheck = hours;
    else toCheck = hours + 0.5;
    return state.startHour < toCheck && state.finishHour > toCheck;
}

port = process.env.PORT || 3000;

server.listen(port);
console.log(`Server listening on http://localhost:${port}`);
