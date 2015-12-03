Template.main.helpers({
  //判斷是否遊戲已開始
  isGameStart: function() {
    return APP.gameStatus.isGameStart();
  },
  //判斷使用者是否能看到"動作"按鈕
  canAction: function() {
    var gameStatus = APP.gameStatus;
    var currentPlayer;
    if (gameStatus.isGameStart()) {
      currentPlayer = gameStatus.getCurrentPlayer();
      if (currentPlayer.isLoginUser()) {
        return true;
      }
    }
    return false;
  }
});

//點擊按鈕時開啟相應動作dialog
Template.main.events({
  'click button[id]': function(e) {
    Session.set('popUpState', {
      open: true,
      content: e.currentTarget.id
    });
  }
});

//取得玩家資訊
Template.playerInfo.helpers({
  players: function() {
    return APP.db.player.getAllOrderBySort();
  }
});