
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
  var total = 0;
  var expenses = []; // index == userID
  for(var i=numPpl; i--;){
    expenses.push(Math.ceil(Math.random()*100)); // between 0 and 100
  }
  for(var i=numPpl; i--;){
    total += expenses[i];
  }
  //var expenses = [51,19,16,57]; // index == userID
  //var expenses = [70,19,57,76]; // index == userID
  //var expenses = [27,24,51,87]; // index == userID
  //var expenses = [98,75,77,17,15];

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

  //var oweTable = [[  0,  0,  0,  5,  5,  0],
  //                [  0,  0,  0,  0,  5,  5],
  //                [  0,  0,  0, 15,  0,  0],
  //                [ -5,  0,-15,  0,  0,  0],
  //                [ -5, -5,  0,  0,  0,  0],
  //                [  0, -5,  0,  0,  0,  0]];
  //var oweTable = [[  0,  0,  0,  5,  5],
  //                [  0,  0,  0, 10, 10],
  //                [  0,  0,  0,  5, 25],
  //                [ -5,-10, -5,  0,  0],
  //                [ -5,-10,-25,  0,  0]];
  //var numPpl = oweTable.length;

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
    var owener = idxArray[numPpl-1]; // pay
    var owenee = idxArray[0]; // receive
    var minOwe = Math.min(subTotals[owener], -subTotals[owenee]);
    oweTableNew[owener][owenee] =  minOwe;
    oweTableNew[owenee][owener] = -minOwe;
    subTotals[owener] -= minOwe;
    subTotals[owenee] += minOwe;
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
  res.render('index', {
    title: 'TabThat',
    expense0 : expenses[0],
    expense1 : expenses[1],
    expense2 : expenses[2],
    expense3 : expenses[3],
    total : total,
    naive00 : nt[0][0],
    naive01 : nt[0][1],
    naive02 : nt[0][2],
    naive03 : nt[0][3],
    naive10 : nt[1][0],
    naive11 : nt[1][1],
    naive12 : nt[1][2],
    naive13 : nt[1][3],
    naive20 : nt[2][0],
    naive21 : nt[2][1],
    naive22 : nt[2][2],
    naive23 : nt[2][3],
    naive30 : nt[3][0],
    naive31 : nt[3][1],
    naive32 : nt[3][2],
    naive33 : nt[3][3],
    opt00 : ot2[0][0],
    opt01 : ot2[0][1],
    opt02 : ot2[0][2],
    opt03 : ot2[0][3],
    opt10 : ot2[1][0],
    opt11 : ot2[1][1],
    opt12 : ot2[1][2],
    opt13 : ot2[1][3],
    opt20 : ot2[2][0],
    opt21 : ot2[2][1],
    opt22 : ot2[2][2],
    opt23 : ot2[2][3],
    opt30 : ot2[3][0],
    opt31 : ot2[3][1],
    opt32 : ot2[3][2],
    opt33 : ot2[3][3]
  });

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
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
