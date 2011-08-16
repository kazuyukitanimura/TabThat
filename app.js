
/**
 * Module dependencies.
 */

var express = require('express');
var MemoryStore = express.session.MemoryStore;
var sessionStore = new MemoryStore({ reapInterval: 60000 * 10 });
var assert = require('assert');

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
  var expenses = []; // index == userID
  for(var i=numPpl; i--;){
    expenses.push(Math.ceil(Math.random()*100)); // between 0 and 100
  }
  res.render('index', {
    title: 'TabThat',
    expenses : expenses
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var dnode = require('dnode');
var server = dnode({
      optimize : function(expenses, cb){
        var numPpl = expenses.length;

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
        // sanity check
        print2DArray(naiveTable);
      
        // 1st Optimization: eliminate the bidirectional $ flow O(n**2)
        // 1st optimization guarantees that the graph is DAG and has no bidirectional edges
        var oweTable = expenses.map(function(x){
          return expenses.map(function(y){
            return y-x; // divide by numPpl later
          });
        }); // 2D Array
        // sanity check
        print2DArray(oweTable);
      
        // 2nd Optimization: reduce the # of edges O(N**2 *logN)
        // 2nd optimization guarantees that the graph is a bipartite graph, i.e. the graph diameter is 1
        var oweTableNew = [];
        var subTotals = [];
        var idxArray = [];
        for(var i=0; i<numPpl; i++){
          var oweArray = [];
          var subtotal = 0;
          for(var j=0; j<numPpl; j++){
            oweArray[j] = 0;
            subtotal += oweTable[i][j];
          }
          oweTableNew[i] = oweArray;
          subTotals[i] = subtotal;
          idxArray[i] = i;
        }
        idxArray.sort(function(i, j){
          return subTotals[i] - subTotals[j];
        });
        while(subTotals[idxArray[0]]!==0){
          var owner = idxArray[numPpl-1]; // pay
          var ownee = idxArray[0]; // receive
          var minOwe = Math.min(subTotals[owner], -subTotals[ownee]);
          oweTableNew[owner][ownee] =  minOwe;
          oweTableNew[ownee][owner] = -minOwe;
          subTotals[owner] -= minOwe;
          subTotals[ownee] += minOwe;
          idxArray.sort(function(i, j){
            return subTotals[i] - subTotals[j];
          });
        }
        // sanity check
        print2DArray(oweTableNew);
        for(var i=subTotals; i--;){
          assert.ok(subTotals[i]===0);
        }
        //oweTable = transpose(oweTableNew);
      
        var nt  = divide2DArrayByX(naiveTable,  numPpl);
        var ot  = divide2DArrayByX(oweTableNew, numPpl);
        var ot2 = negativeToZero(ot);

        cb(nt, ot2);
      }
    });
server.listen(app);

function print2DArray(t){
  assert.ok(t.length===t[0].length);
  console.dir(t);
  for(var i=0; i<t.length; i++){
    var subtotal = 0;
    for(var j=0; j<t[i].length; j++){
      subtotal += t[i][j];
    }
    console.log(i+": "+subtotal);
  }
  console.log("");
}

function transpose(baseArray){
  assert.ok(baseArray.length===baseArray[0].length);
  var newArray = [];
  for(var i=0; i<baseArray.length; i++){
    newArray.push([]);
    for(var j=0; j<baseArray.length; j++){
      newArray[i][j] = baseArray[j][i];
    }
  }
  return newArray;
}

function copy2DArray(baseArray){
  var newArray = [];
  for(var i=0; i<baseArray.length; i++){
    newArray.push([]);
    for(var j=0; j<baseArray[0].length; j++){
      newArray[i][j] = baseArray[i][j];
    }
  }
  return newArray;
}

function divide2DArrayByX(baseArray, x){
  var newArray = [];
  for(var i=0; i<baseArray.length; i++){
    newArray.push([]);
    for(var j=0; j<baseArray[0].length; j++){
      newArray[i][j] = baseArray[i][j] / x;
    }
  }
  return newArray;
}

function negativeToZero(baseArray){
  var newArray = [];
  for(var i=0; i<baseArray.length; i++){
    newArray.push([]);
    for(var j=0; j<baseArray[0].length; j++){
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
