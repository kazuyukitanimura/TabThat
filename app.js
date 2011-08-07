
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
  //var expenses = []; // index == userID
  var expenses = [51,19,16,57]; // index == userID
  var total = 0;
  //for(var i=numPpl; i--;){
  //  expenses.push(Math.ceil(Math.random()*100)); // between 0 and 100
  //}
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
        return x; // divide by numPpl later
      }
    });
  }); // 2D Array

  // 1st Optimization: reduce the total $ flow
  var oweTable = expenses.map(function(x){
    return expenses.map(function(y){
      return x-y; // divide by numPpl later
    });
  }); // 2D Array

  // copy the oweTable
  var oweTableOld = copy2DArray(oweTable, numPpl, numPpl);

  // 2nd Optimization: reduce the # of edges
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
  sanityCheck(naiveTable, numPpl);
  sanityCheck(oweTableOld, numPpl);
  sanityCheck(oweTable, numPpl);
  var nt  = divide2DArrayByX(naiveTable, numPpl, numPpl, numPpl);
  var ot  = divide2DArrayByX(oweTable,   numPpl, numPpl, numPpl);
  var ot2 = negativeToZero(ot, numPpl, numPpl, numPpl);
  console.dir(nt);
  console.dir(ot);
  res.render('index', {
    title: 'TabThat',
    expense0 : expenses[0],
    expense1 : expenses[1],
    expense2 : expenses[2],
    expense3 : expenses[3],
    total : total,
    naive0 : 'B $'+nt[1][0]+',  C $'+nt[2][0]+',  D $'+nt[3][0],
    naive1 : 'A $'+nt[0][1]+',  C $'+nt[2][1]+',  D $'+nt[3][1],
    naive2 : 'A $'+nt[0][2]+',  B $'+nt[1][2]+',  D $'+nt[3][2],
    naive3 : 'A $'+nt[0][3]+',  B $'+nt[1][3]+',  C $'+nt[2][3],
    opt0 : 'B $'+ot2[1][0]+',  C $'+ot2[2][0]+',  D $'+ot2[3][0],
    opt1 : 'A $'+ot2[0][1]+',  C $'+ot2[2][1]+',  D $'+ot2[3][1],
    opt2 : 'A $'+ot2[0][2]+',  B $'+ot2[1][2]+',  D $'+ot2[3][2],
    opt3 : 'A $'+ot2[0][3]+',  B $'+ot2[1][3]+',  C $'+ot2[2][3]
  });

  function copy2DArray(baseArray, n, m){
    var newArray = [];
    for(var i=0; i<n; i++){
      newArray.push([]);
      for(var j=0; j<m; j++){
        newArray[i][j] = baseArray[i][j];
      }
    }
    return newArray;
  }

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
  
  function divide2DArrayByX(baseArray, n, m, x){
    var newArray = [];
    for(var i=0; i<n; i++){
      newArray.push([]);
      for(var j=0; j<m; j++){
        newArray[i][j] = baseArray[i][j] / x;
      }
    }
    return newArray;
  }
  function negativeToZero(baseArray, n, m, x){
    var newArray = [];
    for(var i=0; i<n; i++){
      newArray.push([]);
      for(var j=0; j<m; j++){
        if(baseArray[i][j]<0){
          newArray[i][j] = 0;
        }
        else{
          newArray[i][j] = baseArray[i][j];
        }
      }
    }
    return newArray;
  }
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
