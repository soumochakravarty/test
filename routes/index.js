const express = require('express');
const router = express.Router();
var {authenticate} = require('../middleware/authenticate');
var Hoteltoken = require('../config/hoteltokenCon');
var Hoteltoken1 = require('../config/hoteltokenCon');
var Hoteltoken2 = require('../config/hoteltokenCon');
//const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/login', (req, res) => {
  res.render('index/login');
});

router.get('/', (req, res) => {
  var url=req.originalUrl;
  res.render('index/home_new',{url:url});
});

router.get('/home_thankyou', (req, res) => {
  var url=req.originalUrl;
  res.render('index/home_thankyou',{url:url});
});

router.get('/product', (req, res) => {
  var url=req.originalUrl;
  res.render('index/product',{url:url});
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
router.get('/history', authenticate, (req, res) => {
  res.render('index/history');
});

router.get('/cancel', authenticate, (req, res) => {
  var call_no =[];
  Hoteltoken.query("SELECT tid , TIMESTAMPDIFF(MINUTE,start_time,NOW()) as wait_time FROM Hoteltoken WHERE request !='CANCEL' and restaurant='"+sess.restaurant+"' ORDER BY wait_time DESC;",
  function(err, rows) {
    if(err) throw err;
    var length = rows.length;
     for( var i = 0 ; i<length ; i++){
      call_no[i]= rows[i];
     }
      res.render('index/cancel',{call_no:call_no});
    });
});


router.get('/devicestp', authenticate, (req, res) => {
  var restaurant =[];
  Hoteltoken.query("SELECT DISTINCT restaurant FROM device_lookup;",
  function(err, rows) {
      if(err) throw err;
    var length = rows.length;
     for( var i = 0 ; i<length ; i++){
      restaurant[i]= rows[i];
     }
      res.render('index/devicestp',{restaurant:restaurant});
    });
  
});

router.get('/dailyanz', authenticate, (req, res) => {
  var daily =[];
  var weekly =[];
  var monthly =[];
  sess=req.session;
  Hoteltoken.query("SELECT waiter, AVG(wait_time) AS WAIT_TIME , COUNT(*) AS CALLS FROM history WHERE restaurant='"+sess.restaurant+"' and TIMESTAMPDIFF(DAY,start_time,NOW()) < 1 GROUP BY waiter ORDER BY WAIT_TIME;",
  function(err, rows) {
      if(err) throw err;
    var length = rows.length;
     for( var i = 0 ; i<length ; i++){
      daily[i]= rows[i];
    }
  Hoteltoken1.query("SELECT waiter, AVG(wait_time) AS WAIT_TIME , COUNT(*) AS CALLS FROM history WHERE restaurant='"+sess.restaurant+"' and TIMESTAMPDIFF(DAY,start_time,NOW()) < 8 GROUP BY waiter ORDER BY WAIT_TIME;",
      function(err, rows) {
          if(err) throw err;
        var length = rows.length;
         for( var i = 0 ; i<length ; i++){
          weekly[i]= rows[i];
        }
  Hoteltoken2.query("SELECT waiter, AVG(wait_time) AS WAIT_TIME , COUNT(*) AS CALLS FROM history WHERE restaurant='"+sess.restaurant+"' and TIMESTAMPDIFF(DAY,start_time,NOW()) < 32 GROUP BY waiter ORDER BY WAIT_TIME;",
        function(err, rows) {
              if(err) throw err;
            var length = rows.length;
             for( var i = 0 ; i<length ; i++){
          monthly[i]= rows[i];}
  res.render('index/dailyanz',{daily:daily,weekly:weekly,monthly:monthly});
              });
          });    
      });
});

router.get('/daily', authenticate, (req, res) => {
  var daily =[];
  sess=req.session;
  Hoteltoken.query("SELECT waiter, AVG(wait_time) AS WAIT_TIME , COUNT(*) AS CALLS FROM history WHERE restaurant='"+sess.restaurant+"' and TIMESTAMPDIFF(DAY,start_time,NOW()) < 1 GROUP BY waiter ORDER BY WAIT_TIME;",
  function(err, rows) {
      if(err) throw err;
    var length = rows.length;
     for( var i = 0 ; i<length ; i++){
      daily[i]= rows[i];
    }
  
  res.render('index/daily',{daily:daily});
              });
          });    


router.get('/weekly', authenticate, (req, res) => {
  var weekly =[];
  sess=req.session;
  Hoteltoken1.query("SELECT waiter, AVG(wait_time) AS WAIT_TIME , COUNT(*) AS CALLS FROM history WHERE restaurant='"+sess.restaurant+"' and TIMESTAMPDIFF(DAY,start_time,NOW()) < 8 GROUP BY waiter ORDER BY WAIT_TIME;",
      function(err, rows) {
          if(err) throw err;
        var length = rows.length;
         for( var i = 0 ; i<length ; i++){
          weekly[i]= rows[i];
        }
  res.render('index/weekly',{weekly:weekly});
              });
          });    


router.get('/monthly', authenticate, (req, res) => {
  var monthly =[];
  sess=req.session;
  Hoteltoken2.query("SELECT waiter, AVG(wait_time) AS WAIT_TIME , COUNT(*) AS CALLS FROM history WHERE restaurant='"+sess.restaurant+"' and TIMESTAMPDIFF(DAY,start_time,NOW()) < 32 GROUP BY waiter ORDER BY WAIT_TIME;",
        function(err, rows) {
              if(err) throw err;
            var length = rows.length;
             for( var i = 0 ; i<length ; i++){
          monthly[i]= rows[i];}
  res.render('index/monthly',{monthly:monthly});
              });
          });    


router.get('/updtable', authenticate, (req, res) => {
  res.render('index/updtable');
});

router.get('/userdetail', authenticate, (req, res) => {
  var users =[];
  Hoteltoken.query("SELECT email,restaurant FROM `user` WHERE email !='admin@admin.com' ORDER BY restaurant",
  function(err, rows) {
      if(err) throw err;
    var length = rows.length;
     for( var i = 0 ; i<length ; i++){
      users[i]= rows[i];
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