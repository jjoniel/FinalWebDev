const express = require('express');
const router = express.Router({strict: true});
var  https = require('https');

var mysql = require('mysql');
var sql_params = {
  connectionLimit : 10,
  user            : process.env.DIRECTOR_DATABASE_USERNAME,
  password        : process.env.DIRECTOR_DATABASE_PASSWORD,
  host            : process.env.DIRECTOR_DATABASE_HOST,
  port            : process.env.DIRECTOR_DATABASE_PORT,
  database        : process.env.DIRECTOR_DATABASE_NAME
};
var pool  = mysql.createPool(sql_params);

function getUserName(req,res,next) {
    if ('authenticated' in req.session && req.session.authenticated === true) {
        var access_token = req.session.token.access_token;
        var profile_url = 'https://ion.tjhsst.edu/api/profile?format=json&access_token='+access_token;
        
        https.get(profile_url, function(response) {
        
            var rawData = '';
            response.on('data', function(chunk) {
                rawData += chunk;
            });
        
            response.on('end', function() {
                res.locals.profile = JSON.parse(rawData);
                next(); 
            });
        
        }).on('error', function(err) {
            next(err);
        });
    }
    else {
        next();   
    }
}

router.get('/cookie', [getUserName], function(req, res){
    let ren = true;
    if('my_count' in req.session === false){
        req.session.my_count = 0;
    }
    else{
        req.session.my_count++;
        if(req.session.my_count >= 5 && req.session.authenticated === false){
            console.log('no trial');
            res.render('expired');    
            ren = false;
        }
    }
    if('authenticated' in req.session === false){
        req.session.authenticated = false;
    }
    if(ren === true){
        if(req.session.authenticated === true)
        {
            var profile = res.locals.profile;
            console.log(req.session.my_count);
            var sql = 'INSERT INTO cookies (id, count, cps, goal) VALUES (?, 0, 0, 1) ON DUPLICATE KEY UPDATE count=count;';
            var ion_username = profile.ion_username;
            pool.query(sql, [ion_username], function(error, results, fields){
                if (error) throw error;
                var sql = 'SELECT * FROM cookies WHERE id=?;';
                var ion_username = profile.ion_username;
                pool.query(sql, [ion_username], function(error, results, fields){
                    if (error) throw error;
                    if('clicks' in req.cookies === false){
                        res.cookie('clicks', results[0].count);
                    }
                    else {
                        if(parseInt(req.cookies.clicks) > results[0].count) {
                            var sql = 'UPDATE cookies SET count=? WHERE id=?';
                            var new_val = parseInt(req.cookies.clicks);
                            pool.query(sql, [new_val, ion_username], function(error, results, fields){
                                if(error) throw error;
                            });
                        }
                        else {
                            res.cookie('clicks', results[0].count);    
                        }
                    }
                    if('cps' in req.cookies === false){
                        res.cookie('cps', results[0].cps);
                    }
                    else {
                        if(parseInt(req.cookies.cps) > results[0].count) {
                            var sql = 'UPDATE cookies SET cps=? WHERE id=?';
                            var new_val = parseInt(req.cookies.cps);
                            pool.query(sql, [new_val, ion_username], function(error, results, fields){
                                if(error) throw error;
                            });
                        }
                        else {
                            res.cookie('cps', results[0].cps);
                        }
                    }
                    if('goal' in req.cookies === false){
                        res.cookie('goal', results[0].goal);
                    }
                    else {
                        if(parseInt(req.cookies.goal) > results[0].count) {
                            var sql = 'UPDATE cookies SET goal=? WHERE id=?';
                            var new_val = parseInt(req.cookies.goal);
                            pool.query(sql, [new_val, ion_username], function(error, results, fields){
                                if(error) throw error;
                            });
                        }
                        else {
                            res.cookie('goal', results[0].goal);
                        }
                    }
                    var left = 5 - req.session.my_count;
                    res.render('cookie', {'login': req.session.authenticated, 'plays': left}); 
                    console.log(req.session.authenticated);  
                });
            });
            
        }
        else 
        {
            console.log(req.session.my_count);
            if('clicks' in req.cookies === false){
                res.cookie('clicks', '0');
            }
            if('cps' in req.cookies === false){
                res.cookie('cps', '0');
            }
            if('goal' in req.cookies === false){
                res.cookie('goal', '1');
            }
            var left = 5 - req.session.my_count;
            res.render('cookie', {'login': req.session.authenticated, 'plays': left}); 
            console.log(req.session.authenticated);
        }
    }
});

router.get('/cookie/save', [getUserName], function(req, res){
    if(req.session.authenticated === true) {
        var profile = res.locals.profile;
        var ion_username = profile.ion_username;
        var sql = 'UPDATE cookies SET goal=? WHERE id=?';
        var new_val = parseInt(req.cookies.goal);
        pool.query(sql, [new_val, ion_username], function(error, results, fields){
            if(error) throw error;
        });
        sql = 'UPDATE cookies SET cps=? WHERE id=?';
        new_val = parseInt(req.cookies.cps);
        pool.query(sql, [new_val, ion_username], function(error, results, fields){
            if(error) throw error;
        });
        sql = 'UPDATE cookies SET count=? WHERE id=?';
        new_val = parseInt(req.cookies.clicks);
        pool.query(sql, [new_val, ion_username], function(error, results, fields){
            if(error) throw error;
        });
        res.json({'status': 'saved'});    
    }
    else {
        res.json({'status': 'not saved'});
    }
});

router.get('/cookie/login', function(req, res){
    if('my_count' in req.session === false){
        req.session.my_count = 0;
    }
    if('intent' in req.query){
        req.session.cookie = true;
        res.redirect('https://user.tjhsst.edu/2022jjerome/login');    
    }
    if(req.session.authenticated === true || req.session.my_count < 5){
        res.redirect('https://user.tjhsst.edu/2022jjerome/cookie');
    } 
    else {
        req.session.cookie = true;
        res.redirect('https://user.tjhsst.edu/2022jjerome/login');
    }
});

router.get('/cookie/logout', function(req, res){
    req.session.authenticated = false;
    res.redirect('https://user.tjhsst.edu/2022jjerome/cookie');
});

module.exports = router;