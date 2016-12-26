//導入模塊
var request = require("request");
var express = require("express");
var cheerio = require("cheerio");
var mongoose = require('mongoose');
var fs = require("fs");

var pm25 = function() {
  request({
    url: "http://taqm.epa.gov.tw/taqm/tw/Pm25Index.aspx",
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

        var item = new pm({ SiteName: data.SiteName, AreaKey:data.AreaKey, FPMI:data.FPMI, PM25: data.PM25, PM25_AVG:data.PM25_AVG, PM10_AVG:data.PM10_AVG, Time: varTime.toLocaleTimeString()});
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
  SiteName: String,
  AreaKey: String,
  FPMI: String,
  PM25: String,
  PM25_AVG: String,
  PM10_AVG: String,
  Time: String
});


pm25();
setInterval(pm25,1*60*1000); //中央氣象局1小時更新一次
