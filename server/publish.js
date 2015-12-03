//發布資料
Meteor.publish('initializeDB', function() {
  return [
    APP.gameStatus.getCursor(),
    APP.db.landMark.getAll(),
    APP.db.player.getAll(),
    APP.db.message.getAll()
  ];
});

Meteor.publish('userName', function(userId) {
  check(userId, String);
  return Meteor.users.find(userId, {
    fields: {
      profile: 1
    }
  });
});

//發布rank資料
Meteor.publish('rank', function(page) {
  check(page, Number);
  var skip = (page - 1) * 10;
  var limit = 10;
  return APP.db.rank.getLimitOrderByVictoryAndWealth(skip, limit);
});
