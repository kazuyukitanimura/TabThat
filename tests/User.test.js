var should = require('should');
var User = require('../lib/User');

module.exports = {
  'new': function(){
    var user1 = new User({username:'A'});
    console.log(user1);
    //user1.should.not.be.an.instanceof(user1.constructor);
    var user2 = new User({username:'A', user_id:00});
    console.log(user2);
    //user2.should.be.an.instanceof(user2.constructor);
  }
};
