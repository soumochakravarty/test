require('./config/config');
var express = require('express');
var app = express();
var mysql = require('mysql');
var apiController = require('./controllers/apiController');
var userController = require('./controllers/userController');

var port = process.env.PORT;

app.use('/', express.static(__dirname + '/public'));

//app.set('view engine', 'ejs');
//apiController(app);
userController(app);

app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}/` );
});


