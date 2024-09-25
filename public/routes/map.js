const express = require('express');
const router = express.Router({strict: true});

router.get('/map', function(req, res){
    res.render('map');
});

router.get('/map/usa', function(req, res){
    res.render('usa');
});

router.get('/map/india', function(req, res){
    res.render('india');
});


module.exports = router;