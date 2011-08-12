
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
  var numPpl = 6;
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
        return x; // divide by numPpl later
      }
    });
  }); // 2D Array
  // sanity check
  sanityCheck(naiveTable, numPpl);

  // 1st Optimization: reduce the total $ flow
  // 1st optimization guarantees that the graph is DAG and has no bidirectional edges
  var oweTable = expenses.map(function(x){
    return expenses.map(function(y){
      return x-y; // divide by numPpl later
    });
  }); // 2D Array

  // sanity check
  sanityCheck(oweTable, numPpl);

  //// 2nd Optimization: reduce the # of edges O(n**2) between 3 nodes
  //// 2nd optimization guarantees that the graph is a bipartite graph, i.e. the graph diameter is 1
  //var oweTableOld = copy2DArray(oweTable, numPpl, numPpl);
  //for(var j=numPpl; j--;){
  //  var outEdgeIs = [];
  //  var inEdgeIs  = [];
  //  for(var i=numPpl; i--;){
  //    var tmpEdge = oweTableOld[i][j];
  //    if(tmpEdge!==0){
  //      if(tmpEdge>0){
  //        outEdgeIs.push(i);
  //      }else{
  //        inEdgeIs.push(i);
  //      }
  //      var k = outEdgeIs[0];
  //      var l = inEdgeIs[0];
  //      if(k && l){
  //        var minV = Math.min(oweTableOld[k][j], -oweTableOld[l][j]);
  //        if((oweTableOld[k][j] -= minV) === 0){
  //          outEdgeIs.pop();
  //        }
  //        if((oweTableOld[l][j] += minV) === 0){
  //          inEdgeIs.pop();
  //        }
  //        oweTableOld[k][l] += minV;

  //        // keep the symmetricity
  //        oweTableOld[j][k] = -oweTableOld[k][j];
  //        oweTableOld[j][l] = -oweTableOld[l][j];
  //        oweTableOld[l][k] = -oweTableOld[k][l];
  //      }
  //    }
  //  }
  //}
  //// sanity check
  //sanityCheck(oweTableOld, numPpl);

  // 2nd Optimization: reduce the # of edges O(n**3) between 3 nodes
  // 2nd optimization guarantees that the graph is a bipartite graph, i.e. the graph diameter is 1
  for(var j=numPpl; j--;){
    for(var i=numPpl; i--;){
      for(var k=numPpl; k--;){
        if(i!==k && i!==j){
          var u = oweTable[i][j]; // payment from j to i
          var v = oweTable[k][i]; // payment from i to k
          var w = oweTable[k][j]; // payment from j to k
          if(u>0 && v>0){
            var minUV = Math.min(u, v);
            oweTable[i][j] -= minUV;
            oweTable[k][i] -= minUV;
            oweTable[k][j] += minUV;

            // keep the symmetricity
            oweTable[j][i] = -oweTable[i][j];
            oweTable[i][k] = -oweTable[k][i];
            oweTable[j][k] = -oweTable[k][j];
          }
        }
      }
    }
  }
  // sanity check
  sanityCheck(oweTable, numPpl);

  // 3rd Optimization: reduce the # of edges O(n**4) between 4 nodes
  for(var i=numPpl; i--;){
    for(var j=numPpl; j--;){
      for(var k=numPpl; k--;){
        for(var l=numPpl; l--;){
          if(i!==k && j!==l){
            var t = oweTable[i][j]; // payment from j to i
            var u = oweTable[k][j]; // payment from j to k
            var v = oweTable[i][l]; // payment from l to i
            var w = oweTable[k][l]; // payment from l to k
            if(t>0 && u>0 && v>0 && w>0){
              var minTUVW = Math.min(t, u, v, w);
              if(minTUVW === t){
                oweTable[i][j] -= t
                oweTable[k][j] += t
                oweTable[i][l] += t
                oweTable[k][l] -= t
              }else if(minTUVW === u){
                oweTable[i][j] += u
                oweTable[k][j] -= u
                oweTable[i][l] -= u
                oweTable[k][l] += u
              }else if(minTUVW === v){
                oweTable[i][j] += v
                oweTable[k][j] -= v
                oweTable[i][l] -= v
                oweTable[k][l] += v
              }else if(minTUVW === w){
                oweTable[i][j] -= w
                oweTable[k][j] += w
                oweTable[i][l] += w
                oweTable[k][l] -= w
              }else{
                console.err('What!!');
              }

              // keep the symmetricity
              oweTable[j][i] = -oweTable[i][j];
              oweTable[j][k] = -oweTable[k][j];
              oweTable[l][i] = -oweTable[i][l];
              oweTable[l][k] = -oweTable[k][l];
            }
          }
        }
      }
    }
  }
  // sanity check
  sanityCheck(oweTable, numPpl);

  var nt  = divide2DArrayByX(naiveTable, numPpl, numPpl, numPpl);
  var ot  = divide2DArrayByX(oweTable,   numPpl, numPpl, numPpl);
  console.dir(nt);
  console.dir(ot);
  var ot2 = negativeToZero(ot, numPpl, numPpl, numPpl);
  res.render('index', {
    title: 'TabThat',
    expense0 : expenses[0],
    expense1 : expenses[1],
    expense2 : expenses[2],
    expense3 : expenses[3],
    total : total,
    naive00 : nt[0][0],
    naive10 : nt[1][0],
    naive20 : nt[2][0],
    naive30 : nt[3][0],
    naive01 : nt[0][1],
    naive11 : nt[1][1],
    naive21 : nt[2][1],
    naive31 : nt[3][1],
    naive02 : nt[0][2],
    naive12 : nt[1][2],
    naive22 : nt[2][2],
    naive32 : nt[3][2],
    naive03 : nt[0][3],
    naive13 : nt[1][3],
    naive23 : nt[2][3],
    naive33 : nt[3][3],
    opt00 : ot2[0][0],
    opt10 : ot2[1][0],
    opt20 : ot2[2][0],
    opt30 : ot2[3][0],
    opt01 : ot2[0][1],
    opt11 : ot2[1][1],
    opt21 : ot2[2][1],
    opt31 : ot2[3][1],
    opt02 : ot2[0][2],
    opt12 : ot2[1][2],
    opt22 : ot2[2][2],
    opt32 : ot2[3][2],
    opt03 : ot2[0][3],
    opt13 : ot2[1][3],
    opt23 : ot2[2][3],
    opt33 : ot2[3][3]
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
