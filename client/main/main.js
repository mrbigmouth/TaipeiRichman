Template.main.helpers({
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