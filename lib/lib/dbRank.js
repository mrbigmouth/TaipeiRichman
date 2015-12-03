//排行榜紀錄資料庫物件
dbRank = {
  _collection: new Mongo.Collection('Rank', {
    transform: function(data) {
      return new Rank(data);
    }
  }),
  getAllOrderByVictoryAndWealth: function() {
    return this._collection.find({}, {
      sort: {
        victory: -1,
        wealth: -1
      }
    });
  },
  getLimitOrderByVictoryAndWealth: function(skip, limit) {
    return this._collection.find({}, {
      sort: {
        victory: -1,
        wealth: -1
      },
      skip: skip,
      limit: limit
    });
  },
  addGameRecord: function(winner) {
    var winnerRank;
    //若遊戲有勝利者且勝利者是玩家
    var winnerUserId = winner ? winner.getUserId() : null;
    if (winnerUserId) {
      winnerRank = this._collection.findOne(winnerUserId);
      //若排行榜紀錄中已有該玩家的勝利紀錄，則只更新資料
      if (winnerRank) {
        this._collection.update(winnerUserId, {
          $set : {
            victory: winnerRank.getVictory() + 1,
            wealth: winnerRank.getTotalWealth() + winner.money
          }
        });
      }
      //否則在排行榜中插入新資料
      else {
        this._collection.insert({
          _id: winnerUserId,
          victory: 1,
          wealth: winner.money
        });
      }
    }
  }
};