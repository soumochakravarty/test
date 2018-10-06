var Hoteltoken = require('../config/hoteltokenCon');
var bodyParser = require('body-parser');
var parser = require('json-parser');
var path = require('path');
var {authenticate} = require('../middleware/authenticate');

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
        Hoteltoken.query("UPDATE `Hoteltoken` SET `waiter`='"+req.body[table]+"' where tid="+table_no+" and restaurant='"+sess.restaurant+"'",
        function(err, rows) {
            if(err) throw err;
    });
    }
        res.redirect('/thankyou');
              });
}