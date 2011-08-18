
/**
 * Module dependencies.
 */

var express = require('express');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore({ reapInterval: 60000 * 10 });
var OweTable = require('./lib/OweTable');

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
  var numPpl = 4;
  var total = 0;
  var expenses = []; // index == userID
  for(var i=numPpl; i--;){
    expenses.push(Math.ceil(Math.random()*100)); // between 0 and 100
  }
  for(var i=numPpl; i--;){
    total += expenses[i];
  }

  // NO Optimization
  var naiveTable = expenses.map(function(x, i){
    return expenses.map(function(y, j){
      if (i===j){
        return 0;
      }
      else{
        return y; // divide by numPpl later
      }
    });
  }); // 2D Array

  var nt = new OweTable(naiveTable);
  nt.print();
  var ot3 = nt.optimize();
  ot3.print();

  nt = nt.divide(numPpl);
  nt.print();
  ot3 = ot3.divide(numPpl);
  ot3.print();

  res.render('index', {
    title: 'TabThat',
    expenses : expenses,
    total : total,
    naive : nt.oweTable,
    opt : ot3.oweTable
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
