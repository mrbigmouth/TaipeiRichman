//訊息資料庫物件
dbMessage = {
  _collection: new Mongo.Collection('Message', {
    transform: function(data) {
      return new Message(data);
    }
  }),
  //初始化地標資料
  initialize: function() {
    this._collection.remove({});
    return this;
  },
  //取得所有當前地標資料
  getAll: function() {
    return this._collection.find({});
  },
  //取得所有當前地標資料，依時間排序
  getAllOrderByTime: function() {
    return this._collection.find({}, {sort: {time: 1}});
  },
  //取得所有重要訊息，依時間排序
  getAllImportantOrderByTime: function() {
    return this._collection.find(
      {
        $or: [
          {type: 0},
          {type: 5},
          {type: 6},
          {type: 7}
        ]
      },
      {
        sort: {time: 1}
      }
    );
  },
  //取得最後一則擲骰結果
  getLastDiceResult: function() {
    var noChatMessage = this._collection.find(
      {
        type : 1
      }, 
      {
        sort: {time: -1}
      }
    );
    var result = noChatMessage.fetch()[0];
    return result ? result.content : 0;
  },
  //增加一條系統訊息
  addSystemMessage: function(message) {
    this._collection.insert({
      type: 0,
      userId: null,
      playerSort: null,
      landMarkSort: null,
      ownerSort: null,
      time: new Date(),
      content: message
    });
    return this;
  },
  //增加一條擲骰訊息
  addDiceMessage: function(diceResult) {
    var player = APP.gameStatus.getCurrentPlayer();
    this._collection.insert({
      type: 1,
      userId: player.userId,
      playerSort: player.sort,
      landMarkSort: null,
      ownerSort: null,
      time: new Date(),
      content: diceResult
    });
    return this;
  },
  //增加一條購地訊息
  addBuyMessage: function(landMark, buyResult) {
    var player = APP.gameStatus.getCurrentPlayer();
    this._collection.insert({
      type: 2,
      userId: player.userId,
      playerSort: player.sort,
      landMarkSort: landMark.sort,
      ownerSort: null,
      time: new Date(),
      content: buyResult
    });
    return this;
  },
  //增加一條建房訊息
  addBuildMessage: function(landMark, buildResult) {
    var player = APP.gameStatus.getCurrentPlayer();
    this._collection.insert({
      type: 3,
      userId: player.userId,
      playerSort: player.sort,
      landMarkSort: landMark.sort,
      ownerSort: null,
      time: new Date(),
      content: buildResult
    });
    return this;
  },
  //增加一條支付訊息
  addPayMessage: function(landMark, toll) {
    var player = APP.gameStatus.getCurrentPlayer();
    this._collection.insert({
      type: 4,
      userId: player.userId,
      playerSort: player.sort,
      landMarkSort: landMark.sort,
      ownerSort: landMark.getOwner().sort,
      time: new Date(),
      content: toll
    });
    return this;
  },
  //增加一條破產訊息
  addBankruptcyMessage: function(player) {
    this._collection.insert({
      type: 5,
      userId: player.userId,
      playerSort: player.sort,
      landMarkSort: null,
      ownerSort: null,
      time: new Date(),
      content: ''
    });
    return this;
  },
  //增加一條聊天訊息
  addChatMessage: function(userId, message) {
    this._collection.insert({
      type: 6,
      userId: userId,
      playerSort: null,
      landMarkSort: null,
      ownerSort: null,
      time: new Date(),
      content: message
    });
    return this;
  },
  //增加一條車禍訊息
  addCarAccidentMessage: function(player, landMark) {
    this._collection.insert({
      type: 7,
      userId: player.userId,
      playerSort: player.sort,
      landMarkSort: landMark.sort,
      time: new Date(),
      content: ''
    });
    return this;
  },
  //增加一條住院訊息
  addHospitalMessage: function(player) {
    this._collection.insert({
      type: 8,
      userId: player.userId,
      playerSort: player.sort,
      landMarkSort: null,
      time: new Date(),
      content: player.inHospitalRound
    });
    return this;
  }
};