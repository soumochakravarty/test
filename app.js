require('./config/config');
var express = require('express');
var app = express();
var mysql = require('mysql');
var apiController = require('./controllers/apiController');
var userController = require('./controllers/userController');
const exphbs = require('express-handlebars');
var session = require('express-session');

var port = process.env.PORT;
var sess;
app.use('/', express.static(__dirname + '/public'));
app.use(session({secret: process.env.JWT_SECRET,resave: true,
  saveUninitialized: true}));
// Load Routes
const index = require('./routes/index');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout:'main'
}));
app.set('view engine', 'handlebars');

apiController(app);
userController(app);

// Use Routes
app.use('/', index);

app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}/` );
});


