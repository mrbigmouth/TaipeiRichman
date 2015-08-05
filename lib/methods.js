Meteor.methods({
  //登入使用者加入遊戲
  playerJoinGame: function() {
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