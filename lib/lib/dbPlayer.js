//玩家資料庫物件
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
      collection.insert(player);
    });
    return this;
  },
  //取得所有當前玩家資料
  getAll: function() {
    return this._collection.find();
  },
  //取得當前登入的所有玩家
  getAllUser: function() {
    return this._collection.find({userId: {$ne: null}});
  },
  //取得所有當前玩家資料，依sort排序
  getAllOrderBySort: function() {
    return this._collection.find({}, {sort: {sort: 1}});
  },
  //在遊戲進行中的時候，取得仍然存活的玩家陣列
  fetchAllAlive: function() {
    return this._collection.find({money: {$gte: 0}}).fetch();
  },
  //依照userId取得玩家物件
  getByUserId: function(userId) {
    return this._collection.findOne({userId: Meteor.userId()});
  },
  //取得指定排序的玩家
  getBySort: function(playerSort) {
    return this._collection.findOne({sort: playerSort});
  },
  //取得指定位置的玩家
  getAllByPosition: function(position) {
    return this._collection.find({position: position});
  },
  //判斷加入遊戲的人類玩家數量
  countUser: function() {
    return this._collection.find({userId: {$ne: null}}).count();
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
    this._collection.update(computerPlayer._id, {$set: {userId: userId}});
    return this;
  },
  //移除全部的使用者玩家
  deleteAllUserPlayer: function() {
    this._collection.update({}, {$set: {userId: null}}, {multi: true});
    return this;
  },
  //移除一位使用者玩家
  deleteUserPlayer: function(userId) {
    this._collection.update({userId: userId}, {$set: {userId: null}});
    return this;
  },
  //更新玩家資料
  updatePlayer: function(playerId, updateData) {
    this._collection.update(playerId, {$set: updateData});
    return this;
  }
};