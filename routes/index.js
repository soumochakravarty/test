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

router.get('/thankyou', (req, res) => {
  res.render('index/thankyou');
});

router.get('/dashboard', authenticate, (req, res) => {
  res.render('index/dashboard');
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