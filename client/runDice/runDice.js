Template.runDice.helpers({
  //判斷是否要顯示骰子
  isShowDice: function() {
    var gameStatus = APP.gameStatus;
    return (gameStatus.isWaitDicing() || gameStatus.isWaitUserLookDice());
  }
});

Template.runDice_dice.helpers({
  //骰子應使用的樣式類別
  diceClass: function() {
    var gameStatus = APP.gameStatus;
    var lastDiceResult;
    //若仍在擲骰中
    if (gameStatus.isWaitDicing()) {
      return 'running';
    }
    //若在等候系統執行中
    if (gameStatus.isWaitUserLookDice()) {
      //取得最後一條非聊天訊息
      lastDiceResult = APP.db.message.getLastDiceResult();
      //顯示show[擲骰結果]的class
      return 'show' + lastDiceResult;
    }
  }
});

//每次顯示骰子時自動置中
Template.runDice_dice.onRendered(function() {
  var $window = $(window);
  var $firstNode = $(this.firstNode);
  var top = ($window.height() - $firstNode.height()) / 2;
  var left = ($window.width() - $firstNode.width()) / 2;
  $firstNode.css({
    top: top + 'px',
    left: left + 'px'
  });
});