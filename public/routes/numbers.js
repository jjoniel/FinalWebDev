const express = require('express');
const router = express.Router({strict: true});

router.get('/numfacts', function(req, res){
    res.render('numform');   
});

router.get('/num', function(req, res){
    var facts0 = ["0 is neither positive nor negative", "Any number multiplied by 0 is 0", "You cannot divide by 0"];
    var facts1 = ["1 is a positive number", "1 is between 0 and 2", "1 is neither prime nor composite"];
    var facts2 = ["2 is an even number", "All even numbers are divisible by 2", "2 is the only even prime number"];
    var facts3 = ["3 is an odd number", "3 is a factor of 6", "3 is a prime number"];
    var factlist = null;
    var number = req.query.number;
    console.log(req.query.num_facts);
    if('num_facts' in req.query){
        numfacts = parseInt(req.query.num_facts);     
        if(isNaN(numfacts)){
            numfacts = 1;
        }
    }
    else{
        numfacts = 1;
    }
    switch(number) {
        case '0':
            factlist = facts0.slice(0, numfacts);
            break;
        case '1':
            factlist = facts1.slice(0, numfacts);
            break;
        case '2':
            factlist = facts2.slice(0, numfacts);
            break;
        case '3':
            factlist = facts3.slice(0, numfacts);
            break;
        default:
            number = 2;
            factlist = facts2.slice(0, numfacts);
            break;
    }
    var params = {
        'value' : number,
        'facts' : factlist
    };
    if('format' in req.query){
        if(req.query.format == "json"){
            res.json(params);    
        } 
        else{
            res.render('numcontent', params);    
        }   
    }
    else{
        res.render('numcontent', params);    
    }
});

module.exports = router;