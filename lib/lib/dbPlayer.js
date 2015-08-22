dbPlayer = {
  _collection: new Mongo.Collection('Player', {
    transform: function(data) {
      return new Player(data);
    }
  }),
  //初始化玩家資料
  initialize: function() {
    var collection = this._collection;
    collection.remove({});
    _.each(_.range(CONFIG.playerNumbers), function(sort) {
      var player = _.clone(CONFIG.defaultPlayer);
      player.sort = sort + 1;
      player.userId = null;
      collection.insert(player);
    });
  },
  //取得所有當前玩家資料
  getPlayers: function() {
    return this._collection.find();
  },
  //取得所有當前玩家資料，依sort排序
  getPlayersOrderBySort: function() {
    return this._collection.find({}, {sort: {sort: 1}});
  },
  //依照userId取得玩家物件
  getPlayerByUserId: function(userId) {
    return this._collection.findOne({userId: Meteor.userId()});
  },
  //判斷當前是否還有空位可加入
  isPlayerFull: function() {
    //若找不到任何電腦玩家，就代表遊戲已額滿
    return !(this._collection.findOne({userId: null}, {sort: {sort: 1}}));
  },
  //新增一位使用者玩家
  addUserPlayer: function(userId) {
    //取得第一位電腦玩家
    var computerPlayer = this._collection.findOne({userId: null}, {sort: {sort:1}});
    this._collection.update(computerPlayer._id, {$set : {userId: userId}});
    return this;
  },
  //移除一位使用者玩家
  deleteUserPlayer: function(userId) {
    this._collection.update({userId: userId}, {$set : {userId: null}});
  }
};