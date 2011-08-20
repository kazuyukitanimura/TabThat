var sanityCheck = function(table){
  if(! (Array.isArray(table) && Array.isArray(table[0]))){ // is 2DArray?
    console.error('ERROR: Not 2D Array');
    return false;
  }
  if(table.length !== table[0].length){ // is square Array?
    console.error('ERROR: Not Square Array');
    return false;
  }

  return true;
};

var sanityCheck2 = function(table){
  for(var i=0; i<table.length; i++){ // table has to be table[i][j] === -table[j][i]
    for(var j=0; j<table[i].length; j++){
      if(table[i][j] !== -table[j][i]){
        console.error('ERROR: OweTable Not Consistent');
        return false;
      }
    }
  }

  return true;
};

var OweTable = module.exports = function(oweTable){
  if(! sanityCheck(oweTable)){
    return null;
  }

  this.numPpl = oweTable.length;
  this.oweTable = oweTable;
};

OweTable.prototype.print = function(){
  var numPpl   = this.numPpl;
  var oweTable = this.oweTable;

  console.dir(oweTable);

  console.log("subtotals");
  for(var i=0; i<numPpl; i++){
    var subtotal = 0;
    for(var j=0; j<numPpl; j++){
      subtotal += oweTable[i][j];
    }
    console.log(i+": "+subtotal);
  }
  console.log("");
};

OweTable.prototype.transpose = function(){
  var numPpl   = this.numPpl;
  var oweTable = this.oweTable;
  var newTable = [];

  for(var i=0; i<numPpl; i++){
    newTable.push([]);
    for(var j=0; j<numPpl; j++){
      newTable[i][j] = oweTable[j][i];
    }
  }

  return new OweTable(newTable);
};

OweTable.prototype.deepCopy = function(){
  var numPpl   = this.numPpl;
  var oweTable = this.oweTable;
  var newTable = [];

  for(var i=0; i<numPpl; i++){
    newTable.push([]);
    for(var j=0; j<numPpl; j++){
      newTable[i][j] = oweTable[i][j];
    }
  }
  
  return new OweTable(newTable);
};
  
OweTable.prototype.divide = function(x){
  var numPpl   = this.numPpl;
  var oweTable = this.oweTable;
  var newTable = [];

  for(var i=0; i<numPpl; i++){
    newTable.push([]);
    for(var j=0; j<numPpl; j++){
      newTable[i][j] = oweTable[i][j] / x;
    }
  }

  return new OweTable(newTable);
};

OweTable.prototype.negativeToZero = function(){
  var numPpl   = this.numPpl;
  var oweTable = this.oweTable;
  var newTable = [];

  for(var i=0; i<numPpl; i++){
    newTable.push([]);
    for(var j=0; j<numPpl; j++){
      if(oweTable[i][j]<0){
        newTable[i][j] = 0;
      }
      else{
        newTable[i][j] = oweTable[i][j];
      }
    }
  }

  return new OweTable(newTable);
};

// Optimization: reduce the # of edges O(N**2 *logN)
// optimization guarantees that the graph is a bipartite graph, i.e. the graph diameter is 1
OweTable.prototype.optimize = function(){
  var numPpl    = this.numPpl;
  var oweTable  = this.oweTable;
  var newTable  = [];
  var subTotals = [];
  var idxArray  = [];

  for(var i=0; i<numPpl; i++){
    newTable.push([]);
    var subtotal = 0;
    for(var j=0; j<numPpl; j++){
      newTable[i][j] = 0;
      subtotal += oweTable[i][j] - oweTable[j][i];
    }
    subTotals[i] = subtotal;
    idxArray[i]  = i;
  }

  if(! sanityCheck2(newTable)){
    return null;
  }

  idxArray.sort(function(i, j){
    return subTotals[i] - subTotals[j];
  });

  while(subTotals[idxArray[0]] !== 0){
    var owner = idxArray[numPpl-1]; // pay
    var ownee = idxArray[0]; // receive
    var minOwe = Math.min(subTotals[owner], -subTotals[ownee]);

    newTable[owner][ownee] =  minOwe;
    newTable[ownee][owner] = -minOwe;
    subTotals[owner] -= minOwe;
    subTotals[ownee] += minOwe;

    idxArray.sort(function(i, j){
      return subTotals[i] - subTotals[j];
    });
  }

  // sanity check
  for(var i=subTotals; i--;){
    if(subTotals[i] !== 0){
      console.error('ERROR: Optimization Failed');
      return false;
    }
  }

  return new OweTable(newTable).negativeToZero();
};
