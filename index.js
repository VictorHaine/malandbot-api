"use strict";
const express = require("express");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const path = require("path");
const cache =require("memory-cache");

let app = express();
let port = 80;
let publicDir = path.join(__dirname, 'public');

app.use(morgan('dev'));
//app.use('/', express.static(publicDir));
//app.use(bodyparser.json());
//app.use(bodyparser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
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
    if(!commandList) {
	res.send('');
	return;
    }

    var command = commandList.shift();
    if(!command) {
        res.send('');
        return;
    } 

    var now = Date.now();
    if((now - command.timeStamp) > 3000) {
        req.roboList[req.params.roboid] = [];
        cache.put("roboList", req.roboList);
        res.send('');
        return;
    }

    res.send(command.command);
});

app.get('/move/:roboid/:direction', (req, res) => {
    
    var commandList = req.roboList[req.params.roboid];
    
    if(!commandList)
        commandList = [];

    var command = {command: req.params.direction, timeStamp: Date.now()};        

    commandList.push(command);
    req.roboList[req.params.roboid] = commandList;
    
    cache.put("roboList", req.roboList);
    res.send(`${req.params.roboid} - ${req.params.direction}`); 
});

app.listen(port);
