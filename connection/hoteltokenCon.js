var mysql = require('mysql');

var Hoteltoken = mysql.createConnection({
    host: "localhost",
    user: "test",
    password: "test123",
    database: "hotel"
    //host: "103.207.129.245",
    //user: "root",
    //password: "",
    //database: "testbase1"
  });
  

module.exports = Hoteltoken;