//導入模塊
var request = require("request");
var express = require("express");
var http = require('http');
var pmModel = require('./models/update')
var pmRoute = require('./routes/update');
var cheerio = require("cheerio");
var mongoose = require('mongoose');
var fs = require("fs");

var pm25 = function() {
  request({
    // url: "http://taqm.epa.gov.tw/taqm/tw/Pm25Index.aspx",
    url: "http://taqm.epa.gov.tw/taqm/tw/AqiMap.aspx",
    method: "GET"
  }, function(error, response, body) {
    if (error || !body) {
      return;
    }

    pm.collection.remove( function (err) {
    if (err) throw err;
      // collection is now empty but not deleted
    });

    // 爬完網頁後要做的事情
    var $ = cheerio.load(body);
    var result = [];
    var titles = $("area.jTip");
    var location;
    
    for (var i = 0; i < titles.length; i++) {
        result.push(titles.eq(i).attr('jtitle'));
    }
    
    fs.writeFile("result.json", result, function() {

      var varTime = new Date();
      
      for (var j = 0; j < result.length; j++) {
        var data = JSON.parse(result[j]);
        //console.log(data);
        console.log(data.SiteName + ', PM2.5: '+ data.PM25 +' (' + varTime.toLocaleTimeString() + ')');
        //if(data.SiteName=='前鎮'){
          //console.log(data.SiteName + ', PM2.5: '+ data.PM25 +' (' + varTime.toLocaleTimeString() + ')');
        //}

        // var item = new pm({ SiteName: data.SiteName, AreaKey:data.AreaKey, FPMI:data.FPMI, PM25: data.PM25, PM25_AVG:data.PM25_AVG, PM10_AVG:data.PM10_AVG, Time: varTime.toLocaleTimeString()});
        var item = new pm({ 
          SiteName: data.SiteName, 
          AreaKey: data.AreaKey, 
          AQI: data.AQI,
          O3_8: data.O3_8,
          O3: data.O3,
          PM25: data.PM25,
          PM25_AVG: data.PM25_AVG,
          PM10: data.PM10,
          PM10_AVG: data.PM10_AVG,
          MonobjName: data.MonobjName, //觀測站屬性
          Time: varTime.toLocaleTimeString()});

        item.save(function(error){
          if (error) {
            console.log('menow');
          }
        });
      }
    });
  });
};

var app = express();
app.listen(8888);
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//連接db
mongoose.connect('mongodb://binson:binsonpm25@ds141098.mlab.com:41098/airpm');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Successfully mongodb is con//nected');
});

var pm = mongoose.model('airpm', {
  // SiteName: String,
  // AreaKey: String,
  // AQI: String,
  // FPMI: String,
  // PM25: String,
  // PM25_AVG: String,
  // PM10_AVG: String,
  // Time: String
  SiteName: String,
  AreaKey: String,
  AQI: String,
  O3_8: String,
  O3: String,
  PM25: String,
  PM25_AVG: String,
  PM10: String,
  PM10_AVG: String,
  MonobjName: String, //觀測站屬性
  Time: String
});

app.get('/pm',function(req,res){
    pm.find( function(err, pm) {
        if (err) return res.render('Error occurred');
        res.send(pm);
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


pm25();
setInterval(pm25,60*60*1000); //中央氣象局1小時更新一次
