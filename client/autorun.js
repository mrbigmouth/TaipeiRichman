//視遊戲最新狀態動態自動執行行動對話框的彈出動作
Tracker.autorun(function() {
  var gameStatus = APP.gameStatus;
  //若遊戲狀態為等待
  if (gameStatus.isGameAWaiting()) {
    //若當前登入使用者有參加上一場遊戲
    if (gameStatus.isLoginUserJoinLastGame()) {
      //開啟遊戲結束視窗，通報遊戲結果
      Session.set('popUpState', {
        open: true,
        content: 'end'
      });
    }
    //否則開啟登入/加入遊戲對話框
    else {
      Session.set('popUpState', {
        open: true,
        content: 'game'
      });
    }
  }
  //若遊戲狀態為進行中
  else if (gameStatus.isGameStart()) {
    //若正等待當前玩家決策，則自動開啟action對話框
    if (gameStatus.isWaitLoginUser() && (gameStatus.isWaitUserDice() || gameStatus.isWaitUserBuy() || gameStatus.isWaitUserBuild())) {
      Session.set('popUpState', {
        open: true,
        content: 'action'
      });
    }
    //否則自動關閉action對話框
    else if (Session.get('popUpState').content === 'action') {
      Session.set('popUpState', {
        open: false,
        content: ''
      });
    }
  }
});

//處理玩家棋子的移動動畫
Tracker.autorun(function() {
  //只有APP已啟動時才會繼續執行
  if (!APP.isInitialized()) {
    return;
  }
  //只有遊戲已經開始時才會繼續執行
  if (gameStatus.isGameStart()) {
    //若正在等候某個玩家移動，則自動關閉action對話框，並啟動玩家棋子移動動畫
    if (gameStatus.isWaitMoving()) {
      var currentPlayer = gameStatus.getCurrentPlayer();
      var lastDiceResult =  APP.getLastDiceResult();
      //開始從當前位置到下一個位置的移動
      currentPlayer.moving(currentPlayer.getPosition(), currentPlayer.getNextPosition(lastDiceResult));
    }
    //只要不是正在等候某個玩家移動中
    else {
      //若當前有任何玩家棋子移動的動畫在執行中
      if (Session.get('movingInterval')) {
        //中止當前的玩家棋子移動動畫
        Meteor.clearInterval(Session.get('movingInterval'));
        Session.set('movingInterval', null);
      }
    }
  }
});

//視地標的最新擁有者、房子層數狀態，在google地圖上設定地標、建造房子
Tracker.autorun(function() {
  //只有APP已啟動時才會繼續執行
  if (!APP.isInitialized()) {
    return;
  }

  _.each(CONFIG.landMarkList, function(v, k) {
    var sort = k + 1;
    Tracker.autorun(function() {
      APP.db.landMark.getBySort(sort).setOnMap().setHouseOnMap();
    });
  });
});

//視玩家狀態，在google地圖上放置、移動玩家標誌
Tracker.autorun(function() {
  //只有APP已啟動時才會繼續執行
  if (!APP.isInitialized()) {
    return;
  }

  APP.db.player.getAll().forEach(function(player) {
    player.setOnMap();
  });
});