var util = require('util');
var OweTable = require('./OweTable');

var Troupe = module.exports = function(users, oweTable){
  if(! Array.isArray(users)){
    users = [users];
  }
  this.users = users;
  //have to check duplicated users

  var numPpl = users.length;

  if(Array.isArray(oweTable)){
    if(numPpl !== oweTable.length){
      console.error('ERROR: Users-oweTable Missmatch');
      return null;
    }

    OweTable.call(this, oweTable);
  }else if(oweTable===undefined){
    var newTable = [];

    for(var i=0; i<numPpl; i++){
      newTable.push([]);
      for(var j=0; j<numPpl; j++){
        newTable[i][j] = 0;
      }
    }

    OweTable.call(this, newTable);
  }else{
    console.error('ERROR: Unknown oweTable');
    return null;
  }
};

util.inherits(Troupe, OweTable);

Troupe.prototype.print = function(){
  var numPpl   = this.numPpl;
  var oweTable = this.oweTable;
  var users    = this.users;

  console.dir(oweTable);

  console.log("subtotals");
  for(var i=0; i<numPpl; i++){
    var subtotal = 0;
    for(var j=0; j<numPpl; j++){
      subtotal += oweTable[i][j];
    }
    console.log(users[i].username, ": ", subtotal);
  }
  console.log("");
};

Troupe.prototype.addUsers = function(users){
  if(! Array.isArray(users)){
    users = [users];
  }
  this.users = users;

};

Troupe.prototype.delUsers = function(){

};

Troupe.prototype.charge = function(){

};

Troupe.prototype.pay = function(){

};
