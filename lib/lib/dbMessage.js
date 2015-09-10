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
  //addChatMessage
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
  }
};