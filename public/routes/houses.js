#!/usr/bin/nodejs

const express = require('express');
const router = express.Router({strict: true});


var mysql = require('mysql');

// -------------- mysql initialization -------------- //
// USE PARAMETERS FROM DIRECTOR DOCS!!!
var sql_params = {
  connectionLimit : 10,
  user            : process.env.DIRECTOR_DATABASE_USERNAME,
  password        : process.env.DIRECTOR_DATABASE_PASSWORD,
  host            : process.env.DIRECTOR_DATABASE_HOST,
  port            : process.env.DIRECTOR_DATABASE_PORT,
  database        : process.env.DIRECTOR_DATABASE_NAME
};

var pool  = mysql.createPool(sql_params);
var hbs = require('hbs');

// -------------- express 'get' handlers -------------- //

hbs.registerHelper('add', function(lvalue, rvalue) {
    console.log("boop");
    console.log(lvalue);
    console.log(rvalue);
    if(lvalue === null || rvalue === null)
    {
        return 0;
    }
    return parseInt(lvalue) + parseInt(rvalue) - 1;
});

router.get('/hogwarts', function(req,res){
    req.session.offset = 0;
    if('authenticated' in req.session === false){
        req.session.authenticated = false;
    }
    var sql = 'SELECT house, SUM(points) AS pts FROM students GROUP BY house';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        var houses = results;
        console.log(houses);
        var sql = 'SELECT name FROM students;';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            if(req.session.authenticated === true)
            {   
                res.render('houses', {'results' : houses, 'students' : results});    
            }
            else 
            {
                res.render('blocked', {'results' : houses, 'students' : results});
            }
        });    
    });
});

router.get('/hogwarts_worker', function(req,res){
    if('name' in req.query){
        var sql = "UPDATE students SET points=points+? WHERE name=?;";
        points = req.query.points;
        if(req.query.givetake == 'minus') {
            points = points * -1;
        }
        console.log(points);
        pool.query(sql, [points, req.query.name], function(error, results, fields){
            if (error) throw error;
            points = Math.abs(points);
            var sql = 'INSERT INTO log (action, house) VALUES (CONCAT(?, " points ", ?, " ", ?), (SELECT house FROM students WHERE name=?));';
            var tf = "to";
            if(req.query.givetake == 'minus') {
                tf = "from";
            }
            pool.query(sql, [points, tf, req.query.name, req.query.name],  function(error, results, fields){
                if (error) throw error;
                var sql = 'SELECT house, SUM(points) AS pts FROM students GROUP BY house';
                pool.query(sql, function(error, results, fields){
                    if (error) throw error;
                    var houses = results;
                    var sql = 'SELECT name FROM students;';
                    pool.query(sql, function(error, results, fields){
                        if (error) throw error;
                        res.render('houses_temp', {'results' : houses, 'students' : results});    
                    });    
                });  
            });
        });
    }
    else {
        var sql = 'SELECT house, SUM(points) AS pts FROM students GROUP BY house';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            var houses = results;
            var sql = 'SELECT name FROM students;';
            pool.query(sql, function(error, results, fields){
                if (error) throw error;
                res.render('houses_temp', {'results' : houses, 'students' : results});    
            });    
        });    
    }
});

router.get('/hogwarts/log', function(req, res){
    if('next' in req.query) 
    {
        req.session.offset = parseInt(req.session.offset) + 12;
    }
    else if('prev' in req.query) 
    {
        req.session.offset = parseInt(req.session.offset) - 12;
        if(parseInt(req.session.offset) < 0)
        {
            req.session.offset = 0;
        }
    }
    if(!('add' in req.query))
    {
        var sql = 'SELECT * FROM log WHERE LOCATE(?, action)>0;';
    }
    else if(req.query.add === 'true')
    {
        var sql = 'SELECT * FROM log WHERE LOCATE("to", action)>1 AND LOCATE(?, action)>0;';
    }
    else
    {
        var sql = 'SELECT * FROM log WHERE LOCATE("from", action)>1 AND LOCATE(?, action)>0;';
    }  
    if(req.query.search == "")
    {
        req.query.search = "o";    
    }
    pool.query(sql, [req.query.search], function(error, results, fields){
        if (error) throw error;
        if(results.length > 0)
        {
            while(results.length <= parseInt(req.session.offset)) 
            {
                if(req.session.offset >= 12)
                {
                    req.session.offset = req.session.offset-12;
                }
            }
        }
        console.log("starting on");
        console.log(req.session.offset);
        if(!('add' in req.query)){
            var sql = 'SELECT DATE_FORMAT(time, "%c/%d/%y %h:%i:%s %p") AS t, action, house FROM log WHERE LOCATE(?, action)>0 ORDER BY time DESC LIMIT ?, 12;';
            console.log(sql);
            console.log(req.query.search);
            console.log(req.session.offset);
            pool.query(sql, [req.query.search, req.session.offset], function(error, results, fields){
                if (error) throw error;
                res.render('pointlog', {'results' : results, 'start' : req.session.offset+1});
            });     
        }
        else if(req.query.add === 'true')
        {
            var sql = 'SELECT DATE_FORMAT(time, "%c/%d/%y %h:%i:%s %p") AS t, action, house FROM log WHERE LOCATE(" to ", action)>1 AND LOCATE(?, action)>0 ORDER BY time DESC LIMIT ?, 12;';
            console.log(sql);
            console.log(req.query.search);
            console.log(req.session.offset);
            pool.query(sql, [req.query.search, req.session.offset], function(error, results, fields){
                if (error) throw error;
                res.render('pointlog', {'results' : results, 'start' : req.session.offset+1});
            });     
        }
        else {
            var sql = 'SELECT DATE_FORMAT(time, "%c/%d/%y %h:%i:%s %p") AS t, action, house FROM log WHERE LOCATE(" from ", action)>1 AND LOCATE(?, action)>0 ORDER BY time DESC LIMIT ?, 12;';
            console.log(sql);
            console.log(req.query.search);
            console.log(req.session.offset);
            pool.query(sql, [req.query.search, req.session.offset], function(error, results, fields){
                if (error) throw error;
                res.render('pointlog', {'results' : results, 'start' : req.session.offset+1});
            });   
        }
    });
    
});


router.get('/hogwarts/login', function(req, res){
    req.session.hogwarts = true;
    res.redirect('https://user.tjhsst.edu/2022jjerome/login');
});

module.exports = router;