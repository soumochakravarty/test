require('./config/config');
var express = require('express');
var app = express();
var mysql = require('mysql');
var apiController = require('./controllers/apiController');
var userController = require('./controllers/userController');
const exphbs = require('express-handlebars');
var session = require('express-session');
const fileUpload = require('express-fileupload');

var port = process.env.PORT;
var sess;
var idleTimeoutSeconds = 1000;
app.use('/', express.static(__dirname + '/public'));
app.use(session({secret: process.env.JWT_SECRET,resave: true,cookie: {
  maxAge: idleTimeoutSeconds * 1000,
  },
  rolling: true,
  saveUninitialized: true}));
// Load Routes
const index = require('./routes/index');
// Handlebars Helpers
const {
  equal,
  ifcon
} = require('./helper/hbs');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  helpers: {
    equal: equal,
    ifcon: ifcon
  },
  defaultLayout:'main'
}));

app.use(fileUpload());


app.set('view engine', 'handlebars');

apiController(app);
userController(app);

// Use Routes
app.use('/', index);

app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}/` );
});



