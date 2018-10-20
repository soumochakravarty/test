var Hoteltoken = require('../config/hoteltokenCon');
var Hoteltoken1 = require('../config/hoteltokenCon');
var Hoteltoken2 = require('../config/hoteltokenCon');
var Hoteltoken3 = require('../config/hoteltokenCon');
var User = require('../config/hoteltokenCon');
var bodyParser = require('body-parser');
var parser = require('json-parser');
var path = require('path');
var {authenticate} = require('../middleware/authenticate');
var excel = require('exceljs');
var tempfile = require('tempfile');


module.exports = function(app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/api/hoteltoken', function(req,res) {
    sess=req.session;
Hoteltoken.query("SELECT tid, waiter, request, start_time FROM `Hoteltoken` WHERE request !='CANCEL' and restaurant='"+sess.restaurant+"' ORDER BY start_time limit 10",
//Hoteltoken.query("SELECT tid, waiter, request, start_time FROM `tb3` WHERE request !='CANCEL' ORDER BY start_time limit 10",
        function(err, rows) {
            if(err) throw err;
var res_data = '{"cols":[ {"id":"","label":"Table","pattern":"","type":"string"}, {"id":"","label":"Wait time","pattern":"","type":"number"}, {"id":"","label":"","pattern":"","type":"string","p":{"role":"style"}} , {"id":"","label":"","pattern":"","type":"string","p":{"role":"tooltip"}} ], "rows":[ ' ;
var length  = rows.length;
var dif_min;
var temp_waiter;
if (length === 0 ){
    res_data = res_data + '{"c":[{"v":" ","f":null},{"v":0,"f":null}, {"v":"green","f":null},{"v":" ","f":null} ]}, ';
}
for(var i=0;i<length;i++){
dif_min=  Math.round(Math.abs((new Date()- new Date(rows[i].start_time)) / 60000 ));
temp_waiter=rows[i].waiter + " " + dif_min +" min";
if (dif_min <=2 ){
res_data = res_data + '{"c":[{"v":"Table ' + rows[i].tid + '","f":null},{"v":'+ dif_min + ',"f":null}, {"v":"green","f":null},{"v":"'+temp_waiter+'","f":null} ]}, ';
}
else if (dif_min>2 && dif_min <=6){
    res_data = res_data + '{"c":[{"v":"Table ' + rows[i].tid + '","f":null},{"v":'+ dif_min + ',"f":null}, {"v":"yellow","f":null},{"v":"'+temp_waiter+'","f":null} ]}, ';
}
else{
    res_data = res_data + '{"c":[{"v":"Table ' + rows[i].tid + '","f":null},{"v":'+ dif_min + ',"f":null}, {"v":"red","f":null},{"v":"'+temp_waiter+'","f":null} ]}, ';
}


}
var res_data_fin = res_data.substring(0, res_data.length-2);
res_data_fin = res_data_fin + '], "p":null }';
 res.send(res_data_fin);
    }
);        
    });

//Waiter 
app.get('/api/waiter', function(req,res) {
    sess=req.session;
    Hoteltoken.query("SELECT waiter, count(*) as tables FROM `Hoteltoken` WHERE request !='CANCEL' and restaurant='"+sess.restaurant+"' group by (waiter)",
    //Hoteltoken.query("SELECT waiter, count(*) as tables FROM `tb3` WHERE request !='CANCEL' group by (waiter)",
            function(err, rows) {
                if(err) throw err;
    var res_data = '{"cols":[ {"id":"","label":"Waiter","pattern":"","type":"string"}, {"id":"","label":"Tables","pattern":"","type":"number"} ], "rows":[ ' ;
    var length  = rows.length;
    if (length === 0 ){
        res_data = res_data + '{"c":[{"v":" ","f":null},{"v":0,"f":null} ]}, ';
    }
    for(var i=0;i<length;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].waiter + '","f":null},{"v":'+ rows[i].tables + ',"f":null} ]}, ';
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data_fin = res_data_fin + '] }';
     res.send(res_data_fin);
        }
    );        
        });

//Reason 
app.get('/api/request', function(req,res) {
    sess=req.session;
    Hoteltoken.query("SELECT request, count(*) as number FROM `Hoteltoken` WHERE request !='CANCEL' and restaurant='"+sess.restaurant+"' group by (request)",
    //Hoteltoken.query("SELECT request, count(*) as number FROM `tb3` WHERE request !='CANCEL' group by (request)",
    
            function(err, rows) {
                if(err) throw err;
    var res_data = '{"cols":[ {"id":"","label":"Request","pattern":"","type":"string"}, {"id":"","label":"Number","pattern":"","type":"number"} ], "rows":[ ' ;
    var length  = rows.length;
    if (length === 0 ){
        res_data = res_data + '{"c":[{"v":" ","f":null},{"v":0,"f":null} ]}, ';
    }
    for(var i=0;i<length;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].request + '","f":null},{"v":'+ rows[i].number + ',"f":null} ]}, ';
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data_fin = res_data_fin + '] }';
    
     res.send(res_data_fin);
        }
    );        
        });
    app.post('/api/waiter/update', function(req, res) {
            sess=req.session;
            for(var table in req.body){
                var table_no= table.substring(6, table.length);
        if (req.body[table])
        Hoteltoken.query("UPDATE `Hoteltoken` SET `waiter`='"+req.body[table]+"' where tid="+table_no+" and restaurant='"+sess.restaurant+"'",
        function(err, rows) {
            if(err) throw err;
    });
    }
      res.redirect('/thankyou');
        
              });


            app.post('/api/table/update', function(req, res) {
            User.query("SELECT email FROM user WHERE restaurant='"+req.body.restaurant+"';",
                function(err, rows) {
                if(err) throw err;
                var length = rows.length;
            if (!req.body.restaurant  || !req.body.table || length == 0 )
                res.sendStatus(400)
            else {
            Hoteltoken.query("Delete FROM Hoteltoken WHERE restaurant='"+req.body.restaurant+"';",
                function(err, rows) {
                  if(err) throw err;
                });
                var btid_tmp;
                
                Hoteltoken2.query("SELECT max(buttonid) as buttonid FROM `device_lookup;",
                function(err, rows) {
                  if(err) throw err;
                if (rows.length == 0){
                  btid_tmp=1;
                }
                else {
                  btid_tmp=rows[0].buttonid + 1 ;
                }});
            var resid_tmp;
            var tid_tmp;
            for( var i = 1 ; i <= req.body.table ; i++){
                    Hoteltoken1.query("INSERT INTO `Hoteltoken` (`tid`, `restaurant`, `waiter`, `request`, `start_time`) VALUES ('"+i+"', '"+req.body.restaurant+"', '', 'CANCEL', '');",
                    function(err, rows) {
                      if(err) throw err;
                    });
                }
            for( var i = 1 ; i <= req.body.table ; i++){    
                Hoteltoken1.query("SELECT restaurantid ,tid FROM `device_lookup` WHERE restaurant='"+req.body.restaurant+"' and tid="+i+";",
                function (err, rows) {
                if(err) throw err;
                var length  = rows.length;
                if (length != 0){
                tid_tmp=rows[0].tid;
                resid_tmp=rows[0].restaurantid;
                }
                else {
                tid_tmp++;
                for( var j = 1 ; j <= 4 ; j++){
                    var req_tmp;
                    if ( j == 1)
                    req_tmp='Drink';
                    else if( j == 2)
                    req_tmp='Call';
                    else if( j == 3)
                    req_tmp='Bill';
                    else 
                    req_tmp='CANCEL';
                      Hoteltoken3.query("INSERT INTO `device_lookup` (`restaurantid`, `buttonid`, `request`, `restaurant`, `tid`) VALUES ("+resid_tmp+", "+btid_tmp+", '"+req_tmp+"', '"+req.body.restaurant+"', "+tid_tmp+");",
                      function(err, rows) {
                        if(err) throw err;
                      });
                      btid_tmp++;
                    }

                }
                    });
                }
            res.redirect('/thankyou');
            }
        });
            });

        app.post('/api/history', function(req, res) {
        sess=req.session;
        var workbook = new excel.Workbook(); //creating workbook
        var sheet = workbook.addWorksheet('History Data'); //creating worksheet
        var valueArray = ['Table No','Restaurant Name','Owner','Request','Time','Wait Time'];
        sheet.addRow(valueArray);
        Hoteltoken.query("SELECT tid, restaurant, waiter, request, start_time, wait_time FROM `history` WHERE restaurant='"+sess.restaurant+"' AND start_time between '"+req.body.sdate+"' AND '"+req.body.edate+"';",
        function(err, rows) {
        if(err) throw err;
        var length  = rows.length;
        for(var i=0;i<length;i++)
        sheet.addRow([rows[i].tid,rows[i].restaurant,rows[i].waiter,rows[i].request,rows[i].start_time,rows[i].wait_time]);
            var tempFilePath = tempfile('.xlsx');
            workbook.xlsx.writeFile(tempFilePath).then(function() {
            res.sendFile(tempFilePath);
        });
          })
                });
            app.get('/device/:restid/:dvcid', function(req, res) {
           Hoteltoken.query("SELECT request, restaurant, tid FROM device_lookup WHERE restaurantid="+req.params.restid+" and buttonid="+req.params.dvcid+";",
           function(err, rows) {
            if(err) throw err;
            var length  = rows.length;
            if (length === 0 || length > 1 ){
                res.sendStatus(400);
            }
            else{
            var resnm_tmp = rows[0].restaurant;
            var tid_tmp = rows[0].tid;
            var req_tmp = rows[0].request;
            Hoteltoken1.query("UPDATE Hoteltoken set request='"+req_tmp+"', start_time=NOW() WHERE restaurant='"+resnm_tmp+"' and tid="+tid_tmp+";",
            function(err, rows) {
                if(err) throw err;
                else {
                    res.sendStatus(200);        
                }
            });
        }
    });
                });


//Dail Over all Wait Time  
app.get('/api/dailyall', function(req,res) {
    sess=req.session;
    Hoteltoken.query("SELECT start_time as time, wait_time FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 1 ORDER BY start_time;",

            function(err, rows) {
                if(err) throw err;
    var res_data = '{"cols":[ {"id":"","label":"Time","pattern":"","type":"string"}, {"id":"","label":"Wait Time","pattern":"","type":"number"} ], "rows":[ ' ;
    var length  = rows.length;
    for(var i=0;i<length;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].time + '","f":null},{"v":'+ rows[i].wait_time + ',"f":null} ]}, ';
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data_fin = res_data_fin + '] }';
    if (length == 0 ){
        res_data = "";
    }
     res.send(res_data_fin);
        }
    );        
        });
//Dail Over Individual Wait Time  
app.get('/api/dailyind', function(req,res) {
    sess=req.session;
    var waiter =[];
    var res_data;
    Hoteltoken.query("SELECT DISTINCT waiter FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 1;",
    function(err, rows) {
    if(err) throw err;
    var length  = rows.length;
    if (length == 0 ){
    res_data = "";
    res.send(res_data_fin);
    }
    else {
    res_data = '{"cols":[ {"id":"","label":"Time","pattern":"","type":"string"}, '
    for(var i=0;i<length;i++){
    res_data = res_data + '{"id":"","label":"'+rows[i].waiter+'","pattern":"","type":"number"}, '
    waiter[i] =rows[i].waiter;
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data = res_data_fin + ' ], "rows":[ ';
Hoteltoken1.query("SELECT start_time as time, wait_time, waiter FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 1 ORDER BY start_time;",
    function(err, rows) {
    if(err) throw err;
    var length1  = rows.length;
    for(var i=0;i< length1;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].time + '","f":null}, ';
        for(var j=0;j < waiter.length;j++){
            if (waiter[j] == rows[i].waiter)
            res_data = res_data + '{"v":"' + rows[i].wait_time + '","f":null}, ';
            else
            res_data = res_data + '{"v":"","f":null}, ';
        }
        var res_data_fin = res_data.substring(0, res_data.length-2);
        res_data = res_data_fin + ' ]}, ';
        }
        var res_data_fin = res_data.substring(0, res_data.length-2);
        res_data_fin = res_data_fin + '] }';
        res.send(res_data_fin);
    });
}
    });
});


// Weekly Over All
app.get('/api/weeklyall', function(req,res) {
    sess=req.session;
    Hoteltoken.query("SELECT start_time as time, wait_time FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 8 ORDER BY start_time;",

            function(err, rows) {
                if(err) throw err;
    var res_data = '{"cols":[ {"id":"","label":"Time","pattern":"","type":"string"}, {"id":"","label":"Wait Time","pattern":"","type":"number"} ], "rows":[ ' ;
    var length  = rows.length;
    for(var i=0;i<length;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].time + '","f":null},{"v":'+ rows[i].wait_time + ',"f":null} ]}, ';
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data_fin = res_data_fin + '] }';
    if (length == 0 ){
        res_data = "";
    }
    
     res.send(res_data_fin);
        }
    );        
        });
//Dail Over Individual Wait Time  
app.get('/api/weeklyind', function(req,res) {
    sess=req.session;
    var waiter =[];
    var res_data;
    Hoteltoken.query("SELECT DISTINCT waiter FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 8;",
    function(err, rows) {
    if(err) throw err;
    var length  = rows.length;
    if (length == 0 ){
    res_data = "";
    res.send(res_data_fin);
    }
    else {
    res_data = '{"cols":[ {"id":"","label":"Time","pattern":"","type":"string"}, '
    for(var i=0;i<length;i++){
    res_data = res_data + '{"id":"","label":"'+rows[i].waiter+'","pattern":"","type":"number"}, '
    waiter[i] =rows[i].waiter;
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data = res_data_fin + ' ], "rows":[ ';
Hoteltoken1.query("SELECT start_time as time, wait_time, waiter FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 8 ORDER BY start_time;",
    function(err, rows) {
    if(err) throw err;
    var length1  = rows.length;
    for(var i=0;i< length1;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].time + '","f":null}, ';
        for(var j=0;j < waiter.length;j++){
            if (waiter[j] == rows[i].waiter)
            res_data = res_data + '{"v":"' + rows[i].wait_time + '","f":null}, ';
            else
            res_data = res_data + '{"v":"","f":null}, ';
        }
        var res_data_fin = res_data.substring(0, res_data.length-2);
        res_data = res_data_fin + ' ]}, ';
        }
        var res_data_fin = res_data.substring(0, res_data.length-2);
        res_data_fin = res_data_fin + '] }';
        res.send(res_data_fin);
    });
}
    });
});


//Monthly Over all 
app.get('/api/monthlyall', function(req,res) {
    sess=req.session;
    Hoteltoken.query("SELECT start_time as time, wait_time FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 32 ORDER BY start_time;",

            function(err, rows) {
                if(err) throw err;
    var res_data = '{"cols":[ {"id":"","label":"Time","pattern":"","type":"string"}, {"id":"","label":"Wait Time","pattern":"","type":"number"} ], "rows":[ ' ;
    var length  = rows.length;
    for(var i=0;i<length;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].time + '","f":null},{"v":'+ rows[i].wait_time + ',"f":null} ]}, ';
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data_fin = res_data_fin + '] }';
    if (length == 0 ){
        res_data = "";
    }
     res.send(res_data_fin);
        }
    );        
        });
//Dail Over Individual Wait Time  
app.get('/api/monthlyind', function(req,res) {
    sess=req.session;
    var waiter =[];
    var res_data;
    Hoteltoken.query("SELECT DISTINCT waiter FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 32;",
    function(err, rows) {
    if(err) throw err;
    var length  = rows.length;
    if (length == 0 ){
    res_data = "";
    res.send(res_data_fin);
    }
    else {
    res_data = '{"cols":[ {"id":"","label":"Time","pattern":"","type":"string"}, '
    for(var i=0;i<length;i++){
    res_data = res_data + '{"id":"","label":"'+rows[i].waiter+'","pattern":"","type":"number"}, '
    waiter[i] =rows[i].waiter;
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data = res_data_fin + ' ], "rows":[ ';
Hoteltoken1.query("SELECT start_time as time, wait_time, waiter FROM history WHERE restaurant='"+sess.restaurant+"' AND TIMESTAMPDIFF(DAY,start_time,NOW()) < 32 ORDER BY start_time;",
    function(err, rows) {
    if(err) throw err;
    var length1  = rows.length;
    for(var i=0;i< length1;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].time + '","f":null}, ';
        for(var j=0;j < waiter.length;j++){
            if (waiter[j] == rows[i].waiter)
            res_data = res_data + '{"v":"' + rows[i].wait_time + '","f":null}, ';
            else
            res_data = res_data + '{"v":"","f":null}, ';
        }
        var res_data_fin = res_data.substring(0, res_data.length-2);
        res_data = res_data_fin + ' ]}, ';
        }
        var res_data_fin = res_data.substring(0, res_data.length-2);
        res_data_fin = res_data_fin + '] }';
        res.send(res_data_fin);
    });
}
    });
});

// Wait time Table
app.get('/api/waitertable', function(req,res) {
    sess=req.session;
    Hoteltoken.query("SELECT waiter, count(*) as tables, MAX(TIMESTAMPDIFF(MINUTE,start_time,NOW())) as wait_time FROM `Hoteltoken` WHERE request !='CANCEL' and restaurant='"+sess.restaurant+"' group by (waiter)",
    //Hoteltoken.query("SELECT waiter, count(*) as tables FROM `tb3` WHERE request !='CANCEL' group by (waiter)",
            function(err, rows) {
                if(err) throw err;
    var res_data = '{"cols":[ {"id":"","label":"Name","pattern":"","type":"string"}, {"id":"","label":"Calls","pattern":"","type":"number"}, {"id":"","label":"Wait Time","pattern":"","type":"number"} ], "rows":[ ' ;
    var length  = rows.length;
    if (length === 0 ){
        res_data = res_data + '{"c":[{"v":" ","f":null},{"v":0,"f":null},{"v":0,"f":null} ]}, ';
    }
    for(var i=0;i<length;i++){
    res_data = res_data + '{"c":[{"v":"' + rows[i].waiter + '","f":null},{"v":'+ rows[i].tables + ',"f":null},{"v":'+ rows[i].wait_time + ',"f":null} ]}, ';
    }
    var res_data_fin = res_data.substring(0, res_data.length-2);
    res_data_fin = res_data_fin + '] }';
     res.send(res_data_fin);
        }
    );        
        });


                
}