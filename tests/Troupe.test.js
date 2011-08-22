var should = require('should');
var Troupe = require('../lib/Troupe');
var User   = require('../lib/User');

Array.prototype.sum = function(){
  return this.reduce(function(x, y){
    return x + y; 
  });
}

var A = new User({username:'A', user_id:0});
var B = new User({username:'B', user_id:1});
var C = new User({username:'C', user_id:2});
var D = new User({username:'D', user_id:3});
var E = new User({username:'E', user_id:4});
var users = [A, B, C, B, D, D];
var newUsers = [A, E];
var oldUsers = [A, D];

module.exports = {
  'new': function(){
    /*** without defualt oweTable ***/
    var troupe = new Troupe(users);
    troupe.should.not.equal(null);
    troupe.print();
    troupe.should.have.ownProperty('troupTable');
    troupe.should.have.ownProperty('numPpl');
    var troupTable = troupe.troupTable;
    var user_ids   = Object.keys(troupTable);
    var numPpl     = user_ids.length;

    var newTable = [];

    for(var i=0; i<numPpl; i++){
      newTable.push([]);
      for(var j=0; j<numPpl; j++){
        troupTable[user_ids[i]][user_ids[j]].should.equal(0);
        newTable[i][j] = Math.floor(Math.random()*100); // between 0 and 99
      }
    }

    /*** with defualt oweTable ***/
    troupe = new Troupe(users, newTable);
    troupe.should.not.equal(null);
    troupe.print();
    troupe.should.have.ownProperty('troupTable');
    troupe.should.have.ownProperty('numPpl');
    troupTable = troupe.troupTable;
    user_ids   = Object.keys(troupTable);

    for(var i=0; i<numPpl; i++){
      for(var j=0; j<numPpl; j++){
        troupTable[user_ids[i]][user_ids[j]].should.equal(newTable[i][j]);
      }
    }
  },
  'addUsers': function(){
    var troupe     = new Troupe(users);
    var troupTable = troupe.troupTable;
    var user_ids   = Object.keys(troupTable);
    var numPpl     = user_ids.length;

    var newTable = [];
    for(var i=0; i<numPpl; i++){
      newTable.push([]);
      for(var j=0; j<numPpl; j++){
        newTable[i][j] = Math.floor(Math.random()*100); // between 0 and 99
      }
    }

    troupe = new Troupe(users, newTable);
    troupe.print();
    troupe.addUsers(newUsers).should.be.false;
    troupe.addUsers(E).should.be.true;
    troupe.should.be.an.instanceof(Troupe);
    troupTable = troupe.troupTable;
    troupe.print();
    for(var i=0; i<numPpl; i++){
      for(var j=0; j<numPpl; j++){
        troupTable[user_ids[i]][user_ids[j]].should.equal(newTable[i][j]); // between 0 and 99
      }
    }
  },
  'delUsers': function(){
    var troupe = new Troupe(users.concat(newUsers));
    troupe.print();
    troupe.delUsers(oldUsers).should.be.true;
    troupe.print();
    troupe.delUsers(oldUsers).should.be.false;
    troupe.print();
  },
  'charge': function(){
    var troupe = new Troupe(users);
    troupe.print();
    troupe.charge(A, E, 3).should.be.false;
    troupe.print();
    troupe.charge(A, D, 3).should.be.true;
    troupe.print();

    var troupTable = troupe.troupTable;
    troupTable[A.user_id][D.user_id].should.equal(3);
  },
  'pay': function(){
    var troupe = new Troupe(users);
    troupe.print();
    troupe.pay(A, E, 3).should.be.false;
    troupe.print();
    troupe.pay(A, D, 3).should.be.false;
    troupe.print();
    troupe.charge(A, D, 3).should.be.true;
    troupe.pay(A, D, 3).should.be.true;
    troupe.print();
  },
  'optimize': function(){
    var troupe     = new Troupe(users);
    var troupTable = troupe.troupTable;
    var user_ids   = Object.keys(troupTable);
    var numPpl     = user_ids.length;

    var newTable = [];
    for(var i=0; i<numPpl; i++){
      newTable.push([]);
      for(var j=0; j<numPpl; j++){
        newTable[i][j] = Math.floor(Math.random()*100); // between 0 and 99
      }
    }

    troupe = new Troupe(users, newTable);
    troupe.print();
    troupe = troupe.optimize();
    troupe.print();

    troupTable    = troupe.troupTable;
    var subTotals = [];
    for(var i=0; i<numPpl; i++){
      var subtotal = 0;
      for(var j=0; j<numPpl; j++){
        subtotal += troupTable[user_ids[i]][user_ids[j]];
      }
      subTotals[i] = subtotal;
    }
    console.dir(subTotals);

    var subTotals2 = [];
    for(var i=0; i<numPpl; i++){
      var subtotal = 0;
      for(var j=0; j<numPpl; j++){
        subtotal += newTable[i][j] - newTable[j][i];
      }
      subTotals2[i] = Math.max(subtotal, 0);
    }
    console.dir(subTotals2);
    for(var i=0; i<numPpl; i++){
      subTotals2[i].should.equal(subTotals[i]);
    }
  },
};
