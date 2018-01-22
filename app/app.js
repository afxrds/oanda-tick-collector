var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var programParams = require('commander')
var events = require('events');

var EventEmitter = events.EventEmitter
var ee = new EventEmitter();
var last_hb = 'last'
var prev_hb = 'prev'



// Up to 10 instruments, separated by URL-encoded comma (%2C)
var instruments = "EUR_USD%2CEUR_GBP%2CEUR_CHF%2CGBP_USD%2CGBP_CHF"

programParams
  .version('0.0.1')
  .option('-d, --oanda_endpoint <s>', 'i.e. practice, sandbox, live')
  .option('-a, --access_token <s>', 'access token')
  .option('-i, --account_id <n>', 'account id', parseInt)
  .option('-m, --mongodb_url <s>', 'mongodb url', 'mongodb://localhost:27017/instruments')
  .option('-c, --collection <s>', 'mongodb collection', 'ticks')
  .option('-v, --verbose <n>', 'A value that can be increased', parseInt)
  .parse(process.argv)

var https;

var db;
var collection;

console.log("ProgramParams verbose: "+ programParams.verbose)

function log_msg(msg, min_level){
  if(min_level>=programParams.verbose) {
    console.log(msg)
  }
}


if (programParams.oanda_endpoint.indexOf("stream-sandbox") > -1) {
  https = require('http');
} else {
  https = require('https');
}
var options = {
  host: programParams.oanda_endpoint,
  path: '/v1/prices?accountId=' + programParams.account_id + '&instruments=' + instruments,
  method: 'GET',
  headers: {"Authorization" : "Bearer " + programParams.access_token},
};


console.log("Connecting to mongodb")
MongoClient.connect(programParams.mongodb_url, function(err, _db) {
  assert.equal(null, err);

  db = _db;
  collection = db.collection(programParams.collection);
});
console.log("Connected to mongodb")


var request = https.request(options, function(response){
      log_msg("statusCode: " + response.statusCode, 1);
      response.on("data", function(chunk){
         bodyChunk = chunk.toString();
         log_msg(bodyChunk, 0);
         try {
           ee.emit('tick', bodyChunk.slice(0, -1).split('\n'));
         }catch(err){
           log_msg("Error on " + bodyChunk, 0)
         }
      });
      response.on("end", function(chunk){
         log_msg("Error connecting to OANDA HTTP Rates Server", 0);
         log_msg("HTTP - " + response.statusCode, 0);
         log_msg(bodyChunk, 0);
         db.close();
         process.exit(1);
      });
});

request.on('connect', function(res, socket, head){
  log_msg('Connected', 0)
});

request.on('error', function(err){
  log_msg('err:', 0)
  log_msg(err,0 );
  db.close()
});

request.end();

ee.on('tick', function(data){

  data.map(function(item){
    jsonTick = JSON.parse(item)
    if(jsonTick['tick']) {
      jsonTick.tick.time = new Date(jsonTick.tick.time)
      collection.insert(jsonTick);
    } else if(jsonTick['heartbeat']){
      last_hb = jsonTick
    }
  });
});




setInterval(function(){
    if (last_hb == prev_hb) {
      log_msg("Last heartbeat: " + last_hb + " and previous heartbeat: " + prev_hb + " are same, stream broken exit..", 0)
      db.close()
      process.exit(1);
    } else {
      prev_hb = last_hb;
      log_msg("HC passed " + new Date().toISOString(), 1)
    }
  }, 16000);
