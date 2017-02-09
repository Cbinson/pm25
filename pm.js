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
    url: "http://taqm.epa.gov.tw/taqm/tw/Aqi/North.aspx?type=all&fm=AqiMap",
    method: "GET"
  }, function(error, response, body) {
    if (error || !body) {
      console.log('Error');
      return;
    }

    pm.collection.remove( function (err) {
    if (err) throw err;
      // collection is now empty but not deleted
    });

    // 爬完網頁後要做的事情
    var $ = cheerio.load(body);
    var result = [];

 //    $('.box tr').each(function(i, dataTable){
 //    	var $aqiSiteName = $(this).text().split('\n');
 //    	result.push($aqiSiteName);
	// });


    $('.TABLE_G tr').each(function(i, dataTable){
    	var $aqiSiteName = $(this).text().split('\n');
    	result.push($aqiSiteName);
	});
    console.log(result);

    for(var i=1 ; i<result.length ; i++){
    	var item = new pm({ 
    		SiteName: result[i][2].substring(16).split('\r')[0], 				//站名 
          	AQI: result[i][4].substring(16).split('\r')[0],						//空氣品質指標
          	O3: result[i][6].substring(16).split('\r')[0],						//臭氧
          	PM25: result[i][8].substring(16).split('\r')[0],					//細懸浮微粒
          	PM10: result[i][10].substring(16).split('\r')[0],					//懸浮微粒
          	CO: result[i][12].substring(16).split('\r')[0],						//一氧化碳
          	SO2: result[i][14].substring(16).split('\r')[0],					//二氧化硫
          	NO2: result[i][16].substring(16).split('\r')[0], 					//二氧化氮
          	Time: new Date().toLocaleTimeString()
    	});

    	item.save(function(error){
          if (error) {
            console.log('SAVE Error');
          }
        });

    	console.log('linkSite:'+result[i][2].substring(16));	//站名
    	console.log('labPSI:'+result[i][4].substring(16));		//空氣品質指標
    	console.log('labO3:'+result[i][6].substring(16));		//臭氧
    	console.log('labPM25:'+result[i][8].substring(16));		//細懸浮微粒
    	console.log('labPM10:'+result[i][10].substring(16));	//懸浮微粒
    	console.log('labCO:'+result[i][12].substring(16));		//一氧化碳
    	console.log('labSO2:'+result[i][14].substring(16));		//二氧化硫
    	console.log('labNO2:'+result[i][16].substring(16));		//二氧化氮
	}
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
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://binson:binsonpm25@ds141098.mlab.com:41098/airpm');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Successfully mongodb is con//nected');
});

var pm = mongoose.model('airpm', {
  SiteName: String, 			//站名 
  AQI: String,					//空氣品質指標
  O3: String,					//臭氧
  PM25: String,					//細懸浮微粒
  PM10: String,					//懸浮微粒
  CO: String,					//一氧化碳
  SO2: String,					//二氧化硫
  NO2: String, 					//二氧化氮
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
