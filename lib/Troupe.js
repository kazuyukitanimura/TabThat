var util = require('util');
var OweTable = require('./OweTable');
var User = require('./User');

Array.prototype.sum = function(){
  return this.reduce(function(x, y){
    return x + y; 
  });
}

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

  var troupTable = this.troupTable = {};
  // check duplicated users
  for(var i=users.length; i--;){
    troupTable[users[i].user_id] = {data: users[i]};
  }
  
  var numPpl = this.numPpl = Object.keys(troupTable).length;

  if(Array.isArray(oweTable)){
    if(numPpl !== oweTable.length){
      console.error('ERROR: Users-oweTable Missmatch');
      return null;
    }
  }else if(oweTable === undefined){
    oweTable = genSquareZeroTable(numPpl);
  }else{
    console.error('ERROR: Unknown oweTable');
    return null;
  }

  for(var i=numPpl; i--;){
    for(var j=numPpl; j--;){
      troupTable[users[i].user_id][users[j].user_id] = oweTable[i][j];
    }
  }

  OweTable.call(this, oweTable);
};

util.inherits(Troupe, OweTable);

// Override
Troupe.prototype.print = function(){
  var numPpl     = this.numPpl;
  var troupTable = this.troupTable;
  var user_ids   = Object.keys(troupTable);

  console.dir(user_ids.map(function(i){
    return user_ids.map(function(j){
      return troupTable[i][j];
    });
  }));

  console.log("subtotals");
  console.dir(user_ids.map(function(i){
    return troupTable[i].data.username + ': ' +  user_ids.map(function(j){troupTable[j]}).sum();
  }));
  console.log('');
};

Troupe.prototype.addUsers = function(users){
  if(! Array.isArray(users)){
    users = [users];
  }

  var troupTable = this.troupTable;
  // check duplicated users
  for(var i=users.length; i--;){
    troupTable[users[i].user_id] = {data: users[i]};
  }
  
  var user_ids = Object.keys(troupTable);
  var numPpl   = this.numPpl = user_ids.length;

  for(var i=numPpl; i--;){
    for(var j=numPpl; j--;){
      if(troupTable[user_ids[i]][user_ids[j]] === undefined){
        troupTable[user_ids[i]][user_ids[j]] = 0;
      }
    }
  }

  this.numPpl = numPpl;

  return true;
};

Troupe.prototype.delUsers = function(users){
  if(! Array.isArray(users)){
    users = [users];
  }

  var troupTable = this.troupTable;
  var user_ids   = Object.keys(troupTable);
  var numPpl     = user_ids.length;

  var user_idsD  = users.map(function(user){return user.user_id;});
  var numPplD    = user_ids.length;

  for(var i=numPpl; i--;){
    for(var j=numPplD; j--;){
      if(troupTable[user_ids[i]][user_idsD[j]]!==0 || troupTable[user_idsD[j]][user_ids[i]]!==0){
        return false; // del users still have to pay / receive or users do not exist in the Troupe
      }
    }
  }
  for(var i=numPpl; i--;){
    for(var j=numPplD; j--;){
      delete troupTable[user_ids[i]][user_idsD[j]];
    }
  }
  for(var j=numPplD; j--;){
    delete troupTable[user_idsD[j]];
  }

  this.numPpl = numPpl;

  return true;
};

Troupe.prototype.charge = function(payer, payee, amount){
  if(! (payer instanceof User && payee instanceof User && typeof amount==='number')){
    return false;
  }

  var troupTable = this.troupTable;

  if(troupTable[payer.user_id]!==undefined && troupTable[payee.user_id]!==undefined){
    return false; // one of payer or payee is not in the Troupe
  }
  
  troupTable[payer.user_id][payee.user_id] += amount;

  return true;
};

Troupe.prototype.pay = function(payer, payee, amount){
  if(! (payer instanceof User && payee instanceof User && typeof amount==='number')){
    return false;
  }

  var troupTable = this.troupTable;

  if(troupTable[payer.user_id]!==undefined && troupTable[payee.user_id]!==undefined){
    return false; // one of payer or payee is not in the Troupe
  }
  
  troupTable[payer.user_id][payee.user_id] -= amount;

  return true;
};
