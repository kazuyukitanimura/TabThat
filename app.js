
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
  var total = 0;
  //var expenses = [51,19,16,57]; // index == userID
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
        return x; // divide by numPpl later
      }
    });
  }); // 2D Array
  // sanity check
  sanityCheck(naiveTable, numPpl);

  // 1st Optimization: reduce the total $ flow
  var oweTable = expenses.map(function(x){
    return expenses.map(function(y){
      return x-y; // divide by numPpl later
    });
  }); // 2D Array

  // sanity check
  sanityCheck(oweTable, numPpl);

  // 2nd Optimization: reduce the # of edges O(n**3)
  for(var j=numPpl; j--;){
    for(var i=numPpl; i--;){
      for(var k=numPpl; k--;){
        if(i!==k){
          var u = oweTable[i][j]; // payment from j to i
          var v = oweTable[k][i]; // payment from i to k
          var w = oweTable[k][j]; // payment from j to k
          if(u>=0 && v>=0 && w>=0){
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

  // 3rd Optimization: reduce the # of edges O(n**4)
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
