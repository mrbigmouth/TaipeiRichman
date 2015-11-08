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
  //開始遊戲
  executeGameStart: function() {
    //取得遊戲當前狀態
    var gameStatus = APP.gameStatus;
    var firstPlayer;
    //移除先前遊戲訊息，並加入一筆遊戲已開始的訊息
    APP.db.message.addSystemMessage('遊戲開始！');
    //調整遊戲狀態為開始
    gameStatus.setToStart();
    //所有地標初始化
    APP.db.landMark.getAll().forEach(function(landMark) {
      landMark.setDefault();
    });
    //所有玩家的位置與金錢初始化
    APP.db.player.getAll().forEach(function(player) {
      player.setDefault();
    });
    //執行第一位玩家擲骰
    firstPlayer = APP.db.player.getBySort(1);
    APP.executePlayerDice( firstPlayer );
    return APP;
  },
  //執行玩家擲骰
  executePlayerDice: function(player) {
    //取得遊戲當前狀態
    var gameStatus = APP.gameStatus;
    //若遊戲並非進行中，則中止擲骰
    if (gameStatus.isGameAWaiting()) {
      return false;
    }
    //先設定狀態
    gameStatus.setToWaitPlayerDice(player);
    //若該玩家已破產，換下一位玩家進行擲骰
    if (player.isBankruptcy()) {
      APP.executePlayerDice( gameStatus.getNextPlayer() );
    }
    //若玩家住院中，減少住院輪數並換下一位玩家進行擲骰
    else if (player.isInHospital()) {
      //減少住院輪數
      player.processHospital();
      //加入一條住院訊息
      APP.db.message.addHospitalMessage(player);
      //換下一位玩家擲骰
      APP.executePlayerDice( gameStatus.getNextPlayer() );
    }
    else {
      gameStatus.setToWaitPlayerDice(player);
      //若玩家是電腦，則直接自動進行擲骰
      if (player.isComputer()) {
        if (Meteor.isServer) {
          Meteor.setTimeout(function() {
            Meteor.call('rollADice');
          }, 1);
        }
      }
    }
    return APP;
  },
  //執行玩家移動
  executePlayerMoving: function(diceResult) {
    //取得遊戲當前狀態
    var gameStatus = APP.gameStatus;
    var player = gameStatus.getCurrentPlayer();
    var playerPosition = player.getPosition();
    //將遊戲狀態改為執行移動
    gameStatus.setToPlayerMoving();
    //移動完畢後
    Meteor.setTimeout(function() {
      var nextLandMark = player.getNextPosition(diceResult);
      //更新玩家所在位置
      player.setPosition( nextLandMark );
      //更新遊戲狀態為待處理中
      gameStatus.setToWaitSystem();
      //判斷該車禍、購地、付帳、建房還是換下一位玩家
      //判斷是否出車禍
      if (Math.floor(Math.random() * CONFIG.carAccidentProbability) === 0) {
        //執行玩家出車禍
        APP.executeCarAccident(player, nextLandMark);
      }
      else {
        //若該地標是否已有地主
        if (nextLandMark.getOwner()) {
          //判斷玩家是否為擁有者
          if (player.isOwner(nextLandMark)) {
            //執行玩家建房
            APP.executePlayerBuild(player, nextLandMark);
          }
          //醫院不需要支付過路費
          else if (nextLandMark.isHospital()) {
            //讓下一位玩家開始擲骰
            APP.executePlayerDice( gameStatus.getNextPlayer() );
          }
          else {
            //執行玩家支付過路費
            APP.executePlayerPayToll(player, nextLandMark);
          }
        }
        else {
          //檢查該地標是否為事件觸發地點
          if (nextLandMark.isEventLandMark()) {
            //執行隨機事件
            APP.executeRandomEvent(player);
          }
          //否則執行玩家購地
          else {
            APP.executePlayerBuy(player, nextLandMark);
          }
        }
      }
    //預計的移動花費時間再加上500微秒容錯時間
    }, CONFIG.waitingMoveTime * diceResult + 500);
    return APP;
  },
  //執行玩家出車禍
  executeCarAccident: function(player, landMark) {
    var hospital = this.db.landMark.getHospital();
    var hospitalOwner = hospital.getOwner();
    //取得應支付的住院金額
    var toll = hospital.getToll();
    //判斷應住院幾輪
    var round = Math.floor( Math.random() * CONFIG.carAccidentRound ) + 1;
    //增加一條車禍訊息
    APP.db.message.addCarAccidentMessage(player, landMark);
    //將玩家送進醫院
    player.sentToHospital(player, round);
    //增加一條住院訊息
    APP.db.message.addHospitalMessage(player);
    //若醫院有擁有者，則需要支付住院費
    if (hospitalOwner) {
      //增加一筆支付訊息
      APP.db.message.addPayMessage(hospital, toll);
      player.payMoney(toll);
      hospitalOwner.gainMoney(toll);
    }
    //判斷玩家是否破產
    if (player.isBankruptcy()) {
      APP.executePlayerBankruptcy(player);
    }
    //否則讓下一位玩家開始擲骰
    else {
      APP.executePlayerDice( player.getNextPlayer() );
    }
    return APP;
  },
  //執行玩家支付過路費
  executePlayerPayToll: function(player, landMark) {
    //取得應支付的過路費金額
    var toll = landMark.getToll();
    //進行過路費的金額交換
    player.payMoney(toll);
    landMark.getOwner().gainMoney(toll);
    //增加一筆支付訊息
    APP.db.message.addPayMessage(landMark, toll);
    //判斷玩家是否破產
    if (player.isBankruptcy()) {
      APP.executePlayerBankruptcy(player);
    }
    //否則讓下一位玩家開始擲骰
    else {
      APP.executePlayerDice( player.getNextPlayer() );
    }
    return APP;
  },
  //執行玩家破產事件
  executePlayerBankruptcy: function(player) {
    var alivePlayers;
    //加入一條破產訊息
    APP.db.message.addBankruptcyMessage(player);
    //若已破產，取消所有擁有的地標
    APP.db.landMark.getAllByOwner(player.sort).forEach(function(landMark) {
      landMark.setOwner(null);
    });
    //判斷遊戲是否已結束
    alivePlayers = APP.db.player.fetchAllAlive();
    if (alivePlayers.length < 2) {
      APP.executeGameEnd( alivePlayers[0] );
    }
    //否則讓下一位玩家開始擲骰
    else {
      APP.executePlayerDice( player.getNextPlayer() );
    }
    return APP;
  },
  //執行隨機事件
  executeRandomEvent: function(player) {
    switch (Math.floor(Math.random() * 6)) {
    case 0:
      APP.db.message.addSystemMessage('立法院新聞：新的「國有土地管理辦法」已然三讀通過，部份土地將被低價徵收！');
      APP.db.landMark.getAll().forEach(function(landMark) {
        if (Math.floor(Math.random() * 3) === 0) {
          var owner = landMark.getOwner();
          if (owner) {
            owner.gainMoney(100);
            APP.db.message.addSystemMessage(owner.getDisplayName() + '的「' + landMark.getName() + '」被政府徵收啦！');
            landMark.setOwner(null);
          }
        }
      });
      break;
    case 1:
      APP.db.message.addSystemMessage('立法院新聞：股市持續低迷，觸動立法院新立的「經濟危機處理條款」，政府將發給每人價值一千元的消費券！');
      APP.db.player.getAll().forEach(function(player) {
        if (! player.isBankruptcy()) {
          player.gainMoney(1000);
        }
      });
      break;
    case 2:
      APP.db.message.addSystemMessage('立法院新聞：為驅趕盤據於立法院的學運抗議人士，警察出動了夜鷹特勤、挖土機與CM-11虎式戰車進行攻堅，然後不知道為什麼，所有政府機關建築都被夷平了！');
      APP.db.landMark.getAllGovernment().forEach(function(landMark) {
        landMark.destroyHouse();
      });
      break;
    case 3:
      APP.db.message.addSystemMessage('立法院新聞：為執行新通過的「打擊學運、嚴防學匪」法案，大量警察湧入各大院校抓補學生，爆發嚴重警民衝突，建築物損毀！');
      APP.db.landMark.getAllSchool().forEach(function(landMark) {
        landMark.destroyHouse();
      });
      break;
    case 4:
      APP.db.message.addSystemMessage('立法院新聞：因為最新的「油電價格合理化」法案，各地地價、房價、租金節節攀升！');
      APP.db.landMark.getAll().forEach(function(landMark) {
        landMark.raisePrice();
      });
      break;
    case 5:
      APP.db.message.addSystemMessage('立法院新聞：立法院被學運份子佔領中，無法正常運作。');
      break;
    }
    //讓下一位玩家開始擲骰
    APP.executePlayerDice( APP.gameStatus.getNextPlayer() );
    return APP;
  },
  //執行玩家購地
  executePlayerBuy: function(player, landMark) {
    var gameStatus = APP.gameStatus;
    //判斷是否可建房
    if (player.canBuy(landMark)) {
      //若玩家是電腦
      if (player.isComputer()) {
        //判斷是否要購地
        if (player.money * CONFIG.computerBuyStrategy / 100 > landMark.price) {
          Meteor.call('buyLandMark', true);
        }
        else {
          Meteor.call('buyLandMark', false);
        }
      }
      //否則將狀態調整為等待該登入玩家決策是否購地
      else {
        gameStatus.setToWaitUserBuy();
      }
    }
    //否則讓下一位玩家開始擲骰
    else {
      //加入一筆無法購地的訊息
      APP.db.message.addBuyMessage(landMark, false);
      APP.executePlayerDice( gameStatus.getNextPlayer() );
    }
    return APP;
  },
  //執行玩家建房
  executePlayerBuild: function(player, landMark) {
    var gameStatus = APP.gameStatus;
    //判斷是否可建房
    if (player.canBuy(landMark) && landMark.house < CONFIG.maxHouseNumber) {
      //若玩家是電腦
      if (player.isComputer()) {
        //判斷是否要建房
        if (player.money * CONFIG.computerBuyStrategy / 100 > landMark.price) {
          Meteor.call('buildHouse', true);
        }
        else {
          Meteor.call('buildHouse', false);
        }
      }
      //否則將狀態調整為等待該玩家決策是否建房
      else {
        gameStatus.setToWaitUserBuild();
      }
    }
    //否則讓下一位玩家開始擲骰
    else {
      //加入一筆無法建房的訊息
      APP.db.message.addBuildMessage(landMark, false);
      APP.executePlayerDice( gameStatus.getNextPlayer() );
    }
    return APP;
  },
  //執行遊戲結束
  executeGameEnd: function(winner) {
    //取得遊戲當前狀態
    var gameStatus = this.gameStatus;
    var allUserPlayersId = APP.db.player.getAllUser().map(function(player) {
      return player.userId;
    });
    //將遊戲紀錄存入排行榜紀錄資料庫
    APP.db.rank.addGameRecord(winner);
    //將遊戲狀態設為結束
    var winnerUserId = winner ? winner.getUserId() : null;
    gameStatus.setToEnd(winnerUserId, allUserPlayersId);
    //所有玩家預設自動登出，需要重新參加遊戲
    APP.db.player.deleteAllUserPlayer();
    //遊戲訊息初始化
    APP.db.message.initialize();
    return APP;
  }
};