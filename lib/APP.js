//宣告一個單體的、廣域的App物件
APP = {
  //資料庫
  db: {
    //當前玩家狀態資料庫
    player: new Mongo.Collection('Player', {
      transform: function(data) {
        return new Player(data);
      }
    })
  },
  //判斷當前登入使用者是否已在遊戲中
  isLoginUserInGame: function() {
    //若當前使用者有登入且在玩家資料庫中找到當前登入使用者，就代表使用者已在遊戲中
    var userId = Meteor.userId();
    if (! userId) {
      return false;
    }
    return (APP.db.player.find({userId: Meteor.userId()}).count() > 0);
  },
  //加入新玩家
  addPlayer: function(userId) {
    var computerPlayer = APP.db.player.findOne({userId: null}, {sort: {sort:1}});
    APP.db.player.update(computerPlayer._id, {$set : {userId: userId}});
    return this;
  },
  //玩家離開遊戲
  deletePlayer: function(userId) {
    APP.db.player.update({userId: userId}, {$set : {userId: null}});
    return this;
  }
};