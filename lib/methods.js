Meteor.methods({
  playerJoinGame: function() {
    APP.addPlayer(this.userId);
  },
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