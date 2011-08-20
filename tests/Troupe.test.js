var should = require('should');
var OweTable = require('../lib/OweTable');
var Troupe = require('../lib/Troupe');

var A = {username:'A', user_id:0};
var B = {username:'B', user_id:1};
var C = {username:'C', user_id:2};
var D = {username:'D', user_id:3};
var E = {username:'E', user_id:4};
var users = [A, B, C, B, D, D];
var newUsers = [A, E];
var oldUsers = [A, D];

module.exports = {
  'new': function(){
    var troupe = new Troupe(users);
    troupe.should.not.equal(null);
    troupe.should.be.an.instanceof(OweTable);
    troupe.print();
    troupe.should.have.ownProperty('oweTable');
    newTable = troupe.oweTable;

    for(var i=0; i<newTable.length; i++){
      for(var j=0; j<newTable[0].length; j++){
        newTable[i][j].should.equal(0);
        newTable[i][j] = 1;
      }
    }

    troupe = new Troupe(users, newTable);
    troupe.should.not.equal(null);
    troupe.print();
    troupe.should.have.ownProperty('oweTable');
  },
  'addUsers': function(){
    var troupe = new Troupe(users);
    troupe.print();
    troupe.addUsers(newUsers).should.be.true;
    troupe.should.be.an.instanceof(Troupe);
    troupe.print();
    troupe.numPpl.should.equal(troupe.oweTable.length);
  },
  'delUsers': function(){
    var troupe = new Troupe(users.concat(newUsers));
    troupe.print();
    troupe.delUsers(oldUsers).should.be.false;
    troupe.print();
    troupe.numPpl.should.equal(troupe.oweTable.length);
  }
};
