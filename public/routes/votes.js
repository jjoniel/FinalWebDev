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

// -------------- express 'get' handlers -------------- //


router.get('/vote', function(req,res){
    var sql = 'SELECT * FROM votes;';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        console.log(results);
        params = {
            'votes1' : results[0].count,
            'votes2' : results[1].count,
            'votes3' : results[2].count,
            'votes4' : results[3].count,
            'votes5' : results[4].count,
            'votes6' : results[5].count
        };
        res.render('vote', params);    
    });

    
});

router.get('/vote/vote1', function(req, res){
    var sql = 'UPDATE votes SET count=count+1 WHERE id=1;';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        var sql = 'SELECT count FROM votes WHERE id=1';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            res.json(results[0].count);
        });
    });
});

router.get('/vote/vote2', function(req, res){
    var sql = 'UPDATE votes SET count=count+1 WHERE id=2;';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        var sql = 'SELECT count FROM votes WHERE id=2';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            res.json(results[0].count);
        });   
    });
    
});

router.get('/vote/vote3', function(req, res){
    var sql = 'UPDATE votes SET count=count+1 WHERE id=3;';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        var sql = 'SELECT count FROM votes WHERE id=3';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            res.json(results[0].count);
        });
    });
    
});

router.get('/vote/vote4', function(req, res){
    var sql = 'UPDATE votes SET count=count+1 WHERE id=4;';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        var sql = 'SELECT count FROM votes WHERE id=4';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            res.json(results[0].count);
        });  
    });
    
});

router.get('/vote/vote5', function(req, res){
    var sql = 'UPDATE votes SET count=count+1 WHERE id=5;';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        var sql = 'SELECT count FROM votes WHERE id=5';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            res.json(results[0].count);
        }); 
    });
    
});

router.get('/vote/vote6', function(req, res){
    var sql = 'UPDATE votes SET count=count+1 WHERE id=6;';
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        var sql = 'SELECT count FROM votes WHERE id=6';
        pool.query(sql, function(error, results, fields){
            if (error) throw error;
            res.json(results[0].count);
        }); 
    });
    
});

module.exports = router;