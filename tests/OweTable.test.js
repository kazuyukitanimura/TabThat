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

    newTable = newTable.oweTable;
    for(var i=0; i<newTable.length; i++){
      var subtotal = 0;
      for(var j=0; j<newTable[0].length; j++){
        subtotal += newTable[i][j];
      }
      subTotals[i] = subtotal;
    }

    optTable = optTable.oweTable;
    for(var i=0; i<optTable.length; i++){
      for(var j=0; j<optTable[0].length; j++){
        subTotals[i] -= optTable[i][j];
      }
    }

    for(var i=subTotals; i--;){
      subTotals[i].should.equal(0);
    }
  }
};
