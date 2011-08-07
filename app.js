
/**
 * Module dependencies.
 */

var express = require('express');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore({ reapInterval: 60000 * 10 });

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.session({secret: 'himitsu!', fingerprint: function(req){return req.socket.remoteAddress;}, store: sessionStore, key: 'express.sid'}));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.logger({ format: ':method :url' }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  var numPpl = 4
  var expenses = []; // index == userID
  var total = 0;
  for(var i=numPpl; i--;){
    expenses.push(Math.ceil(Math.random()*100)); // between 0 and 100
  }
  for(var i=numPpl; i--;){
    total += expenses[i];
  }
  var oweTable = expenses.map(function(x){
    return expenses.map(function(y){
      return x-y; // divide by numPpl later
    });
  }); // 2D Array
  // copy the oweTable
  var oweTableOld = [];
  for(var i=0; i<numPpl; i++){
    oweTableOld.push([]);
    for(var j=0; j<numPpl; j++){
      oweTableOld[i][j] = oweTable[i][j];
    }
  }
  for(var j=numPpl; j--;){
    for(var i=numPpl; i--;){
      for(var k=numPpl; k--;){
        var u = oweTable[i][j]; // payment from j to i
        var v = oweTable[k][i]; // payment from i to k
        var w = oweTable[k][j]; // payment from j to k
        if(u>=0 && v>0 && w>=0 && u>=v){
          oweTable[i][j] -= oweTable[k][i];
          oweTable[k][j] += oweTable[k][i];
          oweTable[k][i] = 0;

          // keep the symmetricity
          oweTable[j][i] = -oweTable[i][j];
          oweTable[j][k] = -oweTable[k][j];
          oweTable[i][k] = -oweTable[k][i];
        }
      }
    }
  }
  // sanity check
  sanityCheck(oweTableOld, numPpl);
  sanityCheck(oweTable, numPpl);
  res.render('index', {
    title: 'TabThat',
    expense0 : expenses[0],
    expense1 : expenses[1],
    expense2 : expenses[2],
    expense3 : expenses[3],
    total : total,
    oweTable : oweTable
  });
  function sanityCheck(t, n){
    console.dir(t);
    for(var j=0; j<n; j++){
      var subtotal = 0;
      for(var i=0; i<n; i++){
        subtotal += t[i][j]
      }
      console.log(j, ": ",subtotal);
    }
    console.log("");
  }
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
