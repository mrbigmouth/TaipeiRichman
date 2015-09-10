//地標資料庫物件
dbLandMark = {
  _collection: new Mongo.Collection('LandMark', {
    transform: function(data) {
      return new LandMark(data);
    }
  }),
  //初始化地標資料
  initialize: function() {
    var collection = this._collection;
    collection.remove({});
    _.each(CONFIG.landMarkList, function(landMark, sort) {
      landMark.sort = sort + 1;
      landMark.owner = null;
      landMark.house = 0;
      collection.insert(landMark);
    });
    return this;
  },
  //取得所有當前地標資料
  getAll: function() {
    return this._collection.find({});
  },
  //取得所有當前地標資料，依sort排序
  getAllOrderBySort: function() {
    return this._collection.find({}, {sort: {sort: 1}});
  },
  //依照玩家排序取得所有地標資料
  getAllByOwner: function(ownerSort) {
    return this._collection.find({owner: ownerSort});
  },
  //取得指定排序的地標
  getBySort: function(sort) {
    return this._collection.findOne({sort: sort});
  },
  getAllGovernment: function() {
    return this._collection.find({type: 1});
  },
  //取得所有學校地標
  getAllSchool: function() {
    return this._collection.find({type: 2});
  },
  //取得第一間醫院地標
  getHospital: function() {
    return this._collection.findOne({type: 3});
  },
  //更新地標資料
  updateLandMark: function(landMarkId, updateData) {
    this._collection.update(landMarkId, {$set: updateData});
    return this;
  }
};