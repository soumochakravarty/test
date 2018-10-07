const validator = require('validator');
require('../config/config');
///var {Uname} = require('./helper/user');
var User = require('../config/hoteltokenCon');
var Hoteltoken = require('../config/hoteltokenCon');
var Hoteltoken1 = require('../config/hoteltokenCon');
var bodyParser = require('body-parser');
var parser = require('json-parser');
var {authenticate} = require('../middleware/authenticate');
const jwt = require('jsonwebtoken');
//const _ = require('lodash');
const bcrypt = require('bcryptjs');
module.exports = function(app) {
    /*app.use(session({secret: process.env.JWT_SECRET,resave: true,
    saveUninitialized: true}));*/

    app.post('/users', function(req,res) {
        var body = req.body; 
        if (!body.password  || !body.restaurant || !validator.isEmail(body.email) || !body.table)
        res.sendStatus(400);
        else {
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(body.password, salt, function(err, hash) {
              body.password = hash;
              User.query("INSERT INTO `user` (`email`, `password`, `restaurant`) VALUES ('"+body.email+"', '"+body.password+"', '"+body.restaurant+"');",
              function(err, rows) {
                if(err) {
                  res.sendStatus(400);
                }else {
                  Hoteltoken.query("SELECT tid FROM `Hoteltoken` WHERE restaurant ='"+body.restaurant+"'",
                  function(err, rows) {
                      if(err) throw err;
                      if (rows.length == 0)  
                      {
                      for( var i = 1 ; i <= body.table ; i++){
                        Hoteltoken1.query("INSERT INTO `Hoteltoken` (`tid`, `restaurant`, `waiter`, `request`, `start_time`) VALUES ('"+i+"', '"+body.restaurant+"', '', 'CANCEL', '');",
                        function(err, rows) {
                          if(err) throw err;
                        });
                    }}
                    res.redirect('/thankyou'); 
                  });  
                }
                 })
            });
        });
      }
      });
      
      /*app.get('/users/me', authenticate, (req, res) => {
        res.send(req.user);
      });*/

      app.post('/users/login', function(req, res) {
        sess=req.session;
        
        User.query("SELECT email, password,restaurant FROM user WHERE email='"+req.body.email+"';",
          function(err, rows) {
          if(err) throw err;
          if (req.body.email == "admin@admin.com" && (rows.length == 0 || !rows[0].password)){
            sess.email= req.body.email;
            res.redirect('/userdetail');
          }
          else {
          if (rows.length == 0 || rows.length > 1 ){
            console.log("Error User not Present");
            res.sendStatus(400);}
          else {
            sess.restaurant= rows[0].restaurant;
          bcrypt.compare(req.body.password, rows[0].password, (err, val) => {
              if (val) {
                  sess.email= req.body.email;
                  if (req.body.email == "admin@admin.com" ){
                  res.redirect('/userdetail');
                  }
                  else{
                  res.redirect('/dashboard');}
              } else {
                console.log("Password not matched");
                res.sendStatus(400);
              }});
              }
            }
            });

          });
      
      app.get('/users/logout', authenticate, (req, res) => {
        req.session.destroy(function(err) {
          if(err) {
            console.log(err);
          } else {
            res.redirect('/');
          }
        });
      });

}