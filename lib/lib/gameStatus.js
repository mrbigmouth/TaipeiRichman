/**
 * 遊戲狀態資料物件
 * @class GameStatus
 * @property {String} _id 主鍵
 * @property {Number} status 系統狀態 0: 遊戲未開始，等待玩家加入 1:遊戲已開始
 * @property {?Number} currentPlayerSort 當前動作的玩家序號
 * @property {?Number} executeAction 當前執行的動作
 *                                   0: 等候系統執行中
 *                                   1: 等待登入玩家擲骰
 *                                   2: 擲骰運作中
 *                                   3: 等待玩家觀看擲骰結果中
 *                                   4: 玩家棋子移動中
 *                                   5: 等待登入玩家決策是否購地中
 *                                   6: 等待登入玩家決策是否建房中
 * @property {?Number} executeLimitTime 當前等待執行動作的執行期限，微秒格式
 * @property {?Number} executeLeftTime 當前等待執行動作的執行期限剩時時間，秒格式
 * @property {?String} lastGameWinner 上一場遊戲贏家的userId，若為null，代表獲者者為電腦
 * @property {String[]} lastGameJoiner 上一場遊戲的登入玩家
 */
var dbGameStatus = new Mongo.Collection('GameStatus');

/**
 * 取得遊戲狀態，可以特別輸入想取得的欄位。
 * 若只想取得一個欄位，則直接回傳欄位值，否則回傳GameStatus物件。
 * @function getStatusField
 * @param {...string} fields 
 * @return {*}
 */
function getStatusField() {
  var args;
  var fields;
  var result
  //若有輸入值
  if (arguments.length) {
    //將傳入值轉為{fields: 1}的型態
    args = _.map(arguments, function(v) {
      return [v, 1];
    });
    fields = _.object(args);
    if (arguments.length === 1) {
      return dbGameStatus.findOne({}, {fields: fields})[ arguments[0] ];
    }
    else {
      return dbGameStatus.findOne({}, {fields: fields});
    }
  }
  else {
    return dbGameStatus.findOne();
  }
}
/**
 * 設定遊戲狀態的欄位值
 * @function setStatusField
 * @param {object} setting key=>value格式的hash物件  key為欄位名稱
 */
function setStatusField(newData) {
  var id = getStatusField('id');
  dbGameStatus.update(id, {
    $set: newData
  });
};

gameStatus = {
  //程式啟動時初始化遊戲狀態
  initialize: function() {
    //清空原先資料
    dbGameStatus.remove({});
    //塞入初始化資料
    dbGameStatus.insert({
      status: 0,
      currentPlayerSort: null,
      executeAction: null,
      executeLimitTime: null,
      executeLeftTime: null,
      lastGameWinner: null,
      lastGameJoiner: []
    });
  },
  //判斷遊戲狀態是否正在等待玩家加入
  isGameAWaiting: function() {
    return (getStatusField('status') === 0);
  },
  //判斷遊戲狀態是否為進行中
  isGameStart: function() {
    return (getStatusField('status') === 1);
  },
  //判斷遊戲狀態是否正在等待系統執行中(可能因為網路傳輸緣故)
  isWaitSystem: function() {
    return (getStatusField('executeAction') === 0);
  },
  //判斷遊戲狀態是否正在等待某位登入玩家的擲骰
  isWaitUserDice: function() {
    return (getStatusField('executeAction') === 1);
  },
  //判斷遊戲狀態是否正在等待擲骰(的動畫)運作中
  isWaitDicing: function() {
    return (getStatusField('executeAction') === 2);
  },
  //判斷遊戲狀態是否正在等待玩家觀看擲骰結果中
  isWaitUserLookDice: function() {
    return (getStatusField('executeAction') === 3);
  },
  //判斷遊戲狀態是否正在等待棋子移動中
  isWaitMoving: function() {
    return (getStatusField('executeAction') === 4);
  },
  //判斷遊戲狀態是否正在等待登入玩家決策是否購地中
  isWaitUserBuy: function() {
    return (getStatusField('executeAction') === 5);
  },
  //判斷遊戲狀態是否正在等待登入玩家決策是否建房中
  isWaitUserBuild: function() {
    return (getStatusField('executeAction') === 6);
  },
  //取得正在行動的玩家
  getCurrentPlayer: function() {
    var currentPlayerSort = getStatusField('currentPlayerSort');
    return APP.db.player.getBySort(currentPlayerSort) || null;
  },
  //判斷遊戲狀態是否正在等待當前登入玩家的行動
  isWaitLoginUser: function() {
    var currentPlayer = this.getCurrentPlayer();
    return (currentPlayer && currentPlayer.isLoginUser());
  },
  //取得當前玩家的剩餘行動時間
  getExecuteLeftTime: function() {
    return getStatusField('executeLeftTime');
  },
  //獲得上一場遊戲的勝利者
  getLastGameWinner: function() {
    return getStatusField('lastGameWinner');
  },
  //判斷當前登入使用者是否有參加上一場遊戲
  isLoginUserJoinLastGame: function() {
    var lastGameJoiner = getStatusField('lastGameWinner');
    return _.some(lastGameJoiner, function(joinUserId) {
      if (joinUserId === Meteor.userId()) {
        return true;
      }
      return false;
    });
  },
  //遊戲開始，將遊戲狀態由尚未開始改為進行中
  setToStart: function() {
    setStatusField({
      status: 1,
      lastGameWinner: null,
      lastGameJoiner: []
    });
    return this;
  },
  //遊戲開始，將遊戲狀態由進行中改為等待玩家加入
  setStatusEnd: function(lastGameWinner, lastGameJoiner) {
    setStatusField({
      status: 0,
      lastGameWinner: lastGameWinner,
      lastGameJoiner: lastGameJoiner
    });
    return this;
  },
  //根據當前等待執行動作的執行期限，設定剩時時間
  setExecuteLeftTime: function() {
    var executeLimitTime = getStatusField('executeLimitTime');
    setStatusField({
      executeLeftTime: Math.round((executeLimitTime - Date.now()) / 1000)
    });
    return this;
  },
  //將遊戲狀態改為等候系統執行中
  setStatusWaitSystem: function() {
    setStatusField({
      executeAction: 0,
      executeLimitTime: null,
      executeLeftTime: null
    });
  },
  //將遊戲狀態改為等待指定玩家擲骰
  setStatusWaitPlayerDice: function(player) {
    setStatusField({
      currentPlayerSort: player.sort,
      executeAction: 1,
      executeLimitTime: Date.now() + CONFIG.waitingUserTime,
      executeLeftTime: (CONFIG.waitingUserTime / 1000)
    });
    return this;
  },
  //將遊戲狀態改為等待擲骰運作
  setStatusDicing: function() {
    setStatusField({
      executeAction: 2,
      executeLimitTime: null,
      executeLeftTime: null
    });
    return this;
  },
  //判斷遊戲狀態是否正在等待玩家觀看擲骰結果中
  setStatusWaitPlayerLookDice: function() {
    setStatusField({
      executeAction: 3,
      executeLimitTime: null,
      executeLeftTime: null
    });
  },
  //將遊戲狀態改為等待玩家棋子移動中
  setStatusPlayerMoving: function() {
    setStatusField({
      executeAction: 4,
      executeLimitTime: null,
      executeLeftTime: null
    });
    return this;
  },
  //將遊戲狀態改為等待登入玩家決策是否購地中
  setStatusWaitUserBuy: function() {
    setStatusField({
      executeAction: 5,
      executeLimitTime: Date.now() + CONFIG.waitingUserTime,
      executeLeftTime: (CONFIG.waitingUserTime / 1000),
    });
    return this;
  },
  //將遊戲狀態改為等待登入玩家決策是否購地中
  setStatusWaitUserBuild: function() {
    setStatusField({
      executeAction: 6,
      executeLimitTime: Date.now() + CONFIG.waitingUserTime,
      executeLeftTime: (CONFIG.waitingUserTime / 1000),
    });
    return this;
  }
};