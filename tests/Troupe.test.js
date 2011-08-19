var should = require('should');
var OweTable = require('../lib/OweTable');
var Troupe = require('../lib/Troupe');

var users = [{username:'A', user_id:0}, {username:'B', user_id:1}, {username:'C', user_id:2}, {username:'B', user_id:1}, {username:'D', user_id:3}, {username:'D', user_id:3}];

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
};
