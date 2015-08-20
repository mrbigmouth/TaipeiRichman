Meteor.methods({
  //登入使用者加入遊戲
  playerJoinGame: function() {
    if (APP.db.player.isPlayerFull()) {
      if (Meteor.isClient) {
        alert('抱歉！遊戲已額滿！');
      }
      return false;
    }
    APP.addPlayer(this.userId);
  },
  //登入使用者離開遊戲
  playerExitGame: function() {
    if (!APP.isLoginUserInGame()) {
      if (Meteor.isClient) {
        alert('您沒有參加遊戲！');
      }
      return false;
    }
    APP.deletePlayer(this.userId);
  }
});