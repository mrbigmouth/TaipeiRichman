//宣告一個單體的、廣域的App物件
APP = {
  //資料庫
  db: {
    //當前玩家狀態資料庫
    player: dbPlayer
  },
  //判斷當前登入使用者是否已在遊戲中
  isLoginUserInGame: function() {
    //若當前使用者有登入且在玩家資料庫中找到當前登入使用者，就代表使用者已在遊戲中
    var userId = Meteor.userId();
    if (! userId) {
      return false;
    }
    return !!(APP.db.player.getPlayerByUserId(userId));
  },
  //加入新玩家
  addPlayer: function(userId) {
    APP.db.player.addUserPlayer(userId);
    return this;
  },
  //玩家離開遊戲
  deletePlayer: function(userId) {
    APP.db.player.deleteUserPlayer(userId);
    return this;
  }
};