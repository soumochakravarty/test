const validator = require('validator');
require('../config/config');
///var {Uname} = require('./helper/user');
var User = require('../config/hoteltokenCon');
var User1 = require('../config/hoteltokenCon');
var Hoteltoken = require('../config/hoteltokenCon');
var Hoteltoken1 = require('../config/hoteltokenCon');
var Hoteltoken2 = require('../config/hoteltokenCon');
var Hoteltoken3 = require('../config/hoteltokenCon');
var bodyParser = require('body-parser');
var parser = require('json-parser');
var {authenticate} = require('../middleware/authenticate');
const jwt = require('jsonwebtoken');
//const _ = require('lodash');
const bcrypt = require('bcryptjs');
module.exports = function(app) {


    app.post('/users', function(req,res) {
        var body = req.body; 
        if (req.body.email == "admin@admin.com" ){
        bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(body.password, salt, function(err, hash) {
        body.password = hash;
        User.query("INSERT INTO `user` (`email`, `password`, `restaurant`) VALUES ('"+body.email+"', '"+body.password+"', '');",
          function(err, rows) {
            if(err)
              res.sendStatus(400);
            else
            res.redirect('/thankyou'); 
          });
            
          });
        });
        }
        else{
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
                      }
                      
                        Hoteltoken2.query("SELECT max(restaurantid) as restaurantid, max(buttonid) as buttonid FROM device_lookup;",
                        function(err, rows) {
                          if(err) throw err;
                        
                        var resid_tmp;
                        var btid_tmp;
                        
                        if (rows.length == 0){
                          resid_tmp=1;
                          btid_tmp=1;
                        }
                        else {
                          resid_tmp=rows[0].restaurantid + 1;
                          btid_tmp=rows[0].buttonid + 1 ;
                        }
                        for( var i = 1 ; i <= body.table ; i++){
                        for( var j = 1 ; j <= 4 ; j++){
                          var req_tmp;
                          if ( j == 1)
                          req_tmp='Call';
                          else if( j == 2)
                          req_tmp='Drink';
                          else if( j == 3)
                          req_tmp='Bill';
                          else 
                          req_tmp='CANCEL';
                            Hoteltoken3.query("INSERT INTO `device_lookup` (`restaurantid`, `buttonid`, `request`, `restaurant`, `tid`) VALUES ("+resid_tmp+", "+btid_tmp+", '"+req_tmp+"', '"+body.restaurant+"', "+i+");",
                            function(err, rows) {
                              if(err) throw err;
                            });
                            btid_tmp++;
                          }

                        }
                        });
                    }
                    res.redirect('/thankyou'); 
                  });  
                }
                 })
            });
        });
      }
    }
      });
      
// Login API for USERS 

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
// Log Out API for USERS
      app.get('/users/logout', authenticate, (req, res) => {
        req.session.destroy(function(err) {
          if(err) {
            console.log(err);
          } else {
            res.redirect('/');
          }
        });
      });

      // Reset password API for USERS
      app.post('/users/resetpwd', authenticate, function(req, res) {
        sess=req.session;
        var body = req.body;
        if (!body.password  || !body.password1 || (sess.email != "admin@admin.com" && body.email != sess.email) || body.password != body.password1)
        res.sendStatus(400);
        else {
          bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(body.password, salt, function(err, hash) {
          body.password = hash;
          User.query("Update `user` set password='"+body.password+"' WHERE email='"+req.body.email+"';",
              function(err, rows) {
              if(err) throw err;
              res.redirect('/thankyou'); 
              });
          })});
        }
      });

    // Delete USER API 
      app.post('/users/deluser', authenticate, function(req, res) {
        var body = req.body;
        if (!body.email  || !body.restaurant)
        res.sendStatus(400);
        else {
         
        User.query("SELECT email FROM user WHERE restaurant='"+body.restaurant+"';",
          function(err, rows) {
          if(err) throw err;
          var length = rows.length;
          
          if (length == 0)
          res.sendStatus(400);
          else
          {
            if (length == 1)
            {
              if (body.email == rows[0].email)
              {
              
              User1.query("Delete FROM user WHERE restaurant='"+body.restaurant+"' and email='"+body.email+"';",
              function(err, rows) {
                if(err) throw err;
              });
              Hoteltoken.query("Delete FROM Hoteltoken WHERE restaurant='"+body.restaurant+"';",
              function(err, rows) {
                if(err) throw err;
              });
              Hoteltoken1.query("Delete FROM device_lookup WHERE restaurant='"+body.restaurant+"';",
              function(err, rows) {
                if(err) throw err;
              });
              res.redirect('/thankyou');  
              }
              else {
                res.sendStatus(400);
              }
            }
            else{
              User1.query("Delete FROM user WHERE restaurant='"+body.restaurant+"' and email='"+body.email+"';",
              function(err, rows) {
                if(err) throw err;
                res.redirect('/thankyou');  
              });
              }
                
          }

      });
    }
  });
}