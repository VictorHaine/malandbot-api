"use strict";
const express = require("express");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const path = require("path");
const cache =require("memory-cache");

let app = express();
let port = process.env.PORT || 3000;
let publicDir = path.join(__dirname, 'public');

app.use(morgan('dev'));
app.use('/', express.static(publicDir));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(function(req, res, next){
    
    var roboList = cache.get('roboList');
    
    if(!roboList)
        roboList = {};
    
    req.roboList = roboList;
    
    next();
});

app.get('/', (req, res) => {
   res.send('hello'); 
});

app.get('/:roboid', (req, res) => {
    
    var commandList = req.roboList[req.params.roboid];
    
    if(!commandList)
        res.send('null');
    
    res.send(commandList.shift());
});

app.get('/move/:roboid/:direction', (req, res) => {
    
    var commandList = req.roboList[req.params.roboid];
    
    if(!commandList)
        commandList = [];
        
    commandList.push(req.params.direction);
    req.roboList[req.params.roboid] = commandList;
    
    cache.put("roboList", req.roboList);
    res.send(`${req.params.roboid} - ${req.params.direction}`); 
});

app.listen(port);