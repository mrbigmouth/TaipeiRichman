//發布資料
Meteor.publish('initializeDB', function() {
  return [
    APP.db.player.find()
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
