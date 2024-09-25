// import statement
var  https = require('https');
var hbs = require('hbs');
const express = require('express');
const router = express.Router({strict: true});

hbs.registerHelper('trimString', function(passedString, startstring, endstring) {
    var theString = passedString.substring( startstring, endstring );
    num = (parseInt(theString) % 12) +":00";
    if(num == "0:00"){
        num = "12:00";
    }
    return num;
 });
    
 
router.get('/getweather', function(req, res){
    var failed = false;
    //var url = 'https://api.weather.gov/points/42.9356,-78.8692'
    console.log(req.query);
    var latitude;
    var longitude;
    var city;
    var state;
    var sunset = false;
    var sunrise = false;
    var zoom = false;
    if(Object.keys(req.query).length === 0){
        res.render('weatherform'); 
        return 0;
    }
    if('lat' in req.query && !Number.isNaN(req.query.lat)){
        latitude = req.query.lat.substring(0, req.query.lat.indexOf(".")+4);
        if(latitude.charAt(latitude.length-1) === '0'){
            latitude = latitude + '1';   
            console.log(latitude);
        }
    }
    else{
        res.render('error'); 
        return 0;
    }
    if('long' in req.query && !Number.isNaN(req.query.long)){
        longitude = req.query.long.substring(0, req.query.long.indexOf(".")+4);
        if(longitude.charAt(longitude.length-1) === '0'){
            longitude = longitude + '1';
            console.log(longitude);
        }
    }
    else{
        res.render('error'); 
        return 0;
    }
    //var url = 'https://pk.sites.tjhsst.edu/points/'+latitude+','+longitude;
    var url = 'https://api.weather.gov/points/'+latitude+','+longitude;
    console.log(url);
    var options =  { headers : {
            'User-Agent': 'request'
        }
    };
    https.get(url, options, function(response) {

    var rawData = '';
    response.on('data', function(chunk) {
        rawData += chunk;
    });

    response.on('end', function() {
        obj = JSON.parse(rawData);
        if('properties' in obj && obj.properties.forecastHourly !== null){
            getHourly(obj.properties.forecastHourly);
            city = obj.properties.relativeLocation.properties.city;
            state = obj.properties.relativeLocation.properties.state;
        }
        else{
            res.render('error');
            return 0;
        }
    });

    }).on('error', function(e) {
        console.error(e);
    });
    function getHourly(link) {
        https.get(link, options, function(response) {
        
            var rawData = '';
            response.on('data', function(chunk) {
                rawData += chunk;
            });
            console.log(link);
            response.on('end', function() {
                obj = JSON.parse(rawData);
                temps = {};
                forecast = {};
                weather = "";
                n = 0;
                day = false;
                function add_temp(elem){
                    if(n===0) {
                        weather = elem.shortForecast;
                        console.log(elem.shortForecast);
                        day = elem.isDaytime;
                    }
                    if(n==1 && day === true)
                    {
                        if(elem.isDaytime === false){
                            sunset = true;
                        }
                    }
                    if(n==1 && day === false)
                    {
                        if(elem.isDaytime === true){
                            sunrise = true;
                        }
                    }
                    if(n < 12){
                        num = elem.startTime;
                        temps[num]= {"t": elem.temperature, "f": elem.shortForecast};
                        n+=1;
                    }
                }
                if(!('properties' in obj)){
                    res.render('error');
                    return 0;
                }
                obj.properties.periods.forEach(add_temp);
                if(sunset === true || sunrise === true){
                    if(weather.includes("Rain")){
                        weather = "sunsetrain.jpg";
                    } 
                    else if(weather.includes("Snow")){
                        weather = "sunsetsnow.jpg";    
                    }
                    else {
                        weather = "sunset.gif";
                    }
                }
                else if(weather.includes("Chance") && (weather.includes("Rain") || weather.includes("Drizzle") || weather.includes("Showers") || weather.includes("Thunder"))){
                    if(day === true){
                        weather = "chancerain.png";    
                    }
                    else {
                        weather = "chancenight.jpg";
                    }
                }
                else if(weather.includes("Snow")){
                    if(day === true){
                        weather = "snow.gif";    
                    }
                    else {
                        weather = "snownight.gif";    
                    }
                }
                else if(weather.includes("Light Rain") || weather.includes("Drizzle") || weather.includes("Showers")){
                    if(day === true){
                        weather = "drizzle.gif";    
                    }
                    else {
                        weather = "drizzlenight.gif";    
                    } 
                }
                else if(weather.includes("Rain")){
                    weather = "rain.gif"; 
                }
                else if(weather.includes("Partly Cloudy")) {
                    if(day === true){
                        weather = "partlycloudy.jpg";    
                    }
                    else {
                        weather = "partlynight.jpg";    
                    }
                }
                else if(weather.includes("Mostly Cloudy")) {
                    if(day === true){
                        weather = "cloudsday.jpg";    
                    }
                    else {
                        weather = "cloudsnight.jpg";    
                    }
                }
                else if(weather.includes("Cloudy")) {
                    if(day === true){
                        weather = "cloudy.jpg";    
                    }
                    else {
                        weather = "cloudsnight.jpg";    
                    }
                }
                else if(weather.includes("Partly Sunny")) {
                    weather = "cloudsday.jpg";  
                }
                else if(weather.includes("Mostly Sunny")) {
                    weather = "partlycloudy.jpg";    
                }
                else if(weather.includes("Sunny")){
                    weather = "sunny.jpg";
                }
                else if(weather.includes("Thunder")){
                    weather = "tstorm.gif";
                }
                else if(weather.includes("Fog")){
                    if(day === true){
                        weather = "fog.jpg";    
                    }
                    else {
                        weather = "fognight.jpg";    
                    }
                }
                else if(weather.includes("Mostly Clear")) {
                    if(day === true){
                        weather = "partlycloudy.jpg";    
                    }
                    else {
                        weather = "partlynight.jpg";    
                    }
                }
                else if(weather.includes("Partly Clear")) {
                    if(day === true){
                        weather = "cloudsday.jpg";    
                    }
                    else {
                        weather = "cloudsnight.jpg";    
                    }
                }
                else if(weather.includes("Frost")) {
                    weather = "frost.jpeg";
                }
                else {
                    if(day === true){
                        weather = "clearday.jpeg";    
                    }
                    else {
                        weather = "clearnight.jpg";    
                    }
                }
                var lastFour = weather.substr(weather.length - 4);
                console.log(lastFour);
                if(lastFour != '.gif')
                {
                    zoom = true;
                }
                params = {"temp" : temps, "weather" : weather, "city" : city, "state" : state, "zoom" : zoom};
                console.log(params.temp);
                console.log(params.weather);
                
                res.render('content', params);
            });
        
        }).on('error', function(e) {
            console.error(e);
        });
        
    }
    
})

module.exports = router;