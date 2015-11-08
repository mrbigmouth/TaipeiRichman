Meteor.methods({
  //登入使用者加入遊戲
  playerJoinGame: function() {
    var gameStatus = APP.gameStatus;
    if (gameStatus.isGameStart()) {
      if (Meteor.isClient) {
        alert('遊戲已經開始囉，請耐心等待下一輪！');
      }
      return false;
    }
    if (APP.db.player.isPlayerFull()) {
      if (Meteor.isClient) {
        alert('抱歉！遊戲已額滿！');
      }
      return false;
    }
    if (APP.isLoginUserInGame()) {
      if (Meteor.isClient) {
        alert('您已經參加了遊戲！');
      }
      return false;
    }
    APP.db.player.addUserPlayer(this.userId);
  },
  //登入使用者離開遊戲
  playerExitGame: function() {
    if (!APP.isLoginUserInGame()) {
      if (Meteor.isClient) {
        alert('您沒有參加遊戲！');
      }
      return false;
    }
    APP.db.player.deleteUserPlayer(this.userId);
  },
  startGame: function() {
    var gameStatus = APP.gameStatus;
    if (gameStatus.isGameStart()) {
      if (Meteor.isClient) {
        alert('目前無法開始遊戲！');
      }
      return false;
    }
    if (APP.db.player.countUser() < 1) {
      if (Meteor.isClient) {
        alert('至少要有一名玩家才可開始遊戲！');
      }
      return false;
    }
    APP.executeGameStart();
  },
  restart: function() {
    var lastDiceMessage = APP.db.message.getLastDiceMessage();
    var userId = this.userId;
    var aliveOtherPlayer = 0;
    //若尚未登入
    if (! userId) {
      if (Meteor.isClient) {
        alert('請先登入！');
      }
      return false;
    }
    //若最後一次擲骰在1分鐘之內
    if (Date.now() - lastDiceMessage.time.getTime() <= 60000) {
      //檢測是否是唯一一位存活玩家
      _.each(APP.db.player.fetchAllAlive(), function(player) {
        if (player.userId && player.userId !== userId) {
          aliveOtherPlayer += 1;
        }
      });
      if (aliveOtherPlayer > 0) {
        if (Meteor.isClient) {
          alert('仍有其他玩家正在進行遊戲中，你無法中斷遊戲！');
        }
        return false;
      }
    }
    APP.executeGameEnd();
  },
  rollADice: function() {
    var gameStatus = APP.gameStatus;
    //在伺服器端執行時要進行判斷
    if (Meteor.isServer) {
      //執行方法者為伺服器端(因執行動作的執行期限已到) 或 (當前正在等待玩家擲骰 且 當前正在等待該玩家)
      if (this.connection === null || (gameStatus.isWaitUserDice() && gameStatus.isWaitLoginUser())) {
        //將遊戲狀態改為擲骰中
        gameStatus.setToDicing();
        //一秒鐘後執行移動
        Meteor.setTimeout(function() {
          var diceResult = Math.floor(Math.random() * 6) + 1;
          //先插入擲骰結果訊息
          APP.db.message.addDiceMessage(diceResult);
          //將狀態改為等候玩家觀看擲骰結果
          gameStatus.setToWaitPlayerLookDice();
          //1秒後執行玩家移動
          Meteor.setTimeout(function() {
            APP.executePlayerMoving( diceResult );
          }, 1000);
        }, 1000);
      }
    }
    //在使用者端執行時就直接進入動畫
    else {
      //將遊戲狀態改為擲骰中
      gameStatus.setToDicing();
    }
  },
  buyLandMark: function(result) {
    var gameStatus = APP.gameStatus;
    var player;
    var landMark;
    check(result, Boolean);
    //執行方法者為伺服器端(因執行動作的執行期限已到) 或 (當前正在等待玩家購地 且 當前正在等待該玩家)
    if (this.connection === null || (gameStatus.isWaitUserBuy() && gameStatus.isWaitLoginUser())) {
      player = gameStatus.getCurrentPlayer();
      landMark = player.getPosition();
      //若該地標確定無擁有者
      if (! landMark.getOwner()) {
        if (result) {
          //玩家付帳
          player.payMoney( landMark.price );
          //變更地標擁有者
          landMark.setOwner(player);
          //插入一則確定購買的訊息
          APP.db.message.addBuyMessage(landMark, 1);
        }
        else {
          //插入一則拒絕購買的訊息
          APP.db.message.addBuyMessage(landMark, 0);
        }
      }
      //換下一位玩家進行擲骰
      APP.executePlayerDice( player.getNextPlayer() );
    }
  },
  buildHouse: function(result) {
    var gameStatus = APP.gameStatus;
    var player;
    var landMark;
    check(result, Boolean);
    //執行方法者為伺服器端(因執行動作的執行期限已到) 或 (當前正在等待玩家購地 且 當前正在等待該玩家)
    if (this.connection === null || (gameStatus.isWaitUserBuild() && gameStatus.isWaitLoginUser())) {
      player = gameStatus.getCurrentPlayer();
      landMark = player.getPosition();
      //若該地標確定擁有者為當前玩家
      if (landMark.getOwner()._id === player._id) {
        if (result) {
          //玩家付帳
          player.payMoney( landMark.price );
          //在地標上加蓋一層房屋
          landMark.addHouse();
          //插入一則確定建房的訊息
          APP.db.message.addBuildMessage(landMark, 1);
        }
        else {
          //插入一則拒絕購買的訊息
          APP.db.message.addBuildMessage(landMark, 0);
        }
      }
      //換下一位玩家進行擲骰
      APP.executePlayerDice( player.getNextPlayer() );
    }
  },
  //登入使用者發送聊天訊息
  chat: function(message) {
    check(message, String);
    if (this.userId) {
      APP.db.message.addChatMessage(this.userId, message);
    }
    else {
      if (Meteor.isClient) {
        alert('請先登入！');
      }
    }
  },
  //開發者測試時用的加自己錢、扣電腦錢
  addMoney: function() {
    if (Meteor.absoluteUrl() === 'http://localhost:3000/') {
      APP.db.player.getAllOrderBySort().forEach(function(player, index) {
        if (index === 0) {
          player.gainMoney(5000);
        }
        else {
          player.payMoney(500);
        }
      });
    }
  }
});