#!/usr/bin/nodejs

// initialize express and app class object
var express = require('express');
var app = express();

var  https = require('https');

// initialize handlebars templating engine
var hbs = require('hbs');
app.set('view engine', 'hbs');

const {  AuthorizationCode } = require('simple-oauth2');
app.set('trust proxy', 1); // trust first proxy

// initialize the built-in library 'path'
var path = require('path');
console.log(__dirname);
app.use(express.static(path.join(__dirname,'static')));

const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'secret',
    keys: ['key1', 'key2']
}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const cookies = require('./routes/cookies.js');
app.use(cookies);

const weather = require('./routes/weather.js');
app.use(weather);

const vote = require('./routes/votes.js');
app.use(vote);

const numbers = require('./routes/numbers.js');
app.use(numbers);

const hogwarts = require('./routes/houses.js');
app.use(hogwarts);

const map = require('./routes/map.js');
app.use(map);

//  YOU GET THESE PARAMETERS BY REGISTERING AN APP HERE: https://ion.tjhsst.edu/oauth/applications/   

var ion_client_id = 'g2tmUdkrEDbtQbuidPqhfHn9YWsqVThP4i8RRmsc';
var ion_client_secret = 'qbXK3LZasbkVFBdEB4OHRYRHmRYYr3zeSwMVW08VyV98p2HXVOcBILXdWy1kUvFsGzROrNDZJbF4nhvUeX5nqDKtZMOQwrXJaHh4R4s61t9Jqnb6t4KWUDd6cjhES36U';
var ion_redirect_uri = 'https://user.tjhsst.edu/2022jjerome/login_worker';
var mysql = require('mysql2');
var sql_params = {
  connectionLimit : 10,
  host: "localhost",
  user: "root",
  password: "JoniX294$"
};
var pool  = mysql.createPool(sql_params);

var client = new AuthorizationCode({
  client: {
    id: ion_client_id,
    secret: ion_client_secret,
  },
  auth: {
    tokenHost: 'https://ion.tjhsst.edu/oauth/',
    authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
    tokenPath: 'https://ion.tjhsst.edu/oauth/token/'
  }
});

// This is the link that will be used later on for logging in. This URL takes
// you to the ION server and asks if you are willing to give read permission to ION.

var authorizationUri = client.authorizeURL({
    scope: "read",
    redirect_uri: ion_redirect_uri
});

console.log(authorizationUri)

// -------------- express 'get' handlers -------------- //

function checkAuthentication(req,res,next) {

    if ('authenticated' in req.session && req.session.authenticated === true) {
        // the user has logged in
        next();
    }
    else {
        req.session.authenticated = false;
        if('cookie' in req.session) {
            delete req.session.cookie;
            res.redirect("https://user.tjhsst.edu/2022jjerome/cookie");
        }
        else {
            var sql = 'UPDATE visits SET count=count+1;';
            pool.query(sql, function(error, results, fields){
                    if (error) throw error;
                    var sql = 'SELECT * FROM visits';
                    pool.query(sql, function(error, results, fields){
                        if (error) throw error;
                        res.render('main', {"login" : false, "link" : authorizationUri, "visits" : results[0]}); 
                    });
            });
        }
    }
}

function getUserName(req,res,next) {
    var access_token = req.session.token.access_token;
    var profile_url = 'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token;
    
    https.get(profile_url, function(response) {
      var rawData = '';
      response.on('data', function(chunk) {
            rawData += chunk;
      });
    
      response.on('end', function() {
            res.locals.profile = JSON.parse(rawData);
            if('detail' in res.locals.profile)
            {
                var sql = 'UPDATE visits SET count=count+1;';
                pool.query(sql, function(error, results, fields){
                        if (error) throw error;
                        req.session.authenticated = false;
                        var sql = 'SELECT * FROM visits';
                        pool.query(sql, function(error, results, fields){
                            if (error) throw error;
                            res.render('main', {"login" : false, "link" : authorizationUri, "visits" : results[0]}); 
                        });
                });
            }
            else {
                next(); 
            }
      });
    
    }).on('error', function(err) {
        next(err);
    });
    

}



app.get('/logout', function (req, res) {
    req.session.authenticated = false;
    res.redirect('https://user.tjhsst.edu/2022jjerome');

});


// -------------- intermediary login_worker helper -------------- //
async function convertCodeToToken(req, res, next) {
    var theCode = req.query.code;

    var options = {
        'code': theCode,
        'redirect_uri': ion_redirect_uri,
        'scope': 'read'
     };
    
    // needed to be in try/catch
    try {
        var accessToken = await client.getToken(options);      // await serializes asyncronous fcn call
        res.locals.token = accessToken.token;
        next();
    } 
    catch (error) {
        console.log('Access Token Error', error.message);
         res.send(502); // error creating token
    }
}


app.get('/login_worker', [convertCodeToToken], function(req, res) { 

    req.session.authenticated = true;
    req.session.token = res.locals.token;
    res.redirect('https://user.tjhsst.edu/2022jjerome');
    
});

app.get('/', [checkAuthentication, getUserName], function(req, res) {
    var profile = res.locals.profile;
    var first_name = profile.first_name;
    if(first_name === undefined) {
        req.session.authenticated = false;  
    }
    else {
        var sql = 'INSERT INTO users (id, nickname) VALUES (?, ?) ON DUPLICATE KEY UPDATE nickname = nickname;';
        var ion_username = profile.ion_username;
        var nick_name = profile.ion_username.toUpperCase();
        pool.query(sql, [ion_username, nick_name], function(error, results, fields){
            if (error) throw error;
        });
    }
    if('cookie' in req.session) {
        delete req.session.cookie;
        res.redirect("https://user.tjhsst.edu/2022jjerome/cookie");
    }
    else if('hogwarts' in req.session) {
        delete req.session.hogwarts;
        res.redirect("https://user.tjhsst.edu/2022jjerome/hogwarts");
    }
    else {
        var sql = 'SELECT nickname FROM users WHERE id=?;';
        var username;
        pool.query(sql, [profile.ion_username], function(error, results, fields){
            if (error) throw error;
            username = results[0].nickname;
            var sql = 'UPDATE visits SET count=count+1;';
            pool.query(sql, function(error, results, fields){
                if (error) throw error;
                var sql = 'SELECT * FROM visits';
                pool.query(sql, function(error, results, fields){
                    if (error) throw error;
                    res.render('main', {"login" : true, "user" : username, "visits" : results[0]}); 
                });
            });
        });   
    }
});

app.get('/login', function(req, res) {
    res.redirect(authorizationUri); 
});

app.get('/profile', [checkAuthentication, getUserName], function(req, res) {
    var profile = res.locals.profile;
    var sql = 'SELECT nickname FROM users WHERE id=?;';
    var username;
    pool.query(sql, [profile.ion_username], function(error, results, fields){
        if (error) throw error;
        username = results[0].nickname;
        var full_name = profile.full_name;
        var grade = profile.grade.number;
        var counselor = profile.counselor.last_name;
        res.render('profile', {'user' : username, 'name' : full_name, 'grade' : grade, 'counselor' : counselor});
    });
});

app.get('/rename', [checkAuthentication, getUserName], function(req, res) {
    var profile = res.locals.profile;
    if('new' in req.query) {
        var sql = 'INSERT INTO users (id, nickname) VALUES (?, ?) ON DUPLICATE KEY UPDATE nickname = VALUES(nickname);';   
        var ion_username = profile.ion_username;
        var nick_name = req.query.new.toUpperCase();
        pool.query(sql, [ion_username, nick_name], function(error, results, fields){
            if (error) throw error;
            res.redirect("https://user.tjhsst.edu/2022jjerome");
        });
    }
    else {
        var sql = 'SELECT nickname FROM users WHERE id=?;';
        var username;
        var ion_username = profile.ion_username;
        pool.query(sql, [profile.ion_username], function(error, results, fields){
            if (error) throw error;
            username = results.nickname;
            res.render('rename', {'user' : username});
        });    
    }

});

// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

app.listen(3000, function() {
    console.log("Server is listening on port 3000...");
})