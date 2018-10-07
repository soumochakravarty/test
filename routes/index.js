const express = require('express');
const router = express.Router();
var {authenticate} = require('../middleware/authenticate');
var Hoteltoken = require('../config/hoteltokenCon');
//const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', (req, res) => {
  res.render('index/login');
});

router.get('/about', (req, res) => {
  res.render('index/about');
});

router.get('/thankyou', authenticate, (req, res) => {
  res.render('index/thankyou');
});

router.get('/dashboard', authenticate, (req, res) => {
  res.render('index/dashboard');
});

router.get('/createuser', authenticate, (req, res) => {
  res.render('index/createuser');
});
router.get('/restpwd', authenticate, (req, res) => {
  res.render('index/restpwd');
});
router.get('/deluser', authenticate, (req, res) => {
  res.render('index/deluser');
});
router.get('/userdetail', authenticate, (req, res) => {
  var users =[];
  var rest =[];
  Hoteltoken.query("SELECT email,restaurant FROM `user` WHERE email !='admin@admin.com' ORDER BY restaurant",
  function(err, rows) {
      if(err) throw err;
    var length = rows.length;
     for( var i = 0 ; i<length ; i++){
      users[i]= rows[i].email + " : " + rows[i].restaurant;
      }

  res.render('index/userdetail',{users:users});
});

});


router.get('/setup', authenticate, (req, res) => {
  sess=req.session;
  var table =[];
  Hoteltoken.query("SELECT tid FROM `Hoteltoken` WHERE restaurant ='"+sess.restaurant+"'",
  function(err, rows) {
      if(err) throw err;
      var length = rows.length;
     for( var i = 0 ; i<length ; i++){
          table[i]= "Table " + rows[i].tid;
      }
  res.render('index/setup',{table:table});
});
});

module.exports = router;