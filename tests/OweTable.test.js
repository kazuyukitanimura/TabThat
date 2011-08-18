var should = require('should');
var OweTable = require('../lib/OweTable');

var numPpl = 4;
var expenses = []; // index == userID
for(var i=numPpl; i--;){
  expenses.push(Math.ceil(Math.random()*100)); // between 0 and 100
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

module.exports = {
  'new': function(){
    var newTable = new OweTable(naiveTable);
    newTable.should.not.equal(null);
    //newTable.print()

    newTable = newTable.oweTable;

    for(var i=0; i<newTable.length; i++){
      for(var j=0; j<newTable[0].length; j++){
        newTable[i][j].should.equal(naiveTable[i][j]);
      }
    }
  },
  'transpose': function(){
    var newTable = new OweTable(naiveTable);
    //newTable.print()
    var transposedTable = newTable.transpose();
    //transposedTable.print()

    newTable = newTable.oweTable;
    transposedTable = transposedTable.oweTable;

    for(var i=0; i<newTable.length; i++){
      for(var j=0; j<newTable[0].length; j++){
        transposedTable[i][j].should.equal(newTable[j][i]);
      }
    }
  },
  'deepCopy': function(){
    var newTable = new OweTable(naiveTable);
    var copiedTable = newTable.deepCopy();

    newTable = newTable.oweTable;
    copiedTable = copiedTable.oweTable;

    for(var i=0; i<copiedTable.length; i++){
      for(var j=0; j<copiedTable[0].length; j++){
        copiedTable[i][j] = 0;
      }
    }
    newTable.should.not.equal(copiedTable);
  },
  'divide': function(){
    var newTable = new OweTable(naiveTable);
    var dividedTable = newTable.divide(numPpl);

    newTable = newTable.oweTable;
    dividedTable = dividedTable.oweTable;

    for(var i=0; i<newTable.length; i++){
      for(var j=0; j<newTable[0].length; j++){
        dividedTable[i][j].should.equal(newTable[i][j] / numPpl);
      }
    }
  },
  'negativeToZero': function(){
    var newTable = new OweTable(naiveTable);
    var positiveTable = newTable.negativeToZero();

    positiveTable = positiveTable.oweTable;

    for(var i=0; i<positiveTable.length; i++){
      for(var j=0; j<positiveTable[0].length; j++){
        (positiveTable[i][j] >= 0).should.be.true;
      }
    }
  },
  'optimize': function(){
    var newTable = new OweTable(naiveTable);
    var optTable = newTable.optimize();
    optTable.should.not.equal(null);
    optTable.should.not.be.false;
    var subTotals = [];

    // 1st Optimization: eliminate the bidirectional $ flow O(n**2)
    // 1st optimization guarantees that the graph is DAG and has no bidirectional edges
    var oweTable = expenses.map(function(x){
      return expenses.map(function(y){
        return y-x; // divide by numPpl later
      });
    }); // 2D Array
    // sanity check
    //print2DArray(oweTable);

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
    //print2DArray(oweTableNew);
    for(var i=subTotals; i--;){
      subTotals[i].should.equal(0);
    }

    var ot  = divide2DArrayByX(oweTableNew, numPpl);
    var ot2 = negativeToZero(ot);

    optTable = optTable.divide(numPpl).oweTable;

    for(var i=0; i<numPpl; i++){
      for(var j=0; j<numPpl; j++){
        ot2[i][j].should.equal(optTable[i][j]);
      }
    }

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
  }
};
