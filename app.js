var express = require('express');
var app = express();
var mysql = require('mysql');
var apiController = require('./controllers/apiController');

var port = process.env.PORT || 3000;

app.use('/', express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
apiController(app);

app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}/` );
});


