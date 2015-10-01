//宣告一個單體的、廣域的App物件
APP = {
  //資料庫
  db: {
    //地標資料庫
    landMark: dbLandMark,
    //當前玩家狀態資料庫
    player: dbPlayer,
    //當前訊息資料庫
    message: dbMessage
  },
  //使用者端程式專用，儲存google api
  _map: null,
  //遊戲狀態物件
  gameStatus: gameStatus,
  //使用者端程式專用，取得Google Map API
  getGoogleMap: function() {
    //只有在使用者端才會執行此方法
    if (Meteor.isClient) {
      return this._map;
    }
    else {
      return null;
    }
  },
  //紀錄APP是否已啟動的Reactive Data Source
  initialized: new ReactiveVar(false),
  //取得APP是否已啟動
  isInitialized: function() {
    return this.initialized.get();
  },
  //判斷當前登入使用者是否已在遊戲中
  isLoginUserInGame: function() {
    //若當前使用者有登入且在玩家資料庫中找到當前登入使用者，就代表使用者已在遊戲中
    var userId = Meteor.userId();
    if (! userId) {
      return false;
    }
    return !!(APP.db.player.getByUserId(userId));
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