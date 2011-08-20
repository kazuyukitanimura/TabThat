var util = require('util');
var OweTable = require('./OweTable');
var User = require('./User');

var userUnique = function(users){
//http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
  var o = {};
  var r = [];

  for(var i=users.length; i--;){
    o[users[i].user_id] = users[i];
  }

  for(var i in o){
    r.push(o[i]);
  }

  return r;
};

var genSquareZeroTable = function(n){
  var newTable = [];

  for(var i=0; i<n; i++){
    newTable.push([]);
    for(var j=0; j<n; j++){
      newTable[i][j] = 0;
    }
  }

  return newTable;
};

var Troupe = module.exports = function(users, oweTable){
  if(! Array.isArray(users)){
    users = [users];
  }

  // ToDo change users from Array to Object

  // check duplicated users
  this.users = users = userUnique(users);

  var numPpl = users.length;

  if(Array.isArray(oweTable)){
    if(numPpl !== oweTable.length){
      console.error('ERROR: Users-oweTable Missmatch');
      return null;
    }

    OweTable.call(this, oweTable);
  }else if(oweTable === undefined){
    var newTable = genSquareZeroTable(numPpl);

    OweTable.call(this, newTable);
  }else{
    console.error('ERROR: Unknown oweTable');
    return null;
  }
};

util.inherits(Troupe, OweTable);

// Override
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

  // check duplicated users
  this.users = users = userUnique(this.users.concat(users));

  var numPpl = this.numPpl = users.length;
  var oweTable = this.oweTable;

  for(var i=0; i<numPpl; i++){
    for(var j=0; j<numPpl; j++){
      if(oweTable[i] === undefined){
        oweTable.push([]); 
      }
      if(oweTable[i][j] === undefined){
        oweTable[i][j] = 0;
      }
    }
  }

  return true;
};

Troupe.prototype.delUsers = function(users){
  if(! Array.isArray(users)){
    users = [users];
  }

  var numPpl = this.users.length;
  var oweTable = this.oweTable;

  var o = {};
  for(var i=users.length; i--;){
    o[users[i].user_id] = users[i];
  }

  this.users = this.users.filter(function(user, i){
    if(o[user.user_id] !== undefined){
      for(var j=numPpl; j--;){
        if(oweTable[i][j]!==0 || oweTable[j][i]!==0){
          return true;
        }
      }
      for(var j=numPpl; j--;){
        oweTable[j].splice(i, 1);
      }
      oweTable.splice(i, 1);
      return false;
    }else{
      return true;
    }
  });

  this.numPpl = this.users.length;

  for(var i=this.users.length; i--;){
    if(o[this.users[i].user_id] !== undefined){
      return false; // del users still have to pay / receive
    }
  }

  return true;
};

Troupe.prototype.charge = function(payer, payee, amount){
  if(! (payer instanceof User && payee instanceof User && typeof amount==='number')){
    return false;
  }

  var users = this.users;

  var o = {};
  for(var i=users.length; i--;){
    o[users[i].user_id] = users[i];
  }

  if(o[payer.user_id]!==undefined && o[payee.user_id]!==undefined){
    return false; // one of payer or payee is not in the Troupe
  }

  var i = users.indexOf(o[payer.user_id]);
  var j = users.indexOf(o[payee.user_id]);
  
  this.oweTable[i][j] += amount;

  return true;
};

Troupe.prototype.pay = function(payer, payee, amount){
  if(! (payer instanceof User && payee instanceof User && typeof amount==='number')){
    return false;
  }

  var users = this.users;

  var o = {};
  for(var i=users.length; i--;){
    o[users[i].user_id] = users[i];
  }

  if(o[payer.user_id]!==undefined && o[payee.user_id]!==undefined){
    return false; // one of payer or payee is not in the Troupe
  }

  var i = users.indexOf(o[payer.user_id]);
  var j = users.indexOf(o[payee.user_id]);
  
  this.oweTable[i][j] -= amount;

  return true;
};
